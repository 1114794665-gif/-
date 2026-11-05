/* 产品详情页「用在现场」场景模块（2026-10-28）
 *
 * 每个型号对应三个使用场景 + 三张场景图；同时把「这一家里还有哪些型号适合同一个场子」
 * 列在场景图下面 —— 被合并掉的型号在这里以选项的身份出现，而不是丢掉。
 *
 * 依赖页头注入的 window.__EVERCUP_SCENE__：
 *   { sku, scenes:[[场景键, 图号], ...], fam:{ 型号: [场景键...] } }
 */
(function () {
  'use strict';

  var D = window.__EVERCUP_SCENE__;
  if (!D || !D.scenes || !D.scenes.length) return;

  var ZH = /^\/zh\//.test(location.pathname);
  var IMG = '/img/scene-20261028/';
  var ID = 'scene-in-use';

  var COPY = {
    kicker: { en: 'In use', zh: '用在现场' },
    h2: { en: 'Where this one turns up.', zh: '这一只会出现在哪。' },
    lede: {
      en: 'Most buyers here pick the occasion first and the cup second. These are the three settings this model is ordered for, and which other models in the same family cover each one.',
      zh: '这里的买家通常先定场子，再挑杯子。下面三个场合是这款被下单最多的地方，以及同一家族里还有哪些型号能顶上。'
    },
    inThisScene: { en: 'Models for this setting', zh: '这个场子可用的型号' },
    onlyOne: { en: 'This is the only model in the family listed for this setting.', zh: '这一家里目前只有这一款对应这个场合。' },
    note: {
      en: 'Scene images are  location references used for selection, not photographs of the listed model. Configuration, print method and use instructions are confirmed per project.',
      zh: '场景图为 生成的场合参考，用于选型沟通，不是该型号的实拍照片。具体配置、印刷工艺与使用说明需按项目逐项确认。'
    },
    cur: { en: 'This page', zh: '本页' }
  };

  // 六大场景
  var S = {
    CAR: {
      tag: ['Tailgate', '尾箱聚会'],
      name: ['Tailgate & car meet', '汽车尾箱聚会'],
      line: ['Boot lid up, cooler out, cups handed round before kickoff.',
        '后备箱一掀、冰箱一摆，开球前先把杯子递一圈。']
    },
    BEACH: {
      tag: ['Beach', '沙滩'],
      name: ['Beach party', '沙滩派对'],
      line: ['Sand, salt and no glass on the beach — this is where shatterproof pays for itself.',
        '沙子、盐分、海滩上不能有玻璃 —— 摔不碎在这一场最值钱。']
    },
    CAMP: {
      tag: ['Camp', '露营'],
      name: ['Camp & campfire', '露营营地'],
      line: ['One cup per person, rinsed in the lake, back in the crate by dark.',
        '一人一只，湖边冲一下就收进箱子，天黑前归位。']
    },
    BBQ: {
      tag: ['BBQ', '烧烤'],
      name: ['Backyard BBQ', '后院烧烤'],
      line: ['Long tables, second helpings, cups that survive being set down on hot stone.',
        '长桌连着摆，一轮接一轮 —— 杯子搁在烫石台面上也不能软。']
    },
    YACHT: {
      tag: ['Boat deck', '游艇'],
      name: ['Yacht & boat deck', '游艇甲板'],
      line: ['Aft deck at golden hour, where the glass has to look right and still not break.',
        '黄昏后的甲板 —— 要好看，更要摔了不出事。']
    },
    BAR: {
      tag: ['Terrace bar', '户外酒吧'],
      name: ['Terrace bar', '户外酒吧'],
      line: ['First pour to last call, stacked and restocked three times a night.',
        '从第一杯到打烊，一晚上要补三次货的那种台子。']
    }
  };

  function t(k) { return COPY[k][ZH ? 'zh' : 'en']; }
  function pick(pair) { return pair[ZH ? 1 : 0]; }
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- 变体卡：补上「用在哪」 ---------- */
  function tagVariants() {
    var fam = D.fam || {};
    var cards = document.querySelectorAll('#series-variants .bx-series-card');
    for (var i = 0; i < cards.length; i++) {
      var el = cards[i];
      if (el.querySelector('.bx-scene-tags')) continue;
      var m = (el.id || '').replace('model-', '');
      var keys = fam[m];
      if (!keys || !keys.length) continue;
      var box = document.createElement('p');
      box.className = 'bx-scene-tags';
      box.innerHTML = keys.slice(0, 3).map(function (k) {
        return '<span>' + esc(pick(S[k].tag)) + '</span>';
      }).join('');
      var cta = el.querySelector('.bx-series-cta');
      if (cta && cta.parentNode === el) el.insertBefore(box, cta);
      else el.appendChild(box);
    }
  }

  /* ---------- 场景区块 ---------- */
  function build() {
    var fam = D.fam || {};
    var ownSku = D.sku || '';
    var sec = document.createElement('section');
    sec.className = 'bx-wrap bx-section bx-scene-wall';
    sec.id = ID;

    var figures = D.scenes.map(function (pair) {
      var key = pair[0], shot = pair[1];
      var meta = S[key];
      if (!meta) return '';
      // 本家族里落在该场景的型号（当前款排最前，最多列 6 个）
      var models = [];
      for (var s in fam) {
        if (fam[s].indexOf(key) > -1 && s !== ownSku) models.push(s);
      }
      models.unshift(ownSku);
      var extra = models.length - 6;
      if (extra > 0) models = models.slice(0, 6);
      var chips = models.map(function (s) {
        var cur = s === ownSku;
        var label = esc(s) + (cur ? '<em>' + esc(t('cur')) + '</em>' : '');
        return '<a class="bx-scene-chip' + (cur ? ' is-cur' : '') +
          '" href="#model-' + esc(s) + '">' + label + '</a>';
      }).join('');
      if (extra > 0) {
        chips += '<span class="bx-scene-more">+ ' + extra + (ZH ? ' 款' : ' more') + '</span>';
      }

      return '<figure class="bx-scene-shot">' +
        '<div class="bx-scene-frame">' +
        '<img src="' + IMG + esc(shot) + '-md.webp" alt="' + esc(pick(meta.name)) +
        '" loading="lazy" width="768" height="512">' +
        '<span class="bx-scene-badge">' + esc(pick(meta.tag)) + '</span>' +
        '</div>' +
        '<figcaption>' +
        '<h3>' + esc(pick(meta.name)) + '</h3>' +
        '<p>' + esc(pick(meta.line)) + '</p>' +
        '<div class="bx-scene-models"><span class="bx-scene-models-k">' + esc(t('inThisScene')) + '</span>' +
        '<div class="bx-scene-chips">' + chips + '</div></div>' +
        '</figcaption></figure>';
    }).join('');

    sec.innerHTML =
      '<div class="bx-scene-head">' +
      '<p class="bx-scene-kicker">' + esc(t('kicker')) + '</p>' +
      '<h2>' + esc(t('h2')) + '</h2>' +
      '<p class="bx-scene-lede">' + esc(t('lede')) + '</p>' +
      '</div>' +
      '<div class="bx-scene-grid">' + figures + '</div>' +
      '<p class="bx-scene-note">' + esc(t('note')) + '</p>';
    return sec;
  }

  function anchorFor() {
    return document.getElementById('series-variants') ||
      document.getElementById('use') ||
      document.getElementById('specifications') ||
      document.querySelector('.bx-product .bx-section');
  }

  function place() {
    if (document.getElementById(ID)) { tagVariants(); return true; }
    var a = anchorFor();
    if (!a || !a.parentNode) return false;
    a.parentNode.insertBefore(build(), a.nextSibling);
    tagVariants();
    return true;
  }

  var tries = 0;
  var done = 0;
  (function loop() {
    if (place()) { done = 1; return; }
    if (++tries > 120) return;
    setTimeout(loop, 120);
  })();

  // 框架二次渲染会把插入的节点冲掉，掉了补回来
  if ('MutationObserver' in window) {
    var timer = null;
    new MutationObserver(function () {
      if (timer) return;
      timer = setTimeout(function () {
        timer = null;
        if (!done) return;
        if (!document.getElementById(ID)) place();
        else tagVariants();
      }, 300);
    }).observe(document.body, { childList: true, subtree: true });
  }
})();
