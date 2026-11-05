/* 可选款式选择器（2026-10-28）
 *
 * 把「合并进来的款」从一排相关产品卡，改成产品自带的款式选项：
 * 一排小图，点一下换主图 / 换标题 / 换型号 / 换询价按钮。
 * 跟 Silipint 的颜色色块是一个逻辑 —— 客户是在选这一款，
 * 不是在看别的推荐产品。
 *
 * 数据来源：页面 <head> 的 window.__EVERCUP_SERIES__
 *   { lang, mode, caps, main:{sku,name,capacity,img,label}, variants:[...] }
 * 老模块 product-series-20261027.js 的卡片区由本文件取代。
 */
(function () {
  'use strict';

  var ID = 'product-options';
  var CAP = 40;
  var SKU = '';                       // 已经画好的型号，用来判断地址换没换产品
  var D = null, ZH = false, T = null, OPTS = [], cur = 0, mounted = 0;
  var DB = null;                      // 全站款式总表（按页面地址索引）

  /* 2026-10-29：站内点产品卡是框架内跳转，整页不重载，
     页面 <head> 里那段 window.__EVERCUP_SERIES__ 不会执行 ——
     所以「进详情 → 返回 → 再进」款式区就没了。
     改成：优先用内联数据，拿不到就按当前地址去总表里查。 */

  function makeT(zh) {
    return zh ? {
      kick: '可选款式',
      count: function (n) { return '共 ' + n + ' 款 · 点一下换款'; },
      now: '已选',
      sep: '：',
      model: '型号',
      tbd: '按型号确认（可定制容量）',
      tab: '可选款式',
      row: '可选型号',
      unit: ''
    } : {
      kick: 'Choose your style',
      count: function (n) { return n + ' styles · tap to switch'; },
      now: 'Selected',
      sep: ': ',
      model: 'Model',
      tbd: 'Confirmed per model (custom capacity available)',
      tab: 'Styles',
      row: 'Available styles',
      unit: ''
    };
  }

  /* 2026-10-30：选择栏一律按容量从小到大排。
     以前是 [主款, ...变体] 硬拼，主款不管多大都排第一，看起来没秩序。
     容量解析优先 oz，其次 ml / l（换算成 oz 再比），解析不出来的排最后。 */
  function capOz(o) {
    var c = String((o && (o.capacity || o.label)) || '').toLowerCase();
    /* 2026-10-30：改成 ml 优先。502ml 和 500ml 都标 17oz，按 oz 比会并列，
       前排的顺序就随原数组走，看不出"从小到大"。ml 数字更细，先读 ml。 */
    var m = c.match(/([\d.]+)\s*ml/);
    if (m) return parseFloat(m[1]) / 29.5735;
    m = c.match(/([\d.]+)\s*oz/);
    if (m) return parseFloat(m[1]);
    m = c.match(/([\d.]+)\s*(?:l|litre|liter)/);
    if (m) return parseFloat(m[1]) * 33.814;
    m = c.match(/([\d.]+)/);
    return m ? parseFloat(m[1]) : 9999;
  }

  function sortByCapacity(list) {
    return list.map(function (o, i) { return { o: o, i: i, c: capOz(o) }; })
      .sort(function (a, b) { return a.c - b.c || a.i - b.i; })
      .map(function (x) { return x.o; });
  }

  function setData(nd) {
    D = nd;
    ZH = nd.lang === 'zh';
    T = makeT(ZH);
    if(nd.main.sku==='HJB-057'){
      T.kick=ZH?'选择容量':'Choose capacity';
      T.count=function(n){return ZH?n+' 个已记录规格 · 每个规格对应实际型号':n+' recorded options · each linked to a model'};
      T.tab=ZH?'容量选项':'Capacity options';T.row=ZH?'可选规格型号':'Capacity model references';
    }
    OPTS = sortByCapacity([nd.main].concat(nd.variants));
    SKU = (nd.main || {}).sku || '';
    cur = 0;
    for (var ci = 0; ci < OPTS.length; ci++) {
      if (OPTS[ci].sku === SKU) { cur = ci; break; }
    }
    mounted = 0;
  }

  function pageKey() {
    var p = location.pathname;
    if (p.charAt(p.length - 1) !== '/') p += '/';
    return p;
  }

  function pickSeries() {
    var rec = DB ? DB[pageKey()] : null;
    var inline = window.__EVERCUP_SERIES__;
    var inlineOk = !!(inline && inline.variants && inline.variants.length);
    if (rec && rec.variants && rec.variants.length) {
      if (!inlineOk) return rec;
      var a = (rec.main || {}).sku, b = (inline.main || {}).sku;
      if (a && b && a !== b) return rec;   // 内联的是上一个产品的，以地址为准
      return inline;
    }
    return inlineOk ? inline : null;
  }

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function stripBrand(s) {
    return String(s || '').replace(/^(EVERCUP|CustomBYF|BYF)\s+/i, '');
  }

  function label(o) {
    if(D && D.main.sku==='HJB-057') return o.capacity;
    if (o.label) return o.label;
    var n = stripBrand(o.name || '');
    n = n.replace(/\s*[\(（][^)）]*[\)）]\s*$/, '');
    return n.length > 26 ? n.slice(0, 26) + '…' : n;
  }

  /* 标签拆成「容量 / 效果」两段：'12 oz · cold-activated'
     → 第一行 12 oz，第二行 cold-activated。写法不按这个格式的（纯名字），整段当第二行。
     2026-10-30：只有容量、没有「·」的（'285 ml / 9.5 oz'）以前整段掉进第二行，
     变成小字靠下，跟隔壁带「·」的款一比，容量行的字号和高度都不一样。
     现在只要开头是容量，就一律按第一行走。 */
  function labHtml(t) {
    var s = String(t == null ? '' : t);
    var p = s.split(/\s*·\s*/);
    if (p.length >= 2 && p[0]) {
      return '<b class="bx-opt-cap">' + esc(p[0]) + '</b>' +
             '<span class="bx-opt-fx">' + esc(p.slice(1).join(' · ')) + '</span>';
    }
    if (/^[\d.]+\s*(?:ml|oz|l)\b/i.test(s)) {
      return '<b class="bx-opt-cap">' + esc(s) + '</b>';
    }
    return '<span class="bx-opt-fx bx-opt-fx--solo">' + esc(p[0] || '') + '</span>';
  }

  function baseName(p) {
    return String(p || '').split('/').pop().split('?')[0];
  }

  var CAP_NOTE = ZH ? '（可定制容量）' : ' (custom capacity available)';

  function capOf(o) {
    var c = String(o.capacity || '').trim();
    return /^[\d.]+\s*(oz|ml|l)\b/i.test(c) ? c + CAP_NOTE : '';
  }

  /* ---------- 换主图 ---------- */

  function swapHero(fromImg, toImg, altText) {
    if (!fromImg || !toImg) return;
    var from = baseName(fromImg), to = baseName(toImg);
    if (from === to) return;

    var scope = document.querySelector('.pg-media') || document;
    var imgs = scope.querySelectorAll('img');
    var changed = 0;
    for (var i = 0; i < imgs.length; i++) {
      var im = imgs[i];
      var src = im.getAttribute('src') || '';
      if (src.indexOf(from) > -1) {
        im.setAttribute('src', src.split(from).join(to));
        im.setAttribute('alt', altText);
        changed++;
      }
      var ss = im.getAttribute('srcset');
      if (ss && ss.indexOf(from) > -1) im.setAttribute('srcset', ss.split(from).join(to));
    }
    // 相册里指向原图的大图链接
    var links = scope.querySelectorAll('a[href*="' + from + '"]');
    for (var j = 0; j < links.length; j++) {
      links[j].setAttribute('href', links[j].getAttribute('href').split(from).join(to));
    }
    if (!changed) {
      var stage = stageImg();
      if (stage) {
        stage.setAttribute('src', toImg);
        stage.setAttribute('alt', altText);
      }
    }
  }

  function stageImg() {
    return document.querySelector('.pg-stage img') ||
      document.querySelector('.pg-media img') ||
      document.querySelector('.bx-product-hero img');
  }

  /* ---------- 换标题 / 规格条 / 询价按钮 ---------- */

  function setPill(re, value) {
    var pills = document.querySelectorAll('.bx-spec-pills > div');
    for (var i = 0; i < pills.length; i++) {
      var dt = pills[i].querySelector('dt');
      var dd = pills[i].querySelector('dd');
      if (!dt || !dd) continue;
      if (re.test((dt.textContent || '').trim())) {
        if ((dd.textContent || '').trim() !== value) dd.textContent = value;
        return true;
      }
    }
    return false;
  }

  function updateChrome(o, oldSku) {
    oldSku = oldSku || '';
    var newSku = o.sku;

    // 2026-10-30：系列门面页的大标题是系列名（html 上带 data-keep-h1），别被主款名覆盖
    var keepH1 = document.documentElement.hasAttribute('data-keep-h1');
    var h1 = keepH1 ? null : (document.querySelector('.bx-product-decision h1') || document.querySelector('h1'));
    if (h1) {
      var name = D.main.sku==='HJB-057' ? (ZH?'定制 Tritan 红酒杯':'Custom Tritan Wine Glass') : stripBrand(o.name);
      if (name && (h1.textContent || '').trim() !== name) h1.textContent = name;
    }

    setPill(/^(model|型号|货号)/i, newSku);
    if(D.main.sku==='HJB-057'){
      setPill(/^(material|材质|材料)/i,o.material);
      document.querySelectorAll('.bx-spec-table tr').forEach(function(tr){var th=tr.querySelector('th');var td=tr.querySelector('td');if(!th||!td)return;var key=th.textContent.trim();if(/^(Size & weight|Packing|Sample lead time|Production lead time|Mould cost|Minimum order|Logo method)$/.test(key)){if(!td.dataset.pilotOriginal)td.dataset.pilotOriginal=td.textContent;td.textContent=newSku===D.main.sku?td.dataset.pilotOriginal:(ZH?'按所选型号确认，不沿用主款参数':'Confirm for selected model; main-model values do not apply');}if(/^(Model|型号)$/i.test(key))td.textContent=newSku;if(/^(Material|材料|材质)$/i.test(key))td.textContent=o.material;if(/^(Capacity options|容量选项|容量)$/i.test(key))td.textContent=o.capacity;});
    }
    var cap = capOf(o);
    setPill(/^(capacity|size|容量|规格)/i, cap || T.tbd);

    // 大图左上角那个型号角标 + 面包屑
    var badge = document.querySelector('.bx-photo-sku');
    if (badge) badge.textContent = newSku;
    var crumbs = document.querySelectorAll('[class*="breadcrumb"] a, [class*="bread"] a, nav[aria-label*="readcrumb"] a');
    for (var c = 0; c < crumbs.length; c++) {
      if ((crumbs[c].textContent || '').trim() === oldSku) crumbs[c].textContent = newSku;
    }

    // 询价按钮：文字和链接里的型号一起换
    var cta = document.querySelector('.buyer-order-panel a[href*="contact"]') ||
      document.querySelector('.buyer-order-panel a');
    if (cta) {
      var href = cta.getAttribute('href') || '';
      if (oldSku && href.indexOf(oldSku) > -1) {
        cta.setAttribute('href', href.split(oldSku).join(newSku));
      } else {
        var base = href.split('?')[0] || ('/' + (ZH ? 'zh/' : '') + 'contact/');
        cta.setAttribute('href', base + '?models=' + encodeURIComponent(newSku));
      }
      var txt = cta.textContent || '';
      if (oldSku && txt.indexOf(oldSku) > -1) {
        cta.textContent = txt.split(oldSku).join(newSku);
      }
    }

    // 「已选」那一行
    var now = document.querySelector('#' + ID + ' .bx-opt-now');
    if (now) {
      now.innerHTML = esc(T.now) + esc(T.sep) + '<b>' + esc(label(o)) + '</b> · ' +
        esc(T.model) + ' <b>' + esc(newSku) + '</b>';
    }
  }

  /* ---------- 渲染 ---------- */

  function build() {
    var wrap = document.createElement('div');
    wrap.className = 'bx-opt';
    wrap.id = ID;

    var sw = OPTS.map(function (o, i) {
      /* 2026-10-30：flip=true 的款在缩略图里左右镜像，让一排杯子的把手朝向一致。
         只在 72px 小图里翻，主图不动 —— 主图上有印字，翻了会反。
         zoom 用来单独放大留白太大的原图，让一排杯子看起来一样大。 */
      var tr = [];
      if (o.flip) tr.push('scaleX(-1)');
      if (o.zoom) tr.push('scale(' + String(o.zoom) + ')');
      var cls = 'bx-opt-pic' + (tr.length ? ' is-tweaked' : '');
      var style = tr.length ? ' style="transform:' + esc(tr.join(' ')) + '"' : '';
      var pic = o.img
        ? '<span class="' + cls + '"><img src="' + esc(o.img) + '" alt="' +
          esc(o.sku + ' ' + stripBrand(o.name)) + '" loading="lazy" decoding="async" width="72" height="72"' + style + '></span>'
        : '<span class="' + cls + '"></span>';
      var on = (o.sku === SKU);
      return '<button type="button" class="bx-opt-sw' + (on ? ' is-on' : '') +
        '" role="radio" aria-checked="' + (on ? 'true' : 'false') +
        '" data-i="' + i + '" data-sku="' + esc(o.sku) + '" title="' +
        esc(stripBrand(o.name)) + '">' + pic +
        '<span class="bx-opt-lab">' + labHtml(label(o)) + '</span></button>';
    }).join('');

    wrap.innerHTML =
      '<p class="bx-opt-head"><span class="bx-opt-kick">' + esc(T.kick) + '</span>' +
      '<span class="bx-opt-count">' + esc(T.count(OPTS.length)) + '</span></p>' +
      '<div class="bx-opt-row" role="radiogroup" aria-label="' + esc(T.kick) + '">' + sw + '</div>' +
      '<p class="bx-opt-now" aria-live="polite"></p>';

    wrap.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.bx-opt-sw') : null;
      if (!b) return;
      select(+b.getAttribute('data-i'), true);
    });

    return wrap;
  }

  function select(i, userAction) {
    if (i < 0 || i >= OPTS.length) return;
    var prev = cur;
    var prevSku = (OPTS[prev] || {}).sku || '';
    cur = i;
    var o = OPTS[i];

    var sws = document.querySelectorAll('#' + ID + ' .bx-opt-sw');
    for (var k = 0; k < sws.length; k++) {
      var on = +sws[k].getAttribute('data-i') === i;
      sws[k].className = 'bx-opt-sw' + (on ? ' is-on' : '');
      sws[k].setAttribute('aria-checked', on ? 'true' : 'false');
    }

    if (prev !== i || userAction) {
      var from = (OPTS[prev] || {}).img || '';
      swapHero(from, o.img, o.sku + ' ' + stripBrand(o.name));
      var stage = stageImg();
      if (stage) {
        stage.classList.remove('bx-opt-flash');
        void stage.offsetWidth;
        stage.classList.add('bx-opt-flash');
      }
    }

    updateChrome(o, prevSku);
    document.dispatchEvent(new CustomEvent('evercup:scene-model-selected', {detail:{sku:o.sku}}));

    // 手机上是上下排版，图在上、选择器在下 —— 点完把大图带回视野，
    // 否则选了半天看不到图变了
    if (userAction && window.innerWidth <= 720) {
      var media = document.querySelector('.bx-product-photo') ||
        document.querySelector('.pg-media') || document.querySelector('.bx-product-hero');
      if (media) {
        var top = media.getBoundingClientRect().top + window.pageYOffset - 70;
        try { window.scrollTo({ top: top, behavior: 'smooth' }); }
        catch (e2) { window.scrollTo(0, top); }
      }
    }

    if (userAction && window.history && history.replaceState) {
      try {
        history.replaceState(null, '', location.pathname + location.search + '#model-' + o.sku);
      } catch (err) { /* file:// 下可能报错，忽略 */ }
    }
  }

  /* ---------- 插进页面 ---------- */

  function insert() {
    var dec = document.querySelector('.bx-product-decision');
    if (!dec) return false;
    var pills = dec.querySelector('.bx-spec-pills');
    var node = build();
    if (pills && pills.parentNode === dec) dec.insertBefore(node, pills);
    else dec.appendChild(node);
    select(cur, false);
    return true;
  }

  function addTab() {
    var nav = document.querySelector('.bx-page-tabs');
    if (!nav || nav.querySelector('[data-opt-tab]')) return;
    var a = document.createElement('a');
    a.href = '#' + ID;
    a.setAttribute('data-opt-tab', '1');
    a.textContent = T.tab;
    nav.appendChild(a);
  }

  function addSpecRow() {
    var table = document.querySelector('.bx-spec-table table');
    if (!table || table.querySelector('[data-opt-row]')) return;
    var tr = document.createElement('tr');
    tr.setAttribute('data-opt-row', '1');
    // 16 款型号全铺开会变成一堵墙，超过 6 款就写成区间
    var list = OPTS.length > 6
      ? (ZH ? '共 ' + OPTS.length + ' 款（' : OPTS.length + ' styles (') +
        OPTS[0].sku + ' – ' + OPTS[OPTS.length - 1].sku + '）'
      : OPTS.map(function (o) { return o.sku; }).join(' · ');
    tr.innerHTML = '<th scope="row">' + esc(T.row) + '</th><td>' + esc(list) + '</td>';
    var tbody = table.querySelector('tbody') || table;
    tbody.appendChild(tr);
  }

  function fromHash() {
    var h = location.hash || '';
    if (h.indexOf('#model-') !== 0) return -1;
    var sku = h.slice(7);
    for (var i = 0; i < OPTS.length; i++) {
      if (OPTS[i].sku === sku) return i;
    }
    return -1;
  }

  function hashJump() {
    var i = fromHash();
    if (i < 0) return;
    select(i, true);
    var box = document.getElementById(ID);
    if (!box) return;
    setTimeout(function () {
      try {
        box.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (e) {
        box.scrollIntoView();
      }
    }, 160);
  }

  /* 页面底部「相关型号」区块里如果又摆出本族的款，就跟上面的款式盘重复了
     —— 同一款在上面能选、在下面又被当成相关产品推荐一遍。剔掉；
     剔空了就把整块收起来，免留一个空标题。 */
  function pruneRelated() {
    var fam = {};
    for (var i = 0; i < OPTS.length; i++) fam[OPTS[i].sku] = 1;
    var secs = document.querySelectorAll('section.bx-section');
    for (var s = 0; s < secs.length; s++) {
      if (secs[s].getAttribute('data-opt-pruned') === '1') continue;
      var h = secs[s].querySelector('h2');
      if (!h || !/Related models|相近器型|相关型号/.test(h.textContent || '')) continue;
      var cards = secs[s].querySelectorAll('.ec-library-card[data-model]');
      if (!cards.length) continue;
      var left = 0;
      for (var c = 0; c < cards.length; c++) {
        if (fam[cards[c].getAttribute('data-model')]) {
          if (cards[c].parentNode) cards[c].parentNode.removeChild(cards[c]);
        } else left++;
      }
      secs[s].setAttribute('data-opt-pruned', '1');
      if (!left) secs[s].style.display = 'none';
    }
  }

  function run() {
    if (document.getElementById(ID)) return true;
    if (!D || !OPTS.length) return false;
    if (!document.querySelector('.bx-product-decision')) return false;
    ensureCss();
    if (!insert()) return false;
    addTab();
    addSpecRow();
    var i = fromHash();
    if (i >= 0) select(i, true);
    mounted++;
    pruneRelated();
    setTimeout(pruneRelated, 900);
    setTimeout(pruneRelated, 2400);
    return true;
  }

  function boot() {
    var tries = 0;
    (function loop() {
      var nd = pickSeries();
      if (nd) {
        var sku = (nd.main || {}).sku || '';
        if (sku !== SKU) {
          var old = document.getElementById(ID);
          if (old && old.parentNode) old.parentNode.removeChild(old);
          setData(nd);
        }
        if (run()) {
          if (fromHash() > 0) hashJump();
          return;
        }
      }
      if (++tries > 160) return;
      setTimeout(loop, 120);
    })();
  }

  // 框架二次渲染会把插进去的节点冲掉 —— 掉了补回来
  function guard() {
    if (!('MutationObserver' in window)) return;
    var t = null;
    new MutationObserver(function () {
      if (t) return;
      t = setTimeout(function () {
        t = null;
        if (mounted >= CAP) return;
        if (!document.getElementById(ID)) run();
      }, 250);
    }).observe(document.body, { childList: true, subtree: true });
  }

  /* 全站款式总表：站内切页时靠它取当前产品的款式 */
  function loadDB(cb) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/data/product-series-20261029.json', true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        try { DB = JSON.parse(xhr.responseText); } catch (e) { DB = null; }
      }
      cb();
    };
    xhr.onerror = function () { cb(); };
    xhr.send();
  }

  /* 站内点击来回切：地址变了就把旧款式盘拆掉、按新地址重画；
     框架把节点冲掉也补回来。 */
  function watchRoute() {
    var last = pageKey();
    function check() {
      var k = pageKey();
      var box = document.getElementById(ID);
      if (k !== last) {
        last = k;
        SKU = '';
        if (box && box.parentNode) box.parentNode.removeChild(box);
        boot();
        return;
      }
      if (!box && document.querySelector('.bx-product-decision')) boot();
    }
    var push = history.pushState, rep = history.replaceState;
    history.pushState = function () { push.apply(history, arguments); setTimeout(check, 60); };
    history.replaceState = function () { rep.apply(history, arguments); setTimeout(check, 60); };
    window.addEventListener('popstate', function () { setTimeout(check, 90); });
    setInterval(check, 900);
  }

  /* 2026-10-30：站内点卡片是框架内跳转，目标页 <head> 不重载，
     款式区样式表可能没带上（小图没边框、容量和款式挤成一行）。
     缺了就补一份，带版本号避免读旧缓存。 */
  function ensureCss() {
    var href = '/assets/product-options-20261028.css?v=20261030i';
    var links = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < links.length; i++) {
      if (String(links[i].getAttribute('href') || '').indexOf('product-options-20261028.css') >= 0) return;
    }
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
  }

  function start() {
    boot();
    guard();
    watchRoute();
  }

  loadDB(function () {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start);
    } else {
      start();
    }
  });

  window.addEventListener('hashchange', hashJump);
})();

