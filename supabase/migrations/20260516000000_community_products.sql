-- ═══════════════════════════════════════════════════════
-- COMMUNITY PRODUCTS — Base de datos comunitaria de
-- productos chilenos escaneados por usuarios de Calorú.
-- Cuando un usuario agrega un producto manualmente y lo
-- comparte, queda disponible para todos los demás.
-- ═══════════════════════════════════════════════════════

create table if not exists public.community_products (
  id             uuid primary key default gen_random_uuid(),
  barcode        text not null,
  nombre         text not null,
  marca          text,
  porcion        numeric default 100,
  cal            numeric not null,
  prot           numeric default 0,
  carbs          numeric default 0,
  grasas         numeric default 0,
  fibra          numeric default 0,
  azucar         numeric,
  sodio          numeric,
  emoji          text default '📦',
  cat            text default 'Escaneado',
  contributed_by uuid references auth.users(id) on delete set null,
  verified       boolean default false,
  times_scanned  integer default 1,
  created_at     timestamptz default now(),
  -- Un barcode solo puede existir una vez
  constraint community_products_barcode_unique unique (barcode)
);

-- Índice para búsqueda rápida por código de barras
create index if not exists community_products_barcode_idx
  on public.community_products (barcode);

-- RLS
alter table public.community_products enable row level security;

-- Cualquier persona (incluso sin sesión) puede leer
create policy "community_products_select"
  on public.community_products for select
  using (true);

-- Solo usuarios autenticados pueden insertar
create policy "community_products_insert"
  on public.community_products for insert
  with check (auth.uid() is not null);

-- El que contribuyó puede actualizar su propio aporte
create policy "community_products_update"
  on public.community_products for update
  using (auth.uid() = contributed_by);
