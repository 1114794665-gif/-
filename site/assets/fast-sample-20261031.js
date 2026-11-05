/* 快速打样（Fast sampling）标注 + 上新页样品栏 — v2 / 2026-10-31
 *
 * v1 是按「含不含金属」猜的，猜错的多，已作废。
 * v2 只认桌面产品库里公司名称 = BYF 的 103 个自供型号（数据见 /data/fast-sample-20261031.json 的 ownSkus）。
 *
 * 三处改动：
 *   1. 产品页：当前款式是自供型号 → 标题下显示「快速打样 / 10 件起 / 1 天出样 / 7–10 天门到门」横条；
 *      当前款式不是自供、但这一系列里有 → 显示一行提示；款式缩略图上自供型号带绿点。
 *   2. 上新页：卡片本身是自供型号 → 图角标 + 卡内一行小字。
 *   3. 上新页顶部：新增「快速打样样品」栏，五个品类各两款，全部自供。
 *
 * 为什么用脚本注入：站点是预渲染 + React 接管，直接写静态 HTML 会被渲染冲掉。
 */
(function () {
  'use strict';

  var V = '20261031d';
  var DATA_URL = '/data/fast-sample-20261031.json?v=' + V;
  var CSS_HREF = '/assets/fast-sample-20261031.css?v=' + V;
  var FLAG_ID = 'fs-flag';
  var SECTION_ID = 'fs-samples';

  var DATA = null;
  var loading = false;
  var waiters = [];
  var pending = false;

  function isZh() {
    return location.pathname.indexOf('/zh/') === 0 || location.pathname === '/zh' ||
      (document.documentElement.lang || '').toLowerCase().indexOf('zh') === 0;
  }

  function T() {
    var p = (DATA && DATA.promise) || {};
    return isZh() ? (p.zh || {}) : (p.en || {});
  }

  function ensureCss() {
    if (document.querySelector('link[data-fs]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = CSS_HREF;
    l.setAttribute('data-fs', '1');
    document.head.appendChild(l);
  }

  function withData(cb) {
    if (DATA) return cb();
    if (loading) { waiters.push(cb); return; }
    loading = true;
    fetch(DATA_URL, { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        loading = false;
        if (!d || !d.ownSkus) return;
        DATA = d;
        var q = waiters.splice(0);
        for (var i = 0; i < q.length; i++) q[i]();
      })
      .catch(function () { loading = false; /* 拿不到数据就不标注，页面照常 */ });
  }

  function currentSlug() {
    var seg = location.pathname.split('/').filter(Boolean);
    var i = seg.indexOf('products');
    return i >= 0 && seg[i + 1] ? seg[i + 1] : '';
  }

  function isProductPage() { return /\/products\/[^/]+\//.test(location.pathname); }
  function isNewArrivals() { return /\/new-arrivals\//.test(location.pathname); }

  function pageOwn() {
    if (!DATA || !DATA.pages) return [];
    var rec = DATA.pages[currentSlug()];
    return rec && rec.own ? rec.own : [];
  }

  function pageMain() {
    if (!DATA || !DATA.pages) return '';
    var rec = DATA.pages[currentSlug()];
    return rec && rec.main ? rec.main : '';
  }

  /* 当前在看哪个型号：优先读款式栏选中的那格，其次看网址里的 #model-，最后用这页主款 */
  function currentSku() {
    var b = document.querySelector('#product-options .bx-opt-sw.is-on');
    if (b) {
      var s = (b.getAttribute('data-sku') || '').toUpperCase();
      if (s) return s;
    }
    var m = (location.hash || '').match(/^#model-(.+)$/);
    if (m) return decodeURIComponent(m[1]).toUpperCase();
    return pageMain();
  }

  function sepHtml() { return '<span class="fs-sep">·</span>'; }

  function flagHtml(full, count) {
    var t = T();
    if (!full) {
      return '<span class="fs-pill">' + t.pill + '</span>' +
        '<p class="fs-promise">' + String(t.other).replace('{n}', count) + '</p>';
    }
    return '<span class="fs-pill">' + t.pill + '</span>' +
      '<p class="fs-promise">' +
      '<b>' + t.moq + '</b>' + sepHtml() +
      '<b>' + t.sample + '</b>' + sepHtml() +
      '<b>' + (t.shipShort || t.ship) + '</b>' +
      (t.shipNote ? '<span class="fs-note">' + t.shipNote + '</span>' : '') +
      '</p>';
  }

  /* ── 产品页 ─────────────────────────────────── */
  function renderProductFlag() {
    var existing = document.getElementById(FLAG_ID);
    var own = pageOwn();

    if (!own.length) {
      if (existing) existing.parentNode.removeChild(existing);
      return;
    }

    var dec = document.querySelector('.bx-product-decision');
    if (!dec) return;
    var h1 = dec.querySelector('h1');
    if (!h1) return;

    var full = own.indexOf(currentSku()) >= 0;
    var html = flagHtml(full, own.length);

    if (existing) {
      if (existing.getAttribute('data-full') !== String(full)) {
        existing.innerHTML = html;
        existing.className = 'fs-flag' + (full ? '' : ' is-hint');
        existing.setAttribute('data-full', String(full));
      }
      return;
    }

    var box = document.createElement('div');
    box.className = 'fs-flag' + (full ? '' : ' is-hint');
    box.id = FLAG_ID;
    box.setAttribute('data-full', String(full));
    box.innerHTML = html;

    var lead = dec.querySelector('.bx-lead');
    if (lead && lead.parentNode === dec) dec.insertBefore(box, lead);
    else h1.parentNode.insertBefore(box, h1.nextSibling);
  }

  /* 款式缩略图上给自供型号点一个绿点 */
  function markStyles() {
    var own = pageOwn();
    var sws = document.querySelectorAll('#product-options .bx-opt-sw');
    if (!own.length) {
      for (var k = 0; k < sws.length; k++) sws[k].classList.remove('is-fs');
      return;
    }
    for (var i = 0; i < sws.length; i++) {
      var b = sws[i];
      var is = own.indexOf((b.getAttribute('data-sku') || '').toUpperCase()) >= 0;
      if (is && !b.classList.contains('is-fs')) {
        b.classList.add('is-fs');
        b.setAttribute('title', (b.getAttribute('title') || '') + ' · ' + T().dotTitle);
      } else if (!is && b.classList.contains('is-fs')) {
        b.classList.remove('is-fs');
      }
    }
  }

  function clearProductFlag() {
    var f = document.getElementById(FLAG_ID);
    if (f) f.parentNode.removeChild(f);
    var sws = document.querySelectorAll('#product-options .bx-opt-sw.is-fs');
    for (var i = 0; i < sws.length; i++) sws[i].classList.remove('is-fs');
  }

  /* ── 上新页：卡片角标 ─────────────────────────── */
  function tagCards() {
    var t = T();
    if (!DATA) return;
    var own = DATA.ownSkus;
    var cards = document.querySelectorAll('article.ec-library-card');
    for (var i = 0; i < cards.length; i++) {
      var art = cards[i];
      var model = (art.getAttribute('data-model') || '').toUpperCase();
      if (own.indexOf(model) < 0) continue;

      var imgLink = art.querySelector('.na-img');
      if (imgLink && !imgLink.querySelector('.fs-tag')) {
        var tag = document.createElement('span');
        tag.className = 'fs-tag';
        tag.textContent = isZh() ? '快速打样' : 'Fast sample';
        imgLink.appendChild(tag);
      }

      var copy = art.querySelector('.ec-library-card-copy');
      if (copy && !copy.querySelector('.fs-card-line')) {
        var line = document.createElement('p');
        line.className = 'fs-card-line';
        line.textContent = t.card;
        var facts = copy.querySelector('.ec-library-facts');
        if (facts && facts.nextSibling) copy.insertBefore(line, facts.nextSibling);
        else copy.appendChild(line);
      }
    }
  }

  /* ── 上新页：快速打样样品栏 ───────────────────── */
  function sampleCardsHtml(list) {
    var zh = isZh();
    return list.map(function (s) {
      var href = zh ? s.hrefZh : s.hrefEn;
      var name = zh ? s.zh : s.en;
      var facts = zh ? s.factsZh : s.factsEn;
      var lineName = '';
      for (var i = 0; i < DATA.lines.length; i++) {
        var L = DATA.lines[i];
        if (L.key === s.line) lineName = zh ? (L.shortZh || L.zh) : (L.shortEn || L.en);
      }
      return '' +
        '<article class="fs-card">' +
          '<a class="fs-card-img" href="' + href + '">' +
            '<img src="' + s.img + '" alt="' + name + ' — ' + s.sku + '" loading="lazy" width="300" height="300">' +
            '<span class="fs-tag">' + (zh ? '快速打样' : 'Fast sample') + '</span>' +
          '</a>' +
          '<div class="fs-card-body">' +
            '<span class="fs-line-tag">' + lineName + '</span>' +
            '<p class="fs-card-model">' + s.sku + '</p>' +
            '<p class="fs-card-name"><a href="' + href + '">' + name + '</a></p>' +
            '<p class="fs-card-facts">' + facts + '</p>' +
            '<a class="fs-card-cta" href="' + href + '">' +
              '<span class="fs-cta-full">' + (zh ? '看款式与工艺 →' : 'View model &amp; options →') + '</span>' +
              '<span class="fs-cta-short">' + (zh ? '看款式 →' : 'View options →') + '</span>' +
            '</a>' +
          '</div>' +
        '</article>';
    }).join('');
  }

  function renderSamples() {
    if (!isNewArrivals() || !DATA) return;
    if (document.getElementById(SECTION_ID)) return;
    var host = document.querySelector('section.na-group');
    if (!host || !host.parentNode) return;
    if (!DATA.samples || !DATA.samples.length) return;

    var zh = isZh();

    /* 按品类交错排：第一行每类第一款，第二行每类第二款，同列同品类 */
    var byLine = {};
    DATA.samples.forEach(function (s) { (byLine[s.line] = byLine[s.line] || []).push(s); });
    var ordered = [];
    var rows = 0;
    DATA.lines.forEach(function (l) { rows = Math.max(rows, (byLine[l.key] || []).length); });
    for (var r = 0; r < rows; r++) {
      DATA.lines.forEach(function (l) {
        var arr = byLine[l.key] || [];
        if (arr[r]) ordered.push(arr[r]);
      });
    }

    var sec = document.createElement('section');
    sec.className = 'fs-samples';
    sec.id = SECTION_ID;
    sec.setAttribute('aria-labelledby', 'fs-samples-h');
    sec.innerHTML =
      '<div class="fs-samples-head">' +
        '<h2 id="fs-samples-h">' + (zh ? '快速打样样品' : 'Fast-sampling samples') + '</h2>' +
        '<span>' + ordered.length + (zh ? ' 款 · 五类各两款 · 全部自有模具' : ' models · two per category · all on our own moulds') + '</span>' +
      '</div>' +
      '<p class="fs-samples-lede">' + (zh
        ? '从自家模具里每个品类挑两款：酒杯、香槟杯、啤酒杯、冰桶、酒具配件。都是现有模具，印好寄出一天，大货按同一套规格走，不用另开模。'
        : 'Two models per category, taken from our own moulds: wine, champagne, beer, ice buckets and bar tools. Everything sits on existing tooling, so a printed sample leaves in a day and bulk runs on the same spec — no new mould needed.') + '</p>' +
      '<ul class="fs-terms">' +
        '<li><b>' + (zh ? '10 件起订' : 'MOQ 10 pcs') + '</b><span>' + (zh
          ? '十件就能下单，不收版费和开机费。'
          : 'Ten pieces is enough — no plate fee, no setup fee.') + '</span></li>' +
        '<li><b>' + (zh ? '最快 1 天出样' : 'Sample in 1 day') + '</b><span>' + (zh
          ? '打样一天完成并寄出，先确认颜色和印刷位置。'
          : 'Made and despatched within one working day, so you can check colour and print position first.') + '</span></li>' +
        '<li><b>' + (zh ? '7–10 天门到门' : '7–10 days door to door') + '</b><span>' + (zh
          ? '从确认订单算起，生产和运输一起算，送到你门口。'
          : 'Counted from order confirmation, production and freight included, delivered to your door.') + '</span></li>' +
      '</ul>' +
      '<div class="fs-grid">' + sampleCardsHtml(ordered) + '</div>';

    host.parentNode.insertBefore(sec, host);
  }

  function clearSamples() {
    var s = document.getElementById(SECTION_ID);
    if (s) s.parentNode.removeChild(s);
  }

  function apply() {
    if (isProductPage()) {
      withData(function () {
        renderProductFlag();
        markStyles();
      });
      clearSamples();
      return;
    }

    clearProductFlag();

    if (isNewArrivals()) {
      withData(function () {
        renderSamples();
        tagCards();
      });
    } else {
      clearSamples();
    }
  }

  function schedule() {
    if (pending) return;
    pending = true;
    setTimeout(function () {
      pending = false;
      apply();
    }, 220);
  }

  function boot() {
    ensureCss();
    apply();
    var obs = new MutationObserver(schedule);
    obs.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('evercup:scene-model-selected', schedule);
    window.addEventListener('popstate', schedule);
    window.addEventListener('hashchange', schedule);
    [600, 1500, 3000].forEach(function (ms) { setTimeout(apply, ms); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
