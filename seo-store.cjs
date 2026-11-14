/* BOOM SEO 后台：覆盖层读写 + 注入页面 + GitHub 同步
   本地预览服务与构建脚本共用。 */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const OV = 'data/seo-overrides.json';
const IDX = 'data/seo-pages-index.json';
const SHARED = 'data/runtime-shared-niles-20261111.json';

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function loadOverrides(dir) {
  const f = path.join(dir, OV);
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); }
  catch { return { version: 1, updatedAt: '', pages: {} }; }
}
function saveOverrides(dir, data) {
  data.version = 1;
  data.updatedAt = new Date().toISOString();
  fs.writeFileSync(path.join(dir, OV), JSON.stringify(data), 'utf8');
  return data;
}
function listPages(dir) {
  const idx = JSON.parse(fs.readFileSync(path.join(dir, IDX), 'utf8'));
  const ov = loadOverrides(dir).pages || {};
  const stamp = idx.generatedAt || new Date().toISOString();
  return idx.pages.map(p => {
    const o = ov[p.route];
    return { ...p, id: p.route, updatedAt: (o && o.updatedAt) || stamp,
      title: o ? (o.title ?? p.title) : p.title,
      meta: o ? (o.meta ?? p.meta) : p.meta,
      h1: o ? (o.h1 ?? p.h1) : p.h1,
      keyword: o ? (o.keyword ?? p.keyword) : p.keyword,
      ogImage: o ? (o.ogImage ?? p.ogImage) : p.ogImage };
  });
}

function upsert(dir, input) {
  const route = String(input.route || '');
  if (!/^\/[A-Za-z0-9_/-]*\/$/.test(route)) throw new Error('INVALID_ROUTE');
  const ov = loadOverrides(dir);
  ov.pages[route] = {
    route,
    pageType: String(input.pageType || 'page'),
    title: String(input.title ?? '').trim(),
    meta: String(input.meta ?? '').trim(),
    h1: String(input.h1 ?? '').trim(),
    keyword: String(input.keyword ?? '').trim(),
    ogImage: String(input.ogImage ?? '').trim() || '/og-default.png',
    updatedAt: new Date().toISOString(),
  };
  saveOverrides(dir, ov);
  return ov.pages[route];
}

/* 把覆盖值压进静态页 + 运行期数据（搜索引擎读的那份 & 浏览器重画的那份都要改） */
function patchMetaTag(html, key, value, attr) {
  const re = new RegExp('(<meta[^>]+' + attr + '=["\']' + key + '["\'][^>]*?content=["\'])(.*?)(["\'])', 'is');
  return html.replace(re, (m, a, _b, c) => a + esc(value) + c);
}
function applyOverrides(dir) {
  const ov = loadOverrides(dir);
  const pages = ov.pages || {};
  const changed = [];
  const routes = Object.keys(pages);
  if (!routes.length) return changed;

  // 1) 静态 HTML：title / description / og / twitter / H1
  for (const route of routes) {
    const f = path.join(dir, route.replace(/^\//, ''), 'index.html');
    if (!fs.existsSync(f)) continue;
    let s = fs.readFileSync(f, 'utf8');
    const before = s;
    const { title, meta, h1, ogImage } = pages[route];
    if (title) {
      s = s.replace(/<title[^>]*>[\s\S]*?<\/title>/i, '<title>' + esc(title) + '</title>');
      s = patchMetaTag(s, 'og:title', title, 'property');
      s = patchMetaTag(s, 'twitter:title', title, 'name');
    }
    if (meta) {
      s = patchMetaTag(s, 'description', meta, 'name');
      s = patchMetaTag(s, 'og:description', meta, 'property');
      s = patchMetaTag(s, 'twitter:description', meta, 'name');
    }
    if (ogImage) {
      s = patchMetaTag(s, 'og:image', ogImage, 'property');
      s = patchMetaTag(s, 'twitter:image', ogImage, 'name');
    }
    if (h1) s = s.replace(/<h1([^>]*)>[\s\S]*?<\/h1>/i, (m, a) => '<h1' + a + '>' + esc(h1) + '</h1>');
    if (s !== before) { fs.writeFileSync(f, s, 'utf8'); changed.push(route.replace(/^\//, '') + 'index.html'); }
  }

  // 2) 每页运行期数据：BX_METADATA / REPAIR_PAGE_META / BX_PAGES 内联 H1
  for (const route of routes) {
    const f = path.join(dir, 'data/runtime-pages-niles-20261111', route.replace(/^\//, ''), 'index.json');
    if (!fs.existsSync(f)) continue;
    let d;
    try { d = JSON.parse(fs.readFileSync(f, 'utf8')); } catch { continue; }
    const { title, meta, h1 } = pages[route];
    let dirty = false;
    for (const layer of ['BX_METADATA_3825375', 'REPAIR_PAGE_META_2868885', 'WHOLE_PAGE_META_3116670']) {
      const e = d[layer] && d[layer][route];
      if (e && typeof e === 'object' && ('title' in e || 'description' in e)) {
        if (title && 'title' in e) { e.title = title; dirty = true; }
        if (meta && 'description' in e) { e.description = meta; dirty = true; }
      }
    }
    const bp = d.BX_PAGES_3321510 && d.BX_PAGES_3321510[route];
    if (bp && typeof bp.html === 'string' && h1) {
      const n = bp.html.replace(/<h1([^>]*)>[\s\S]*?<\/h1>/i, (m, a) => '<h1' + a + '>' + esc(h1) + '</h1>');
      if (n !== bp.html) { bp.html = n; dirty = true; }
    }
    if (dirty) { fs.writeFileSync(f, JSON.stringify(d), 'utf8'); changed.push('data/runtime-pages-niles-20261111/' + route.replace(/^\//, '') + 'index.json'); }
  }

  // 3) 全站共享数据：分类页的 H1 与面包屑同源字段
  const sf = path.join(dir, SHARED);
  if (fs.existsSync(sf)) {
    let d;
    try { d = JSON.parse(fs.readFileSync(sf, 'utf8')); } catch { d = null; }
    if (d) {
      let dirty = false;
      for (const route of routes) {
        const h1 = pages[route].h1;
        if (!h1) continue;
        for (const layer of ['BX_COLLECTIONS_3278913', 'BX_CATEGORIES_3274997']) {
          const e = d[layer] && d[layer][route];
          if (e && typeof e.title === 'string' && e.title !== h1) { e.title = h1; dirty = true; }
        }
      }
      if (dirty) { fs.writeFileSync(sf, JSON.stringify(d), 'utf8'); changed.push(SHARED); }
    }
  }
  return changed;
}

/* tRPC httpBatchLink + superjson 的返回包装 */
function trpcWrap(data, batched) {
  const one = { result: { data: { json: data } } };
  return batched ? [one] : one;
}
function trpcInput(url, body) {
  let raw = null;
  if (url.searchParams.has('input')) {
    try { raw = JSON.parse(url.searchParams.get('input')); } catch {}
  }
  if (!raw && body && typeof body === 'object') raw = body;
  if (raw && typeof raw === 'object' && ('0' in raw)) {
    const v = raw['0'];
    return (v && typeof v === 'object' && 'json' in v) ? v.json : v;
  }
  return raw && typeof raw === 'object' && 'json' in raw ? raw.json : (raw || {});
}

/* GitHub：本机凭据不落盘，运行时向 git 凭据助手要 */
function githubToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  const out = execFileSync('git', ['credential', 'fill'],
    { input: 'protocol=https\nhost=github.com\n\n', encoding: 'utf8', timeout: 15000 });
  const m = /^password=(.+)$/m.exec(out);
  if (!m) throw new Error('NO_GITHUB_CREDENTIAL');
  return m[1].trim();
}
const GH_REPO = process.env.GITHUB_REPO || '1114794665-gif/-';
const GH_BRANCH = process.env.GITHUB_BRANCH || 'deploy/cloudflare-free';

async function ghFetch(apiPath, opts = {}, token) {
  const tk = token || githubToken();
  const r = await fetch('https://api.github.com/repos/' + GH_REPO + apiPath, {
    ...opts,
    headers: { 'Authorization': 'Bearer ' + tk, 'User-Agent': 'boom-seo-editor',
      'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json',
      ...(opts.headers || {}) },
  });
  if (!r.ok) throw new Error('GITHUB_' + r.status + ' ' + (await r.text()).slice(0, 180));
  return r.json();
}
async function githubPutFile(filePath, text, message, token) {
  const q = '/contents/' + filePath + '?ref=' + encodeURIComponent(GH_BRANCH);
  let sha;
  try { const cur = await ghFetch(q, {}, token); sha = cur.sha; } catch (e) { if (!/GITHUB_404/.test(String(e))) throw e; }
  const body = { message: message || 'SEO editor: update ' + filePath, content: Buffer.from(text, 'utf8').toString('base64'), branch: GH_BRANCH };
  if (sha) body.sha = sha;
  return ghFetch('/contents/' + filePath, { method: 'PUT', body: JSON.stringify(body) }, token);
}

module.exports = { loadOverrides, saveOverrides, listPages, upsert, applyOverrides,
  trpcWrap, trpcInput, githubToken, githubPutFile, ghFetch, GH_REPO, GH_BRANCH, OV, IDX };
