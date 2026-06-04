import { workflow, trigger, node, ifElse, expr, newCredential } from '@n8n/workflow-sdk';

// ── Credenciales ─────────────────────────────────────────────────────────────
const gmailCred       = newCredential('Gmail', 'gmailOAuth2');
const googleSheetCred = newCredential('Google Sheets', 'googleSheetsOAuth2Api');

// ── 1. Trigger manual ────────────────────────────────────────────────────────
const iniciarCampana = trigger({
  type: 'n8n-nodes-base.manualTrigger',
  version: 1,
  config: { name: '▶ Iniciar campaña' }
});

// ── 2. Leer contactos desde Google Sheets ────────────────────────────────────
const leerContactos = node({
  type: 'n8n-nodes-base.googleSheets',
  version: 4.5,
  credentials: { googleSheetsOAuth2Api: googleSheetCred },
  config: {
    name: '📋 Leer contactos',
    parameters: {
      operation: 'read',
      documentId: { __rl: true, value: '1TJgTCyEpVMEJiIWl0aW-nYYJXszM4VfLVQj7x9qSbz4', mode: 'id' },
      sheetName:  { __rl: true, value: 'Contactos', mode: 'name' },
      options: {}
    }
  }
});

// ── 3. Filtrar solo los no enviados ──────────────────────────────────────────
const soloNoEnviados = ifElse({
  version: 2.2,
  config: {
    name: '🔍 ¿Ya enviado?',
    parameters: {
      conditions: {
        options:    { caseSensitive: false, leftValue: '', typeValidation: 'loose' },
        combinator: 'and',
        conditions: [
          {
            leftValue:  expr('{{ $json.email_enviado }}'),
            operator:   { type: 'string', operation: 'notEquals' },
            rightValue: 'si'
          },
          {
            leftValue:  expr('{{ $json.email }}'),
            operator:   { type: 'string', operation: 'notEmpty' },
            rightValue: ''
          }
        ]
      }
    }
  }
});

// ── 4. Preparar asunto personalizado ─────────────────────────────────────────
const prepararEmail = node({
  type: 'n8n-nodes-base.set',
  version: 3.4,
  config: {
    name: '✉️ Preparar email',
    parameters: {
      mode: 'manual',
      includeOtherFields: true,
      assignments: {
        assignments: [
          {
            id: 'subject',
            name: 'emailSubject',
            value: expr('{{ $json.nombre }}, ¿cómo registran tus pacientes entre consultas?'),
            type: 'string'
          }
        ]
      }
    }
  }
});

// ── 5. Email HTML — estilo personal de fundador ───────────────────────────────
const emailHTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#F5F5F5;color:#1A1A1A}
.w{max-width:580px;margin:24px auto;background:#FFF;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.07)}
.h{background:#D42020;padding:22px 32px;display:flex;align-items:center;gap:12px}
.lc{width:40px;height:40px;background:#FFF;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
.hname{color:#FFF;font-size:22px;font-weight:800}
.hsub{color:rgba(255,255,255,.7);font-size:11px;margin-top:1px}
.b{padding:32px}
.p{font-size:15px;line-height:1.75;color:#333;margin-bottom:16px}
.li{font-size:14.5px;line-height:1.7;color:#333;padding-left:20px;margin-bottom:8px;position:relative}
.li::before{content:'→';position:absolute;left:0;color:#D42020;font-weight:700}
.cta{display:inline-block;background:#D42020;color:#FFF;font-size:15px;font-weight:700;padding:13px 36px;border-radius:50px;text-decoration:none}
.div{border:none;border-top:1px solid #EBEBEB;margin:24px 0}
.ps{font-size:13px;color:#666;line-height:1.6;margin-top:20px;padding-top:16px;border-top:1px solid #EBEBEB}
.f{background:#F8F8F8;padding:18px 32px;border-top:1px solid #EBEBEB}
.ft{font-size:11px;color:#999;text-align:center;line-height:1.6}
.ft a{color:#D42020;text-decoration:none}
</style>
</head>
<body>
<div class="w">
  <div class="h">
    <div class="lc">🥗</div>
    <div>
      <div class="hname">Calorú</div>
      <div class="hsub">Tu nutrición, a tu ritmo · caloru.cl</div>
    </div>
  </div>
  <div class="b">
    <p class="p">Hola 👋</p>
    <p class="p">Soy Mitchael, desarrollé <strong>Calorú</strong> — una app chilena de nutrición. Te escribo porque creo que puede ayudarte directamente en tu consulta.</p>
    <p class="p">Lo que más escucho de nutricionistas: <strong>los pacientes llegan al control sin haber registrado nada durante la semana.</strong> Sin datos reales, el seguimiento se complica.</p>
    <p class="p">Calorú lo resuelve de forma simple:</p>
    <p class="li">Les das acceso Pro a tus pacientes con tu código</p>
    <p class="li">Ellos registran lo que comen con <strong>400+ productos chilenos reales</strong> — Colún, Soprole, Carozzi, todos los supermercados</p>
    <p class="li">Tú revisas sus calorías y macros antes de cada control</p>
    <hr class="div">
    <p class="p">El plan cuesta <strong>$9.990/mes</strong> e incluye 10 pacientes Pro. Tus pacientes pueden reembolsarlo a su Isapre o Fonasa — <strong>en la práctica el costo puede ser cero para ti.</strong></p>
    <div style="text-align:center;margin:28px 0">
      <a href="https://caloru.cl" class="cta">Ver Calorú →</a>
      <p style="font-size:12px;color:#999;margin-top:10px">Regístrate en caloru.cl — menos de 2 minutos</p>
    </div>
    <div class="ps">
      <strong>P.D.</strong> Te adjunto el one-pager con todos los detalles. Si tienes preguntas, responde este correo directamente — lo leo yo.
    </div>
  </div>
  <div class="f">
    <p class="ft">Mitchael Arpoulet · Fundador de Calorú<br>
    <a href="mailto:caloruapp@gmail.com">caloruapp@gmail.com</a> · <a href="https://caloru.cl">caloru.cl</a></p>
    <p style="font-size:10px;color:#bbb;text-align:center;margin-top:6px">Te escribo porque eres nutricionista y creo que esto puede ayudarte. Si no te interesa, responde "no gracias" y no vuelvo a escribirte.</p>
  </div>
</div>
</body>
</html>`;

const enviarEmail = node({
  type: 'n8n-nodes-base.gmail',
  version: 2.1,
  credentials: { gmailOAuth2: gmailCred },
  config: {
    name: '📧 Enviar email',
    parameters: {
      operation: 'send',
      sendTo:    expr('{{ $json.email }}'),
      subject:   expr('{{ $json.emailSubject }}'),
      emailType: 'html',
      message:   emailHTML,
      options: {
        attachmentsUi: {
          attachmentsBinary: [],
          attachmentsValues: [
            {
              name:    'Caloru_Para_Nutricionistas.pdf',
              dataUrl: 'https://fywghvfdwltayylswnid.supabase.co/storage/v1/object/public/outreach/caloru_nutricionistas_v3.pdf',
              type:    'application/pdf'
            }
          ]
        }
      }
    }
  }
});

// ── 6. Marcar como enviado en Google Sheets ───────────────────────────────────
const marcarEnviado = node({
  type: 'n8n-nodes-base.googleSheets',
  version: 4.5,
  credentials: { googleSheetsOAuth2Api: googleSheetCred },
  config: {
    name: '✅ Marcar enviado',
    parameters: {
      operation: 'update',
      documentId: { __rl: true, value: '1TJgTCyEpVMEJiIWl0aW-nYYJXszM4VfLVQj7x9qSbz4', mode: 'id' },
      sheetName:  { __rl: true, value: 'Contactos', mode: 'name' },
      columns: {
        mappingMode:     'defineBelow',
        matchingColumns: ['email'],
        value: {
          email:         expr("{{ $('✉️ Preparar email').item.json.email }}"),
          email_enviado: 'si',
          fecha_envio:   expr("{{ new Date().toLocaleDateString('es-CL') }}"),
          estado:        'enviado'
        }
      },
      options: {}
    }
  }
});

// ── Composición: cadena lineal, sin splitInBatches ────────────────────────────
// Todos los contactos no enviados se procesan en una sola ejecución
export default workflow('caloru-outreach', 'Calorú — Outreach Nutricionistas')
  .add(iniciarCampana)
  .to(leerContactos)
  .to(
    soloNoEnviados
      .onTrue(
        prepararEmail
          .to(enviarEmail)
          .to(marcarEnviado)
      )
      .onFalse(
        node({
          type: 'n8n-nodes-base.noOp',
          version: 1,
          config: { name: '✓ Sin pendientes' }
        })
      )
  );
