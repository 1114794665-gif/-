// Rebuild the exact approved public bundle without restoring historical routes.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),out=process.argv[2]&&path.resolve(process.argv[2]);
if(!out||fs.existsSync(out)||out===root||out.startsWith(root+path.sep))throw Error('Supply a new output directory outside the source repository');
const manifest=require('./approved-release-20261126.json');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const buffers=[];
for(const f of manifest.files){let b=fs.readFileSync(path.join(root,'site',f.path));if(digest(b)!==f.sha256&&/\.(?:html|js|cjs|mjs|json|css|txt|xml|svg|csv|md)$/.test(f.path)){const lf=Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'));if(digest(lf)===f.sha256)b=lf;else{const crlf=Buffer.from(lf.toString('utf8').replace(/\n/g,'\r\n'));if(digest(crlf)===f.sha256)b=crlf;}}if(digest(b)!==f.sha256)throw Error('Release hash mismatch: '+f.path);buffers.push(b);}
for(let i=0;i<manifest.files.length;i++){const dst=path.join(out,manifest.files[i].path);fs.mkdirSync(path.dirname(dst),{recursive:true});fs.writeFileSync(dst,buffers[i]);}
console.log('Verified and assembled '+manifest.files.length+' public files; '+manifest.pages+' sitemap pages');
