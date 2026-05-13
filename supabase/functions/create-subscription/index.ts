const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { plan, user_email, back_url } = await req.json();

    const planConfig = {
      monthly: {
        reason: "Caloru Pro Mensual",
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 3500,
      },
      yearly: {
        reason: "Caloru Pro Anual",
        frequency: 12,
        frequency_type: "months",
        transaction_amount: 29900,
      },
    };

    const selectedPlan = planConfig[plan];
    if (!selectedPlan) {
      return new Response(JSON.stringify({ error: "Plan invalido" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const response = await fetch("https://api.mercadopago.com/preapproval_plan", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason: selectedPlan.reason,
        auto_recurring: {
          frequency: selectedPlan.frequency,
          frequency_type: selectedPlan.frequency_type,
          transaction_amount: selectedPlan.transaction_amount,
          currency_id: "CLP",
        },
        back_url: back_url || "https://caloru.cl",
        payer_email: user_email,
      }),
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
