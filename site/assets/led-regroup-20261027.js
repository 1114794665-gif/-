/* LED 杯具页重新分栏（2026-10-27）
   合并之后原来的四栏严重失衡：杯类 16 张、岩石杯只剩 1 张。
   这里按「杯型」重排成五栏，并同步改标题、栏内计数、栏说明、顶部跳转和筛选下拉。
   页面是前端渲染的，所以渲染完成后操作真实 DOM；幂等，可被 MutationObserver 补回。 */
(function () {
  'use strict';

  var PATH = location.pathname;
  if (!/led-light-up-cups/.test(PATH)) { return; }
  if (window.__EVERCUP_LED_REGROUP__ === 1) { return; }
  window.__EVERCUP_LED_REGROUP__ = 1;

  var isZh = /^\/zh\//.test(PATH);

  var GROUPS = [
    { id: 'led-cup-styles',
      en: 'Beer & pilsner mugs', zh: '啤酒杯与品脱',
      pe: 'Boots, mugs and pilsners — the shapes that photograph best in a crowd.',
      pz: '靴形、马克、品脱 —— 人群里最出片的就是这几种。',
      skus: ['FGB-006', 'FGB-010', 'FGB-012'] },
    { id: 'led-rocks-cups',
      en: 'Rocks, whiskey & shot', zh: '岩石杯、威士忌与一口杯',
      pe: 'Short pours — whiskey, shots and 2 oz service at the bar.',
      pz: '短饮 —— 威士忌、一口杯，吧台上的 2 oz 服务。',
      skus: ['FGB-013', 'FGB-016', 'JBPJ-101'] },
    { id: 'led-stemware',
      en: 'Wine, champagne & martini', zh: '红酒杯、香槟与马天尼',
      pe: 'Stemware that carries the light inside the stem.',
      pz: '光藏在杯杆里 —— 红酒杯、香槟杯、马天尼。',
      skus: ['FGB-017', 'FGB-019', 'FGB-023'] },
    { id: 'led-tumblers',
      en: 'Tumblers & to-go', zh: '随行杯与直身杯',
      pe: 'Straight walls, lids and straws — for bar and event service.',
      pz: '直身、带盖、带吸管 —— 酒吧和活动跑量用。',
      skus: ['FGB-027', 'FGB-030', 'FGB-033'] },
    { id: 'led-shot-cups',
      en: 'Novelty & statement pieces', zh: '造型款与话题款',
      pe: 'Skulls, disco balls and jars — the ones guests take home.',
      pz: '骷髅、迪斯科球、梅森罐 —— 客人会带回家的那一只。',
      skus: ['FGB-031', 'FGB-034', 'FGB-037', 'FGB-038'] }
  ];

  function label(g) { return isZh ? g.zh : g.en; }
  function purpose(g) { return isZh ? g.pz : g.pe; }
  function countText(n) { return isZh ? n + ' 个型号' : n + ' models'; }

  function ensure(g, template) {
    var sec = document.getElementById(g.id);
    if (!sec || !sec.classList.contains('bx-product-group')) {
      sec = document.createElement('section');
      sec.className = 'bx-product-group';
      sec.id = g.id;
      sec.innerHTML = '<div class="bx-group-heading"><h2></h2><span></span></div>' +
                      '<p class="bx-group-purpose"></p><div class="bx-model-grid"></div>';
    }
    var head = sec.querySelector('.bx-group-heading');
    if (!head) {
      head = document.createElement('div');
      head.className = 'bx-group-heading';
      head.innerHTML = '<h2></h2><span></span>';
      sec.insertBefore(head, sec.firstChild);
    }
    var h2 = head.querySelector('h2');
    if (h2) { h2.textContent = label(g); }
    var p = sec.querySelector('.bx-group-purpose');
    if (p) { p.textContent = purpose(g); }
    var grid = sec.querySelector('.bx-model-grid');
    if (!grid) {
      grid = document.createElement('div');
      grid.className = 'bx-model-grid';
      sec.appendChild(grid);
    }
    return { sec: sec, head: head, grid: grid };
  }

  function run() {
    var all = document.querySelectorAll('.ec-library-card[data-model], [data-model].ec-library-card');
    if (!all.length) { return false; }
    var cards = {};
    for (var i = 0; i < all.length; i++) {
      cards[all[i].getAttribute('data-model')] = all[i];
    }
    var host0 = document.querySelector('.bx-product-group');
    if (!host0 || !host0.parentNode) { return false; }
    var host = host0.parentNode;

    var placed = 0;
    GROUPS.forEach(function (g) {
      var dom = ensure(g);
      if (!dom.sec.parentNode) { host.appendChild(dom.sec); }   // 新建的栏先挂上去
      var n = 0;
      g.skus.forEach(function (sku) {
        var c = cards[sku];
        if (!c) { return; }
        dom.grid.appendChild(c);
        n++;
      });
      var span = dom.head.querySelector('span');
      if (span) { span.textContent = countText(n); }
      dom.sec.style.display = (n === 0) ? 'none' : '';
      placed += n;
    });

    // 按定义顺序排好五栏
    var cursor = document.querySelector('.bx-product-group');
    GROUPS.forEach(function (g) {
      var s = document.getElementById(g.id);
      if (!s || s.parentNode !== host || !cursor) { return; }
      if (s === cursor) { cursor = s.nextSibling; return; }
      host.insertBefore(s, cursor);
      cursor = s.nextSibling;
    });

    // 顶部「跳到某一类」
    var nav = document.querySelector('.bx-group-jumps') ||
              document.querySelector('.ec-library-group-links');
    if (nav) {
      nav.innerHTML = GROUPS.map(function (g) {
        return '<a href="#' + g.id + '">' + label(g) + '</a>';
      }).join('');
    }
    // 筛选下拉：只改「杯型」那个（选项里带 All product types / 全部杯型）
    var sels = document.querySelectorAll('select');
    for (var k = 0; k < sels.length; k++) {
      var first = sels[k].options[0];
      var t0 = first ? (first.textContent || '') : '';
      if (!/All product types|全部杯型|All product/i.test(t0)) { continue; }
      sels[k].innerHTML = '<option value="">' + t0 + '</option>' +
        GROUPS.map(function (g) {
          return '<option value="' + g.id + '">' + label(g) + '</option>';
        }).join('');
      break;
    }
    return placed > 0;
  }

  function boot() {
    try { run(); } catch (e) {}
    if (typeof MutationObserver !== 'function') { return; }
    var tries = 0;
    var mo = new MutationObserver(function () {
      if (tries++ > 18) { mo.disconnect(); return; }
      var first = document.querySelector('.bx-product-group');
      var h2 = first && first.querySelector('h2');
      // 被重新渲染回去的话，标题会变回英文长名，这里补一次
      if (h2 && !/^(Beer|啤酒|Beer & pilsner)/.test(h2.textContent)) {
        try { run(); } catch (e) {}
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); }, 9000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
