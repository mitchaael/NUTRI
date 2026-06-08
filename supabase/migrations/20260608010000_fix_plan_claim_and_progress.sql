-- ═══════════════════════════════════════════════════════
-- FIX: reclamación de plan por el paciente + progreso para el nutri
--
-- Problema: las políticas del paciente exigían paciente_id = auth.uid(),
-- pero al vincularse el plan aún está sin reclamar (paciente_id NULL),
-- así que el paciente nunca podía VER ni RECLAMAR su propio plan por
-- email → quedaba "Sin vincular" para siempre.
-- ═══════════════════════════════════════════════════════

-- Paciente puede VER su plan: el ya reclamado, o uno sin reclamar cuyo
-- paciente_email coincide con su email (para descubrirlo al vincularse).
DROP POLICY IF EXISTS "nut_plans_paciente_select" ON nutrition_plans;
CREATE POLICY "nut_plans_paciente_select"
  ON nutrition_plans FOR SELECT
  USING (
    paciente_id = auth.uid()
    OR (paciente_id IS NULL AND lower(paciente_email) = lower(auth.jwt() ->> 'email'))
  );

-- Paciente puede RECLAMAR (set paciente_id) y actualizar su plan.
DROP POLICY IF EXISTS "nut_plans_paciente_actividad" ON nutrition_plans;
DROP POLICY IF EXISTS "nut_plans_paciente_claim" ON nutrition_plans;
CREATE POLICY "nut_plans_paciente_claim"
  ON nutrition_plans FOR UPDATE
  USING (
    paciente_id = auth.uid()
    OR (paciente_id IS NULL AND lower(paciente_email) = lower(auth.jwt() ->> 'email'))
  )
  WITH CHECK (
    paciente_id = auth.uid()
    OR lower(paciente_email) = lower(auth.jwt() ->> 'email')
  );

-- El nutricionista puede VER los registros diarios de sus pacientes
-- vinculados, para mostrar su progreso/adherencia en el panel.
DROP POLICY IF EXISTS "daily_logs_nutricionista_select" ON daily_logs;
CREATE POLICY "daily_logs_nutricionista_select"
  ON daily_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM nutrition_plans np
      WHERE np.paciente_id = daily_logs.user_id
        AND np.nutricionista_id = auth.uid()
    )
  );
