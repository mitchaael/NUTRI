/**
 * Calorú — Carrusel Instagram / TikTok · Plan Nutricionistas
 * Genera 8 slides PNG (1080×1350, 4:5) renderizadas con Chrome headless.
 * Reutiliza la identidad visual del one-pager v3.
 */
const fs   = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTDIR = __dirname;
const TMPDIR = path.join(__dirname, '.tmp');
const LOGO   = path.join(__dirname, '..', '..', 'public', 'icon-512.png');

if (!fs.existsSync(TMPDIR)) fs.mkdirSync(TMPDIR, { recursive: true });

const logoB64 = 'data:image/png;base64,' + fs.readFileSync(LOGO).toString('base64');

// ─── Paleta de marca ──────────────────────────────────────────────────────────
const C = {
  red: '#D42020', redDark: '#B01818', dark: '#111111', charcoal: '#1A1A1A',
  cream: '#F6F2EE', border: '#E4DDD6', textMain: '#111111', textBody: '#3D3D3D',
  muted: '#8A8378', white: '#FFFFFF', green: '#1C6E3A', greenSoft: '#E8F2EC',
  redSoft: '#FDECEA',
};

const FONT = `'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif`;

// Círculos decorativos blancos para fondos rojos
const circles = (color = 'rgba(255,255,255,.07)') => `
  <div style="position:absolute;width:340px;height:340px;border-radius:50%;background:${color};top:-120px;right:-100px;"></div>
  <div style="position:absolute;width:200px;height:200px;border-radius:50%;background:${color};bottom:-60px;left:-70px;"></div>
  <div style="position:absolute;width:160px;height:160px;border-radius:50%;background:rgba(0,0,0,.05);bottom:160px;right:-50px;"></div>`;

const logoChip = (size = 88, radius = 22) => `
  <div style="width:${size}px;height:${size}px;border-radius:${radius}px;overflow:hidden;
    box-shadow:0 10px 30px rgba(0,0,0,.25);flex:none;border:2px solid rgba(255,255,255,.35);">
    <img src="${logoB64}" style="width:100%;height:100%;display:block;"/>
  </div>`;

const kicker = (text, color) => `
  <div style="font-size:24px;font-weight:800;letter-spacing:4px;color:${color};text-transform:uppercase;">
    ${text}<div style="height:5px;width:64px;background:${color};border-radius:3px;margin-top:14px;"></div>
  </div>`;

const pageDots = (active, color = 'rgba(255,255,255,.9)', dim = 'rgba(255,255,255,.3)') => {
  let d = '';
  for (let i = 1; i <= 8; i++)
    d += `<div style="width:${i === active ? 30 : 9}px;height:9px;border-radius:5px;background:${i === active ? color : dim};"></div>`;
  return `<div style="display:flex;gap:7px;align-items:center;">${d}</div>`;
};

// ─── Definición de cada slide ──────────────────────────────────────────────────
const slides = [];

// 1 — PORTADA (gancho)
slides.push({ bg: C.red, color: C.white, html: `
  ${circles()}
  <div style="position:relative;height:100%;display:flex;flex-direction:column;padding:80px 80px 70px;box-sizing:border-box;">
    <div style="display:flex;align-items:center;gap:24px;">
      ${logoChip(80, 20)}
      <div>
        <div style="font-size:40px;font-weight:800;line-height:1;">Calorú</div>
        <div style="font-size:19px;opacity:.8;margin-top:6px;">Tu nutrición, a tu ritmo · caloru.cl</div>
      </div>
    </div>

    <div style="margin-top:auto;">
      <div style="display:inline-block;background:rgba(255,255,255,.16);border:1.5px solid rgba(255,255,255,.35);
        padding:12px 24px;border-radius:30px;font-size:21px;font-weight:700;letter-spacing:2px;margin-bottom:34px;">
        🩺 PARA NUTRICIONISTAS</div>
      <div style="font-size:72px;font-weight:800;line-height:1.06;letter-spacing:-1.5px;">
        Tus pacientes llegan al control <span style="background:rgba(0,0,0,.22);padding:0 10px;border-radius:10px;">sin datos</span>.</div>
      <div style="font-size:30px;opacity:.9;margin-top:30px;line-height:1.4;font-weight:400;">
        Sin registro. Sin memoria.<br/>Solo lo que creen recordar.</div>
    </div>

    <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;">
      ${pageDots(1)}
      <div style="font-size:26px;font-weight:700;display:flex;align-items:center;gap:10px;">Desliza <span style="font-size:34px;">→</span></div>
    </div>
  </div>`});

// 2 — EL PROBLEMA
slides.push({ bg: C.cream, color: C.textMain, html: `
  <div style="height:100%;display:flex;flex-direction:column;padding:90px 80px;box-sizing:border-box;">
    ${kicker('El problema', C.red)}
    <div style="margin-top:60px;">
      <div style="font-size:66px;font-weight:800;line-height:1.1;letter-spacing:-1px;color:${C.textMain};">
        El seguimiento depende de lo que <span style="color:${C.red};">recuerdan</span>.</div>
      <div style="font-size:34px;color:${C.textBody};margin-top:36px;line-height:1.45;">
        Y todos sabemos cómo termina eso: pacientes que adivinan porciones, olvidan colaciones y llegan a la consulta sin nada concreto que revisar.</div>
    </div>

    <div style="margin-top:54px;background:${C.white};border:1.5px solid ${C.border};border-left:7px solid ${C.red};
      border-radius:18px;padding:34px 38px;display:flex;gap:24px;align-items:center;">
      <div style="font-size:54px;">🤷</div>
      <div style="font-size:29px;color:${C.textBody};line-height:1.4;">
        <b style="color:${C.textMain};">"Comí más o menos sano"</b> no es un dato. Es una corazonada.</div>
    </div>

    <div style="margin-top:auto;">${pageDots(2, C.red, '#D9D1C7')}</div>
  </div>`});

// 3 — LA SOLUCIÓN
slides.push({ bg: C.white, color: C.textMain, html: `
  <div style="height:100%;display:flex;flex-direction:column;padding:90px 80px;box-sizing:border-box;">
    ${kicker('La solución', C.green)}
    <div style="margin-top:54px;">
      <div style="font-size:120px;font-weight:800;line-height:.9;color:${C.red};letter-spacing:-3px;">400+</div>
      <div style="font-size:46px;font-weight:800;margin-top:8px;letter-spacing:-.5px;">productos chilenos reales</div>
      <div style="font-size:30px;color:${C.textBody};margin-top:22px;line-height:1.4;">
        Lo que tus pacientes realmente ponen en el plato — no equivalencias inventadas.</div>
    </div>

    <div style="margin-top:46px;display:flex;flex-wrap:wrap;gap:16px;">
      ${['🍞 Pan Ideal','🥛 Yogur Colun','🧑‍🍳 Sopaipillas','🍟 Chorrillana','🌭 Completo','🥖 Marraqueta','🧀 Quesillo','🫘 Porotos']
        .map(t => `<div style="background:${C.cream};border:1.5px solid ${C.border};padding:16px 26px;border-radius:40px;font-size:27px;font-weight:600;">${t}</div>`).join('')}
    </div>

    <div style="margin-top:auto;font-size:32px;font-weight:700;color:${C.green};">
      Registro simple, diario y honesto. ✅</div>
    <div style="margin-top:34px;">${pageDots(3, C.red, '#E4DDD6')}</div>
  </div>`});

// 4 — LO QUE VE EL PACIENTE
const feats = [
  { i:'📋', t:'Registro diario', d:'Alimentos chilenos reales, comida por comida' },
  { i:'🔥', t:'Racha de hábitos', d:'Constancia visible, no solo números' },
  { i:'📊', t:'Macros y calorías', d:'Por comida y totales del día, en tiempo real' },
  { i:'📅', t:'Historial completo', d:'Listo para que lo revises antes del control' },
];
slides.push({ bg: C.cream, color: C.textMain, html: `
  <div style="height:100%;display:flex;flex-direction:column;padding:90px 80px;box-sizing:border-box;">
    ${kicker('Lo que ve tu paciente', C.red)}
    <div style="font-size:50px;font-weight:800;margin-top:34px;line-height:1.1;letter-spacing:-.5px;">
      Una app que sí van a usar todos los días.</div>
    <div style="margin-top:48px;display:flex;flex-direction:column;gap:22px;">
      ${feats.map(f => `
      <div style="background:${C.white};border:1.5px solid ${C.border};border-radius:20px;padding:30px 34px;display:flex;gap:26px;align-items:center;">
        <div style="width:78px;height:78px;border-radius:18px;background:${C.redSoft};display:flex;align-items:center;justify-content:center;font-size:40px;flex:none;">${f.i}</div>
        <div>
          <div style="font-size:33px;font-weight:800;color:${C.textMain};">${f.t}</div>
          <div style="font-size:26px;color:${C.muted};margin-top:6px;">${f.d}</div>
        </div>
      </div>`).join('')}
    </div>
    <div style="margin-top:auto;padding-top:30px;">${pageDots(4, C.red, '#D9D1C7')}</div>
  </div>`});

// 5 — CÓMO FUNCIONA
const steps = [
  { n:'1', t:'Te registras', d:'Entra a caloru.cl, crea tu cuenta y activa el plan.' },
  { n:'2', t:'Vinculas pacientes', d:'Comparte tu código. Cada paciente recibe Pro al instante.' },
  { n:'3', t:'Revisas sus datos', d:'Calorías, macros y hábitos reales antes de cada control.' },
];
slides.push({ bg: C.white, color: C.textMain, html: `
  <div style="height:100%;display:flex;flex-direction:column;padding:90px 80px;box-sizing:border-box;">
    ${kicker('Cómo funciona', C.red)}
    <div style="font-size:52px;font-weight:800;margin-top:34px;letter-spacing:-.5px;">En 3 pasos. Sin fricción.</div>
    <div style="margin-top:56px;display:flex;flex-direction:column;gap:40px;">
      ${steps.map((s, idx) => `
      <div style="display:flex;gap:34px;align-items:flex-start;">
        <div style="width:90px;height:90px;border-radius:50%;background:${C.red};color:#fff;font-size:46px;font-weight:800;
          display:flex;align-items:center;justify-content:center;flex:none;box-shadow:0 8px 20px rgba(212,32,32,.3);">${s.n}</div>
        <div style="padding-top:6px;">
          <div style="font-size:37px;font-weight:800;color:${C.textMain};">${s.t}</div>
          <div style="font-size:28px;color:${C.textBody};margin-top:8px;line-height:1.4;">${s.d}</div>
        </div>
      </div>`).join('')}
    </div>
    <div style="margin-top:auto;padding-top:30px;">${pageDots(5, C.red, '#E4DDD6')}</div>
  </div>`});

// 6 — EL PLAN / PRECIO
slides.push({ bg: C.charcoal, color: C.white, html: `
  <div style="position:absolute;top:0;left:0;width:100%;height:8px;background:${C.red};"></div>
  <div style="height:100%;display:flex;flex-direction:column;padding:90px 80px;box-sizing:border-box;">
    <div style="font-size:24px;font-weight:800;letter-spacing:4px;color:${C.red};text-transform:uppercase;">Plan Nutricionista</div>
    <div style="display:flex;align-items:baseline;gap:10px;margin-top:24px;">
      <div style="font-size:150px;font-weight:800;line-height:.9;letter-spacing:-4px;">$9.990</div>
      <div style="font-size:40px;color:#888;font-weight:600;">/mes</div>
    </div>
    <div style="font-size:30px;color:#AAA;margin-top:10px;">Precio fijo · hasta 10 pacientes incluidos</div>

    <div style="margin-top:54px;display:flex;flex-direction:column;gap:26px;">
      ${['10 pacientes con acceso Pro incluido','Activación automática por código','Historial y macros en tiempo real','Reembolsable Isapre / Fonasa']
        .map((t,i) => `
        <div style="display:flex;gap:22px;align-items:center;">
          <div style="width:48px;height:48px;border-radius:50%;background:${C.red};color:#fff;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;flex:none;">✓</div>
          <div style="font-size:31px;color:#EDEDED;${i===3?'font-weight:800;color:#fff;':''}">${t}</div>
        </div>`).join('')}
    </div>
    <div style="margin-top:auto;padding-top:30px;">${pageDots(6)}</div>
  </div>`});

// 7 — DIFERENCIADOR
slides.push({ bg: C.red, color: C.white, html: `
  ${circles()}
  <div style="position:relative;height:100%;display:flex;flex-direction:column;justify-content:center;padding:90px 80px;box-sizing:border-box;">
    <div style="font-size:130px;line-height:1;">🇨🇱</div>
    <div style="font-size:70px;font-weight:800;line-height:1.08;letter-spacing:-1.5px;margin-top:30px;">
      App chilena, para la realidad chilena.</div>
    <div style="font-size:34px;opacity:.92;margin-top:34px;line-height:1.45;">
      No somos MyFitnessPal con productos gringos. Somos la herramienta pensada para lo que tus pacientes comen de verdad, día a día.</div>
    <div style="position:absolute;bottom:90px;left:80px;">${pageDots(7)}</div>
  </div>`});

// 8 — CTA FINAL
slides.push({ bg: C.red, color: C.white, html: `
  ${circles()}
  <div style="position:relative;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:80px;box-sizing:border-box;">
    ${logoChip(110, 26)}
    <div style="font-size:30px;opacity:.85;margin-top:40px;">Empieza hoy en</div>
    <div style="font-size:104px;font-weight:800;letter-spacing:-2px;margin-top:6px;">caloru.cl</div>
    <div style="height:4px;width:300px;background:rgba(255,255,255,.4);border-radius:3px;margin-top:18px;"></div>
    <div style="margin-top:40px;display:inline-block;background:rgba(0,0,0,.2);padding:16px 34px;border-radius:40px;font-size:28px;font-weight:700;">
      Plan Nutricionista · $9.990/mes</div>
    <div style="font-size:25px;opacity:.8;margin-top:46px;">¿Preguntas? caloruapp@gmail.com</div>
    <div style="position:absolute;bottom:80px;">${pageDots(8)}</div>
  </div>`});

// ─── Plantilla + render ─────────────────────────────────────────────────────────
function page(slide) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    *{margin:0;padding:0;box-sizing:border-box;}
    html,body{width:1080px;height:1350px;}
    body{font-family:${FONT};-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;}
    .slide{position:relative;width:1080px;height:1350px;overflow:hidden;background:${slide.bg};color:${slide.color};}
  </style></head><body><div class="slide">${slide.html}</div></body></html>`;
}

console.log('Generando carrusel Calorú — Plan Nutricionistas\n');
slides.forEach((slide, i) => {
  const n     = String(i + 1).padStart(2, '0');
  const htmlF = path.join(TMPDIR, `slide_${n}.html`);
  const outF  = path.join(OUTDIR, `caloru_carrusel_${n}.png`);
  fs.writeFileSync(htmlF, page(slide));
  execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars',
    '--force-device-scale-factor=2',
    '--window-size=1080,1350',
    '--default-background-color=00000000',
    `--screenshot=${outF}`,
    '--virtual-time-budget=1500',
    'file:///' + htmlF.replace(/\\/g, '/'),
  ], { stdio: 'ignore' });
  console.log(`  ✅ slide ${n}  →  caloru_carrusel_${n}.png`);
});

fs.rmSync(TMPDIR, { recursive: true, force: true });
console.log('\n🎉 Listo. 8 slides en outreach/carrusel/ (2160×2700 @2x)');
