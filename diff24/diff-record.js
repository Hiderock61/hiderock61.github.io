/* 差分24時 v12.0 PROBE | 既存v11.0のChange Setを共通DIFF RECORDへ変換。保存・送信・外部通信なし。 */

(function(root,factory){

  const api=factory();

  if(typeof module!=='undefined'&&module.exports)module.exports=api;

  else root.Diff24Record=api;

})(typeof globalThis!=='undefined'?globalThis:this,function(){

  'use strict';

function owns(o,k){return Object.prototype.hasOwnProperty.call(o,k)}

function finite(v){return typeof v==="number"&&Number.isFinite(v)}

function outcomeState(v){return v!==null&&v!==undefined&&String(v).trim()!==""&&!["UNKNOWN","未確認","不明","未観測","結果未観測"].includes(String(v).trim())}

function adaptOne(op,i,ctx){
  if(!op||typeof op!=="object")throw Error("OPERATION_NOT_OBJECT");
  const valid=["ADD","REMOVE","REPLACE","TYPE_CHANGE","UNKNOWN"];
  if(!valid.includes(op.op))throw Error("UNSUPPORTED_OPERATION:"+String(op.op));
  const oldKnown=owns(op,"oldValue")&&op.op!=="UNKNOWN";
  const newKnown=owns(op,"value")&&op.op!=="UNKNOWN";
  const needsBefore=["REMOVE","REPLACE","TYPE_CHANGE"].includes(op.op);
  const needsAfter=["ADD","REPLACE","TYPE_CHANGE"].includes(op.op);
  const incomplete=(needsBefore&&!oldKnown)||(needsAfter&&!newKnown);
  const existence=incomplete||op.op==="UNKNOWN"?"UNKNOWN":op.op==="ADD"?"B_ONLY":op.op==="REMOVE"?"A_ONLY":"BOTH";
  const delta=!incomplete&&finite(op.delta)?op.delta:(!incomplete&&oldKnown&&newKnown&&finite(op.oldValue)&&finite(op.value)?op.value-op.oldValue:null);
  const direction=incomplete||op.op==="UNKNOWN"?"UNKNOWN":op.op==="ADD"?"APPEARED_IN_B":op.op==="REMOVE"?"ABSENT_IN_B":op.op==="TYPE_CHANGE"?"TYPE_CHANGED":delta===null?"CHANGED_UNQUANTIFIED":delta>0?"INCREASE":delta<0?"DECREASE":"UNCHANGED_NUMBER";
  const scope=typeof op.scope==="string"&&op.scope?op.scope:"unspecified";
  const path=String(op.path??op.key??op.label??("op:"+String(i+1)));
  return {
    id:String(ctx.comparisonId??"unidentified")+":"+String(i+1),
    existence:{state:existence,referent:"compared_inputs_only"},
    location:{scope,path},
    direction,
    magnitude:delta===null?{known:false}:{known:true,delta,absolute:Math.abs(delta),unit:String(op.unit??""),percent:finite(op.percent)?op.percent:null},
    time:{comparison_observed_at:ctx.observedAt??null,before_observed_at:ctx.observedAtA??null,after_observed_at:ctx.observedAtB??null},
    before:{known:oldKnown,value:oldKnown?op.oldValue:null},
    after:{known:newKnown,value:newKnown?op.value:null},
    consequence:{
      status:outcomeState(ctx.outcomeA)&&outcomeState(ctx.outcomeB)?"OUTCOME_PAIR_RECORDED":outcomeState(ctx.outcomeA)||outcomeState(ctx.outcomeB)?"PARTIAL_OUTCOME":"UNKNOWN",
      before:outcomeState(ctx.outcomeA)?ctx.outcomeA:null,after:outcomeState(ctx.outcomeB)?ctx.outcomeB:null,
      causal_claim:false
    },
    operation:op.op,
    evidence:{reference:ctx.evidence??null,externally_verified:false},
    note:op.note??null,
    review_required:op.op==="UNKNOWN"||incomplete
  };
}

function convert(packet,ctx={}){
  if(!packet||packet.schema!=="diff24-changeset-v1"||!Array.isArray(packet.operations))throw Error("INVALID_CHANGESET");
  if(packet.operations.length>10000)throw Error("TOO_MANY_OPERATIONS");
  const merged={
    ...ctx,comparisonId:packet.comparisonId??ctx.comparisonId??null,
    subject:packet.subject??ctx.subject??"",caseType:packet.caseType??ctx.caseType??"",
    mode:packet.mode??ctx.mode??"ab",revision:packet.revision??null,
    parentId:packet.parentId??null,createdAt:packet.createdAt??null
  };
  if(merged.mode==="three_way")throw Error("THREE_WAY_NEEDS_SEPARATE_ADAPTER");
  const records=packet.operations.map((op,i)=>adaptOne(op,i,merged));
  const counts={added:0,removed:0,changed:0,unknown:0,review:0};
  for(const r of records){
    if(r.operation==="ADD")counts.added++;
    else if(r.operation==="REMOVE")counts.removed++;
    else if(r.operation==="UNKNOWN")counts.unknown++;
    else counts.changed++;
    if(r.review_required)counts.review++;
  }
  return {
    schema:"diff24-record-batch-v1",adapter_version:"12.0-probe",
    origin:"DIFF24_CHANGESET",source_schema:packet.schema,
    comparison:{id:merged.comparisonId,subject:String(merged.subject),case_type:String(merged.caseType),mode:String(merged.mode),revision:merged.revision,parent_id:merged.parentId,created_at:merged.createdAt},
    counts,records,
    guardrails:{
      scope:"INPUT_SNAPSHOT_COMPARISON",
      absence_is_not_real_world_deletion:true,
      observed_outcome_is_not_causation:true,
      source_evidence_not_independently_verified:true,
      unsupported:"3-way adapter and image pixel maps are not included in v12 first increment"
    }
  };
}

  return Object.freeze({convert,adaptOne});

});
