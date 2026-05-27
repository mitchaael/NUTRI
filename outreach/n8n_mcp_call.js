/**
 * Cliente MCP para n8n — llama herramientas directamente via HTTP+SSE
 */
const https = require('https');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMTY4ZDJmNi1kMDBjLTQ5ZTQtYmUwNS1hYjg4ODZlNmEzYzEiLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6IjZkMWQyNDBiLWMyMGQtNDQ5Zi1iY2Q3LTJiYzFmNTZjMzE1MiIsImlhdCI6MTc3OTg0OTczOH0.4k8sMYClQUTpozL4lFQJDbkhsuBls4he03F-QQTFYlo';
const HOST  = 'mitchaael.app.n8n.cloud';
const PATH  = '/mcp-server/http';

function callMCP(method, params = {}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params });
    const options = {
      hostname: HOST, path: PATH, method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Parsear SSE: "event: message\ndata: {...}"
        const match = data.match(/^event: message\r?\ndata: (.+)/m);
        if (match) {
          try { resolve(JSON.parse(match[1])); } catch(e) { resolve(data); }
        } else {
          try { resolve(JSON.parse(data)); } catch(e) { resolve(data); }
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Ejecutar según argumento
const cmd = process.argv[2];

(async () => {
  if (cmd === 'sdk') {
    const r = await callMCP('tools/call', { name: 'get_sdk_reference', arguments: {} });
    const text = r?.result?.content?.[0]?.text || JSON.stringify(r, null, 2);
    console.log(text.slice(0, 8000));

  } else if (cmd === 'validate') {
    const code = require('fs').readFileSync(process.argv[3], 'utf8');
    const r = await callMCP('tools/call', { name: 'validate_workflow', arguments: { code } });
    console.log(JSON.stringify(r?.result, null, 2));

  } else if (cmd === 'create') {
    const code = require('fs').readFileSync(process.argv[3], 'utf8');
    const r = await callMCP('tools/call', {
      name: 'create_workflow_from_code',
      arguments: { code, name: 'Calorú — Outreach Nutricionistas', description: 'Envío automatizado de emails a nutricionistas con el one-pager de Calorú' }
    });
    console.log(JSON.stringify(r?.result, null, 2));

  } else if (cmd === 'update') {
    const workflowId = process.argv[3];
    const code = require('fs').readFileSync(process.argv[4], 'utf8');
    const r = await callMCP('tools/call', {
      name: 'update_workflow',
      arguments: { workflowId, code, name: 'Calorú — Outreach Nutricionistas' }
    });
    console.log(JSON.stringify(r?.result, null, 2));

  } else {
    console.log('Uso: node n8n_mcp_call.js [sdk|validate <file>|create <file>]');
  }
})();
