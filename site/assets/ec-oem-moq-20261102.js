/* 三条路线卡的起订量（2026-11-02）
 *
 * 背景：/oem-manufacturer/ 由 React 渲染，直接改 HTML 会被水合覆盖，
 * 所以在水合之后往 .of-path 里补一块「起订量」。
 * 静态 HTML 里已经预埋了一份（没 JS 也能看到），这里只负责在 React 接管后补回去。
 *
 * 口径（2026-11-02 修订：自供品类统一 10 件）：
 *   01 印刷/改色   10 件（素杯、单色、多色、指定杯身颜色都按 10 件），不开模
 *   02 换一个配件  1,000 件，新件的模具费单列
 *   03 新开模      3,000 件，开模费另算（塑料与硅胶器皿）
 */
(function () {
  'use strict';

  var T = {
    en: {
      k: 'Minimum order',
      r1: ['10 pcs', 'plain or printed, one colour or many'],
      r2: ['1,000 pcs', 'one new part on an existing body'],
      r3: ['3,000 pcs', 'per new moulded product, 1–4 mould sets'],
      n1: 'No tooling. Screens, a full wrap and any colour match are charged as setup, not as a minimum order. Existing model only — ask us to check the configuration you want.',
      n2: 'Tooling for the new part is quoted as its own line, never folded into the unit price.',
      n3: 'Tooling is charged separately from the unit price. Silicone and plastic only.',
      lead: ' Each route carries its own minimum order; it is printed on the card.'
    },
    zh: {
      k: '起订量',
      r1: ['10 件', '素杯或印刷，单色多色都按 10 件'],
      r2: ['1,000 件', '在现有杯身上做一个新件'],
      r3: ['3,000 件', '每款新开模产品，1–4 副模'],
      n1: '不开模。版费、满印与配色按一次性费用单收，不拿来当起订门槛。仅限现有型号 —— 想做的配置先发来，我们帮你核。',
      n2: '新件的模具费单独列一行，不摊进单价。',
      n3: '开模费与单价分开算；只做塑料与硅胶。',
      lead: ' 每条路都有自己的起订量，写在卡片上。'
    }
  };

  function lang() {
    var l = (document.documentElement.getAttribute('lang') || '').toLowerCase();
    if (l.indexOf('zh') === 0) return 'zh';
    if (location.pathname.indexOf('/zh/') === 0) return 'zh';
    return 'en';
  }

  function row(b, s) {
    var p = document.createElement('p');
    p.className = 'of-moq-row';
    var strong = document.createElement('b');
    strong.textContent = b;
    var span = document.createElement('span');
    span.textContent = s;
    p.appendChild(strong);
    p.appendChild(span);
    return p;
  }

  function note(text) {
    var p = document.createElement('p');
    p.className = 'of-moq-note';
    p.textContent = text;
    return p;
  }

  function build(num, t) {
    var box = document.createElement('div');
    box.className = 'of-moq';

    var k = document.createElement('p');
    k.className = 'of-moq-k';
    k.textContent = t.k;
    box.appendChild(k);

    if (num.indexOf('01') === 0) {
      box.appendChild(row(t.r1[0], t.r1[1]));
      box.appendChild(note(t.n1));
    } else if (num.indexOf('02') === 0) {
      box.appendChild(row(t.r2[0], t.r2[1]));
      box.appendChild(note(t.n2));
    } else {
      box.appendChild(row(t.r3[0], t.r3[1]));
      box.appendChild(note(t.n3));
    }
    return box;
  }

  function patch() {
    var cards = document.querySelectorAll('.of-three .of-path');
    if (!cards.length) return;
    var t = T[lang()];

    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      if (card.querySelector('.of-moq')) continue;

      var numEl = card.querySelector('.of-path-num');
      var num = numEl ? numEl.textContent.trim() : String(i + 1);
      var box = build(num, t);

      var tag = card.querySelector('.of-tag');
      if (tag) card.insertBefore(box, tag);
      else card.appendChild(box);
    }

    /* 引导段落补一句：每条路的起订量写在卡片上 */
    var headingP = document.querySelector('.of-three') &&
      document.querySelector('.of-three').closest('.of-section');
    if (headingP) {
      var p = headingP.querySelector('.of-heading > p');
      if (p && p.textContent.indexOf(t.lead.trim().slice(0, 12)) === -1 &&
          p.getAttribute('data-moq-lead') !== '1') {
        p.textContent = p.textContent.trim() + t.lead;
        p.setAttribute('data-moq-lead', '1');
      }
    }
  }

  var timer = null;
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () {
      timer = null;
      try { patch(); } catch (e) {}
    }, 120);
  }

  function boot() {
    patch();
    setTimeout(patch, 600);
    setTimeout(patch, 1600);
    try {
      new MutationObserver(schedule).observe(document.documentElement, {
        childList: true, subtree: true
      });
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
