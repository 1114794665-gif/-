/* BOOM five-page update - 2026-11-23. Path-guarded; no effect on other pages. */
(function () {
  'use strict';
  if (window.__boomFivePage20261123) return;
  window.__boomFivePage20261123 = 1;

  var PATH = location.pathname;
  var TITLES = {
    '/custom-ice-buckets/': 'Custom Ice Buckets Wholesale | BOOM Drinkware',
    '/custom-shot-glasses/': 'Custom Shot Glasses Bulk | BOOM Drinkware',
    '/led-light-up-cups/': 'Custom LED Light Up Cups Wholesale | BOOM Drinkware'
  };
  var GENERIC = ["Can you build the collection around our brand idea?", "How can our logo and artwork make the collection our own?", "Where should we start?"];
  var SHOT_FAQ = [{"q":"What capacity should I choose for custom shot glasses?","a":"Start with the pour you serve: 1.5 oz suits tastings and branded giveaways, while 2 oz works for a standard shot. For collapsible sets, confirm the filled and folded size before artwork is placed."},{"q":"Can I print on silicone and LED shot glasses?","a":"Yes, but the method follows the material. Silicone styles are reviewed for pad or screen printing; LED acrylic styles are checked with the light on and off. Send your artwork and we will confirm the usable position on the selected model."},{"q":"What should I send for a shot glass quote?","a":"Send the model shortlist, quantity, artwork, preferred colours, packaging and destination. If you are still choosing, tell us the drink, venue and event date and we will narrow the options."}];
  var LED_FAQ = [{"q":"Which LED shot or cup style fits my event?","a":"Start with the drink and the setting: shot glasses for a toast, rocks or wine glasses for table service, and taller cups for outdoor events. Then compare the listed models by capacity, light effect and power arrangement."},{"q":"Can the logo be checked with the light on and off?","a":"Yes. Review the artwork position with the light on and off on the selected model. Brightness, colour and the print area can change how a logo reads, so we confirm the placement before the sample is approved."},{"q":"What should I send for an LED cup quote?","a":"Send the model shortlist, quantity, artwork, preferred light effect, activation method, destination and required arrival date. Battery and cleaning details are confirmed for the exact model rather than assumed across the range."}];
  var FAQ_META = {
    '/custom-shot-glasses/': {
      h2: 'Start With the Drink. Build the Brand Around It.',
      p: 'Bring your logo and campaign ideas into the product selection early. We help connect the cup, material, serving size and decoration to the experience you want to deliver.'
    },
    '/led-light-up-cups/': {
      h2: 'Build Your Brand Into the Night',
      p: 'Contact us and we will help you organise the lighting, colours and atmosphere you have in mind. We help explore the selected LED effect with your logo and artwork, with the light on and off.'
    }
  };
  var MODELS = [{"sku":"GJZD-011","label":"COLLAPSIBLE SET","name":"BOOM Drinkware XLite Collapsible Shot Set","facts":"silicone + nylon · collapsible set","route":"/products/collapsible-mug/#model-GJZD-011","image":"/img/v88-20261023/gjzd-011-32cc88b089.webp"},{"sku":"LJB-001","label":"LJB-001","name":"BOOM Drinkware Silicone 1.5 oz Silishot - Color & Custom Print Options","facts":"silicone · 1.5 oz","route":"/products/silicone-1-5oz-ljb001/","image":"/img/v88-20261023/ljb-001-e9310d6e9d.webp"},{"sku":"LJB-006","label":"LJB-001 / GLOW","name":"BOOM Drinkware Silicone 1.5 oz Glow In The Dark Silishot Shot Glass","facts":"silicone · 1.5 oz","route":"/products/silicone-1-5oz-ljb001/#model-LJB-006","image":"/img/v88-20261023/ljb-006-2d9f4746c4.webp"},{"sku":"LJB-010","label":"LJB-001 / CLEAR","name":"BOOM Drinkware Silicone 1.5 oz Crystal Clear Shot Glass","facts":"silicone · 1.5 oz","route":"/products/silicone-1-5oz-ljb001/#model-LJB-010","image":"/img/v88-20261023/ljb-010-104756c340.webp"},{"sku":"LJB-002","label":"LJB-002","name":"BOOM Drinkware Silicone 2 oz Shumbler","facts":"silicone · 2 oz","route":"/products/silicone-2oz-shumbler-shot-ljb002/","image":"/img/v88-20261023/ljb-002-d60fbac562.webp"},{"sku":"LJB-008","label":"LJB-002 / GLOW","name":"BOOM Drinkware Silicone 2 oz Glow Green Shumbler Shot Glass","facts":"silicone · 2 oz","route":"/products/silicone-2oz-shumbler-shot-ljb002/#craft-LJB-008","image":"/img/v88-20261023/ljb-008-849b7d02a5.webp"},{"sku":"FGB-016","label":"FGB-016","name":"BOOM Drinkware Light Up Slow Change LED Shot Glass","facts":"acrylic · 2 oz","route":"/products/light-up-slow-change-led-shot/","image":"/img/v88-20261023/fgb-016-9915464962.webp"},{"sku":"JBPJ-101","label":"JBPJ-101","name":"BOOM Drinkware Purple LED Light Up Shot Glass Beaded Necklace","facts":"acrylic · 1.5 oz","route":"/products/purple-led-light-up-shot-glass/","image":"/img/v88-20261023/jbpj-101-6b11d474d5.webp"}];
  var CSS = ".boom-shot-guide{max-width:1240px;margin:0 auto;padding:12px 32px 64px}.boom-shot-guide h2{font-family:Manrope,Arial,sans-serif;font-size:clamp(24px,2.4vw,32px);line-height:1.16;letter-spacing:-.035em;margin:0 0 12px;color:#17362f;font-weight:700}.boom-shot-guide__lead{font-size:15px;color:#5f7169;max-width:680px;line-height:1.7;margin:0 0 24px}.boom-shot-guide__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.boom-shot-guide__card{background:#fff;border:1px solid #dbe2d9;border-radius:6px;padding:22px}.boom-shot-guide__num{font-family:ui-monospace,monospace;font-size:10px;letter-spacing:.14em;color:#a85f3c;font-weight:800;display:block;margin-bottom:10px}.boom-shot-guide__card h3{font-family:Manrope,Arial,sans-serif;font-size:19px;margin:0 0 8px;color:#17362f;line-height:1.3}.boom-shot-guide__card p{font-size:13px;color:#5f7169;line-height:1.7;margin:0}@media(max-width:767px){.boom-shot-guide{padding:4px 18px 44px}.boom-shot-guide__grid{grid-template-columns:1fr}}";
  var HOME_LEAD = "Custom Ice Buckets, Shot Glasses and LED Light Up Cups — OEM and ODM silicone, Tritan and plastic drinkware for brands, businesses and promotional projects.";
  var METAL_LINE = "Metal parts are sourced externally; they are not injection-molded in our factory.";
  var METAL_PATHS = [
    '/products/champagne-stopper/',
    '/products/champagne-stopper-with-plating-painting/',
    '/products/stainless-steel-credit-card-bottle-opener/'
  ];

  function cssOnce() {
    if (document.getElementById('boom-shot-guide-style')) return;
    var st = document.createElement('style');
    st.id = 'boom-shot-guide-style';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function setTitle() {
    var t = TITLES[PATH];
    if (!t) return;
    if (document.title !== t) document.title = t;
    ['og:title', 'twitter:title'].forEach(function (key) {
      var attr = key.indexOf('og:') === 0 ? 'property' : 'name';
      var n = document.head.querySelector('meta[' + attr + '="' + key + '"]');
      if (!n) { n = document.createElement('meta'); n.setAttribute(attr, key); document.head.appendChild(n); }
      if (n.content !== t) n.content = t;
    });
  }

  function home() {
    if (PATH !== '/') return;
    var ledCard = document.querySelector('.of-products a[href="/led-light-up-cups/"]');
    if (ledCard && !document.querySelector('[data-boom-fivepage="home-shot-card"]')) {
      var c = ledCard.cloneNode(true);
      c.setAttribute('href', '/custom-shot-glasses/');
      c.setAttribute('data-boom-fivepage', 'home-shot-card');
      var img = c.querySelector('img');
      if (img) {
        img.setAttribute('src', '/img/v88-20261023/fgb-016-9915464962.webp');
        img.removeAttribute('srcset');
        img.setAttribute('width', '1200');
        img.setAttribute('height', '1200');
        img.setAttribute('alt', 'Custom Shot Glasses');
        img.style.aspectRatio = '4/3';
        img.style.objectFit = 'cover';
      }
      var tag = c.querySelector('.of-product-tag'); if (tag) tag.textContent = '05 / SHOT';
      var h3 = c.querySelector('h3'); if (h3) h3.textContent = 'Shot Glasses ↗';
      var small = c.querySelector('small'); if (small) small.textContent = 'Silicone and LED serving styles';
      ledCard.parentNode.insertBefore(c, ledCard.nextSibling);
    }
    var iceTag = document.querySelector('.of-products a[href="/custom-ice-buckets/"] .of-product-tag');
    if (iceTag && iceTag.textContent !== '06 / ICE') iceTag.textContent = '06 / ICE';
    var accTag = document.querySelector('.of-products a[href="/bar-accessories/"] .of-product-tag');
    if (accTag && accTag.textContent !== '07 / ACCESSORIES') accTag.textContent = '07 / ACCESSORIES';
  }

  function card(m) {
    return '<article class="ec-library-card" data-model="' + m.label + '">' +
      '<a class="ec-library-image-link" href="' + m.route + '"><img src="' + m.image +
      '" width="600" height="600" loading="lazy" alt="' + m.name + ' — ' + m.sku +
      '" decoding="async"></a><div class="ec-library-card-copy"><p class="ec-library-model">' +
      m.label + '</p><h3><a href="' + m.route + '">' + m.name + '</a></h3><p class="ec-library-facts">' +
      m.facts + '</p><a class="ec-library-link" href="' + m.route +
      '">View Model &amp; Customization</a></div></article>';
  }

  function shotList() {
    if (PATH !== '/custom-shot-glasses/') return;
    cssOnce();
    var host = document.querySelector('.bx-model-grid');
    if (host && !document.getElementById('shot-glass-style-list')) {
      host.style.setProperty('display', 'none', 'important');
      var sec = document.createElement('section');
      sec.id = 'shot-glass-style-list';
      sec.className = 'container-site ec-library-catalog shot-style-list';
      sec.setAttribute('data-boom-fivepage', 'shot-list');
      var silicone = MODELS.slice(0, 6).map(card).join('');
      var led = MODELS.slice(6).map(card).join('');
      sec.innerHTML = '<div class="buyer-comparison"><div class="buyer-comparison-heading"><div>' +
        '<h2>A shortlist before your quote</h2><p>Choose from the shot glass models already in our range, ' +
        'then compare capacity, form and print position.</p></div></div></div>' +
        '<div class="ec-library-group"><div class="ec-library-group-heading"><h2>Silicone &amp; collapsible shot glasses</h2>' +
        '<span>6 models</span></div><div class="ec-library-grid">' + silicone + '</div></div>' +
        '<div class="ec-library-group"><div class="ec-library-group-heading"><h2>LED acrylic shot glasses</h2>' +
        '<span>2 models</span></div><div class="ec-library-grid">' + led + '</div></div>';
      host.insertAdjacentElement('afterend', sec);
      var guide = document.createElement('section');
      guide.id = 'shot-glass-how-to-choose';
      guide.className = 'boom-shot-guide';
      guide.setAttribute('data-boom-fivepage', 'shot-guide');
      guide.innerHTML = '<h2>How to choose custom shot glasses</h2>' +
        '<p class="boom-shot-guide__lead">Three checks before you approve a model and artwork.</p>' +
        '<div class="boom-shot-guide__grid">' +
        '<article class="boom-shot-guide__card"><span class="boom-shot-guide__num">01 / CAPACITY</span>' +
        '<h3>Start with the pour</h3><p>Choose 1.5 oz for tastings and giveaways, or 2 oz for a standard shot. ' +
        'Collapsible sets are reviewed as a set, with the filled size confirmed before artwork is placed.</p></article>' +
        '<article class="boom-shot-guide__card"><span class="boom-shot-guide__num">02 / CUP FORM</span>' +
        '<h3>Match the serve</h3><p>Silicone styles suit flexible, unbreakable service; LED acrylic styles suit a lit bar ' +
        'or nightclub. Tell us where the shots will be served and we will shortlist the listed models.</p></article>' +
        '<article class="boom-shot-guide__card"><span class="boom-shot-guide__num">03 / PRINT POSITION</span>' +
        '<h3>Check the artwork area</h3><p>Confirm where the logo sits on the cup, then review the decoration method ' +
        'against the selected material. LED styles are checked with the light on and off before the sample is approved.</p></article>' +
        '</div>';
      sec.insertAdjacentElement('afterend', guide);
    }
  }

  function faqHtml(items) {
    return items.map(function (x) {
      return '<details><summary>' + x.q + '</summary><p>' + x.a + '</p></details>';
    }).join('');
  }

  function faqs() {
    var items = PATH === '/custom-shot-glasses/' ? SHOT_FAQ :
      (PATH === '/led-light-up-cups/' ? LED_FAQ : null);
    if (!items) return;
    var meta = FAQ_META[PATH];
    var box = document.querySelector('#buyer-decision-rewrite .boom-buyer-faq');
    if (!box) {
      var old = document.getElementById('buyer-decision-rewrite');
      if (old && old.parentNode) old.parentNode.removeChild(old);
      var sec = document.createElement('section');
      sec.id = 'buyer-decision-rewrite';
      sec.className = 'boom-buyer-brief';
      sec.setAttribute('data-boom-fivepage', 'faq');
      sec.innerHTML = '<h2>' + meta.h2 + '</h2><p>' + meta.p +
        '</p><div class="boom-buyer-faq">' + faqHtml(items) + '</div>';
      var main = document.querySelector('main') || document.body;
      main.appendChild(sec);
      box = sec.querySelector('.boom-buyer-faq');
    } else {
      var first = box.querySelector('summary');
      if (!first || first.textContent.trim() !== items[0].q) box.innerHTML = faqHtml(items);
    }
    document.querySelectorAll('script[type="application/ld+json"]').forEach(function (n) {
      try {
        var d = JSON.parse(n.textContent);
        if (!d || d['@type'] !== 'FAQPage' || !Array.isArray(d.mainEntity)) return;
        var changed = false;
        d.mainEntity.forEach(function (e, i) {
          var gi = GENERIC.indexOf(e && e.name);
          if (gi >= 0 && items[gi]) {
            d.mainEntity[i] = { '@type': 'Question', 'name': items[gi].q,
              'acceptedAnswer': { '@type': 'Answer', 'text': items[gi].a } };
            changed = true;
          }
        });
        if (changed) n.textContent = JSON.stringify(d);
      } catch (e) {}
    });
  }

  function metal() {
    if (METAL_PATHS.indexOf(PATH) < 0) return;
    var note = document.querySelector('.byf-sourcing-note');
    if (note && note.textContent.indexOf(METAL_LINE) < 0) {
      note.appendChild(document.createTextNode(' ' + METAL_LINE));
    }
  }

  function apply() {
    try { setTitle(); home(); shotList(); faqs(); metal(); } catch (e) {}
  }

  function boot() {
    apply();
    var pending = false;
    var mo = new MutationObserver(function () {
      if (pending) return;
      pending = true;
      setTimeout(function () { pending = false; apply(); }, 120);
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    [400, 1000, 2000, 4000, 8000].forEach(function (t) { setTimeout(apply, t); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
