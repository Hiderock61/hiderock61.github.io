"use strict";

/**
 * Inquiry Desk / Snowball 001
 * Client-side only. No fetch, analytics, credentials, persistent storage, or submission API.
 * For real enquiries: export a CSV from Jotform on the owner's device.
 * CSV input is never transferred to GitHub Pages or any external service.
 */

const TYPES = ["未分類", "制作", "資料", "データ", "商品", "料金", "その他"];
const PRIORITIES = ["未判定", "高", "中", "低"];
const STATES = ["新規", "確認中", "対応中", "保留", "完了"];
const SAMPLE = [
  {id:"Q001",date:"2026-10-13",body:"明日納品予定の商品の到着状況を知りたい",goal:"",email:"",category:"商品",priority:"高",status:"新規",source:"架空データ"},
  {id:"Q002",date:"2026-10-13",body:"法人利用の料金を教えてほしい",goal:"",email:"",category:"料金",priority:"低",status:"新規",source:"架空データ"},
  {id:"Q003",date:"2026-10-13",body:"請求額が見積と違うようです",goal:"",email:"",category:"料金",priority:"中",status:"対応中",source:"架空データ"},
  {id:"Q004",date:"2026-10-13",body:"契約番号の確認をお願いしたい",goal:"",email:"",category:"未分類",priority:"中",status:"新規",source:"架空データ"},
  {id:"Q005",date:"2026-10-12",body:"資料の送付ありがとうございました",goal:"",email:"",category:"その他",priority:"低",status:"完了",source:"架空データ"},
  {id:"Q006",date:"2026-10-13",body:"",goal:"",email:"",category:"制作",priority:"中",status:"新規",source:"架空データ"}
];

function assess(record) {
  if (!record.id.trim() || !(record.body + record.goal).trim()) return "INPUT_MISSING";
  if (record.category === "未分類" || record.priority === "未判定") return "NEEDS_REVIEW";
  if (record.priority === "高" && record.status !== "完了") return "URGENT_REVIEW";
  return "OK";
}

const TITLES = {
  INPUT_MISSING:"入力不足",
  NEEDS_REVIEW:"要確認",
  URGENT_REVIEW:"優先確認",
  OK:"正常"
};
const NEXT = {
  INPUT_MISSING:"受付内容・IDを確認",
  NEEDS_REVIEW:"種別・優先度を判断",
  URGENT_REVIEW:"担当者が優先確認",
  OK:"通常の対応手順へ"
};

function normalizeHeader(value) {
  return String(value || "").replace(/^\uFEFF/, "").trim().toLowerCase()
    .replace(/[\s\u3000_\-？?（）()：:]/g, "");
}

function findIndex(headers, terms) {
  const normalized = headers.map(normalizeHeader);
  const keys = terms.map(normalizeHeader);
  for (const key of keys) {
    const idx = normalized.findIndex(v => v === key);
    if (idx >= 0) return idx;
  }
  for (const key of keys) {
    const idx = normalized.findIndex(v => v.includes(key));
    if (idx >= 0) return idx;
  }
  return -1;
}

function parseCSV(text) {
  if (typeof text !== "string" || !text.trim()) throw Error("空のCSVです。");
  const result = [];
  let row = [], cell = "", quoted = false, ended = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i+1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"' && cell === "") {
      quoted = true;
    } else if (c === ",") {
      row.push(cell); cell = ""; ended = false;
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i+1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some(v=>v.trim() !== "")) result.push(row);
      row = []; ended = true;
    } else {
      cell += c; ended = false;
    }
    if (result.length > 501) throw Error("500件を超えるCSVには対応していません。");
  }
  if (quoted) throw Error("引用符が閉じていないCSVです。");
  if (!ended || row.length) {
    row.push(cell);
    if (row.some(v=>v.trim() !== "")) result.push(row);
  }
  if (!result.length) throw Error("CSVの見出し行がありません。");
  return result;
}

function csvRecords(content) {
  const parsed = parseCSV(content);
  const header = parsed[0];
  const idxBody = findIndex(header, ["今どうなっていますか","問い合わせ内容","ご相談内容","相談内容","現在の状況","message","description","本文"]);
  const idxGoal = findIndex(header, ["どうなれば助かりますか","理想の状態","希望すること","希望","goal"]);
  if (idxBody < 0 && idxGoal < 0) {
    throw Error("相談内容の列が見つかりません。Jotformから提出データのCSVを書き出してください。");
  }
  const idxId = findIndex(header, ["submission id","submissionid","提出id","回答id","案件id"]);
  const idxEmail = findIndex(header, ["返信先メールアドレス","email","メールアドレス"]);
  const idxDate = findIndex(header, ["submission date","submitted at","作成日時","送信日時","提出日時","date"]);
  const get = (row, idx) => idx < 0 ? "" : String(row[idx] || "").trim();
  const rows = parsed.slice(1);
  if (rows.length > 500) throw Error("500件を超えるCSVには対応していません。");
  if (!rows.length) throw Error("データ行がありません。");
  return rows.map((row, i) => ({
    id:get(row, idxId) || "CSV-" + String(i+1).padStart(4,"0"),
    date:get(row, idxDate),
    body:get(row, idxBody),
    goal:get(row, idxGoal),
    email:get(row, idxEmail),
    category:"未分類",
    priority:"未判定",
    status:"新規",
    source:"手元のCSV"
  }));
}

function csvCell(v) {
  let s = String(v === undefined || v === null ? "" : v);
  // Prevent spreadsheet formula injection when the exported CSV is opened.
  if (/^[\s\uFEFF]*[=+@\-\t\r]/.test(s)) s = "'" + s;
  return '"' + s.replace(/"/g, '""') + '"';
}

function recordsToCSV(items) {
  const cols = ["案件ID","送信日時","相談内容","希望","返信先メール","種別","優先度","対応状況","検品状態","次の動作","入力元"];
  const lines = [cols];
  for (const r of items) lines.push([
    r.id,r.date,r.body,r.goal,r.email,r.category,r.priority,r.status,
    assess(r),NEXT[assess(r)],r.source
  ]);
  return "\uFEFF" + lines.map(r => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

function summary(items) {
  const counts = {total:items.length,urgent:0,review:0,missing:0,ok:0};
  for (const item of items) {
    const a=assess(item);
    if (a === "URGENT_REVIEW") counts.urgent++;
    if (a === "NEEDS_REVIEW") counts.review++;
    if (a === "INPUT_MISSING") counts.missing++;
    if (a === "OK") counts.ok++;
  }
  return counts;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {assess, parseCSV, csvRecords, recordsToCSV, summary, SAMPLE};
}

if (typeof document !== "undefined") {
  let records = SAMPLE.map(r=>({...r}));
  const el = id=>document.getElementById(id);
  const make = (tag,className,textValue)=>{
    const n=document.createElement(tag);
    if(className)n.className=className;
    if(textValue!==undefined)n.textContent=textValue;
    return n;
  };
  function announce(text) {el("message").textContent=text;}
  function selector(title,choices,current,onChange) {
    const wrap=make("label");
    wrap.append(make("span",null,title));
    const sel=make("select");
    sel.setAttribute("aria-label",title);
    for(const value of choices) {
      const option=make("option",null,value);
      option.value=value;
      sel.append(option);
    }
    sel.value=current;
    sel.addEventListener("change",()=>onChange(sel.value));
    wrap.append(sel);
    return wrap;
  }
  function render() {
    const stats=summary(records);
    ["total","urgent","review","missing"].forEach(id=>el(id).textContent=String(stats[id]));
    const filter=el("filter").value;
    const rank={URGENT_REVIEW:0,INPUT_MISSING:1,NEEDS_REVIEW:2,OK:3};
    const filtered=records.map((r,i)=>({r,i,qa:assess(r)}))
      .filter(v=>filter==="ALL" || v.qa===filter)
      .sort((a,b)=>rank[a.qa]-rank[b.qa]);
    const target=el("records");
    target.replaceChildren();
    for(const {r,i,qa} of filtered) {
      const card=make("article","item");
      const top=make("div","item-head");
      const idBox=make("div");
      idBox.append(make("span","code",r.id+"　"+(r.date||"日付不明")));
      idBox.append(make("h3",null,(r.body||r.goal||"本文未入力").slice(0,90)));
      const badge=make("span","badge "+(qa==="OK"?"ok":qa==="URGENT_REVIEW"?"urgent":"review"),TITLES[qa]);
      top.append(idBox,badge);
      card.append(top);
      const body=make("p","item-body",r.body||"相談内容がありません");
      card.append(body);
      if(r.goal)card.append(make("p","small","希望："+r.goal));
      const inputs=make("div","record-fields");
      inputs.append(selector("種別",TYPES,r.category,v=>{records[i].category=v;render();}));
      inputs.append(selector("優先度",PRIORITIES,r.priority,v=>{records[i].priority=v;render();}));
      inputs.append(selector("対応状況",STATES,r.status,v=>{records[i].status=v;render();}));
      card.append(inputs);
      card.append(make("p","details","次の動作："+NEXT[qa]));
      const details=make("details","details");
      details.append(make("summary",null,"入力元・返信先など"));
      details.append(make("p",null,"入力元："+r.source+" / 返信先："+(r.email||"未入力")));
      card.append(details);
      target.append(card);
    }
    el("shown").textContent=filtered.length+"件を表示（全"+records.length+"件）";
    el("empty").style.display=filtered.length?"none":"block";
    el("export").disabled=records.length===0;
  }

  el("filter").addEventListener("change",render);
  el("reset").addEventListener("click",()=>{
    records=SAMPLE.map(r=>({...r}));
    el("csvFile").value="";
    el("filter").value="ALL";
    announce("架空6件のデモに戻しました。");
    render();
  });
  el("csvFile").addEventListener("change",async event=>{
    const file=event.target.files && event.target.files[0];
    if(!file)return;
    if(file.size>2*1024*1024) {announce("2MB以下のCSVだけ読み込めます。");return;}
    try {
      const content=await file.text();
      const next=csvRecords(content);
      records=next;
      el("filter").value="ALL";
      announce(next.length+"件を端末内で読み込みました。Jotformへの同期は行っていません。");
      render();
    } catch(e) {announce("読み込みできません："+e.message);}
  });
  el("export").addEventListener("click",()=>{
    const blob=new Blob([recordsToCSV(records)],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const link=make("a");
    link.href=url;
    link.download="inquiry-qa-results.csv";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    announce("今表示しているデータの検品結果をCSVとして保存しました。外部送信はしていません。");
  });
  render();
}
