/* 2026-11-26 /products/ 的五个产品家族卡图：酒吧配件换成统一图集里的「配件圆环图」
   为什么用脚本：卡片是 React 整块重画的，图来自该分类第一个型号的实拍图，
   静态 HTML 里没有这段，直接改页面会被渲染覆盖。这里按卡片链接换图，幂等、可扩展。 */
(function () {
  var V = '20261126a';
  if (window.__boomFamilyTiles === V) return;
  window.__boomFamilyTiles = V;

  /* 键：去掉语言前缀后的分类路径；值：[主图, 620 宽小图] */
  var MAP = {
    '/bar-accessories/': [
      '/img/cat-tiles-20261125/accessories-1200.webp',
      '/img/cat-tiles-20261125/accessories-620.webp'
    ]
  };

  function swap() {
    var cards = document.querySelectorAll('.bx-family');
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var href = String(card.getAttribute('href') || '').replace(/^\/zh(?=\/)/, '');
      var v = MAP[href];
      if (!v) continue;
      var img = card.querySelector('.bx-family-image img');
      if (!img) continue;
      if (img.getAttribute('src') !== v[0]) {
        img.setAttribute('src', v[0]);
        img.removeAttribute('srcset');
        img.removeAttribute('sizes');
        img.setAttribute('width', '1200');
        img.setAttribute('height', '900');
        img.style.objectFit = 'contain';
      }
    }
  }

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(function () {
      pending = false;
      swap();
    });
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
  setTimeout(schedule, 600);
  setTimeout(schedule, 1600);
})();
