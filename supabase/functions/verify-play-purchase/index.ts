// verify-play-purchase — valida una compra de Google Play Billing
// y activa el estado Pro en el perfil del usuario.
//
// IMPORTANTE: Para validar purchaseToken de Google Play se requiere
// la Google Play Developer API con una service account.
// Ver: https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.subscriptions/get
//
// Esta Edge Function:
// 1. Verifica el JWT del usuario (obligatorio)
// 2. Llama a Google Play Developer API para confirmar el purchaseToken
// 3. Solo activa Pro si Google confirma la compra como válida

const SUPABASE_URL             = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SUPABASE_ANON_KEY        = Deno.env.get("SUPABASE_ANON_KEY");
const GOOGLE_PLAY_PACKAGE_NAME = Deno.env.get("GOOGLE_PLAY_PACKAGE_NAME") ?? "cl.caloru.app";
// GOOGLE_SERVICE_ACCOUNT_KEY: JSON completo de la service account de Google Cloud
const GOOGLE_SERVICE_ACCOUNT_KEY = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://caloru.cl",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SKU_PLAN_MAP: Record<string, { plan: string; months: number }> = {
  "caloru_pro_monthly": { plan: "monthly", months: 1 },
  "caloru_pro_yearly":  { plan: "yearly",  months: 12 },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // 1. Verificar JWT del usuario
  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "No autorizado" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { "apikey": SUPABASE_ANON_KEY!, "Authorization": authHeader },
  });
  if (!userRes.ok) {
    return new Response(
      JSON.stringify({ error: "Token inválido" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  const user = await userRes.json();
  const userId = user?.id;
  if (!userId) {
    return new Response(
      JSON.stringify({ error: "No se pudo obtener el ID del usuario" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // 2. Parsear body
  let purchaseToken: string, sku: string, plan: string;
  try {
    const body = await req.json();
    purchaseToken = body.purchaseToken;
    sku           = body.sku;
    plan          = body.plan;
  } catch {
    return new Response(
      JSON.stringify({ error: "Body inválido" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // 3. Validar SKU conocido
  const planConfig = SKU_PLAN_MAP[sku];
  if (!planConfig) {
    return new Response(
      JSON.stringify({ error: "SKU desconocido" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // 4. Verificar purchaseToken con Google Play Developer API
  // NOTA: Requiere GOOGLE_SERVICE_ACCOUNT_KEY configurada en Supabase Secrets
  if (!GOOGLE_SERVICE_ACCOUNT_KEY) {
    console.error("GOOGLE_SERVICE_ACCOUNT_KEY no configurada — no se puede verificar compra de Play");
    return new Response(
      JSON.stringify({ error: "Configuración de servidor incompleta" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  let googleVerified = false;
  try {
    // Obtener access token de Google via JWT de service account
    const serviceAccount = JSON.parse(GOOGLE_SERVICE_ACCOUNT_KEY);
    const now = Math.floor(Date.now() / 1000);
    const jwtHeader = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const jwtPayload = btoa(JSON.stringify({
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/androidpublisher",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }));

    // Importar clave privada RSA para firmar el JWT
    const privateKeyPem = serviceAccount.private_key;
    const pemBody = privateKeyPem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, "");
    const der = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8", der.buffer,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]
    );
    const sigInput = `${jwtHeader}.${jwtPayload}`;
    const sig = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5", cryptoKey,
      new TextEncoder().encode(sigInput)
    );
    const jwtSig = btoa(String.fromCharCode(...new Uint8Array(sig)));
    const jwt = `${sigInput}.${jwtSig}`;

    // Intercambiar JWT por access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Verificar suscripción en Google Play
    const playRes = await fetch(
      `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${GOOGLE_PLAY_PACKAGE_NAME}/purchases/subscriptions/${sku}/tokens/${purchaseToken}`,
      { headers: { "Authorization": `Bearer ${accessToken}` } }
    );

    if (playRes.ok) {
      const playData = await playRes.json();
      // paymentState 1 = recibido, 2 = gratis trial
      // cancelReason ausente = suscripción activa
      if (playData.paymentState >= 1 && !playData.cancelReason) {
        googleVerified = true;
      }
    } else {
      const errText = await playRes.text();
      console.error("Google Play verification failed:", playRes.status, errText);
    }
  } catch (err) {
    console.error("Error verificando con Google Play:", (err as Error).message);
    return new Response(
      JSON.stringify({ error: "No se pudo verificar la compra con Google" }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!googleVerified) {
    return new Response(
      JSON.stringify({ error: "Compra no válida según Google Play" }),
      { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // 5. Activar Pro en Supabase
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + planConfig.months);

  const updateRes = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,
    {
      method: "PATCH",
      headers: {
        "apikey": SUPABASE_SERVICE_ROLE_KEY!,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscription_status: "pro",
        subscription_plan: planConfig.plan,
        subscription_id: purchaseToken,
        subscription_expires_at: expiresAt.toISOString(),
      }),
    }
  );

  if (!updateRes.ok) {
    const errText = await updateRes.text();
    console.error("Error actualizando perfil tras compra Play:", errText);
    return new Response(
      JSON.stringify({ error: "Compra verificada pero error activando Pro" }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, plan: planConfig.plan, expires_at: expiresAt.toISOString() }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
