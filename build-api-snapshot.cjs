// 生成 /api/products 用的产品快照：data/api-products-snapshot.json
// 数据来源：已发布的产品页自身（结构化数据）+ data/product-fields.json（起订量/材质/容量）
// 之所以在构建产物里生成，而不是从 site/ 只读：后台 SEO 改动是在构建时压进页面的，
// 快照必须和真正发出去的页面一致，否则接口会说出页面上没有的话。
const fs = require('fs');
const p = require('path');

const MAX_DESC = 400;
// 页面上写着「不再供货」的，一律不进快照（D 组五款目前是这种 200 状态，等批次 4 统一改 410）
const DISCONTINUED = /no longer in (our )?range|已下架|已不在产品目录|已停止供应|不再供应|已停产/i;

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return fallback; }
}

function jsonLdBlocks(html) {
  const out = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try { out.push(JSON.parse(m[1])); } catch (e) { /* 坏块跳过 */ }
  }
  return out;
}

function asArray(v) {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function relPath(u) {
  if (!u) return '';
  try { return new URL(u).pathname; } catch (e) { return String(u); }
}

function build(outDir) {
  const dataDir = p.join(outDir, 'data');
  const fields = readJson(p.join(dataDir, 'product-fields.json'), {});

  // 型号规格按英文路由归档，中文页共用同一份（中文页没有独立的型号数据）
  const byRoute = new Map();
  for (const key of Object.keys(fields)) {
    const cut = key.indexOf('#model-');
    if (cut < 0) continue;
    const route = key.slice(0, cut);
    if (!byRoute.has(route)) byRoute.set(route, []);
    const f = fields[key] || {};
    byRoute.get(route).push({
      sku: f.sku,
      moq: f.moq,
      materials: f.materials || [],
      capacities: f.capacities || [],
      processes: f.processes || [],
      accessories: f.accessories || []
    });
  }

  const langs = [
    { lang: 'en', dir: p.join(outDir, 'products'), prefix: '/products/' },
    { lang: 'zh', dir: p.join(outDir, 'zh', 'products'), prefix: '/zh/products/' }
  ];

  const products = [];
  const skipped = [];
  const noSchema = [];
  for (const L of langs) {
    if (!fs.existsSync(L.dir)) continue;
    for (const slug of fs.readdirSync(L.dir).sort()) {
      const file = p.join(L.dir, slug, 'index.html');
      if (!fs.existsSync(file)) continue;
      const html = fs.readFileSync(file, 'utf8');
      const blocks = jsonLdBlocks(html);
      const url = L.prefix + slug + '/';
      const prod = blocks.find((b) => b && b['@type'] === 'Product');
      const page = blocks.find((b) => b && b['@type'] === 'WebPage');
      const label = String((page && page.name) || (prod && prod.name) || '');
      if (DISCONTINUED.test(label)) { skipped.push(url); continue; }
      if (!prod) { noSchema.push(url); continue; }

      const enRoute = '/products/' + slug + '/';
      const models = byRoute.get(enRoute) || [];
      const primary = models.find((m) => m.sku && prod.sku && m.sku === prod.sku) || models[0] || {};

      const images = asArray(prod.image).map(relPath).filter(Boolean);
      const rec = {
        url,
        lang: L.lang,
        name: prod.name || '',
        sku: prod.sku || primary.sku || '',
        description: String(prod.description || '').slice(0, MAX_DESC),
        image: images[0] || '',
        images,
        moq: typeof primary.moq === 'number' ? primary.moq : null,
        materials: primary.materials || [],
        capacities: primary.capacities || []
      };
      if (models.length) {
        rec.models = models.map((m) => ({
          sku: m.sku,
          moq: m.moq,
          materials: m.materials,
          capacities: m.capacities
        }));
      }
      products.push(rec);
    }
  }

  products.sort((a, b) => (a.url === b.url ? a.lang.localeCompare(b.lang) : a.url.localeCompare(b.url)));

  const snapshot = {
    site: 'BOOM Drinkware',
    siteUrl: 'https://www.boomdrinkware.com/',
    scope: '在售产品页；已停供型号不在本快照内',
    generated: new Date().toISOString(),
    count: products.length,
    products
  };

  const target = p.join(dataDir, 'api-products-snapshot.json');
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(target, JSON.stringify(snapshot, null, 0));
  return { file: target, count: products.length, bytes: fs.statSync(target).size,
           skipped: skipped.length, noSchema: noSchema.length, skippedUrls: skipped, noSchemaUrls: noSchema };
}

module.exports = build;

if (require.main === module) {
  const r = build(p.join(process.cwd(), 'cloudflare-dist'));
  console.log('products:', r.count, 'bytes:', r.bytes, '->', r.file);
  console.log('跳过（页面已声明停供）:', r.skipped, '| 缺产品结构化数据:', r.noSchema);
}
