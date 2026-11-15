(() => {
'use strict';
function create(canvas,background){const c=canvas.getContext('2d'),A=SquishyScene14Atlas,images={},cache=new Map,source=SquishyScene08Renderer.create(document.createElement('canvas'),{textureOnly:true});let ref=[1024,768],layout=Object.fromEntries(Object.entries(SquishyScene14Layout).map(([k,r])=>[k,r.landscape]));
const sources={...Object.fromEntries(Object.entries(A).filter(([id])=>id!=='background').map(([id,a])=>[id,a.image])),expanded:'assets/scene14/decor-props.png',rooms:'assets/scene14/decor-rooms.jpg',rewards:'assets/scene13/rewards.png',defaultCushion:'assets/scene09/cushion.png'};
if(SquishyScene14Model.completeEdition)sources.cosy='assets/scene14/cosy-collection.png';
const ready=Promise.all([source.ready,...Object.entries(sources).map(([key,src])=>new Promise(resolve=>{const im=new Image();im.onload=()=>{images[key]=im;resolve(true)};im.onerror=()=>resolve(false);im.src=src}))]).then(r=>[...r[0],...r.slice(1)]);
function size(w,h,portrait=false){ref=portrait?[768,1024]:[1024,768];canvas.width=Math.max(1,Math.round(w*1.5));canvas.height=Math.max(1,Math.round(h*1.5));layout=Object.fromEntries(Object.entries(SquishyScene14Layout).map(([k,r])=>[k,r[portrait?'portrait':'landscape']]))}
function fit(ctx,image,crop,rect){if(!image)return;crop??=[0,0,image.width,image.height];const z=Math.min(rect[2]/crop[2],rect[3]/crop[3]),w=crop[2]*z,h=crop[3]*z;ctx.drawImage(image,...crop,rect[0]+(rect[2]-w)/2,rect[1]+rect[3]-h,w,h)}
function tint(id,frame,color){const key=id+frame+color;if(cache.has(key))return cache.get(key);const image=images[id],crop=id==='rewards'?SquishyScene13Atlas.rewards.crops[frame]:A[id].crops[frame];if(!image)return null;const out=document.createElement('canvas');out.width=crop[2];out.height=crop[3];const x=out.getContext('2d');x.drawImage(image,...crop,0,0,out.width,out.height);x.globalCompositeOperation='color';x.fillStyle=color;x.fillRect(0,0,out.width,out.height);x.globalCompositeOperation='destination-in';x.drawImage(image,...crop,0,0,out.width,out.height);x.globalCompositeOperation='source-over';cache.set(key,out);return out}
function newArt(id){
 const item=SquishyScene14Model.catalogue.find(d=>d.id===id);
 if(!item)return null;
 if(item.packIndex!=null){
  const image=images.cosy;
  if(!image)return null;
  const w=image.width/3,h=image.height/2,index=item.packIndex;
  return {image,crop:[index%3*w,Math.floor(index/3)*h,w,h]};
 }
 const isRoom=item.roomIndex!=null, image=isRoom?images.rooms:images.expanded;
 if(!image||(!isRoom&&item.sprite==null))return null;
 const columns=isRoom?2:5,rows=isRoom?2:8,index=isRoom?item.roomIndex:item.sprite;
 const w=image.width/columns,h=image.height/rows;
 if(!isRoom){
  const cuts=[0,230,454,648,808,999,1188,1358,1578];
  const row=Math.floor(index/columns), y=cuts[row]/1578*image.height;
  return {image,crop:[index%columns*w,y,w,cuts[row+1]/1578*image.height-y]};
 }
 return {image,crop:[index%columns*w,Math.floor(index/columns)*h,w,h]};
}
function backdrop(ctx,id,rect){
 const art=newArt(id);
 if(!art)return;
 const [x,y,w,h]=art.crop,ratio=rect[2]/rect[3],cw=Math.min(w,h*ratio),ch=Math.min(h,w/ratio);
 ctx.drawImage(art.image,x+(w-cw)/2,y+(h-ch)/2,cw,ch,...rect);
 return true;
}
function drawBackdrop(canvas,id,oldId=null,transition=1){
 const stage=canvas.parentElement;
 if(!stage.clientWidth||!stage.clientHeight)return;
 const ratio=Math.min(1,2048/Math.max(stage.clientWidth,stage.clientHeight));
 const w=Math.round(stage.clientWidth*ratio),h=Math.round(stage.clientHeight*ratio);
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
 const ctx=canvas.getContext('2d');
 const rect=[0,0,w,h];
 ctx.clearRect(...rect);
 if(oldId&&oldId!==id&&transition<1){
  ctx.globalAlpha=id?1:1-transition;
  backdrop(ctx,oldId,rect);
  ctx.globalAlpha=transition;
 }
 const drawn=backdrop(ctx,id,rect);
 ctx.globalAlpha=1;
 return drawn;
}
function cosmetic(ctx,id,rect,{elapsed=1000,animate=false}={}){let image,crop;const art=newArt(id);if(art){fit(ctx,art.image,art.crop,rect);return}if(id==='default_cabinet'){image=tint('install',3,'#9dd5c6')}else if(id==='cosmetic_cabinet_lilac'||id==='cosmetic_cabinet_peach'){const f=(id.endsWith('peach')?4:0)+(animate?Math.min(3,Math.floor(elapsed/65)):3);image=images.install;crop=A.install.crops[f]}else if(id==='default_cushion'){image=images.defaultCushion}else if(id==='cosmetic_cushion_butter'){image=tint('rewards',5,'#ffe18b')}else{const f={cosmetic_cushion_mint:5,cosmetic_picture_rainbow:4,cosmetic_plant_star:7}[id];if(f!=null){image=images.rewards;crop=SquishyScene13Atlas.rewards.crops[f]}}fit(ctx,image,crop,rect)}
function room(ctx,room,r,options={}){if(room.rug)cosmetic(ctx,room.rug,[r[0],r[1]+r[3]*.62,r[2],r[3]*.42]);cosmetic(ctx,room.cabinet,[r[0],r[1]+r[3]*.35,r[2],r[3]*.65],options);cosmetic(ctx,room.cushion,[r[0]+r[2]*.24,r[1]+r[3]*.18,r[2]*.52,r[3]*.24],options);if(room.wall_picture)cosmetic(ctx,room.wall_picture,[r[0]+r[2]*.015,r[1]-15,r[2]*.23,r[3]*.36],options);if(room.plant)cosmetic(ctx,room.plant,[r[0]+r[2]*.77,r[1]-15,r[2]*.22,r[3]*.40],options)}
function draw(state,{previewRoom,oldRoom,transition=1,elapsed=1000,guide=false,quiet=false,drawToy=true}={}){c.setTransform(canvas.width/ref[0],0,0,canvas.height/ref[1],0,0);c.clearRect(0,0,...ref);const r=layout.room_target,next=previewRoom||SquishyScene14Model.room(state);if(background)drawBackdrop(background,next.room_theme,oldRoom?.room_theme,transition);if(oldRoom&&transition<1){c.save();c.globalAlpha=1-transition;room(c,oldRoom,r);c.restore()}c.save();c.globalAlpha=transition;room(c,next,r,{elapsed,animate:!quiet&&elapsed<260});c.restore();let toy=null;const saved=SquishyScene14Model.displayed(state,next.room_theme);if(drawToy&&saved){try{const recipe=SquishyScene09Model.validate(saved.recipe);toy=[r[0]+r[2]*.37,r[1]-r[3]*.04,Math.min(r[2]*.26,r[3]*.40),Math.min(r[2]*.26,r[3]*.40)];c.drawImage(source.getTexture(recipe,saved.seed||1),...toy)}catch{}}
if(guide&&!quiet&&images.guide){const index=Math.min(7,Math.floor(elapsed/250)),b=index<4?layout.cosmetic_0:layout.confirm;fit(c,images.guide,A.guide.frames[index],[b[0]+b[2]*.55,b[1]-100,125,125])}return {toy,room:next}}
function tile(id){const el=document.createElement('canvas');el.width=el.height=96;const d=SquishyScene14Model.definition(id);const art=newArt(id);if(art)fit(el.getContext('2d'),art.image,art.crop,[0,0,96,96]);else fit(el.getContext('2d'),images.cosmetics,A.cosmetics.frames[d.frame],[0,0,96,96]);return el}
return {ready,size,draw,tile,drawRoom:room,cosmetic,drawBackdrop};}
globalThis.SquishyScene14Renderer={create};
})();
