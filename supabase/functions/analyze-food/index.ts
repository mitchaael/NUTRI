const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const MODEL = "claude-sonnet-4-5-20250929";
 
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
 
  if (!ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY no configurada en secrets" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
 
  try {
    const body = await req.json();
    const { mode, image, messages, system, prompt, nombre } = body;
 
    let anthropicBody;
 
    if (mode === "photo") {
      if (!image) {
        return new Response(
          JSON.stringify({ error: "Falta el campo 'image' (base64)" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
        max_tokens: 1200,
        system: `Eres un nutricionista experto. El usuario te envia una foto de su comida.
Tu tarea es:
1. Identificar TODOS los alimentos visibles en la foto.
2. Estimar la porcion en gramos de cada uno.
3. Estimar las calorias (kcal), proteinas (g), carbohidratos (g), grasas (g) y fibra (g) de cada alimento.
4. Dar un total estimado del plato completo.
 
IMPORTANTE:
- Se especifico con los alimentos chilenos si los reconoces (marraqueta, porotos, cazuela, pastel de choclo, empanada, sopaipilla, etc.)
- Responde SOLO con un JSON valido, sin texto antes ni despues, sin backticks, sin markdown.
- Si no puedes identificar la comida o la imagen no es de comida, responde: {"error": "No pude identificar alimentos en esta imagen"}
 
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
                text: nombre
                  ? `Soy ${nombre}. Analiza esta foto de mi comida y estima las calorias y macros.`
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
 
      anthropicBody = {
        model: MODEL,
        max_tokens: 1000,
        system: system || "Eres un asistente nutricional amigable.",
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      };
 
    } else if (mode === "insight") {
      anthropicBody = {
        model: MODEL,
        max_tokens: 150,
        messages: [
          {
            role: "user",
            content: prompt || "Dame un tip nutricional breve.",
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
      console.error("Anthropic API error:", anthropicRes.status, errText);
      return new Response(
        JSON.stringify({ error: "API error: " + anthropicRes.status, detail: errText }),
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
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Error interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});