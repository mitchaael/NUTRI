/**
 * Calorú — One-Pager Nutricionistas v3
 * Fixes: rgba() → opacity pattern, ∞ → 10, steps height, texto mejorado
 */
const PDFDocument = require('pdfkit');
const fs          = require('fs');
const path        = require('path');

const C = {
  red:        '#D42020',
  dark:       '#111111',
  charcoal:   '#1E1E1E',
  cream:      '#F6F2EE',
  warmBorder: '#E4DDD6',
  textMain:   '#111111',
  textBody:   '#3D3D3D',
  textMuted:  '#888888',
  white:      '#FFFFFF',
  green:      '#1C6E3A',
};

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 0, bottom: 0, left: 0, right: 0 },
  info: {
    Title:   'Calorú — Plan Nutricionista',
    Author:  'Calorú · caloru.cl',
    Subject: 'Herramienta profesional para nutricionistas chilenos',
  },
  compress: true,
});

const OUT  = path.join(__dirname, 'caloru_nutricionistas_v3.pdf');
doc.pipe(fs.createWriteStream(OUT));

const W    = doc.page.width;   // 595.28
const H    = doc.page.height;  // 841.89
const PL   = 44;
const PR   = 44;
const CW   = W - PL - PR;
const LOGO = path.join(__dirname, '..', 'public', 'icon-512.png');

// ─── HELPERS ────────────────────────────────────────────────────────────────

// Dibuja forma semitransparente SIN rgba() (que no funciona en pdfkit)
function ghost(shape, color, opacity, stroke = false) {
  doc.save();
  doc.opacity(opacity);
  if (stroke) doc[shape[0]](...shape[1]).lineWidth(stroke).stroke(color);
  else        doc[shape[0]](...shape[1]).fill(color);
  doc.restore();
}

function clipped(x, y, w, h, fn) {
  doc.save();
  doc.rect(x, y, w, h).clip();
  fn();
  doc.restore();
}

function sectionLabel(text, x, y, color = C.textMuted) {
  doc.fillColor(color).font('Helvetica-Bold').fontSize(7.5)
     .text(text, x, y, { characterSpacing: 2 });
  doc.rect(x, y + 12, text.length * 4.2, 2).fill(C.red);
}

// ════════════════════════════════════════════════════════════════════════════
// LAYOUT — alturas de cada sección
//   Header:   0   → 132
//   Stats:    132 → 216
//   Prob/Sol: 216 → 322
//   Steps:    322 → 456   ← más alto para que quepan las descripciones
//   Features: 456 → 558
//   Pricing:  558 → 662
//   Trust:    662 → 724
//   Footer:   724 → 841.89
// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
// 1 — HEADER  (0 → 132)
// ════════════════════════════════════════════════════════════════════════════
{
  const H1 = 132;
  doc.rect(0, 0, W, H1).fill(C.red);

  // Círculos decorativos — opacity con save/restore, NO rgba()
  clipped(0, 0, W, H1, () => {
    ghost(['circle', [W + 8,   -8,  130]], C.white, 0.07);
    ghost(['circle', [W - 35,  H1 - 5, 80]],  C.white, 0.05);
    ghost(['circle', [W - 100, H1 + 20, 110]], C.white, 0.04);
    ghost(['circle', [-18,     H1 + 10,  60]], C.white, 0.05);
  });

  // ── Ícono: app icon clipeado a rounded-rect (sin contenedor blanco) ───────
  const IS = 72, IR = 16, lx = PL, ly = 18;
  ghost(['roundedRect', [lx + 3, ly + 4, IS, IS, IR]], C.dark, 0.20);   // sombra
  doc.save();
  doc.roundedRect(lx, ly, IS, IS, IR).clip();
  try { doc.image(LOGO, lx, ly, { width: IS, height: IS }); } catch(e) {}
  doc.restore();
  // Borde blanco fino — stroke con opacity, no rgba
  ghost(['roundedRect', [lx, ly, IS, IS, IR]], C.white, 0.30, 1.5);

  // ── Nombre + tagline ──────────────────────────────────────────────────────
  const TX = lx + IS + 16;
  doc.fillColor(C.white).font('Helvetica-Bold').fontSize(32).text('Calorú', TX, ly + 10);
  doc.save();
  doc.opacity(0.72);
  doc.fillColor(C.white).font('Helvetica').fontSize(10.5)
     .text('Tu nutrición, a tu ritmo  ·  caloru.cl', TX, ly + 46);
  doc.restore();

  // ── Badges derecha ─────────────────────────────────────────────────────────
  const bW = 148, bX = W - PR - bW;

  // Badge "PLAN NUTRICIONISTA" — fondo semitransparente con opacity, texto después
  ghost(['roundedRect', [bX, 22, bW, 28, 14]], C.white, 0.18);
  doc.fillColor(C.white).font('Helvetica-Bold').fontSize(8.5)
     .text('PLAN NUTRICIONISTA', bX, 32, { width: bW, align: 'center', characterSpacing: 0.9 });

  // Badge "Hecho en Chile" — fondo oscuro semitransparente
  ghost(['roundedRect', [bX + 18, 58, bW - 36, 22, 11]], C.dark, 0.30);
  doc.save();
  doc.opacity(0.88);
  doc.fillColor(C.white).font('Helvetica').fontSize(8.5)
     .text('Hecho en Chile  🇨🇱', bX + 18, 65, { width: bW - 36, align: 'center' });
  doc.restore();

  // ── Línea divisoria + claim ───────────────────────────────────────────────
  ghost(['rect', [PL, 96, CW, 0.75]], C.white, 0.25);
  doc.fillColor(C.white).font('Helvetica-Bold').fontSize(14.5)
     .text('Tus pacientes, más comprometidos entre consultas.', PL, 104, {
       width: CW - 60, lineGap: 2,
     });
}

// ════════════════════════════════════════════════════════════════════════════
// 2 — KPI STATS  (132 → 216)
// ════════════════════════════════════════════════════════════════════════════
{
  const Y = 132, SH = 84;
  doc.rect(0, Y, W, SH).fill(C.white);
  doc.rect(0, Y, W, 1).fill(C.warmBorder);

  const stats = [
    { n: '400+',   unit: '',     l1: 'productos chilenos',    l2: 'en base de datos',      color: C.red   },
    { n: '$9.990', unit: '/mes', l1: 'Plan Nutricionista',    l2: 'precio fijo mensual',   color: C.dark  },
    { n: '10',     unit: '',     l1: 'pacientes por plan',    l2: 'acceso Pro para c/uno', color: C.green },
  ];

  const sW = CW / 3;
  stats.forEach((s, i) => {
    const x  = PL + i * sW;
    const cx = x + sW / 2;

    // Divisor vertical
    if (i > 0) ghost(['rect', [x, Y + 18, 1, SH - 36]], C.textMuted, 0.15);

    // Número grande
    doc.fillColor(s.color).font('Helvetica-Bold').fontSize(26)
       .text(s.n, x, Y + 14, { width: sW, align: 'center' });

    // "/mes" extra (solo segundo stat)
    if (s.unit) {
      const nW = doc.widthOfString(s.n, { fontSize: 26 });
      doc.fillColor(C.textMuted).font('Helvetica').fontSize(11)
         .text(s.unit, cx + nW / 2 - 2, Y + 24);
    }

    doc.fillColor(C.textMain).font('Helvetica-Bold').fontSize(8.5)
       .text(s.l1, x, Y + 50, { width: sW, align: 'center' });
    doc.fillColor(C.textMuted).font('Helvetica').fontSize(7.5)
       .text(s.l2, x, Y + 62, { width: sW, align: 'center' });
  });

  doc.rect(0, Y + SH - 1, W, 1).fill(C.warmBorder);
}

// ════════════════════════════════════════════════════════════════════════════
// 3 — EL PROBLEMA / LA SOLUCIÓN  (216 → 322)
// ════════════════════════════════════════════════════════════════════════════
{
  const Y = 216, SH = 106, GAP = 10, colW = (CW - GAP) / 2;
  doc.rect(0, Y, W, SH).fill(C.cream);

  // Columna izquierda
  const lx = PL;
  doc.roundedRect(lx, Y + 12, colW, SH - 24, 8).fill(C.white);
  doc.roundedRect(lx, Y + 12, 3, SH - 24, 2).fill(C.red);

  doc.fillColor(C.red).font('Helvetica-Bold').fontSize(7.5)
     .text('EL PROBLEMA', lx + 14, Y + 24, { characterSpacing: 1.8 });
  doc.fillColor(C.textBody).font('Helvetica').fontSize(9.2)
     .text(
       'Tus pacientes llegan al control sin registro, sin memoria y sin datos.\n\n' +
       'El seguimiento depende de lo que recuerdan — y todos sabemos cómo termina eso.',
       lx + 14, Y + 38, { width: colW - 28, lineGap: 2.5 }
     );

  // Columna derecha
  const rx = PL + colW + GAP;
  doc.roundedRect(rx, Y + 12, colW, SH - 24, 8).fill(C.white);
  doc.roundedRect(rx, Y + 12, 3, SH - 24, 2).fill(C.green);

  doc.fillColor(C.green).font('Helvetica-Bold').fontSize(7.5)
     .text('LA SOLUCIÓN', rx + 14, Y + 24, { characterSpacing: 1.8 });
  doc.fillColor(C.textBody).font('Helvetica').fontSize(9.2)
     .text(
       'Calorú tiene 400+ productos chilenos reales: pan Ideal, yogur Colun, sopaipillas, chorrillana y todo lo que tus pacientes realmente comen.\n\n' +
       'Registro simple, diario y honesto.',
       rx + 14, Y + 38, { width: colW - 28, lineGap: 2.5 }
     );
}

// ════════════════════════════════════════════════════════════════════════════
// 4 — CÓMO FUNCIONA  (322 → 456)   h=134
// ════════════════════════════════════════════════════════════════════════════
{
  const Y = 322, SH = 134;
  doc.rect(0, Y, W, SH).fill(C.white);
  doc.rect(0, Y, W, 1).fill(C.warmBorder);

  sectionLabel('Cómo funciona', PL, Y + 12);

  // Círculos a Y+68 (centro), deja ~54px debajo para título+desc
  const circY = Y + 68, circR = 18;
  const cx1 = PL + CW / 6,
        cx2 = PL + CW / 2,
        cx3 = PL + CW * 5 / 6;

  // Líneas punteadas conectoras
  doc.save();
  doc.opacity(0.30);
  [[cx1, cx2], [cx2, cx3]].forEach(([a, b]) => {
    doc.moveTo(a + circR + 4, circY)
       .lineTo(b - circR - 4, circY)
       .dash(3, { space: 4 })
       .lineWidth(1.5)
       .stroke(C.red);
  });
  doc.restore();

  const steps = [
    { n:'1', cx: cx1, title:'Te registras',       desc:'Ingresa a caloru.cl, crea tu\ncuenta y activa el plan.' },
    { n:'2', cx: cx2, title:'Vinculas pacientes',  desc:'Comparte tu código. Cada\npaciente recibe Pro al instante.' },
    { n:'3', cx: cx3, title:'Revisas sus datos',   desc:'Calorías, macros y hábitos\nreales antes de cada control.' },
  ];

  steps.forEach(({ n, cx, title, desc }) => {
    const colW3 = CW / 3;
    const colX  = cx - colW3 / 2;

    // Sombra círculo
    ghost(['circle', [cx + 2, circY + 2, circR]], C.dark, 0.08);
    // Círculo
    doc.circle(cx, circY, circR).fill(C.red);
    // Número
    doc.fillColor(C.white).font('Helvetica-Bold').fontSize(15)
       .text(n, cx - circR, circY - 9, { width: circR * 2, align: 'center' });

    // Título
    doc.fillColor(C.textMain).font('Helvetica-Bold').fontSize(9.5)
       .text(title, colX, circY + 26, { width: colW3, align: 'center' });

    // Descripción — text con \n explícito, ancho ajustado para que quepa
    doc.fillColor(C.textMuted).font('Helvetica').fontSize(8)
       .text(desc, colX + 8, circY + 42, {
         width: colW3 - 16, align: 'center', lineGap: 2,
       });
  });
}

// ════════════════════════════════════════════════════════════════════════════
// 5 — LO QUE VE EL PACIENTE  (456 → 558)
// ════════════════════════════════════════════════════════════════════════════
{
  const Y = 456, SH = 102;
  doc.rect(0, Y, W, SH).fill(C.cream);
  doc.rect(0, Y, W, 1).fill(C.warmBorder);

  sectionLabel('Lo que ve tu paciente en la app', PL, Y + 12);

  const feats = [
    { icon: '📋', title: 'Registro diario',      desc: 'Alimentos chilenos reales, comida por comida' },
    { icon: '🔥', title: 'Racha de hábitos',     desc: 'Constancia visible, no solo números' },
    { icon: '📊', title: 'Macros y calorías',    desc: 'Por comida y totales del día, en tiempo real' },
    { icon: '📅', title: 'Historial completo',   desc: 'Disponible para que lo revises antes del control' },
  ];

  const fw = (CW - 10) / 2, fh = 28;
  feats.forEach((f, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const fx  = PL + col * (fw + 10);
    const fy  = Y + 32 + row * (fh + 7);

    doc.roundedRect(fx, fy, fw, fh, 5).fill(C.white);
    doc.roundedRect(fx, fy, fw, fh, 5).lineWidth(0.5).stroke(C.warmBorder);

    doc.roundedRect(fx + 6, fy + 5, 18, 18, 4).fill('#FDECEA');
    doc.fontSize(10).text(f.icon, fx + 7, fy + 7);

    doc.fillColor(C.textMain).font('Helvetica-Bold').fontSize(8.5)
       .text(f.title, fx + 30, fy + 5, { width: fw - 36 });
    doc.fillColor(C.textMuted).font('Helvetica').fontSize(7.5)
       .text(f.desc, fx + 30, fy + 16, { width: fw - 36 });
  });
}

// ════════════════════════════════════════════════════════════════════════════
// 6 — PRECIO  (558 → 662)
// ════════════════════════════════════════════════════════════════════════════
{
  const Y = 558, SH = 104;
  doc.rect(0, Y, W, SH).fill(C.charcoal);
  doc.rect(0, Y, W, 3).fill(C.red);   // borde superior rojo

  // Precio
  doc.fillColor(C.red).font('Helvetica-Bold').fontSize(8)
     .text('PLAN NUTRICIONISTA', PL, Y + 16, { characterSpacing: 1.8 });
  doc.fillColor(C.white).font('Helvetica-Bold').fontSize(40)
     .text('$9.990', PL, Y + 28);
  doc.fillColor('#777777').font('Helvetica').fontSize(11)
     .text('/mes — hasta 10 pacientes incluidos', PL, Y + 74);

  // Checklist derecha
  const rx = PL + CW * 0.52;
  const items = [
    '10 pacientes con acceso Pro incluido',
    'Activación automática por código',
    'Historial y macros en tiempo real',
    'Reembolsable Isapre / Fonasa',
  ];
  items.forEach((item, i) => {
    const iy = Y + 18 + i * 21;
    doc.circle(rx + 8, iy + 6, 7).fill(C.red);
    doc.fillColor(C.white).font('Helvetica-Bold').fontSize(8).text('✓', rx + 4, iy + 2);
    doc.fillColor('#CCCCCC').font('Helvetica').fontSize(9)
       .text(item, rx + 22, iy + 1, { width: CW - (rx - PL) - 10 });
  });
}

// ════════════════════════════════════════════════════════════════════════════
// 7 — CONFIANZA  (662 → 724)
// ════════════════════════════════════════════════════════════════════════════
{
  const Y = 662, SH = 62;
  doc.rect(0, Y, W, SH).fill(C.white);
  doc.rect(0, Y, W, 1).fill(C.warmBorder);

  // Mini logo
  try {
    const ms = 36, mr = 8;
    ghost(['roundedRect', [PL + 2, Y + 15, ms, ms, mr]], C.dark, 0.08);
    doc.save();
    doc.roundedRect(PL, Y + 13, ms, ms, mr).clip();
    doc.image(LOGO, PL, Y + 13, { width: ms, height: ms });
    doc.restore();
    ghost(['roundedRect', [PL, Y + 13, ms, ms, mr]], C.warmBorder, 0.8, 0.75);
  } catch(e) {}

  doc.fillColor(C.textMain).font('Helvetica-Bold').fontSize(10)
     .text('App chilena, para la realidad chilena.', PL + 50, Y + 16);
  doc.fillColor(C.textMuted).font('Helvetica').fontSize(8.8)
     .text(
       'No somos MyFitnessPal con productos gringos. Somos una herramienta pensada para lo que tus pacientes realmente ponen en el plato día a día.',
       PL + 50, Y + 31, { width: CW - 58, lineGap: 1.8 }
     );
}

// ════════════════════════════════════════════════════════════════════════════
// 8 — FOOTER CTA  (724 → 841)
// ════════════════════════════════════════════════════════════════════════════
{
  const Y = 724, SH = H - 724;
  doc.rect(0, Y, W, SH).fill(C.red);

  // Círculos decorativos con opacity correcta
  clipped(0, Y, W, SH, () => {
    ghost(['circle', [-30,    Y + SH,       100]], C.white, 0.06);
    ghost(['circle', [W + 20, Y + 10,        90]], C.white, 0.05);
    ghost(['circle', [W / 2,  Y - 20,       120]], C.dark,  0.04);
  });

  doc.save();
  doc.opacity(0.65);
  doc.fillColor(C.white).font('Helvetica').fontSize(12)
     .text('Empieza hoy en', PL, Y + 18, { width: CW, align: 'center' });
  doc.restore();

  doc.fillColor(C.white).font('Helvetica-Bold').fontSize(34)
     .text('caloru.cl', PL, Y + 34, { width: CW, align: 'center', characterSpacing: 0.5 });

  // Línea decorativa bajo el dominio
  const urlW = doc.widthOfString('caloru.cl', { fontSize: 34, characterSpacing: 0.5 });
  ghost(['rect', [(W - urlW) / 2, Y + 76, urlW, 2]], C.white, 0.35);

  doc.save();
  doc.opacity(0.55);
  doc.fillColor(C.white).font('Helvetica').fontSize(9)
     .text('¿Preguntas? caloruapp@gmail.com', PL, Y + 88, { width: CW, align: 'center' });
  doc.restore();

  doc.save();
  doc.opacity(0.35);
  doc.fillColor(C.white).font('Helvetica').fontSize(7.5)
     .text('Calorú · Tu nutrición, a tu ritmo', PL, Y + 104, {
       width: CW, align: 'center', characterSpacing: 0.5,
     });
  doc.restore();
}

doc.end();
console.log('✅  PDF v3 listo:', OUT);
