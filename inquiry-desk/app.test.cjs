"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { assess,parseCSV,csvRecords,recordsToCSV,summary,SAMPLE } = require("./app.js");

test("six fictional submissions classify into three OK and three exceptions",()=>{
  assert.deepEqual(summary(SAMPLE),{total:6,urgent:1,review:1,missing:1,ok:3});
  assert.equal(assess(SAMPLE[0]),"URGENT_REVIEW");
  assert.equal(assess(SAMPLE[3]),"NEEDS_REVIEW");
  assert.equal(assess(SAMPLE[5]),"INPUT_MISSING");
});
test("Jotform Japanese CSV import with quoted commas and line breaks",()=>{
  const csv='Submission ID,Submission Date,今どうなっていますか？,どうなれば助かりますか？,返信先メールアドレス\r\n' +
  '101,2026-10-13,"見積を依頼, 確認中","納期を知りたい\nです",test@example.com\r\n';
  const rec=csvRecords(csv);
  assert.equal(rec.length,1);
  assert.equal(rec[0].id,"101");
  assert.equal(rec[0].body,"見積を依頼, 確認中");
  assert.equal(rec[0].goal,"納期を知りたい\nです");
  assert.equal(rec[0].email,"test@example.com");
  assert.equal(assess(rec[0]),"NEEDS_REVIEW");
});
test("CSV import fails closed if message column is absent",()=>{
  assert.throws(()=>csvRecords("商品,料金\nA,100\n"),/相談内容の列/);
});
test("CSV parser rejects unclosed quotes",()=>{
  assert.throws(()=>parseCSV('id,相談内容\n1,"本文'),/引用符/);
});
test("CSV export neutralizes spreadsheet formulas",()=>{
  const rec=[{...SAMPLE[0],body:"=HYPERLINK(\"https://example.com\")",email:"+123456"}];
  const exported=recordsToCSV(rec);
  assert.ok(exported.includes("'=HYPERLINK"));
  assert.ok(exported.includes("'+123456"));
});
test("HIGH priority closing switches from urgent to OK",()=>{
  assert.equal(assess({...SAMPLE[0],status:"完了"}),"OK");
});
