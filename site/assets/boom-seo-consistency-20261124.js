(async function(){
 'use strict';if(new URLSearchParams(location.search).has('cms-edit'))return;window.__boomCopyAuthority={ready:false,fields:null};const data=await fetch('/assets/boom-seo-consistency-20261124.json').then(r=>r.json());const d=data[location.pathname];window.__boomCopyAuthority={ready:true,fields:d?.fields||null};if(!d)return;
 const el=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n};
  function applyFunnelCopy() {
   const f=d.funnel;if(!f)return;const main=document.querySelector('main');if(!main)return;
   const h=main.querySelector('h1');if(h){
    const lead=h.nextElementSibling;
    if(lead?.tagName==='P'&&lead.textContent!==d.hero)lead.textContent=d.hero;
    if(lead?.tagName==='P')lead.setAttribute('data-boom-funnel-lead','20261126');
    const labels={'/bar-accessories/':'Custom Bar Accessories','/led-light-up-cups/':'Light Up Cups','/custom-silicone-cups/':'Custom Silicone Cups','/custom-shot-glasses/':'Custom Shot Glasses'};
    const label=labels[location.pathname];const crumb=h.parentElement.querySelector('nav[aria-label="Breadcrumb"]');
    if(label&&crumb){const textNodes=[...crumb.childNodes].filter(n=>n.nodeType===3);const tail=textNodes.pop();for(const n of textNodes)if(n.nodeValue)n.nodeValue='';if(tail&&tail.nodeValue!==' / '+label)tail.nodeValue=' / '+label;}
    if(label)for(const a of h.parentElement.querySelectorAll('a[href^="/contact/"]')){const target='/contact/#models='+encodeURIComponent(label);if(a.getAttribute('href')!==target)a.setAttribute('href',target);}
    const extra=h.parentElement.querySelector('.ledx-lead');if(extra&&extra!==lead)extra.remove();
   }
   // Replace only obsolete text modules, never a product-card or form container.
   const obsolete='#buying-guide,#buyer-brief,#led-accessory-customization,main .opt-core,main .opt-faq';
   for(const n of main.querySelectorAll(obsolete))if(!n.querySelector('.ec-library-card,form')&&!n.closest('#buyer-decision-rewrite[data-funnel-copy="20261126"]'))n.remove();
   const old=main.querySelector('#buyer-decision-rewrite');
   if(old&&old.dataset.funnelCopy!=='20261126'){
    if(!old.querySelector('.ec-library-card,form'))old.remove();
   }
   let modules=main.querySelector('#boom-keyword-funnel-20261126');
   if(!modules){
    modules=el('section');modules.id='boom-keyword-funnel-20261126';modules.className='ec-keyword-guide';
    modules.dataset.funnelCopy='20261126';modules.innerHTML=f.module_html;
    const buyer=main.querySelector('#buyer-decision-rewrite');if(buyer)buyer.before(modules);else main.append(modules);
   }
   let buyer=main.querySelector('#buyer-decision-rewrite');
   if(!buyer){buyer=el('section');buyer.id='buyer-decision-rewrite';buyer.className='ec-library-detail-section';buyer.dataset.fullCopy='20261126';buyer.dataset.funnelCopy='20261126';main.append(buyer);}
   if(buyer.dataset.funnelCopy==='20261126'&&!buyer.querySelector('#boom-research-faq'))buyer.innerHTML=f.faq_html;
   // Other scripts may add secondary FAQ blocks after the initial render.
   for(const q of main.querySelectorAll('details'))if(!q.closest('#boom-research-faq')&&!q.closest('.ec-library-card,form'))q.remove();
   for(const n of main.querySelectorAll('.pf-sec')){
    const text=n.textContent||'';
    if(location.pathname==='/custom-silicone-cups/'&&/Which decoration fits which cup/i.test(text)&&!n.querySelector('.ec-library-card,form'))n.remove();
   }
   for(const n of main.querySelectorAll('#project-resources a[href]')){
    if(location.pathname==='/custom-silicone-cups/'&&/\/(?:screen-printing|laser-engraving)\//.test(n.getAttribute('href'))){
     const uv=n.getAttribute('href').includes('screen-printing');if(uv){n.remove();continue;}n.setAttribute('href','/color-changing-ink/');n.textContent='Color-changing ink for silicone cups';
    }
   }
   if(!document.querySelector('#boom-funnel-copy-style')){
    const style=el('style');style.id='boom-funnel-copy-style';style.textContent='#boom-keyword-funnel-20261126{margin:36px auto}#boom-keyword-funnel-20261126 .ec-keyword-answer{margin:26px 0}#boom-keyword-funnel-20261126 h2{font-size:clamp(23px,2.2vw,30px);line-height:1.3;margin:0 0 12px}#boom-keyword-funnel-20261126 p{line-height:1.75;max-width:950px}#boom-keyword-funnel-20261126 .ec-keyword-links{display:flex;flex-wrap:wrap;gap:12px 22px;margin:24px 0}#boom-keyword-funnel-20261126 table{width:100%;border-collapse:collapse}#boom-keyword-funnel-20261126 th,#boom-keyword-funnel-20261126 td{padding:12px;text-align:left;border-bottom:1px solid #d6dfd5}#boom-keyword-funnel-20261126 .ec-keyword-table-wrap{overflow-x:auto}#buyer-decision-rewrite[data-funnel-copy="20261126"]{max-width:1200px;margin:32px auto;padding:0 24px;box-sizing:border-box}#buyer-decision-rewrite[data-funnel-copy="20261126"] #boom-research-faq{padding:0;margin:0}#buyer-decision-rewrite[data-funnel-copy="20261126"] .boom-funnel-cta{display:inline-block;max-width:100%;box-sizing:border-box;white-space:normal;line-height:1.5;margin:24px 0;padding:14px 22px;border-radius:8px;background:#173d35;color:white;text-decoration:none;font-weight:600}@media(max-width:600px){#boom-keyword-funnel-20261126 .container-site{padding-left:20px;padding-right:20px}}';document.head.append(style);
   }
   // Keep category metadata in the existing authoritative schema graph.
   if(Array.isArray(window.__BOOM_SCHEMA)){
    for(const o of window.__BOOM_SCHEMA){const types=[].concat(o?.['@type']||[]);if(types.includes('WebPage')||types.includes('CollectionPage')){o.name=d.fields.Final_SEO_Title;o.description=d.fields.Final_Meta_Description;}}
   }
  }

 function update(){
  applyFunnelCopy();
  if(!document.querySelector('#boom-seo-section-style')){const style=el('style');style.id='boom-seo-section-style';style.textContent='#boom-bespoke-cups,#boom-research-faq,#boom-screen-scope{font:16px/1.75 Arial,sans-serif;color:#173d35;max-width:1200px;margin:40px auto;padding:28px;box-sizing:border-box}#boom-bespoke-cups{background:#f3f6ef;border:1px solid #d6dfd5;border-radius:16px}#boom-bespoke-cups h2,#boom-research-faq h2{font-size:28px;line-height:1.25}#boom-research-faq details{padding:16px 0;border-bottom:1px solid #d6dfd5}#boom-research-faq summary{font-weight:600;cursor:pointer}#boom-bespoke-enquiry{margin-top:30px;padding-top:24px;border-top:1px solid #d6dfd5}';document.head.append(style)}
  if(document.title!==d.fields.Final_SEO_Title)document.title=d.fields.Final_SEO_Title;
  const h=document.querySelector('h1');if(h&&d.fields.Final_H1&&h.textContent.replace(/\s+/g,' ').trim()!==d.fields.Final_H1.replace(/\s+/g,' ').trim())h.textContent=d.fields.Final_H1;
  const meta=document.querySelector('meta[name="description"]');if(meta&&d.fields.Final_Meta_Description&&meta.content!==d.fields.Final_Meta_Description)meta.content=d.fields.Final_Meta_Description;
  if(d.copy_css&&!document.querySelector('#boom-serp-copy-style')){const style=el('style',d.copy_css);style.id='boom-serp-copy-style';document.head.append(style);}
  if(d.model_link_fixes)for(const f of d.model_link_fixes)for(const card of document.querySelectorAll('.ec-library-card')){const sku=card.querySelector('.ec-library-model')?.textContent.trim()||card.dataset.model;if(sku===f.sku)for(const a of card.querySelectorAll('a[href*="/products/"]'))if(a.getAttribute('href')!==f.to)a.setAttribute('href',f.to);}
  if(d.sku)for(const table of document.querySelectorAll('.ec-library-spec-table'))if(!table.querySelector('caption')){const caption=el('caption','Specifications for model '+d.sku);table.prepend(caption);}
  if(d.sku&&d.hero){const lead=document.querySelector('.ec-library-lead');if(lead&&lead.textContent!==d.hero)lead.textContent=d.hero}
  if(d.specs?.length===1){const s=d.specs[0],spec=s.specifications||'',material=spec.split(/\/[\d]|\/\s*\d/)[0];
   for(const tr of document.querySelectorAll('table tr')){const k=tr.querySelector('th')?.textContent.trim(),td=tr.querySelector('td');if(!td)continue;let v;
    if(k==='Case packing')v=s.packing;
    if(k==='Material'&&/^[A-Za-z+ .-]+$/.test(material)&&material.length<65)v=material;
    if(['Minimum order','Price and minimum order'].includes(k)&&s.starting_order_quantity)v=s.starting_order_quantity+' '+s.quantity_unit+' minimum';
    if(v&&td.textContent!==v)td.textContent=v;
   }
  }
  if(d.material_options?.length){
   const material=d.material_options.join(' · ');
   for(const tr of document.querySelectorAll('main tr')){const th=tr.querySelector('th'),td=tr.querySelector('td');if(th&&td&&['Material','Material options'].includes(th.textContent.trim())){if(th.textContent!=='Material options')th.textContent='Material options';if(td.textContent!==material)td.textContent=material;}}
   for(const dt of document.querySelectorAll('main dt')){const dd=dt.nextElementSibling;if(dd&&['Material','Material options'].includes(dt.textContent.trim())){if(dt.textContent!=='Material options')dt.textContent='Material options';if(dd.textContent!==material)dd.textContent=material;}}
  }
  if(d.sku==='JBPJ-044'){
   for(const dt of document.querySelectorAll('dt')){const dd=dt.nextElementSibling;if(!dd)continue;let v;if(dt.textContent.trim()==='Material')v='Nylon + Silicone';if(dt.textContent.trim()==='Capacity options')v='Not applicable: bottle stopper and wine charms';if(v&&dd.textContent!==v)dd.textContent=v}
   for(const tr of document.querySelectorAll('table tr')){const cells=tr.querySelectorAll('td,th');if(cells.length===2&&cells[0].textContent.trim()==='Material'&&cells[1].textContent!=='Nylon + Silicone')cells[1].textContent='Nylon + Silicone';if(cells.length===2&&cells[0].textContent.trim()==='Capacity options'&&cells[1].textContent!=='Not applicable: bottle stopper and wine charms')cells[1].textContent='Not applicable: bottle stopper and wine charms'}
   const sec=document.querySelector('#product-use-scenarios');if(sec){for(const n of sec.querySelectorAll('.ec-scenario-grid,.ec-scenario-role,.ec-scenario-check'))n.remove();if(!sec.querySelector('[data-boom-true-use]')){const p=el('p','Bottle stopper with eight silicone wine charms for branded wine-service accessories and gift sets.');p.dataset.boomTrueUse='';sec.append(p)}}
   const table=document.querySelector('.ec-library-spec-table');if(table){for(const tr of table.querySelectorAll('tr')){const th=tr.querySelector('th'),td=tr.querySelector('td');if(th?.textContent.trim()==='Logo method and artwork area'&&td&&td.textContent!=='Free design and a product mockup for your selected logo and artwork.')td.textContent='Free design and a product mockup for your selected logo and artwork.'}}
  }
  if(d.faq){let block=document.querySelector('#boom-research-faq');if(!block){block=el('section');block.id='boom-research-faq';block.className='ec-library-detail-section';block.append(el('h2','Your Project Questions'));for(const f of d.faq){const q=el('details');q.append(el('summary',f.question),el('p',f.answer));block.append(q)}(document.querySelector('main')||document.body).append(block)}}
  if(d.faq){
   const faq={'@type':'FAQPage',mainEntity:d.faq.map(f=>({'@type':'Question',name:f.question,acceptedAnswer:{'@type':'Answer',text:f.answer}}))};
   const strip=v=>{if(Array.isArray(v))return v.map(strip).filter(x=>x!==null);if(v&&typeof v==='object'){if([].concat(v['@type']||[]).includes('FAQPage'))return null;const n={};for(const [k,x]of Object.entries(v))n[k]=strip(x);if(d.sku&&[].concat(n['@type']||[]).includes('Product')){n.sku=d.sku;if(d.sku==='JBPJ-044')n.material='Nylon + Silicone';if(d.material_options?.length)n.material=d.material_options}return n}return v};
   const graph=strip(window.__BOOM_SCHEMA||[]);graph.push(faq);const before=JSON.stringify(window.__BOOM_SCHEMA||[]);if(JSON.stringify(graph)!==before)window.__BOOM_SCHEMA=graph;
   let schema=document.querySelector('script[data-boom-authoritative]');if(!schema){schema=el('script');schema.type='application/ld+json';schema.dataset.boomAuthoritative='1';document.head.append(schema)}const text=JSON.stringify({'@context':'https://schema.org','@graph':graph});if(schema.textContent!==text)schema.textContent=text;
  }
  if(d.bespoke&&!document.querySelector('#boom-bespoke-cups')){const s=el('section');s.id='boom-bespoke-cups';s.append(el('h2',d.bespoke.h2),el('p',d.bespoke.copy));for(const step of d.bespoke.steps)s.append(el('h3',step.title),el('p',step.copy));(document.querySelector('main')||document.body).append(s)}
  const bespoke=document.querySelector('#boom-bespoke-cups');
  if(d.bespoke){
   const allowed=new Set((data._active_products||[]).filter(p=>/Plastic/.test(p.category)).map(p=>p.route));
   for(const card of document.querySelectorAll('main .ec-library-card')){const link=card.querySelector('a[href*="/products/"]');if(link&&!allowed.has(new URL(link.href,location.href).pathname))card.remove()}
   const grid=[...document.querySelectorAll('main .ec-library-grid')].filter(g=>g.querySelector('.ec-library-card')).pop();
   if(grid&&bespoke){let end=grid.closest('section')||grid;if(!end.contains(bespoke)&&end.nextElementSibling!==bespoke)end.after(bespoke)}
  }
  if(bespoke&&d.bespoke&&!bespoke.querySelector('form')){
   bespoke.classList.add('ec-library-detail-section');bespoke.querySelector('a[href*="/contact/"]')?.remove();const form=el('form');form.id='boom-bespoke-enquiry';form.append(el('h3','Tell Us About Your Custom Cup'));
   for(const [name,title,type,required] of [['name','Your name','text',false],['email','Email','email',true],['quantity','Target quantity','text',true],['message','Your cup shape, capacity, material and design idea','textarea',true],['destination','Destination','text',false],['arrival','Required arrival date','text',false],['attachments','Artwork or references (optional)','file',false]]){const label=el('label',title+(required?' *':'')),input=el(type==='textarea'?'textarea':'input');input.name=name;if(type!=='textarea')input.type=type;input.required=required;if(type==='file'){input.multiple=true;input.accept='.pdf,.png,.jpg,.jpeg,.webp,.ai,.eps'}label.style.display='block';input.style.cssText='display:block;width:100%;max-width:720px;padding:12px;margin:6px 0 18px;border:1px solid #b8c7bf;border-radius:6px';label.append(input);form.append(label)}
   const button=el('button','Send My Custom Cup Project');button.type='submit';button.style.cssText='padding:14px 24px;background:#173d35;color:white;border-radius:8px';const status=el('p');status.setAttribute('role','status');form.append(button,status,el('p','Contact: niles@boomdrinkware.com'));bespoke.append(form);
   let id=crypto.randomUUID();form.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity())return;const body=new FormData(form),files=body.getAll('attachments').filter(f=>f.size);body.delete('attachments');if(files.length>5||files.some(f=>f.size>2*1024*1024)||files.reduce((s,f)=>s+f.size,0)>5*1024*1024){status.textContent='Use up to 5 files, 2 MB each and 5 MB in total.';return}files.forEach(f=>body.append('attachments',f,f.name));body.set('productInterest','Bespoke plastic cup OEM/ODM');body.set('sourcePath',location.pathname);body.set('locale','en');body.set('website','');button.disabled=true;status.textContent='Submitting your project…';try{const sr=await fetch('/api/enquiries/session',{cache:'no-store'}),session=await sr.json();if(!sr.ok||!session.token)throw Error('session');const r=await fetch('/api/enquiries',{method:'POST',headers:{'X-Enquiry-Token':session.token,'Idempotency-Key':id},body});const v=await r.json();if(!r.ok||!v.ok)throw Error('submit');status.textContent='Your project has been submitted. Reference: '+v.id+'. Our factory team will reply by email.';form.reset();id=crypto.randomUUID()}catch{status.textContent='Submission was not confirmed. Your details are kept here. Retry or email niles@boomdrinkware.com.'}finally{button.disabled=false}})
  }
 }

 // Reconcile once asynchronous product rendering replaces the static page.
 // The predicate ignores our own settled writes, so this does not poll or loop.
 let reconcileTimer=0;
 const needsReconcile=()=>{
  const h=document.querySelector('main h1');if(!h)return false;
  if(document.title!==d.fields.Final_SEO_Title||h.textContent.replace(/\s+/g,' ').trim()!==d.fields.Final_H1.replace(/\s+/g,' ').trim()||document.querySelector('meta[name="description"]')?.content!==d.fields.Final_Meta_Description)return true;
  if(d.tritan_wash_test&&!document.querySelector('#boom-tritan-wash-results'))return true;
  if(d.material_options?.length){const rows=[...document.querySelectorAll('main tr')].filter(n=>/^(Material|Material options)$/.test(n.querySelector('th')?.textContent.trim()||''));if(rows.some(n=>!n.textContent.includes('TRITAN')))return true;}
  return false;
 };
 new MutationObserver(()=>{if(needsReconcile()&&!reconcileTimer)reconcileTimer=setTimeout(()=>{reconcileTimer=0;if(needsReconcile())update()},32)}).observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['content']});
 update();[300,700].forEach(t=>setTimeout(update,t));document.addEventListener('boom:client-ready',()=>{update();setTimeout(update,250)});window.addEventListener('popstate',()=>setTimeout(update,300));document.addEventListener('click',()=>{clearTimeout(window.__boomConsClk);window.__boomConsClk=setTimeout(update,450)},true);
})();
