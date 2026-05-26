const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");
const MP_WEBHOOK_SECRET = Deno.env.get("MP_WEBHOOK_SECRET");

async function verifyMPSignature(req: Request, resourceId: string): Promise<boolean> {
  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");
  if (!xSignature || !MP_WEBHOOK_SECRET) return false;

  const parts = Object.fromEntries(xSignature.split(",").map(p => p.split("=")));
  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  const manifest = `id:${resourceId};request-id:${xRequestId};ts:${ts};`;
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(MP_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(manifest));
  const computed = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
  return computed === v1;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://caloru.cl",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-signature, x-request-id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabaseHeaders = {
  "apikey": SUPABASE_SERVICE_ROLE_KEY!,
  "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("MP Webhook received: type=" + (body.type || body.topic || "unknown"));

    // MP envía distintos tipos de eventos — solo nos interesan preapproval
    const topic = body.type || body.topic;
    const resourceId = body.data?.id || body.id;

    if (!topic || !resourceId) {
      return new Response(JSON.stringify({ ok: true, msg: "ignored - no topic/id" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verificar firma HMAC-SHA256 de Mercado Pago
    const signatureValid = await verifyMPSignature(req, String(resourceId));
    if (!signatureValid) {
      console.error("MP Webhook: firma inválida rechazada");
      return new Response(JSON.stringify({ error: "Firma inválida" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Solo procesamos suscripciones (preapproval)
    if (topic !== "preapproval") {
      return new Response(JSON.stringify({ ok: true, msg: `ignored topic: ${topic}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Consultamos el detalle de la suscripción en MP
    const mpRes = await fetch(`https://api.mercadopago.com/preapproval/${resourceId}`, {
      headers: { "Authorization": `Bearer ${MP_ACCESS_TOKEN}` },
    });

    if (!mpRes.ok) {
      console.error("Error fetching preapproval from MP:", await mpRes.text());
      return new Response(JSON.stringify({ error: "No se pudo consultar MP" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subscription = await mpRes.json();
    console.log("MP subscription status:", subscription.status, "plan:", subscription.reason?.split(" ").slice(-1)[0]);

    const status = subscription.status;           // authorized | paused | cancelled
    const payerEmail = subscription.payer_email;
    const subscriptionId = subscription.id;
    const reason = subscription.reason || "";     // "Caloru Pro Mensual" o "Caloru Pro Anual"

    if (!payerEmail) {
      return new Response(JSON.stringify({ error: "No payer_email en subscription" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determinar plan y fecha de expiración
    const isNutricionista = reason.toLowerCase().includes("nutricionista");
    const isMonthly = reason.toLowerCase().includes("mensual");
    const plan = isNutricionista ? "nutricionista" : isMonthly ? "monthly" : "yearly";

    const now = new Date();
    const expiresAt = new Date(now);
    if (plan === "yearly") {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    // Buscar usuario en Supabase por email
    const userRes = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(payerEmail)}`,
      {
        headers: {
          "apikey": SUPABASE_SERVICE_ROLE_KEY!,
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );

    const userData = await userRes.json();
    const userId = userData?.users?.[0]?.id;

    if (!userId) {
      console.error("Usuario no encontrado para email:", payerEmail);
      return new Response(JSON.stringify({ error: "Usuario no encontrado", email: payerEmail }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determinar qué actualizar según el estado de la suscripción
    let updateData: Record<string, string | null> = {};

    if (status === "authorized") {
      // Pago aprobado → activar Pro (nutricionista tiene su propio status)
      updateData = {
        subscription_status: plan === "nutricionista" ? "nutricionista" : "pro",
        subscription_plan: plan,
        subscription_id: subscriptionId,
        subscription_expires_at: expiresAt.toISOString(),
      };
    } else if (status === "cancelled" || status === "paused") {
      // Cancelado o pausado → volver a free
      updateData = {
        subscription_status: "free",
        subscription_plan: null,
        subscription_id: null,
        subscription_expires_at: null,
      };
    } else {
      // Estado desconocido — ignorar
      return new Response(JSON.stringify({ ok: true, msg: `ignored status: ${status}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Actualizar perfil en Supabase
    const updateRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,
      {
        method: "PATCH",
        headers: supabaseHeaders,
        body: JSON.stringify(updateData),
      }
    );

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      console.error("Error updating profile:", errText);
      return new Response(JSON.stringify({ error: "Error actualizando perfil", detail: errText }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`✅ Usuario ${payerEmail} actualizado a ${updateData.subscription_status}`);

    return new Response(
      JSON.stringify({ ok: true, email: payerEmail, status: updateData.subscription_status }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Error interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
