/**
 * Extrae usernames únicos del JSON de Apify
 * → genera URLs de perfil para el segundo scrape
 */
const fs   = require('fs');
const path = require('path');

const INPUT  = process.argv[2];
const OUT_URLS = path.join(__dirname, 'instagram_profile_urls.txt');
const OUT_CSV  = path.join(__dirname, 'nutricionistas_instagram.csv');

if (!INPUT) {
  console.error('Uso: node extract_profiles.js <archivo.json>');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(INPUT, 'utf8'));

// Extraer pares únicos username → fullName
const seen = new Map();
for (const post of data) {
  if (post.ownerUsername && !seen.has(post.ownerUsername)) {
    seen.set(post.ownerUsername, post.ownerFullName || '');
  }
}

console.log(`\n📊 Posts analizados : ${data.length}`);
console.log(`👤 Perfiles únicos  : ${seen.size}\n`);

// Archivo de URLs para Apify (segundo scrape — Profile info)
const urls = [...seen.keys()].map(u => `https://www.instagram.com/${u}/`);
fs.writeFileSync(OUT_URLS, urls.join('\n'), 'utf8');
console.log(`✅ URLs guardadas en : ${OUT_URLS}`);

// CSV de preview
const csv = ['nombre,username,url_perfil'];
for (const [username, fullName] of seen) {
  csv.push(`"${fullName}","${username}","https://www.instagram.com/${username}/"`);
}
fs.writeFileSync(OUT_CSV, csv.join('\n'), 'utf8');
console.log(`✅ CSV guardado en  : ${OUT_CSV}`);

// Preview de los primeros 10
console.log('\n--- Muestra de perfiles encontrados ---');
let i = 0;
for (const [username, fullName] of seen) {
  console.log(`  @${username.padEnd(35)} ${fullName}`);
  if (++i >= 10) { console.log('  ...'); break; }
}
