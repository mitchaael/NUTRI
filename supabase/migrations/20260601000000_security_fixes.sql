-- ═══════════════════════════════════════════════════════
-- SEGURIDAD: Tablas para anti-replay de webhooks y rate limiting
-- ═══════════════════════════════════════════════════════

-- ── Tabla de webhooks procesados (anti-replay MercadoPago) ──────────────
CREATE TABLE IF NOT EXISTS processed_webhooks (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_key  TEXT        UNIQUE NOT NULL,  -- formato: "topic:resourceId"
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_processed_webhooks_key ON processed_webhooks(webhook_key);

-- Solo service_role puede acceder (Edge Function usa service_role_key)
ALTER TABLE processed_webhooks ENABLE ROW LEVEL SECURITY;
-- Sin policy para usuarios normales = solo service_role puede leer/escribir

-- Limpieza automática: los webhooks más viejos de 30 días no son relevantes
-- (ejecutar periódicamente via cron o pg_cron si está disponible)

-- ── Constraint de integridad en subscription_status ──────────────────────
-- Previene valores inesperados en el campo de suscripción
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_subscription_status_check'
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_subscription_status_check
      CHECK (subscription_status IS NULL OR subscription_status IN ('free', 'pro', 'nutricionista'));
  END IF;
END $$;

-- ── Índice en profiles para búsquedas de suscripción rápidas ─────────────
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON profiles(subscription_status);

-- ── Índice en nutricionista_codes para búsquedas de código ───────────────
-- Evita full table scan al vincular paciente-nutricionista
CREATE INDEX IF NOT EXISTS idx_nutricionista_codes_code ON nutricionista_codes(code);
