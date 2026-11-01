(() => {
'use strict';
function create(canvas){const c=canvas.getContext('2d'),A=SquishyScene12Atlas,images={},source=SquishyScene08Renderer.create(document.createElement('canvas'),{textureOnly:true});let ref=[1024,768],layout=Object.fromEntries(Object.entries(SquishyScene12Layout).map(([k,r])=>[k,r.landscape]));
const ready=Promise.all([source.ready,...Object.entries(A).filter(([k])=>k!=='background').map(([key,a])=>new Promise(resolve=>{const im=new Image();im.onload=()=>{images[key]=im;resolve(true)};im.onerror=()=>resolve(false);im.src=a.image}))]).then(r=>[...r[0],...r.slice(1)]);
function size(w,h,portrait=false){ref=portrait?[768,1024]:[1024,768];canvas.width=Math.max(1,Math.round(w*1.5));canvas.height=Math.max(1,Math.round(h*1.5));layout=Object.fromEntries(Object.entries(SquishyScene12Layout).map(([k,r])=>[k,r[portrait?'portrait':'landscape']]))}
function sprite(id,f,rect){if(!images[id])return;const crop=A[id].frames[Math.max(0,Math.min(7,f))],scale=Math.min(rect[2]/crop[2],rect[3]/crop[3]),w=crop[2]*scale,h=crop[3]*scale;c.drawImage(images[id],...crop,rect[0]+(rect[2]-w)/2,rect[1]+rect[3]-h,w,h)}
function draw({definition,creation,phase,elapsed=0,guide=false,quiet=false}){c.setTransform(canvas.width/ref[0],0,0,canvas.height/ref[1],0,0);c.clearRect(0,0,...ref);if(!definition)return;const thanking=phase==='thanking',t=quiet?1:Math.min(1,elapsed/900),f=thanking?Math.min(7,4+Math.floor(t*4)):Math.min(3,Math.floor(elapsed/180));
// Friend source cells remain intact, displayed as a soft oval vignette. This also supports opaque source plates.
c.save();c.beginPath();c.ellipse(layout.friend[0]+layout.friend[2]/2,layout.friend[1]+layout.friend[3]/2,layout.friend[2]/2,layout.friend[3]/2,0,0,Math.PI*2);c.clip();sprite(definition.friendId,f,layout.friend);c.restore();
const shapeRecipe={mouldId:definition.shapeId,materialId:'gel',colourIds:[definition.colourId],faceId:'none',blendMode:'single',mixAmount:0,batches:[]};c.drawImage(source.getTexture(shapeRecipe,1,false),layout.shape_preference[0]+12,layout.shape_preference[1]+12,layout.shape_preference[2]-24,layout.shape_preference[3]-24);
const giftFrame=thanking?Math.min(7,Math.floor(t*8)):creation?3:0;sprite('gift',giftFrame,layout.gift);
if(creation&&(!thanking||t<.68)){const r=layout.offered_toy,texture=source.getTexture(SquishyScene09Model.validate(creation.recipe),creation.seed||creation.recipe.seed||1),p=thanking?Math.min(1,t/.68):0,scale=1-p*.62,w=r[2]*scale,h=r[3]*scale,x=r[0]+(r[2]-w)/2,y=r[1]+(layout.gift[1]+layout.gift[3]*.45-r[1])*p;c.save();if(thanking){c.beginPath();c.rect(0,0,ref[0],layout.gift[1]+layout.gift[3]*.42);c.clip()}c.globalAlpha=thanking?Math.max(0,1-Math.max(0,p-.7)/.3):1;const side=Math.min(w,h);c.drawImage(texture,x+(w-side)/2,y+(h-side)/2,side,side);c.restore()}
if(guide&&!quiet){const frame=thanking?4:creation?3:Math.floor(elapsed/250)%3;const r=layout.give;sprite('guide',frame,[r[0]-100,r[1]-110,120,110])}return {friendFrame:f,giftFrame,phase}}
return {ready,size,draw};}
globalThis.SquishyScene12Renderer={create};
})();
