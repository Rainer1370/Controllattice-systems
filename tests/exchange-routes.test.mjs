import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const {default:worker}=await import('../dist/server/index.js');
const environment={ASSETS:{fetch:async()=>new Response('Not found',{status:404})}};
const ctx={waitUntil(){},passThroughOnException(){}};
for(const route of ['/','/about','/products','/work','/ai','/outreach','/staff','/contact','/publications','/observable-machine','/discussions','/discussions/admin','/discussions/privacy'])test('render '+route,async()=>{const r=await worker.fetch(new Request('https://controllattice.com'+route,{headers:{accept:'text/html'}}),environment,ctx);assert.equal(r.status,200);const html=await r.text();assert.ok(html.length>1000);if(route==='/discussions')assert.match(html,/The Engineering/);if(route==='/contact')for(const term of ['Research or engineering collaboration','General question or technical discussion','Consulting or project inquiry','Product or technical support','Other'])assert.ok(html.includes(term));});
test('API missing binding fails closed',async()=>{const r=await worker.fetch(new Request('https://controllattice.com/api/exchange/session'),environment,ctx);assert.equal(r.status,503);});
test('contact transport is preserved',async()=>{const source=await readFile('app/contact/page.tsx','utf8');assert.match(source,/script\.google\.com\/macros/);assert.match(source,/method: "POST", body: data, mode: "no-cors"/);});
