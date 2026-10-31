(()=>{
"use strict";
const root="https://hiderock61.github.io";
const specs=[
{id:"akechi",url:"/akechi-os/",main:["script.js?v=051-safe1101","navigator.serviceWorker.register",'rel="manifest"'],more:[["/akechi-os/script.js?v=051-safe1101",["自動コピーできませんでした。上の文章欄"]],["/akechi-os/service-worker.js",["v051-shell-3","key.startsWith(PREFIX)"]]]},
{id:"hidero",url:"/hiderokusuke-remocon/",main:["ヒデロクスケ・リモコン v0.3","自動コピーできませんでした。画面の依頼文",'id="button-data"'],more:[]},
{id:"entry",url:"/anken-jirai-map/",main:["app.js?v=04g-safe1101b","/freelance-/#card-intake"],more:[["/anken-jirai-map/app.js?v=04g-safe1101b",["'【制作開始許可】'","function safeCardValue(","手動コピーができたら装備庫を開く"]]]},
{id:"gear",url:"/freelance-/",main:["script.js?v=2315-safe1101b",'id="project-card-import"'],more:[["/freelance-/script.js?v=2315-safe1101b",["const seenHeadings = new Set()", 'permission !== "確認済み" || questions !== "なし" || unknownItems !== "なし"',"function showManualCopy("]]]}
];
const $=id=>document.getElementById(id);
let report="";
async function read(path){
 try{const r=await fetch(root+path,{cache:"no-store",credentials:"omit"});
  if(!r.ok)return {ok:false,note:"HTTP "+r.status};
  return {ok:true,text:await r.text(),code:r.status};
 }catch(e){return {ok:false,note:String(e?.message||e)}}
}
async function inspect(s){
 const lines=[],sources=[root+s.url];
 let fail=false,hold=false;
 const r=await read(s.url);
 if(!r.ok)return{id:s.id,status:"HOLD",lines:["公開HTML取得不能: "+r.note],sources};
 lines.push("HTML HTTP "+r.code);
 for(const token of s.main){const pass=r.text.includes(token);lines.push((pass?"PASS ":"FAIL ")+token);if(!pass)fail=true;}
 if(s.id==="hidero"){
  const at=r.text.indexOf('id="button-data"'),head=r.text.indexOf(">",at),tail=r.text.indexOf("</script>",head);
  let count=0;try{if(at>=0&&head>=0&&tail>=0)count=JSON.parse(r.text.slice(head+1,tail)).length}catch(_){}
  lines.push((count===9?"PASS ":"FAIL ")+"役割ボタン "+count+"/9");if(count!==9)fail=true;
 }
 for(const [path,needles] of s.more){
  const x=await read(path);sources.push(root+path);
  if(!x.ok){lines.push("HOLD "+path+" "+x.note);hold=true;continue;}
  lines.push("JS HTTP "+x.code+" "+path);
  for(const token of needles){const pass=x.text.includes(token);lines.push((pass?"PASS ":"FAIL ")+token);if(!pass)fail=true;}
 }
 return{id:s.id,status:fail?"FAIL":hold?"HOLD":"PASS",lines,sources};
}
async function run(){
 $("run").disabled=true;$("copy").disabled=true;$("overall").textContent="公開版を読込中…";
 const results=[];
 try{
  for(const s of specs){
   const r=await inspect(s);results.push(r);
   $("state-"+s.id).textContent=r.status;$("state-"+s.id).className="state "+r.status.toLowerCase();
   $("detail-"+s.id).textContent=r.lines.join("\n");
  }
  const pass=results.filter(x=>x.status==="PASS").length,fail=results.filter(x=>x.status==="FAIL").length,hold=results.filter(x=>x.status==="HOLD").length;
  $("overall").textContent="公開ソース：PASS "+pass+"/4、FAIL "+fail+"、HOLD "+hold+"（実機操作は別検収）";
  report="本館4アプリ公開検収 / "+new Date().toISOString()+"\n"+$("overall").textContent+"\n"+results.map(x=>"\n"+x.id+" "+x.status+"\n"+x.lines.join("\n")+"\n"+x.sources.join("\n")).join("\n");
  $("report").value=report;$("copy").disabled=false;
 }catch(e){$("overall").textContent="検査器内部エラー: "+String(e?.message||e)}
 finally{$("run").disabled=false}
 return results;
}
$("run").addEventListener("click",run);
$("copy").addEventListener("click",async()=>{
 if(!report)return;
 try{if(!navigator.clipboard?.writeText)throw Error("not_supported");
  await navigator.clipboard.writeText(report);$("copy").textContent="コピーしました";
 }catch(_){$("report").focus();$("report").select();$("copy").textContent="下の全文を手動コピー"}
});
window.HiderockReleaseCheck={specs,read,inspect,run};
})();