-- ═══════════════════════════════════════════════════════
-- Monetización nutricionistas: $9.990/mes → Pro para pacientes
-- ═══════════════════════════════════════════════════════

-- Columna para vincular paciente con su nutricionista
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='linked_nutricionista_id') THEN
    ALTER TABLE profiles ADD COLUMN linked_nutricionista_id UUID;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='linked_nutricionista_nombre') THEN
    ALTER TABLE profiles ADD COLUMN linked_nutricionista_nombre TEXT;
  END IF;
END $$;

-- Tabla pública de lookup: pacientes buscan el código de su nutricionista aquí
CREATE TABLE IF NOT EXISTS nutricionista_codes (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nutricionista_id UUID UNIQUE NOT NULL,
  code            TEXT UNIQUE NOT NULL,
  nombre          TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE nutricionista_codes ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede leer (para buscar el código)
DROP POLICY IF EXISTS "nutricionista_codes_select_all" ON nutricionista_codes;
CREATE POLICY "nutricionista_codes_select_all"
  ON nutricionista_codes FOR SELECT
  TO authenticated
  USING (true);

-- Solo el nutricionista dueño puede insertar/actualizar/borrar
DROP POLICY IF EXISTS "nutricionista_codes_insert_own" ON nutricionista_codes;
CREATE POLICY "nutricionista_codes_insert_own"
  ON nutricionista_codes FOR INSERT
  WITH CHECK (nutricionista_id = auth.uid());

DROP POLICY IF EXISTS "nutricionista_codes_update_own" ON nutricionista_codes;
CREATE POLICY "nutricionista_codes_update_own"
  ON nutricionista_codes FOR UPDATE
  USING (nutricionista_id = auth.uid());

DROP POLICY IF EXISTS "nutricionista_codes_delete_own" ON nutricionista_codes;
CREATE POLICY "nutricionista_codes_delete_own"
  ON nutricionista_codes FOR DELETE
  USING (nutricionista_id = auth.uid());
