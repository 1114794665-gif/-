/* Optional measurement adapter. No account ID means no external analytics request. */
(()=>{'use strict';
 const allowed=new Set(['page_view','view_item','rfq_start','rfq_submit_attempt','rfq_received','rfq_failed','contact_click','compare_click']);
 const seen=new Set();let config={enabled:false,ga4MeasurementId:null},consent=false,loaded=false,lastRoute='',started=false;
 const channels=new Set(['google','bing','facebook','instagram','linkedin','tiktok','youtube','email']);
 function route(){const p=location.pathname;return /^\/(?:[a-z0-9-]+\/)*$/i.test(p)&&p.length<180?p:'/other/';}
 function event(name,input={}){
  if(!allowed.has(name))return;
  const detail={event:name,page_path:route(),language:route().startsWith('/zh/')?'zh':'en'};
  if(typeof input.sku==='string'&&/^[A-Z]{1,8}-\d{3}$/.test(input.sku))detail.item_id=input.sku;
  if(Number.isInteger(input.modelCount)&&input.modelCount>=0&&input.modelCount<=453)detail.model_count=input.modelCount;
  const raw=new URLSearchParams(location.search).get('utm_source');detail.source_channel=channels.has(raw)?raw:'unclassified';
  // A diagnostic event is not a sent GA event or a qualified lead.
  document.dispatchEvent(new CustomEvent('evercup:measurement-observed',{detail}));
  if(config.enabled&&consent&&loaded&&typeof window.gtag==='function'){
   const {event,...params}=detail;params.page_location=location.origin+route();params.page_referrer='';window.gtag('event',event==='rfq_received'?'generate_lead':event,params);
  }
 }
 function enable(){
  if(loaded||!config.enabled||!/^G-[A-Z0-9]+$/.test(config.ga4MeasurementId||''))return;
  loaded=true;window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};
  window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  window.gtag('consent','update',{analytics_storage:'granted'});
  window.gtag('js',new Date());
  window.gtag('config',config.ga4MeasurementId,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,page_location:location.origin+route(),page_referrer:''});
  const tag=document.createElement('script');tag.async=true;tag.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(config.ga4MeasurementId);document.head.append(tag);if(lastRoute)event('page_view');
 }
 function choice(){
  if(!config.enabled)return;
  if(route().endsWith('/privacy/')&&!document.querySelector('[data-reset-analytics]')){const b=document.createElement('button');b.type='button';b.dataset.resetAnalytics='1';b.textContent=route().startsWith('/zh/')?'重新选择统计偏好':'Change analytics choice';b.addEventListener('click',()=>{consent=false;try{localStorage.removeItem('evercup-analytics-choice');}catch{}if(window.gtag)window.gtag('consent','update',{analytics_storage:'denied'});choice();});document.querySelector('main')?.append(b);}
  try{consent=localStorage.getItem('evercup-analytics-choice')==='accepted';if(localStorage.getItem('evercup-analytics-choice')){if(consent)enable();return;}}catch{}
  const zh=route().startsWith('/zh/'),box=document.createElement('aside');box.className='ec-measurement-choice';box.setAttribute('aria-label',zh?'访问统计选择':'Analytics choice');
  box.innerHTML='<p>'+(zh?'允许不含询盘正文或联系方式的访问统计？你可以拒绝，选型与询盘功能仍可使用。':'Allow visit analytics without enquiry text or contact details? You can decline and still use model selection and enquiries.')+'</p><button type="button" data-choice="accepted">'+(zh?'允许统计':'Allow analytics')+'</button><button type="button" data-choice="declined">'+(zh?'拒绝':'Decline')+'</button><a href="'+(zh?'/zh/privacy/':'/privacy/')+'">'+(zh?'资料说明':'Information notice')+'</a>';
  box.addEventListener('click',e=>{const b=e.target.closest('[data-choice]');if(!b)return;consent=b.dataset.choice==='accepted';try{localStorage.setItem('evercup-analytics-choice',b.dataset.choice);}catch{}box.remove();if(consent)enable();});document.body.append(box);
 }
 document.addEventListener('focusin',e=>{if(e.target.closest('form')&&/\/(?:zh\/)?contact\/$/.test(route())&&!started){started=true;event('rfq_start');}});
 document.addEventListener('submit',e=>{if(/\/(?:zh\/)?contact\/$/.test(route()))event('rfq_submit_attempt');},true);
 document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(a){const href=a.getAttribute('href');if(href?.startsWith('mailto:')||href?.includes('/contact/'))event('contact_click');}const c=e.target.closest('input[type="checkbox"]');if(c&&/compare|比较/i.test(c.parentElement?.textContent||''))event('compare_click');});
 window.addEventListener('evercup:rfq-received',e=>event('rfq_received',{modelCount:e.detail?.modelCount}));
 window.addEventListener('evercup:rfq-failed',()=>event('rfq_failed'));
 function observe(){const p=route();if(p!==lastRoute){lastRoute=p;started=false;event('page_view');}const main=document.querySelector('main');if(!main||!p.includes('/products/'))return;const crumb=main.querySelector('nav')?.textContent||main.textContent?.slice(0,350)||'';const sku=crumb.match(/\b[A-Z]{1,8}-\d{3}\b/)?.[0];if(sku&&!seen.has(p)){seen.add(p);event('view_item',{sku});}}
 let scheduled=false;new MutationObserver(()=>{if(!scheduled){scheduled=true;setTimeout(()=>{scheduled=false;observe();},80);}}).observe(document.documentElement,{childList:true,subtree:true});
 fetch('/data/growth-measurement-config.json',{credentials:'same-origin'}).then(r=>r.ok?r.json():{}).then(c=>{config={...config,...c};choice();observe();}).catch(observe);
})();
