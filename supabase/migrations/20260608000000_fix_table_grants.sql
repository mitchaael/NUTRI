-- ═══════════════════════════════════════════════════════
-- FIX: GRANTs de tabla faltantes
-- Las tablas nutricionista_codes y community_products tienen
-- políticas RLS pero nunca se otorgaron privilegios de tabla a
-- los roles anon/authenticated, por lo que PostgREST devolvía
-- 42501 "permission denied for table" (HTTP 401/403).
-- Síntoma: el botón "Vincular con nutricionista" fallaba con
-- "Error de conexión" porque no podía leer el código.
-- ═══════════════════════════════════════════════════════

-- nutricionista_codes: el paciente (authenticated) debe poder leer
-- el código; el nutricionista dueño gestiona el suyo. RLS ya filtra.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nutricionista_codes TO authenticated;

-- community_products: lectura pública, inserción/actualización autenticada.
GRANT SELECT ON public.community_products TO anon, authenticated;
GRANT INSERT, UPDATE ON public.community_products TO authenticated;
