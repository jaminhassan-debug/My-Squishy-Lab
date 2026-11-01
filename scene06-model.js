(() => {
'use strict';
const families={foil_star:{label:'Foil stars',category:'sparkle',subtypes:['star'],frames:[0]},foil_heart:{label:'Foil hearts',category:'sparkle',subtypes:['heart'],frames:[1]},pearl:{label:'Pearls',category:'beads',subtypes:['pearl'],frames:[2]},sprinkle:{label:'Sprinkles',category:'beads',subtypes:['sprinkle'],frames:[3]},fruit:{label:'Fruit slices',category:'charms',subtypes:['strawberry','kiwi','orange'],frames:[4,5,6]},gem:{label:'Gems',category:'charms',subtypes:['round','diamond'],frames:[7,8]}};
const categories=['sparkle','beads','charms'],amounts=[8,16,24],draft=s=>s.drafts[s.activeDraftId];
function validBatch(b){return b&&typeof b.id==='string'&&families[b.familyId]?.subtypes.includes(b.subtype)&&amounts.includes(b.amount)&&Number.isSafeInteger(b.seedOffset)&&b.seedOffset>=0}
function ensure(s){const n=structuredClone(s),d=draft(n);if(!d)throw Error('A creation draft is required');const r=d.recipe;
 r.batches??=Array.isArray(r.inclusions)?structuredClone(r.inclusions):[];
 if(!Array.isArray(r.batches)||r.batches.length>6||r.batches.some(b=>!validBatch(b))||new Set(r.batches.map(b=>b.id)).size!==r.batches.length||r.batches.reduce((sum,b)=>sum+b.amount,0)>120)throw Error('The ingredient recipe needs recovery. Original data retained.');
 r.inclusions=structuredClone(r.batches);d.lastStep='06';d.lastSafeStep='06';
 n.profile.discoveryMetrics={...n.profile.discoveryMetrics,inclusionFamilies:[...new Set((n.profile.discoveryMetrics?.inclusionFamilies||[]).filter(id=>families[id]))]};
 n.profile.rewardLedger={...n.profile.rewardLedger};n.profile.pendingCelebrations=Array.isArray(n.profile.pendingCelebrations)?n.profile.pendingCelebrations:[];return n;
}
function usable(s,familyId){return !!families[familyId]&&(familyId!=='foil_heart'||!!s.settings.freePlay||(s.earnedUnlocks||[]).includes('bits_foil_heart'))}
function invalidate(d){d.bodyRevision=(d.bodyRevision||0)+1;d.recipeRevision=(d.recipeRevision||0)+1;d.fillProgress=0;d.revealComplete=false;for(const f of ['fillSourceBodyRevision','filledBodyRevision','revealedBodyRevision','thumbnailRevision','captureRecipeRevision','capturedRecipeRevision','capturedPhotoRevision','temporaryThumbnailId','thumbnail'])d[f]=null;d.dirtyFields=[...new Set([...(d.dirtyFields||[]),'batches'])]}
function add(s,selection,amount,id){const n=ensure(s),d=draft(n),r=d.recipe;
 if(r.batches.some(b=>b.id===id))return {state:n,accepted:false,reason:'duplicate'};
 if(!usable(n,selection?.familyId)||!families[selection.familyId]?.subtypes.includes(selection.subtype))return {state:n,accepted:false,reason:'locked'};
 if(!amounts.includes(amount)||typeof id!=='string'||!id)return {state:n,accepted:false,reason:'invalid'};
 if(r.batches.length>=6||r.batches.reduce((sum,b)=>sum+b.amount,0)+amount>120)return {state:n,accepted:false,reason:'full'};
 const batch={id,familyId:selection.familyId,subtype:selection.subtype,amount,seedOffset:hash(id)};r.batches.push(batch);r.inclusions=structuredClone(r.batches);invalidate(d);
 const p=n.profile;p.discoveryMetrics.inclusionFamilies=[...new Set([...p.discoveryMetrics.inclusionFamilies,batch.familyId])];let granted=false;
 if(p.discoveryMetrics.inclusionFamilies.length>=3&&!Object.hasOwn(p.rewardLedger,'discovery_06')){p.rewardLedger.discovery_06={id:'discovery_06',coins:10,unlock:'cosmetic_cushion_mint'};p.wallet=(Number.isSafeInteger(p.wallet)?p.wallet:0)+10;p.ownedCosmetics=[...new Set([...(p.ownedCosmetics||[]),'cosmetic_cushion_mint'])];if(!p.pendingCelebrations.some(x=>x.id==='discovery_06'))p.pendingCelebrations.push({id:'discovery_06',acknowledged:false});granted=true}
 return {state:n,accepted:true,batch,granted};
}
function undo(s){const n=ensure(s),d=draft(n);if(d.recipe.batches.length){d.recipe.batches.pop();d.recipe.inclusions=structuredClone(d.recipe.batches);invalidate(d)}return n}
function route(s,step){const n=ensure(s);draft(n).lastStep=step;draft(n).lastSafeStep=step;return n}
function hash(value){let h=2166136261;for(const c of String(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function anchors(recipe,seed=0,low=false){const points=[];for(const b of recipe.batches){let x=hash(String(seed)+':'+b.seedOffset);const rand=()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296};for(let i=0;i<b.amount;i++){const theta=rand()*Math.PI*2,r=Math.sqrt(rand())*.88,p={batchId:b.id,familyId:b.familyId,subtype:b.subtype,index:i,x:Math.cos(theta)*r,y:Math.sin(theta)*r,z:rand(),rotation:rand()*Math.PI*2,size:.7+rand()*.5};if(!low||i%2===0)points.push(p)}}return points}
function frame(familyId,subtype){const f=families[familyId];return f.frames[f.subtypes.indexOf(subtype)]}
globalThis.SquishyScene06Model={families,categories,amounts,ensure,usable,add,undo,route,anchors,frame,hash,validBatch};
})();
