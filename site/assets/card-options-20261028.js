/* 列表页产品卡上的「可选 N 款」角标
 *
 * 起因：合并后的主款在列表里只占一张卡，客户从列表看不出这一款其实有
 * 十几二十个款式可选，必须点进详情页才发现 —— 白丢点击。
 *
 * 做法：按 data-model 查 data/card-options-20261028.json，命中就在图片角上
 * 挂一个角标。纯附加，不改卡片原有结构；列表重渲染用 MutationObserver 跟。
 */
(function () {
  'use strict';

  /* 2026-10-29 20:0x 老板定版：列表页只呈现主款，合并进来的款式只在产品详情页里显示。
   * 因此「N 款可选 / N styles」角标停用。要恢复把开关改回 true 即可。 */
  var ENABLE_BADGE = false;
  if (!ENABLE_BADGE) return;

  var ZH = (document.documentElement.lang || '').toLowerCase().indexOf('zh') === 0;
  var URL = '/data/card-options-20261028.json';
  var MAP = null;
  var STYLE_ID = 'bx-card-opt-style';

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var css = ''
      + '.ec-library-card{position:relative}'
      + '.bx-card-opt{position:absolute;top:8px;left:8px;z-index:3;'
      + 'display:inline-flex;align-items:center;gap:4px;'
      + 'padding:3px 8px;border-radius:999px;'
      + 'background:rgba(174,84,56,.94);color:#fff;'
      + 'font-size:11px;line-height:1.5;letter-spacing:.2px;font-weight:600;'
      + 'box-shadow:0 1px 4px rgba(0,0,0,.18);pointer-events:none;'
      + 'font-family:inherit;white-space:nowrap}'
      + '.bx-card-opt b{font-weight:700}';
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = css;
    document.head.appendChild(s);
  }

  function mark(card) {
    if (!MAP) return;
    if (card.getAttribute('data-opt-mark') === '1') return;
    var sku = card.getAttribute('data-model');
    var rec = sku && MAP[sku];
    if (!rec) { card.setAttribute('data-opt-mark', '1'); return; }
    if (card.querySelector('.bx-card-opt')) {
      card.setAttribute('data-opt-mark', '1');
      return;
    }
    var b = document.createElement('span');
    b.className = 'bx-card-opt';
    b.innerHTML = ZH
      ? '<b>' + rec.n + '</b> 款可选'
      : '<b>' + rec.n + '</b> styles';
    card.appendChild(b);
    card.setAttribute('data-opt-mark', '1');
  }

  function scan(root) {
    var list = (root || document).querySelectorAll('.ec-library-card[data-model]');
    for (var i = 0; i < list.length; i++) mark(list[i]);
  }

  function boot() {
    injectStyle();
    var xhr = new XMLHttpRequest();
    xhr.open('GET', URL, true);
    xhr.onload = function () {
      if (xhr.status !== 200) return;
      try { MAP = JSON.parse(xhr.responseText); } catch (e) { return; }
      scan(document);
      var mo = new MutationObserver(function (muts) {
        var t = false;
        for (var i = 0; i < muts.length; i++) {
          if (muts[i].addedNodes && muts[i].addedNodes.length) { t = true; break; }
        }
        if (t) scan(document);
      });
      mo.observe(document.body, { childList: true, subtree: true });
    };
    xhr.send();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
