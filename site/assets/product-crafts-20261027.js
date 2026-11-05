/* 工艺与效果 —— 注入器（2026-10-27）
 *
 * 产品页由前端框架渲染，静态 HTML 里写什么都会被覆盖，
 * 所以这张区只能在渲染完成后插进真实 DOM（跟「同系列」模块同一套路）。
 *
 * 依赖页头先注入 window.__EVERCUP_CRAFTS__ = {lang, main, crafts[]}
 */
(function () {
  'use strict';
  var D = window.__EVERCUP_CRAFTS__;
  if (!D || !D.crafts || !D.crafts.length) return;

  var ZH = D.lang === 'zh';
  var ID = 'craft-options';
  var inserted = 0;
  var cap = 30;

  var T = ZH ? {
    kicker: '工艺与效果',
    h: '这只杯还能做成这些效果',
    lead: '同一个杯身可以按不同工艺出厂。要哪种效果直接说 —— 每种工艺的起订量和单价不一样，报价都按上面这个杯型来算。',
    ref: '对应型号 ',
    tab: '工艺与效果'
  } : {
    kicker: 'FINISHES & EFFECTS',
    h: 'Other finishes for this cup',
    lead: 'The same body can leave the factory in more than one finish. Pick the look you need — each finish carries its own minimum and price, quoted against the cup above.',
    ref: 'Ref. ',
    tab: 'Finishes'
  };

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function card(c) {
    var sku = c.sku || D.main.sku;
    var href = '/' + (ZH ? 'zh/' : '') + 'contact/?models=' + encodeURIComponent(sku) +
      '&finish=' + encodeURIComponent(c.key || '');
    var img = c.img
      ? '<a class="bx-craft-figure" href="' + esc(c.img) + '"><img src="' + esc(c.img) +
        '" alt="' + esc((ZH ? c.title_zh : c.title_en) || c.label_en) + '" loading="lazy"></a>'
      : '';
    return '<article class="bx-craft-card" id="craft-' + esc(c.ref || c.key) + '">' + img +
      '<div class="bx-craft-body">' +
      '<p class="bx-craft-label">' + esc(ZH ? c.label_zh : c.label_en) + '</p>' +
      '<h3 class="bx-craft-title">' + esc(ZH ? c.title_zh : c.title_en) + '</h3>' +
      '<p class="bx-craft-desc">' + esc(ZH ? c.desc_zh : c.desc_en) + '</p>' +
      '<a class="bx-craft-cta" href="' + esc(href) + '"><span>' +
      esc(ZH ? c.cta_zh : c.cta_en) + ' →</span>' +
      (c.ref ? '<span class="bx-craft-ref">' + esc(T.ref) + esc(c.ref) + '</span>' : '') +
      '</a></div></article>';
  }

  function build() {
    var el = document.createElement('section');
    el.className = 'bx-section';
    el.id = ID;
    el.innerHTML =
      '<div class="bx-section-heading"><div><p class="bx-kicker">' + esc(T.kicker) + '</p><h2>' +
      esc(T.h) + '</h2></div><p>' + esc(T.lead) + '</p></div>' +
      '<div class="bx-craft-grid">' + D.crafts.map(card).join('') + '</div>';
    return el;
  }

  function addTab() {
    var nav = document.querySelector('.bx-page-tabs');
    if (!nav || nav.querySelector('[data-craft-tab]')) return;
    var a = document.createElement('a');
    a.href = '#' + ID;
    a.setAttribute('data-craft-tab', '1');
    a.textContent = T.tab;
    nav.appendChild(a);
  }

  function place() {
    var anchor = document.getElementById('series-variants') || document.getElementById('specifications');
    if (!anchor || !anchor.parentNode) {
      // 有的页没有规格表锚点，退到第一个正文区块后面
      anchor = document.querySelector('.bx-section');
      if (!anchor || !anchor.parentNode) return false;
    }
    anchor.parentNode.insertBefore(build(), anchor.nextSibling);
    return true;
  }

  // 从老型号页 301 过来会带 #craft-型号 —— 卡是后插的，浏览器自己跳不到，这里补一次
  function jumpHash() {
    var h = location.hash || '';
    if (h.indexOf('#craft-') !== 0) return;
    var el = document.getElementById(h.slice(1));
    if (!el) return;
    setTimeout(function () {
      try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      catch (e) { el.scrollIntoView(); }
      el.className += ' is-flash';
      setTimeout(function () {
        el.className = el.className.replace(/\s*is-flash/g, '');
      }, 2600);
    }, 180);
  }

  function run() {
    if (document.getElementById(ID)) return true;
    if (!document.querySelector('.bx-spec-table table') && !document.querySelector('.bx-section')) return false;
    var ok = place();
    if (ok) { addTab(); jumpHash(); inserted++; }
    return ok;
  }

  function boot() {
    var tries = 0;
    (function loop() {
      if (run()) return;
      if (++tries > 100) return;
      setTimeout(loop, 120);
    })();
  }

  function guard() {
    if (!('MutationObserver' in window)) return;
    var t = null;
    new MutationObserver(function () {
      if (t) return;
      t = setTimeout(function () {
        t = null;
        if (inserted >= cap) return;
        if (!document.getElementById(ID)) run();
      }, 250);
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { boot(); guard(); });
  } else {
    boot();
    guard();
  }
  window.addEventListener('hashchange', jumpHash);
})();
