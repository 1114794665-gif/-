import { createRequire } from 'module';
const require = createRequire('C:/Users/Administrator/WorkBuddy/2026-10-10-21-06-28/evercup-site/');

const SLUGS = ['16-oz-light-up-acrylic-shaker', 'custom-led-light-up-coasters',
  'multicolor-led-light-up-ice-cubes', 'electric-wine-opener-s-2',
  'rechargeable-wine-opener', 'rechargeable-wine-aerator-dispenser'];
const SKUS = ['JBPJ-061', 'BD-003', 'FGB-003', 'KPQ-009', 'KPQ-011', 'JBPJ-073'];
const PAGES = process.argv.slice(2);

const { chromium } = require('playwright');

const run = async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const out = [];
  for (const p of PAGES) {
    const page = await ctx.newPage();
    const failedReqs = [];
    page.on('requestfailed', r => failedReqs.push(r.url()));
    try {
      const resp = await page.goto('https://www.boomdrinkware.com' + p, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(4500);
      const r = await page.evaluate(({ SLUGS, SKUS }) => {
        const links = [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href'));
        const badLinks = links.filter(h => SLUGS.some(s => h && h.includes('/products/' + s)));
        // 卡片与型号文本
        const text = document.body.innerText || '';
        const skuHits = SKUS.filter(s => new RegExp('\\b' + s + '\\b').test(text));
        // 语言切换器
        const switcher = [...document.querySelectorAll('a')].filter(a => /^(EN \| 中文|中文 \| EN)$/.test((a.textContent || '').trim()));
        const swInfo = switcher.map(a => ({ href: a.getAttribute('href'), text: a.textContent.trim() }));
        // 破图
        const imgs = [...document.images];
        const broken = imgs.filter(i => i.complete && i.naturalWidth === 0).map(i => i.currentSrc || i.src);
        // 空卡片（有卡片外壳但无图无字）
        const cards = [...document.querySelectorAll('.ec-library-card, .led-product, .op-product')];
        const emptyCards = cards.filter(c => !c.querySelector('img') && !(c.innerText || '').trim()).length;
        return {
          totalLinks: links.length, badLinks: badLinks.length, badSample: badLinks.slice(0, 5),
          skuHits, switcherCount: switcher.length, swInfo,
          imgCount: imgs.length, brokenCount: broken.length, brokenSample: broken.slice(0, 3),
          cardCount: cards.length, emptyCards,
          title: document.title.slice(0, 80),
        };
      }, { SLUGS, SKUS });
      out.push({ page: p, status: resp.status(), ...r, failedReqs: failedReqs.length });
      console.log(JSON.stringify({ page: p, status: resp.status(), ...r, failedReqs: failedReqs.length }));
    } catch (e) {
      console.log(JSON.stringify({ page: p, error: String(e.message || e).slice(0, 120) }));
    }
    await page.close();
  }
  await browser.close();
};
run();
