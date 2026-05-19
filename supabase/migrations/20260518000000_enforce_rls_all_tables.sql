-- ═══════════════════════════════════════════════════════
-- SECURITY: Habilitar y reforzar RLS en todas las tablas
-- críticas de Calorú. Ejecutar si aún no está aplicado.
-- ═══════════════════════════════════════════════════════

-- ── profiles ──────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- ── daily_logs ────────────────────────────────────────
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "daily_logs_select_own" ON public.daily_logs;
CREATE POLICY "daily_logs_select_own"
  ON public.daily_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "daily_logs_insert_own" ON public.daily_logs;
CREATE POLICY "daily_logs_insert_own"
  ON public.daily_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "daily_logs_update_own" ON public.daily_logs;
CREATE POLICY "daily_logs_update_own"
  ON public.daily_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "daily_logs_delete_own" ON public.daily_logs;
CREATE POLICY "daily_logs_delete_own"
  ON public.daily_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ── weight_history ────────────────────────────────────
ALTER TABLE public.weight_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "weight_history_select_own" ON public.weight_history;
CREATE POLICY "weight_history_select_own"
  ON public.weight_history FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "weight_history_insert_own" ON public.weight_history;
CREATE POLICY "weight_history_insert_own"
  ON public.weight_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "weight_history_update_own" ON public.weight_history;
CREATE POLICY "weight_history_update_own"
  ON public.weight_history FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "weight_history_delete_own" ON public.weight_history;
CREATE POLICY "weight_history_delete_own"
  ON public.weight_history FOR DELETE
  USING (auth.uid() = user_id);

-- ── user_settings ─────────────────────────────────────
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_settings_select_own" ON public.user_settings;
CREATE POLICY "user_settings_select_own"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "user_settings_insert_own" ON public.user_settings;
CREATE POLICY "user_settings_insert_own"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "user_settings_update_own" ON public.user_settings;
CREATE POLICY "user_settings_update_own"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "user_settings_delete_own" ON public.user_settings;
CREATE POLICY "user_settings_delete_own"
  ON public.user_settings FOR DELETE
  USING (auth.uid() = id);

-- ── community_products — NOTA SOBRE POLÍTICA DE BORRADO ──
-- La política actual NO tiene DELETE. Un usuario autenticado
-- podría borrar la fila de otro si el contributed_by es null.
-- Se añade política de borrado restrictiva:
DROP POLICY IF EXISTS "community_products_delete" ON public.community_products;
CREATE POLICY "community_products_delete"
  ON public.community_products FOR DELETE
  USING (auth.uid() = contributed_by);

-- Verificar que ninguna tabla tenga la policy pública "allow all"
-- Si existía una policy heredada del dashboard, eliminarla:
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.daily_logs;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.weight_history;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_settings;
