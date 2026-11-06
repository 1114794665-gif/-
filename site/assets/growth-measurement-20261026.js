/* Optional measurement adapter. No account ID means no external analytics request. */
(()=>{'use strict';
 const allowed=new Set(['page_view','view_item','rfq_start','rfq_submit_attempt','rfq_received','rfq_failed','contact_click','compare_click']);
 const seen=new Set();let config={enabled:false,ga4MeasurementId:null},consent=false,loaded=false,lastRoute='',started=false;
 const channels=new Set(['google','bing','facebook','instagram','linkedin','tiktok','youtube','email']);
 function referrer(){try{return document.referrer?new URL(document.referrer).origin+'/':'';}catch{return '';}}
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
   const {event,...params}=detail;params.send_to=config.ga4MeasurementId;params.page_location=location.origin+route();params.page_referrer=referrer();params.page_title='BOOM Drinkware '+route();window.gtag('event',event==='rfq_received'?'generate_lead':event,params);
  }
 }
 function enable(){
  if(loaded||!config.enabled||!/^G-[A-Z0-9]+$/.test(config.ga4MeasurementId||''))return;
  loaded=true;window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};
  window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  window.gtag('consent','update',{analytics_storage:'granted'});
  window.gtag('set',{send_page_view:false,page_location:location.origin+route(),page_referrer:referrer(),page_title:'BOOM Drinkware '+route()});
  window.gtag('js',new Date());
  const attribution={};const query=new URLSearchParams(location.search),source=query.get('utm_source'),medium=query.get('utm_medium');if(channels.has(source)){attribution.campaign_source=source;if(new Set(['organic','cpc','paid','paid_social','social','email','referral','display']).has(medium))attribution.campaign_medium=medium;}
  window.gtag('config',config.ga4MeasurementId,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,page_location:location.origin+route(),page_referrer:referrer(),page_title:'BOOM Drinkware '+route(),...attribution});
  const tag=document.createElement('script');tag.async=true;tag.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(config.ga4MeasurementId);document.head.append(tag);if(lastRoute)event('page_view');seen.clear();observe();
 }
 function choice(){
  if(!config.enabled)return;
  if(!document.querySelector('#ec-analytics-style')){const style=document.createElement('style');style.id='ec-analytics-style';style.textContent='.ec-measurement-choice{position:fixed;left:16px;bottom:84px;z-index:99999;max-width:430px;width:calc(100% - 32px);padding:18px;background:#fffdf7;color:#203b32;border:1px solid #bcc9bb;border-radius:12px;box-shadow:0 8px 30px #0002;font:14px/1.5 system-ui}.ec-measurement-choice p{margin:0 0 12px}.ec-measurement-choice button,.ec-measurement-choice a{display:inline-block;margin:4px 8px 0 0;padding:8px 12px;border:1px solid #526d60;border-radius:6px;background:#fff;color:#203b32;cursor:pointer}.ec-measurement-choice a{font-size:12px}';document.head.append(style);}
  if(route().endsWith('/privacy/')&&!document.querySelector('[data-reset-analytics]')){const b=document.createElement('button');b.type='button';b.dataset.resetAnalytics='1';b.textContent=route().startsWith('/zh/')?'重新选择统计偏好':'Change analytics choice';b.addEventListener('click',()=>{consent=false;try{localStorage.removeItem('evercup-analytics-choice');}catch{}if(window.gtag)window.gtag('consent','update',{analytics_storage:'denied'});location.reload();});document.querySelector('main')?.append(b);}
  try{consent=localStorage.getItem('evercup-analytics-choice')==='accepted';if(localStorage.getItem('evercup-analytics-choice')){if(consent)enable();return;}}catch{}
  const zh=route().startsWith('/zh/'),box=document.createElement('aside');box.className='ec-measurement-choice';box.setAttribute('aria-label',zh?'访问统计选择':'Analytics choice');
  box.innerHTML='<p>'+(zh?'允许不含询盘正文或联系方式的访问统计？你可以拒绝，选型与询盘功能仍可使用。':'Allow visit analytics without enquiry text or contact details? You can decline and still use model selection and enquiries.')+'</p><button type="button" data-choice="accepted">'+(zh?'允许统计':'Allow analytics')+'</button><button type="button" data-choice="declined">'+(zh?'拒绝':'Decline')+'</button><a href="'+(zh?'/zh/privacy/':'/privacy/')+'">'+(zh?'资料说明':'Information notice')+'</a>';
  box.addEventListener('click',e=>{const b=e.target.closest('[data-choice]');if(!b)return;consent=b.dataset.choice==='accepted';try{localStorage.setItem('evercup-analytics-choice',b.dataset.choice);}catch{}box.remove();if(consent)enable();});document.body.append(box);
 }
 function enquiryForm(target){return target.closest('form')&&(/\/(?:zh\/)?contact\/$/.test(route())||target.closest('#byf-floating-enquiry,#of-rfq-card'));}
 document.addEventListener('focusin',e=>{if(enquiryForm(e.target)&&!started){started=true;event('rfq_start');}});
 document.addEventListener('submit',e=>{if(enquiryForm(e.target))event('rfq_submit_attempt');},true);
 document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(a){const href=a.getAttribute('href');if(href?.startsWith('mailto:')||href?.includes('/contact/'))event('contact_click');}const c=e.target.closest('input[type="checkbox"]');if(c&&/compare|比较/i.test(c.parentElement?.textContent||''))event('compare_click');});
 window.addEventListener('evercup:rfq-received',e=>event('rfq_received',{modelCount:e.detail?.modelCount}));
 window.addEventListener('evercup:rfq-failed',()=>event('rfq_failed'));
 function observe(){const p=route();if(p!==lastRoute){lastRoute=p;started=false;event('page_view');}const main=document.querySelector('main');if(!main||!p.includes('/products/'))return;const crumb=main.querySelector('nav')?.textContent||main.textContent?.slice(0,350)||'';const sku=crumb.match(/\b[A-Z]{1,8}-\d{3}\b/)?.[0];if(sku&&!seen.has(p)){seen.add(p);event('view_item',{sku});}}
 let scheduled=false;new MutationObserver(()=>{if(!scheduled){scheduled=true;setTimeout(()=>{scheduled=false;observe();},80);}}).observe(document.documentElement,{childList:true,subtree:true});
 fetch('/data/growth-measurement-config.json',{credentials:'same-origin'}).then(r=>r.ok?r.json():{}).then(c=>{config={...config,...c};config.enabled=!!config.enabled&&location.hostname===config.domain;choice();observe();}).catch(observe);
})();
