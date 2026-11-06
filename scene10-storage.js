/* Single-value atomic profile commit. No UI grant is published before setItem succeeds. */
(() => {
'use strict';
function create({read,write,adopt,lock}={}){let queue=Promise.resolve();
 function transact(transform){const perform=()=>{let prior,result;try{prior=read();result=transform(prior);if(JSON.stringify(result.state)!==JSON.stringify(prior)){result.state.profileRevision=(prior.profileRevision||0)+1;write(result.state,prior,result)}adopt(result.state);return {durable:true,...result}}catch(error){return {durable:false,error:error.message||'Storage unavailable',state:prior?structuredClone(prior):null}}};const task=()=>lock?lock(perform):perform();queue=queue.catch(()=>{}).then(task);return queue}
 return {save:(draftId,expected,at)=>transact(prior=>SquishyScene10Model.commit(prior,draftId,expected,at)),transact};
}
function browser(api){const key=api.storageKey;return create({read:()=>{const raw=localStorage.getItem(key);return raw?SquishyHubModel.normalize(JSON.parse(raw)):api.getState()},write:(next,prior,result)=>{const data=SquishyHubModel.serialize(next),backup=SquishyHubModel.serialize(prior);localStorage.setItem(key+'.rollback',backup);if(['import','reset','purge'].includes(result?.operation))localStorage.setItem(key+'.rollback.'+result.operation,backup);localStorage.setItem(key,data)},adopt:next=>api.adoptCommittedSnapshot(next),lock:globalThis.navigator?.locks?.request?fn=>navigator.locks.request('squishylab.profile.commit',{mode:'exclusive'},fn):null})}
globalThis.SquishyScene10Storage={create,browser};
})();
