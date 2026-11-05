/*! EVERCUP 2026-10-27  列表页收卡：已并入主款的型号不再单独占一格，只留主款卡片 */
(function () {
  var MAP = {"BSB-011":"BSB-002","BPJJ-009":"GJB-008","BPJJ-012":"GJB-007","BSB-001":"BSB-002","BSB-003":"BSB-002","BSB-004":"BSB-002","BSB-005":"BSB-002","BSB-006":"BSB-002","BSB-010":"BSB-002","BSB-013":"BSB-002","BSB-015":"SJB-020","FGB-007":"FGB-006","FGB-008":"FGB-010","FGB-009":"FGB-006","FGB-011":"FGB-010","FGB-014":"FGB-013","FGB-018":"FGB-017","FGB-020":"FGB-019","FGB-021":"FGB-019","FGB-022":"FGB-019","FGB-024":"FGB-023","FGB-025":"FGB-023","FGB-026":"FGB-017","FGB-028":"FGB-006","FGB-029":"FGB-027","FGB-032":"FGB-031","FGB-035":"FGB-006","FGB-036":"FGB-006","GJB-001":"BPJJ-008","GJB-004":"BPJJ-008","GJB-010":"GJB-008","GJB-012":"GJB-007","GJB-014":"GJB-007","GJB-015":"GJB-007","GJB-018":"GJB-016","GJB-020":"GJB-008","GJB-021":"BPJJ-008","GJB-022":"GJB-007","GJB-023":"GJB-008","GJB-024":"BPJJ-005","GJB-025":"GJB-007","GJZD-010":"GJZD-009","GJZD-011":"GJZD-009","GJZD-012":"GJZD-009","GJZD-017":"GJZD-016","GJZD-018":"GJB-008","GJZD-019":"GJZD-009","GJZD-021":"GJZD-009","HJB-002":"HJB-001","HJB-003":"HJB-001","HJB-004":"HJB-006","HJB-005":"HJB-001","HJB-007":"HJB-006","HJB-008":"HJB-006","HJB-009":"HJB-001","HJB-010":"HJB-006","HJB-011":"HJB-001","HJB-012":"GJB-008","HJB-013":"HJB-006","HJB-014":"HJB-001","HJB-015":"HJB-006","HJB-016":"HJB-006","HJB-017":"HJB-006","HJB-018":"HJB-006","HJB-019":"HJB-006","HJB-020":"HJB-001","HJB-021":"HJB-048","HJB-022":"HJB-042","HJB-023":"HJB-048","HJB-024":"HJB-048","HJB-025":"HJB-048","HJB-026":"HJB-048","HJB-027":"HJB-042","HJB-028":"HJB-042","HJB-029":"HJB-048","HJB-030":"HJB-040","HJB-032":"HJB-031","HJB-033":"HJB-035","HJB-034":"HJB-035","HJB-036":"HJB-031","HJB-037":"HJB-001","HJB-039":"HJB-006","HJB-041":"HJB-006","HJB-043":"HJB-001","HJB-045":"HJB-006","HJB-046":"HJB-006","HJB-047":"HJB-006","HJB-049":"HJB-048","HJB-050":"HJB-048","HJB-051":"HJB-048","HJB-052":"HJB-006","HJB-053":"HJB-006","HJB-054":"HJB-006","HJB-055":"HJB-006","HJB-056":"HJB-031","HJB-057":"HJB-006","HJB-058":"HJB-048","HJB-059":"HJB-048","HJB-060":"HJB-031","HJB-061":"HJB-048","HJB-062":"HJB-006","HJB-063":"HJB-006","HJB-064":"HJB-006","HJB-065":"HJB-031","HJB-066":"HJB-048","HJB-067":"HJB-006","HJB-068":"HJB-048","HJB-069":"HJB-048","HJB-070":"HJB-048","HJB-071":"HJB-006","HJB-072":"HJB-006","HJB-073":"HJB-006","HJB-074":"HJB-031","HJB-075":"HJB-006","HJB-076":"HJB-035","HJB-077":"HJB-006","JBPJ-006":"GJXG-001","JBPJ-007":"GJXG-001","JBPJ-008":"GJXG-001","JBPJ-017":"JBPJ-018","JBPJ-028":"JBPJ-027","JBPJ-029":"JBPJ-027","JBPJ-043":"JBPJ-042","JBPJ-046":"JBPJ-039","JBPJ-075":"JBPJ-074","JBPJ-076":"JBPJ-074","JBPJ-077":"JBPJ-074","JBPJ-078":"JBPJ-074","JBPJ-079":"JBPJ-074","JBPJ-080":"JBPJ-074","JBPJ-081":"JBPJ-074","JBPJ-082":"JBPJ-074","JBPJ-083":"JBPJ-074","JBPJ-084":"JBPJ-074","JBPJ-085":"JBPJ-074","JBPJ-086":"JBPJ-074","JBPJ-087":"JBPJ-074","JBPJ-088":"JBPJ-074","JBPJ-089":"JBPJ-074","KPQ-008":"KPQ-009","KPQ-010":"KPQ-009","KPQ-012":"KPQ-011","KPQ-013":"KPQ-011","KPQ-014":"KPQ-011","KPQ-015":"KPQ-011","KPQ-016":"KPQ-009","KPQ-017":"KPQ-009","KPQ-018":"KPQ-011","KPQ-019":"KPQ-011","KPQ-020":"KPQ-011","KPQ-021":"KPQ-011","KPQ-027":"KPQ-024","KPQ-028":"KPQ-024","KPQ-029":"KPQ-024","KPQ-030":"KPQ-024","KPQ-032":"KPQ-024","LJB-006":"LJB-001","LJB-008":"LJB-002","LJB-010":"LJB-001","MKB-001":"MKB-003","MKB-002":"MKB-003","MKB-004":"FGB-012","MKB-017":"SXB-012","MKB-018":"SJB-020","MKB-019":"SJB-024","MKB-020":"SXB-012","MSB-002":"PJB-018","MSB-006":"HJB-006","MSB-008":"SJB-020","MSB-009":"SJB-020","PJB-001":"PJB-002","PJB-003":"PJB-002","PJB-004":"PJB-005","PJB-005":"PJB-008","PJB-007":"PJB-014","PJB-009":"PJB-008","PJB-010":"PJB-008","PJB-011":"PJB-008","PJB-016":"PJB-021","PJB-017":"PJB-012","PJB-019":"PJB-018","PJB-020":"PJB-018","PJB-022":"PJB-021","PJB-023":"PJB-021","PJB-024":"PJB-014","PJB-025":"PJB-018","PJB-026":"PJB-018","PJB-028":"PJB-021","PJB-030":"PJB-018","PJB-031":"PJB-018","PJB-032":"PJB-014","PJB-033":"PJB-018","PJB-035":"PJB-018","PJB-036":"PJB-021","PJB-037":"PJB-021","PJB-038":"PJB-021","PJB-039":"PJB-021","PJB-040":"PJB-021","PJB-041":"PJB-021","PJB-042":"PJB-021","PJB-043":"PJB-021","PJB-044":"PJB-014","PJB-045":"PJB-014","PJB-046":"PJB-021","PJB-047":"PJB-014","PJB-048":"PJB-008","PJB-049":"PJB-008","PJB-050":"PJB-005","PJB-051":"PJB-018","PJB-053":"PJB-002","PJB-054":"PJB-014","SJB-012":"SXB-008","SJB-013":"SJB-020","SJB-014":"SJB-020","SJB-015":"PJB-018","SJB-016":"SJB-020","SJB-017":"SJB-020","SJB-018":"SJB-020","SJB-019":"SJB-020","SJB-021":"SJB-020","SJB-022":"SJB-020","SJB-023":"SXB-008","SJB-025":"SJB-024","SJB-032":"SJB-014","SJB-033":"SJB-020","SJB-034":"PJB-008","SJB-035":"HJB-048","SJB-038":"SJB-020","SJB-039":"SJB-020","SJB-041":"SJB-020","SJB-042":"SJB-020","SJB-043":"SJB-020","SJB-044":"SJB-020","SJB-045":"SJB-020","SJB-046":"SXB-008","SJB-047":"SJB-020","SJB-048":"SJB-020","SJB-049":"SJB-024","SJB-050":"SJB-020","SJB-051":"SJB-020","SJB-052":"SJB-020","SJB-053":"SJB-020","SJB-054":"SXB-012","SJB-055":"SJB-020","SJSB-001":"SJB-024","SJZH-019":"PJB-012","SXB-001":"SXB-008","SXB-002":"SXB-005","SXB-003":"SXB-005","SXB-004":"SXB-005","SXB-005":"SJB-020","SXB-006":"SJB-020","SXB-007":"SJB-020","SXB-009":"SXB-008","SXB-011":"SXB-010","TYCB-007":"MSB-002","TYCB-001":"TYCB-002","TYCB-003":"TYCB-002","TYCB-004":"TYCB-002","TYCB-005":"TYCB-002","TYCB-006":"TYCB-002","SJB-006":"TYCB-002","SJB-026":"TYCB-002","SJB-027":"TYCB-002","SJB-028":"TYCB-002","SJB-029":"TYCB-002","SJB-030":"TYCB-002","SJB-031":"TYCB-002"};
  // 2026-10-28：直接下架（没有主款可去）的型号，卡片一并收掉
  var RETIRED = { "BSB-014": 1 };
  // 2026-10-27 晚：硅胶线砍掉的两栏（儿童杯、硅胶瓶），渲染后连栏带筛选项一起去掉
  var DROP_GROUPS = { 'silicone-kids-cups': 1, 'silicone-bottles': 1 };
  var droppedGroups = 0;
  function dropGroups() {
    if (droppedGroups >= 2) { return 0; }
    var n = 0;
    for (var gid in DROP_GROUPS) {
      var sec = document.getElementById(gid);
      if (sec && sec.parentNode && sec.className && String(sec.className).indexOf('bx-product-group') >= 0) {
        sec.parentNode.removeChild(sec); n++; droppedGroups++;
      }
      var opts = document.querySelectorAll('option[value="' + gid + '"]');
      for (var i = 0; i < opts.length; i++) { if (opts[i].parentNode) { opts[i].parentNode.removeChild(opts[i]); n++; } }
      var links = document.querySelectorAll('a[href="#' + gid + '"]');
      for (var j = 0; j < links.length; j++) { if (links[j].parentNode) { links[j].parentNode.removeChild(links[j]); n++; } }
    }
    return n;
  }
  try { window.__EVERCUP_LIST_DEDUPE__ = MAP; } catch (e) {}

  // 硅胶分类页的页头文案还写着「bottles / 瓶」和 39 个型号 —— 渲染后按实际剩下的改掉
  var COPY_FIX = [
    [/silicone pints, wine cups, bottles and collapsible designs/gi, 'silicone pints, wine cups and collapsible designs'],
    [/Pints?, wine cups & bottles/gi, 'Pints & wine cups'],
    [/Explore (\d+) models/gi, null],
    [/浏览 (\d+) 个型号/g, null],
    [/为品牌选择硅胶品脱杯、酒杯、瓶及折叠器型/gi, '为品牌选择硅胶品脱杯、酒杯及折叠器型'],
    [/品脱杯、酒杯与瓶/g, '品脱杯与酒杯']
  ];
  function fixCopy() {
    var path = location.pathname;
    var isSil = /custom-silicone-cups/.test(path);
    var isCol = /collapsible-cups/.test(path);
    if (!isSil && !isCol) { return 0; }
    var total = productCardsTotal();
    if (!document.createTreeWalker) { return 0; }
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var nodes = [], i;
    while (walker.nextNode()) { nodes.push(walker.currentNode); }
    var n = 0;
    for (i = 0; i < nodes.length; i++) {
      var t = nodes[i].nodeValue || '';
      var o = t;
      for (var k = 0; k < COPY_FIX.length; k++) {
        // 「bottles / 瓶」这类只改硅胶总览页；折叠页只改型号数字
        if (!isSil && k < 3) { continue; }
        var re = COPY_FIX[k][0], rep = COPY_FIX[k][1];
        if (rep === null) {
          t = t.replace(re, function (m0) { return m0.replace(/\d+/, String(total)); });
        } else { t = t.replace(re, rep); }
      }
      if (t !== o) { nodes[i].nodeValue = t; n++; }
    }
    return n;
  }

  var seen = typeof WeakSet === 'function' ? new WeakSet() : null;

  function skuOf(art) {
    var el = art.querySelector('.ec-library-model');
    var t = el ? (el.textContent || '').trim().toUpperCase() : '';
    if (!t) {
      var a = art.querySelector('a[href*="#model-"]');
      if (a) {
        var mm = (a.getAttribute('href') || '').match(/#model-([A-Za-z0-9_-]+)/);
        t = mm ? mm[1].toUpperCase() : '';
      }
    }
    return t;
  }

  // 款数文字在卡片区的外层容器里（.bx-results），不在卡片区的直接父级上：
  // 从卡片区往上逐层找，第一个带 .bx-results 的容器就是要改的
  // 每个产品组自己的数量小字（组长旁的「17 个型号」）
  function fixGroupCount(grid) {
    var grp = grid.closest ? (grid.closest('.bx-product-group') || grid.closest('.ec-library-grid')) : null;
    var scope = grp || grid.parentElement;
    if (!scope) { return; }
    fixShortCounts(scope, cardsIn(scope).length);
  }

  // 页面级的「显示 N / 共 N 个型号」用全页剩下的总数
  function fixPageCount(total) {
    var res = document.querySelectorAll('.bx-results');
    for (var k = 0; k < res.length; k++) {
      var el = res[k];
      var html = el.innerHTML;
      var out = html.replace(/(\d+)(\s*\/\s*)(\d+)/g, function (m0, a, sep) { return total + sep + total; });
      out = out.replace(/(\d+)(\s*)(models?|款车型|款型号|个型号)/g, function (m0, a, sp, w) { return total + sp + w; });
      if (out !== html) { el.innerHTML = out; }
    }
  }

  // 标题旁的「7 models」「7 个型号」「7款车型」这类独立小字
  function fixShortCounts(scope, left) {
    if (!scope || !document.createTreeWalker) { return; }
    var walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) { nodes.push(walker.currentNode); }
    var re = /^\d+\s*(models?|款车型|款型号|个型号)$/;
    for (var i = 0; i < nodes.length; i++) {
      var t = (nodes[i].nodeValue || '').trim();
      if (!re.test(t)) { continue; }
      var host = nodes[i].parentElement;
      if (host && host.closest && host.closest('.bx-results')) { continue; }
      var txt = t.replace(/^\d+/, String(left));
      txt = txt.replace(/\bmodels\b/i, left === 1 ? 'model' : 'models');
      if (txt !== nodes[i].nodeValue) { nodes[i].nodeValue = txt; }
    }
  }

  function gridOf(el) {
    if (!el.closest) { return el.parentElement; }
    return el.closest('.bx-model-grid') || el.closest('.ec-library-grid') || el.parentElement;
  }

  function cardsIn(root) {
    var raw = root.querySelectorAll ? root.querySelectorAll('article, .ec-library-card') : [];
    var arr = Array.prototype.slice.call(raw);
    var uniq = [];
    for (var i = 0; i < arr.length; i++) {
      var el = arr[i];
      var dup = false;
      for (var j = 0; j < uniq.length; j++) {
        if (uniq[j] === el || (uniq[j].contains && uniq[j].contains(el)) || (el.contains && el.contains(uniq[j]))) { dup = true; break; }
      }
      if (!dup) { uniq.push(el); }
    }
    return uniq;
  }

  // 型号页的「相关推荐」里也不该再出现已被并走的型号
  function cleanRelated() {
    var cards = cardsIn(document);
    var n = 0;
    for (var i = 0; i < cards.length; i++) {
      var sku = skuOf(cards[i]);
      if (sku && (MAP[sku] || RETIRED[sku]) && cards[i].parentNode) {
        cards[i].parentNode.removeChild(cards[i]);
        n++;
      }
    }
    return n;
  }

  // 2026-10-29 晚：卡收完之后，组里一张不剩的整组拿掉（组标题 + 下拉项 + 跳转锚）
  // 不然类目页底部会挂一个「Plastic Cups & Tumblers · 0 models」的空壳
  function dropEmptyGroups() {
    var groups = document.querySelectorAll('.bx-product-group');
    var n = 0;
    for (var i = 0; i < groups.length; i++) {
      var sec = groups[i];
      if (!sec.parentNode) { continue; }
      if (cardsIn(sec).length) { continue; }
      var gid = sec.id || '';
      var opts = gid ? document.querySelectorAll('option[value="' + gid + '"]') : [];
      // 下拉里还有这个分组、且它是唯一的分组选项时也一起收掉
      sec.parentNode.removeChild(sec);
      n++;
      for (var j = 0; j < opts.length; j++) { if (opts[j].parentNode) { opts[j].parentNode.removeChild(opts[j]); n++; } }
      if (gid) {
        var links = document.querySelectorAll('a[href="#' + gid + '"]');
        for (var k = 0; k < links.length; k++) { if (links[k].parentNode) { links[k].parentNode.removeChild(links[k]); n++; } }
      }
    }
    return n;
  }

  function run() {
    if (/(^|\/)products\//.test(location.pathname)) {
      try { return cleanRelated(); } catch (e) { return 0; }
    }
    var touched = 0;
    try { touched += dropGroups(); } catch (e) {}
    var cards = cardsIn(document);
    var affected = [];
    for (var i = 0; i < cards.length; i++) {
      var art = cards[i];
      var sku = skuOf(art);
      if (sku && (MAP[sku] || RETIRED[sku])) {
        var g = gridOf(art);
        if (g && affected.indexOf(g) < 0) { affected.push(g); }
        if (art.parentNode) { art.parentNode.removeChild(art); }
        touched++;
      }
    }
    if (touched) {
      for (var k = 0; k < affected.length; k++) { fixGroupCount(affected[k]); }
      fixPageCount(productCardsTotal());
      try { touched += dropEmptyGroups(); } catch (e) {}
    }
    try { fixHeroCount(productCardsTotal()); } catch (e) {}
    try { touched += fixCopy(); } catch (e) {}
    return touched;
  }


  // 栏目页顶部「浏览 N 个型号 / Explore N Models」—— 数字要跟实际卡数一致
  function fixHeroCount(n) {
    if (!n) return;
    var els = document.querySelectorAll('a,button');
    for (var i = 0; i < els.length; i++) {
      var h = els[i].innerHTML || '';
      if (h.length > 220) continue;
      var m = h.match(/Explore\s+(\d+)\s+Models/i);
      if (m) {
        var word = (n === 1) ? ' Model' : ' Models';
        var out = h.replace(/(Explore\s+)\d+(\s+Models)/i, '$1' + n + word);
        if (out !== h) { els[i].innerHTML = out; }   // 只有真变了才写，否则会自激成死循环
        continue;
      }
      var z = h.match(/浏览\s*(\d+)\s*个型号/);
      if (z && +z[1] !== n) {
        var out2 = h.replace(/(浏览\s*)\d+(\s*个型号)/, '$1' + n + '$2');
        if (out2 !== h) { els[i].innerHTML = out2; }
      }
    }
  }


  // 页面上产品卡片总数（只数产品网格里的，不算页面其他 article）
  function productCardsTotal() {
    var roots = document.querySelectorAll('.bx-model-grid, .ec-library-grid');
    var uniq = [];
    for (var r = 0; r < roots.length; r++) {
      var list = cardsIn(roots[r]);
      for (var i = 0; i < list.length; i++) {
        var el = list[i];
        var dup = false;
        for (var j = 0; j < uniq.length; j++) {
          if (uniq[j] === el || (uniq[j].contains && uniq[j].contains(el))) { dup = true; break; }
        }
        if (!dup) { uniq.push(el); }
      }
    }
    return uniq.length;
  }

  var runs = 0;
  function tick() {
    runs++;
    var n = 0;
    try { n = run(); } catch (e) {}
    if (runs < 24) { setTimeout(tick, n ? 120 : 260); }
  }

  function boot() {
    tick();
    if (typeof MutationObserver === 'function') {
      var mo = new MutationObserver(function () {
        if (runs < 40) { try { run(); } catch (e) {} }
      });
      var root = document.getElementById('root') || document.body;
      if (root) { mo.observe(root, { childList: true, subtree: true }); }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
