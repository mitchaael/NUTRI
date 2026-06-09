-- ═══════════════════════════════════════════════════════
-- Mensajería nutri ↔ paciente + lectura de peso para el nutri
-- ═══════════════════════════════════════════════════════

-- Mensajes entre nutricionista y paciente
create table if not exists public.nutri_messages (
  id               uuid primary key default gen_random_uuid(),
  nutricionista_id uuid not null,
  paciente_id      uuid not null,
  sender           text not null check (sender in ('nutri','paciente')),
  texto            text not null,
  created_at       timestamptz default now()
);

alter table public.nutri_messages enable row level security;
grant select, insert on public.nutri_messages to authenticated;

-- Ambas partes pueden ver su conversación
drop policy if exists "nutri_messages_select" on public.nutri_messages;
create policy "nutri_messages_select" on public.nutri_messages for select
  using (nutricionista_id = auth.uid() or paciente_id = auth.uid());

-- El nutri escribe como 'nutri'; el paciente como 'paciente'
drop policy if exists "nutri_messages_insert" on public.nutri_messages;
create policy "nutri_messages_insert" on public.nutri_messages for insert
  with check (
    (sender = 'nutri'     and nutricionista_id = auth.uid())
    or (sender = 'paciente' and paciente_id = auth.uid())
  );

create index if not exists idx_nutri_messages_pair
  on public.nutri_messages(nutricionista_id, paciente_id, created_at);

-- El nutricionista puede ver el historial de peso de sus pacientes vinculados
drop policy if exists "weight_history_nutricionista_select" on weight_history;
create policy "weight_history_nutricionista_select" on weight_history for select
  using (
    exists (
      select 1 from nutrition_plans np
      where np.paciente_id = weight_history.user_id
        and np.nutricionista_id = auth.uid()
    )
  );
