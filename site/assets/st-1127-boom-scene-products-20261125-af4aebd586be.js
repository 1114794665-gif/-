(function () {
  'use strict';
  if (new URLSearchParams(location.search).has('cms-edit')) return;
  const slugs = new Set(['backyard-bbq-cups','beach-party-cups','pool-party-cups','yacht-party-cups','open-air-nightclub','tailgate-party-cups','sports-team-cups','camping-drinkware','tasting-events-drinkware','wedding-cups','bachelorette-party-cups','birthday-party-cups','holiday-party-cups','graduation-party-cups','family-event-cups']);
  const payloads = new Map(); let pending = false, restoring = false;
  const route = () => location.pathname.replace(/\/?$/, '/');
  const isScene = path => slugs.has(path.replace(/^\/zh\//, '/').split('/').filter(Boolean)[0]);
  function enhance(section) {
    if (section.dataset.sceneEnhanced) return;
    section.dataset.sceneEnhanced = 'true';
    const zh = route().startsWith('/zh/'), state = { group: 'all', term: '', limit: 10 };
    const controls = section.querySelector('.boom-scene-controls'), status = section.querySelector('.boom-scene-status'), more = section.querySelector('.boom-scene-more'), empty = section.querySelector('.boom-scene-empty');
    const cards = () => [...section.querySelectorAll('.boom-scene-card')];
    function render() {
      const all = cards(), matches = all.filter(card => (state.group === 'all' || card.dataset.sceneGroup === state.group) && (!state.term || (card.dataset.search || card.textContent).toLowerCase().includes(state.term)));
      const visible = new Set(matches.slice(0, state.limit));
      for (const card of all) card.hidden = !visible.has(card);
      for (const button of section.querySelectorAll('[data-scene-filter]')) button.setAttribute('aria-pressed', String(button.dataset.sceneFilter === state.group));
      status.textContent = zh ? '显示 '+visible.size+' / '+matches.length+' 款产品' : 'Showing '+visible.size+' of '+matches.length+' products';
      more.hidden = matches.length <= state.limit; empty.hidden = matches.length !== 0;
    }
    controls.hidden = false;
    section.addEventListener('click', event => {
      const button = event.target.closest('[data-scene-filter]');
      if (button) { state.group = button.dataset.sceneFilter; state.limit = 10; render(); }
    });
    section.querySelector('input[type="search"]').addEventListener('input', event => { state.term = event.target.value.trim().toLowerCase(); state.limit = 10; render(); });
    more.addEventListener('click', () => { state.limit += 10; render(); });
    render();
  }
  function removeOldGrids(main, own) {
    const targets = new Set();
    for (const card of main.querySelectorAll('.ec-library-card')) {
      if (own.contains(card)) continue;
      const grid = card.closest('.bx-model-grid,.ec-library-grid');
      if (!grid) continue;
      const section = grid.closest('section');
      const target = section && !section.querySelector('h1') && !section.contains(own) ? section : grid;
      if (!target.contains(own)) targets.add(target);
    }
    for (const node of targets) node.remove();
  }
  async function update() {
    const path = route();
    if (!isScene(path)) { document.documentElement.removeAttribute('data-boom-scene'); return; }
    document.documentElement.setAttribute('data-boom-scene', 'true');
    let section = document.querySelector('#boom-scene-products[data-scene-route="'+path+'"]');
    const main = document.querySelector('main'); if (!main) return;
    if (!section) {
      if (restoring) return;
      restoring = true;
      try {
        if (!payloads.has(path)) payloads.set(path, fetch('/data/scene-product-match-20261125'+path+'index.json', {cache:'no-cache'}).then(r => {if(!r.ok)throw Error('catalog');return r.json();}).catch(e=>{payloads.delete(path);throw e;}));
        const data = await payloads.get(path); if (route() !== path) return;
        const box = document.createElement('div'); box.innerHTML = data.html; section = box.firstElementChild;
        const old = main.querySelector('.bx-model-grid,.ec-library-grid');
        const anchor = old?.closest('section') || main.querySelector('#buyer-decision-rewrite');
        if (anchor && !anchor.querySelector('h1')) anchor.before(section); else main.append(section);
      } catch (_) { return; } finally { restoring = false; }
    }
    enhance(section); removeOldGrids(main, section);
  }
  function schedule() { if (!pending) { pending = true; setTimeout(() => { pending = false; update(); }, 100); } }
  new MutationObserver(schedule).observe(document.documentElement, {childList:true,subtree:true});
  window.addEventListener('popstate',schedule); window.addEventListener('boom:client-ready',schedule);
  update();
})();
