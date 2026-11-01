(() => {
'use strict';
const shapes=['cube','blob','heart','star','cloud','bear','dumpling_s','dumpling_m','dumpling_l','dumpling_xl'],running=['aligning','flowing','cutoff','settling'];
const timing={align:300,ramp:200,volume:2700,cutoff:300,settle:300,maxDelta:100},draft=s=>s.drafts[s.activeDraftId];
function ensure(s){const n=structuredClone(s),d=draft(n);if(!d||!shapes.includes(d.recipe?.mouldId)||!['foam','gel','bounce'].includes(d.recipe.materialId))throw Error('A valid mould and material are required');if(!Number.isSafeInteger(d.bodyRevision)||d.bodyRevision<0)throw Error('Invalid recipe revision');
 d.fillProgress=Number.isFinite(d.fillProgress)?Math.min(1,Math.max(0,d.fillProgress)):0;
 if(d.fillSourceBodyRevision!==d.bodyRevision){d.fillProgress=0;d.fillSourceBodyRevision=null;d.filledBodyRevision=null}
 if(d.fillProgress<1)d.filledBodyRevision=null;
 d.pourState=d.fillProgress===1?(d.filledBodyRevision===d.bodyRevision?'filled':'settling'):(d.fillProgress>0?'paused':'ready');d.pourStageMs=0;
 d.fillCompletionEventIds=Array.isArray(d.fillCompletionEventIds)?[...new Set(d.fillCompletionEventIds.filter(x=>typeof x==='string'))]:[];
 d.lastStep='07';d.lastSafeStep='07';return n;
}
function start(s){const n=structuredClone(s),d=draft(n);if(!['ready','paused'].includes(d.pourState)||d.fillProgress>=1)return n;d.fillSourceBodyRevision=d.bodyRevision;d.pourState='aligning';d.pourStageMs=0;return n}
function pause(s){const n=structuredClone(s),d=draft(n);if(['aligning','flowing'].includes(d.pourState)){d.pourState=d.fillProgress>0?'paused':'ready';d.pourStageMs=0}else if(d.pourState==='cutoff'){d.pourState='settling';d.pourStageMs=0}return n}
function advance(s,elapsed){const n=structuredClone(s),d=draft(n);let dt=Number.isFinite(elapsed)?Math.min(timing.maxDelta,Math.max(0,elapsed)):0,completed=false;
 while(dt>1e-8&&running.includes(d.pourState)){
  const phase=d.pourState,stage=d.pourStageMs||0;
  if(phase==='aligning'){const used=Math.min(dt,timing.align-stage);d.pourStageMs+=used;dt-=used;if(d.pourStageMs>=timing.align){d.pourState='flowing';d.pourStageMs=0}}
  else if(phase==='flowing'){
   if(stage<timing.ramp){const used=Math.min(dt,timing.ramp-stage);d.pourStageMs+=used;dt-=used}
   else{const needed=(1-d.fillProgress)*timing.volume,used=Math.min(dt,needed);d.fillProgress=Math.min(1,d.fillProgress+used/timing.volume);d.pourStageMs+=used;dt-=used;if(d.fillProgress>=1-1e-10){d.fillProgress=1;d.pourState='cutoff';d.pourStageMs=0}}
  }else{const target=phase==='cutoff'?timing.cutoff:timing.settle,used=Math.min(dt,target-stage);d.pourStageMs+=used;dt-=used;if(d.pourStageMs>=target){d.pourStageMs=0;if(phase==='cutoff')d.pourState='settling';else{d.pourState='filled';d.filledBodyRevision=d.bodyRevision;const key=d.id+':'+d.bodyRevision+':fill';if(!d.fillCompletionEventIds.includes(key)){d.fillCompletionEventIds.push(key);completed=true}}}}
 }
 return {state:n,completed};
}
function canNext(s){const d=draft(s);return d?.pourState==='filled'&&d.fillProgress===1&&d.fillSourceBodyRevision===d.bodyRevision&&d.filledBodyRevision===d.bodyRevision}
function route(s,step){const n=pause(s);if(step==='08'&&!canNext(n))throw Error('Finish filling and settling first');draft(n).lastStep=step;draft(n).lastSafeStep=step;return n}
function presentation(s){const d=draft(s),phase=d.pourState,ms=d.pourStageMs||0;return {phase,progress:d.fillProgress,flow:phase==='flowing'?Math.min(1,ms/timing.ramp):phase==='cutoff'?Math.max(0,1-ms/timing.cutoff):0,jugFrame:phase==='filled'?7:phase==='aligning'?Math.min(3,Math.floor(ms/timing.align*4)):['flowing','cutoff'].includes(phase)?(d.fillProgress<.35?3:d.fillProgress<.7?4:5):d.fillProgress>0?6:0,running:running.includes(phase)}}
globalThis.SquishyScene07Model={shapes,timing,ensure,start,pause,advance,canNext,route,presentation,running};
})();
