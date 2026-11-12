-- Topes diarios de IA por usuario y modo (photo, text, chat, insight).
-- El límite por hora no alcanzaba: un usuario free podía hacer ~480 llamadas al día.
create table if not exists public.ai_usage_daily (
  user_id uuid    not null,
  day     date    not null,
  mode    text    not null,
  count   integer not null default 0,
  primary key (user_id, day, mode)
);
alter table public.ai_usage_daily enable row level security;
-- Sin políticas: solo la Edge Function (service_role) usa esta tabla, vía la función de abajo.

-- Suma 1 al contador del día y dice si la llamada cabe en el tope. Atómica (una sola sentencia).
create or replace function public.ai_usage_hit(p_user uuid, p_mode text, p_limit integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.ai_usage_daily as u (user_id, day, mode, count)
  values (p_user, (now() at time zone 'America/Santiago')::date, p_mode, 1)
  on conflict (user_id, day, mode) do update
    set count = u.count + 1
    where u.count < p_limit
  returning count into v_count;
  -- Si ya estaba en el tope, el update no se aplica y no devuelve fila
  return v_count is not null;
end;
$$;

revoke all on function public.ai_usage_hit(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.ai_usage_hit(uuid, text, integer) to service_role;
grant select, insert, update, delete on public.ai_usage_daily to service_role;
