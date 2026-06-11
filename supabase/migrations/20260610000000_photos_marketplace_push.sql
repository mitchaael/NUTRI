-- ═══════════════════════════════════════════════════════
-- Fotos de comidas + Marketplace real + Push notifications
-- ═══════════════════════════════════════════════════════

-- 1. Bucket para fotos de platos (público: URLs no adivinables por uuid)
insert into storage.buckets (id, name, public)
values ('meal-photos', 'meal-photos', true)
on conflict (id) do nothing;

drop policy if exists "meal_photos_insert_own" on storage.objects;
create policy "meal_photos_insert_own" on storage.objects for insert
  with check (
    bucket_id = 'meal-photos'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 2. Marketplace: perfil público del nutricionista (sobre nutricionista_codes)
alter table nutricionista_codes add column if not exists especialidad text;
alter table nutricionista_codes add column if not exists bio text;
alter table nutricionista_codes add column if not exists whatsapp text;
alter table nutricionista_codes add column if not exists precio integer;
alter table nutricionista_codes add column if not exists visible boolean default false;

-- 3. Push notifications: suscripciones web-push por usuario
create table if not exists public.push_subscriptions (
  user_id      uuid primary key,
  subscription jsonb not null,
  updated_at   timestamptz default now()
);
alter table public.push_subscriptions enable row level security;
grant select, insert, update, delete on public.push_subscriptions to authenticated;

drop policy if exists "push_subs_own" on public.push_subscriptions;
create policy "push_subs_own" on public.push_subscriptions
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
