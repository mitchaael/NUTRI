// Genera una página estática por alimento (caloru.cl/calorias/<slug>/) + índice + sitemap.
// Lee la base de alimentos de App.jsx para que nunca se desincronice. Corre antes de `vite build`.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "..");
const OUT = path.join(ROOT, "public", "calorias");
const SITE = "https://caloru.cl";
const PLAY = "https://play.google.com/store/apps/details?id=cl.caloru.app&referrer=utm_source%3Dseo%26utm_medium%3Dcalorias";

const src = fs.readFileSync(path.join(ROOT, "App.jsx"), "utf8");
const body = src.match(/const DB_RAW = \[([\s\S]*?)\n\];/)[1];
const raw = new Function("return [" + body + "]")();

// Misma lógica que dedupeFoods en App.jsx: por nombre gana el id mayor
const byName = new Map();
for (const f of raw) {
  const k = f.nombre.trim().toLowerCase();
  const p = byName.get(k);
  if (!p || f.id > p.id) byName.set(k, f);
}
const foods = [...byName.values()].filter((f) => f.cat !== "Suplementos" && f.cal >= 0 && f.porcion > 0);

const deburr = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const slugify = (s) => deburr(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const r1 = (n) => (Math.round(n * 10) / 10).toLocaleString("es-CL");
const per100 = (v, f) => (typeof v === "number" ? (v * 100) / f.porcion : null);

const used = new Set();
for (const f of foods) {
  let s = slugify(f.nombre);
  if (used.has(s)) s = slugify(f.nombre + " " + f.marca);
  while (used.has(s)) s += "-" + f.id;
  used.add(s);
  f.slug = s;
}

const CSS = `*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;background:#faf7f2;color:#1c1c1e;line-height:1.55}
main{max-width:640px;margin:0 auto;padding:20px 16px 48px}a{color:#D42020}
header{display:flex;align-items:center;gap:10px;margin-bottom:18px}header a{font-weight:800;text-decoration:none;font-size:18px;color:#1c1c1e}
h1{font-size:26px;line-height:1.2;margin:6px 0 4px;letter-spacing:-.5px}.sub{color:#6b6b70;margin:0 0 18px}
.kcal{background:#fff;border-radius:18px;padding:18px;border:1px solid #ece6dc;display:flex;align-items:center;gap:14px;margin-bottom:14px}
.kcal b{font-size:40px;letter-spacing:-1px}.emoji{font-size:44px}
table{width:100%;border-collapse:collapse;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #ece6dc;margin-bottom:18px}
th,td{padding:10px 12px;text-align:left;border-bottom:1px solid #f0ebe3;font-size:14px}th{background:#f4efe7;font-size:12px;text-transform:uppercase;letter-spacing:.4px;color:#6b6b70}
td:not(:first-child),th:not(:first-child){text-align:right}
.cta{background:#D42020;color:#fff;border-radius:18px;padding:18px;margin:22px 0}.cta p{margin:0 0 12px}
.cta a{display:inline-block;background:#fff;color:#D42020;font-weight:800;text-decoration:none;padding:11px 16px;border-radius:12px;margin:0 6px 6px 0}
ul.rel{list-style:none;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:8px}ul.rel a{display:block;background:#fff;border:1px solid #ece6dc;border-radius:12px;padding:10px;text-decoration:none;color:#1c1c1e;font-size:13px}
footer{color:#8e8e93;font-size:12px;margin-top:28px}
@media (prefers-color-scheme:dark){body{background:#111;color:#f2f2f7}.kcal,table,ul.rel a{background:#1c1c1e;border-color:#2c2c2e}th{background:#232325;color:#a1a1a6}th,td{border-color:#2c2c2e}header a,ul.rel a{color:#f2f2f7}.sub{color:#a1a1a6}}`;

const head = (title, desc, url, extra = "") => `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}"><link rel="canonical" href="${url}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${SITE}/icon-512.png">
<link rel="icon" href="/favicon.ico"><style>${CSS}</style>${extra}</head><body><main>
<header><img src="/icon-192.png" width="34" height="34" alt="" style="border-radius:9px"><a href="/">Calorú</a></header>`;

const cta = `<div class="cta"><p><b>Registra esto en 10 segundos.</b> Calorú cuenta tus calorías y macros con productos chilenos reales, y con una foto de tu plato.</p>
<a href="${PLAY}">Descargar en Google Play</a><a href="/?utm_source=seo&utm_medium=calorias">Usar en la web</a></div>`;
const foot = `<footer>Valores aproximados por porción de referencia. No reemplaza la indicación de un profesional de la salud. © Calorú — Tu nutrición, a tu ritmo.</footer></main></body></html>`;

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const byCat = new Map();
for (const f of foods) { if (!byCat.has(f.cat)) byCat.set(f.cat, []); byCat.get(f.cat).push(f); }

for (const f of foods) {
  const url = `${SITE}/calorias/${f.slug}/`;
  const marca = f.marca && !["Natural", "Artesanal", "Genérico", "Generico"].includes(f.marca) ? ` ${f.marca}` : "";
  const nombreFull = f.nombre.includes(f.marca || "@@") ? f.nombre : f.nombre + marca;
  const title = `Calorías de ${nombreFull}: ${f.cal} kcal por porción | Calorú`;
  const desc = `${nombreFull} tiene ${f.cal} kcal por porción de ${f.porcion} g: ${r1(f.prot)} g de proteína, ${r1(f.carbs)} g de carbohidratos y ${r1(f.grasas)} g de grasa. Tabla nutricional completa.`;
  const rows = [
    ["Calorías", f.cal, "kcal"], ["Proteínas", f.prot, "g"], ["Carbohidratos", f.carbs, "g"], ["Grasas", f.grasas, "g"],
    ["Fibra", f.fibra, "g"], ["Azúcares", f.azucar, "g"], ["Sodio", f.sodio, "mg"],
  ].filter(([, v]) => typeof v === "number");
  const ld = { "@context": "https://schema.org", "@type": "NutritionInformation", name: nombreFull, servingSize: `${f.porcion} g`,
    calories: `${f.cal} kcal`, proteinContent: `${f.prot} g`, carbohydrateContent: `${f.carbs} g`, fatContent: `${f.grasas} g` };
  const rel = (byCat.get(f.cat) || []).filter((x) => x !== f).slice(0, 8);
  const html = head(title, desc, url, `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`) + `
<a href="/calorias/">← Todas las calorías</a> · ${esc(f.cat)}
<h1>Calorías de ${esc(nombreFull)}</h1><p class="sub">Porción de referencia: ${f.porcion} g</p>
<div class="kcal"><span class="emoji">${f.emoji || "🍽️"}</span><div><b>${f.cal}</b> kcal<br><span class="sub">por porción · ${r1(per100(f.cal, f))} kcal en 100 g</span></div></div>
<table><thead><tr><th>Nutriente</th><th>Porción (${f.porcion} g)</th><th>100 g</th></tr></thead><tbody>
${rows.map(([n, v, u]) => `<tr><td>${n}</td><td>${r1(v)} ${u}</td><td>${r1(per100(v, f))} ${u}</td></tr>`).join("\n")}
</tbody></table>
${cta}
${rel.length ? `<h2 style="font-size:18px">Más en ${esc(f.cat)}</h2><ul class="rel">${rel.map((x) => `<li><a href="/calorias/${x.slug}/">${x.emoji || ""} ${esc(x.nombre)} · ${x.cal} kcal</a></li>`).join("")}</ul>` : ""}
${foot}`;
  fs.mkdirSync(path.join(OUT, f.slug), { recursive: true });
  fs.writeFileSync(path.join(OUT, f.slug, "index.html"), html);
}

// Índice
const idx = head("Tabla de calorías de alimentos chilenos | Calorú",
  `Calorías y macros de ${foods.length} alimentos y productos chilenos: marraqueta, completo, empanada, cazuela, lácteos y más.`,
  `${SITE}/calorias/`) + `
<h1>Tabla de calorías de alimentos chilenos</h1><p class="sub">${foods.length} alimentos y productos de supermercados chilenos, con sus calorías y macros por porción.</p>
${cta}
${[...byCat.entries()].map(([cat, list]) => `<h2 style="font-size:18px">${esc(cat)}</h2><ul class="rel">${list.map((x) => `<li><a href="/calorias/${x.slug}/">${x.emoji || ""} ${esc(x.nombre)} · ${x.cal} kcal</a></li>`).join("")}</ul>`).join("\n")}
${foot}`;
fs.writeFileSync(path.join(OUT, "index.html"), idx);

// Sitemap + robots
const today = new Date().toISOString().slice(0, 10);
const urls = [`${SITE}/`, `${SITE}/calorias/`, ...foods.map((f) => `${SITE}/calorias/${f.slug}/`)];
fs.writeFileSync(path.join(ROOT, "public", "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync(path.join(ROOT, "public", "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`SEO: ${foods.length} páginas en public/calorias + sitemap.xml`);
