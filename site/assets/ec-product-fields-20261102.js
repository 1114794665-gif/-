/* 产品页规格与工艺补丁 (2026-11-02)
 *
 * 为什么要这个文件：
 *   产品页是 React 生成的，页面里预渲染的静态表格在浏览器里会被重画一次
 *   （实测：静态插进去的行，加载两秒后消失）。所以规格这块必须等 React
 *   画完再补一遍，并且 React 每次重画都要能补回去 —— 用 MutationObserver。
 *
 * 数据来源：/data/product-fields.json（按页面地址索引，后台保存时更新）
 *   { "/products/xxx/": { moq, materials[], capacities[], accessories[], processes[], image, imageFrom } }
 *
 * 补什么：
 *   Minimum order / Material options / Capacity options / Decoration methods /
 *   Optional accessories —— 写进 .bx-spec-table，同时更新顶部三个小标签。
 *   image 有值时，把页面上的旧主图换成新的。
 */
(function () {
  'use strict';
  var V = '20261102d';
  var DATA = null, BY = {}, APPLYING = false, TIMER = null;

  var LBL = {
    moq: 'Minimum order',
    mat: 'Material options',
    cap: 'Capacity options',
    proc: 'Decoration methods',
    acc: 'Optional accessories'
  };
  var ANCHOR = {
    moq: 'Minimum order',
    mat: 'Material',
    cap: 'Dimensions',
    proc: 'Logo method',
    acc: 'Minimum order'
  };

  var ACC_NAME = {
    'Lid': 'Lid', 'Straw': 'Straw', 'Straw lid': 'Straw lid',
    'Dome lid': 'Dome lid', 'Handle': 'Handle', 'Sleeve': 'Sleeve',
    'Coaster': 'Coaster', 'Lanyard': 'Lanyard', 'Stirrer': 'Stirrer'
  };

  function norm(p) {
    p = String(p || '/').split('?')[0].split('#')[0];
    if (p.length > 1 && p.slice(-1) !== '/') p += '/';
    return p;
  }

  /* 一个系列页挂多个型号：地址带 #model-SKU，容量/材质/配件各型号不同 */
  function keys() {
    var p = norm(location.pathname);
    var m = String(location.hash || '').match(/model-([A-Za-z0-9_\-]+)/);
    return m ? [p + '#model-' + m[1], p] : [p];
  }

  function pick() {
    var ks = keys(), i;
    for (i = 0; i < ks.length; i++) if (DATA[ks[i]]) return DATA[ks[i]];
    /* 地址上没带 #model-XXX（直接打开系列页）时，用这一页的第一个型号 */
    var p = norm(location.pathname);
    if (BY[p] && BY[p].length) return DATA[BY[p][0]];
    return null;
  }

  function moqText(n) {
    n = parseInt(n, 10);
    if (!n || isNaN(n)) return 'Quoted per project';
    if (n <= 10) return 'From 10 pcs on existing tooling · 1,000 pcs when one part changes · 3,000 pcs for a new mould';
    if (n <= 500) return '500 pcs while the tooling is under review · 1,000 pcs when one part changes · 3,000 pcs for a new mould';
    if (n <= 1000) return 'From 1,000 pcs · 3,000 pcs for a brand-new mould';
    return 'From ' + n.toLocaleString('en-US') + ' pcs · new mould required';
  }

  function joinAcc(a) {
    return (a || []).map(function (x) { return ACC_NAME[x] || x; }).join(' · ');
  }

  function wants(rec, table) {
    var out = [];
    var matRow = table ? rowOf(table, 'Material') : null;
    var matNow = matRow ? String((matRow.lastElementChild || {}).textContent || '') : '';
    if (rec.moq) out.push(['moq', moqText(rec.moq)]);

    if (rec.materials && rec.materials.length) {
      var m = rec.materials.join(' · ');
      /* 行已经存在就更新；行不存在时，若只有一个值且跟页面上材质一模一样，就不另起一行 */
      var hasMat = table ? !!rowOf(table, 'Material options') : false;
      if (hasMat || !(rec.materials.length === 1 && matNow.trim().toLowerCase() === m.toLowerCase())) {
        out.push(['mat', m]);
      }
    }

    if (rec.capacities && rec.capacities.length) {
      var hasCap = table ? !!rowOf(table, 'Capacity options') : false;
      var capNow = '';
      var pills = document.querySelector('.bx-spec-pills');
      if (pills) {
        [].slice.call(pills.children).forEach(function (d) {
          if (d.textContent.toUpperCase().indexOf('CAPACITY') === 0) capNow = d.textContent;
        });
      }
      if (hasCap || !(rec.capacities.length === 1 && capNow.indexOf(rec.capacities[0]) >= 0)) {
        out.push(['cap', rec.capacities.join(' · ')]);
      }
    }

    if (rec.processes && rec.processes.length) out.push(['proc', rec.processes.join(' · ')]);
    if (rec.accessories && rec.accessories.length) out.push(['acc', joinAcc(rec.accessories)]);
    return out;
  }

  function rowOf(table, label) {
    var ths = table.querySelectorAll('th');
    for (var i = 0; i < ths.length; i++) {
      if (ths[i].textContent.trim().toLowerCase() === label.toLowerCase()) return ths[i].parentNode;
    }
    return null;
  }

  /* 把一行写进表格：有就改，没有就插在锚点行后面 */
  function upsert(table, label, value, anchorLabel) {
    var tr = rowOf(table, label);
    if (tr) {
      var td = tr.querySelector('td') || tr.lastElementChild;
      if (td && td.textContent.trim() !== value) td.textContent = value;
      return;
    }
    var anchor = rowOf(table, anchorLabel);
    var nr = document.createElement('tr');
    nr.setAttribute('data-ecf', '1');
    var th = document.createElement('th');
    th.setAttribute('scope', 'row');
    th.textContent = label;
    var td2 = document.createElement('td');
    td2.textContent = value;
    nr.appendChild(th); nr.appendChild(td2);
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(nr, anchor.nextSibling);
    } else {
      var tb = table.querySelector('tbody') || table;
      tb.appendChild(nr);
    }
  }

  function pills(rec) {
    var box = document.querySelector('.bx-spec-pills');
    if (!box) return;
    var kids = [].slice.call(box.children);
    kids.forEach(function (d) {
      var t = d.textContent.toUpperCase();
      var val = d.lastElementChild;
      if (!val || val === d) return;
      if (t.indexOf('MATERIAL') === 0 && rec.materials && rec.materials.length) {
        var s = rec.materials.join(' · ');
        if (val.textContent.trim() !== s) val.textContent = s;
      }
      if (t.indexOf('CAPACITY') === 0 && rec.capacities && rec.capacities.length) {
        var s2 = rec.capacities.join(' · ');
        if (val.textContent.trim() !== s2) val.textContent = s2;
      }
    });
  }

  function swapImage(rec) {
    if (!rec.image) return;
    var from = rec.imageFrom;
    if (!from || from === rec.image) return;
    var imgs = document.querySelectorAll('img');
    for (var i = 0; i < imgs.length; i++) {
      var src = imgs[i].getAttribute('src') || '';
      if (src.indexOf(from) >= 0) {
        imgs[i].setAttribute('src', rec.image);
        imgs[i].removeAttribute('srcset');
      }
    }
  }

  /* 只改已存在的行，不新增（用在价格档位这种每页都有的行上） */
  function setIfExists(table, label, value) {
    var tr = rowOf(table, label);
    if (!tr) return;
    var td = tr.querySelector('td') || tr.lastElementChild;
    if (td && td.textContent.trim() !== value) td.textContent = value;
  }

  function renderedSku(table) {
    var tr = rowOf(table, 'Model');
    return tr ? String((tr.lastElementChild || {}).textContent || '').trim() : '';
  }

  function apply() {
    if (!DATA || APPLYING) return;
    var rec = pick();
    if (!rec) return;
    APPLYING = true;
    try {
      var tables = document.querySelectorAll('.bx-spec-table table, .ec-library-spec-table table');
      for (var t = 0; t < tables.length; t++) {
        var table = tables[t];
        var r = rec;
        /* 系列页上显示的是哪个型号，就只按那个型号写；对不上就不动，免得张冠李戴 */
        var sku = renderedSku(table);
        if (sku && rec.sku && sku.toLowerCase() !== String(rec.sku).toLowerCase()) {
          var alt = DATA[norm(location.pathname) + '#model-' + sku];
          if (!alt) continue;
          r = alt;
        }
        var list = wants(r, table);
        for (var i = 0; i < list.length; i++) {
          upsert(table, LBL[list[i][0]], list[i][1], ANCHOR[list[i][0]]);
        }
        /* 旧的 250 档位早已作废，顺手改成现行三档 */
        setIfExists(table, 'Price basis', 'FOB Shenzhen · quoted per tier: 10 / 1,000 / 3,000 pcs');
      }
      pills(r);
      swapImage(r);
    } catch (e) {
      /* 静默：这里出错不该影响页面其它部分 */
    }
    APPLYING = false;
  }

  function schedule() {
    clearTimeout(TIMER);
    TIMER = setTimeout(apply, 80);
  }

  function hook() {
    var mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true });
    ['pushState', 'replaceState'].forEach(function (m) {
      var o = history[m];
      history[m] = function () { var r = o.apply(this, arguments); schedule(); return r; };
    });
    window.addEventListener('popstate', schedule);
    window.addEventListener('hashchange', schedule);
    schedule();
    /* 前几秒多补几次：React 水合完成的时机不固定 */
    [200, 600, 1200, 2500, 4000].forEach(function (ms) { setTimeout(apply, ms); });
  }

  function boot() {
    if (!/^\/products\//.test(location.pathname)) return;
    var x = new XMLHttpRequest();
    /* 数据随时会改，按分钟换一次地址，别让浏览器拿旧的 */
    x.open('GET', '/data/product-fields.json?v=' + V + '-' + Math.floor(Date.now() / 60000), true);
    x.onload = function () {
      try { DATA = JSON.parse(x.responseText); } catch (e) { return; }
      BY = {};
      Object.keys(DATA).forEach(function (k) {
        var i = k.indexOf('#');
        var p = i > 0 ? k.slice(0, i) : k;
        (BY[p] = BY[p] || []).push(k);
      });
      hook();
    };
    x.onerror = function () { };
    x.send();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
