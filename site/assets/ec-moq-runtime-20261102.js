/* 起订量口径运行时改字（2026-11-02 修订：自供品类统一 10 件）
 *
 * 用途：/our-service/、四张工艺页、中文对应页都由 React 渲染，
 * 直接改 HTML 会在水合时被旧文案盖回去，所以在这里按「整句替换」改回来。
 * 静态 HTML 里已经改好（给搜索引擎看的那份），这里只负责浏览器里看到的那份。
 *
 * 只做整句匹配，不做模糊替换，避免误伤别的数字。
 * 每张工艺页给的是自己的那句话（UV 讲前处理、激光讲位置、热转印讲满印），
 * 所以按路径分组，不共用一条。
 */
(function () {
  'use strict';

  var BASE = [
    ['Is the service different for 500 pieces and 10,000 pieces?',
     'Is the service different for 500 pieces and 3,000 pieces?'],
    ['10,000 pieces may justify a new mould',
     '3,000 pieces may justify a new mould'],
    ['500 \u4ef6\u548c 1 \u4e07\u4ef6\u7684\u670d\u52a1\u4e0d\u4e00\u6837\u5417\uff1f',
     '500 \u4ef6\u548c 3,000 \u4ef6\u7684\u670d\u52a1\u4e0d\u4e00\u6837\u5417\uff1f'],
    ['\u4e00\u4e07\u4ef6\u53ef\u80fd\u503c\u5f97\u65b0\u5f00\u4e00\u526f\u6a21\u5177',
     '\u4e09\u5343\u4ef6\u53ef\u80fd\u503c\u5f97\u65b0\u5f00\u4e00\u526f\u6a21\u5177']
  ];

  /* 工艺页：把 App 里的旧泛句换成各页自己那句 */
  var MOQ = {
    '/screen-printing/': {
      src: ['Quoted for the model, colour count, artwork, quantity and packing.',
            '\u6309\u578b\u53f7\u3001\u989c\u8272\u6570\u3001\u56fe\u7a3f\u3001\u6570\u91cf\u4e0e\u5305\u88c5\u5355\u72ec\u62a5\u4ef7\u3002'],
      en: "Minimum order quantity: 10 pieces.",
      zh: "起订量10件。"
    },
    '/uv-printing/': {
      src: ['Minimum order quantity: 10 pieces.'],
      en: "Minimum order quantity: 10 pieces.",
      zh: "起订量10件。"
    },
    '/laser-engraving/': {
      src: ['Confirm after material trial and production review'],
      en: "Minimum order quantity: 10 pieces.",
      zh: "起订量10件。"
    },
    '/heat-transfer-printing/': {
      src: ['Minimum order quantity: 10 pieces.'],
      en: "Minimum order quantity: 10 pieces.",
      zh: "起订量10件。"
    }
  };

  function isZh() {
    var l = (document.documentElement.getAttribute('lang') || '').toLowerCase();
    if (l.indexOf('zh') === 0) return true;
    return location.pathname.indexOf('/zh/') === 0;
  }

  function pairs() {
    var out = BASE.slice();
    var path = location.pathname;
    for (var k in MOQ) {
      if (!MOQ.hasOwnProperty(k)) continue;
      var key = isZh() ? '/zh' + k : k;
      if (path.indexOf(key) === 0) {
        var cfg = MOQ[k];
        var to = isZh() ? cfg.zh : cfg.en;
        for (var i = 0; i < cfg.src.length; i++) out.push([cfg.src[i], to]);
      }
    }
    return out;
  }

  function patch() {
    var P = pairs();
    var walker = document.createTreeWalker(
      document.body, NodeFilter.SHOW_TEXT, null, false
    );
    var node, changed = false;

    while ((node = walker.nextNode())) {
      var v = node.nodeValue;
      if (!v || v.length < 12) continue;
      var out = v;
      for (var i = 0; i < P.length; i++) {
        if (out.indexOf(P[i][0]) !== -1) out = out.split(P[i][0]).join(P[i][1]);
      }
      if (out !== v) {
        node.nodeValue = out;
        changed = true;
      }
    }
    return changed;
  }

  var t = null;
  function schedule() {
    if (t) return;
    t = setTimeout(function () { t = null; try { patch(); } catch (e) {} }, 140);
  }

  function boot() {
    patch();
    setTimeout(patch, 500);
    setTimeout(patch, 1500);
    try {
      new MutationObserver(schedule).observe(document.body, {
        childList: true, subtree: true, characterData: true
      });
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
