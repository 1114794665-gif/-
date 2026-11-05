/* 主产品 → 附属产品 下拉（2026-11-02）
 *
 * 做什么：
 *   列表页上，主产品卡片（主表「主产品与衍生款确认」里的主款）多一个按钮
 *   「▾ N related models」。点一下在那一行下面展开同系列的所有型号，再点收起。
 *   同一个主款的附属款，原本平铺在列表里的卡片会被折叠起来 —— 这样一屏
 *   先看到主款，想看细节再展开，不再是一大堆长得差不多的型号混在一起。
 *
 * 数据：/data/product-families.json（tools/gen_product_families_20261102.py 生成）
 *   只认站内两边都有页面的关系，打不开的型号不进下拉。
 *
 * 安全：
 *   * 不改 HTML，只在浏览器里折叠 / 插入面板 —— 爬虫看到的是完整列表；
 *   * 主款不在本页时，附属款卡片照常显示（否则这一页会凭空少东西）；
 *   * 幂等 + MutationObserver，React 重画也能补回来。
 */
(function () {
  'use strict';

  var V = '20261102a';
  var ZH = /^\/zh(\/|$)/.test(location.pathname);

  var TXT = ZH ? {
    more: function (n) { return n + ' 个同系列型号'; },
    less: '收起',
    core: '主款',
    variant: '衍生款',
    of: function (n) { return '属 ' + n + ' 系列'; },
    head: function (n) { return '同系列还有 ' + n + ' 个型号'; },
    hint: '尺寸、容量、材质不同的同系列款，可一起打样',
    hintMore: function (n) { return '共 ' + n + ' 个型号，面板内可上下滚动'; },
    series: function (a, b) { return a + ' 个系列 · ' + b + ' 个型号'; },
    legend: function (n) { return '主款为系列代表款；另有 ' + n + ' 个衍生款已收进主款下拉'; }
  } : {
    more: function (n) { return n + ' variant' + (n > 1 ? 's' : ''); },
    less: 'Hide',
    core: 'CORE MODEL',
    variant: 'VARIANT',
    of: function (n) { return 'of ' + n; },
    head: function (n) { return n + ' more in this family'; },
    hint: 'Same family — different size, capacity or material. Sample them together.',
    hintMore: function (n) { return 'All ' + n + ' models · scroll inside this panel'; },
    series: function (a, b) { return a + ' series · ' + b + ' models'; },
    legend: function (n) { return 'Dark badge = series lead model · ' + n + ' variants grouped under it'; }
  };

  var CARET = '<svg class="ec-caret" width="10" height="7" viewBox="0 0 10 7" aria-hidden="true" focusable="false"><path d="M1 1.5L5 5.5L9 1.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var CSS = [
    '.ec-fam-folded{display:none !important}',
    '.ec-fam-badge{display:inline-flex;align-items:center;gap:5px;align-self:flex-start;max-width:100%;margin-bottom:-3px;padding:4px 9px;border-radius:5px;font:700 10px/1.15 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;letter-spacing:.09em;text-transform:uppercase;text-decoration:none;white-space:nowrap}',
    '.ec-fam-badge-core{background:#233f35;color:#fff}',
    '.ec-fam-badge-sub{background:#f6f1e6;color:#7a6a4f;border:1px solid #e4d9c4}',
    '.ec-fam-badge-sub span{font-weight:600;letter-spacing:.03em;text-transform:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.ec-fam-badge-sub:hover{background:#233f35;color:#fff;border-color:#233f35}',
    '.ec-fam-legend{display:inline-flex;align-items:center;gap:6px;margin:0 0 0 auto;font:400 11.5px/1.3 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#7b8a7f;letter-spacing:.01em;text-transform:none}',
    '.ec-fam-legend i{display:inline-block;width:9px;height:9px;border-radius:2px;background:#233f35;flex:0 0 9px}',
    '@media(max-width:720px){.ec-fam-legend{display:none}}',
    '.ec-fam-folded+.ec-fam-panel{display:none !important}',
    '.ec-fam-toggle{display:inline-flex;align-items:center;gap:7px;align-self:flex-start;margin-top:auto;border:1px solid #dfd6c8;background:#f8f9f5;color:#233f35;border-radius:999px;padding:7px 13px;font:600 12.5px/1.2 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;cursor:pointer;transition:background .18s,border-color .18s,color .18s}',
    '.ec-fam-toggle:hover{border-color:#233f35;background:#eef3e9}',
    '.ec-fam-toggle[aria-expanded="true"]{background:#233f35;border-color:#233f35;color:#fff}',
    '.ec-fam-toggle .ec-caret{transition:transform .2s}',
    '.ec-fam-toggle[aria-expanded="true"] .ec-caret{transform:rotate(180deg)}',
    '.ec-fam-toggle-txt{white-space:nowrap}',
    '.ec-fam-panel{grid-column:1/-1;background:#f8f9f5;border:1px solid #dfe5dd;border-radius:15px;padding:16px 18px 18px;animation:ecFamIn .22s ease-out}',
    '.ec-fam-panel.ec-fam-scroll{max-height:46vh;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin}',
    '@keyframes ecFamIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}',
    '.ec-fam-panel[hidden]{display:none}',
    '.ec-fam-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:12px;flex-wrap:wrap}',
    '.ec-fam-head b{font-family:Fraunces,Georgia,serif;font-weight:600;font-size:15px;color:#233f35}',
    '.ec-fam-head span{font-size:11.5px;letter-spacing:.05em;color:#65776c}',
    '.ec-fam-grid{display:flex;flex-wrap:wrap;gap:10px}',
    '.ec-fam-item{display:flex;align-items:center;gap:10px;flex:1 1 260px;max-width:340px;background:#fff;border:1px solid #e7e2d7;border-radius:11px;padding:8px;text-decoration:none;color:inherit;min-width:0;transition:border-color .16s,box-shadow .16s}',
    '.ec-fam-item:hover{border-color:#233f35;box-shadow:0 2px 10px rgba(35,63,53,.08)}',
    '.ec-fam-item img{width:54px;height:54px;flex:0 0 54px;object-fit:contain;border-radius:8px;background:#fbfaf7}',
    '.ec-fam-item-txt{min-width:0}',
    '.ec-fam-item-name{font-size:13px;line-height:1.3;color:#24382e;font-weight:600;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}',
    '.ec-fam-item-meta{display:block;margin-top:3px;font-size:11.5px;color:#65776c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '@media(max-width:640px){.ec-fam-item{flex:1 1 100%;max-width:none}.ec-fam-item img{width:46px;height:46px;flex-basis:46px}.ec-fam-item-name{font-size:12px}}'
  ].join('');

  var DATA = null, BUSY = false, TIMER = null;

  function injectCSS() {
    if (document.getElementById('ec-fam-css')) return;
    var s = document.createElement('style');
    s.id = 'ec-fam-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function skuOf(card) {
    var m = card.getAttribute('data-model');
    if (m) return m.trim();
    var el = card.querySelector('.ec-library-model');
    return el ? String(el.textContent || '').trim() : '';
  }

  function cards() {
    return Array.prototype.slice.call(document.querySelectorAll('article.ec-library-card'));
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function label(item) {
    var t = ZH ? (item.zhName || item.name) : (item.name || item.zhName);
    t = String(t || item.sku);
    /* 品牌名每张都有，去掉才看得出差别（34 个型号都叫 EVERCUP …） */
    if (!ZH) t = t.replace(/^EVERCUP\s+/i, '');
    return t;
  }

  /* 卡片左上角打标：主款 = CORE MODEL，衍生款 = VARIANT + 所属主款（可点回主款页） */
  function badge(card, kind, parentSku) {
    var el = card.querySelector('.ec-fam-badge');
    var host = card.querySelector('.ec-library-card-copy') || card;
    if (!el) {
      el = document.createElement(kind === 'sub' ? 'a' : 'span');
      el.className = 'ec-fam-badge';
      host.insertBefore(el, host.firstChild);
    } else if (el.parentElement !== host) {
      host.insertBefore(el, host.firstChild);
    }
    var want = kind === 'core'
      ? 'ec-fam-badge ec-fam-badge-core'
      : 'ec-fam-badge ec-fam-badge-sub';

    if (kind === 'core') {
      if (el.textContent !== TXT.core || el.className !== want) {
        el.className = want;
        el.textContent = TXT.core;
      }
      el.removeAttribute('href');
      return;
    }

    var target = DATA.byMain[parentSku];
    var txt = TXT.variant + (target ? ' · ' + TXT.of(parentSku) : '');
    var href = target && target.route ? target.route : '';
    if (el.getAttribute('data-txt') !== txt || el.className !== want) {
      el.className = want;
      el.setAttribute('data-txt', txt);
      el.innerHTML = '<span>' + esc(txt) + '</span>';
    }
    if (href) el.setAttribute('href', href);
    else el.removeAttribute('href');
  }

  function dropBadge(card) {
    var el = card.querySelector('.ec-fam-badge');
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function buildPanel(card, fam, btn) {
    var panel = document.createElement('div');
    panel.className = 'ec-fam-panel' + (fam.children.length > 12 ? ' ec-fam-scroll' : '');
    panel.id = 'ec-fam-' + String(fam.sku).replace(/[^A-Za-z0-9_-]/g, '');
    panel.hidden = true;

    var hint = fam.children.length > 12 ? TXT.hintMore(fam.children.length) : TXT.hint;
    var head = '<div class="ec-fam-head"><b>' + esc(TXT.head(fam.children.length)) + '</b><span>' + esc(hint) + '</span></div>';
    var items = fam.children.map(function (c) {
      var img = c.image ? '<img src="' + esc(c.image) + '" alt="' + esc(label(c)) + '" loading="lazy" width="54" height="54">' : '';
      var meta = [c.sku, c.facts].filter(Boolean).join(' · ');
      return '<a class="ec-fam-item" href="' + esc(c.route) + '">' + img +
        '<span class="ec-fam-item-txt"><span class="ec-fam-item-name">' + esc(label(c)) + '</span>' +
        '<span class="ec-fam-item-meta">' + esc(meta) + '</span></span></a>';
    }).join('');

    panel.innerHTML = head + '<div class="ec-fam-grid">' + items + '</div>';
    btn.setAttribute('aria-controls', panel.id);
    return panel;
  }

  function setOpen(card, btn, panel, open) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
    var txt = btn.querySelector('.ec-fam-toggle-txt');
    var n = Number(btn.getAttribute('data-count') || 0);
    if (txt) txt.textContent = open ? TXT.less : TXT.more(n);
    if (open) {
      var r = panel.getBoundingClientRect();
      if (r.top > window.innerHeight - 80 || r.bottom < 0) {
        panel.scrollIntoView({ block: 'nearest' });
      }
    }
  }

  function ensure(card, fam) {
    var copy = card.querySelector('.ec-library-card-copy') || card;
    var btn = card.querySelector('.ec-fam-toggle');
    var panel = card.nextElementSibling && card.nextElementSibling.classList.contains('ec-fam-panel')
      ? card.nextElementSibling : null;

    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ec-fam-toggle';
      btn.setAttribute('data-count', String(fam.children.length));
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = '<span class="ec-fam-toggle-txt">' + esc(TXT.more(fam.children.length)) + '</span>' + CARET;
      copy.appendChild(btn);
    }
    if (!panel) {
      panel = buildPanel(card, fam, btn);
      if (card.parentNode) card.parentNode.insertBefore(panel, card.nextSibling);
    }
    if (btn.getAttribute('data-ec-bound') !== '1') {
      btn.setAttribute('data-ec-bound', '1');
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setOpen(card, btn, panel, btn.getAttribute('aria-expanded') !== 'true');
      });
    }
  }

  /* 不是主款就别留着旧按钮（React 重画后可能残留） */
  function removeToggle(card) {
    var btn = card.querySelector('.ec-fam-toggle');
    if (btn && btn.parentNode) btn.parentNode.removeChild(btn);
    var nx = card.nextElementSibling;
    if (nx && nx.classList && nx.classList.contains('ec-fam-panel') && nx.parentNode) {
      nx.parentNode.removeChild(nx);
    }
  }

  function updateCounts() {
    Array.prototype.forEach.call(document.querySelectorAll('.ec-library-group, .bx-group'), function (g) {
      var all = g.querySelectorAll('article.ec-library-card');
      if (!all.length) return;
      var folded = g.querySelectorAll('article.ec-library-card.ec-fam-folded').length;
      var span = g.querySelector('.ec-library-group-heading span, .bx-group-heading span');
      if (!span) return;
      if (!span.hasAttribute('data-ec-orig')) span.setAttribute('data-ec-orig', span.textContent);
      span.textContent = folded > 0 ? TXT.series(all.length - folded, all.length) : span.getAttribute('data-ec-orig');

      /* 组头右侧加一行图例，说明 CORE MODEL 是什么意思 */
      var head = span.parentNode;
      if (!folded) {
        var lg = head.querySelector('.ec-fam-legend');
        if (lg) lg.parentNode.removeChild(lg);
        return;
      }
      if (!head.querySelector('.ec-fam-legend')) {
        var legend = document.createElement('span');
        legend.className = 'ec-fam-legend';
        legend.innerHTML = '<i></i>' + esc(TXT.legend(folded));
        head.appendChild(legend);
      }
    });
  }

  function render() {
    if (!DATA || BUSY) return;
    BUSY = true;
    try {
      var list = cards();
      if (!list.length) return;

      /* 本页出现过的主款 —— 只有主款在本页，才折叠它名下的附属款 */
      var present = {};
      list.forEach(function (c) {
        var s = skuOf(c);
        if (s) present[s] = true;
      });

      list.forEach(function (c) {
        var s = skuOf(c);
        if (!s) return;
        var parent = DATA.byChild[s];
        var folded = !!(parent && present[parent] && parent !== s);
        c.classList.toggle('ec-fam-folded', folded);
        if (folded) { dropBadge(c); return; }

        var fam = DATA.byMain[s];
        if (parent) badge(c, 'sub', parent);
        else if (fam && fam.children && fam.children.length) badge(c, 'core');
        else dropBadge(c);

        if (fam && fam.children && fam.children.length) ensure(c, fam);
        else removeToggle(c);
      });

      updateCounts();
      openFromHash();
    } finally {
      BUSY = false;
    }
  }

  function openFromHash() {
    var m = String(location.hash || '').match(/model-([A-Za-z0-9_\-]+)/);
    if (!m) return;
    var parent = DATA.byChild[m[1]];
    if (!parent) return;
    var target = null;
    cards().forEach(function (c) {
      if (skuOf(c) === parent) target = c;
    });
    if (!target) return;
    var btn = target.querySelector('.ec-fam-toggle');
    if (btn && btn.getAttribute('aria-expanded') !== 'true') btn.click();
  }

  function schedule() {
    if (TIMER) clearTimeout(TIMER);
    TIMER = setTimeout(function () { TIMER = null; render(); }, 160);
  }

  function boot() {
    if (!document.querySelector('article.ec-library-card')) return;
    injectCSS();
    var x = new XMLHttpRequest();
    x.open('GET', '/data/product-families.json?v=' + V + '-' + Math.floor(Date.now() / 3600000), true);
    x.onload = function () {
      try { DATA = JSON.parse(x.responseText); } catch (e) { return; }
      if (!DATA || !DATA.byMain) return;
      render();
      [300, 900, 2000, 3500].forEach(function (ms) { setTimeout(render, ms); });
      var root = document.body || document.documentElement;
      var mo = new MutationObserver(function () { schedule(); });
      mo.observe(root, { childList: true, subtree: true });
    };
    x.onerror = function () { };
    x.send();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
