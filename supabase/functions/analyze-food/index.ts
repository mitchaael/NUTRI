const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const SUPABASE_URL      = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const MODEL = "claude-sonnet-4-6";

// Rate limiting en memoria — por user_id autenticado
// Límites: 20 llamadas/hora para usuarios free, 60 para Pro
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hora
const RATE_LIMIT_FREE = 20;
const RATE_LIMIT_PRO  = 60;

function checkRateLimit(userId: string, isPro: boolean): boolean {
  const now = Date.now();
  const limit = isPro ? RATE_LIMIT_PRO : RATE_LIMIT_FREE;
  const entry = rateLimitMap.get(userId);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(userId, { count: 1, windowStart: now });
    return true; // dentro del límite
  }
  if (entry.count >= limit) return false; // excedió el límite
  entry.count++;
  return true;
}

// CORS — permisivo en origen porque la seguridad real la da el JWT
// El TWA Android puede enviar orígenes variables; la autenticación es por Bearer token
function getCorsHeaders(origin: string | null): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin || "https://caloru.cl",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY no configurada en secrets" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Verificar JWT del usuario — obligatorio para todos los modos
  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "No autorizado — se requiere sesión activa" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Validar el token contra Supabase Auth
  let userId: string | null = null;
  let userIsPro = false;
  try {
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        "apikey": SUPABASE_ANON_KEY!,
        "Authorization": authHeader,
      },
    });
    if (!userRes.ok) {
      return new Response(
        JSON.stringify({ error: "Token inválido o sesión expirada" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const userData = await userRes.json();
    userId = userData?.id ?? null;
    if (!userId) throw new Error("No user id in token");
  } catch {
    return new Response(
      JSON.stringify({ error: "Error verificando autenticación" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Comprobar rate limit
  if (!checkRateLimit(userId, userIsPro)) {
    return new Response(
      JSON.stringify({ error: "Demasiadas solicitudes. Intenta más tarde." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "3600" } }
    );
  }

  try {
    const body = await req.json();
    const { mode, image, messages, system, prompt, nombre, max_tokens } = body;

    // Sanitizar nombre de usuario para evitar prompt injection
    const safeName = nombre ? String(nombre).replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').slice(0, 50) : null;

    let anthropicBody;

    if (mode === "photo") {
      if (!image) {
        return new Response(
          JSON.stringify({ error: "Falta el campo 'image' (base64)" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validar tamaño máximo de imagen (5MB en base64 ≈ 3.75MB real)
      if (image.length > 5 * 1024 * 1024) {
        return new Response(
          JSON.stringify({ error: "Imagen demasiado grande. Máximo 5MB." }),
          { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      let mediaType = "image/jpeg";
      if (image.startsWith("data:")) {
        const match = image.match(/^data:(image\/\w+);base64,/);
        if (match) mediaType = match[1];
      }

      const base64Clean = image.replace(/^data:image\/\w+;base64,/, "");

      anthropicBody = {
        model: MODEL,
        max_tokens: 1500,
        system: `Eres un nutricionista experto en gastronomía chilena y latinoamericana. El usuario te envía una foto de su comida desde Chile.

Tu tarea:
1. Identificar TODOS los alimentos y preparaciones visibles.
2. Estimar la porción realista en gramos (considera tamaños de plato chileno típico).
3. Calcular calorías (kcal), proteínas, carbohidratos, grasas y fibra por alimento.
4. Sumar el total del plato completo.

Alimentos chilenos comunes: marraqueta (200 kcal c/u), hallulla, sopaipilla, cazuela de vacuno, cazuela de pollo, pastel de choclo, humitas, porotos con rienda, charquicán, arroz con pollo, chorrillana, completo italiano, empanada de pino (350 kcal), ensalada chilena (tomate+cebolla), pebre, puré, legumbres (porotos, lentejas, garbanzos), ave asada, lomo a lo pobre, merluza al vapor o frita.

REGLAS CRÍTICAS:
- Responde ÚNICAMENTE con JSON válido, sin texto adicional, sin backticks, sin markdown.
- Si la imagen no muestra comida claramente: {"error": "No pude identificar alimentos en esta imagen"}
- Sé conservador con las estimaciones — es mejor subestimar que sobreestimar.

Formato de respuesta:
{
  "plato": "Descripcion breve del plato",
  "confianza": "alta|media|baja",
  "alimentos": [
    {
      "nombre": "Nombre del alimento",
      "porcion_g": 150,
      "cal": 250,
      "prot": 20,
      "carbs": 15,
      "grasas": 10,
      "fibra": 2,
      "emoji": "🍗"
    }
  ],
  "total": {
    "cal": 500,
    "prot": 35,
    "carbs": 45,
    "grasas": 18,
    "fibra": 5
  },
  "consejo": "Un tip breve y motivacional sobre este plato"
}`,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: base64Clean,
                },
              },
              {
                type: "text",
                text: safeName
                  ? `Soy ${safeName}. Analiza esta foto de mi comida y estima las calorias y macros.`
                  : "Analiza esta foto de comida y estima las calorias y macros.",
              },
            ],
          },
        ],
      };

    } else if (mode === "chat") {
      if (!messages || messages.length === 0) {
        return new Response(
          JSON.stringify({ error: "Falta el campo 'messages'" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Limitar historial de mensajes para evitar abusos de contexto largo
      const MAX_MESSAGES = 20;
      const sanitizedMessages = messages
        .slice(-MAX_MESSAGES)
        .map((m: { role: string; content: string }) => ({
          role: m.role === "user" || m.role === "assistant" ? m.role : "user",
          content: String(m.content).slice(0, 4000), // limitar por mensaje
        }));

      // El system prompt viene del frontend y no es contenido de usuario,
      // pero lo limitamos por seguridad
      const safeSystem = system
        ? String(system).slice(0, 8000)
        : "Eres un asistente nutricional amigable.";

      anthropicBody = {
        model: MODEL,
        max_tokens: Math.min(max_tokens || 1000, 2000), // reducido de 4000 a 2000
        system: safeSystem,
        messages: sanitizedMessages,
      };

    } else if (mode === "insight") {
      // Solo se acepta un prompt corto predefinido — no contenido de usuario
      const ALLOWED_INSIGHT_PROMPTS = [
        "Dame un tip nutricional breve.",
        "Consejo rápido de nutrición para hoy.",
      ];
      const safePrompt = ALLOWED_INSIGHT_PROMPTS.includes(prompt)
        ? prompt
        : ALLOWED_INSIGHT_PROMPTS[0];

      anthropicBody = {
        model: MODEL,
        max_tokens: 150,
        messages: [
          {
            role: "user",
            content: safePrompt,
          },
        ],
      };

    } else {
      return new Response(
        JSON.stringify({ error: "mode debe ser 'photo', 'chat' o 'insight'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(anthropicBody),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error("Anthropic API error:", anthropicRes.status);
      return new Response(
        JSON.stringify({ error: "API error: " + anthropicRes.status }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await anthropicRes.json();
    const text = data.content && data.content[0] ? data.content[0].text : "";

    if (mode === "photo") {
      try {
        const cleaned = text.replace(/```json\n?|```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        return new Response(
          JSON.stringify({ result: parsed, raw: text }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (e) {
        return new Response(
          JSON.stringify({ result: null, raw: text, error: "No se pudo parsear la respuesta" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ text: text }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Edge function error:", (err as Error).message);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
