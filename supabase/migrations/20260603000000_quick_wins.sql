-- ══════════════════════════════════════════════════════════════
-- MIGRACIÓN: Quick Wins 2026-06-03
-- 1. Trigger auto-actualiza ultima_actividad en nutrition_plans
-- 2. Tabla ai_rate_limits para rate limiting persistente
-- ══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- 1. TRIGGER: ultima_actividad se actualiza al registrar comidas
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_patient_ultima_actividad()
RETURNS TRIGGER AS $$
BEGIN
  -- Sólo actualizar si el log tiene alimentos (no sync vacío)
  IF NEW.log IS NOT NULL
     AND NEW.log != '[]'::jsonb
     AND jsonb_array_length(NEW.log) > 0
  THEN
    UPDATE nutrition_plans
    SET ultima_actividad = NOW()
    WHERE paciente_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_ultima_actividad ON daily_logs;
CREATE TRIGGER trg_update_ultima_actividad
  AFTER INSERT OR UPDATE ON daily_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_patient_ultima_actividad();

-- ─────────────────────────────────────────────────────────────
-- 2. TABLA: ai_rate_limits — rate limiting persistente de IA
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_rate_limits (
  user_id      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  count        INTEGER     NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ai_rate_limits ENABLE ROW LEVEL SECURITY;

-- Solo acceso vía service role key (Edge Functions) — ningún cliente directo
CREATE POLICY "no_client_access" ON ai_rate_limits
  FOR ALL USING (false);

-- Índice para limpiezas periódicas (ventanas expiradas)
CREATE INDEX IF NOT EXISTS idx_ai_rate_limits_window
  ON ai_rate_limits (window_start);
