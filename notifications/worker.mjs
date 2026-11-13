import { EmailMessage } from 'cloudflare:email';

const TO = 'niles@boomdrinkware.com';
const FROM = 'enquiries@boomdrinkware.com';
const response = (data, status = 200) => Response.json(data, { status });
const schema = `CREATE TABLE IF NOT EXISTS oem_notification_outbox (
 enquiry_id TEXT PRIMARY KEY, state TEXT NOT NULL DEFAULT 'pending',
 attempts INTEGER NOT NULL DEFAULT 0, retry_at INTEGER NOT NULL DEFAULT 0,
 updated_at INTEGER NOT NULL, error_code TEXT)`;

async function initialize(env) { await env.DB.prepare(schema).run(); }

async function flush(env) {
  await initialize(env);
  const now = Date.now();
  const { results } = await env.DB.prepare(
    "SELECT enquiry_id FROM oem_notification_outbox WHERE state='pending' AND attempts<5 AND retry_at<=? ORDER BY updated_at LIMIT 10"
  ).bind(now).all();
  for (const { enquiry_id: id } of results) {
    const claim = await env.DB.prepare(
      "UPDATE oem_notification_outbox SET state='sending',attempts=attempts+1,updated_at=? WHERE enquiry_id=? AND state='pending' RETURNING attempts"
    ).bind(now, id).first();
    if (!claim) continue;
    let handedOff = false;
    try {
      const row = await env.DB.prepare('SELECT payload,received_at FROM enquiries WHERE id=?').bind(id).first();
      if (!row) throw Object.assign(new Error('Missing enquiry'), { code: 'MISSING_ENQUIRY' });
      const fields = JSON.parse(row.payload);
      const count = await env.DB.prepare('SELECT COUNT(*) AS n FROM attachments WHERE enquiry_id=?').bind(id).first();
      const lines = ['New BOOM Drinkware website enquiry', '', `Reference: ${id}`, `Received: ${row.received_at}`, `Saved attachments: ${count.n}`, '',
        ...Object.entries(fields).filter(([key]) => !/token|password|secret/i.test(key)).map(([key,value]) => `${key}: ${String(value).slice(0,8000)}`),
        '', 'The enquiry and attachments remain stored privately in the website database.'];
      const text = lines.join('\n');
      const bytes = new TextEncoder().encode(text);
      const encoded = btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join('')).match(/.{1,76}/g).join('\r\n');
      const raw = [`From: BOOM Drinkware <${FROM}>`, `To: ${TO}`, `Subject: [BOOM Drinkware] Website enquiry ${id}`,
        'MIME-Version: 1.0', 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', encoded].join('\r\n');
      await env.EMAIL.send(new EmailMessage(FROM, TO, raw));
      handedOff = true;
      await env.DB.prepare("UPDATE oem_notification_outbox SET state='sent',updated_at=?,error_code=NULL WHERE enquiry_id=?").bind(Date.now(), id).run();
    } catch (error) {
      const code = String(error.code || 'SEND_FAILED').replace(/[^A-Z0-9_]/g,'').slice(0,64) || 'SEND_FAILED';
      await env.DB.prepare("UPDATE oem_notification_outbox SET state=?,retry_at=?,updated_at=?,error_code=? WHERE enquiry_id=?")
        .bind(handedOff ? 'unknown' : claim.attempts >= 5 ? 'failed' : 'pending', Date.now() + 60000 * 2 ** claim.attempts, Date.now(), code, id).run();
    }
  }
}

export default {
  async fetch(request, env, ctx) {
    // No public route is deployed. Only the Pages service binding calls this handler.
    if (request.method !== 'POST' || new URL(request.url).pathname !== '/enqueue') return response({ ok: false }, 404);
    let input; try { input = await request.json(); } catch { return response({ ok: false }, 400); }
    if (!/^ENQ-[a-f0-9-]{36}$/.test(input.id || '')) return response({ ok: false }, 400);
    if (!await env.DB.prepare('SELECT id FROM enquiries WHERE id=?').bind(input.id).first()) return response({ ok: false }, 404);
    await initialize(env);
    await env.DB.prepare('INSERT OR IGNORE INTO oem_notification_outbox(enquiry_id,updated_at) VALUES(?,?)').bind(input.id, Date.now()).run();
    ctx.waitUntil(flush(env));
    return response({ ok: true, notification: 'queued' }, 202);
  },
  async scheduled(event, env, ctx) { ctx.waitUntil(flush(env)); }
};
