-- Realtime para el chat nutri-paciente + plantillas de pauta en la nube

do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='nutri_messages') then
    alter publication supabase_realtime add table public.nutri_messages;
  end if;
end $$;

create table if not exists public.nutri_templates (
  id               uuid primary key default gen_random_uuid(),
  nutricionista_id uuid not null,
  nombre           text not null,
  data             jsonb not null,
  created_at       timestamptz default now()
);
alter table public.nutri_templates enable row level security;
grant select, insert, delete on public.nutri_templates to authenticated;
drop policy if exists "nutri_templates_own" on public.nutri_templates;
create policy "nutri_templates_own" on public.nutri_templates
  using (nutricionista_id = auth.uid())
  with check (nutricionista_id = auth.uid());
