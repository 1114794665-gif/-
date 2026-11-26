/* boom-craft-cards-20261126
 * 把工艺页（UV打印 / 激光装饰 / 传热 / 丝网印刷 / LED定制）里自成一派的商品卡，
 * 统一成「上新页」同款卡片：白底圆角带边框、方形图区、编号行、标题、规格、底部链接。
 * 说明：这些页面由客户端整体重画，直接改 HTML 会被覆盖，因此只能在渲染完成后重建。
 * 重建后打标记，避免观察器反复触发；卡片被重画（标记丢失）时才再次执行。
 */
(function () {
  'use strict';
  if (window.__boomCraftCards) return;
  window.__boomCraftCards = 1;

  var DONE = 'data-craft-cards';
  var UV = '/uv-printing/,/laser-engraving/,/heat-transfer-printing/,/screen-printing/,/custom-led-drinkware/';
  if (UV.indexOf(location.pathname) < 0) return;

  function img(tag) { return tag ? tag.outerHTML.replace(/\s+data-[a-z-]+="[^"]*"/g, '') : ''; }
  function esc(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function up(s) { return (s || '').trim(); }

  // ---- UV / 激光 / 传热：article.uvc-card ----
  function syncUvc(card) {
    var art = card.querySelector('.uvc-art');
    if (!art) return;
    var href = art.getAttribute('href') || '#';
    var im = art.querySelector('img');
    var num = art.querySelector('.uvc-number');
    var mat = art.querySelector('.uvc-material');
    var kicker = card.querySelector('.uvc-kicker');
    var h3 = card.querySelector('h3');
    var desc = card.querySelector('.uvc-description');
    var note = card.querySelector('.uvc-bottom > span');
    var link = card.querySelector('.uvc-bottom a');

    var media = '<a class="ec-library-image-link craft-media" href="' + esc(href) + '">' +
      (im ? img(im) : '') +
      (num ? '<span class="craft-num">' + esc(num.textContent) + '</span>' : '') +
      (mat ? '<span class="craft-mat">' + esc(mat.textContent) + '</span>' : '') +
      '</a>';

    var copy = '<div class="ec-library-card-copy craft-copy">' +
      (kicker ? '<p class="ec-library-model craft-model">' + esc(up(kicker.textContent)) + '</p>' : '') +
      '<h3><a href="' + esc(href) + '">' + esc(up(h3 ? h3.textContent : '')) + '</a></h3>' +
      (desc ? '<p class="ec-library-facts craft-facts">' + esc(up(desc.textContent)) + '</p>' : '') +
      (note ? '<p class="craft-note">' + esc(up(note.textContent)) + '</p>' : '') +
      '<a class="ec-library-link craft-link" href="' + esc(link ? (link.getAttribute('href') || href) : href) + '">View model &amp; options</a>' +
      '</div>';

    card.classList.add('ec-library-card', 'craft-card');
    card.innerHTML = media + copy;
    card.setAttribute(DONE, '1');
  }

  // ---- 丝网印刷 / LED：article.led-product ----
  function syncLed(card) {
    var a = card.querySelector('.led-product-image');
    if (!a) return;
    var href = a.getAttribute('href') || '#';
    var im = a.querySelector('img');
    var copyEl = card.querySelector('.led-product-copy');
    var model = card.querySelector('.led-model');
    var h3 = card.querySelector('h3');
    var facts = copyEl ? copyEl.querySelector(':scope > p:not(.led-model):not(.led-image-note)') : null;
    var note = card.querySelector('.led-image-note');
    var link = card.querySelector('.led-text-link');

    var media = '<a class="ec-library-image-link craft-media" href="' + esc(href) + '">' + (im ? img(im) : '') + '</a>';
    var copy = '<div class="ec-library-card-copy craft-copy">' +
      (model ? '<p class="ec-library-model craft-model">' + esc(up(model.textContent)) + '</p>' : '') +
      '<h3><a href="' + esc(href) + '">' + esc(up(h3 ? h3.textContent : '')) + '</a></h3>' +
      (facts ? '<p class="ec-library-facts craft-facts">' + esc(up(facts.textContent)) + '</p>' : '') +
      (note ? '<p class="craft-note">' + esc(up(note.textContent)) + '</p>' : '') +
      '<a class="ec-library-link craft-link" href="' + esc(link ? (link.getAttribute('href') || href) : href) + '">View model &amp; options</a>' +
      '</div>';

    card.classList.add('ec-library-card', 'craft-card');
    card.innerHTML = media + copy;
    card.setAttribute(DONE, '1');
  }

  function run() {
    var n = 0;
    document.querySelectorAll('article.uvc-card:not([' + DONE + '])').forEach(function (c) { syncUvc(c); n++; });
    document.querySelectorAll('article.led-product:not([' + DONE + '])').forEach(function (c) { syncLed(c); n++; });
    // 网格统一成上新页的四列节奏
    document.querySelectorAll('.uvc-grid:not(.craft-grid), .led-products-grid:not(.craft-grid)').forEach(function (g) {
      g.classList.add('craft-grid');
      n++;
    });
    return n;
  }

  run();
  var tries = [120, 300, 600, 1000, 1600, 2400, 3200];
  tries.forEach(function (t) { setTimeout(run, t); });

  // 卡片被整体重画后再补一次（节流，避免自我触发）
  var queued = false;
  new MutationObserver(function () {
    if (queued) return;
    queued = true;
    setTimeout(function () { queued = false; run(); }, 250);
  }).observe(document.body, { childList: true, subtree: true });
})();
