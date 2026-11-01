(() => {
'use strict';
const M=globalThis.SquishyHubModel,$=id=>document.getElementById(id),stage=$('stage'),panel=$('panel'),world=$('world'),pip=$('pip'),cube=$('demo-cube');
const KEY='squishylab.scene02.v1',positions={star:'0% 0%',blob:'50% 0%',bear:'100% 0%',cloud:'0% 100%',cube:'50% 100%',heart:'100% 100%'};
let state=M.empty(),memoryOnly=false,readFailure=false,previousFocus,lock=false,blinkTimer,delightTimer,releaseTimer,playContext=null;
try{const raw=localStorage.getItem(KEY);if(raw)state=M.normalize(JSON.parse(raw))}catch{memoryOnly=true;readFailure=true}
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const announce=text=>$('status').textContent=text;
function motion(){stage.classList.toggle('quiet',state.settings.quiet||reduced.matches);$('quiet').setAttribute('aria-pressed',String(state.settings.quiet));$('quiet').textContent=state.settings.quiet?'Quiet mode: on':'Quiet mode: off'}
async function checkpoint(next=state){try{const raw=JSON.parse(localStorage.getItem(KEY)||'null');next.profileRevision=Math.max(state.profileRevision||0,raw?.profileRevision||0,next.profileRevision||0)+1}catch{next.profileRevision=(state.profileRevision||0)+1}state=next;if(readFailure){announce('Stored data could not be read. Changes stay in this session; the original stored data is kept.');return false}try{localStorage.setItem(KEY,JSON.stringify(state));memoryOnly=false;return true}catch{memoryOnly=true;announce('Changes are kept for this session. Storage is unavailable, so resume after closing is not guaranteed.');return false}}
function artwork(el,toy){if(toy?.recipe&&globalThis.SquishyCollectionArt){el.replaceChildren();el.classList.remove('placeholder');SquishyCollectionArt.attach(el,toy);return}el.replaceChildren();el.style.backgroundImage='';el.classList.remove('placeholder');if(toy?.thumbnail&&/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(toy.thumbnail)&&toy.thumbnail.length<2000000){const img=document.createElement('img');img.src=toy.thumbnail;img.alt='';el.append(img)}else if(!toy){return}else{el.classList.add('placeholder');el.textContent=toy.name+' · preview unavailable'}}
function refresh(){const c=M.latest(state);$('latest_toy').hidden=!c;stage.classList.toggle('has-saved-toy',!!c);if(c)artwork($('latest-art'),c);$('latest_toy').setAttribute('aria-label',c?'Squish '+c.name:'Squish your saved toy');for(const id of ['requests','decorate'])$(id).hidden=!M.unlocked(state);const slots=$('cabinet-toys');slots.replaceChildren();[...state.creations].sort((a,b)=>(Number(b.savedAt)||0)-(Number(a.savedAt)||0)).slice(0,6).forEach(c=>{const t=document.createElement('div');t.className='cabinet-toy';artwork(t,c);slots.append(t)});motion()}
function release(){clearTimeout(releaseTimer);cube.classList.remove('pressed')}
function close(){release();panel.hidden=true;$('scrim').hidden=true;world.inert=false;world.removeAttribute('aria-hidden');lock=false;stage.classList.remove('paused');previousFocus?.focus();scheduleBlink()}
function open(title,copy,mode='notice'){
  release();clearTimeout(blinkTimer);pip.classList.remove('blink');if(panel.hidden)previousFocus=document.activeElement;
  panel.hidden=false;$('scrim').hidden=false;world.inert=true;world.setAttribute('aria-hidden','true');stage.classList.add('paused');panel.dataset.mode=mode;$('close-panel').textContent=mode==='draft_choice'?'Back':'Return to workshop';
  $('panel-title').textContent=title;$('panel-copy').textContent=copy;$('panel-actions').replaceChildren();$('collection').replaceChildren();$('page-label').textContent='';cube.hidden=true;$('auto-squeeze').hidden=true;
  $('close-panel').focus();
}
function action(label,fn){const b=document.createElement('button');b.className='plain';b.textContent=label;b.addEventListener('click',fn);$('panel-actions').append(b);return b}
function missing(scene,context){open('Ready for the next scene','Scene '+scene+' is specified in the blueprint. Connect its renderer to this route to continue. Your workshop state is kept.');announce('Scene '+scene+' route prepared')}
async function route(scene,context={}){
 if(lock)return;lock=true;await checkpoint();release();
 const detail={from:'02',scene,context:structuredClone(context),durable:!memoryOnly};
 const handled=!window.dispatchEvent(new CustomEvent('squishylab:navigate',{detail,cancelable:true}));
 if(handled){lock=false;return}
 lock=false;
 if(scene==='01'){if(memoryOnly&&Object.keys(state.drafts).length){open('Your squishy is safe here','Storage is unavailable. Stay in this workshop to keep your unfinished squishy in this session. Try again to save before going Home.');action('Retry Home',()=>route('01'));return}window.location.href='scene_01/preview.html';return}
 if(scene==='09'){showSquish(context);return}
 if(scene==='11'){showShelf();return}
 missing(scene,context);
}
async function newDraft(){if(lock)return;lock=true;const uid=()=>globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2);await checkpoint(M.fresh(state,'draft-'+uid(),'creation-'+uid(),Math.floor(Math.random()*2147483647)));refresh();close();return route('03',{draftId:state.activeDraftId})}
function make(){const draft=state.drafts[state.activeDraftId];if(draft&&!draft.savedCreationId){open('Continue your squishy?','Resume your unfinished creation, or start a new one. Your previous draft will be kept.','draft_choice');action('Resume',async()=>{close();await route(draft.lastSafeStep,{draftId:draft.id})});action('New squishy',newDraft)}else newDraft()}
function squish(id){try{playContext=M.squishContext(state,id);if(!playContext){open('Let’s make your first squishy','Choose a mould and create a squishy. After you save it, you can play with it here.');action('Make a squishy',()=>{close();make()});return}route('09',playContext)}catch(e){open('Let’s try that again',e.message);action('Retry',()=>squish(id));action('Return to workshop',close)}}
function showSquish(context){const toy=state.creations.find(c=>c.id===context.creationId);if(!toy){open('Let’s make a squishy','Your saved squishy will appear here after you create one.');return}open(toy.name,'Press and hold, then release. This is a 2D response preview of your saved squishy.');artwork($('demo-art'),toy);cube.hidden=false;$('auto-squeeze').hidden=false;announce('Playing saved creation '+toy.name)}
function showShelf(){if(window.SquishyLabScene11){close();window.SquishyLabScene11.enter({from:'02'});return}open('My shelf',state.creations.length?'Choose one of your saved squishies.':'Your shelf is empty. Make your first squishy and save its photo to put it here.');if(!state.creations.length){action('Make a squishy',()=>{close();make()});return}let page=0;const draw=()=>{const list=$('collection');list.replaceChildren();[...state.creations].sort((a,b)=>(Number(b.savedAt)||0)-(Number(a.savedAt)||0)).slice(page*6,page*6+6).forEach(c=>{const b=document.createElement('button');b.className='saved-toy';const art=document.createElement('div');art.className='art';artwork(art,c);const name=document.createElement('span');name.textContent=c.name;b.append(art,name);b.addEventListener('click',()=>{close();squish(c.id)});list.append(b)});$('page-label').textContent='Page '+(page+1)+' of '+Math.ceil(state.creations.length/6)};draw();if(state.creations.length>6){action('Previous page',()=>{page=Math.max(0,page-1);draw()});action('Next page',()=>{page=Math.min(Math.ceil(state.creations.length/6)-1,page+1);draw()})}}
function requests(){if(!M.unlocked(state))return;route('12',{requestInstanceId:state.activeRequestId||null})}
function decorate(){if(M.unlocked(state))route('14',{equippedCosmetics:state.cosmetics})}
function pause(){open('Take a little pause','Your workshop is here when you are ready.','pause');action('Keep playing',close);action('Quiet mode',async()=>{state.settings.quiet=!state.settings.quiet;await checkpoint();motion()});action('Home',()=>route('01'));}
function delight(){if(state.settings.quiet||reduced.matches)return;clearTimeout(delightTimer);pip.classList.remove('blink');pip.classList.add('delight');delightTimer=setTimeout(()=>pip.classList.remove('delight'),800)}
const commands={MAKE:make,SQUISH:()=>squish(),SHELF:()=>route('11'),WELCOME:()=>route('01'),GLOBAL_PAUSE:pause,REQUEST:requests,DECORATE:decorate,PIP_HELP:()=>{delight();open('What shall we make?','Choose the mould tray to make, the squishy to play, or the cabinet to see your saved toys.')}};
world.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{if(!lock)commands[b.dataset.action]?.()}));
$('close-panel').addEventListener('click',close);
cube.addEventListener('pointerdown',e=>{if(e.button!==0||cube.hidden)return;cube.setPointerCapture(e.pointerId);cube.classList.add('pressed')});for(const type of ['pointerup','pointercancel','lostpointercapture'])cube.addEventListener(type,release);
function autoSqueeze(){release();cube.classList.add('pressed');releaseTimer=setTimeout(release,350)}
$('auto-squeeze').addEventListener('click',autoSqueeze);cube.addEventListener('click',e=>{if(e.detail===0)autoSqueeze()});
panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close()}if(e.key==='Tab'){const a=[...panel.querySelectorAll('button')].filter(b=>!b.hidden&&!b.closest('[hidden]'));if(e.shiftKey&&document.activeElement===a[0]){e.preventDefault();a.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===a.at(-1)){e.preventDefault();a[0].focus()}}});
$('quiet').addEventListener('click',async()=>{state.settings.quiet=!state.settings.quiet;await checkpoint();motion()});
function scheduleBlink(){if(globalThis.SquishyPauseRuntime?.paused)return;clearTimeout(blinkTimer);if(document.hidden)return;blinkTimer=setTimeout(()=>{if(panel.hidden&&!state.settings.quiet&&!reduced.matches){pip.classList.add('blink');setTimeout(()=>pip.classList.remove('blink'),140)}scheduleBlink()},4300)}
reduced.addEventListener('change',motion);
document.addEventListener('visibilitychange',()=>{release();stage.classList.toggle('page-hidden',document.hidden);if(document.hidden){clearTimeout(blinkTimer);pip.classList.remove('blink');checkpoint()}else{refresh();scheduleBlink()}});window.addEventListener('blur',release);window.addEventListener('pagehide',()=>{release();checkpoint()});
// A host consumes cancelable navigate events with preventDefault and mounts the destination.
// Only the host save system may supply immutable saved creations and progression.
window.addEventListener('squishylab:collection-art-ready',refresh);
window.SquishyLabHub={pauseForOverlay:async()=>{release();clearTimeout(blinkTimer);clearTimeout(delightTimer);return {durable:await checkpoint()}},resumeFromOverlay:()=>{refresh();scheduleBlink()},adoptCommittedSnapshot:snapshot=>{state=M.normalize(snapshot);memoryOnly=false;try{refresh()}catch{}},getState:()=>structuredClone(state),replaceSnapshot:async snapshot=>{const next=M.normalize(snapshot);await checkpoint(next);refresh();return {durable:!memoryOnly}},resume:()=>{lock=false;close();refresh();window.dispatchEvent(new CustomEvent('squishylab:safe-boundary'))},checkpoint,storageKey:KEY};
refresh();scheduleBlink();if(memoryOnly)announce('Storage unavailable. Changes stay in this session; existing stored data is kept.');
})();
