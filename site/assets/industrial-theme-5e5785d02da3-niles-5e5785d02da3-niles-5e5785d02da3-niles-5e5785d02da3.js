(function(){function apply(){if(/^\/(admin|api)(\/|$)/.test(location.pathname))return;document.body?.classList.add('boom-industrial');document.body?.classList.toggle('boom-home',location.pathname==='/'||location.pathname==='/zh/');document.querySelectorAll('.byf-page').forEach(section=>{if(section.querySelector(':scope>.boom-page-intro')||!section.querySelector(':scope>h1'))return;const nodes=[...section.children];const intro=[];for(const x of nodes){if(x.matches('nav,p,h1,.buyer-form-steps'))intro.push(x);else break;}if(!intro.some(x=>x.tagName==='H1'))return;const header=document.createElement('header');header.className='boom-page-intro';section.insertBefore(header,intro[0]);intro.forEach(x=>header.appendChild(x));});}let pending=false;function check(){if(!pending){pending=true;setTimeout(()=>{pending=false;apply();},100);}}document.readyState==='loading'?document.addEventListener('DOMContentLoaded',apply):apply();new MutationObserver(check).observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('popstate',apply);})();
(function(){
 const selector='main h1,main h2,main h3,main h4,main h5,main p,main li,main dt,main dd,main span,main label,main figcaption,main a,main summary,main button,main th,main td,main input,main textarea,main select';
 function rgba(value){const m=value.match(/[\d.]+/g);return m&&m.length>=3?[Number(m[0]),Number(m[1]),Number(m[2]),m.length>3?Number(m[3]):1]:[255,255,255,0];}
 function light(rgb){const a=rgb.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return .2126*a[0]+.7152*a[1]+.0722*a[2]>.44;}
 function photoOverlay(el){const scope=el.closest('figure,a'),img=scope?.querySelector('img');if(!img||rgba(getComputedStyle(el).backgroundColor)[3]>.8)return false;const a=el.getBoundingClientRect(),b=img.getBoundingClientRect();if(!a.width||!a.height)return false;const overlap=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));return overlap>a.width*a.height*.45;}
 function update(){
  if(!document.body?.classList.contains('boom-industrial'))return;
  const cache=new Map();function background(el){if(!el)return[245,246,239,1];if(cache.has(el))return cache.get(el);const own=rgba(getComputedStyle(el).backgroundColor);let result=own;if(own[3]<.995){const behind=background(el.parentElement),alpha=own[3];result=[own[0]*alpha+behind[0]*(1-alpha),own[1]*alpha+behind[1]*(1-alpha),own[2]*alpha+behind[2]*(1-alpha),1];}cache.set(el,result);return result;}
  for(const el of document.querySelectorAll(selector)){
   if(el.closest('svg,[aria-hidden="true"],.direct-honey,.oemx-hp')||!el.getClientRects().length)continue;
   const hasText=[...el.childNodes].some(n=>n.nodeType===3&&n.nodeValue.trim());if(!hasText&&!el.matches('input,textarea,select'))continue;
   const bg=background(el),isLight=light(bg)&&!photoOverlay(el);
   if(isLight){
    if(!el.hasAttribute('data-boom-light-ink')){el.dataset.boomOriginalColor=el.style.getPropertyValue('color');el.dataset.boomOriginalColorPriority=el.style.getPropertyPriority('color');el.dataset.boomOriginalWeight=el.style.getPropertyValue('font-weight');el.dataset.boomOriginalWeightPriority=el.style.getPropertyPriority('font-weight');}
    const current=Number.parseInt(getComputedStyle(el).fontWeight)||400;if(el.style.color!=='rgb(17, 24, 19)'&&el.style.color!=='#111813')el.style.setProperty('color','#111813','important');const weight=String(Math.max(current,el.matches('h1,h2,h3,h4,h5')?700:600));if(el.style.fontWeight!==weight)el.style.setProperty('font-weight',weight,'important');if(el.getAttribute('data-boom-light-ink')!=='1')el.setAttribute('data-boom-light-ink','1');const bgText=bg.slice(0,3).map(Math.round).join(',');if(el.getAttribute('data-boom-background')!==bgText)el.setAttribute('data-boom-background',bgText);
   }else if(el.hasAttribute('data-boom-light-ink')){
    for(const [prop,key]of [['color','Color'],['font-weight','Weight']]){const value=el.dataset['boomOriginal'+key];value?el.style.setProperty(prop,value,el.dataset['boomOriginal'+key+'Priority']||''):el.style.removeProperty(prop);}el.removeAttribute('data-boom-light-ink');el.removeAttribute('data-boom-background');
   }
  }
 }
 let queued=false;function schedule(){if(!queued){queued=true;setTimeout(()=>{queued=false;update();},120);}}
 new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,characterData:true});document.addEventListener('DOMContentLoaded',schedule);window.addEventListener('load',schedule);window.addEventListener('resize',schedule);window.addEventListener('popstate',schedule);document.addEventListener('click',schedule,true);schedule();
})();



(function(){
function update(){
 const zh=location.pathname==='/zh/';if(location.pathname!=='/'&&!zh)return;
 const hero=document.querySelector('.of-hero'),box=hero?.querySelector('.of-hero-product');if(!box)return;
 const img=box.querySelector('img');if(img){const src='/img/factory-20261104/factory-1-building.webp';if(img.getAttribute('src')!==src)img.src=src;img.alt=zh?'BOOM杯具工厂大楼全景':'BOOM Drinkware factory building in Shenzhen';img.width=1200;img.height=900;img.style.height='auto';img.style.width='100%';img.style.aspectRatio='4 / 3';img.style.objectFit='cover';}
 const caption=box.querySelector('.of-product-label'),copy=zh?"全流程服务：在我们自己的工厂，从初步沟通、工厂审核，到产品设计、模具开发、生产制造及交付港口，整个流程均由我们内部完成。没有中间商，没有不必要的加价。":"End-to-End Service：At our own factory, we handle the entire process in-house—from initial communication and factory audits to product design, mold development, manufacturing, and delivery to port. No middlemen, no unnecessary markups";if(caption&&caption.textContent!==copy)caption.textContent=copy;
 let link=box.querySelector('.boom-home-factory-link');if(!link){link=document.createElement('a');link.className='boom-home-factory-link';while(box.firstChild)link.append(box.firstChild);box.append(link);}const target=zh?'/zh/factory/about/':'/factory/about/';if(link.getAttribute('href')!==target)link.href=target;link.setAttribute('aria-label',zh?'了解BOOM工厂':'About the BOOM Drinkware factory');
 const head=hero.querySelector('.of-visual-head>span');const heading=zh?'走进BOOM杯具工厂':'INSIDE OUR FACTORY';if(head&&head.textContent!==heading)head.textContent=heading;
 const links=hero.querySelectorAll('.of-mini-grid a'),values=[[zh?'/zh/new-arrivals/':'/new-arrivals/',zh?'上新产品 ↗':'New Arrivals ↗','/img/cat-tiles-20261028/led-620.webp',zh?'上新杯具产品':'New drinkware arrivals'],[zh?'/zh/customization/':'/customization/',zh?'了解全部工艺 ↗':'Explore All Processes ↗','/img/oem-caps-20261028/cap-01-print.webp',zh?'杯具定制工艺示意':'Drinkware customization process reference']];
 links.forEach((a,i)=>{if(i>1)return;const[href,label,src,alt]=values[i];if(a.getAttribute('href')!==href)a.href=href;const icon=a.querySelector('img');if(icon){if(icon.getAttribute('src')!==src)icon.src=src;if(icon.alt!==alt)icon.alt=alt;}const text=[...a.childNodes].find(n=>n.nodeType===3&&n.nodeValue.trim());if(text&&text.nodeValue.trim()!==label)text.nodeValue=label;});
}
let q=false;new MutationObserver(()=>{if(!q){q=true;setTimeout(()=>{q=false;update();},60);}}).observe(document.documentElement,{childList:true,subtree:true});document.readyState==='loading'?document.addEventListener('DOMContentLoaded',update):update();window.addEventListener('popstate',update);
})();


(function(){function clean(){document.querySelectorAll('a[href="#removed-contact"]').forEach(a=>a.remove());}new MutationObserver(clean).observe(document.documentElement,{childList:true,subtree:true});clean();})();
