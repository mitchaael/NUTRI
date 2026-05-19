# Ideas — Próximos Proyectos (Post lanzamiento Calorú)

> Estos proyectos se retoman una vez que Calorú esté estable en Android e iOS.

---

## 🏢 Visión de Empresa

Calorú no es solo una app — es la primera app de una compañía de productos digitales chilenos.
Cada app comparte la misma infraestructura (Supabase, IA, principios de diseño) y el mismo
foco: resolver dolores reales de los chilenos que las apps gringas no resuelven.

---

## 💰 "Queda" — App de Finanzas Personales Chilena

**Concepto:** La única app de presupuesto personal hecha para los chilenos reales — con contexto
local, lenguaje chileno y foco en salir de la deuda CMR y ahorrar para el pie.

**Propuesta de valor:**
> "Queda te dice exactamente adónde se fue tu plata este mes, cuánto te cuesta tu deuda CMR
> en términos reales, y qué hacer la próxima semana para que te quede algo."

**Por qué ahora:**
- 4 millones de chilenos en DICOM (26% de los adultos)
- Sueldo mediano $611.162 — arriendo promedio en Santiago supera eso
- 36% sin ningún ahorro. 3,8M vaciaron AFP en pandemia
- Nota real de educación financiera en Chile: 1,6/7
- No existe ninguna app chilena de presupuesto integrada con BancoEstado, Santander, Falabella

**Gap competitivo:**
- Fintual → inversión (para los que YA tienen plata)
- Mach/Mercado Pago → billetera (transaccional, no analítico)
- Mint/Fintonic → no se conectan con bancos chilenos, no tienen contexto local
- **Queda → presupuesto + deuda + ahorro para el que gana $611k y quiere que le alcance**

**Features core:**
1. 📊 Visión consolidada de gastos en categorías chilenas reales (gasto de marzo, asado del 18, etc.)
2. 💳 Simulador de deuda CMR: "si pagás $50k más al mes, salís en X meses y ahorráis $Y"
3. 🏠 Meta del pie: calculadora de ahorro para primera vivienda en UF reales
4. ⚠️ Alerta de gastos hormiga con categorías chilenas
5. 📖 Glosario financiero chileno (AFP, APV, DICOM, CMF, CMR)

**Público objetivo:**
Chilenos 24-38 años, ingresos $500k-$1.5M, con al menos una tarjeta de crédito o CMR,
que sienten que el sueldo "no alcanza" aunque matemáticamente debería alcanzar.

**Referencia de éxito:** Fintual → 100.000 usuarios + USD 1.000M bajo administración
haciendo solo una cosa con tono local. Queda ataca el problema PREVIO a Fintual.

**Fuentes de investigación:**
- CMF Informe de Endeudamiento 2025
- Banco Central EFH 2024
- INE Ingresos 2024
- UC Estudio Educación Financiera Chile
- Equifax/USS datos DICOM

---

## 📋 Pendientes Calorú antes de ver esto

- [ ] Lanzamiento iOS (App Store)
- [ ] Estabilizar base de usuarios Android
- [ ] Crecer DB comunitaria de productos
- [ ] Monetización y conversión a Pro
- [ ] Organigrama empresa (estructura legal y operativa)

---

*Documento creado: Mayo 2026*
*Retomar: post lanzamiento iOS de Calorú*

---

## 🇨🇱 Diferenciadores únicos — Calorú (investigados con datos reales)
*Agregado: Mayo 2026*

### 1. 🎉 Modo Patrias — PRIORIDAD ALTA (antes de sept 2026)
Modo estacional 15-20 septiembre con platos típicos de Fiestas Patrias (anticucho, choripán, borgoña, chicha, empanada) y "presupuesto de calorías patriotas". Los chilenos suben 3-4 kilos en Fiestas Patrias. Nadie en el mundo tiene esto. Dificultad: Baja. Virabilidad: Altísima.
- Fuente: Diario Estrategia + Revista de Salud UC
- Datos caloricos: MINSAL + publicaciones UC y Santo Tomás

### 2. 😔 Mood Log — Registro emocional + comida
2 toques al registrar comida para indicar estado emocional. Después de 30 días la IA muestra patrones: "cuando estás estresado comes 340 kcal extra entre 21-23hrs". 69.3% de chilenas tiene alimentación emocional (U. de Chile, 2024). Dificultad: Media.
- Fuente: Revista Chilena de Nutrición 2024 + U. de Chile

### 3. 📍 Termómetro Nutricional por Comuna
Al crear perfil, comparas tu situación con tu comuna usando Mapa Nutricional Junaeb 2025 (datos por comuna: Pudahuel 53%, La Pintana 52.5%, Providencia 47.8%). Datos públicos que solo un equipo local conoce. Dificultad: Media.
- Fuente: Junaeb.cl/mapa-nutricional + DEIS MINSAL tablero público

### 4. 🫙 Cocina Patrimonial Regional
Recetas con valores nutricionales reales de gastronomía regional chilena (atacameña, mapuche, chilota, patagónica): cochayuyo, merkén, mote, chuchoca, ulte. Fuente oficial: Catálogo de la Subsecretaría de Turismo 2024. Ninguna app lo ha digitalizado. Dificultad: Media.
- Fuente: Subsecretaría de Turismo + Tabla Composición MINSAL

### 5. 💰 Precio Real Hoy — Complemento Modo Feria
Precios en tiempo real de ingredientes en Líder, Jumbo, Unimarc, Tottus actualizados diariamente. Carriapp (9.000 usuarios) ya resolvió el problema técnico de scraping — posible alianza. Canaresta Básica superó $90.000 por persona (marzo 2026). Dificultad: Alta.
- Fuente: Carriapp (nov 2025) + Ministerio Desarrollo Social + ChileAtiende Observatorio Precios

### Calendario sugerido de implementación
- **Junio 2026** — Mood Log (retención profunda)
- **Julio 2026** — Termómetro por Comuna (mejora onboarding)
- **Agosto 2026** — Modo Patrias (listo para el 15 sept)
- **Sep-Oct 2026** — Cocina Patrimonial (posicionamiento regional)
- **Q1 2027** — Precio Real Hoy (requiere alianza técnica)

---

## 🎨 UX/UI — Reorganizar la app (pendiente)
*Prioridad: Alta — hacer antes de lanzar nuevas features*

La app está saturada en algunos apartados. Revisar y simplificar antes de agregar más contenido.

**Áreas a revisar:**
- Pantalla principal (home) — demasiados elementos
- Pantalla de búsqueda de alimentos — muchos accesos rápidos
- Perfil / configuración — demasiadas opciones anidadas
- Modales con demasiada información junta

**Approach sugerido:**
- Auditoría visual de cada pantalla
- Jerarquía clara: qué es primario vs secundario
- Esconder funciones avanzadas detrás de un "ver más"
- Consistencia visual entre secciones

*Revisar mañana con screenshots reales del usuario*
