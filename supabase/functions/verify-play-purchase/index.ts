// verify-play-purchase — valida una compra de Google Play Billing
// y activa el estado Pro en el perfil del usuario.
//
// IMPORTANTE: Para validar purchaseToken de Google Play se requiere
// la Google Play Developer API con una service account.
// Ver: https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.subscriptionsv2/get
//
// Esta Edge Function:
// 1. Verifica el JWT del usuario (obligatorio)
// 2. Llama a Google Play Developer API (subscriptionsv2) para confirmar el purchaseToken
// 3. ACUSA RECIBO de la compra (acknowledge) — obligatorio: si no se hace dentro
//    de 72 h, Google reembolsa automáticamente al usuario y revoca la compra
// 4. Solo activa Pro si Google confirma la compra como válida, usando la fecha
//    de expiración real que entrega Google (no una calculada localmente)

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

// Estados de suscripción que dan derecho a Pro (subscriptionsv2)
const ACTIVE_STATES = new Set([
  "SUBSCRIPTION_STATE_ACTIVE",
  "SUBSCRIPTION_STATE_IN_GRACE_PERIOD",
]);

// base64url sin padding — obligatorio para JWT.
// btoa() genera base64 estándar con "+", "/" y "=", que Google rechaza.
const b64url = (bytes: Uint8Array | string): string => {
  const bin = typeof bytes === "string"
    ? bytes
    : Array.from(bytes, (b) => String.fromCharCode(b)).join("");
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

// Obtiene un access token de Google firmando un JWT con la service account
async function getGoogleAccessToken(serviceAccount: Record<string, string>): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const jwtHeader  = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const jwtPayload = b64url(JSON.stringify({
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/androidpublisher",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));

  const pemBody = serviceAccount.private_key
    .replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "");
  const der = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8", der.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"],
  );

  const sigInput = `${jwtHeader}.${jwtPayload}`;
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5", cryptoKey, new TextEncoder().encode(sigInput),
  );
  const jwt = `${sigInput}.${b64url(new Uint8Array(sig))}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!tokenRes.ok) {
    throw new Error(`OAuth token error ${tokenRes.status}: ${await tokenRes.text()}`);
  }
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) throw new Error("Google no devolvió access_token");
  return tokenData.access_token;
}

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
  let expiresAt = new Date();
  try {
    const serviceAccount = JSON.parse(GOOGLE_SERVICE_ACCOUNT_KEY);
    const accessToken = await getGoogleAccessToken(serviceAccount);
    const authz = { "Authorization": `Bearer ${accessToken}` };
    const playBase =
      `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${GOOGLE_PLAY_PACKAGE_NAME}`;

    // Verificar la suscripción con subscriptionsv2 (purchases.subscriptions v1 está obsoleta).
    // subscriptionsv2 se consulta solo por token: el productId lo devuelve Google,
    // así evitamos confiar en el sku que manda el cliente.
    const playRes = await fetch(
      `${playBase}/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`,
      { headers: authz },
    );

    if (!playRes.ok) {
      console.error("Google Play verification failed:", playRes.status, await playRes.text());
      return new Response(
        JSON.stringify({ error: "Compra no válida según Google Play" }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const playData = await playRes.json();
    const lineItem = playData.lineItems?.[0];

    // El producto que Google reporta debe coincidir con el sku solicitado:
    // impide que un token de plan mensual active un plan anual.
    if (lineItem?.productId !== sku) {
      console.error("SKU no coincide:", lineItem?.productId, "!=", sku);
      return new Response(
        JSON.stringify({ error: "La compra no corresponde al plan solicitado" }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!ACTIVE_STATES.has(playData.subscriptionState)) {
      console.error("Suscripción no activa:", playData.subscriptionState);
      return new Response(
        JSON.stringify({ error: "Compra no válida según Google Play" }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Acknowledge: obligatorio dentro de 72 h o Google reembolsa y revoca la compra.
    if (playData.acknowledgementState === "ACKNOWLEDGEMENT_STATE_PENDING") {
      const ackRes = await fetch(
        `${playBase}/purchases/subscriptions/${encodeURIComponent(sku)}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`,
        { method: "POST", headers: { ...authz, "Content-Type": "application/json" }, body: "{}" },
      );
      if (!ackRes.ok) {
        // Sin acknowledge la compra se reembolsa sola: no activamos Pro y
        // dejamos que el cliente reintente.
        console.error("Error al acusar recibo de la compra:", ackRes.status, await ackRes.text());
        return new Response(
          JSON.stringify({ error: "No se pudo confirmar la compra con Google. Intenta de nuevo." }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    // Usar la fecha de expiración real de Google; si falta, caer al cálculo local.
    const expiryTime = lineItem?.expiryTime;
    expiresAt = expiryTime ? new Date(expiryTime) : new Date();
    if (!expiryTime || isNaN(expiresAt.getTime())) {
      expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + planConfig.months);
    }
    googleVerified = true;
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
