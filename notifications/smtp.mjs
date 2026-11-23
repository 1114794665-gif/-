import { connect } from 'cloudflare:sockets';

// Fixed endpoints and addresses prevent request-controlled SMTP destinations.
export async function sendSmtp(password, raw, connectSocket = connect) {
  if (!password) throw Object.assign(Error('SMTP credential missing'), {code:'SMTP_NOT_CONFIGURED'});
  const address='niles@boomdrinkware.com';
  const socket=connectSocket({hostname:'smtp.qiye.aliyun.com',port:465},{secureTransport:'on'});
  const reader=socket.readable.getReader(),writer=socket.writable.getWriter();
  const decoder=new TextDecoder(),encoder=new TextEncoder();let buffer='',submitted=false;
  const timer=setTimeout(()=>socket.close().catch(()=>{}),20000);
  async function line(){while(!buffer.includes('\r\n')){const r=await reader.read();if(r.done)throw Error('SMTP connection closed');buffer+=decoder.decode(r.value,{stream:true});if(buffer.length>65536)throw Error('SMTP response too large');}const i=buffer.indexOf('\r\n'),s=buffer.slice(0,i);buffer=buffer.slice(i+2);return s;}
  async function reply(expected){let s;do{s=await line();if(!/^\d{3}[- ]/.test(s))throw Error('SMTP invalid response');}while(s[3]==='-');const n=Number(s.slice(0,3));if(n!==expected)throw Object.assign(Error('SMTP rejected command'),{code:'SMTP_'+n});}
  async function command(s,n){await writer.write(encoder.encode(s+'\r\n'));await reply(n);}
  try{
    await reply(220);await command('EHLO boomdrinkware.com',250);
    await command('AUTH LOGIN',334);await command(btoa(address),334);
    await command(btoa(unescape(encodeURIComponent(password))),235);
    await command('MAIL FROM:<'+address+'>',250);await command('RCPT TO:<'+address+'>',250);await command('DATA',354);
    const message=raw.replace(/^From:[^\r\n]*/m,'From: BOOM Drinkware <'+address+'>').replace(/\r?\n/g,'\r\n').replace(/^\./gm,'..');
    submitted=true;await command(message+'\r\n.',250);
    // QUIT failure after a 250 acknowledgement must never cause a duplicate.
    try{await command('QUIT',221);}catch{}
  }catch(e){if(submitted&&!/^SMTP_\d+$/.test(e.code||''))e.code='SMTP_DELIVERY_UNKNOWN';throw e;}
  finally{clearTimeout(timer);try{await socket.close();}catch{}}
}
