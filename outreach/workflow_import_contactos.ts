import { workflow, trigger, node, newCredential } from '@n8n/workflow-sdk';

const googleSheetCred = newCredential('Google Sheets', 'googleSheetsOAuth2Api');

const iniciar = trigger({
  type: 'n8n-nodes-base.manualTrigger',
  version: 1,
  config: { name: '▶ Importar contactos' }
});

const contactosData = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: '📋 24 contactos nuevos',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const c = [
  { nombre: 'Balance Group Nutricionistas Viña del Mar', email: 'contacto@balancegroup.cl', ciudad: 'Viña del Mar', fuente: 'Google Maps', email_enviado: '', fecha_envio: '', estado: '', notas: '+56 9 4181 7489' },
  { nombre: 'NutraOk Centro de Nutrición Viña del Mar', email: 'contacto@nutraok.cl', ciudad: 'Viña del Mar', fuente: 'Google Maps', email_enviado: '', fecha_envio: '', estado: '', notas: '+56 9 5469 4387' },
  { nombre: 'Nutricionista Camila Paz Alarcón', email: 'camilapazalarcon7@gmail.com', ciudad: 'La Serena', fuente: 'Google Maps', email_enviado: '', fecha_envio: '', estado: '', notas: '+56 9 9614 6898' },
  { nombre: 'Constanza Jiménez Nutricionista', email: 'contacto@constanzanutricion.cl', ciudad: 'La Serena', fuente: 'Google Maps', email_enviado: '', fecha_envio: '', estado: '', notas: '+56 51 252 2273' },
  { nombre: 'Sebastián Araya Nutricionista', email: 'nutri.sebaaraya@gmail.com', ciudad: 'La Serena', fuente: 'Google Maps', email_enviado: '', fecha_envio: '', estado: '', notas: '+56 9 3737 0177' },
  { nombre: 'Natalia Soto Nutrición y Salud', email: 'dra.nataliasoto@gmail.com', ciudad: 'Rancagua', fuente: 'Google Maps', email_enviado: '', fecha_envio: '', estado: '', notas: '+56 9 4425 0535' },
  { nombre: 'Nutricionista Camila Espinoza', email: 'nutricami.es@gmail.com', ciudad: 'Rancagua', fuente: 'Google Maps', email_enviado: '', fecha_envio: '', estado: '', notas: '+56 9 3026 7345' },
  { nombre: 'Nutri Jesu Puerto Montt', email: 'hola@nutrijesu.cl', ciudad: 'Puerto Montt', fuente: 'Google Maps', email_enviado: '', fecha_envio: '', estado: '', notas: '+56 9 8467 5436' },
  { nombre: 'Centro de Salud Ayelen Puerto Montt', email: 'grupocresse@gmail.com', ciudad: 'Puerto Montt', fuente: 'Google Maps', email_enviado: '', fecha_envio: '', estado: '', notas: '+56 65 243 0535' },
  { nombre: 'Sofía Domínguez Ducros Nutricionista', email: 'la.nutrinfantil@gmail.com', ciudad: 'Puerto Montt', fuente: 'Google Maps', email_enviado: '', fecha_envio: '', estado: '', notas: '+56 9 9817 1458' },
  { nombre: 'Cindy Oyaneder Nutricionista Valparaíso', email: 'nutreintegral.cindyoyaneder@gmail.com', ciudad: 'Valparaíso', fuente: 'Google Maps', email_enviado: '', fecha_envio: '', estado: '', notas: '+56 9 6264 6137' },
  { nombre: 'Álvaro Cañete Nutricionista Deportivo', email: 'nutreactivo@gmail.com', ciudad: 'Concepción', fuente: 'Google Maps', email_enviado: '', fecha_envio: '', estado: '', notas: '+56 9 8730 7068' },
  { nombre: 'Andrea Risso Nutrición Deportiva', email: 'arissolopez@gmail.com', ciudad: 'Concepción', fuente: 'Google Maps', email_enviado: '', fecha_envio: '', estado: '', notas: '' },
  { nombre: 'Igna Muñoz Nutricionista Concepción', email: 'ignacamila.nutricionista@gmail.com', ciudad: 'Concepción', fuente: 'Google Maps', email_enviado: '', fecha_envio: '', estado: '', notas: '+56 9 7376 6490' },
  { nombre: 'Carolina Muñoz Vejar Nutricionista', email: 'carolinaestefaniamv@gmail.com', ciudad: 'Temuco', fuente: 'Google Maps', email_enviado: '', fecha_envio: '', estado: '', notas: '+56 9 8707 9764' },
  { nombre: 'NutriMas Temuco Online', email: '20contacto@nutrimas.cl', ciudad: 'Temuco', fuente: 'Google Maps', email_enviado: '', fecha_envio: '', estado: '', notas: '' },
  { nombre: 'Cristina Travieso Moreno Nutricionista', email: 'nutricrismoreno@gmail.com', ciudad: 'Temuco', fuente: 'Google Maps', email_enviado: '', fecha_envio: '', estado: '', notas: '+56 9 5842 7962' },
  { nombre: 'Centro Médico Trizano Emily Rodriguez', email: 'sedetrizano@centromedicotrizano.cl', ciudad: 'Iquique', fuente: 'Google Maps', email_enviado: '', fecha_envio: '', estado: '', notas: '+56 9 4217 4544' },
  { nombre: 'Cattalina Pulgar Pincheira Nutricionista', email: 'cattalinapulgar@gmail.com', ciudad: 'Iquique', fuente: 'Google Maps', email_enviado: '', fecha_envio: '', estado: '', notas: '' },
  { nombre: 'SerFit', email: 'serfit.cl@gmail.com', ciudad: '', fuente: 'TikTok', email_enviado: '', fecha_envio: '', estado: '', notas: '@serfit.cl' },
  { nombre: 'Nutri Sin Gluten Sofia Caceres', email: 'nutsofiacaceres@gmail.com', ciudad: '', fuente: 'TikTok', email_enviado: '', fecha_envio: '', estado: '', notas: '@nutsofiacaceres' },
  { nombre: 'Claudia Conn Nutricionista', email: 'hola@clauconnection.com', ciudad: '', fuente: 'Instagram', email_enviado: '', fecha_envio: '', estado: '', notas: '@clauconnection 4207f' },
  { nombre: 'Doc Roita', email: 'doc.roita@gmail.com', ciudad: '', fuente: 'Instagram', email_enviado: '', fecha_envio: '', estado: '', notas: '@doc.roita 6360f' },
  { nombre: 'ByBody', email: 'ventas@by-body.com', ciudad: '', fuente: 'Instagram', email_enviado: '', fecha_envio: '', estado: '', notas: '@bybody.cl 5631f' },
];
return c.map(x => ({ json: x }));`
    }
  }
});

const appendSheet = node({
  type: 'n8n-nodes-base.googleSheets',
  version: 4.7,
  credentials: { googleSheetsOAuth2Api: googleSheetCred },
  config: {
    name: '📤 Agregar a Contactos',
    parameters: {
      resource: 'sheet',
      operation: 'append',
      documentId: { __rl: true, value: '1TJgTCyEpVMEJiIWl0aW-nYYJXszM4VfLVQj7x9qSbz4', mode: 'id' },
      sheetName: { __rl: true, value: 'Contactos', mode: 'name' },
      columns: { mappingMode: 'autoMapInputData', value: null },
      options: {}
    }
  }
});

export default workflow('import-contactos-caloru', 'Calorú — Importar 24 contactos nuevos')
  .add(iniciar)
  .to(contactosData)
  .to(appendSheet);
