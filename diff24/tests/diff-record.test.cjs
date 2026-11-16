/* Run: node --test diff24/tests/diff-record.test.cjs */
const test = require('node:test');
const assert = require('node:assert/strict');
const { convert } = require('../diff-record.js');
const base = (operations, extra={}) => ({
  schema:'diff24-changeset-v1', comparisonId:'case-a', subject:'test',
  mode:'before_after', operations, ...extra
});
test('数値: 51800→48800の差を算出',()=>{
  const r=convert(base([{op:'REPLACE',scope:'metric',key:'price',oldValue:51800,value:48800,delta:-3000,unit:'円'}]));
  assert.equal(r.records[0].magnitude.delta,-3000);
  assert.equal(r.records[0].direction,'DECREASE');
});
test('CSV: 差分から実世界の削除を断定しない',()=>{
  const r=convert(base([{op:'REMOVE',scope:'csv',key:'row:2',oldValue:{id:'x'}}]));
  assert.equal(r.records[0].existence.state,'A_ONLY');
  assert.equal(r.guardrails.absence_is_not_real_world_deletion,true);
});
test('UNKNOWNを数値ゼロへ変換しない',()=>{
  const r=convert(base([{op:'UNKNOWN',scope:'metric',key:'battery',oldValue:'UNKNOWN',value:'88%'}]));
  assert.equal(r.records[0].magnitude.known,false);
  assert.equal(r.records[0].before.known,false);
  assert.equal(r.counts.review,1);
});
test('JSON nullは既知の値として保持',()=>{
  const r=convert(base([{op:'REPLACE',scope:'json',path:'/a',oldValue:null,value:5}]));
  assert.equal(r.records[0].before.known,true);
  assert.equal(r.records[0].before.value,null);
});
test('変更操作の欠損は要確認',()=>{
  const r=convert(base([{op:'REPLACE',scope:'text',key:'text:1',oldValue:'前'}]));
  assert.equal(r.counts.review,1);
  assert.equal(r.records[0].after.known,false);
});
test('結果を記録しても因果を断定しない',()=>{
  const r=convert(base([{op:'REPLACE',scope:'text',key:'1',oldValue:'a',value:'b'}]),{outcomeA:'返信なし',outcomeB:'返信あり'});
  assert.equal(r.records[0].consequence.status,'OUTCOME_PAIR_RECORDED');
  assert.equal(r.records[0].consequence.causal_claim,false);
});
test('結果未観測はUNKNOWNを維持',()=>{
  const r=convert(base([{op:'ADD',scope:'json',path:'/x',value:1}]));
  assert.equal(r.records[0].consequence.status,'UNKNOWN');
});
test('3-wayは独立アダプター待ちとして明示的に拒否',()=>{
  assert.throws(()=>convert(base([], {mode:'three_way'})),/THREE_WAY/);
});
test('未知の操作は黙って変換しない',()=>{
  assert.throws(()=>convert(base([{op:'SOLD'}])),/UNSUPPORTED/);
});
test('保存用入力原本や外部サービスへ書き込まない',()=>{
  const packet=base([{op:'REPLACE',scope:'metric',key:'stock',oldValue:3,value:1}]);
  const before=JSON.stringify(packet);
  const r=convert(packet);
  assert.equal(JSON.stringify(packet),before);
  assert.equal(r.records[0].evidence.externally_verified,false);
});
