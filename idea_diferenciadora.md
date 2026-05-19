# La Idea Diferenciadora de Caloru
*Generado el 18 de mayo 2026*

---

## Investigacion previa

### 1. Que hacen las apps exitosas en mercados locales que Caloru no hace

**Lifesum (Suecia)** integro en 2024 biomarcadores de sangre via Lykon — combina resultados de examenes medicos reales con su app para personalizar recomendaciones nutricionales. Tiene un "Life Score" que evalua salud holistica.

**Fitia (Peru/LATAM)** tiene "meal syncing" para familias — planes compartidos con porciones distintas por miembro. Es la app mas fuerte en Chile con ~$8.4K revenue semanal Q1 2024.

**Apps en India/Brasil**: el mayor mercado de ingresos en apps de nutricion a nivel global en 2025 fue India ($1.9B), impulsado por integracion cultural profunda — pero ninguna app ha integrado el contexto de precio de supermercado local con nutricion de forma nativa.

**Gap critico identificado**: ningun app en LATAM ni en espanol integra el presupuesto real del usuario (cuanto puede gastar en comida esta semana) con el plan nutricional. Eat This Much lo hace en ingles para mercado anglosajson, pero con precios de Walmart, no de Jumbo, Unimarc o Lider.

### 2. Que mecanismo psicologico de Duolingo/Strava nadie ha adaptado bien en nutricion

**Duolingo Ligas semanales**: aumento retention de 12% a 55%. El mecanismo es reset semanal con promocion/descenso entre ligas. Nadie lo ha aplicado a nutricion con contexto real (no solo "XP", sino habitos de alimentacion reales).

**Strava Segmentos hiperlocales**: los clubs locales tienen usuarios 3.5x mas propensos a mantenerse activos a 12 meses. El elemento "tu barrio" nunca ha sido replicado en nutricion.

**El gap psicologico mas potente sin explotar**: Duolingo usa ligas con promocion/descenso semanal. En nutricion esto se ha intentado con "racha diaria" (ya lo tiene Caloru), pero NADIE ha combinado liga de competencia semanal + contexto geografico local (tu comuna, tu ciudad) + desafio de habito especifico de esa semana. Strava tiene 14 mil millones de "kudos" dados en 2025. En nutricion no existe ese volumen de validacion social.

### 3. Tecnologia emergente sin integracion en apps en espanol

**CGM (monitores continuos de glucosa)**: Signos, Levels, Nutrisense existen — pero todos en ingles, para mercado gringo, con CGMs que no se venden facilmente en Chile. El hardware aun es barrera.

**IA generativa multimodal**: Lifesum lanzo en febrero 2025 tracker multimodal (foto + voz + texto + barcode). Caloru ya tiene escaner de platos — pero nadie ha usado IA generativa para predecir como un alimento especifico te va a afectar basado en TU historial personal de registros.

**El gap de tecnologia mas accionable**: ninguna app en espanol usa IA para cruzar el precio actual de supermercados chilenos con el valor nutricional, y proponer "el mejor gasto nutricional para tu presupuesto esta semana".

---

## LA IDEA: "Modo Feria" — Tu Nutricion al Mejor Precio

### Nombre del feature
**Modo Feria** (o internamente: *NutriPeso*)

### Que es

Un modulo de inteligencia nutricional-economica que, dado tu presupuesto semanal en comida (ej: $15.000 CLP), te genera un plan de alimentacion optimizado cruzando tu base de datos de productos chilenos con los precios actuales de los principales supermercados (Jumbo, Lider, Unimarc, Santa Isabel) — mostrando exactamente que comprar, cuanto, y como distribuirlo en la semana para cumplir tus metas de calorias y macros al menor costo posible.

La IA no solo planifica: aprende de lo que tu escaneas y registras semana a semana para afinar sus recomendaciones, y te muestra en tiempo real "cuanto proteina por peso estes comprando" vs el promedio de la comunidad Caloru en tu region.

### Por que ninguna app lo tiene

- **Eat This Much** (el unico app del mundo con presupuesto nutricional) trabaja con precios de supermercados gringos (Walmart, Kroger), no tiene datos de Chile, y su interfaz es en ingles con UX de 2015.
- **Fitia** tiene plan familiar pero sin integracion de precios reales.
- **MyFitnessPal, Lifesum, Cronometer**: cero consideracion economica. Asumen que el usuario puede comprar lo que sea.
- **Ninguna app en espanol ni en LATAM** ha conectado la base de datos nutricional con precios de supermercado locales actualizados.

El diferencial tecnico real es la combinacion de: (1) DB de productos chilenos reales que Caloru ya tiene, (2) scraping/API de precios de supermercados CL, (3) algoritmo de optimizacion nutricional con restriccion de presupuesto, (4) UX chilena que habla de "la feria del barrio", "el kilo de pechuga en Lider", "la quinoa en Unimarc".

### Por que un chileno lo amaria

Chile tiene una de las inflaciones alimentarias mas altas de la region en los ultimos anos. El chileno promedio NO abandona las apps de nutricion porque no le gustan — las abandona porque comer sano se siente caro e inalcanzable. "Como me cuido si no me alcanza" es la friccion mas grande.

Modo Feria resuelve exactamente eso: **demuestra que comer sano en Chile es posible con tu presupuesto real**. No con recetas gringas de salmon y aguacate, sino con lentejas, pollo, huevo, platano y arroz integral del Lider de tu barrio.

Ademas activa el orgullo local: "Caloru es la unica app que sabe lo que cuesta comer sano en Chile". Diferenciador de PR inmediato, eje de campana en TikTok y redes.

El mecanismo psicologico es doble:
1. **Reduccion de friccion cognitiva**: elimina la pregunta "que compro" y "cuanto me gasto".
2. **Logro economico medible**: "esta semana comiste saludable y gastaste $3.200 menos que la semana pasada" — un tipo de reward que Duolingo nunca podra replicar.

### Semanas de desarrollo estimadas

| Fase | Contenido | Semanas |
|------|-----------|---------|
| MVP | Algoritmo de optimizacion nutricional-economica con precios manuales ingresados por el usuario + plan semanal generado | 3-4 semanas |
| v1.0 | Scraping/integracion de precios de 2-3 supermercados CL (Jumbo, Lider, Unimarc via sus APIs publicas o scraping) + UI Modo Feria | 4-6 semanas adicionales |
| v1.5 | Comparador de "precio por gramo de proteina" entre productos + ranking comunidad Caloru + notificacion "oferta nutricional" | 3-4 semanas adicionales |

**Total estimado MVP funcional: 3-4 semanas. Feature completo: 10-14 semanas.**

---

## Por que esta es LA idea y no otra

Se evaluaron otras opciones:

- **Liga de barrio (Strava-style)**: fuerte psicologicamente, pero Caloru ya tiene "liga de amigos". Requiere masa critica de usuarios por zona geografica.
- **Integracion CGM**: tecnicamente potente, pero el hardware CGM no esta disponible masivamente en Chile y es caro.
- **Coach IA tipo Noom**: requiere equipo de psicologos/coaches, es costoso de escalar, Caloru ya tiene IA nutricional.

**Modo Feria gana porque**:
1. Resuelve el dolor #1 del chileno con la alimentacion saludable: el costo percibido.
2. Usa infraestructura que Caloru ya tiene (DB productos, plan semanal, IA).
3. No existe en ninguna app en espanol — ventana de 12-18 meses antes de que alguien lo copie.
4. Es un eje de comunicacion poderoso: "la unica app que sabe lo que vale comer sano en Chile".
5. MVP viable en 3-4 semanas con precio manual, sin necesidad de scraping para validar el concepto.

---

## Slogan de lanzamiento sugerido

> "Caloru Modo Feria: come sano, gasta inteligente."

o bien:

> "Por fin una app que sabe lo que cuesta el pollo en Chile."

---

*Investigacion basada en: analisis de mercado de apps de nutricion LATAM/global 2025-2026, mecanismos de retencion de Duolingo y Strava, estado de integracion CGM, y gaps detectados en apps con presupuesto nutricional.*
