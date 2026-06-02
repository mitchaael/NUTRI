const SUPABASE_URL             = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SUPABASE_ANON_KEY         = Deno.env.get("SUPABASE_ANON_KEY");

const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") || "https://caloru.cl";
const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "No autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Verificar JWT usando ANON_KEY (no service_role — principio de mínimo privilegio)
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "apikey": SUPABASE_ANON_KEY!,
      },
    });

    if (!userRes.ok) {
      return new Response(
        JSON.stringify({ error: "No autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = await userRes.json();
    const userId = user?.id;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "No autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Headers con service_role para las operaciones de borrado
    const serviceHeaders = {
      "apikey": SUPABASE_SERVICE_ROLE_KEY!,
      "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    };

    // Borrar en secuencia — si falla uno, detenerse y reportar error
    // (evita dejar datos huérfanos en caso de fallo parcial)
    const tables = [
      { url: `${SUPABASE_URL}/rest/v1/daily_logs?user_id=eq.${userId}`,    name: 'daily_logs' },
      { url: `${SUPABASE_URL}/rest/v1/weight_history?user_id=eq.${userId}`, name: 'weight_history' },
      { url: `${SUPABASE_URL}/rest/v1/nutrition_plans?nutricionista_id=eq.${userId}`, name: 'nutrition_plans' },
      { url: `${SUPABASE_URL}/rest/v1/nutricionista_codes?nutricionista_id=eq.${userId}`, name: 'nutricionista_codes' },
      { url: `${SUPABASE_URL}/rest/v1/user_settings?id=eq.${userId}`,       name: 'user_settings' },
      { url: `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,            name: 'profiles' },
    ];

    for (const { url, name } of tables) {
      const res = await fetch(url, { method: "DELETE", headers: serviceHeaders });
      if (!res.ok) {
        const body = await res.text();
        console.error(`Delete failed for ${name}:`, body);
        // No exponer detalles internos al cliente
        return new Response(
          JSON.stringify({ error: "Error al eliminar la cuenta. Contacta soporte." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Borrar el usuario de auth (requiere Admin API)
    const deleteAuthRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        "apikey": SUPABASE_SERVICE_ROLE_KEY!,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    if (!deleteAuthRes.ok) {
      console.error("Failed to delete auth user:", await deleteAuthRes.text());
      return new Response(
        JSON.stringify({ error: "Datos eliminados pero no se pudo cerrar la sesión. Contacta soporte." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Delete account error:", err);
    // Error genérico — no exponer mensaje interno al cliente
    return new Response(
      JSON.stringify({ error: "Error interno. Intenta de nuevo o contacta soporte." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
