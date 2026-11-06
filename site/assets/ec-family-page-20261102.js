/* 产品详情页：同系列其他型号（2026-11-02）
 *
 * 做什么：
 *   产品页在规格表下面多一块「Other models in this series」——
 *   同一个主产品名下的全部型号，带图、带容量材质，点一个就切过去。
 *   本页上的型号标 This model，不重复链接到别处。
 *
 * 为什么不能写在 HTML 里：
 *   产品页正文是主脚本渲染的，静态写进去的区块加载后会被整段覆盖。
 *   所以改成渲染完再补，数据来自 /data/product-families.json?v=20261106-boom1
 *   （跟列表页那个下拉同一份，改主表重跑生成器即可两边同步）。
 *
 * 站内点产品是框架内跳转、整页不重载，所以要盯地址变化重新挂。
 */
(function () {
  'use strict';

  var V = '20261102a';
  var ID = 'ec-family-page';
  var ZH = /^\/zh(\/|$)/.test(location.pathname);

  var TXT = ZH ? {
    kicker: '同一系列',
    h2: '同系列其他型号',
    lead: '同模具、同工艺路线，只改容量、颜色或材质。挑两三个一起打样，比一个个单独开更划算。',
    current: '当前型号',
    more: function (n) { return '展开全部 ' + n + ' 个型号'; },
    less: '收起',
    main: '主型号',
    quote: '询价这个型号',
    view: '查看详情',
    onPage: '同页款式'
  } : {
    kicker: 'SAME FAMILY',
    h2: 'Other models in this series',
    lead: 'Same tooling and decoration route — only capacity, colour-way or material changes. Sample two or three together instead of opening them one by one.',
    current: 'This model',
    more: function (n) { return 'Show all ' + n + ' models'; },
    less: 'Show fewer',
    main: 'Main model',
    quote: 'Quote this model',
    view: 'View details',
    onPage: 'On this page'
  };

  var CSS = [
    '#ec-family-page .ec-pgm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(182px,1fr));gap:16px;align-items:stretch}',
    '.ec-pgm-card{display:flex;flex-direction:column;height:100%;background:#fff;border:1px solid #dce4da;border-radius:6px;overflow:hidden;text-decoration:none;color:inherit;transition:border-color .16s,box-shadow .16s;position:relative}',
    '.ec-pgm-card:hover{border-color:#233f35;box-shadow:0 3px 14px rgba(35,63,53,.09)}',
    '.ec-pgm-card.is-current{border-color:#233f35;background:#f8f9f5;cursor:default}',
    '.ec-pgm-card.is-current .ec-pgm-facts{margin-top:auto;padding-top:9px}',
    '.ec-pgm-card.is-same-page:hover{border-color:#dce4da;box-shadow:none}',
    '.ec-pgm-badge-soft{background:#eef2e9;color:#3d5a4c}',
    '.ec-pgm-quote{margin-top:auto;padding-top:9px;align-self:flex-start;font-size:11.5px;font-weight:600;color:#b9603c;text-decoration:none;border-bottom:1px solid rgba(185,96,60,.35);padding-bottom:1px}',
    '.ec-pgm-quote:hover{color:#8f4527;border-bottom-color:#8f4527}',
    '.ec-pgm-view{margin-top:auto;padding-top:9px;align-self:flex-start;font-size:11.5px;font-weight:600;color:#3d5a4c;opacity:.75}',
    '.ec-pgm-media{display:flex;align-items:center;justify-content:center;padding:12px;aspect-ratio:1/1;background:#fff}',
    '.ec-pgm-media img{max-width:100%;max-height:100%;object-fit:contain}',
    '.ec-pgm-body{padding:0 13px 14px;display:flex;flex-direction:column;gap:3px;flex:1}',
    '.ec-pgm-sku{font-size:10.5px;letter-spacing:.07em;color:#65776c;font-weight:600}',
    '.ec-pgm-name{font-size:13px;line-height:1.35;color:#24382e;font-weight:600;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}',
    '.ec-pgm-facts{font-size:11.5px;color:#65776c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.ec-pgm-badge{position:absolute;top:9px;left:9px;background:#233f35;color:#fff;font-size:10px;letter-spacing:.05em;border-radius:999px;padding:3px 9px}',
    '.ec-pgm-more{margin-top:18px;display:inline-flex;align-items:center;gap:7px;border:1px solid #dce4da;background:#fff;color:#233f35;border-radius:999px;padding:9px 16px;font:600 12.5px/1.2 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;cursor:pointer}',
    '.ec-pgm-more:hover{border-color:#233f35;background:#f1f5ee}',
    '.ec-pgm-hidden{display:none}',
    '@media(max-width:640px){#ec-family-page .ec-pgm-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.ec-pgm-name{font-size:12px}}'
  ].join('');

  var DATA = null, KEY = '', TIMER = null, RENDERING = false, LOADING = false;

  function normPath(p) {
    p = String(p || '/').split('#')[0].split('?')[0];
    if (p.charAt(p.length - 1) !== '/') p += '/';
    return p;
  }

  /* 中文站在 /zh/ 下，但数据按英文地址存 —— 查询前剥掉前缀 */
  function pageKey() {
    return normPath(location.pathname).replace(/^\/zh\//, '/');
  }

  function routePath(r) {
    return normPath(r);
  }

  function withZh(href) {
    if (!ZH) return href;
    if (/^\/zh\//.test(href)) return href;
    return '/zh' + href;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function label(item) {
    var t = ZH ? (item.zhName || item.name) : (item.name || item.zhName);
    t = String(t || item.sku);
    if (!ZH) t = t.replace(/^BOOM Drinkware\s+/i, '');
    return t;
  }

  function findFamily() {
    if (!DATA || !DATA.byMain) return null;
    var p = pageKey(), k, f, i;
    for (k in DATA.byMain) {
      f = DATA.byMain[k];
      if (routePath(f.route) === p) return f;
      for (i = 0; i < f.children.length; i++) {
        if (routePath(f.children[i].route) === p) return f;
      }
    }
    return null;
  }

  /* 当前正在看哪个型号：只认规格表 Model 行。
     地址上的 #model-XXX 不能作准 —— 站内同页多型号共用一张页面，
     带个 hash 进来内容并不会跟着换，按 hash 标 This model 会张冠李戴。 */
  function currentSku(fam) {
    var ths = document.querySelectorAll('.bx-spec-table th');
    for (var i = 0; i < ths.length; i++) {
      if ((ths[i].textContent || '').trim().toLowerCase() === 'model') {
        var td = ths[i].nextElementSibling;
        if (td) {
          var v = (td.textContent || '').trim().split(/[\s/]+/)[0];
          if (v) return v;
        }
      }
    }
    return routePath(fam.route) === pageKey() ? fam.sku : '';
  }

  function injectCSS() {
    if (document.getElementById('ec-pgm-css')) return;
    var s = document.createElement('style');
    s.id = 'ec-pgm-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function cardEl(item, isCurrent, isMain, samePage) {
    /* 同页型号（站内把一款的多个型号合并到一张页面）没法点开看 —— 点过去还是这一页。
       所以这类卡片不做跳转，改成「按这个型号询价」，B2B 本来也是按型号报价。 */
    var tag = (isCurrent || samePage) ? 'div' : 'a';
    var el = document.createElement(tag);
    el.className = 'ec-pgm-card' + (isCurrent ? ' is-current' : '') + (samePage && !isCurrent ? ' is-same-page' : '');
    el.setAttribute('data-sku', item.sku);
    if (tag === 'a') {
      el.href = withZh(item.route);
      el.setAttribute('data-discover', 'true');
    }

    var badge = '';
    if (isCurrent) badge = '<span class="ec-pgm-badge">' + esc(TXT.current) + '</span>';
    else if (isMain) badge = '<span class="ec-pgm-badge">' + esc(TXT.main) + '</span>';

    var extra = '';
    if (isCurrent) extra = '';
    else if (samePage) {
      /* 同页型号点不开，但可以直接按这个型号询价 */
      extra = '<a class="ec-pgm-quote" href="' + esc(withZh('/contact/?models=' + encodeURIComponent(item.sku))) + '">' + esc(TXT.quote) + ' →</a>';
    } else {
      /* 有独立页面的型号：整张卡本来就是链接，这里只放一行提示，保持每张卡底部对齐 */
      extra = '<span class="ec-pgm-view">' + esc(TXT.view) + ' →</span>';
    }

    var img = item.image ? '<img src="' + esc(item.image) + '" alt="' + esc(label(item)) + '" loading="lazy" width="200" height="200">' : '';
    el.innerHTML = badge +
      '<span class="ec-pgm-media">' + img + '</span>' +
      '<span class="ec-pgm-body">' +
      '<span class="ec-pgm-sku">' + esc(item.sku) + '</span>' +
      '<span class="ec-pgm-name">' + esc(label(item)) + '</span>' +
      '<span class="ec-pgm-facts">' + esc(item.facts || '') + '</span>' +
      extra +
      '</span>';
    return el;
  }

  function buildSection(fam, cur) {
    var onMainPage = routePath(fam.route) === pageKey();

    /* 本页是主型号的页面：列出全部子型号；
       本页是某个子型号的页面（跨页挂靠）：把主型号也列进来，方便看清楚根在哪 */
    /* 主型号自己也算一张卡：本页就是它时标 This model，
       本页是别的子型号时标 Main model，让买家知道这个系列的家在哪。 */
    var items = [{ item: fam, main: !onMainPage }];
    fam.children.forEach(function (c) { items.push({ item: c, main: false }); });

    var list = items.filter(function (x) { return x.item.sku !== cur; });
    var total = list.length;
    if (!total) return null;

    var sec = document.createElement('section');
    sec.className = 'bx-section';
    sec.id = ID;
    sec.setAttribute('data-fam', fam.sku);

    var head = document.createElement('div');
    head.className = 'bx-section-heading';
    head.innerHTML = '<div><p class="bx-kicker">' + esc(TXT.kicker) + '</p><h2>' + esc(TXT.h2) + '</h2></div>' +
      '<p>' + esc(TXT.lead) + '</p>';
    sec.appendChild(head);

    var grid = document.createElement('div');
    grid.className = 'ec-pgm-grid';
    var LIMIT = 8;
    list.forEach(function (x, i) {
      var card = cardEl(x.item, false, x.main, routePath(x.item.route) === pageKey());
      if (i >= LIMIT) card.classList.add('ec-pgm-hidden');
      grid.appendChild(card);
    });
    /* 当前型号也放进去，排最前面，标 This model */
    var self = items.filter(function (x) { return x.item.sku === cur; })[0];
    if (self) grid.insertBefore(cardEl(self.item, true, self.main, true), grid.firstChild);

    sec.appendChild(grid);

    if (total > LIMIT) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ec-pgm-more';
      btn.textContent = TXT.more(items.length);
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        /* 第一张是当前型号，永远显示；收起时只保留前 8 张 + 当前型号 */
        Array.prototype.forEach.call(grid.children, function (c, i) {
          if (open) {
            if (i >= LIMIT + 1) c.classList.add('ec-pgm-hidden');
          } else {
            c.classList.remove('ec-pgm-hidden');
          }
        });
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        btn.textContent = open ? TXT.more(list.length) : TXT.less;
      });
      sec.appendChild(btn);
    }

    return sec;
  }

  function mount(sec) {
    var old = document.getElementById(ID);
    if (old && old.parentNode) old.parentNode.removeChild(old);

    var anchor = document.querySelector('#ec-series-block') ||
      document.querySelector('#specifications') ||
      document.querySelector('.bx-page-tabs');
    if (!anchor || !anchor.parentNode) return false;
    anchor.parentNode.insertBefore(sec, anchor.nextSibling);
    return true;
  }

  function updateCurrent(sec, cur) {
    var cards = sec.querySelectorAll('.ec-pgm-card');
    var found = false;
    Array.prototype.forEach.call(cards, function (c) {
      var hit = c.getAttribute('data-sku') === cur;
      c.classList.toggle('is-current', hit);
      if (hit) found = true;
    });
    return found;
  }

  function render(force) {
    if (RENDERING) return;
    /* 全站都加载这个脚本（站内换页不会重新执行页面里的 script），
       所以不在产品页时什么都不做，只把残留撤掉。 */
    if (!isProductPage()) {
      var stale = document.getElementById(ID);
      if (stale && stale.parentNode) stale.parentNode.removeChild(stale);
      return;
    }
    if (!DATA) return;
    var fam = findFamily();
    if (!fam) return;
    var cur = currentSku(fam) || '';
    var existing = document.getElementById(ID);

    /* 同一个系列、同一个型号 —— 已经画好了，收工。
       型号识别晚一步（表格还没渲染）时会先按空值画一次，等识别出来再重画一次。 */
    if (existing && !force &&
        existing.getAttribute('data-fam') === fam.sku &&
        existing.getAttribute('data-cur') === cur) {
      return;
    }

    RENDERING = true;
    try {
      injectCSS();
      var sec = buildSection(fam, cur);
      if (sec) {
        sec.setAttribute('data-cur', cur);
        mount(sec);
      }
    } finally {
      RENDERING = false;
    }
  }

  function tick() {
    var k = location.pathname + '|' + location.hash;
    if (k !== KEY) {
      KEY = k;
      if (isProductPage() && !DATA) {
        loadData(function () { render(true); });
        return;
      }
      render(true);
    } else {
      render(false);
    }
  }

  function schedule() {
    if (TIMER) clearTimeout(TIMER);
    TIMER = setTimeout(function () { TIMER = null; tick(); }, 150);
  }

  function loadData(cb) {
    if (DATA) { cb(); return; }
    if (LOADING) return;
    LOADING = true;
    var x = new XMLHttpRequest();
    x.open('GET', '/data/product-families.json?v=20261106-boom1' + V + '-' + Math.floor(Date.now() / 3600000), true);
    x.onload = function () {
      LOADING = false;
      try { DATA = JSON.parse(x.responseText); } catch (e) { return; }
      if (DATA && DATA.byMain) cb();
    };
    x.onerror = function () { LOADING = false; };
    x.send();
  }

  function isProductPage() {
    return /\/products\//.test(location.pathname);
  }

  function boot() {
    injectCSS();
    /* 监听先挂上：站内从列表页点进产品页时，页面里的 script 不会再执行一次，
       所以这个脚本全站常驻，靠监听切页。 */
    var root = document.body || document.documentElement;
    new MutationObserver(function () { schedule(); }).observe(root, { childList: true, subtree: true });
    window.addEventListener('popstate', function () { KEY = ''; schedule(); });
    window.addEventListener('hashchange', function () { schedule(); });

    /* 首页、列表页用不上这份数据 —— 等真的进到产品页再拉 */
    if (isProductPage()) {
      loadData(function () {
        render(true);
        [400, 1000, 2200, 3800].forEach(function (ms) { setTimeout(function () { render(false); }, ms); });
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
