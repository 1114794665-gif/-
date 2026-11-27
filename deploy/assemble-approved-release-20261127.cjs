const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),out=process.argv[2]&&path.resolve(process.argv[2]);
if(!out||fs.existsSync(out)||out===root||out.startsWith(root+path.sep))throw Error('Supply a new output directory outside the repository');
const m=require('./approved-release-20261127.json'),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const buffers=m.files.map(f=>{let b=fs.readFileSync(path.join(root,'site',f.path));if(hash(b)!==f.sha256){const lf=Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'));const crlf=Buffer.from(lf.toString('utf8').replace(/\n/g,'\r\n'));if(hash(lf)===f.sha256)b=lf;else if(hash(crlf)===f.sha256)b=crlf;}if(hash(b)!==f.sha256)throw Error('Hash mismatch: '+f.path);return b;});
m.files.forEach((f,i)=>{const p=path.join(out,f.path);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,buffers[i]);});console.log('Assembled '+m.files.length+' verified public files');
