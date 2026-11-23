const json=(v,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});

const wakeNotifier = (env, ctx, id) => {
 if (!env.OEM_NOTIFY) return;
 const task = env.OEM_NOTIFY.fetch('https://internal/enqueue', {
  method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id})
 }).then(r=>{if(!r.ok)throw new Error('NOTIFIER_UNAVAILABLE');}).catch(()=>{});
 if(ctx&&ctx.waitUntil)ctx.waitUntil(task);
};

/* ---- 后台 SEO 编辑器（正式站通道）：保存到 GitHub 仓库 ---- */
const GH_REPO='1114794665-gif/-', GH_BRANCH='deploy/cloudflare-free';
const GH_FILE='site/data/seo-overrides.json', GH_INDEX='site/data/seo-pages-index.json';
const b64encode=(str)=>{const bytes=new TextEncoder().encode(str);let bin='';for(const b of bytes)bin+=String.fromCharCode(b);return btoa(bin)};
const b64decode=(b64)=>{const bin=atob(String(b64).replace(/\s/g,''));const bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);return new TextDecoder().decode(bytes)};
async function gh(path,opt,token){
 const r=await fetch('https://api.github.com/repos/'+GH_REPO+path,{...opt,
  headers:{'Authorization':'Bearer '+token,'User-Agent':'boom-seo-editor',
   'Accept':'application/vnd.github+json','Content-Type':'application/json',...((opt&&opt.headers)||{})}});
 if(!r.ok)throw new Error('GITHUB_'+r.status+' '+(await r.text()).slice(0,140));
 return r.json();
}
async function ghRead(path,token){
 try{const d=await gh('/contents/'+path+'?ref='+encodeURIComponent(GH_BRANCH),{},token);
  return {data:JSON.parse(b64decode(d.content)),sha:d.sha};}
 catch(e){if(/GITHUB_404/.test(String(e)))return {data:null,sha:null};throw e;}
}
async function ghWrite(path,obj,message,sha,token){
 const body={message,content:b64encode(JSON.stringify(obj)),branch:GH_BRANCH};
 if(sha)body.sha=sha;
 return gh('/contents/'+path,{method:'PUT',body:JSON.stringify(body)},token);
}
/* 员工登录：无状态验证码 + HMAC 签名会话（密钥来自 worker secret） */
const enc=new TextEncoder();
const b64u=(s)=>btoa(String.fromCharCode(...enc.encode(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const unb64u=(s)=>new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0)));
const ri=(n)=>crypto.getRandomValues(new Uint32Array(1))[0]%n;
async function hmac(body,secret){
 const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const sig=new Uint8Array(await crypto.subtle.sign('HMAC',key,enc.encode(body)));
 return btoa(String.fromCharCode(...sig)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
const sign=async(p,secret)=>{const body=b64u(JSON.stringify(p));return body+'.'+await hmac(body,secret)};
async function verify(tok,secret){
 try{const [body,mac]=String(tok).split('.');
  if(mac!==await hmac(body,secret))return null;
  return JSON.parse(unb64u(body));
 }catch{return null}
}
async function pwHash(plain){
 const d=new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode('boom-staff-2026'+plain)));
 return [...d].map(x=>x.toString(16).padStart(2,'0')).join('');
}
function captchaSvg(a){
 const cols=['#8b3a2f','#2f5d50','#3b4a7a','#7a4b2f'];
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="104" height="42" viewBox="0 0 104 42">'
  +'<rect width="104" height="42" fill="#f2ede4"/>'
  +`<path d="M0 ${10+ri(22)} Q 52 ${ri(42)} 104 ${10+ri(22)}" stroke="#c9bda9" fill="none" stroke-width="1"/>`
  +[...a].map((c,i)=>`<text x="${9+i*23}" y="${27+(ri(7)-3)}" font-family="monospace" font-size="22" font-weight="bold" fill="${cols[i%4]}" transform="rotate(${ri(13)-6} ${14+i*23} 21)">${c}</text>`).join('')
  +'</svg>';
 return 'data:image/svg+xml;base64,'+btoa(svg);
}
const STAFF_USER={id:'staff-owner',username:'admin',name:'站长',displayName:'站长',role:'admin',email:'',disabled:false};
const COOKIE_BASE='boom_staff=';
const cookieFor=(tok)=>COOKIE_BASE+tok+'; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=28800';
const LOGOUT_COOKIE=COOKIE_BASE+'; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0';
async function shaHex(s){
 const d=new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(s)));
 return [...d].map(x=>x.toString(16).padStart(2,'0')).join('');
}
async function authCaptcha(env){
 const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let a='';
 for(let i=0;i<4;i++)a+=chars[ri(chars.length)];
 return {id:await sign({h:await shaHex(a),exp:Date.now()+300000},env.STAFF_SECRET),svgDataUri:captchaSvg(a)};
}
async function authLogin(inp,env){
 if(String(inp.username||'').trim().toLowerCase()!=='admin')throw new Error('用户名或密码不对');
 if(await pwHash(String(inp.password||''))!==env.STAFF_PASSWORD_HASH)throw new Error('用户名或密码不对');
 const p=await verify(inp.captchaId||'',env.STAFF_SECRET);
 if(!p||p.exp<=Date.now()||p.h!==await shaHex(String(inp.captchaText||'').trim().toUpperCase()))throw new Error('验证码不对或已过期，请换一张');
 const tok=await sign({u:'admin',exp:Date.now()+28800000},env.STAFF_SECRET);
 return {user:STAFF_USER,cookie:cookieFor(tok)};
}
async function authMe(request,env){
 const m=/(?:^|;\s*)boom_staff=([^;]+)/.exec(request.headers.get('Cookie')||'');
 const p=m&&await verify(m[1],env.STAFF_SECRET);
 return p&&p.u==='admin'&&p.exp>Date.now()?STAFF_USER:null;
}
async function seoList(env){
 const [idx,ov]=await Promise.all([ghRead(GH_INDEX,env.GITHUB_TOKEN),ghRead(GH_FILE,env.GITHUB_TOKEN)]);
 const over=(ov.data&&ov.data.pages)||{};
 const stamp=(idx.data&&idx.data.generatedAt)||new Date().toISOString();
 return ((idx.data&&idx.data.pages)||[]).map(p=>{const o=over[p.route];
  return {...p,id:p.route,updatedAt:(o&&o.updatedAt)||stamp,
   title:o?(o.title??p.title):p.title,meta:o?(o.meta??p.meta):p.meta,
   h1:o?(o.h1??p.h1):p.h1,keyword:o?(o.keyword??p.keyword):p.keyword,
   ogImage:o?(o.ogImage??p.ogImage):p.ogImage};
 });
}
async function seoUpsert(inp,env){
 if(!inp||!inp.route||!/^\/[A-Za-z0-9_/-]*\/$/.test(inp.route))throw new Error('页面地址不合法');
 const cur=await ghRead(GH_FILE,env.GITHUB_TOKEN);
 const ov=cur.data||{version:1,updatedAt:'',pages:{}};ov.pages=ov.pages||{};
 ov.pages[inp.route]={route:inp.route,pageType:String(inp.pageType||'page'),
  title:String(inp.title||'').trim(),meta:String(inp.meta||'').trim(),h1:String(inp.h1||'').trim(),
  keyword:String(inp.keyword||'').trim(),ogImage:String(inp.ogImage||'').trim()||'/og-default.png',
  updatedAt:new Date().toISOString()};
 ov.version=1;ov.updatedAt=new Date().toISOString();
 const r=await ghWrite(GH_FILE,ov,'SEO editor: '+inp.route,cur.sha,env.GITHUB_TOKEN);
 return {ok:true,route:inp.route,github:'saved',commit:(r.commit&&r.commit.sha||'').slice(0,7),published:'pending'};
}
function trpcInputs(url,body){
 let raw=null;
 if(url.searchParams.has('input')){try{raw=JSON.parse(url.searchParams.get('input'))}catch{}}
 if(!raw&&body&&typeof body==='object')raw=body;
 const multi=raw&&typeof raw==='object'&&'0'in raw;
 return (i)=>{const v=multi?raw[String(i)]:(i===0?raw:undefined);
  if(v&&typeof v==='object'&&'json'in v)return v.json;return v||{}};
}
async function handleTrpc(request,url,path,env){
 const procs=decodeURIComponent(path.slice('/api/trpc/'.length)).split(',');
 const batched=url.searchParams.get('batch')==='1';
 let body={};if(request.method==='POST'){try{body=await request.json()}catch{}}
 const getInp=trpcInputs(url,body);
 const cookies=[],results=[];
 for(let i=0;i<procs.length;i++){
  const name=procs[i];
  try{
   let data=[],cookie=null;
   if(name==='auth.me')data=await authMe(request,env);
   else if(name==='auth.captcha')data=await authCaptcha(env);
   else if(name==='auth.loginLocal'||name==='auth.login'){const r=await authLogin(getInp(i),env);data=r.user;cookie=r.cookie}
   else if(name==='auth.logout'){data={ok:true};cookie=LOGOUT_COOKIE}
   else if(name==='seo.list')data=await seoList(env);
   else if(name==='seo.upsert')data=await seoUpsert(getInp(i),env);
   else if(name==='users.list')data=[STAFF_USER];
   else if(name.endsWith('.stats'))data={total:0,live:0,newLast7d:0,pendingSamples:0,set:0,missing:0};
   if(cookie)cookies.push(cookie);
   results.push({result:{data:{json:data}}});
  }catch(e){results.push({error:{json:{message:String(e.message||e),code:'BAD_REQUEST',data:{code:'BAD_REQUEST',httpStatus:400}}}})}
 }
 const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'};
 if(cookies.length)headers['Set-Cookie']=cookies[cookies.length-1];
 return new Response(JSON.stringify(batched?results:results[0]),{status:200,headers});
}
async function handleSeoRest(request,env){
 try{
  if(request.method==='GET')return json(await seoList(env));
  const inp=await request.json();return json(await seoUpsert(inp,env));
 }catch(e){return json({ok:false,error:String(e.message||e)},400)}
}

/* ---- Batch 1：内部产品清单，服务端鉴权（在边缘运行时执行，不是前端隐藏） ----
   命中这两个前缀时，先验登录 Cookie；未登录直接 401，连 HTML 都不返回。
   静态托管上这就是服务端：请求在到达资源之前被拦掉。 */
const INTERNAL_PATHS=['/byf-own-products-20261031','/own-models-20261031'];
const INTERNAL_DENY='<!doctype html><html lang="zh-CN"><meta charset="utf-8">'
 +'<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">'
 +'<meta name="viewport" content="width=device-width,initial-scale=1">'
 +'<title>需要登录 | BOOM Drinkware</title>'
 +'<body style="font-family:system-ui,-apple-system,\'Microsoft YaHei\',sans-serif;padding:56px 22px;max-width:520px;margin:0 auto;color:#20242a">'
 +'<h1 style="font-size:21px;margin:0 0 12px">内部资料，需要登录</h1>'
 +'<p style="color:#5f6873;line-height:1.75;margin:0 0 18px">这个页面只对内部员工开放，未登录不提供任何内容。</p>'
 +'<p style="margin:0"><a href="/login/" style="color:#1b5e9c">去登录 →</a></p></body></html>';
const isInternal=(p)=>INTERNAL_PATHS.some(x=>p===x||p===x+'/'||p.startsWith(x+'/'));

/* ---- A6：六款电子产品已停止供应，36 个地址返回 410 ----
   为什么必须在这里做：Cloudflare Pages 的 _redirects 只支持 301/302/303/307/308，
   写 410 无效；而页面文件已删除，静态层会回 404。404 对搜索引擎是「暂时找不到」，
   410 才是「作者主动永久下架」。所以由边缘运行时返回 410。
   带尾斜杠与不带尾斜杠都拦（客户手打网址、外链少写斜杠都会命中）。 */
const GONE_PATHS=new Set([
'/products/16-oz-light-up-acrylic-shaker/',
'/products/custom-led-light-up-coasters/',
'/products/multicolor-led-light-up-ice-cubes/',
'/products/electric-wine-opener-s-2/',
'/products/rechargeable-wine-opener/',
'/products/rechargeable-wine-aerator-dispenser/',
'/zh/products/16-oz-light-up-acrylic-shaker/',
'/zh/products/custom-led-light-up-coasters/',
'/zh/products/multicolor-led-light-up-ice-cubes/',
'/zh/products/electric-wine-opener-s-2/',
'/zh/products/rechargeable-wine-opener/',
'/zh/products/rechargeable-wine-aerator-dispenser/',
'/products/electric-opener-s-2/',
'/products/electric-wine-opener-kit-s-4/',
'/products/electric-wine-opener-kit-s-5/',
'/products/electric-wine-opener/',
'/products/rechargeable-opener-dispenser-kit-s-5/',
'/products/rechargeable-opener-kit-w-base-s/',
'/products/rechargeable-wine-opener-dispenser-kit-s/',
'/products/rechargeable-wine-opener-kit-s-5/',
'/products/rechargeable-wine-opener-kit-s-6/',
'/products/rechargeable-wine-opener-kit-with-base/',
'/products/rechargeable-wine-opener-s-3/',
'/products/rechargeable-wine-opener-set-s-3/',
'/zh/products/electric-opener-s-2/',
'/zh/products/electric-wine-opener-kit-s-4/',
'/zh/products/electric-wine-opener-kit-s-5/',
'/zh/products/electric-wine-opener/',
'/zh/products/rechargeable-opener-dispenser-kit-s-5/',
'/zh/products/rechargeable-opener-kit-w-base-s/',
'/zh/products/rechargeable-wine-opener-dispenser-kit-s/',
'/zh/products/rechargeable-wine-opener-kit-s-5/',
'/zh/products/rechargeable-wine-opener-kit-s-6/',
'/zh/products/rechargeable-wine-opener-kit-with-base/',
'/zh/products/rechargeable-wine-opener-s-3/',
'/zh/products/rechargeable-wine-opener-set-s-3/',
/* ---- 批次 4：D 组五款停售（原为 200 页但页面自标「已下架」，不符合 410 要求）---- */
'/products/1-5oz-blue-uv-reactive/',
'/products/16oz-cold-beverage-souvenir-cup/',
'/products/custom-plastic-shot-glass-2oz/',
'/products/full-printed-cold-cup-16oz/',
'/products/wine-glass-fish-bowl/',
'/zh/products/1-5oz-blue-uv-reactive/',
'/zh/products/16oz-cold-beverage-souvenir-cup/',
'/zh/products/custom-plastic-shot-glass-2oz/',
'/zh/products/full-printed-cold-cup-16oz/',
'/zh/products/wine-glass-fish-bowl/'
]);
const isGone=(p)=>{let t=p.replace(/\/+$/,'');return t===''?false:GONE_PATHS.has(t+'/');};
const GONE_BODY='<!doctype html><html lang="en"><meta charset="utf-8">'
 +'<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">'
 +'<meta name="viewport" content="width=device-width,initial-scale=1">'
 +'<title>Product discontinued | BOOM Drinkware</title>'
 +'<body style="font-family:system-ui,-apple-system,\'Microsoft YaHei\',sans-serif;padding:56px 22px;max-width:560px;margin:0 auto;color:#20242a">'
 +'<h1 style="font-size:22px;margin:0 0 14px">This product is no longer available</h1>'
 +'<p style="color:#5f6873;line-height:1.8;margin:0 0 10px">This model has been discontinued and is no longer in production.</p>'
 +'<p style="color:#5f6873;line-height:1.8;margin:0 0 26px">此型号已停止供应，不再生产。</p>'
 +'<p style="margin:0"><a href="/products/" style="display:inline-block;background:#8b3a2f;color:#fff;text-decoration:none;padding:11px 20px;border-radius:4px">Browse all products →</a></p>'
 +'</body></html>';

export default {async fetch(request,env,ctx){
 const url=new URL(request.url),path=url.pathname;
 if(isGone(path)){
  return new Response(GONE_BODY,{status:410,headers:{
   'Content-Type':'text/html; charset=utf-8',
   'X-Robots-Tag':'noindex, nofollow, noarchive, nosnippet',
   'Cache-Control':'no-store'}});
 }
 if(isInternal(path)){
  let user=null;try{user=await authMe(request,env)}catch{}
  if(!user)return new Response(INTERNAL_DENY,{status:401,headers:{
   'Content-Type':'text/html; charset=utf-8',
   'X-Robots-Tag':'noindex, nofollow, noarchive, nosnippet',
   'Cache-Control':'no-store, private'}});
  const r=await env.ASSETS.fetch(request);
  const h=new Headers(r.headers);
  h.set('X-Robots-Tag','noindex, nofollow, noarchive, nosnippet');
  h.set('Cache-Control','no-store, private');
  return new Response(r.body,{status:r.status,headers:h});
 }
 if(path==='/api/products')return env.ASSETS.fetch(new Request(new URL('/data/api-products-snapshot.json',url),{method:'GET'}));
 // 旧版页面编辑器的读取口：线上没有存过任何「临时改动」，直接回空，免得每个页面都刷 3 次 404
 if(path==='/api/cms/public')return json({ok:true,patches:[]});
 if(!path.startsWith('/api/'))return env.ASSETS.fetch(request);
 if(path.startsWith('/api/trpc/'))return handleTrpc(request,url,path,env);
 if(path==='/api/seo')return handleSeoRest(request,env);
 if(!env.DB)return json({ok:false,code:'DATABASE_NOT_CONFIGURED'},503);
 try{
 if(path==='/api/enquiries/session'&&request.method==='GET'){
  const token=crypto.randomUUID()+crypto.randomUUID();await env.DB.prepare('INSERT INTO sessions(token,expires) VALUES(?,?)').bind(token,Date.now()+1800000).run();return json({ok:true,accepting:true,token});
 }
 if(path!=='/api/enquiries'||request.method!=='POST')return json({ok:false},404);
 const origin=request.headers.get('Origin');if(origin&&new URL(origin).origin!==url.origin)return json({ok:false,code:'ORIGIN'},403);
 const token=request.headers.get('X-Enquiry-Token')||'';
 if(!await env.DB.prepare('SELECT token FROM sessions WHERE token=? AND expires>?').bind(token,Date.now()).first())return json({ok:false,code:'TOKEN'},403);
 const ip=request.headers.get('CF-Connecting-IP')||'local',minute=Math.floor(Date.now()/60000);
 await env.DB.prepare('INSERT INTO rate_limits(ip,minute,count) VALUES(?,?,1) ON CONFLICT(ip) DO UPDATE SET count=CASE WHEN minute=excluded.minute THEN count+1 ELSE 1 END,minute=excluded.minute').bind(ip,minute).run();
 const rate=await env.DB.prepare('SELECT count FROM rate_limits WHERE ip=?').bind(ip).first();if(rate.count>10)return json({ok:false,code:'RATE_LIMIT'},429);
 if(Number(request.headers.get('Content-Length')||0)>6*1024*1024)return json({ok:false,code:'UPLOAD_TOO_LARGE'},413);
 const type=request.headers.get('Content-Type')||'';let fields={},files=[];
 if(type.includes('multipart/form-data')){const form=await request.formData();for(const[k,v]of form){if(typeof v==='string')fields[k]=v;else if(v.size)files.push(v)}}
 else if(type.includes('application/json'))fields=await request.json();
 else if(type.includes('application/x-www-form-urlencoded'))fields=Object.fromEntries(new URLSearchParams(await request.text()));
 else return json({ok:false,code:'UNSUPPORTED'},415);
 if(fields.website)return json({ok:true,id:'IGNORED',attachmentCount:0,duplicate:true});
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email||'')||!(fields.message||fields.productInterest))return json({ok:false,code:'INVALID'},422);
 if(files.length>5||files.reduce((n,f)=>n+f.size,0)>5*1024*1024||files.some(f=>f.size>2*1024*1024||!/\.(pdf|png|jpe?g|webp|dxf|dwg|step|stp)$/i.test(f.name)))return json({ok:false,code:'FILE_TOO_LARGE_OR_TYPE',error:'Up to 5 files, 2 MB each, 5 MB total.'},422);
 const key=request.headers.get('Idempotency-Key')||crypto.randomUUID();const prior=await env.DB.prepare('SELECT id FROM enquiries WHERE idempotency=?').bind(key).first();if(prior){if(env.OEM_NOTIFY){await env.DB.prepare('INSERT OR IGNORE INTO oem_notification_outbox(enquiry_id,updated_at) VALUES(?,?)').bind(prior.id,Date.now()).run();wakeNotifier(env,ctx,prior.id)}return json({ok:true,id:prior.id,reference:prior.id,duplicate:true,attachmentCount:(await env.DB.prepare('SELECT COUNT(*) AS n FROM attachments WHERE enquiry_id=?').bind(prior.id).first()).n,notification:env.OEM_NOTIFY?'queued':'not_configured'});}
 const id='ENQ-'+crypto.randomUUID();let statements=[env.DB.prepare('INSERT INTO enquiries(id,idempotency,received_at,payload) VALUES(?,?,?,?)').bind(id,key,new Date().toISOString(),JSON.stringify(fields))];
 for(const f of files){const aid=crypto.randomUUID(),bytes=new Uint8Array(await f.arrayBuffer());statements.push(env.DB.prepare('INSERT INTO attachments(id,enquiry_id,filename,mime,bytes) VALUES(?,?,?,?,?)').bind(aid,id,f.name,f.type,f.size));for(let i=0;i<bytes.length;i+=131072)statements.push(env.DB.prepare('INSERT INTO attachment_chunks(attachment_id,part,data) VALUES(?,?,?)').bind(aid,i/131072,bytes.slice(i,i+131072).buffer));}
 if(env.OEM_NOTIFY)statements.push(env.DB.prepare('INSERT OR IGNORE INTO oem_notification_outbox(enquiry_id,updated_at) VALUES(?,?)').bind(id,Date.now()));
 await env.DB.batch(statements);wakeNotifier(env,ctx,id);return json({ok:true,id,reference:id,attachmentCount:files.length,notification:env.OEM_NOTIFY?'queued':'not_configured',enquiry:{id,reference:id,attachmentCount:files.length}});
 }catch{return json({ok:false,code:'SAVE_FAILED'},500)}
 }};
