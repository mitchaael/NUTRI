const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const SUPABASE_URL      = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const MODEL = "claude-sonnet-4-6";
const BRAVE_API_KEY = Deno.env.get("BRAVE_API_KEY");

// ── Palabras que indican que el usuario menciona o registra comida ──
const FOOD_KEYWORDS = [
  'comí','comi','comiendo','comiste','almorcé','almorce','desayuné','desayune',
  'cené','cene','meriendé','merendie','tomé','tome','bebí','bebi','me tomé',
  'me comí','me comi','me tomé','me tome','me bebí','me bebi',
  'registra','anota','agrega','añade','agregar','anotar',
  'acabo de comer','acabo de tomar','acabo de beber',
  'calorías','calorias','macros','proteínas','proteinas','carbohidratos',
  'tiene','cuánto tiene','cuanto tiene','cuantas calorias','cuántas calorías',
  'información de','informacion de','datos de','nutricional','nutrición de',
  'qué tiene','que tiene','composición','composicion',
];

// ── Limpia la query dejando solo el nombre del alimento ──
function cleanFoodQuery(raw: string): string {
  return raw
    .replace(/[^\wáéíóúÁÉÍÓÚñÑüÜ\s]/g, ' ')
    .replace(/\b(me|comí|comi|tomé|tome|desayuné|almorcé|cené|registra|anota|agrega|hoy|ayer|recién|recien|acabo de comer|un|una|unos|unas|el|la|los|las|de|del|con|para|que|qué|cuánto|cuanto|cuantas|cuántas|tiene|tienen|información|informacion|datos|nutricional|calorías|calorias|proteínas|proteinas|macros)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

// ── Helper: formatea un producto OFF en una línea ──
function formatOFFProduct(p: any): string | null {
  const n = p.nutriments;
  if (!n) return null;
  const kcal = Math.round(n['energy-kcal_100g'] ?? n['energy-kcal'] ?? 0);
  if (!kcal) return null;
  const name  = (p.product_name_es || p.product_name || '').slice(0, 60);
  const brand = p.brands ? ` — ${String(p.brands).split(',')[0].trim()}` : '';
  const prot  = Math.round(n['proteins_100g'] ?? 0);
  const carbs = Math.round(n['carbohydrates_100g'] ?? 0);
  const fat   = Math.round(n['fat_100g'] ?? 0);
  const fiber = Math.round(n['fiber_100g'] ?? 0);
  const sugar = Math.round(n['sugars_100g'] ?? 0);
  const sodium= Math.round((n['sodium_100g'] ?? 0) * 1000);
  const serv  = p.serving_size ? ` (porción: ${p.serving_size})` : '';
  return `• ${name}${brand}${serv}: ${kcal} kcal/100g | P:${prot}g C:${carbs}g G:${fat}g Fibra:${fiber}g Azúcar:${sugar}g Sodio:${sodium}mg`;
}

// ── 1. Busca en OpenFoodFacts Chile primero, luego mundial ──
async function searchOpenFoodFacts(query: string): Promise<string> {
  const encoded = encodeURIComponent(query);
  const fields  = 'product_name,product_name_es,brands,serving_size,nutriments';

  // Intento 1: catálogo chileno
  try {
    const res = await fetch(
      `https://cl.openfoodfacts.org/cgi/search.pl?search_terms=${encoded}&search_simple=1&action=process&json=1&page_size=6&fields=${fields}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (res.ok) {
      const data = await res.json() as { products?: any[] };
      const hits = (data.products ?? []).map(formatOFFProduct).filter(Boolean);
      if (hits.length) return `DATOS REALES — OpenFoodFacts Chile para "${query}":\n${hits.slice(0,4).join('\n')}`;
    }
  } catch { /* continuar */ }

  // Intento 2: catálogo mundial
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encoded}&search_simple=1&action=process&json=1&page_size=8&fields=${fields}`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (res.ok) {
      const data = await res.json() as { products?: any[] };
      const hits = (data.products ?? []).map(formatOFFProduct).filter(Boolean);
      if (hits.length) return `DATOS REALES — OpenFoodFacts para "${query}":\n${hits.slice(0,4).join('\n')}`;
    }
  } catch { /* continuar */ }

  return '';
}

// ── 2. Búsqueda Brave Search — web abierta con foco nutricional Chile ──
async function searchBraveChile(query: string): Promise<string> {
  if (!BRAVE_API_KEY) return '';
  try {
    // Búsqueda abierta: sin restricción de sitio, prioriza resultados en español/Chile
    // Dos intentos: primero con "Chile" explícito, luego sin para marcas internacionales
    const queries = [
      `${query} calorías información nutricional por 100g Chile`,
      `${query} nutrition facts calories per 100g`,
    ];

    for (const searchQuery of queries) {
      const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(searchQuery)}&country=cl&lang=es&count=6&search_lang=es`;
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'X-Subscription-Token': BRAVE_API_KEY,
        },
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) continue;

      const data = await res.json() as { web?: { results?: any[] } };
      const results = data.web?.results ?? [];
      if (!results.length) continue;

      const snippets = results
        .slice(0, 5)
        .map((r: any) => {
          const title = (r.title ?? '').slice(0, 80);
          const desc  = (r.description ?? '').slice(0, 200);
          const url   = (r.url ?? '').replace(/https?:\/\//, '').split('/')[0];
          return `[${url}] ${title}: ${desc}`;
        })
        .filter(s => s.length > 20)
        .join('\n');

      if (snippets) {
        return `BÚSQUEDA WEB para "${query}":\n${snippets}\n\nExtrae los datos nutricionales (kcal, proteínas, carbs, grasas, fibra, azúcar, sodio) más precisos de estos resultados. Indica la fuente.`;
      }
    }
    return '';
  } catch {
    return '';
  }
}

// ── Orquesta toda la búsqueda: OFF Chile → OFF mundial → Brave Chile ──
async function searchFoodOnline(query: string): Promise<string> {
  const clean = cleanFoodQuery(query);
  if (clean.length < 2) return '';

  // 1. OpenFoodFacts (Chile → mundial)
  const offResult = await searchOpenFoodFacts(clean);
  if (offResult) return offResult;

  // 2. Brave Search Chile (si está configurado)
  const braveResult = await searchBraveChile(clean);
  if (braveResult) return braveResult;

  return ''; // sin resultados — Claude estima
}

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
        system: [
          {
            type: "text",
            text: `Eres un nutricionista y chef experto en gastronomía chilena y latinoamericana. El usuario te envía una foto de su comida desde Chile.

TAREA:
1. Identifica TODOS los alimentos, preparaciones, salsas y bebidas visibles.
2. Estima la porción en gramos según el tamaño del plato o envase visible.
3. Calcula kcal, proteínas, carbohidratos, grasas y fibra por ítem.
4. Suma el total del plato completo.

TABLA DE PORCIONES CHILENAS DE REFERENCIA (úsala como base):
• Marraqueta (1 unidad): 80g | 210kcal | P:7 C:40 G:2 F:2
• Hallulla (1 unidad): 70g | 185kcal | P:6 C:36 G:2 F:1
• Sopaipilla (1 unidad): 60g | 170kcal | P:3 C:24 G:7 F:1
• Pan molde (1 rebanada): 30g | 75kcal | P:2 C:14 G:1 F:1
• Empanada de pino horneada: 150g | 350kcal | P:14 C:35 G:16 F:2
• Empanada de pino frita: 180g | 450kcal | P:14 C:38 G:25 F:2
• Cazuela de vacuno/pollo (plato): 500ml | 300kcal | P:28 C:22 G:8 F:3
• Pastel de choclo (porción): 350g | 480kcal | P:18 C:55 G:18 F:5
• Completo italiano: 200g | 480kcal | P:18 C:42 G:26 F:3
• Completo simple (sin palta): 170g | 370kcal | P:14 C:40 G:18 F:2
• Arroz cocido (plato): 180g | 230kcal | P:4 C:50 G:1 F:1
• Arroz con pollo (plato): 400g | 520kcal | P:32 C:55 G:14 F:2
• Chorrillana (plato): 500g | 900kcal | P:30 C:60 G:55 F:4
• Porotos guisados (plato): 350g | 380kcal | P:22 C:55 G:6 F:15
• Charquicán (plato): 380g | 420kcal | P:25 C:45 G:14 F:8
• Puré de papa (porción): 200g | 280kcal | P:5 C:38 G:12 F:3
• Humitas (1 unidad): 200g | 220kcal | P:5 C:38 G:6 F:4
• Lomo a lo pobre (plato): 450g | 750kcal | P:45 C:50 G:35 F:4
• Salmón a la plancha (filete): 180g | 290kcal | P:36 C:0 G:15 F:0
• Merluza a la plancha (filete): 180g | 160kcal | P:34 C:0 G:2 F:0
• Pechuga de pollo a la plancha: 150g | 230kcal | P:43 C:0 G:5 F:0
• Muslo/pata de pollo asado: 150g | 280kcal | P:32 C:0 G:17 F:0
• Bistec/lomo a la plancha: 180g | 300kcal | P:38 C:0 G:16 F:0
• Ensalada chilena (tomate+cebolla): 150g | 60kcal | P:2 C:10 G:2 F:2
• Palta (1/2): 75g | 120kcal | P:2 C:4 G:11 F:5
• Pizza (1/8 grande): 110g | 270kcal | P:11 C:33 G:11 F:2
• Sushi niguiri (6 piezas): 180g | 320kcal | P:14 C:50 G:6 F:2
• Yogur chico (Soprole/Colún): 125g | 110kcal | P:5 C:16 G:3 F:0
• Manzana/pera mediana: 150g | 80kcal | P:0 C:21 G:0 F:3
• Plátano mediano: 120g | 105kcal | P:1 C:27 G:0 F:3
• Naranja: 180g | 85kcal | P:2 C:21 G:0 F:4
• Pote de manjar (La Lechera 1 cda): 20g | 60kcal | P:1 C:13 G:1 F:0

REGLAS CRÍTICAS:
- Responde ÚNICAMENTE con JSON válido. Sin texto extra, backticks ni markdown.
- Si no hay comida visible claramente: {"error": "No pude identificar alimentos en esta imagen"}
- Si es un producto envasado con marca visible (Coca-Cola, Nestlé, Soprole, etc.), úsala en el nombre.
- Incluye salsas, aderezos, aceite y bebidas si son visibles.
- Sé conservador en porciones — mejor subestimar que sobreestimar.
- "confianza":"alta" = alimento y porción claramente visibles | "media" = porción estimada | "baja" = difícil de distinguir.

FORMATO DE RESPUESTA OBLIGATORIO:
{
  "plato": "Descripción breve del plato completo",
  "confianza": "alta|media|baja",
  "alimentos": [
    {
      "nombre": "Nombre descriptivo del alimento",
      "porcion_g": número,
      "cal": número,
      "prot": número,
      "carbs": número,
      "grasas": número,
      "fibra": número,
      "emoji": "emoji"
    }
  ],
  "total": {
    "cal": número,
    "prot": número,
    "carbs": número,
    "grasas": número,
    "fibra": número
  },
  "consejo": "Tip nutricional breve y motivador sobre este plato"
}`,
            cache_control: { type: "ephemeral" },
          },
        ],
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
          content: String(m.content).slice(0, 4000),
        }));

      // El system prompt viene del frontend, limitado por seguridad
      const safeSystem = system
        ? String(system).slice(0, 8000)
        : "Eres un asistente nutricional amigable.";

      // ── Búsqueda de datos reales si el usuario menciona comida ──
      const lastUserMsg = sanitizedMessages.filter(m => m.role === 'user').at(-1)?.content ?? '';
      const msgLower = lastUserMsg.toLowerCase();
      const needsSearch = FOOD_KEYWORDS.some(kw => msgLower.includes(kw));

      let enrichedSystem = safeSystem;
      if (needsSearch && lastUserMsg.length > 3) {
        const foodData = await searchFoodOnline(lastUserMsg);
        if (foodData) {
          enrichedSystem = `${safeSystem}\n\n${foodData}\n\nSi estos datos corresponden a lo que el usuario menciona, úsalos para calcular sus macros con precisión. Si no corresponden, usa tu conocimiento general. SIEMPRE indica la fuente cuando uses datos de OpenFoodFacts.`;
        }
      }

      anthropicBody = {
        model: MODEL,
        max_tokens: Math.min(max_tokens || 1000, 2000),
        system: enrichedSystem,
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
        max_tokens: 200,
        system: "Eres un nutricionista chileno amigable. Generas tips nutricionales breves, concretos y motivadores. Los consejos son relevantes para la alimentación chilena (menciona alimentos locales cuando aplique). Máximo 2 oraciones. Sin saludos.",
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
        "anthropic-beta": "prompt-caching-2024-07-31",
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
