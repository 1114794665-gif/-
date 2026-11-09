const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const esbuild=require('esbuild');
const root=path.resolve(__dirname,'..');
const baseline=path.resolve(process.argv[2]||'');
const out=path.resolve(process.argv[3]||'');
if(!process.argv[2]||!process.argv[3]||baseline===out||fs.existsSync(out))throw Error('Supply an existing production baseline and a new output directory');
const plan=require('./oem-copy-20261109.json');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const baseWorker=fs.readFileSync(path.join(baseline,'_worker.js'),'utf8');
const start=baseWorker.indexOf('var json = (v, status = 200) => Response.json');
const end=baseWorker.indexOf('async function applyPublicResponsePolicy');
if(start<0||end<start||!baseWorker.includes('await cms(request, env)'))throw Error('Unrecognized production CMS worker; inspect before proceeding');
console.log('Copying current production baseline...');
fs.cpSync(baseline,out,{recursive:true});
let inquiry=fs.readFileSync(path.join(root,'cloudflare-worker.js'),'utf8').replace('const json=','const inquiryJson=').replaceAll('return json(','return inquiryJson(').replace('export default','const publicApp =');
fs.writeFileSync(path.join(out,'_worker.js'),baseWorker.slice(0,start)+inquiry+'\n\n'+baseWorker.slice(end));
let html=fs.readFileSync(path.join(out,'oem-manufacturer/index.html'),'utf8');
const oemAsset=/src="(\/assets\/ec-oem-patch[^"?]+\.js)/.exec(html)?.[1];
const directAsset=/src="(\/assets\/ec-direct-links[^"?]+\.js)/.exec(html)?.[1];
if(!oemAsset||!directAsset)throw Error('Missing production script references');
html=html.replace(/<title>[\s\S]*?<\/title>/,'<title>'+plan.title+'</title>');
html=html.replace(/<h1\b([^>]*)>[\s\S]*?<\/h1>/,'<h1$1>'+plan.h1+'</h1>');
html=html.replace(/<meta\b[^>]*>/g,tag=>{const key=/(?:name|property)="([^"]+)"/.exec(tag)?.[1];const item=plan.metas.find(m=>(m.property||m.name)===key);return item?tag.replace(/content="[^"]*"/,'content="'+item.content+'"'):tag;});
html=html.replace(/(<script[^>]*type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/g,(whole,a,b,c)=>{try{const old=JSON.parse(b);const item=plan.schemas.find(s=>s['@type']===old['@type']);return item?a+JSON.stringify(item)+c:whole;}catch{return whole;}});
const replacements=[];
for(const [old,next] of plan.pairs){
 if(old==='From your brief.'||old==='To your branded product.'||old.includes('Silicone and Plastic Manufacturing |'))continue;
 const re=old==='OEM / ODM'?new RegExp('(<strong\\b[^>]*>)'+escape(old)+'(</strong>)','g'):new RegExp('>(\\s*)'+escape(old)+'(\\s*)<','g');
 let count=0;html=html.replace(re,(whole,a,b)=>{count++;return old==='OEM / ODM'?a+next+b:'>'+a+next+b+'<';});
 replacements.push({old,count});
}
if(/As fast as 1 day|Does one-day sampling/.test(html))throw Error('Outdated sample claim remains');
fs.writeFileSync(path.join(out,'oem-manufacturer/index.html'),html);
const oemCode=esbuild.transformSync(fs.readFileSync(path.join(root,'site/assets/ec-oem-patch-20261029.js'),'utf8'),{minify:true,target:'es2022'}).code;
const directCode=fs.readFileSync(path.join(baseline,directAsset.slice(1)),'utf8')+plan.receiptPatch;
const newOem='/assets/ec-oem-patch-seo-'+hash(oemCode).slice(0,12)+'.js';
const newDirect='/assets/ec-direct-links-seo-'+hash(directCode).slice(0,12)+'.js';
fs.writeFileSync(path.join(out,newOem.slice(1)),oemCode);fs.writeFileSync(path.join(out,newDirect.slice(1)),directCode);
let touched=0;function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,item.name);if(item.isDirectory())walk(p);else if(p.endsWith('.html')){const old=fs.readFileSync(p,'utf8');const next=old.split(oemAsset).join(newOem).split(directAsset).join(newDirect);if(next!==old){fs.writeFileSync(p,next);touched++;}}}}walk(out);
const cmsAssets=fs.readdirSync(path.join(baseline,'assets')).filter(n=>n.startsWith('boom-cms'));
for(const name of cmsAssets){if(hash(fs.readFileSync(path.join(baseline,'assets',name)))!==hash(fs.readFileSync(path.join(out,'assets',name))))throw Error('CMS asset changed: '+name);}
const finalWorker=fs.readFileSync(path.join(out,'_worker.js'),'utf8');
if(!finalWorker.startsWith(baseWorker.slice(0,start))||!finalWorker.endsWith(baseWorker.slice(end)))throw Error('CMS or public response policy changed');
const manifest={baseline,output:out,cmsAssetsPreserved:cmsAssets,backendPrefixSha256:hash(baseWorker.slice(0,start)),publicPolicySha256:hash(baseWorker.slice(end)),newOem,newDirect,htmlReferencesUpdated:touched,replacements};
fs.writeFileSync(out+'.manifest.json',JSON.stringify(manifest,null,2));
console.log(JSON.stringify({cmsAssetsPreserved:cmsAssets.length,htmlReferencesUpdated:touched,output:out}));

