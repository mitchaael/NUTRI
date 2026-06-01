-- ═══════════════════════════════════════════════════════
-- Tabla nutrition_plans — columnas faltantes, RLS e índices
-- La tabla ya existe; este script es idempotente
-- ═══════════════════════════════════════════════════════

-- Agregar columna paciente_email si no existe
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name='nutrition_plans' AND column_name='paciente_email') THEN
    ALTER TABLE nutrition_plans ADD COLUMN paciente_email TEXT;
  END IF;
END $$;

-- Agregar columna paciente_id si no existe
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name='nutrition_plans' AND column_name='paciente_id') THEN
    ALTER TABLE nutrition_plans ADD COLUMN paciente_id UUID;
  END IF;
END $$;

-- Agregar columna ultima_actividad si no existe
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name='nutrition_plans' AND column_name='ultima_actividad') THEN
    ALTER TABLE nutrition_plans ADD COLUMN ultima_actividad TIMESTAMPTZ;
  END IF;
END $$;

-- Habilitar RLS
ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;

-- Nutricionista puede ver, crear, editar y borrar sus propios planes
DROP POLICY IF EXISTS "nut_plans_nutricionista_all" ON nutrition_plans;
CREATE POLICY "nut_plans_nutricionista_all"
  ON nutrition_plans
  USING (nutricionista_id = auth.uid())
  WITH CHECK (nutricionista_id = auth.uid());

-- Paciente puede ver su propio plan
DROP POLICY IF EXISTS "nut_plans_paciente_select" ON nutrition_plans;
CREATE POLICY "nut_plans_paciente_select"
  ON nutrition_plans FOR SELECT
  USING (paciente_id = auth.uid());

-- Paciente puede actualizar ultima_actividad en su propio plan
DROP POLICY IF EXISTS "nut_plans_paciente_actividad" ON nutrition_plans;
CREATE POLICY "nut_plans_paciente_actividad"
  ON nutrition_plans FOR UPDATE
  USING (paciente_id = auth.uid())
  WITH CHECK (paciente_id = auth.uid());

-- Índices
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_nutricionista ON nutrition_plans(nutricionista_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_paciente     ON nutrition_plans(paciente_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_email        ON nutrition_plans(paciente_email);
