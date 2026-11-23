import { sendSmtp } from './smtp.mjs';

const TO = 'niles@boomdrinkware.com';
const FROM = 'enquiries@boomdrinkware.com';
const response = (data, status = 200) => Response.json(data, { status });
const schema = `CREATE TABLE IF NOT EXISTS oem_notification_outbox (
 enquiry_id TEXT PRIMARY KEY, state TEXT NOT NULL DEFAULT 'pending',
 attempts INTEGER NOT NULL DEFAULT 0, retry_at INTEGER NOT NULL DEFAULT 0,
 updated_at INTEGER NOT NULL, error_code TEXT)`;

async function initialize(env) { await env.DB.prepare(schema).run(); }

/* B08-MAIL-C2：sending 超时巡检（只告警，不重发、不改状态）
   背景：领取时把状态改成 sending，然后才发送。如果 worker 在"已改 sending、尚未写回结果"
   之间被中断，这条记录会永远停在 sending；而 flush 只捞 pending，没人会再碰它，也没有任何告警。
   做法：只看不改。超过阈值就写一行结构化 ALERT，把询盘引用号、卡住多久、什么时候发现的记下来，
   状态、attempts、retry_at 一律不动 —— 绝不自动重发，避免客户收到第二封。
   阈值为 15 分钟＝三个 5 分钟定时周期；正常发送在 5 分钟内早已写回终态，不会误报。 */
const SENDING_STALE_MS = 15 * 60 * 1000;

async function inspectStalledSending(env, now = Date.now()) {
  try {
    const { results } = await env.DB.prepare(
      "SELECT enquiry_id,updated_at FROM oem_notification_outbox WHERE state='sending' AND updated_at<=? ORDER BY updated_at LIMIT 20"
    ).bind(now - SENDING_STALE_MS).all();
    for (const row of results || []) {
      const since = Number(row.updated_at || 0);
      console.log(JSON.stringify({
        level: 'ALERT', event: 'notification_stuck_sending',
        timestamp: new Date(now).toISOString(), service: 'oem-notifier', stage: 'inspect',
        enquiry_id: row.enquiry_id, state: 'sending',
        stuck_since: since ? new Date(since).toISOString() : null,
        stuck_minutes: since ? Math.floor((now - since) / 60000) : null,
        threshold_minutes: SENDING_STALE_MS / 60000,
        message: 'Notification has been in sending beyond the threshold; state left unchanged and not resent; operator review required.'
      }));
    }
  } catch (error) {
    console.log(JSON.stringify({ level: 'WARN', event: 'notification_inspect_failed',
      timestamp: new Date(now).toISOString(), service: 'oem-notifier', stage: 'inspect',
      error_code: String(error && error.code || 'INSPECT_FAILED').replace(/[^A-Z0-9_]/g, '').slice(0, 64) || 'INSPECT_FAILED',
      message: 'Stalled-sending inspection failed; sending pipeline is unaffected.' }));
  }
}

async function flush(env) {
  await initialize(env);
  await inspectStalledSending(env);
  const now = Date.now();
  /* B08-MAIL-C1 状态口径（只写口径，不改行为）：
     终态 = sent / accepted / failed / unknown，其中 accepted 是 2026-11-11~13 那版 SMTP 发送通道
     留下的历史成功状态，本代码不会写入它。四类终态都"只统计、不重发"：下面只捞 state='pending'，
     所以 accepted 永远不会被自动重发，历史记录也不做任何批量迁移。
     accepted 只代表当时的发送通道收下了任务，不等于进了收件箱。 */
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
      const smtpRaw = `Date: ${new Date().toUTCString()}\r\nMessage-ID: <${id}.${Date.now()}@boomdrinkware.com>\r\n` + raw;
      await sendSmtp(env.SMTP_PASSWORD, smtpRaw);
      handedOff = true;
      await env.DB.prepare("UPDATE oem_notification_outbox SET state='accepted',updated_at=?,error_code=NULL WHERE enquiry_id=?").bind(Date.now(), id).run();
    } catch (error) {
      const code = String(error.code || 'SEND_FAILED').replace(/[^A-Z0-9_]/g,'').slice(0,64) || 'SEND_FAILED';
      const nextState = (handedOff || error.code === 'SMTP_DELIVERY_UNKNOWN') ? 'unknown' : claim.attempts >= 5 ? 'failed' : 'pending';
      await env.DB.prepare("UPDATE oem_notification_outbox SET state=?,retry_at=?,updated_at=?,error_code=? WHERE enquiry_id=?")
        .bind(nextState, Date.now() + 60000 * 2 ** claim.attempts, Date.now(), code, id).run();
      // B07-C2 结构化日志 + C3 最终失败告警：仅写日志，不改数据库结构、不发任何邮件、不重试。
      // 字段只含内部诊断信息，不含 payload / 邮箱 / 令牌 / 密钥。queued 语义与此无关，仍不等于送达。
      const entry = { timestamp:new Date().toISOString(), service:'oem-notifier', stage:'flush',
        enquiry_id:id, error_code:code, attempts:claim.attempts, state:nextState };
      if (nextState === 'failed') {
        console.log(JSON.stringify({ level:'ALERT', event:'notification_final_failed', ...entry,
          message:'Final notification failure after maximum retries; enquiry is safely stored; operator review required.' }));
      } else {
        console.log(JSON.stringify({ level:'ERROR', event:'notification_send_failed', ...entry }));
      }
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
