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
      en: 'From 10 pcs on an existing model, single or multi-colour; screens and ink matching are charged as setup.',
      zh: '\u73b0\u6709\u578b\u53f7 10 \u4ef6\u8d77\uff0c\u5355\u8272\u4e0e\u591a\u8272\u540c\u4e00\u95e8\u69db\uff1b\u7248\u8d39\u4e0e\u8c03\u58a8\u8d39\u6309\u4e00\u6b21\u6027\u8d39\u7528\u5355\u6536\u3002'
    },
    '/uv-printing/': {
      src: ['MOQ depends on model, decoration and packaging.'],
      en: 'From 10 pcs on an existing model, including a full wrap or a special surface. Pre-treatment is quoted per material.',
      zh: '\u73b0\u6709\u578b\u53f7 10 \u4ef6\u8d77\uff0c\u6ee1\u5370\u4e0e\u7279\u6b8a\u8868\u9762\u540c\u4ef7\uff1b\u524d\u5904\u7406\u6309\u6750\u8d28\u5355\u62a5\u3002'
    },
    '/laser-engraving/': {
      src: ['Confirm after material trial and production review'],
      en: 'From 10 pcs on an existing model, one position or several.',
      zh: '\u73b0\u6709\u578b\u53f7 10 \u4ef6\u8d77\uff0c\u4e00\u5904\u6216\u591a\u5904\u90fd\u53ef\u3002'
    },
    '/heat-transfer-printing/': {
      src: ['MOQ depends on model, decoration and packaging.'],
      en: 'From 10 pcs on an existing model, including a full-colour wrap.',
      zh: '\u73b0\u6709\u578b\u53f7 10 \u4ef6\u8d77\uff0c\u5168\u5f69\u6ee1\u5370\u540c\u4e00\u95e8\u69db\u3002'
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
