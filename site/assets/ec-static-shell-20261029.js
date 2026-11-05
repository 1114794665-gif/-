// 静态工厂页壳层脚本（这些页面不加载 React 包，靠这个文件补齐交互）
// 1) 桌面端：details 下拉改成鼠标悬停展开
// 2) 移动端：汉堡按钮展开导航面板
// 3) 顶栏 Get a Quote 与底部 Quote 按钮统一跳询价页
(function () {
  var DESKTOP_HOVER = '(min-width: 1024px)';

  // 1) 悬停下拉
  document.querySelectorAll('.of-nav details').forEach(function (d) {
    var t;
    d.addEventListener('mouseenter', function () {
      if (!window.matchMedia(DESKTOP_HOVER).matches) return;
      clearTimeout(t);
      document.querySelectorAll('.of-nav details[open]').forEach(function (o) { if (o !== d) o.open = false; });
      d.open = true;
    });
    d.addEventListener('mouseleave', function () {
      if (!window.matchMedia(DESKTOP_HOVER).matches) return;
      t = setTimeout(function () { d.open = false; }, 140);
    });
    d.querySelector('summary').addEventListener('click', function (e) {
      if (window.matchMedia(DESKTOP_HOVER).matches) e.preventDefault();
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.of-nav')) document.querySelectorAll('.of-nav details[open]').forEach(function (o) { o.open = false; });
  });

  // 2) 移动端导航面板
  var btn = document.querySelector('[data-ec-menu]');
  var panel = document.querySelector('[data-ec-menu-panel]');
  if (btn && panel) {
    var close = function () {
      panel.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      document.documentElement.style.overflow = '';
    };
    btn.addEventListener('click', function () {
      var willOpen = panel.hidden;
      panel.hidden = !willOpen;
      btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      document.documentElement.style.overflow = willOpen ? 'hidden' : '';
    });
    panel.querySelectorAll('[data-ec-menu-close]').forEach(function (b) { b.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }
})();
