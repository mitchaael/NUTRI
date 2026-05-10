const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
 
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
 
  try {
    // Get the user's JWT from the Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "No autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
 
    const token = authHeader.replace("Bearer ", "");
 
    // Verify the user's token to get their ID
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { "Authorization": `Bearer ${token}`, "apikey": SUPABASE_SERVICE_ROLE_KEY },
    });
 
    if (!userRes.ok) {
      return new Response(
        JSON.stringify({ error: "Token invalido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
 
    const user = await userRes.json();
    const userId = user.id;
 
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "No se pudo obtener el ID del usuario" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
 
    // Delete user data from all tables using service role key
    const headers = {
      "apikey": SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    };
 
    // Delete in order: logs first, then settings, then profile
    const deletes = await Promise.allSettled([
      fetch(`${SUPABASE_URL}/rest/v1/daily_logs?user_id=eq.${userId}`, { method: "DELETE", headers }),
      fetch(`${SUPABASE_URL}/rest/v1/weight_history?user_id=eq.${userId}`, { method: "DELETE", headers }),
      fetch(`${SUPABASE_URL}/rest/v1/user_settings?id=eq.${userId}`, { method: "DELETE", headers }),
      fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, { method: "DELETE", headers }),
    ]);
 
    // Check for errors
    const errors = deletes.filter(r => r.status === "rejected");
    if (errors.length > 0) {
      console.error("Some deletes failed:", errors);
    }
 
    // Delete the auth user using Admin API
    const deleteUserRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
 
    if (!deleteUserRes.ok) {
      const errText = await deleteUserRes.text();
      console.error("Failed to delete auth user:", errText);
      return new Response(
        JSON.stringify({ error: "Datos eliminados pero no se pudo borrar la cuenta de auth", detail: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
 
    return new Response(
      JSON.stringify({ success: true, message: "Cuenta eliminada completamente" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
 
  } catch (err) {
    console.error("Delete account error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Error interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});