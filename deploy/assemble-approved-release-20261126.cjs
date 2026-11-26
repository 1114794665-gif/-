// Rebuild the exact approved public bundle without restoring historical routes.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),out=process.argv[2]&&path.resolve(process.argv[2]);
if(!out||fs.existsSync(out)||out===root||out.startsWith(root+path.sep))throw Error('Supply a new output directory outside the source repository');
const manifest=require('./approved-release-20261126.json');
for(const f of manifest.files){const src=path.join(root,'site',f.path),b=fs.readFileSync(src);if(crypto.createHash('sha256').update(b).digest('hex')!==f.sha256)throw Error('Release hash mismatch: '+f.path);}
for(const f of manifest.files){const dst=path.join(out,f.path);fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(path.join(root,'site',f.path),dst);}
console.log('Verified and assembled '+manifest.files.length+' public files; '+manifest.pages+' sitemap pages');
