/* Read-only room projection. Only the decoration transaction service changes equipment. */
(() => {
'use strict';
const api=window.SquishyLabHub,canvas=document.createElement('canvas');canvas.id='hub-decoration';canvas.setAttribute('aria-hidden','true');canvas.width=1024;canvas.height=768;document.getElementById('world').prepend(canvas);const painter=SquishyScene14Renderer.create(document.createElement('canvas')),c=canvas.getContext('2d'),cushions=new Map,background=document.getElementById('hub-room-backdrop');let loaded=false,backdropReady=false,displayToken=0,theme=null;
const stages=[...document.querySelectorAll('main > :is(#stage,#scene03,#s4-stage,#s5-stage,#s6-stage,#s7-stage,#s8-stage,#s9-stage,#s10-stage,#s11-stage,#s12-stage)')];
let paintedStage=null,paintedTheme=null,paintedWidth=0,paintedHeight=0;
function resizeBackdrop(){
 if(!backdropReady)return;
 const stage=stages.find(el=>!el.hidden);
 const width=stage?.clientWidth,height=stage?.clientHeight;
 if(stage===paintedStage&&theme===paintedTheme&&width===paintedWidth&&height===paintedHeight)return;
 paintedStage?.classList.remove('has-selected-room');
 paintedStage=stage;paintedTheme=theme;paintedWidth=width;paintedHeight=height;
 background.hidden=true;
 if(!theme||!width||!height)return;
 stage.prepend(background);
 if(painter.drawBackdrop(background,theme)){
  background.hidden=false;
  stage.classList.add('has-selected-room');
 }
}
function refresh(){if(!backdropReady)return;const state=api.getState(),room=SquishyScene14Model.room(state);theme=room.room_theme;resizeBackdrop();if(!loaded)return;c.clearRect(0,0,1024,768);if(room.rug)painter.cosmetic(c,room.rug,[360,500,300,190]);if(room.cabinet!=='default_cabinet')painter.cosmetic(c,room.cabinet,[278,415,450,240]);if(room.cushion!=='default_cushion')painter.cosmetic(c,room.cushion,[370,350,275,110]);if(room.wall_picture)painter.cosmetic(c,room.wall_picture,[120,170,140,130]);if(room.plant)painter.cosmetic(c,room.plant,[730,295,115,155]);const toy=SquishyScene14Model.displayed(state),token=++displayToken;
 if(toy&&globalThis.SquishyCollectionArt)SquishyCollectionArt.image(toy).then(url=>{const im=new Image();im.onload=()=>{if(token===displayToken)c.drawImage(im,402,391,178,150)};im.src=url}).catch(()=>{});}
function getCushion(fallback){if(!loaded)return fallback;const room=SquishyScene14Model.room(api.getState());if(room.cushion==='default_cushion')return fallback;if(cushions.has(room.cushion))return cushions.get(room.cushion);const out=document.createElement('canvas');out.width=512;out.height=256;painter.cosmetic(out.getContext('2d'),room.cushion,[0,0,512,256]);cushions.set(room.cushion,out);return out}
painter.ready.then(result=>{backdropReady=true;loaded=result.every(Boolean);refresh()});
for(const event of ['squishylab:cosmetics-changed','squishylab:settings-changed','squishylab:safe-boundary','hashchange'])window.addEventListener(event,refresh);
const resizeObserver=new ResizeObserver(resizeBackdrop);
for(const stage of stages)resizeObserver.observe(stage);
window.SquishyRoomDecor={refresh,getCushion};
})();
