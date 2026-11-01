/* Scene 02 state rules. No rewards or immutable creations are authored here. */
(() => {
  const shapes=['cube','blob','heart','star','cloud','bear','dumpling_s','dumpling_m','dumpling_l','dumpling_xl'];
  const safeSteps=['03','04','05','06','07','08','09','10'];
  const empty=()=>({schemaVersion:1,workshopCreationId:null,drafts:{},activeDraftId:null,creations:[],profile:{qualifyingSavedCount:0},settings:{quiet:false,freePlay:false},activeRequest:null,eligibleRequestCount:0,cosmetics:{}});
  function normalize(raw){
    if(!raw||raw.schemaVersion!==1)throw Error('Unsupported hub state');
    const s=empty();
    s.profile={...s.profile,...raw.profile};s.earnedUnlocks=Array.isArray(raw.earnedUnlocks)?raw.earnedUnlocks.filter(v=>typeof v==='string'):[];
    s.drafts=Object.fromEntries(Object.entries(raw.drafts||{}).filter(([id,d])=>d&&d.id===id&&typeof d.creationId==='string'&&safeSteps.includes(d.lastSafeStep)));
    s.activeDraftId=s.drafts[raw.activeDraftId]?raw.activeDraftId:null;
    s.creations=(Array.isArray(raw.creations)?raw.creations:[]).filter(c=>c&&typeof c.id==='string').slice(0,1000).map(c=>({...c,name:typeof c.name==='string'?c.name.slice(0,60):'My squishy'}));
    s.workshopCreationId=s.creations.some(c=>c.id===raw.workshopCreationId)?raw.workshopCreationId:null;
    s.profile.qualifyingSavedCount=Number.isSafeInteger(raw.profile?.qualifyingSavedCount)?Math.max(0,raw.profile.qualifyingSavedCount):0;
    s.settings={...raw.settings,quiet:!!raw.settings?.quiet,freePlay:!!raw.settings?.freePlay};
    if(globalThis.SquishyScene15Model){s.settings=SquishyScene15Model.preferences(s.settings);s.settings.music=s.settings.musicEnabled;s.settings.effects=s.settings.effectsEnabled;s.settings.voice=s.settings.voiceEnabled;}
    s.activeRequest=raw.activeRequest&&typeof raw.activeRequest.id==='string'?raw.activeRequest:null;
    s.eligibleRequestCount=Number.isSafeInteger(raw.eligibleRequestCount)?Math.max(0,raw.eligibleRequestCount):0;
    s.shelfLayout=Array.isArray(raw.shelfLayout)?raw.shelfLayout.slice():raw.shelfLayout&&typeof raw.shelfLayout==='object'?{...raw.shelfLayout}:[];s.shelfLayoutRevision=Number.isSafeInteger(raw.shelfLayoutRevision)?Math.max(0,raw.shelfLayoutRevision):0;
    s.requestProgress=raw.requestProgress&&typeof raw.requestProgress==='object'?structuredClone(raw.requestProgress):{};s.activeRequestId=typeof raw.activeRequestId==='string'?raw.activeRequestId:null;
    s.profileRevision=Number.isSafeInteger(raw.profileRevision)?Math.max(0,raw.profileRevision):0;s.bin=Array.isArray(raw.bin)?structuredClone(raw.bin):[];
    s.cosmetics=raw.cosmetics&&typeof raw.cosmetics==='object'?raw.cosmetics:{};
    return s;
  }
  function validToy(c){return !!c&&shapes.includes(c.recipe?.mouldId)&&['gel','foam','bounce'].includes(c.recipe?.materialId)}
  function latest(s){return [...s.creations].sort((a,b)=>(Number(b.savedAt)||0)-(Number(a.savedAt)||0))[0]||null}
  function displayed(s){return s.creations.find(c=>c.id===s.workshopCreationId)||latest(s)}
  function unlocked(s){return s.profile.qualifyingSavedCount>=1||s.settings.freePlay}
  function fresh(s,id,creationId,seed){
    const next=normalize(s);
    next.drafts[id]={id,creationId,seed,bodyRevision:0,recipeRevision:0,photoRevision:0,fillSourceBodyRevision:null,filledBodyRevision:null,lastSafeStep:'03',recipe:{mouldId:null,materialId:null,colourIds:[],inclusions:[],faceId:'none'},fillProgress:0};
    next.activeDraftId=id;return next;
  }
  function squishContext(s,id){const c=id?s.creations.find(t=>t.id===id):displayed(s);if(c){if(!validToy(c))throw Error('This saved recipe needs recovery. Your toy has been kept.');return {kind:'saved',creationId:c.id}}return null}
  globalThis.SquishyHubModel={empty,normalize,fresh,latest,displayed,unlocked,validToy,squishContext};
})();
