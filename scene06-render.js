(() => {
'use strict';
function create(canvas,jars){
 const ctx=canvas.getContext('2d'),assets={},A=SquishyScene06Atlas,M=SquishyScene06Model;
 const artworkReady=Promise.all(Object.entries(A).map(([name,a])=>new Promise(resolve=>{const im=new Image();im.onload=()=>{assets[name]=im;resolve(true)};im.onerror=()=>resolve(false);im.src=name==='bowl'?'assets/scene04/bowl_v03.png':a.image})));
 function sprite(c,name,frame,x,y,w,h){if(!assets[name])return;if(name==='bowl'){c.drawImage(assets.bowl,40,110,1450,835,x,y,w,h);return}const crop=A[name].crops[frame];c.drawImage(assets[name],...crop,x,y,w,h)}
 function piece(c,family,subtype,x,y,size,rotation=0,alpha=1){const frame=M.frame(family,subtype),crop=A.bits.crops[frame],ratio=crop[2]/crop[3];c.save();c.globalAlpha=alpha;c.translate(x,y);c.rotate(rotation);sprite(c,'bits',frame,-size*ratio/2,-size/2,size*ratio,size);c.restore()}
 function drawJar(canvas,selection,selected=false,locked=false,frame=0){const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;c.clearRect(0,0,w,h);if(!selection)return;const crop=A.jar.crops[frame],scale=Math.min(w*.82/crop[2],h*.96/crop[3]),dw=crop[2]*scale,dh=crop[3]*scale;sprite(c,'jar',frame,(w-dw)/2,h-dh,dw,dh);piece(c,selection.familyId,selection.subtype,w*.5,h*.65,h*.31,0,locked?.4:1);if(locked){c.fillStyle='#49345d';c.font='bold '+h*.23+'px sans-serif';c.textAlign='center';c.fillText('⌑',w*.79,h*.42)}}
 const ready=Promise.all([artworkReady,globalThis.SquishyColourFinish?.ready,globalThis.SquishyToyArt?.ready]).then(([artwork])=>artwork);
 function size(w,h){canvas.width=Math.max(1,Math.round(w*2));canvas.height=Math.max(1,Math.round(h*2));for(const jar of jars){jar.width=192;jar.height=120}}
 function draw(recipe,seed,options={}){const c=ctx,w=canvas.width,h=canvas.height,a=SquishyScene04Model.appearance(recipe),anim=options.animation,t=anim?Math.min(1,Math.max(0,options.elapsed/800)):1,bf=options.quiet||!anim||anim.kind==='undo'?0:Math.min(7,Math.floor(t*8));c.clearRect(0,0,w,h);
  const bx=w*.03,by=h*.14,bw=w*.94,bh=h*.83,cx=w*.5,cy=by+bh*.43,rx=bw*.425,ry=bh*.18;
  sprite(c,'bowl',bf,bx,by,bw,bh);
  c.save();c.beginPath();c.moveTo(cx-rx,cy);c.bezierCurveTo(w*.15,h*.76,w*.28,h*.91,cx,h*.92);c.bezierCurveTo(w*.72,h*.91,w*.85,h*.76,cx+rx,cy);c.closePath();const volume=c.createLinearGradient(0,cy,0,h);volume.addColorStop(0,a.a);volume.addColorStop(1,a.b);c.fillStyle=volume;c.globalAlpha=.96;c.fill();c.restore();
  c.save();c.beginPath();c.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);c.clip();const surface=c.createLinearGradient(0,cy-ry,0,cy+ry);surface.addColorStop(0,'#FFFFFF');surface.addColorStop(.12,a.a);surface.addColorStop(.68,a.a);surface.addColorStop(1,a.b);c.fillStyle=surface;c.fillRect(0,0,w,h);
  if(a.swirl){c.save();c.translate(cx,cy);c.scale(rx,ry);c.rotate(recipe.swirlAngle||0);c.lineWidth=.34;for(let k=1;k<a.tones.length;k++){c.strokeStyle=a.tones[k];c.beginPath();for(let i=0;i<=100;i++){const th=i/100*Math.PI*3+k*2*Math.PI/a.tones.length,r=i/100*1.2;const x=Math.cos(th)*r,y=Math.sin(th)*r;i?c.lineTo(x,y):c.moveTo(x,y)}c.stroke()}c.restore()}
  globalThis.SquishyColourFinish?.draw(c,recipe,cx-rx,cy-ry,rx*2,ry*2,{quiet:options.quiet});
  const shine=c.createLinearGradient(0,cy-ry,0,cy+ry);shine.addColorStop(0,'#ffffff77');shine.addColorStop(1,'#ffffff00');c.fillStyle=shine;c.fillRect(0,0,w,h);c.restore();
  const undo=anim?.kind==='undo',displayRecipe=undo?{...recipe,batches:[...recipe.batches,anim.batch]}:recipe;
  const points=M.anchors(displayRecipe,seed,!!options.low),air=[];
  c.save();c.beginPath();c.ellipse(cx,cy+bh*.12,rx,bh*.34,0,0,Math.PI*2);c.clip();
  for(const p of points){const surface=recipe.materialId==='foam',px=cx+p.x*rx*.91,py=cy+p.y*ry*.85+(surface?0:p.z*bh*.20),sz=w*.036*p.size,fall=anim?.batchId===p.batchId&&!options.quiet?Math.min(1,Math.max(0,(t-p.index/24*.22)/.70)):1;
   if(fall<1){air.push({p,px,py,sz,fall});continue}piece(c,p.familyId,p.subtype,px,py,sz,p.rotation,(surface?1:.92-p.z*.36)*(undo&&p.batchId===anim.batch.id?Math.max(0,1-options.elapsed/150):1))}c.restore();
  // Front wall is restored over interior pieces; foam retains surface opacity.
  c.save();c.beginPath();c.rect(bx,cy+ry*.86,bw,h);c.clip();c.globalAlpha=recipe.materialId==='foam'?.12:.30;sprite(c,'bowl',bf,bx,by,bw,bh);c.restore();
  for(const {p,px,py,sz,fall} of air){const eased=fall*fall,x=cx+(px-cx)*fall,y=by-h*.08+(py-by+h*.08)*eased;piece(c,p.familyId,p.subtype,x,y,sz,p.rotation+fall*2,.95)}
  if(globalThis.SquishyToyArt?.images.gel){c.save();c.beginPath();c.moveTo(cx-rx,cy);c.bezierCurveTo(w*.15,h*.76,w*.28,h*.91,cx,h*.92);c.bezierCurveTo(w*.72,h*.91,w*.85,h*.76,cx+rx,cy);c.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);c.clip();c.globalAlpha=.52;SquishyToyArt.gel(c,recipe,[cx-rx*1.17,cy-ry*1.9,rx*2.34,bh*.95],bf);c.restore()}
  c.strokeStyle='#fff8e8aa';c.lineWidth=w*.006;c.beginPath();c.ellipse(cx,cy,rx,ry,0,0,Math.PI);c.stroke();
  if(anim&&!undo&&!options.quiet&&t<.8){const jf=Math.min(7,Math.floor(t/.8*8));sprite(c,'jar',jf,w*.68,h*.01,w*.18,h*.30)}
 }
 return {ready,size,draw,drawJar};
}
globalThis.SquishyScene06Renderer={create};
})();
