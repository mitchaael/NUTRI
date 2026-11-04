-- Recordatorios push diarios (funcionan con la app cerrada).
-- Cada dispositivo que acepta notificaciones queda registrado aquí, con o sin
-- cuenta. La app avisa una vez al día cuándo registró comida por última vez
-- y la Edge Function `send-reminders` (cada hora, vía pg_cron) decide a quién
-- recordarle. Máximo 2 avisos al día y solo si no ha registrado nada hoy.

create table if not exists public.reminder_devices (
  id               uuid primary key default gen_random_uuid(),
  endpoint         text not null unique,
  subscription     jsonb not null,
  user_id          uuid references auth.users(id) on delete cascade,
  tz               text not null default 'America/Santiago',
  last_log_date    date,
  streak           int  not null default 0,
  lunch_sent_on    date,
  evening_sent_on  date,
  enabled          boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Sin políticas: nadie lee ni escribe la tabla directo desde el cliente.
-- Solo las funciones de abajo (security definer) y la Edge Function (service role).
alter table public.reminder_devices enable row level security;

create index if not exists reminder_devices_enabled_idx
  on public.reminder_devices (enabled) where enabled;

-- Registra o actualiza un dispositivo. Lo pueden llamar invitados (anon) y
-- usuarios con cuenta. El endpoint de push funciona como identificador secreto
-- del dispositivo, así que solo quien lo tiene puede actualizar su fila.
create or replace function public.register_reminder_device(
  p_endpoint      text,
  p_subscription  jsonb,
  p_tz            text default 'America/Santiago',
  p_last_log_date date default null,
  p_streak        int  default 0
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tz text := coalesce(nullif(p_tz, ''), 'America/Santiago');
begin
  -- Solo servicios de push conocidos (evita usar la tabla para otra cosa)
  if p_endpoint is null
     or length(p_endpoint) > 1000
     or p_endpoint !~ '^https://(fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|[a-z0-9.-]+\.notify\.windows\.com|web\.push\.apple\.com)/'
  then
    raise exception 'endpoint inválido';
  end if;

  if p_subscription is null
     or length(p_subscription::text) > 4000
     or p_subscription->>'endpoint' is distinct from p_endpoint
     or p_subscription->'keys'->>'p256dh' is null
     or p_subscription->'keys'->>'auth' is null
  then
    raise exception 'suscripción inválida';
  end if;

  if not exists (select 1 from pg_timezone_names where name = v_tz) then
    v_tz := 'America/Santiago';
  end if;

  insert into public.reminder_devices
    (endpoint, subscription, user_id, tz, last_log_date, streak, enabled, updated_at)
  values
    (p_endpoint, p_subscription, auth.uid(), v_tz, p_last_log_date,
     greatest(0, least(coalesce(p_streak, 0), 10000)), true, now())
  on conflict (endpoint) do update set
    subscription  = excluded.subscription,
    user_id       = coalesce(auth.uid(), public.reminder_devices.user_id),
    tz            = excluded.tz,
    last_log_date = greatest(public.reminder_devices.last_log_date, excluded.last_log_date),
    streak        = excluded.streak,
    enabled       = true,
    updated_at    = now();
end;
$$;

-- Apaga los recordatorios de un dispositivo (botón en Ajustes).
create or replace function public.disable_reminder_device(p_endpoint text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.reminder_devices
     set enabled = false, updated_at = now()
   where endpoint = p_endpoint;
$$;

revoke all on function public.register_reminder_device(text, jsonb, text, date, int) from public;
revoke all on function public.disable_reminder_device(text) from public;
grant execute on function public.register_reminder_device(text, jsonb, text, date, int) to anon, authenticated;
grant execute on function public.disable_reminder_device(text) to anon, authenticated;

-- Programación horaria (minuto 30 de cada hora) de la Edge Function.
-- El secreto se guarda en Vault con el nombre 'reminders_cron_secret' y debe
-- coincidir con el secreto CRON_SECRET de la Edge Function (se crea al desplegar,
-- nunca se escribe en el repo).
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule('caloru-reminders')
 where exists (select 1 from cron.job where jobname = 'caloru-reminders');

select cron.schedule(
  'caloru-reminders',
  '30 * * * *',
  $cron$
  select net.http_post(
    url     := 'https://fywghvfdwltayylswnid.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'reminders_cron_secret')
    ),
    body    := '{}'::jsonb
  );
  $cron$
);
