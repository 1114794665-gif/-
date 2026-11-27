/* BOOM — mobile navigation for the static shot-glass pages (2026-11-16)
   The site header is React-rendered elsewhere; these two pages are plain HTML,
   so the <details> desktop nav is cloned into a drawer and the Menu button is wired here.
   No framework, no build step. */
(function () {
  'use strict';
  if (window.__boomSgShell) return;
  window.__boomSgShell = 1;

  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  onReady(function () {
    var header = document.querySelector('header');
    var nav = header && header.querySelector('nav.of-nav');
    var menuBtn = header && header.querySelector('button[aria-label="Menu"]');
    if (!header || !nav || !menuBtn) return;

    var drawer = document.createElement('div');
    drawer.className = 'sg-drawer';
    drawer.setAttribute('hidden', '');
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-label', 'Site menu');

    var bar = document.createElement('div');
    bar.className = 'sg-drawer__bar';

    var brand = document.createElement('span');
    brand.className = 'sg-drawer__brand';
    brand.textContent = 'BOOM Drinkware';

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'sg-drawer__close';
    close.setAttribute('aria-label', 'Close menu');
    close.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';

    bar.appendChild(brand);
    bar.appendChild(close);

    var body = document.createElement('div');
    body.className = 'sg-drawer__body';

    /* clone the desktop nav: each <details> becomes a permanent group */
    var groups = nav.querySelectorAll('details');
    if (groups.length) {
      for (var i = 0; i < groups.length; i++) {
        var src = groups[i];
        var block = document.createElement('div');
        block.className = 'sg-drawer__group';
        var heading = src.querySelector('summary');
        var label = heading ? (heading.textContent || '').replace(/\s+/g, ' ').trim() : '';
        var h = document.createElement('p');
        h.className = 'sg-drawer__label';
        h.textContent = label;
        block.appendChild(h);
        var list = document.createElement('div');
        list.className = 'sg-drawer__links';
        var links = src.querySelectorAll('div a');
        for (var j = 0; j < links.length; j++) {
          var a = document.createElement('a');
          a.href = links[j].getAttribute('href');
          a.textContent = (links[j].textContent || '').trim();
          list.appendChild(a);
        }
        block.appendChild(list);
        body.appendChild(block);
      }
    }

    /* plain top-level links (New, OEM / ODM …) */
    var flat = nav.querySelectorAll(':scope > a');
    if (flat.length) {
      var flatWrap = document.createElement('div');
      flatWrap.className = 'sg-drawer__flat';
      for (var k = 0; k < flat.length; k++) {
        var fa = document.createElement('a');
        fa.href = flat[k].getAttribute('href');
        fa.textContent = (flat[k].textContent || '').trim();
        flatWrap.appendChild(fa);
      }
      body.appendChild(flatWrap);
    }

    var cta = document.createElement('a');
    cta.className = 'sg-drawer__cta';
    cta.href = '#rfq';
    cta.textContent = 'Send a project enquiry';
    body.appendChild(cta);

    drawer.appendChild(bar);
    drawer.appendChild(body);
    document.body.appendChild(drawer);

    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      drawer.removeAttribute('hidden');
      document.documentElement.classList.add('sg-drawer-open');
      close.focus();
    }
    function shut() {
      drawer.setAttribute('hidden', '');
      document.documentElement.classList.remove('sg-drawer-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function isOpen() { return !drawer.hasAttribute('hidden'); }

    menuBtn.addEventListener('click', function (e) {
      e.preventDefault();
      if (isOpen()) shut(); else open();
    });
    close.addEventListener('click', shut);
    drawer.addEventListener('click', function (e) {
      if (e.target === drawer) shut();
      var a = e.target.closest ? e.target.closest('a') : null;
      if (a) shut();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) shut();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1024 && isOpen()) shut();
    });
  });
})();
