// 文章页目录高亮（2026-10-29）
// 只做一件事：滚动到哪一节，目录里对应那条变色。没有目录就什么都不做。
(function () {
  var toc = document.querySelector('.tn-toc');
  if (!toc) return;
  var links = [].slice.call(toc.querySelectorAll('a[href^="#"]'));
  if (!links.length) return;

  var pairs = links.map(function (a) {
    return { a: a, el: document.getElementById(a.getAttribute('href').slice(1)) };
  }).filter(function (p) { return p.el; });
  if (!pairs.length) return;

  var active = null;
  function update() {
    var line = 130; // 吸顶导航下沿
    var found = null;
    for (var i = 0; i < pairs.length; i++) {
      if (pairs[i].el.getBoundingClientRect().top - line <= 0) found = pairs[i];
    }
    // 还没滚到第一节时，高亮第一节
    if (!found) found = pairs[0];
    if (found === active) return;
    active = found;
    links.forEach(function (a) { a.classList.remove('is-active'); });
    found.a.classList.add('is-active');
  }

  var queued = false;
  window.addEventListener('scroll', function () {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(function () { queued = false; update(); });
  }, { passive: true });
  update();
})();
