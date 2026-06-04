import { workflow, trigger, node, ifElse, splitInBatches, expr, newCredential } from '@n8n/workflow-sdk';

// ── Credenciales ─────────────────────────────────────────────────────────────
const gmailCred       = newCredential('Gmail', 'gmailOAuth2');
const googleSheetCred = newCredential('Google Sheets', 'googleSheetsOAuth2Api');

// ── 1. Trigger manual ────────────────────────────────────────────────────────
const iniciarCampana = trigger({
  type: 'n8n-nodes-base.manualTrigger',
  version: 1,
  config: { name: '▶ Iniciar campaña usuarios' }
});

// ── 2. Leer usuarios desde Google Sheets ─────────────────────────────────────
const leerUsuarios = node({
  type: 'n8n-nodes-base.googleSheets',
  version: 4.5,
  credentials: { googleSheetsOAuth2Api: googleSheetCred },
  config: {
    name: '📋 Leer usuarios',
    parameters: {
      operation: 'read',
      documentId: { __rl: true, value: '1TJgTCyEpVMEJiIWl0aW-nYYJXszM4VfLVQj7x9qSbz4', mode: 'id' },
      sheetName:  { __rl: true, value: 'Usuarios', mode: 'name' },
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

// ── 4. Esperar 30 segundos entre envíos (anti-spam) ──────────────────────────
const esperar = node({
  type: 'n8n-nodes-base.wait',
  version: 1.1,
  config: {
    name: '⏳ Esperar 30s',
    parameters: { amount: 30, unit: 'seconds' }
  }
});

// ── 5a. Preparar email personalizado ─────────────────────────────────────────
const prepararEmail = node({
  type: 'n8n-nodes-base.set',
  version: 3.4,
  config: {
    name: '✉️ Preparar email usuario',
    parameters: {
      mode: 'manual',
      includeOtherFields: true,
      assignments: {
        assignments: [
          {
            id: 'subject',
            name: 'emailSubject',
            value: expr('{{ $json.nombre }}, ¿registras lo que comes con productos chilenos reales?'),
            type: 'string'
          }
        ]
      }
    }
  }
});

// ── 5b. Email HTML B2C ────────────────────────────────────────────────────────
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
.features{display:flex;flex-direction:column;gap:10px;margin:24px 0}
.feat{display:flex;align-items:flex-start;gap:12px;background:#FAF8F5;border-radius:10px;padding:14px;border:1px solid #EDE8E2}
.fi{font-size:22px;flex-shrink:0}
.ft2{font-size:13.5px;color:#3A3A3A;line-height:1.5}
.ft2 strong{color:#1A1A1A}
.stats{display:flex;gap:12px;margin:24px 0}
.stat{flex:1;background:#FAF8F5;border-radius:10px;padding:14px 12px;text-align:center;border:1px solid #EDE8E2}
.sn{font-size:22px;font-weight:800;color:#D42020;line-height:1}
.sl{font-size:10.5px;color:#6B6B6B;margin-top:4px;line-height:1.3}
.pc{background:#1C1C1E;border-radius:10px;padding:20px 22px;margin:24px 0}
.pa{font-size:32px;font-weight:800;color:#FFF;line-height:1}
.ps{font-size:12px;color:#999;margin-top:6px;line-height:1.5}
.pp{display:inline-block;background:#1A3A1A;color:#5CB85C;font-size:10.5px;font-weight:600;padding:4px 10px;border-radius:20px;margin-top:10px}
.cta{display:inline-block;background:#D42020;color:#FFF;font-size:15px;font-weight:700;padding:14px 40px;border-radius:50px;text-decoration:none}
.f{background:#F5F5F5;padding:20px 36px;border-top:1px solid #E5E5E5}
.ft{font-size:11.5px;color:#999;line-height:1.6;text-align:center}
.ft a{color:#D42020;text-decoration:none}
.div{border:none;border-top:1px solid #EDE8E2;margin:24px 0}
</style></head><body>
<div class="w">
  <div class="h">
    <div class="ht"><div class="lc">🥗</div><div><div class="bn">Calorú</div><div class="bt">Tu nutrición, a tu ritmo · caloru.cl</div></div></div>
    <div class="hc">Cuenta calorías con productos que realmente encuentras en Chile.</div>
  </div>
  <div class="b">
    <p class="p"><strong>Hola 👋</strong></p>
    <p class="p">¿Has intentado contar calorías con apps como MyFitnessPal y no encontraste el <em>pan Ideal</em>, las <em>galletas Tritón</em> o el <em>Yogur Soprole</em>? Ese es exactamente el problema que resuelve Calorú.</p>
    <p class="p">Somos una app chilena con <strong>400+ productos reales del supermercado</strong> — los que tú realmente compras y comes.</p>
    <hr class="div">
    <div class="features">
      <div class="feat"><div class="fi">🇨🇱</div><div class="ft2"><strong>Productos chilenos reales</strong><br>Pan Ideal, galletas Tritón, Colún, Jumbo, Lider — todo lo que comes de verdad.</div></div>
      <div class="feat"><div class="fi">🤖</div><div class="ft2"><strong>Nutri IA incluido</strong><br>Pregúntale a tu asistente de nutrición personal — 24/7, sin costo extra.</div></div>
      <div class="feat"><div class="fi">🔥</div><div class="ft2"><strong>Racha diaria</strong><br>Mantén tu racha activa y convierte el registro en un hábito real.</div></div>
      <div class="feat"><div class="fi">📊</div><div class="ft2"><strong>Macros detallados</strong><br>Proteínas, carbohidratos y grasas — todo calculado automáticamente.</div></div>
    </div>
    <hr class="div">
    <div class="stats">
      <div class="stat"><div class="sn">400+</div><div class="sl">productos<br>chilenos reales</div></div>
      <div class="stat"><div class="sn">Gratis</div><div class="sl">plan básico<br>sin límites</div></div>
      <div class="stat"><div class="sn">Pro</div><div class="sl">IA nutricional<br>y más</div></div>
    </div>
    <hr class="div">
    <div class="pc">
      <div style="font-size:10px;font-weight:700;color:#D42020;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:6px">Plan Pro</div>
      <div class="pa">$2.990 <span style="font-size:14px;font-weight:400;color:#999">/mes</span></div>
      <div class="ps">Nutri IA ilimitado, estadísticas avanzadas y modo profesional.<br>El plan gratuito ya incluye registro de alimentos sin restricciones.</div>
      <div class="pp">✓ Primer mes gratis si te registras hoy</div>
    </div>
    <p class="p">Descárgala gratis en caloru.cl — 2 minutos y ya estás registrando lo que comes con productos que realmente existen en Chile.</p>
    <div style="text-align:center;margin:28px 0">
      <a href="https://caloru.cl" class="cta">Descargar Calorú →</a>
      <p style="font-size:12px;color:#999;margin-top:10px">Disponible en App Store y Google Play</p>
    </div>
  </div>
  <div class="f">
    <p class="ft">Mitchael Arpoulet · Fundador de Calorú<br><a href="mailto:caloruapp@gmail.com">caloruapp@gmail.com</a> · <a href="https://caloru.cl">caloru.cl</a></p>
    <p style="font-size:10.5px;color:#bbb;text-align:center;margin-top:8px">Te escribo porque creo que Calorú puede ayudarte a comer mejor. Si no te interesa, responde "no gracias" y no te vuelvo a escribir.</p>
  </div>
</div></body></html>`;

const enviarEmail = node({
  type: 'n8n-nodes-base.gmail',
  version: 2.1,
  credentials: { gmailOAuth2: gmailCred },
  config: {
    name: '📧 Enviar email usuario',
    parameters: {
      operation: 'send',
      sendTo:    expr('{{ $json.email }}'),
      subject:   expr('{{ $json.emailSubject }}'),
      emailType: 'html',
      message:   emailHTML,
      options:   {}
    }
  }
});

// ── 6. Marcar como enviado en Google Sheets ───────────────────────────────────
const marcarEnviado = node({
  type: 'n8n-nodes-base.googleSheets',
  version: 4.5,
  credentials: { googleSheetsOAuth2Api: googleSheetCred },
  config: {
    name: '✅ Marcar enviado usuario',
    parameters: {
      operation: 'update',
      documentId: { __rl: true, value: '1TJgTCyEpVMEJiIWl0aW-nYYJXszM4VfLVQj7x9qSbz4', mode: 'id' },
      sheetName:  { __rl: true, value: 'Usuarios', mode: 'name' },
      columns: {
        mappingMode:     'defineBelow',
        matchingColumns: ['email'],
        value: {
          email:         expr("{{ $('✉️ Preparar email usuario').item.json.email }}"),
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
export default workflow('caloru-usuarios', 'Calorú — Outreach Usuarios')
  .add(iniciarCampana)
  .to(leerUsuarios)
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
