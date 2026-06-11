// Envía una notificación push web a un usuario de Calorú.
// Seguridad: solo permite enviar entre nutricionista y paciente VINCULADOS
// (en cualquier dirección), verificando el JWT del remitente.
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY");
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY");
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:caloruapp@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://caloru.cl",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const sbHeaders = {
  "apikey": SERVICE_KEY!,
  "Authorization": `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!VAPID_PUBLIC || !VAPID_PRIVATE) return json({ error: "VAPID no configurado" }, 500);
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

    // 1. Verificar JWT del remitente
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "No autorizado" }, 401);
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { "apikey": SERVICE_KEY!, "Authorization": authHeader },
    });
    if (!userRes.ok) return json({ error: "Token inválido" }, 401);
    const sender = await userRes.json();
    const senderId = sender?.id;
    if (!senderId) return json({ error: "Token inválido" }, 401);

    const { to_user_id, title, body } = await req.json();
    if (!to_user_id || !title) return json({ error: "Faltan campos" }, 400);
    if (to_user_id === senderId) return json({ error: "Destino inválido" }, 400);

    // 2. Verificar vinculación nutricionista↔paciente (cualquier dirección)
    const linkRes = await fetch(
      `${SUPABASE_URL}/rest/v1/nutrition_plans?select=id&or=(and(nutricionista_id.eq.${senderId},paciente_id.eq.${to_user_id}),and(nutricionista_id.eq.${to_user_id},paciente_id.eq.${senderId}))&limit=1`,
      { headers: sbHeaders },
    );
    const links = linkRes.ok ? await linkRes.json() : [];
    if (!links.length) return json({ error: "No están vinculados" }, 403);

    // 3. Buscar la suscripción push del destinatario
    const subRes = await fetch(
      `${SUPABASE_URL}/rest/v1/push_subscriptions?user_id=eq.${to_user_id}&select=subscription`,
      { headers: sbHeaders },
    );
    const subs = subRes.ok ? await subRes.json() : [];
    if (!subs.length) return json({ ok: true, sent: false, msg: "Sin suscripción push" });

    // 4. Enviar (si la suscripción expiró, limpiarla)
    try {
      await webpush.sendNotification(subs[0].subscription, JSON.stringify({
        title: String(title).slice(0, 80),
        body: String(body || "").slice(0, 160),
        icon: "/icon-192.png",
        tag: "caloru-msg",
        url: "/",
      }));
    } catch (e) {
      const code = (e as { statusCode?: number })?.statusCode;
      if (code === 404 || code === 410) {
        await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?user_id=eq.${to_user_id}`, {
          method: "DELETE", headers: sbHeaders,
        });
        return json({ ok: true, sent: false, msg: "Suscripción expirada (limpiada)" });
      }
      throw e;
    }

    return json({ ok: true, sent: true });
  } catch (e) {
    console.error("send-push error:", e);
    return json({ error: "Error interno" }, 500);
  }
});
