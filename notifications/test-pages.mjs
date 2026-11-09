import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import worker from '../cloudflare-worker.js';
const sql=new DatabaseSync(':memory:');
sql.exec(await fs.readFile(new URL('../cloudflare-schema.sql',import.meta.url),'utf8'));
sql.exec(await fs.readFile(new URL('./schema.sql',import.meta.url),'utf8'));
function prepare(query){let args=[];const statement={bind(...v){args=v;return statement;},async run(){return sql.prepare(query).run(...args);},async first(){return sql.prepare(query).get(...args)||null;},async all(){return {results:sql.prepare(query).all(...args)};}};return statement;}
const DB={prepare,async batch(statements){sql.exec('BEGIN');try{for(const s of statements)await s.run();sql.exec('COMMIT');}catch(e){sql.exec('ROLLBACK');throw e;}}};
sql.prepare('INSERT INTO sessions VALUES(?,?)').run('DUMMY-UNIT-TEST-ONLY',Date.now()+60000);
let tasks=[],wakeups=0;const ctx={waitUntil(p){tasks.push(p);}};
const env={DB,OEM_NOTIFY:{async fetch(){wakeups++;throw Error('simulated notifier outage');}}};
const req=key=>new Request('https://preview.example/api/enquiries',{method:'POST',headers:{'Content-Type':'application/json','X-Enquiry-Token':'DUMMY-UNIT-TEST-ONLY','Idempotency-Key':key},body:JSON.stringify({email:'qa@example.com',message:'QA TEST ONLY'})});
let response=await worker.fetch(req('with-notifier'),env,ctx);assert.equal(response.status,200);let receipt=await response.json();assert.equal(receipt.ok,true);assert.equal(receipt.notification,'queued');await Promise.all(tasks);
assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM enquiries').get().n,1);assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM oem_notification_outbox').get().n,1);
response=await worker.fetch(req('with-notifier'),env,ctx);const duplicate=await response.json();assert.equal(duplicate.id,receipt.id);assert.equal(duplicate.duplicate,true);assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM oem_notification_outbox').get().n,1);await Promise.all(tasks);
response=await worker.fetch(req('without-notifier'),{DB},ctx);receipt=await response.json();assert.equal(receipt.ok,true);assert.equal(receipt.notification,'not_configured');assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM enquiries').get().n,2);
assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM oem_notification_outbox').get().n,1);
console.log('PASS: atomic enquiry/outbox storage; notifier outage preserves receipt and pending job; duplicate suppression; absent binding preserves existing behavior.');
