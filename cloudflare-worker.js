const json=(v,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});

const wakeNotifier = (env, ctx, id) => {
 if (!env.OEM_NOTIFY) return;
 const task = env.OEM_NOTIFY.fetch('https://internal/enqueue', {
  method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id})
 }).then(r=>{if(!r.ok)throw new Error('NOTIFIER_UNAVAILABLE');}).catch(()=>{});
 if(ctx&&ctx.waitUntil)ctx.waitUntil(task);
};

export default {async fetch(request,env,ctx){
 const url=new URL(request.url),path=url.pathname;
 if(path==='/api/products')return env.ASSETS.fetch(new Request(new URL('/data/api-products-snapshot.json',url),{method:'GET'}));
 if(!path.startsWith('/api/'))return env.ASSETS.fetch(request);
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
