/* 产品详情页的「这只会用在哪」+ 采购要点（2026-10-27）
   硅胶款配沙滩/游艇/营地，LED 款配夜店/沙滩/游艇。
   详情页是前端渲染的，所以渲染完成后插到 #use 区块后面。
   LED 与硅胶的要点不一样：LED 买家关心电池和模式，硅胶买家关心耐温和能不能进洗碗机。 */
(function () {
  'use strict';

  var PATH = location.pathname;
  var isZh = /^\/zh\//.test(PATH);
  if (!/\/products\//.test(PATH)) { return; }
  if (window.__EVERCUP_SCENE_DETAIL__) { return; }

  var S = '/img/scene/';

  var SETS = {
    led: {
      en: {
        kicker: 'In use',
        h2: 'Where this one gets used.',
        lede: 'Night stock, beach bars and yacht decks are where LED actually sells. These are the three rooms buyers ask about first.',
        shots: [
          ['led-bar-night.jpg', 'Terrace bar — mixed light'],
          ['led-beach-night.jpg', 'Beach bar — full night'],
          ['led-yacht-night.jpg', 'Yacht stern — harbour lights']
        ],
        points: [
          ['Power', 'Button cell, CR2032 or LR44 by model. Swapped from the base, no tools.'],
          ['Light modes', 'Steady, slow fade, fast flash, multicolour cycle — fixed per model.'],
          ['Care', 'Hand wash only. No dishwasher, no soaking, no ice on the light unit.'],
          ['Certification', 'UN38.3 and MSDS for the cells; CE / RoHS on request.']
        ]
      },
      zh: {
        kicker: '用在现场',
        h2: '这一只会出现在哪。',
        lede: 'LED 真正走得动的地方是夜店备货、海滩酒吧和游艇甲板。买家最先问的就是这三种场子。',
        shots: [
          ['led-bar-night.jpg', '露台酒吧 · 混合光'],
          ['led-beach-night.jpg', '海滩酒吧 · 全夜场'],
          ['led-yacht-night.jpg', '游艇船尾 · 港灯']
        ],
        points: [
          ['供电', '纽扣电池，按型号 CR2032 或 LR44。从底座换，不用工具。'],
          ['发光模式', '常亮、慢变、快闪、多彩循环，按型号固定。'],
          ['保养', '只能手洗。不进洗碗机、不浸泡、冰块不压在灯板上。'],
          ['认证', '电芯有 UN38.3 和 MSDS，CE / RoHS 可出。']
        ]
      }
    },
    sil: {
      en: {
        kicker: 'In use',
        h2: 'Where this one gets used.',
        lede: 'Silicone earns its place on sand, on deck and at a campsite — anywhere glass would end the night early.',
        shots: [
          ['silicone-beach-day.jpg', 'Beach service — full sun'],
          ['silicone-yacht.jpg', 'Yacht deck — midday'],
          ['silicone-camp.jpg', 'Lake campsite — folding table']
        ],
        points: [
          ['Body', 'Food-grade silicone over a rigid core, moulded in one piece.'],
          ['Heat range', '&minus;40&nbsp;&deg;C to 230&nbsp;&deg;C. Oven and freezer safe.'],
          ['Care', 'Top-rack dishwasher. No staining from red wine or coffee.'],
          ['Printing', 'UV transfer or silk screen — cured, so it survives the wash cycle.']
        ]
      },
      zh: {
        kicker: '用在现场',
        h2: '这一只会出现在哪。',
        lede: '硅胶在沙滩、甲板和营地才显出价值 —— 这些地方用玻璃，一个晚上就得提前收场。',
        shots: [
          ['silicone-beach-day.jpg', '海滩出杯 · 正午强光'],
          ['silicone-yacht.jpg', '游艇甲板 · 正午'],
          ['silicone-camp.jpg', '湖畔营地 · 折叠桌']
        ],
        points: [
          ['杯体', '食品级硅胶包刚性内芯，一体模压。'],
          ['耐温', '&minus;40&nbsp;&deg;C 到 230&nbsp;&deg;C，可进烤箱和冷冻。'],
          ['保养', '洗碗机上层可洗。红酒和咖啡不留色。'],
          ['印刷', 'UV 热转印或丝印，烤过之后洗不掉。']
        ]
      }
    }
  };

  function kindOf() {
    var sku = '';
    try {
      var d = window.__EVERCUP_SERIES__;
      if (d && d.main && d.main.sku) { sku = d.main.sku; }
    } catch (e) {}
    if (!sku) {
      var m = (document.title || '').match(/\|\s*([A-Z]{2,4}-\d{3})\s*\|/);
      sku = m ? m[1] : '';
    }
    if (/^(FGB|BT|BD|JBPJ)-/.test(sku)) { return 'led'; }
    if (/^(GJB|BPJJ|LJB|GJZD)-/.test(sku)) { return 'sil'; }
    return '';
  }

  function build(kind) {
    var C = SETS[kind][isZh ? 'zh' : 'en'];
    var sec = document.createElement('section');
    sec.className = 'bx-wrap bx-section bx-scene-detail';
    sec.id = 'scene-in-use';
    sec.innerHTML =
      '<p class="bx-scene-kicker">' + C.kicker + '</p>' +
      '<h2 class="bx-check-h2">' + C.h2 + '</h2>' +
      '<p class="bx-check-lede">' + C.lede + '</p>' +
      '<div class="bx-proof-grid">' +
      C.shots.map(function (p) {
        return '<figure><img src="' + S + p[0] + '" alt="' + p[1] +
          '" loading="lazy" width="1536" height="1024"><figcaption>' + p[1] + '</figcaption></figure>';
      }).join('') + '</div>' +
      '<div class="bx-detail-points">' +
      C.points.map(function (p) {
        return '<div><h4>' + p[0] + '</h4><p>' + p[1] + '</p></div>';
      }).join('') + '</div>';
    return sec;
  }

  function place() {
    if (document.getElementById('scene-in-use')) { return 1; }
    var kind = kindOf();
    if (!kind) { return 0; }
    var use = document.getElementById('use') || document.querySelector('.bx-product .bx-section');
    if (!use || !use.parentNode) { return 0; }
    use.parentNode.insertBefore(build(kind), use.nextSibling);
    return 1;
  }

  function boot() {
    window.__EVERCUP_SCENE_DETAIL__ = 1;
    place();
    if (typeof MutationObserver !== 'function') { return; }
    var tries = 0;
    var mo = new MutationObserver(function () {
      if (tries++ > 20) { mo.disconnect(); return; }
      if (!document.getElementById('scene-in-use')) {
        try { place(); } catch (e) {}
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); }, 10000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
