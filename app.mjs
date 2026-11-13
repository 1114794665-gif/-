// BOOM Drinkware 本地预览服务（2026-10-29 重建）
// 用法：node server.mjs [port]   默认 8781
import http from 'node:http';
import crypto from 'node:crypto';
const sessions = new Map(), rates = new Map();
setInterval(()=>{const n=Date.now();for(const[k,v]of sessions)if(v<n)sessions.delete(k);for(const[k,v]of rates)if(v.until<n)rates.delete(k)},60000).unref();
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'site');
const PORT = Number(process.argv[2] || process.env.PORT || 8781);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.csv': 'text/csv; charset=utf-8',
};

const encodings = (req) => {
  const a = String(req.headers['accept-encoding'] || '').toLowerCase();
  return { br: /\bbr\b/.test(a), gz: /\bgzip\b/.test(a) };
};

// 只有这两类文件可以长期缓存：字体（文件名自带指纹）和图片（基本不改）。
// js/css 一律不设长缓存 —— 老板改完样式立刻要看到，靠文件名去重不可靠。
const LONG_CACHE = /^(assets\/fonts\/|img\/)/;

const send = (req, res, file, status = 200) => {
  const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  let st = null;
  try {
    st = fs.statSync(file);
  } catch {}
  // 2026-10-29：原来只有 no-cache 却没有 ETag，浏览器每次都得把整个文件重下。
  // 加上 ETag / Last-Modified，没改动就回 304（几十字节），改动立刻生效。
  const etag = st ? 'W/"' + st.size.toString(16) + '-' + Math.floor(st.mtimeMs).toString(16) + '"' : null;
  const headers = {
    'Content-Type': type,
    'Cache-Control': LONG_CACHE.test(rel) ? 'public, max-age=31536000, immutable' : 'no-cache',
    Vary: 'Accept-Encoding',
  };
  if (etag) {
    headers.ETag = etag;
    headers['Last-Modified'] = st.mtime.toUTCString();
    const inm = req.headers['if-none-match'];
    let notModified = false;
    if (inm) {
      notModified = inm.split(',').some((t) => t.trim() === etag || t.trim() === '*');
    } else if (req.headers['if-modified-since'] && st) {
      const since = Date.parse(req.headers['if-modified-since']);
      if (!Number.isNaN(since)) notModified = Math.floor(st.mtimeMs / 1000) * 1000 <= since;
    }
    if (notModified && status === 200) {
      res.writeHead(304, { ETag: etag, 'Cache-Control': headers['Cache-Control'], Vary: 'Accept-Encoding' });
      return res.end();
    }
  }
  const { br, gz } = encodings(req);
  // 有预压缩副本就优先用（存在且不比源文件旧）
  let src = file, enc = null;
  try {
    const st = fs.statSync(file);
    if (br && fs.existsSync(file + '.br') && fs.statSync(file + '.br').mtimeMs >= st.mtimeMs - 1000) {
      src = file + '.br'; enc = 'br';
    } else if (gz && fs.existsSync(file + '.gz') && fs.statSync(file + '.gz').mtimeMs >= st.mtimeMs - 1000) {
      src = file + '.gz'; enc = 'gzip';
    }
  } catch {}
  if (enc) headers['Content-Encoding'] = enc;

  const isText = /^(text\/|application\/(json|javascript|xml))/.test(type);
  const body = fs.readFileSync(src);
  if (!enc && isText && body.length > 1024) {
    // 注意：br 一律用 q5。默认 q11 压 4MB 的脚本要 6 秒，正是老页面"7 秒才打开"的真凶。
    // 高压缩比只给预压缩副本（tools/precompress_20261029.mjs），现场压缩只求快。
    if (br) {
      const out = zlib.brotliCompressSync(body, {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 5,
          [zlib.constants.BROTLI_PARAM_SIZE_HINT]: body.length,
        },
      });
      headers['Content-Encoding'] = 'br';
      headers['Content-Length'] = out.length;
      res.writeHead(status, headers);
      return res.end(out);
    }
    if (gz) {
      const out = zlib.gzipSync(body);
      headers['Content-Encoding'] = 'gzip';
      headers['Content-Length'] = out.length;
      res.writeHead(status, headers);
      return res.end(out);
    }
  }
  headers['Content-Length'] = body.length;
  res.writeHead(status, headers);
  if (req.method === 'HEAD') return res.end();
  res.end(body);
};

const notFound = (req, res) => {
  const page = path.join(ROOT, '404', 'index.html');
  if (fs.existsSync(page)) return send(req, res, page, 404);
  const body = Buffer.from('<h1>404</h1><p>Page not found.</p>', 'utf8');
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Length': body.length });
  res.end(req.method === 'HEAD' ? undefined : body);
};

/* ---------- 询盘接收（2026-10-29） ----------
 * 站点原有的表单一直往 /api/enquiries 提交，但预览服务从来没有这个端点，
 * 于是页面上永远显示「无法连接接收服务」，询盘等于发不出去。
 * 这里补一个最小接收端：把提交存成 data/_enquiries_20261029/<编号>.json，返回询盘编号。
 * 附件（multipart 里的文件段）只记录文件名，不落盘。
 */
const ENQ_DIR = process.env.ENQ_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), 'private-data', 'enquiries');

const readBody = (req, limit = 2 * 1024 * 1024) =>
  new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error('too large'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });

const multipartFields = (raw, ct) => {
  const out = { fields: {}, files: [] };
  const names = [];
  const m = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(ct);
  if (!m) return { fields: out, files: [] };
  const bBuf = Buffer.from('--' + (m[1] || m[2]).trim());
  let pos = raw.indexOf(bBuf);
  while (pos >= 0) {
    const start = pos + bBuf.length;
    if (raw.slice(start, start + 2).toString() === '--') break; // 结束标记
    const headEnd = raw.indexOf('\r\n\r\n', start);
    if (headEnd < 0) break;
    const header = raw.slice(start + 2, headEnd).toString('utf8');
    const next = raw.indexOf(bBuf, headEnd + 4);
    const bodyEnd = next < 0 ? raw.length : next - 2; // 去掉分段尾部的 \r\n
    const data = raw.slice(headEnd + 4, Math.max(bodyEnd, headEnd + 4));
    const nm = /name="([^"]*)"/i.exec(header);
    const fm = /filename="([^"]*)"/i.exec(header);
    const tm = /Content-Type:\s*([^\r\n]+)/i.exec(header);
    if (nm) {
      if (fm && fm[1]) {
        out.files.push({ name: nm[1], filename: fm[1], type: tm ? tm[1].trim() : '', data });
      } else {
        out.fields[nm[1]] = data.toString('utf8');
      }
    }
    pos = next;
  }
  return { fields: out.fields, files: out.files };
};

const safeName = (n) => String(n || 'file').replace(/[\\/:*?"<>|\r\n]/g, '_').slice(-120);

const saveEnquiry = (data, files) => {
  fs.mkdirSync(ENQ_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const id = 'ENQ-' + stamp + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  const record = {
    id,
    receivedAt: new Date().toISOString(),
    page: data.page || '',
    source: data.source || '',
    sourcePath: data.sourcePath || '',
    locale: data.locale || '',
    productInterest: data.productInterest || data.message || '',
    quantity: data.quantity || '',
    arrival: data.arrival || '',
    email: data.email || '',
    name: data.name || data.firstName || '',
    company: data.company || '',
    country: data.country || '',
    phone: data.phone || '',
    message: data.message || '',
    attachments: [],
  };
  if (files && files.length) {
    const dir = path.join(ENQ_DIR, id);
    fs.mkdirSync(dir, { recursive: true });
    for (const f of files) {
      const fname = crypto.randomBytes(6).toString('hex')+'-'+safeName(f.filename);
      fs.writeFileSync(path.join(dir, fname), f.data);
      record.attachments.push({ field: f.name, filename: fname, bytes: f.data.length, type: f.type });
    }
  }
  fs.writeFileSync(path.join(ENQ_DIR, id + '.json'), JSON.stringify(record, null, 2), 'utf8');
  return id;
};

const handleEnquiry = async (req, res) => {
  const reply = (code, obj) => {
    const body = Buffer.from(JSON.stringify(obj), 'utf8');
    res.writeHead(code, {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': body.length,
      'Cache-Control': 'no-store',
    });
    res.end(body);
  };

  const origin=req.headers.origin;if(origin){try{if(new URL(origin).host!==req.headers.host)return reply(403,{ok:false,code:'ORIGIN'});}catch{return reply(403,{ok:false,code:'ORIGIN'});}}
  const token=String(req.headers['x-enquiry-token']||'');if(!sessions.has(token)||sessions.get(token)<Date.now())return reply(403,{ok:false,code:'TOKEN'});
  const ip=req.headers['x-real-ip']||req.socket.remoteAddress;let rate=rates.get(ip);if(!rate||rate.until<Date.now()){rate={count:0,until:Date.now()+60000};rates.set(ip,rate)}if(++rate.count>10)return reply(429,{ok:false,code:'RATE_LIMIT'});
  const ct = String(req.headers['content-type'] || '');
  if (!/application\/json|multipart\/form-data|application\/x-www-form-urlencoded/i.test(ct)) {
    return reply(415, { ok: false, code: 'UNSUPPORTED', error: 'unsupported content type' });
  }

  let raw;
  try {
    raw = await readBody(req, 60 * 1024 * 1024);
  } catch {
    return reply(413, { ok: false, code: 'UPLOAD_TOO_LARGE', error: 'payload too large' });
  }

  let fields = {};
  let files = [];
  try {
    if (/application\/json/i.test(ct)) {
      fields = JSON.parse(raw.toString('utf8')) || {};
    } else if (/x-www-form-urlencoded/i.test(ct)) {
      fields = Object.fromEntries(new URLSearchParams(raw.toString('utf8')));
    } else {
      const parsed = multipartFields(raw, ct);
      fields = parsed.fields;
      files = parsed.files;
    }
  } catch {
    return reply(400, { ok: false, code: 'SAVE_FAILED', error: 'could not read the submission' });
  }

  if (String(fields.website || '').trim()) {
    // 蜜罐字段有值 = 机器人，假装成功，不落盘
    return reply(200, { ok: true, id: 'ENQ-IGNORED', attachmentCount: 0, duplicate: true });
  }

  const email = String(fields.email || '').trim();
  const need = String(fields.productInterest || fields.message || '').trim();
  if (!email || email.indexOf('@') < 1 || !need) {
    return reply(422, { ok: false, code: 'INVALID', error: 'email and requirements are required' });
  }

  if(files.length>10||files.some(f=>f.data.length>20*1024*1024||!/\.(pdf|dxf|dwg|step|stp|png|jpe?g|webp)$/i.test(f.filename)))return reply(422,{ok:false,code:'FILE_TYPE_OR_SIZE'});
  let id;
  try {
    id = saveEnquiry(fields, files);
  } catch {
    return reply(500, { ok: false, code: 'SAVE_FAILED', error: 'could not save the enquiry' });
  }

  const count = files.length;
  return reply(200, {
    ok: true,
    id,
    reference: id,
    attachmentCount: count,
    enquiry: { id, reference: id, attachmentCount: count },
  });
};

// 已下架 / 已合并的地址：永久转向真实页，不留 404、不留死链。
// 映射表由 tools/_redirects_20261029.json 生成，覆盖型号合并、退役文章与两个跑题页。
const GONE_REDIRECTS = (() => {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'redirects-20261029.json'), 'utf8'));
  } catch (e) {
    console.warn('[redirects] 映射表未加载，旧地址会走 404：', e.message);
    return {};
  }
})();

function lookupRedirect(p) {
  if (GONE_REDIRECTS[p]) return GONE_REDIRECTS[p];
  if (!p.endsWith('/') && GONE_REDIRECTS[p + '/']) return GONE_REDIRECTS[p + '/'];
  return null;
}

const server = http.createServer((req, res) => {
  let rawPath;try{rawPath=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end();}
  if(rawPath==='/login'||rawPath==='/login/'||rawPath==='/zh/login'||rawPath==='/zh/login/'){res.writeHead(302,{Location:rawPath.startsWith('/zh/')?'/zh/contact/':'/contact/'});return res.end();}
  if (rawPath === '/healthz') {res.writeHead(200, {'Content-Type':'application/json'});return res.end('{"ok":true}');}
  if (rawPath === '/api/products' && req.method === 'GET') {res.writeHead(200, {'Content-Type':'application/json','Cache-Control':'no-store'});return res.end(fs.readFileSync(path.join(ROOT,'data','api-products-snapshot.json')));}
  if (!['GET','HEAD'].includes(req.method) && !rawPath.startsWith('/api/enquiries')) {res.writeHead(405);return res.end();}
  if (/^\/(manage|tools|editor-data|private-data|node_modules)(\/|$)/.test(rawPath) || /\.(mjs|xlsx|bak|log|zip)$/.test(rawPath) || rawPath.includes('/.') || rawPath.includes('editor-drafts') || rawPath.includes('_enquiries')) {res.writeHead(404);return res.end();}

  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    return notFound(req, res);
  }

  const redirectTo = lookupRedirect(urlPath);
  if (redirectTo) {
    res.writeHead(301, {
      Location: redirectTo,
      'Cache-Control': 'public, max-age=86400',
      'Content-Length': 0,
    });
    return res.end();
  }

  if (urlPath === '/api/enquiries/session') {
    // 站点的询盘表单在提交前先来这里领一张通行证；没有它就显示「无法连接接收服务」。
    if (req.method === 'GET') {
      const token=crypto.randomBytes(24).toString('hex');sessions.set(token,Date.now()+30*60*1000);
      const body = Buffer.from(
        JSON.stringify({
          ok: true,
          accepting: true,
          token,
        }),
        'utf8'
      );
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': body.length,
        'Cache-Control': 'no-store',
      });
      return res.end(body);
    }
    return notFound(req, res);
  }

  if (urlPath === '/api/enquiries') {
    if (req.method === 'POST') return handleEnquiry(req, res);
    if (req.method === 'OPTIONS') {
      res.writeHead(204, { Allow: 'POST, OPTIONS', 'Cache-Control': 'no-store' });
      return res.end();
    }
    return notFound(req, res);
  }

  // 防目录穿越
  const safe = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  let file = path.join(ROOT, safe);

  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) return notFound(req, res);

  try {
    const st = fs.existsSync(file) ? fs.statSync(file) : null;
    if (st && st.isDirectory()) {
      const idx = path.join(file, 'index.html');
      if (fs.existsSync(idx)) return send(req, res, idx);
      return notFound(req, res);
    }
    if (st && st.isFile()) return send(req, res, file);
    // /foo -> /foo/index.html 或 /foo.html
    const asDir = path.join(file, 'index.html');
    if (fs.existsSync(asDir)) return send(req, res, asDir);
    if (!path.extname(file) && fs.existsSync(file + '.html')) return send(req, res, file + '.html');
  } catch {}
  return notFound(req, res);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`BOOM Drinkware preview → http://127.0.0.1:${PORT}/  (root: ${ROOT})`);
});
