const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MP_ACCESS_TOKEN      = Deno.env.get("MP_ACCESS_TOKEN");
const MP_ACCESS_TOKEN_TEST = Deno.env.get("MP_ACCESS_TOKEN_TEST");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { plan, user_email, back_url, test_mode } = await req.json();

    // Usar token de prueba si se solicita explícitamente
    const token = test_mode ? MP_ACCESS_TOKEN_TEST : MP_ACCESS_TOKEN;

    if (!token) {
      return new Response(
        JSON.stringify({ error: "MP_ACCESS_TOKEN no configurado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const planConfig: Record<string, { reason: string; frequency: number; transaction_amount: number }> = {
      monthly: {
        reason: "Caloru Pro Mensual",
        frequency: 1,
        transaction_amount: 3500,
      },
      yearly: {
        reason: "Caloru Pro Anual",
        frequency: 12,
        transaction_amount: 29900,
      },
    };

    const selectedPlan = planConfig[plan];
    if (!selectedPlan) {
      return new Response(
        JSON.stringify({ error: "Plan invalido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason: selectedPlan.reason,
        payer_email: user_email,
        auto_recurring: {
          frequency: selectedPlan.frequency,
          frequency_type: "months",
          transaction_amount: selectedPlan.transaction_amount,
          currency_id: "CLP",
        },
        back_url: back_url || "https://caloru.cl",
      }),
    });

    const data = await response.json();
    console.log("MP response status:", response.status);
    console.log("MP response:", JSON.stringify(data));

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.message || "Error de Mercado Pago", detail: data }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        init_point: data.init_point,
        id: data.id,
        status: data.status,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
