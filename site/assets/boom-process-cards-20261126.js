/* 2026-11-26 工艺页（UV / 激光 / 热转印 / 变色油墨）产品卡改成上新页同款型号卡
   为什么用脚本：卡片是 React 整块重画的，静态 HTML 里没有稳定结构，直接改页面会被覆盖。
   这里在渲染后把 .uvc-card 重组为 .fs-card（上新页已在用的卡片结构），幂等、可重复执行。

   v2（2026-11-26 晚）：老板要求
   1) 名称不再用概念名（RIVIERA / NOCTURNE…），改成客户看得懂的实物名，如 "15.5 oz Tritan Wine Glass"；
      概念名降级，跟型号放同一行（HJB-039 · RIVIERA）。
   2) 原来被丢掉的故事文案（.uvc-description）加回来，作为小字。
   3) 同一页里如果某句文案在 3 张以上卡片重复（模板句，如变色油墨页），就不再显示，避免 6 张卡长得一模一样。 */
(function () {
  var V = '20261126c';
  if (window.__boomProcessCards === V) return;
  window.__boomProcessCards = V;

  /* 型号 → 实物名。容量取自卡片 kicker（445 ml / 15.5 oz），品类取自产品页 slug。
     材质词只写和卡片材质标一致的那些（激光页全标 TRITAN，所以亚克力杯不写材质，免得自相矛盾）。
     表里没有的型号，退回用 kicker 里的容量拼一个保底名，不会把材质标当名字。 */
  var NAMES = {
    'HJB-039':  { en: '15.5 oz Tritan Wine Glass',   zh: '15.5oz Tritan 红酒杯' },
    'HJB-041':  { en: '12 oz Tritan Wine Glass',     zh: '12oz Tritan 红酒杯' },
    'HJB-042':  { en: '9 oz Stemless Champagne Flute', zh: '9oz 无脚香槟杯' },
    'HJB-066':  { en: '5 oz Champagne Flute',        zh: '5oz 香槟杯' },
    'GJB-001':  { en: '16 oz Silicone Pint Glass',   zh: '16oz 硅胶品脱杯' },
    'GJB-008':  { en: '12 oz Silicone Wine Glass',   zh: '12oz 硅胶红酒杯' },
    'TYCB-001': { en: '16 oz Stadium Cup',           zh: '16oz 运动场杯' },
    'TYCB-003': { en: '16 oz Stadium Cup',           zh: '16oz 运动场杯' },
    'TYCB-004': { en: '24 oz Stadium Cup',           zh: '24oz 运动场杯' },
    'SXB-001':  { en: '16 oz Double-Wall Tumbler',   zh: '16oz 双层随行杯' },
    'SJSB-001': { en: '48 oz Mug with Straw',        zh: '48oz 带吸管杯' },
    'PJB-050':  { en: '17 oz Beer Mug',              zh: '17oz 啤酒杯' },
    'MSB-002':  { en: '16 oz Pint Tumbler',          zh: '16oz 品脱杯' },
    'MSB-009':  { en: '16 oz Tumbler with Straw',    zh: '16oz 带吸管随行杯' },
    'FGB-028':  { en: '16 oz LED Pilsner Cup',       zh: '16oz LED 皮尔森杯' },
    'FGB-029':  { en: '18 oz LED Tumbler',           zh: '18oz LED 随行杯' },
    'BSB-001':  { en: '12 oz Color-Changing Stadium Cup', zh: '12oz 变色运动场杯' },
    'BSB-002':  { en: '16 oz Color-Changing Stadium Cup', zh: '16oz 变色运动场杯' },
    'BSB-003':  { en: '22 oz Color-Changing Stadium Cup', zh: '22oz 变色运动场杯' },
    'BSB-011':  { en: '14 oz Color-Changing Beer Mug', zh: '14oz 变色扎啤杯' },
    'BSB-014':  { en: '14 oz Color-Changing Hurricane Glass', zh: '14oz 变色飓风杯' },
    'BSB-015':  { en: '16 oz Color-Changing Tumbler with Straw', zh: '16oz 变色带吸管随行杯' }
  };

  /* 卡片图统一处理过：裁掉四周白边，产品按同一占比放到 1000×1000 画布上
     （原图留白多少不一，卡片里有的杯子占满、有的只剩一小块）。
     只替换这四批图的路径，其他图原样用。 */
  var NORM_DIRS = {
    'uv-edit-20261023': 1,
    'laser-etch-v2-20261024': 1,
    'heat-edit-20261023': 1,
    'cold-live-20261024': 1
  };
  function normSrc(src) {
    var m = /^\/img\/([^\/]+)\/([^\/]+)\.webp$/.exec(src || '');
    if (!m || !NORM_DIRS[m[1]]) return src;
    return '/img/process-cards-20261126/' + m[1] + '__' + m[2] + '.webp';
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function convert() {
    var config=window.__boomPageContract;
    if(/^\/(?:zh\/)?uv-printing\/$/.test(location.pathname)&&config&&config.uvPlasticCards){var grid=document.querySelector('.uvc-grid');if(grid&&!grid.querySelector('[data-uv-plastic-model]'))grid.innerHTML=config.uvPlasticCards;}

    var zh = /^\/zh(\/|$)/.test(location.pathname);
    var CTA_FULL = zh ? '查看型号与选项 →' : 'View model & options →';
    var CTA_SHORT = zh ? '查看型号 →' : 'View model →';

    /* 第一遍：把原始卡片的数据全部读出来（还没动 DOM） */
    var cards = document.querySelectorAll('article.uvc-card');
    var items = [];
    var storyCount = {}, noteCount = {};

    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      if (c.getAttribute('data-pcard') === '1') continue;

      var link = c.querySelector('a[href]');
      var img = c.querySelector('img');
      if (!link || !img) continue;

      var numEl = c.querySelector('.uvc-number');
      var matEl = c.querySelector('.uvc-material');
      var kickEl = c.querySelector('.uvc-kicker');
      var nameEl = c.querySelector('h3');
      var descEl = c.querySelector('.uvc-description');
      var noteEl = c.querySelector('.uvc-bottom span');

      var kicker = kickEl ? String(kickEl.textContent || '').trim() : '';
      var parts = kicker.split('/');
      var model = (parts[0] || '').trim();
      var capacity = parts.slice(1).join('/').trim().replace(/\s*\/\s*/g, ' / ');
      var material = matEl ? String(matEl.textContent || '').trim().split('/')[0].trim() : '';
      var num = numEl ? String(numEl.textContent || '').trim() : '';
      var concept = nameEl ? String(nameEl.textContent || '').trim() : '';
      var story = descEl ? String(descEl.textContent || '').trim() : '';
      var note = noteEl ? String(noteEl.textContent || '').trim() : '';

      var hit = NAMES[model];
      var display = hit ? (zh ? hit.zh : hit.en) : (capacity ? (capacity + (material ? ' ' + material : '')) : concept);

      if (story) storyCount[story] = (storyCount[story] || 0) + 1;
      if (note) noteCount[note] = (noteCount[note] || 0) + 1;

      items.push({
        el: c, href: link.getAttribute('href'), imgSrc: img.getAttribute('src') || '',
        alt: img.getAttribute('alt') || '', model: model, concept: concept,
        display: display, story: story, note: note, capacity: capacity,
        tag: num ? (num + (material ? ' · ' + material : '')) : material
      });
    }

    /* 第二遍：渲染。同页重复 3 次以上的句子当模板句，不显示 */
    var anyStory = false;
    for (var k = 0; k < items.length; k++) {
      var it = items[k];
      var c2 = it.el;
      var showStory = it.story && storyCount[it.story] < 3 ? it.story : '';
      var showNote = it.note && noteCount[it.note] < 3 ? it.note : '';
      if (showStory) anyStory = true;

      c2.className = 'fs-card';
      c2.setAttribute('data-pcard', '1');
      c2.innerHTML =
        '<a class="fs-card-img" href="' + esc(it.href) + '">' +
          '<img src="' + esc(normSrc(it.imgSrc)) + '" alt="' + esc(it.alt) + '" loading="lazy" width="300" height="300">' +
          (it.tag ? '<span class="fs-tag">' + esc(it.tag) + '</span>' : '') +
        '</a>' +
        '<div class="fs-card-body">' +
          '<p class="fs-card-model">' + esc(it.model) + (it.concept ? ' · ' + esc(it.concept) : '') + '</p>' +
          '<p class="fs-card-name"><a href="' + esc(it.href) + '">' + esc(it.display) + '</a></p>' +
          (showStory ? '<p class="fs-card-story" title="' + esc(it.story) + '">' + esc(showStory) + '</p>' : '') +
          (showNote ? '<p class="fs-card-facts">' + esc(showNote) + '</p>' : '') +
          '<a class="fs-card-cta" href="' + esc(it.href) + '">' +
            '<span class="fs-cta-full">' + CTA_FULL + '</span>' +
            '<span class="fs-cta-short">' + CTA_SHORT + '</span>' +
          '</a>' +
        '</div>';
    }

    /* 整页文案都是模板句时（没有故事可写），图放大一些，免得卡片下半截空着 */
    if (items.length && !anyStory) {
      var g = document.querySelector('.uvc-grid');
      if (g) g.classList.add('pcard-tall-img');
    }
  }

  var timer = null;
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () {
      timer = null;
      convert();
    }, 80);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule);
  } else {
    schedule();
  }

  var mo = new MutationObserver(schedule);
  mo.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('load', schedule);
  window.addEventListener('popstate', schedule);
  setTimeout(schedule, 500);
  setTimeout(schedule, 1400);
  setTimeout(schedule, 2600);
})();
