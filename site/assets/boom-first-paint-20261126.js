/* Keep the first visible frame stable while the client replaces static markup. */
(function () {
  'use strict';
  if (window.__boomStablePaint) return;
  var root = document.documentElement;
  var started = performance.now();
  var state = window.__boomStablePaint = { started: started, readyAt: 0, shownAt: 0, reason: '' };
  var ready = root.getAttribute('data-boom-client') === 'ready';
  var readyAt = ready ? performance.now() : 0;
  var stable = 0, previous = '', finished = false, interval;
  var minimumSettle = /^\/(?:zh\/)?products\//.test(location.pathname) ? 500 : 150;
  var style = document.createElement('style');
  style.id = 'boom-first-paint-style';
  style.textContent = 'html.bp-pending main{opacity:0!important;pointer-events:none}' +
    'main{transition:opacity .12s ease-out}html.bp-pending #boom-bp-bar{display:block}' +
    '#boom-bp-bar{display:none;position:fixed;top:0;left:0;right:0;height:2px;z-index:9999;overflow:hidden;pointer-events:none}' +
    '#boom-bp-bar i{position:absolute;top:0;bottom:0;left:0;width:38%;background:linear-gradient(90deg,transparent,#a9502f,transparent);animation:boomBpBar 1s linear infinite}' +
    '@keyframes boomBpBar{from{transform:translateX(-100%)}to{transform:translateX(280%)}}' +
    '@media(prefers-reduced-motion:reduce){main{transition:none}#boom-bp-bar i{animation:none;width:100%}}';
  (document.head || root).appendChild(style);
  root.classList.add('bp-pending');
  var bar = document.createElement('div');bar.id = 'boom-bp-bar';bar.setAttribute('aria-hidden', 'true');bar.innerHTML = '<i></i>';
  function mount() { if (document.body && !bar.parentNode && !finished) document.body.appendChild(bar); }
  mount();document.addEventListener('DOMContentLoaded', mount, { once: true });

  // Start the two fonts used above the fold before late style injection discovers them.
  ['/assets/fonts/manrope-latin-79860.woff2', '/assets/fonts/ibm-plex-mono-latin-52086.woff2'].forEach(function (href) {
    if (document.querySelector('link[rel="preload"][href="' + href + '"]')) return;
    var link = document.createElement('link');link.rel = 'preload';link.as = 'font';link.type = 'font/woff2';link.crossOrigin = 'anonymous';link.href = href;
    (document.head || root).appendChild(link);
  });

  function clientReady(event) {
    if (!ready) { ready = true;readyAt = performance.now();state.readyAt = readyAt;stable = 0;previous = ''; }
    // The bundle dispatches on window. Older content modules listen on document.
    // Forward once without bubbling, so window listeners are not called twice.
    if (event && event.target === window) document.dispatchEvent(new Event('boom:client-ready'));
  }
  window.addEventListener('boom:client-ready', clientReady);
  document.addEventListener('boom:client-ready', function () { clientReady(); });
  function show(reason) {
    if (finished) return;finished = true;clearInterval(interval);
    root.classList.remove('bp-pending');state.shownAt = performance.now();state.reason = reason;
    setTimeout(function () { if (bar.parentNode) bar.remove(); }, 180);
  }
  function signature() {
    var main = document.querySelector('main'),h = main && main.querySelector('h1'),header = document.querySelector('header');
    var rect = h && h.getBoundingClientRect();
    return [main && main.firstElementChild && main.firstElementChild.className,main ? main.getElementsByTagName('*').length : 0,
      header ? Math.round(header.getBoundingClientRect().height) : 0,rect ? Math.round(rect.top) : 0,rect ? Math.round(rect.height) : 0,h ? h.textContent : ''].join('|');
  }
  function tick() {
    var now = performance.now();
    if (root.getAttribute('data-boom-client') === 'ready') clientReady();
    var hasClient = !!document.querySelector('script[type="module"][src]');
    var parsed = document.readyState !== 'loading';
    // A stable static page does not prove that an outstanding module is ready.
    if (!parsed || (hasClient && !ready)) { stable = 0;previous = '';if (now - started > 12000) show('static-fallback');return; }
    if (!readyAt) { readyAt = now;state.readyAt = now; }
    var authority = window.__boomCopyAuthority;
    var expected = authority && authority.fields;
    var heading = document.querySelector('main h1');
    var copyPending = authority && (!authority.ready || (expected && (!heading || heading.textContent !== expected.Final_H1 || document.title !== expected.Final_SEO_Title)));
    if (copyPending && now - readyAt < 3500) { stable = 0;previous = '';return; }
    var next = signature();stable = next === previous ? stable + 1 : 0;previous = next;
    var fontsLoading = document.fonts && document.fonts.status === 'loading';
    var stylesLoading = Array.prototype.some.call(document.querySelectorAll('link[rel="stylesheet"]'), function (link) {
      return !link.disabled && !link.sheet && (!link.media || matchMedia(link.media).matches);
    });
    if (now - readyAt >= minimumSettle && stable >= 3 && ((!fontsLoading && !stylesLoading) || now - readyAt > 2000)) show(hasClient ? 'client-stable' : 'static-stable');
    else if (now - readyAt > 3500) show('client-fallback');
  }
  interval = setInterval(tick, 50);
  window.addEventListener('error', function (event) {
    if (event.target && event.target.tagName === 'SCRIPT' && event.target.type === 'module') show('module-error-fallback');
  }, true);
})();
