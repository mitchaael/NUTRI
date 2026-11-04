// Envía los recordatorios diarios de Calorú (push con la app cerrada).
// La llama pg_cron cada hora (minuto 30) con el header x-cron-secret.
//
// Reglas (en la hora local de cada dispositivo):
//   13:30 → "¿Qué almorzaste?"  si no ha registrado hoy y estuvo activo hace ≤ 2 días
//   20:30 → racha en riesgo / recordatorio suave  si no ha registrado hoy y estuvo activo hace ≤ 14 días
//           (pasados 3 días sin registrar, solo cada 3 días)
// Máximo 2 avisos al día. Después de 14 días sin registrar, silencio.
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY");
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY");
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:caloruapp@gmail.com";
const CRON_SECRET = Deno.env.get("CRON_SECRET");

const sbHeaders = {
  "apikey": SERVICE_KEY,
  "Authorization": `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

type Device = {
  id: string;
  subscription: webpush.PushSubscription;
  tz: string;
  last_log_date: string | null;
  streak: number;
  lunch_sent_on: string | null;
  evening_sent_on: string | null;
};

// Fecha (YYYY-MM-DD) y hora local de una zona horaria
function localNow(tz: string): { date: string; hour: number } {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23",
    }).formatToParts(new Date());
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    return { date: `${get("year")}-${get("month")}-${get("day")}`, hour: Number(get("hour")) };
  } catch {
    return localNow("America/Santiago");
  }
}

const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(to + "T00:00:00Z") - Date.parse(from + "T00:00:00Z")) / 86_400_000);

const LUNCH = [
  "🍽️ ¿Qué almorzaste hoy? Anótalo en un minuto",
  "☀️ Hora de almuerzo: ¿lo registramos?",
  "🥗 ¿Ya almorzaste? Tu registro te espera",
];

function eveningMessage(d: Device, today: string): { title: string; body: string } {
  const sinceLast = d.last_log_date ? daysBetween(d.last_log_date, today) : 99;
  if (sinceLast === 1 && d.streak > 1) {
    return {
      title: `🔥 Tu racha de ${d.streak} días está en riesgo`,
      body: "Se corta a medianoche. Anota aunque sea una comida.",
    };
  }
  if (sinceLast <= 3) {
    return { title: "🌙 ¿Cómo te fue hoy con la comida?", body: "Anótalo antes de dormir, toma un minuto." };
  }
  return { title: "👋 Te echamos de menos en Calorú", body: "Retoma hoy con una sola comida. Sin presión." };
}

Deno.serve(async (req) => {
  if (!CRON_SECRET || req.headers.get("x-cron-secret") !== CRON_SECRET) {
    return json({ error: "No autorizado" }, 401);
  }
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return json({ error: "VAPID no configurado" }, 500);
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/reminder_devices?enabled=eq.true&select=id,subscription,tz,last_log_date,streak,lunch_sent_on,evening_sent_on`,
    { headers: sbHeaders },
  );
  if (!res.ok) return json({ error: "No se pudo leer dispositivos" }, 500);
  const devices: Device[] = await res.json();

  let sent = 0, removed = 0;
  for (const d of devices) {
    const { date: today, hour } = localNow(d.tz);
    if (d.last_log_date === today) continue;           // ya registró hoy
    const inactive = d.last_log_date ? daysBetween(d.last_log_date, today) : 99;
    if (inactive > 14) continue;                       // no insistir más

    let payload: { title: string; body: string } | null = null;
    let field: "lunch_sent_on" | "evening_sent_on" | null = null;

    if (hour === 13 && d.lunch_sent_on !== today && inactive <= 2) {
      const title = LUNCH[Math.floor(Math.random() * LUNCH.length)];
      payload = { title, body: "Toca aquí para registrar en Calorú." };
      field = "lunch_sent_on";
    } else if (hour === 20 && d.evening_sent_on !== today && (inactive <= 3 || inactive % 3 === 0)) {
      payload = eveningMessage(d, today);
      field = "evening_sent_on";
    }
    if (!payload || !field) continue;

    try {
      await webpush.sendNotification(d.subscription, JSON.stringify({
        ...payload, icon: "/icon-192.png", tag: "caloru-reminder", url: "/",
      }));
      sent++;
      await fetch(`${SUPABASE_URL}/rest/v1/reminder_devices?id=eq.${d.id}`, {
        method: "PATCH", headers: sbHeaders, body: JSON.stringify({ [field]: today }),
      });
    } catch (e) {
      const code = (e as { statusCode?: number })?.statusCode;
      if (code === 404 || code === 410) {
        // El usuario quitó el permiso o desinstaló: borrar el dispositivo
        await fetch(`${SUPABASE_URL}/rest/v1/reminder_devices?id=eq.${d.id}`, { method: "DELETE", headers: sbHeaders });
        removed++;
      } else {
        console.error("send-reminders: fallo al enviar", d.id, code);
      }
    }
  }
  return json({ ok: true, revisados: devices.length, enviados: sent, borrados: removed });
});
