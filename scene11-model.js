(() => {
'use strict';
const clone=s=>structuredClone(s),layout=s=>SquishyScene10Model.shelfLayout(s);
function pages(s){const a=layout(s);let last=a.length-1;while(last>=0&&!a[last])last--;return Math.max(1,Math.ceil((last+1)/6))}
function page(s,index){const a=layout(s);return Array.from({length:6},(_,i)=>{const id=a[index*6+i];return id?s.creations.find(c=>c.id===id)||null:null})}
function move(s,{creationId,source,destination,destinationId,revision}){const a=layout(s);if(revision!==(s.shelfLayoutRevision||0)||a[source]!==creationId||(a[destination]||null)!==(destinationId||null))throw Error('The shelf changed. Select your toy and try the move again.');if(!Number.isInteger(source)||!Number.isInteger(destination)||source<0||destination<0||destination>=Math.min(6000,(pages(s)+1)*6))throw Error('Choose a visible shelf slot');if(source===destination)return {state:clone(s),unchanged:true};const n=clone(s);a[source]=a[destination]||null;a[destination]=creationId;n.shelfLayout=a;n.shelfLayoutRevision=(n.shelfLayoutRevision||0)+1;return {state:n,creationId,destination}}
function remix(s,id,nonce){const n=SquishyScene10Model.remix(s,id,nonce),d=n.drafts[n.activeDraftId];d.lastStep=d.lastSafeStep='03';return {state:n,draftId:d.id}}
function fresh(s,nonce,seed){const n=SquishyScene03Model.ensure(SquishyHubModel.fresh(s,'draft-'+nonce,'creation-'+nonce,seed),nonce);return {state:n,draftId:n.activeDraftId}}
globalThis.SquishyScene11Model={layout,pages,page,move,remix,fresh};
})();
