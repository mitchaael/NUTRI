/**
 * Extrae emails de bios de Instagram y genera CSV para Google Sheets
 */
const fs = require('fs');

const FILE = process.argv[2];
if (!FILE) { console.error('Uso: node extract_emails.js <archivo.json>'); process.exit(1); }

const data  = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const EMAIL = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

const conEmail    = [];
const sinEmail    = [];

for (const p of data) {
  const bio     = p.biography || '';
  const emails  = bio.match(EMAIL) || [];
  const nombre  = p.fullName  || p.username;
  const usuario = p.username  || '';
  const url     = `https://www.instagram.com/${usuario}/`;
  const fuente  = 'Instagram';

  // Filtrar emails propios de Instagram/Meta
  const emailsLimpios = emails.filter(e =>
    !e.includes('instagram') && !e.includes('facebook') && !e.includes('example')
  );

  if (emailsLimpios.length > 0) {
    conEmail.push({ nombre, email: emailsLimpios[0], usuario, url, bio: bio.slice(0, 80) });
  } else {
    sinEmail.push({ nombre, usuario, url, bio: bio.slice(0, 80) });
  }
}

console.log(`\n📊 Perfiles analizados : ${data.length}`);
console.log(`✅ Con email en bio    : ${conEmail.length}`);
console.log(`📭 Sin email en bio    : ${sinEmail.length}\n`);

// CSV para Google Sheets (contactos con email → listos para el workflow)
const csvConEmail = [
  'nombre,email,ciudad,fuente,email_enviado,fecha_envio,estado,notas',
  ...conEmail.map(p =>
    `"${p.nombre}","${p.email}","","${p.fuente || 'Instagram'}","","","","@${p.usuario}"`
  )
].join('\n');
fs.writeFileSync('contactos_con_email.csv', csvConEmail, 'utf8');
console.log('✅ contactos_con_email.csv  → listo para subir a Google Sheets');

// CSV de los sin email (para outreach manual por Instagram)
const csvSinEmail = [
  'nombre,username,url_perfil,bio_preview',
  ...sinEmail.map(p =>
    `"${p.nombre}","${p.usuario}","${p.url}","${p.bio.replace(/"/g, "'")}"`
  )
].join('\n');
fs.writeFileSync('contactos_sin_email.csv', csvSinEmail, 'utf8');
console.log('📭 contactos_sin_email.csv  → para DM manual en Instagram\n');

// Preview emails encontrados
if (conEmail.length > 0) {
  console.log('--- Emails encontrados ---');
  conEmail.forEach(p => console.log(`  ${p.email.padEnd(35)} @${p.usuario}`));
}
