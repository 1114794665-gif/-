/* 2026-11-25 酒吧配件首屏图：换成"我们有货的开瓶器 + 酒塞"围成的圆环图
   为什么用脚本：首屏是 React 整块重画的，静态 HTML 里没有这个 img，
   直接改文件会被渲染覆盖。这里只在 /bar-accessories/ 上把图片地址换掉，幂等。 */
(function () {
  var EN = '/img/bar-accessories-ring-20261125/opener-stopper-ring-1200.png';
  var ZH = EN;
  var done = false;

  function isBar() {
    var p = location.pathname.replace(/\/+$/, '/');
    return p === '/bar-accessories/' || p === '/zh/bar-accessories/';
  }

  function apply() {
    if (!isBar() || done) return;
    var img = document.querySelector('.bx-category-figure img');
    if (!img) return;
    if (img.getAttribute('src') !== EN) {
      img.setAttribute('src', EN);
      img.removeAttribute('srcset');
    }
    img.setAttribute('width', '1200');
    img.setAttribute('height', '1200');
    done = true;
  }

  function boot() {
    done = false;
    apply();
    [0, 120, 400, 900, 1600, 2600, 4000].forEach(function (ms) { setTimeout(apply, ms); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
  document.addEventListener('boom:client-ready', boot);
  window.addEventListener('popstate', boot);
})();
