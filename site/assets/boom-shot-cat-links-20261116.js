/* BOOM — link block for the shot glass category page (2026-11-16)
 *
 * The category page is client-rendered, so a static block inside #root is wiped on
 * hydration. This appends the block after render and re-attaches it if the page
 * re-renders. Same pattern as boom-rfq-20261114.js.
 */
(function () {
  'use strict';
  if (window.__boomShotCatLinks) return;
  window.__boomShotCatLinks = 1;

  var ZH = /^\/zh(\/|$)/.test(location.pathname);
  var PAIRS = ZH
    ? [
        { num: '01 / 制造', href: '/zh/custom-shot-glass-oem-odm/', title: '塑料烈酒杯 OEM / ODM', text: '按图代工或共同开发：结构评审、开模、T1 样品和中间的确认节点。', go: '查看 OEM / ODM 页 →' }
      ]
    : [
        { num: '01 / MANUFACTURING', href: '/custom-shot-glass-oem-odm/', title: 'Develop Custom Shot Glasses for Spirits Brands & Tasting Programs', text: 'OEM to your drawing or ODM with development support: DFM review, tooling, T1 samples and the approval gates in between.', go: 'See the OEM & ODM page →' }
      ];

  var CSS = [
    '.bsc{max-width:1240px;margin:0 auto;padding:8px 32px 64px}',
    '.bsc__k{font-size:11px;letter-spacing:.17em;font-weight:800;text-transform:uppercase;color:#96704d;margin:0 0 14px}',
    '.bsc h2{font-family:Manrope,Arial,sans-serif;font-size:clamp(24px,2.4vw,32px);line-height:1.16;letter-spacing:-.035em;margin:0 0 12px;color:#17362f;font-weight:700}',
    '.bsc__lead{font-size:15px;color:#5f7169;max-width:660px;margin:0 0 26px;line-height:1.7}',
    '.bsc__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:18px}',
    '.bsc__card{display:block;background:#fff;border:1px solid #dbe2d9;border-radius:6px;padding:24px;text-decoration:none;color:#17362f;transition:border-color .2s,transform .2s}',
    '.bsc__card:hover{border-color:#7f9c8a;transform:translateY(-2px)}',
    '.bsc__num{font-family:ui-monospace,monospace;font-size:10px;letter-spacing:.14em;color:#a85f3c;font-weight:800;display:block;margin-bottom:12px}',
    '.bsc__card h3{font-family:Manrope,Arial,sans-serif;font-size:19px;margin:0 0 8px;letter-spacing:-.02em;color:#17362f;line-height:1.3}',
    '.bsc__card p{font-size:13px;color:#5f7169;margin:0 0 14px;line-height:1.65}',
    '.bsc__go{font-size:12px;font-weight:800;color:#2c5c46}',
    '.bsc__note{grid-column:1/-1;font-size:12.5px;color:#5f7169;margin:6px 0 0;line-height:1.7}',
    '.bsc__note a{color:#2c5c46;font-weight:700;text-decoration:none;border-bottom:1px solid #b9cfc0}',
    '@media(max-width:767px){.bsc{padding:4px 18px 44px}.bsc__grid{grid-template-columns:1fr}}'
  ].join('');

  function styleOnce() {
    if (document.getElementById('bsc-style')) return;
    var s = document.createElement('style');
    s.id = 'bsc-style';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function build() {
    var sec = document.createElement('section');
    sec.className = 'bsc';
    sec.id = 'shot-glass-start';
    sec.setAttribute('aria-label', ZH ? '塑料烈酒杯与代工入口' : 'Plastic shot glasses and OEM routes');

    var note = ZH
      ? '硅胶烈酒杯归在<a href="/zh/custom-silicone-cups/">硅胶杯</a>，上面的发光烈酒杯归在<a href="/zh/led-light-up-cups/">LED 发光杯</a>，两者都不是注塑塑料件。'
      : 'Silicone shot glasses live in <a href="/custom-silicone-cups/">silicone drinkware</a>, and the light-up shots above belong to <a href="/led-light-up-cups/">LED drinkware</a>. Neither is a plastic injection project.';

    sec.innerHTML =
      '<p class="bsc__k">' + (ZH ? '塑料烈酒杯' : 'PLASTIC SHOT GLASSES') + '</p>' +
      '<h2>' + (ZH ? '烈酒杯项目从制造页开始' : 'Start a shot glass project from the manufacturing brief') + '</h2>' +
      '<p class="bsc__lead">' + (ZH
        ? '上面两款是 LED 发光烈酒杯。要做注塑塑料烈酒杯，从制造页进来：结构评审、开模、T1 样品逐个确认。'
        : 'The two models above are LED light-up shots. For an injection-molded plastic shot glass, start from the manufacturing brief: DFM review, tooling, T1 samples and the approval gates in between.') + '</p>' +
      '<div class="bsc__grid">' +
      PAIRS.map(function (c) {
        return '<a class="bsc__card" href="' + c.href + '">' +
          '<span class="bsc__num">' + c.num + '</span>' +
          '<h3>' + c.title + '</h3>' +
          '<p>' + c.text + '</p>' +
          '<span class="bsc__go">' + c.go + '</span></a>';
      }).join('') +
      '<p class="bsc__note">' + note + '</p>' +
      '</div>';
    return sec;
  }

  function mount() {
    if (document.getElementById('shot-glass-start')) return;
    var main = document.querySelector('main');
    if (!main) return;
    styleOnce();
    var el = build();
    var anchor = main.querySelector('section.ec-internal-links') || main.querySelector('.bx-model-grid');
    if (anchor && anchor.closest('section') && anchor.closest('section').nextSibling) {
      anchor.closest('section').parentNode.insertBefore(el, anchor.closest('section').nextSibling);
    } else if (main.firstElementChild && main.firstElementChild.nextSibling) {
      main.insertBefore(el, main.firstElementChild.nextSibling);
    } else {
      main.appendChild(el);
    }
  }

  function boot() {
    if (!/^\/(zh\/)?custom-shot-glasses\/?$/.test(location.pathname)) return;
    mount();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  var mo = new MutationObserver(function () { boot(); });
  mo.observe(document.documentElement, { childList: true, subtree: true });
  [600, 1500, 3000, 5000].forEach(function (t) { setTimeout(boot, t); });
})();
