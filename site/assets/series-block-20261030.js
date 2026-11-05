/* 系列补充块（2026-10-30）
 *
 * 为什么要有这个文件：
 *   产品页的正文是主脚本按产品记录现场画的，静态 HTML 里手写的新区块
 *   在页面启动后会被整段覆盖掉。所以「五维定制说明」和「全系列对照表」
 *   改成渲染完成后再补进去，数据放在 /data/series-blocks-20261030.json。
 *
 * 插入位置：规格表那一节之后、适用场景之前。
 * 站内点产品卡是框架内跳转，整页不重载，所以同时监听地址变化。
 */
(function () {
  'use strict';

  var ID = 'ec-series-block';
  var URL = '/data/series-blocks-20261030.json';
  var DB = null;
  var LOADING = false;
  var DONE = '';

  function key() {
    var p = location.pathname;
    if (p.charAt(p.length - 1) !== '/') p += '/';
    return p;
  }

  function el(tag, cls, html) {
    var d = document.createElement(tag);
    if (cls) d.className = cls;
    if (html != null) d.innerHTML = html;
    return d;
  }

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function axesNode(a) {
    var sec = el('section', 'ec-product-scenarios ec-library-detail-section');
    sec.appendChild(el('p', 'ec-scenario-kicker', esc(a.kicker)));
    var h = el('h2', null, esc(a.h2));
    h.id = 'series-axes-title';
    sec.appendChild(h);
    sec.appendChild(el('p', 'ec-scenario-role', esc(a.role)));

    var grid = el('div', 'ec-scenario-grid');
    a.cards.forEach(function (c) {
      var art = el('article', 'ec-scenario-card');
      art.appendChild(el('h3', null, esc(c[0])));
      art.appendChild(el('p', null, esc(c[1])));
      grid.appendChild(art);
    });
    sec.appendChild(grid);
    return sec;
  }

  function refNode(r) {
    var sec = el('section', 'ec-library-detail-section');
    sec.appendChild(el('h2', null, esc(r.h2)));

    var style = el('style');
    style.textContent = '.ec-series-ref th{width:auto!important;white-space:nowrap}' +
      '.ec-series-ref thead th{background:#eef2e9}.ec-series-ref td{font-size:13px}';
    sec.appendChild(style);

    var wrap = el('div', 'ec-library-spec-table ec-series-ref');
    var table = el('table');

    var thead = el('thead');
    var trh = el('tr');
    r.heads.forEach(function (h) {
      var th = el('th', null, esc(h));
      th.setAttribute('scope', 'col');
      trh.appendChild(th);
    });
    thead.appendChild(trh);
    table.appendChild(thead);

    var tbody = el('tbody');
    r.rows.forEach(function (row) {
      var tr = el('tr');
      row.forEach(function (cell) { tr.appendChild(el('td', null, esc(cell))); });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    sec.appendChild(wrap);
    sec.appendChild(el('p', 'ec-scenario-role', esc(r.note)));
    return sec;
  }

  function removeOld() {
    var old = document.getElementById(ID);
    if (old && old.parentNode) old.parentNode.removeChild(old);
    // 静态页里写过一份同名区块，页面没被覆盖时会出现两份，去重
    var dup = document.querySelectorAll('.ec-series-ref');
    for (var i = 0; i < dup.length; i++) {
      var s = dup[i].parentNode;
      if (s && s.id !== ID && s.querySelector('h2')) {
        var t = s.querySelector('h2').textContent || '';
        if (/Full series reference|全系列对照表/.test(t)) s.parentNode.removeChild(s);
      }
    }
  }

  function mount() {
    var k = key();
    if (!DB) return;
    var cfg = DB[k];
    if (!cfg) {
      if (DONE === k) return;
      removeOld();
      DONE = k;
      return;
    }
    if (DONE === k && document.getElementById(ID)) return;

    // 找「规格」那一节，插在它后面；找不到就挂在正文最后
    var host = null;
    var secs = document.querySelectorAll('main section');
    for (var i = 0; i < secs.length; i++) {
      var h = secs[i].querySelector('h2');
      if (h && /specifications|product specifications|规格|订单确认/i.test(h.textContent)) { host = secs[i]; break; }
    }
    if (!host) {
      var main = document.querySelector('main');
      if (!main) return;
      host = main.lastElementChild;
      if (!host) return;
    }
    var parent = host.parentNode;
    if (!parent) return;

    removeOld();

    var box = el('div');
    box.id = ID;
    box.setAttribute('data-path', k);
    box.appendChild(axesNode(cfg.axes));
    box.appendChild(refNode(cfg.ref));

    parent.insertBefore(box, host.nextSibling);
    DONE = k;
  }

  function load(cb) {
    if (DB || LOADING) { if (DB) cb(); return; }
    LOADING = true;
    var x = new XMLHttpRequest();
    x.open('GET', URL, true);
    x.onload = function () {
      try { DB = JSON.parse(x.responseText); } catch (e) { DB = {}; }
      LOADING = false;
      cb();
    };
    x.onerror = function () { DB = {}; LOADING = false; cb(); };
    x.send();
  }

  function boot() {
    load(function () {
      mount();
      setTimeout(mount, 400);
      setTimeout(mount, 1200);
    });
  }

  // 站内跳转不重载页面，盯住地址
  function watchRoute() {
    if (watchRoute.done) return;
    watchRoute.done = true;
    ['pushState', 'replaceState'].forEach(function (m) {
      var orig = history[m];
      if (!orig) return;
      history[m] = function () {
        var r = orig.apply(this, arguments);
        DONE = '';
        setTimeout(mount, 60);
        setTimeout(mount, 500);
        return r;
      };
    });
    window.addEventListener('popstate', function () {
      DONE = '';
      setTimeout(mount, 60);
      setTimeout(mount, 500);
    });
    setInterval(function () {
      var box = document.getElementById(ID);
      if (!box || box.getAttribute('data-path') !== key()) mount();
    }, 900);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { boot(); watchRoute(); });
  } else {
    boot();
    watchRoute();
  }
})();
