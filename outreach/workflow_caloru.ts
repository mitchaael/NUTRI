import { workflow, trigger, node, ifElse, splitInBatches, expr, newCredential } from '@n8n/workflow-sdk';

// ── Credenciales (el usuario las conecta en n8n tras crear el workflow) ─────
const gmailCred      = newCredential('Gmail', 'gmailOAuth2');
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

// ── 4. Esperar 45 segundos entre envíos (anti-spam) ──────────────────────────
const esperar = node({
  type: 'n8n-nodes-base.wait',
  version: 1.1,
  config: {
    name: '⏳ Esperar 45s',
    parameters: { amount: 45, unit: 'seconds' }
  }
});

// ── 5a. Preparar email personalizado (Set node) ───────────────────────────────
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
            value: expr('{{ $json.nombre }}, ¿tus pacientes llegan al control sin haber registrado nada?'),
            type: 'string'
          }
        ]
      }
    }
  }
});

// ── 5b. Enviar email con Gmail ────────────────────────────────────────────────
const emailHTML = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#F5F5F5;color:#1A1A1A}
.w{max-width:600px;margin:32px auto;background:#FFF;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)}
.h{background:#D42020;padding:28px 36px}
.ht{display:flex;align-items:center;gap:14px;margin-bottom:10px}
.lc{width:48px;height:48px;background:#FFF;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0}
.bn{color:#FFF;font-size:26px;font-weight:800}
.bt{color:rgba(255,255,255,.75);font-size:12px}
.hc{color:#FFF;font-size:16px;font-weight:600;border-top:1px solid rgba(255,255,255,.2);padding-top:14px;margin-top:4px}
.b{padding:36px}
.p{font-size:14.5px;line-height:1.65;color:#3A3A3A;margin-bottom:14px}
.stats{display:flex;gap:12px;margin:24px 0}
.stat{flex:1;background:#FAF8F5;border-radius:10px;padding:14px 12px;text-align:center;border:1px solid #EDE8E2}
.sn{font-size:22px;font-weight:800;color:#D42020;line-height:1}
.sl{font-size:10.5px;color:#6B6B6B;margin-top:4px;line-height:1.3}
.st{font-size:11px;font-weight:700;color:#D42020;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:14px}
.steps{display:flex;flex-direction:column;gap:10px;margin-bottom:24px}
.step{display:flex;align-items:flex-start;gap:12px}
.sn2{width:26px;height:26px;background:#D42020;color:#FFF;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;margin-top:1px}
.stx{font-size:13.5px;color:#3A3A3A;line-height:1.5}
.pc{background:#1C1C1E;border-radius:10px;padding:20px 22px;margin:24px 0}
.pa{font-size:32px;font-weight:800;color:#FFF;line-height:1}
.ps{font-size:12px;color:#999;margin-top:6px;line-height:1.5}
.pp{display:inline-block;background:#3A2E00;color:#C8952A;font-size:10.5px;font-weight:600;padding:4px 10px;border-radius:20px;margin-top:10px}
.cta{display:inline-block;background:#D42020;color:#FFF;font-size:15px;font-weight:700;padding:14px 40px;border-radius:50px;text-decoration:none}
.f{background:#F5F5F5;padding:20px 36px;border-top:1px solid #E5E5E5}
.ft{font-size:11.5px;color:#999;line-height:1.6;text-align:center}
.ft a{color:#D42020;text-decoration:none}
.div{border:none;border-top:1px solid #EDE8E2;margin:24px 0}
</style></head><body>
<div class="w">
  <div class="h">
    <div class="ht"><div class="lc">🥗</div><div><div class="bn">Calorú</div><div class="bt">Tu nutrición, a tu ritmo · caloru.cl</div></div></div>
    <div class="hc">Tus pacientes, más comprometidos entre consultas.</div>
  </div>
  <div class="b">
    <p class="p"><strong>Hola! 👋</strong></p>
    <p class="p">Te escribo porque creo que Calorú puede ser una herramienta útil en tu consulta. Somos una app chilena de nutrición y queremos trabajar con nutricionistas como tú.</p>
    <p class="p">La idea es simple: <strong>tú activas el plan y tus pacientes reciben acceso Pro automáticamente</strong>, sin que ellos paguen nada extra — lo incluyes en el valor de tu consulta.</p>
    <div class="stats">
      <div class="stat"><div class="sn">400+</div><div class="sl">productos<br>chilenos reales</div></div>
      <div class="stat"><div class="sn">$9.990</div><div class="sl">al mes,<br>todo incluido</div></div>
      <div class="stat"><div class="sn">10</div><div class="sl">pacientes Pro<br>incluidos</div></div>
    </div>
    <hr class="div">
    <div class="st">Cómo funciona</div>
    <div class="steps">
      <div class="step"><div class="sn2">1</div><div class="stx"><strong>Te registras en caloru.cl</strong> como nutricionista — menos de 2 minutos.</div></div>
      <div class="step"><div class="sn2">2</div><div class="stx"><strong>Vinculas a tus pacientes</strong> con tu código — ellos reciben Pro al instante.</div></div>
      <div class="step"><div class="sn2">3</div><div class="stx"><strong>Revisas sus registros</strong> antes de cada control: calorías, macros y hábitos.</div></div>
    </div>
    <hr class="div">
    <div class="pc">
      <div style="font-size:10px;font-weight:700;color:#D42020;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:6px">Precio</div>
      <div class="pa">$9.990 <span style="font-size:14px;font-weight:400;color:#999">/mes</span></div>
      <div class="ps">El costo es tuyo, pero puedes incluirlo en el valor de tu consulta.<br>Tus pacientes pueden reembolsarlo a su Isapre o Fonasa.</div>
      <div class="pp">✓ Reembolsable Isapre / Fonasa</div>
    </div>
    <p class="p">Te adjunto el one-pager con todos los detalles. Si tienes preguntas, responde este email directamente.</p>
    <div style="text-align:center;margin:28px 0">
      <a href="https://caloru.cl" class="cta">Ver Calorú →</a>
      <p style="font-size:12px;color:#999;margin-top:10px">O regístrate directo en caloru.cl</p>
    </div>
  </div>
  <div class="f">
    <p class="ft">Mitchael Arpoulet · Fundador de Calorú<br><a href="mailto:caloruapp@gmail.com">caloruapp@gmail.com</a> · <a href="https://caloru.cl">caloru.cl</a></p>
    <p style="font-size:10.5px;color:#bbb;text-align:center;margin-top:8px">Te escribo porque eres nutricionista y creo que esto puede ayudarte. Si no te interesa, responde "no gracias" y no te vuelvo a escribir.</p>
  </div>
</div></body></html>`;

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
        mappingMode:    'defineBelow',
        matchingColumns: ['email'],
        value: {
          email_enviado: 'si',
          fecha_envio:   expr("{{ new Date().toLocaleDateString('es-CL') }}"),
          estado:        'enviado'
        }
      },
      options: {}
    }
  }
});

// ── Composición del workflow ──────────────────────────────────────────────────
export default workflow('caloru-outreach', 'Calorú — Outreach Nutricionistas')
  .add(iniciarCampana)
  .to(leerContactos)
  .to(
    soloNoEnviados
      .onTrue(
        splitInBatches({ version: 3, config: { name: '📦 De a 1', parameters: { batchSize: 1 } } })
          .onEachBatch(
            prepararEmail
              .to(esperar)
              .to(enviarEmail)
              .to(marcarEnviado)
          )
      )
      .onFalse(
        node({
          type: 'n8n-nodes-base.noOp',
          version: 1,
          config: { name: '✓ Sin pendientes' }
        })
      )
  );
