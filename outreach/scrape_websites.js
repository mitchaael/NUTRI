/**
 * Busca emails en sitios web de perfiles Instagram
 */
const https = require('https');
const http  = require('http');
const fs    = require('fs');

const FILE  = process.argv[2];
const data  = JSON.parse(fs.readFileSync(FILE, 'utf8'));

// Regex email estricto — excluye rutas de archivos CSS/JS
const EMAIL = /\b[a-zA-Z0-9._%+\-]{2,}@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,6}\b/g;
const FALSE_POSITIVES = [
  'instagram', 'facebook', 'example', 'sentry', 'wix', 'wordpress',
  '.png', '.jpg', '.svg', '.css', '.js', '@2x', 'noreply', 'support',
  'info@wix', 'test@', 'user@', 'email@', 'name@'
];

const SKIP_URLS = ['wa.me', 'whatsapp', 'calendly', 'instagram.com',
                   'facebook.com', 'forms.gle', 'setmore', 'encuadrado'];

function fetch(url, timeout = 8000, redirects = 3) {
  return new Promise((resolve) => {
    if (!url || redirects < 0) return resolve('');
    let mod;
    try {
      mod = url.startsWith('https') ? https : http;
    } catch { return resolve(''); }

    const req = mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let loc = res.headers.location;
        if (loc.startsWith('/')) {
          const base = new URL(url);
          loc = `${base.protocol}//${base.host}${loc}`;
        }
        return fetch(loc, timeout, redirects - 1).then(resolve);
      }
      let body = '';
      res.on('data', c => { if (body.length < 500000) body += c; });
      res.on('end', () => resolve(body));
    });
    req.on('error', () => resolve(''));
    req.setTimeout(timeout, () => { req.destroy(); resolve(''); });
  });
}

function extractEmails(html) {
  const raw = html.match(EMAIL) || [];
  return raw.filter(e => !FALSE_POSITIVES.some(fp => e.toLowerCase().includes(fp)));
}

(async () => {
  const toProcess = data.filter(p => {
    const url = p.externalUrl || '';
    return url && !SKIP_URLS.some(s => url.includes(s));
  });

  console.log(`\n🔍 Revisando ${toProcess.length} sitios web...\n`);

  const fromWeb = [];
  for (const p of toProcess) {
    const url = p.externalUrl;
    process.stdout.write(`  @${p.username.padEnd(32)} `);
    const html   = await fetch(url);
    const emails = extractEmails(html);
    if (emails.length) {
      console.log(`✅ ${emails[0]}`);
      fromWeb.push({ nombre: p.fullName || p.username, email: emails[0], usuario: p.username, fuente: 'Web' });
    } else {
      console.log('—');
    }
  }

  // Combinar con emails de bio
  const fromBio = [
    { nombre: 'Catalina Segovia | Nutricionista', email: 'nutricatasegovia@gmail.com', usuario: 'nutrirconcata',    fuente: 'Instagram bio' },
    { nombre: 'Nutricionista Evelin Calvio',       email: 'evelincalvio@gmail.com',     usuario: 'nta_evelincalvio', fuente: 'Instagram bio' },
  ];

  const todos = [...fromBio, ...fromWeb];

  console.log(`\n📧 Emails bio     : ${fromBio.length}`);
  console.log(`📧 Emails web     : ${fromWeb.length}`);
  console.log(`📧 TOTAL          : ${todos.length}\n`);

  const csv = [
    'nombre,email,ciudad,fuente,email_enviado,fecha_envio,estado,notas',
    ...todos.map(p => `"${p.nombre}","${p.email}","","${p.fuente}","","","","@${p.usuario}"`)
  ].join('\n');

  fs.writeFileSync('contactos_finales.csv', csv, 'utf8');
  console.log('✅ contactos_finales.csv guardado\n');
  todos.forEach(p => console.log(`  ${p.email.padEnd(40)} @${p.usuario}`));
})();
