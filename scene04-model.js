(() => {
'use strict';
const palette={pink:'#FF24B8',blue:'#00BFFF',yellow:'#FFE31A',mint:'#19DB83',lilac:'#9347FF',peach:'#FF821C'};
const labels={pink:'Hot pink',blue:'Electric blue',yellow:'Sunshine',mint:'Emerald',lilac:'Violet',peach:'Tangerine'};
const pairs={};
const pigmentColours=Object.fromEntries(Object.entries(palette).map(([id,hex])=>[id,new spectral.Color(hex)])),mixCache=new Map();
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:a));
const key=ids=>[...ids].sort().join('|');
const draft=s=>s.drafts[s.activeDraftId];
function colours(r){return (r.colourIds||r.colours||[]).filter(id=>Object.hasOwn(palette,id)).slice(0,4)}
function snapshot(d){const r=d.recipe;return {colourIds:[...colours(r)],blendMode:r.blendMode,mixAmount:r.mixAmount,swirlAngle:r.swirlAngle,colourFinish:r.colourFinish||'plain',seed:d.seed}}
function invalidate(d){d.bodyRevision=(d.bodyRevision||0)+1;d.recipeRevision=(d.recipeRevision||0)+1;d.fillProgress=0;for(const field of ['fillSourceBodyRevision','filledBodyRevision','revealedBodyRevision','thumbnailRevision','captureRecipeRevision','capturedRecipeRevision','thumbnail'])d[field]=null;d.revealComplete=false;d.dirtyFields=[...new Set([...(d.dirtyFields||[]),'colours'])];d.lastStep='04';d.lastSafeStep='04'}
function push(d){d.colourUndo=[...(d.colourUndo||[]),snapshot(d)].slice(-20);invalidate(d)}
function assign(d,ids){d.recipe.colourIds=[...ids];d.recipe.colours=[...ids]}
function ensure(s){const n=structuredClone(s),d=draft(n);if(!d)throw Error('A mould draft is required');n.settings.effects=n.settings.effects??true;let ids=colours(d.recipe);if(!ids.length)ids=['blue'];ids=[...new Set(ids)];assign(d,ids);d.recipe.blendMode=ids.length===1?'single':(['swirl','blend'].includes(d.recipe.blendMode)?d.recipe.blendMode:'swirl');d.recipe.mixAmount=ids.length===1?0:clamp(d.recipe.mixAmount);d.recipe.swirlAngle=clamp(Number.isFinite(d.recipe.swirlAngle)?d.recipe.swirlAngle:0,-Math.PI*200,Math.PI*200);d.recipe.colourFinish=d.recipe.colourFinish==='glitter'?'glitter':'plain';d.colourUndo=Array.isArray(d.colourUndo)?d.colourUndo.slice(-20):[];d.lastStep='04';d.lastSafeStep='04';return n}
function setColour(s,slot,id){if(!Object.hasOwn(palette,id)||![0,1,2,3].includes(slot))throw Error('Unknown colour or slot');const n=ensure(s),d=draft(n),ids=colours(d.recipe);if(slot>ids.length)throw Error('Add the earlier colour first');if(ids[slot]===id)return n;push(d);ids[slot]=id;assign(d,[...new Set(ids)]);d.recipe.blendMode=colours(d.recipe).length>1?'swirl':'single';d.recipe.mixAmount=0;return n}
function setFinish(s,finish){if(!['plain','glitter'].includes(finish))throw Error('Unknown colour finish');const n=ensure(s),d=draft(n);if(d.recipe.colourFinish===finish)return n;push(d);d.recipe.colourFinish=finish;return n}
function clear(s,slot=1){const n=ensure(s),d=draft(n),ids=colours(d.recipe);if(slot<1||slot>=ids.length)return n;push(d);ids.splice(slot,1);assign(d,ids);d.recipe.blendMode=ids.length>1?'swirl':'single';d.recipe.mixAmount=0;return n}
function stir(s,delta,first=false){const n=ensure(s),d=draft(n);if(!Number.isFinite(delta)||Math.abs(delta)<0.00001)return n;if(first)push(d);d.recipe.swirlAngle=clamp(d.recipe.swirlAngle+delta,-Math.PI*200,Math.PI*200);if(colours(d.recipe).length>1){d.recipe.blendMode='blend';d.recipe.mixAmount=clamp(d.recipe.mixAmount+Math.abs(delta)/(Math.PI*4));if(d.recipe.mixAmount>1-1e-8)d.recipe.mixAmount=1}return n}
function beginBlend(s){const n=ensure(s),d=draft(n);if(colours(d.recipe).length<2)return n;if(d.recipe.blendMode==='blend'&&d.recipe.mixAmount===1)return n;push(d);d.recipe.blendMode='blend';return n}
function blend(s,amount){const n=ensure(s),d=draft(n);if(colours(d.recipe).length>1){d.recipe.blendMode='blend';d.recipe.mixAmount=clamp(amount)}return n}
function undo(s){const n=ensure(s),d=draft(n),previous=d.colourUndo.pop();if(!previous)return n;assign(d,previous.colourIds);Object.assign(d.recipe,{blendMode:previous.blendMode,mixAmount:previous.mixAmount,swirlAngle:previous.swirlAngle,colourFinish:previous.colourFinish||'plain'});d.seed=previous.seed;invalidate(d);return n}
function next(s){const n=ensure(s),d=draft(n);if(colours(d.recipe).length>1)n.profile.triedColourCombinations=[...new Set([...(n.profile.triedColourCombinations||[]),key(colours(d.recipe))])];if(colours(d.recipe).length===2){n.profile.triedColourPairs=[...new Set([...(n.profile.triedColourPairs||[]),key(colours(d.recipe))])];n.profile.colourPairEventIds=[...new Set([...(n.profile.colourPairEventIds||[]),d.id+':pair:'+key(colours(d.recipe))])]};d.lastStep='05';d.lastSafeStep='05';return n}
function routeBack(s){const n=structuredClone(s);draft(n).lastStep='03';draft(n).lastSafeStep='03';return n}
function angleDelta(before,after){return clamp(Math.atan2(Math.sin(after-before),Math.cos(after-before)),-Math.PI/2,Math.PI/2)}
function lerpHex(a,b,t){t=clamp(t);if(t===0)return a;if(t===1)return b;const linear=v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4,display=v=>v<=.0031308?v*12.92:1.055*v**(1/2.4)-.055;const bytes=[1,3,5].map(i=>{const x=linear(parseInt(a.slice(i,i+2),16)/255),y=linear(parseInt(b.slice(i,i+2),16)/255);return Math.round(clamp(display(x+(y-x)*t))*255).toString(16).padStart(2,'0')});return '#'+bytes.join('').toUpperCase()}
function targetColour(ids){const valid=[...new Set(ids.filter(id=>Object.hasOwn(palette,id)))].sort();if(!valid.length)return palette.blue;if(valid.length===1)return palette[valid[0]];const k=valid.join('|');if(!mixCache.has(k))mixCache.set(k,spectral.mix(...valid.map(id=>[pigmentColours[id],1])).toString());return mixCache.get(k)}
for(const [i,a] of Object.keys(palette).entries())for(const b of Object.keys(palette).slice(i+1))pairs[key([a,b])]=targetColour([a,b]);

function appearance(r){const ids=colours(r),used=ids.length?ids:['blue'],target=targetColour(used),t=clamp(r.mixAmount),tones=used.map(id=>t===0?palette[id]:t===1?target:spectral.mix(...[...used].sort().map(other=>[pigmentColours[other],t/used.length+(other===id?1-t:0)])).toString());return {a:tones[0],b:tones[1]||tones[0],tones,target,swirl:ids.length>1&&t<1}}

globalThis.SquishyScene04Model={palette,labels,setFinish,pairs,key,colours,ensure,setColour,clear,stir,beginBlend,blend,undo,next,routeBack,angleDelta,appearance,targetColour,snapshot,lerpHex};
})();
