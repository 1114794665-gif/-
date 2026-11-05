/*! EVERCUP 2026-10-28  配件页「一族多形态」索引条
 *
 * 背景：一族产品合并进一个主款后，分类页这一栏只剩一张卡。
 * 只留一张卡是对的（型号不重复占位），但页面会显得空，客户也看不出
 * 这一族到底有几种形态 —— 所以在卡片下面补一条形态索引：
 * 每个形态一个 chip，点进去直接落到主款页对应的同系列卡片（#model-型号）。
 *
 * 2026-10-28 改成支持多族：FAMILIES 数组，一族一条。
 *   ① silicone-straws 吸管（10 形态，主款 GJXG-001）
 *   ② drink-markers 酒杯挂饰/标记（15 造型 + 主款，主款 JBPJ-074）
 */
(function () {
  'use strict';
  var ZH = /^\/zh(\/|$)/.test(location.pathname);

  var FAMILIES = [
    {
      group: 'silicone-straws',
      sku: 'GJXG-001',
      slug: '/products/silicone-sili-straw/',
      kickerZh: '这一族还有 10 种形态',
      kickerEn: '10 more forms in this family',
      leadZh: '同一副模具、同一条硅胶线。点形态直接看那一款的照片与报价入口：',
      leadEn: 'Same mould, same silicone line. Pick a form to jump to its photo and quote entry:',
      allZh: '看全部 11 个型号 →',
      allEn: 'See all 11 models →',
      items: [
        { sku: 'JBPJ-005', en: 'Straight', zh: '直管' },
        { sku: 'JBPJ-006', en: 'Bendy', zh: '弯管' },
        { sku: 'GJXG-002', en: 'Long / smoothie', zh: '加长管' },
        { sku: 'GJXG-003', en: 'Short stopper', zh: '短款防倒灌' },
        { sku: 'JBPJ-007', en: 'Custom shape', zh: '定制造型' },
        { sku: 'JBPJ-008', en: 'Decorated', zh: '带装饰' },
        { sku: 'JBPJ-009', en: 'Polybag set', zh: '袋装套装' },
        { sku: 'JBPJ-010', en: 'Kraft box', zh: '牛皮纸盒' },
        { sku: 'JBPJ-011', en: 'Retail window box', zh: '开窗零售盒' },
        { sku: 'JBPJ-094', en: 'Glow', zh: '发光款' }
      ]
    },
    {
      group: 'drink-markers',
      sku: 'JBPJ-074',
      slug: '/products/koala-shaped-silicone-wine-glass-charms/',
      kickerZh: '这一族还有 15 种造型',
      kickerEn: '15 more shapes in this family',
      leadZh: '同一副模具、同一条硅胶线，差别只在造型。点造型直接看那一款的照片与报价入口：',
      leadEn: 'One mould, one silicone line — the shape is what changes. Pick a shape to jump to its photo and quote entry:',
      allZh: '看全部 16 个型号 →',
      allEn: 'See all 16 models →',
      items: [
        { sku: 'JBPJ-074', en: 'Koala', zh: '考拉' },
        { sku: 'JBPJ-075', en: 'Cat (black / white)', zh: '黑白猫' },
        { sku: 'JBPJ-076', en: 'Butterfly', zh: '蝴蝶' },
        { sku: 'JBPJ-077', en: 'Alphabet', zh: '字母' },
        { sku: 'JBPJ-078', en: 'Pineapple', zh: '菠萝' },
        { sku: 'JBPJ-079', en: 'Flamingo', zh: '火烈鸟' },
        { sku: 'JBPJ-080', en: 'Fish & turtle', zh: '鱼·龟' },
        { sku: 'JBPJ-081', en: 'Black bow', zh: '蝴蝶结' },
        { sku: 'JBPJ-082', en: 'Flower & ring', zh: '花朵+圆环' },
        { sku: 'JBPJ-083', en: 'Ring (multi colour)', zh: '多色圆环' },
        { sku: 'JBPJ-084', en: 'Spiral', zh: '螺旋' },
        { sku: 'JBPJ-085', en: 'Alpaca & cat', zh: '羊驼·猫' },
        { sku: 'JBPJ-086', en: 'Snail', zh: '蜗牛' },
        { sku: 'JBPJ-087', en: 'Lip print sticker', zh: '唇印杯贴' },
        { sku: 'JBPJ-088', en: 'Mice pair', zh: '卡通鼠' },
        { sku: 'JBPJ-089', en: 'Snowflake', zh: '雪花' }
      ]
    }
  ];

  function base(f) {
    return (ZH ? '/zh' : '') + f.slug;
  }

  function build(f) {
    var wrap = document.createElement('div');
    wrap.id = 'acc-family-strip-' + f.group;
    wrap.className = 'ec-acc-family';
    var chips = f.items.map(function (it) {
      return '<a href="' + base(f) + '#model-' + it.sku + '" title="' + it.sku + '" ' +
        'style="display:inline-flex;align-items:center;gap:6px;padding:7px 13px;border:1px solid #ded9cf;' +
        'border-radius:999px;background:#fff;color:#26251f;text-decoration:none;font-size:13px;line-height:1">' +
        (ZH ? it.zh : it.en) +
        '<span style="font-size:10.5px;letter-spacing:.04em;color:#8d887c;font-variant-numeric:tabular-nums">' +
        it.sku + '</span></a>';
    }).join('');
    wrap.innerHTML =
      '<div style="margin:26px 0 6px;padding:20px 22px;border:1px solid #e6e1d7;border-radius:14px;background:#fbfaf6">' +
      '<p style="margin:0 0 5px;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:#8d887c">' +
      (ZH ? f.kickerZh : f.kickerEn) + '</p>' +
      '<p style="margin:0 0 14px;font-size:13.5px;color:#5c594f">' + (ZH ? f.leadZh : f.leadEn) + '</p>' +
      '<div style="display:flex;flex-wrap:wrap;gap:8px">' + chips + '</div>' +
      '<p style="margin:16px 0 0"><a href="' + base(f) + '" style="font-size:13px;font-weight:600;' +
      'color:#26251f;text-decoration:none;border-bottom:1px solid #26251f;padding-bottom:1px">' +
      (ZH ? f.allZh : f.allEn) + '</a></p>' +
      '</div>';
    return wrap;
  }

  // 返回 true = 这一族不用再试（插好了 / 这页根本没有这一栏）
  function runOne(f) {
    if (document.getElementById('acc-family-strip-' + f.group)) { return true; }
    var sec = document.getElementById(f.group);
    if (!sec) { return true; }
    var grid = sec.querySelector('.bx-model-grid');
    if (!grid || !grid.querySelector('[data-model="' + f.sku + '"]')) { return false; }
    sec.appendChild(build(f));
    return true;
  }

  function runAll() {
    var allDone = true;
    for (var i = 0; i < FAMILIES.length; i++) {
      try { if (!runOne(FAMILIES[i])) { allDone = false; } } catch (e) { allDone = false; }
    }
    return allDone;
  }

  function boot() {
    var tries = 0;
    (function loop() {
      var ok = false;
      try { ok = runAll(); } catch (e) { ok = false; }
      if (ok) { return; }
      if (++tries > 120) { return; }
      setTimeout(loop, 150);
    })();
  }

  // 框架二次渲染会把插入的节点冲掉 —— 掉了补回来
  if ('MutationObserver' in window) {
    var t = null;
    new MutationObserver(function () {
      if (t) { return; }
      t = setTimeout(function () { t = null; try { runAll(); } catch (e) {} }, 300);
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
