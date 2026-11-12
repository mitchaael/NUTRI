-- ═══════════════════════════════════════════════════════════════════════
-- 1) El servidor (service_role) no tenía permisos sobre las tablas públicas:
--    mp-webhook y verify-play-purchase no podían activar Pro tras un pago,
--    y analyze-food no podía leer el plan del usuario. Son los permisos
--    estándar de Supabase; service_role solo se usa en Edge Functions.
-- ═══════════════════════════════════════════════════════════════════════
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
alter default privileges in schema public grant select, insert, update, delete on tables to service_role;
alter default privileges in schema public grant usage, select on sequences to service_role;

-- ═══════════════════════════════════════════════════════════════════════
-- 2) Hueco: cualquier usuario podía escribir su propio subscription_status
--    o linked_nutricionista_id por la API y quedar Pro sin pagar.
--    Ahora la app solo puede escribir sus columnas de perfil; la suscripción
--    la escriben las Edge Functions y la vinculación pasa por una función.
-- ═══════════════════════════════════════════════════════════════════════
revoke insert, update on public.profiles from anon, authenticated;
grant insert (id, nombre, perfil, obj, updated_at, account_type, professional_code, nutricionista_id, avatar_url)
  on public.profiles to authenticated;
grant update (id, nombre, perfil, obj, updated_at, account_type, professional_code, nutricionista_id, avatar_url)
  on public.profiles to authenticated;

-- Vincular al paciente con su nutricionista validando el código en el servidor
create or replace function public.link_nutricionista(p_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_code text := upper(trim(coalesce(p_code, '')));
  v_nutri record;
begin
  if v_uid is null then raise exception 'no autenticado'; end if;
  select nutricionista_id, nombre into v_nutri from public.nutricionista_codes where code = v_code;
  if not found then return null; end if;
  insert into public.profiles (id, linked_nutricionista_id, linked_nutricionista_nombre, updated_at)
  values (v_uid, v_nutri.nutricionista_id, v_nutri.nombre, now())
  on conflict (id) do update
    set linked_nutricionista_id = excluded.linked_nutricionista_id,
        linked_nutricionista_nombre = excluded.linked_nutricionista_nombre,
        updated_at = now();
  return json_build_object('nutricionista_id', v_nutri.nutricionista_id, 'nombre', v_nutri.nombre);
end;
$$;

create or replace function public.unlink_nutricionista()
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles
     set linked_nutricionista_id = null, linked_nutricionista_nombre = null, updated_at = now()
   where id = auth.uid();
$$;

revoke all on function public.link_nutricionista(text) from public, anon;
revoke all on function public.unlink_nutricionista() from public, anon;
grant execute on function public.link_nutricionista(text) to authenticated;
grant execute on function public.unlink_nutricionista() to authenticated;

-- ═══════════════════════════════════════════════════════════════════════
-- 3) Referidos con premio: 7 días de Pro para quien invita, cuando su
--    invitado tiene cuenta hace ≥ 3 días y registró comidas en ≥ 3 días.
--    Máximo 10 premios por persona. Nadie puede invitarse a sí mismo.
-- ═══════════════════════════════════════════════════════════════════════
create table if not exists public.referral_codes (
  code       text primary key check (code ~ '^[A-Z0-9]{4,10}$'),
  user_id    uuid not null unique,
  created_at timestamptz not null default now()
);
create table if not exists public.referrals (
  referred_id uuid primary key,
  inviter_id  uuid not null,
  code        text not null,
  created_at  timestamptz not null default now(),
  rewarded_at timestamptz
);
alter table public.referral_codes enable row level security;
alter table public.referrals enable row level security;
-- Sin políticas: solo se usan a través de las funciones de abajo.

-- Asocia un código de invitación a la cuenta (devuelve el código definitivo)
create or replace function public.register_ref_code(p_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_code text;
begin
  if v_uid is null then raise exception 'no autenticado'; end if;
  select code into v_code from public.referral_codes where user_id = v_uid;
  if v_code is not null then return v_code; end if;
  v_code := upper(coalesce(p_code, ''));
  if v_code !~ '^[A-Z0-9]{4,10}$' or exists (select 1 from public.referral_codes where code = v_code) then
    loop
      v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
      exit when not exists (select 1 from public.referral_codes where code = v_code);
    end loop;
  end if;
  insert into public.referral_codes (code, user_id) values (v_code, v_uid);
  return v_code;
end;
$$;

-- El invitado reclama: registra quién lo invitó y, si ya cumple, premia al que invitó
create or replace function public.claim_referral(p_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_inviter uuid;
  v_ref record;
  v_dias integer;
  v_edad interval;
  v_premios integer;
begin
  if v_uid is null then raise exception 'no autenticado'; end if;
  select user_id into v_inviter from public.referral_codes where code = upper(coalesce(p_code, ''));
  if v_inviter is null or v_inviter = v_uid then
    return json_build_object('ok', false, 'motivo', 'codigo_invalido');
  end if;

  insert into public.referrals (referred_id, inviter_id, code)
  values (v_uid, v_inviter, upper(p_code))
  on conflict (referred_id) do nothing;

  select * into v_ref from public.referrals where referred_id = v_uid;
  if v_ref.rewarded_at is not null then
    return json_build_object('ok', true, 'premiado', true);
  end if;

  select count(distinct date) into v_dias from public.daily_logs
   where user_id = v_uid and jsonb_typeof(log) = 'array' and jsonb_array_length(log) > 0;
  select now() - created_at into v_edad from auth.users where id = v_uid;
  if v_dias < 3 or v_edad < interval '3 days' then
    return json_build_object('ok', true, 'premiado', false, 'dias', v_dias);
  end if;

  select count(*) into v_premios from public.referrals
   where inviter_id = v_ref.inviter_id and rewarded_at is not null;
  update public.referrals set rewarded_at = now() where referred_id = v_uid;
  if v_premios >= 10 then
    return json_build_object('ok', true, 'premiado', true, 'tope', true);
  end if;

  -- 7 días de Pro al que invitó (sin tocar suscripciones permanentes ni bajar a un nutricionista)
  insert into public.profiles (id, subscription_status, subscription_plan, subscription_expires_at, updated_at)
  values (v_ref.inviter_id, 'pro', 'referido', now() + interval '7 days', now())
  on conflict (id) do update set
    subscription_status = case
      when profiles.subscription_status = 'nutricionista' then profiles.subscription_status
      else 'pro' end,
    subscription_plan = case
      when profiles.subscription_status in ('pro', 'nutricionista')
           and (profiles.subscription_expires_at is null or profiles.subscription_expires_at > now())
        then profiles.subscription_plan
      else 'referido' end,
    subscription_expires_at = case
      when profiles.subscription_status in ('pro', 'nutricionista') and profiles.subscription_expires_at is null
        then null  -- Pro sin vencimiento: no ponerle uno
      else greatest(coalesce(profiles.subscription_expires_at, now()), now()) + interval '7 days' end,
    updated_at = now();

  return json_build_object('ok', true, 'premiado', true);
end;
$$;

revoke all on function public.register_ref_code(text) from public, anon;
revoke all on function public.claim_referral(text) from public, anon;
grant execute on function public.register_ref_code(text) to authenticated;
grant execute on function public.claim_referral(text) to authenticated;
