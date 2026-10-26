import {test} from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../app/learn/scenarios.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const {scenarios,repairMatches}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
for(const level of ['explorer','engineer']){
 test(`${level}: repair controls can reach every valid target and reject invalid settings`,()=>{
  const missions=scenarios(level); assert.equal(missions.length,3);
  for(const m of missions){assert.ok(m.target>=m.min&&m.target<=m.max);assert.equal((m.target-m.min)%m.step,0);assert.ok(repairMatches(m,m.target));assert.ok(!repairMatches(m,m.target+m.step));assert.ok(!repairMatches(m,NaN));assert.ok(m.correct>=0&&m.correct<m.options.length);assert.ok(m.transfer.correct>=0&&m.transfer.correct<m.transfer.options.length)}
 });
 test(`${level}: repairs match independent physical calculations`,()=>{
  const [solar,plants,rover]=scenarios(level);
  assert.equal((level==='engineer'?800:600)*solar.target/100,level==='engineer'?600:450);
  assert.equal(level==='engineer'?30+plants.target:plants.target,level==='engineer'?70:50);
  assert.equal((level==='engineer'?2.5:2)*rover.target,level==='engineer'?150:60);
 });
 test(`${level}: transfer answer keys match independently calculated answers`,()=>{
  const [solar,plants,rover]=scenarios(level);
  assert.equal(solar.transfer.options[solar.transfer.correct],level==='engineer'?`${900/1200*100}%`:`${400*3/4} W`);
  assert.equal(plants.transfer.options[plants.transfer.correct],level==='engineer'?`+${60-25} points`:'It can reduce the oxygen available to roots.');
  assert.equal(rover.transfer.options[rover.transfer.correct],level==='engineer'?`${90/1.5} s`:`${3*20} m`);
 });
}
test('published worker serves the learning pilot and both entry links',async()=>{
 const {default:worker}=await import('../dist/server/index.js');
 for(const path of ['/learn','/','/products']){
  const response=await worker.fetch(new Request('http://localhost'+path,{headers:{accept:'text/html'}}),{ASSETS:{fetch:async()=>new Response('Not found',{status:404})}},{waitUntil(){},passThroughOnException(){}});
  assert.equal(response.status,200,path);
  const html=await response.text();
  if(path==='/learn'){assert.match(html,/Launch mission/);assert.match(html,/Choose your challenge/);assert.match(html,/controllattice.com\/learn/);assert.match(html,/No learner accounts/)}else{assert.match(html,/href="\/learn"/);assert.match(html,/Play Station Rescue/)}
 }
});
