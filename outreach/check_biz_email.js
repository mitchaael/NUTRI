const data = JSON.parse(require('fs').readFileSync(process.argv[2], 'utf8'));

// Ver todos los campos disponibles
const allKeys = new Set();
data.forEach(p => Object.keys(p).forEach(k => allKeys.add(k)));
console.log('Todos los campos:', [...allKeys].join(', '));

// Business accounts
const bizCount = data.filter(p => p.isBusinessAccount).length;
console.log('\nBusiness accounts:', bizCount, '/', data.length);

// Buscar cualquier campo con email
const emailFields = [...allKeys].filter(k => k.toLowerCase().includes('email') || k.toLowerCase().includes('contact'));
console.log('Campos con "email/contact":', emailFields);

// Revisar externalUrl para emails
console.log('\n--- External URLs ---');
data.forEach(p => {
  if (p.externalUrl) console.log(`@${p.username}: ${p.externalUrl}`);
});
