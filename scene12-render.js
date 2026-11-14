(() => {
'use strict';
function create(canvas){const c=canvas.getContext('2d'),A=SquishyScene12Atlas,images={},source=SquishyScene08Renderer.create(document.createElement('canvas'),{textureOnly:true});let ref=[1024,768],layout=Object.fromEntries(Object.entries(SquishyScene12Layout).map(([k,r])=>[k,r.landscape]));
const optionalPoses=new Promise(resolve=>{
 const portraitSheet=new Image();
 portraitSheet.onload=()=>{images.poses=portraitSheet;resolve(true)};
 portraitSheet.onerror=()=>resolve(true);
 portraitSheet.src='assets/scene12/friends-poses.jpg';
});
const ready=Promise.all([source.ready,optionalPoses,...Object.entries(A).filter(([k])=>k!=='background').map(([key,a])=>new Promise(resolve=>{const im=new Image();im.onload=()=>{images[key]=im;resolve(true)};im.onerror=()=>resolve(false);im.src=a.image}))]).then(r=>[...r[0],...r.slice(1)]);
function size(w,h,portrait=false){ref=portrait?[768,1024]:[1024,768];canvas.width=Math.max(1,Math.round(w*1.5));canvas.height=Math.max(1,Math.round(h*1.5));layout=Object.fromEntries(Object.entries(SquishyScene12Layout).map(([k,r])=>[k,r[portrait?'portrait':'landscape']]))}
function sprite(id,f,rect){if(!images[id])return;const crop=A[id].frames[Math.max(0,Math.min(7,f))],scale=Math.min(rect[2]/crop[2],rect[3]/crop[3]),w=crop[2]*scale,h=crop[3]*scale;c.drawImage(images[id],...crop,rect[0]+(rect[2]-w)/2,rect[1]+rect[3]-h,w,h)}
function drawFriend(id,frame,thanking,elapsed,quiet) {
 const image=images.poses;
 if(!image){sprite(id,frame,layout.friend);return;}
 const col=['bear','bunny','kitten'].indexOf(id);
 const w=image.width/3,h=image.height/2;
 const [x,y,dw,dh]=layout.friend;
 const scale=Math.min(dw/w,dh/h),width=w*scale,height=h*scale;
 const lift=quiet?0:thanking?Math.max(0,Math.sin(Math.PI*Math.min(1,elapsed/620)))*27:Math.sin(Math.min(2*Math.PI,elapsed/110))*3;
 const angle=quiet?0:thanking?Math.sin(elapsed/54)*.045*Math.max(0,1-elapsed/900):Math.sin(Math.min(2*Math.PI,elapsed/130))*.014;
 c.save();
 c.translate(x+dw/2,y+dh-lift);
 c.rotate(angle);
 c.beginPath();
 if(c.roundRect)c.roundRect(-width/2,-height,width,height,24);
 else c.rect(-width/2,-height,width,height);
 c.clip();
 c.drawImage(image,col*w+1,(thanking?h:0)+1,w-2,h-2,-width/2,-height,width,height);
 c.restore();
}
function draw({definition,creation,phase,elapsed=0,guide=false,quiet=false}){c.setTransform(canvas.width/ref[0],0,0,canvas.height/ref[1],0,0);c.clearRect(0,0,...ref);if(!definition)return;const thanking=phase==='thanking',t=quiet?1:Math.min(1,elapsed/900),f=thanking?Math.min(7,4+Math.floor(t*4)):Math.min(3,Math.floor(elapsed/180));
drawFriend(definition.friendId,f,thanking||phase==='completed',elapsed,quiet);
const shapeRecipe={mouldId:definition.shapeId,materialId:'gel',colourIds:[definition.colourId],faceId:'none',blendMode:'single',mixAmount:0,batches:[]};c.drawImage(source.getTexture(shapeRecipe,1,false),layout.shape_preference[0]+12,layout.shape_preference[1]+12,layout.shape_preference[2]-24,layout.shape_preference[3]-24);
const giftFrame=thanking?Math.min(7,Math.floor(t*8)):creation?3:0;sprite('gift',giftFrame,layout.gift);
if(creation&&(!thanking||t<.68)){const r=layout.offered_toy,texture=source.getTexture(SquishyScene09Model.validate(creation.recipe),creation.seed||creation.recipe.seed||1),p=thanking?Math.min(1,t/.68):0,scale=1-p*.62,w=r[2]*scale,h=r[3]*scale,x=r[0]+(r[2]-w)/2,y=r[1]+(layout.gift[1]+layout.gift[3]*.45-r[1])*p;c.save();if(thanking){c.beginPath();c.rect(0,0,ref[0],layout.gift[1]+layout.gift[3]*.42);c.clip()}c.globalAlpha=thanking?Math.max(0,1-Math.max(0,p-.7)/.3):1;const side=Math.min(w,h);c.drawImage(texture,x+(w-side)/2,y+(h-side)/2,side,side);c.restore()}
if(guide&&!quiet){const frame=thanking?4:creation?3:Math.floor(elapsed/250)%3;const r=layout.give;sprite('guide',frame,[r[0]-100,r[1]-110,120,110])}return {friendFrame:f,giftFrame,phase}}
return {ready,size,draw};}
globalThis.SquishyScene12Renderer={create};
})();
