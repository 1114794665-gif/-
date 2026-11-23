const fs=require('fs'),p=require('path');
const zhNew='最多5个文件 · 单个2MB以内 · 总计5MB以内。支持PNG/JPG/WEBP、PDF、DXF/DWG和STEP/STP。提交后，附件随询盘保存。';
const enNew='Up to 5 files · 2 MB each · 5 MB total. Supported: PNG/JPG/WEBP, PDF, DXF/DWG and STEP/STP. Attachments are saved with your enquiry after submission.';
module.exports=function(out){
 const urls=[...fs.readFileSync(p.join(out,'sitemap.xml'),'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname);const files=new Set();for(const route of urls){const rel=route.replace(/^\//,'')+'index.html';files.add(rel);const h=fs.readFileSync(p.join(out,rel),'utf8');for(const m of h.matchAll(/<script[^>]*src="(\/assets\/[^"?]+\.js)/g))files.add(m[1].slice(1))}
 const uploaderScripts=new Set();let scripts=0;for(const rel of files){const file=p.join(out,rel);if(!fs.existsSync(file))throw Error('Missing active asset: '+rel);let text=fs.readFileSync(file,'utf8'),old=text;
 text=text.replaceAll('10 MB each','2 MB each').replaceAll('25 MB total','5 MB total').replaceAll('单个10MB以内','单个2MB以内').replaceAll('总计25MB以内','总计5MB以内').replace(/最多10个文件 · 单个20MB以内 · 总计50MB以内。支持PNG\/JPG\/WEBP、PDF、AI\/EPS\/PSD\/SVG、ZIP及Office／文本文件。提交后，附件随询盘保存。/g,zhNew).replace(/Up to 10 files · 20 MB each · 50 MB total\. Supported: PNG\/JPG\/WEBP, PDF, AI\/EPS\/PSD\/SVG, ZIP and Office\/text files\. Attachments are saved with your enquiry after submission\./g,enNew).replaceAll('.png,.jpg,.jpeg,.webp,.pdf,.ai,.eps,.psd,.svg,.zip,.doc,.docx,.xls,.xlsx,.txt','.png,.jpg,.jpeg,.webp,.pdf,.dxf,.dwg,.step,.stp');
 if(rel.endsWith('.js')){const components=[...text.matchAll(/function(?:\s+[\w$]+)?\s*\(\{[^}]*\bonFiles\b[^}]*\}\)\s*\{/g)];for(const component of components.reverse()){
  const start=component.index,bodyStart=start+component[0].length-1;let depth=0,quote=null,escaped=false,end=-1;for(let i=bodyStart;i<text.length;i++){const ch=text[i];if(quote){if(escaped){escaped=false;continue}if(ch==='\\'){escaped=true;continue}if(ch===quote)quote=null;continue}if(ch==='"'||ch==="'"||ch==='\x60'){quote=ch;continue}if(ch==='{')depth++;if(ch==='}'&&--depth===0){end=i+1;break}}
  if(end<0)throw Error('Cannot locate uploader end: '+rel);let part=text.slice(start,end);if(!part.includes('buyer-artwork-box'))continue;
  const loop=part.match(/for\s*\(\s*const\s+(\w+)\s+of\s+Array\.from\([^)]*\)\s*\)/);if(!loop)throw Error('Unknown active uploader loop: '+rel);
  const fileVar=loop[1],arrayVar=(part.match(/(\w+)\.some\(/)||[])[1],messageVar=(part.match(/(\w+)\.push\([^;]{0,200}(?:Unsupported|不支持|exceeds|超过)/)||[])[1]||((part.match(/(?:let|const)[^;]*?\b(\w+)\s*=\s*\[\]/)||[])[1]);if(!arrayVar||!messageVar)throw Error('Unknown active uploader state: '+rel);
  part=part.replace(/(\b\w+\.size\s*>\s*)(?:10|20|2)\s*\*\s*1024\s*\*\s*1024/g,'$12*1024*1024').replace(/(\b\w+\.size\s*>\s*)(?:10485760|20971520|2097152)\b/g,'$12*1024*1024').replace(/>\s*(?:25|50|5)\s*\*\s*1024\s*\*\s*1024/g,'>5*1024*1024').replace(/>\s*(?:26214400|52428800|5242880)\b/g,'>5*1024*1024').replace(/(\b\w+)\.length\s*>=\s*(?:10|5)\b/g,'$1.length>=5');
  const open=part.indexOf('{',loop.index+loop[0].length);if(open<0)throw Error('Unknown uploader body: '+rel);let guard='';
  if(!new RegExp(arrayVar+'\\.length\\s*>=\\s*5').test(part))guard+='if('+arrayVar+'.length>=5){'+messageVar+'.push("Up to 5 files are allowed.");break;}';
  if(!part.includes('test('+fileVar+'.name)')||!part.includes('dxf'))guard+='if(!/\\.(pdf|png|jpe?g|webp|dxf|dwg|step|stp)$/i.test('+fileVar+'.name)){'+messageVar+'.push("Unsupported file type: "+'+fileVar+'.name);continue;}';
  part=part.slice(0,open+1)+guard+part.slice(open+1);
  part=part.replaceAll('不能超过20MB','不能超过2MB').replaceAll('不能超过10MB','不能超过2MB').replaceAll('exceeds 20 MB','exceeds 2 MB').replaceAll('exceeds 10 MB','exceeds 2 MB').replaceAll('最多添加10个文件','最多添加5个文件').replaceAll('up to 10 files','up to 5 files').replaceAll('不能超过50MB','不能超过5MB').replaceAll('不能超过25MB','不能超过5MB').replaceAll('total 50 MB','total 5 MB').replaceAll('total 25 MB','total 5 MB').replaceAll('20 MB each','2 MB each').replaceAll('10 MB each','2 MB each').replaceAll('50 MB total','5 MB total').replaceAll('25 MB total','5 MB total');
  if(!new RegExp(fileVar+'\\.size>2\\*1024\\*1024').test(part)||!part.includes('>5*1024*1024')||!part.includes(arrayVar+'.length>=5'))throw Error('Active uploader contract failed: '+rel);
  text=text.slice(0,start)+part+text.slice(end);scripts++;uploaderScripts.add(rel);
 }}
 if(text!==old)fs.writeFileSync(file,text);
 }
 for(const rel of files){if(!rel.endsWith('.html'))continue;const file=p.join(out,rel);let html=fs.readFileSync(file,'utf8'),before=html;html=html.replace(/(<script\b[^>]*src=")(\/assets\/[^"?]+\.js)(?:\?[^"]*)?("[^>]*>)/g,(all,a,url,b)=>uploaderScripts.has(url.slice(1))?a+url+'?v=upload-contract-20261123'+b:all);if(html!==before)fs.writeFileSync(file,html)}
 if(!scripts)throw Error('No active inquiry uploader found');console.log('Cloudflare inquiry limits validated in '+scripts+' active scripts (2MB / 5MB / 5 files)');
};
