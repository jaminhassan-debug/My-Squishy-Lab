(() => {
'use strict';
function create(canvas,paddleCanvas,frontCanvas){
 const c=canvas.getContext('2d'),pc=paddleCanvas.getContext('2d'),front=frontCanvas.getContext('2d'),assets={};
 const sources={bowl:'assets/scene04/bowl_v03.png',liquid:'assets/scene04/gel_v03.png',paddle:'assets/scene04/paddle_v03.png',deposit:'assets/scene04/deposit.png'};
 const artworkReady=Promise.all(Object.entries(sources).map(([name,src])=>new Promise(resolve=>{const im=new Image();im.onload=()=>{assets[name]=im;resolve(true)};im.onerror=()=>resolve(false);im.src=src})));
 const ready=Promise.all([artworkReady,globalThis.SquishyColourFinish?.ready]).then(([artwork])=>artwork);
 function size(w,h){canvas.width=Math.max(1,Math.round(w*2));canvas.height=Math.max(1,Math.round(h*2));paddleCanvas.width=272;paddleCanvas.height=592;frontCanvas.width=canvas.width;frontCanvas.height=canvas.height}
 function bowlPath(ctx,w,h){ctx.beginPath();ctx.moveTo(w*.055,h*.30);ctx.bezierCurveTo(w*.055,h*.045,w*.945,h*.045,w*.945,h*.30);ctx.bezierCurveTo(w*.92,h*.66,w*.82,h*.89,w*.5,h*.91);ctx.bezierCurveTo(w*.18,h*.89,w*.08,h*.66,w*.055,h*.30);ctx.closePath()}
 function glass(ctx,w,h){if(assets.bowl)ctx.drawImage(assets.bowl,40,110,1450,835,0,0,w,h)}
 function draw(recipe,options={}){
  const w=canvas.width,h=canvas.height,a=SquishyScene04Model.appearance(recipe),angle=recipe.swirlAngle||0,phase=((angle/(Math.PI*2))%1+1)%1,frame=options.quiet?0:Math.floor(phase*8)%8;
  c.clearRect(0,0,w,h);c.save();glass(c,w,h);c.save();bowlPath(c,w,h);c.clip();
  const base=c.createLinearGradient(0,h*.12,w,h*.90);base.addColorStop(0,a.a);base.addColorStop(1,a.b);c.fillStyle=base;c.fillRect(0,0,w,h);
  // Marbling now spans the whole visible gel volume.
  if(a.swirl){c.save();c.translate(w*.5,h*.42);c.scale(w*.47,h*.39);c.rotate(angle*.38);c.lineCap='round';for(let k=1;k<a.tones.length;k++){c.strokeStyle=a.tones[k];c.lineWidth=.49/Math.sqrt(a.tones.length);c.beginPath();for(let i=0;i<=160;i++){const t=i/160*Math.PI*4+k*Math.PI*2/a.tones.length,r=i/160*1.75,x=Math.cos(t)*r,y=Math.sin(t)*r;i?c.lineTo(x,y):c.moveTo(x,y)}c.stroke()}c.restore()}
  // Neutral generated relief preserves the recipe hue.
  if(assets.liquid){const im=assets.liquid,cw=im.width/4,ch=im.height/2,sy=frame<4?150:130;c.save();c.globalCompositeOperation='soft-light';c.globalAlpha=.78;c.drawImage(im,(frame%4)*cw+4,Math.floor(frame/4)*ch+sy,cw-8,286,w*.045,h*.10,w*.91,h*.82);c.restore()}
  globalThis.SquishyColourFinish?.draw(c,recipe,w*.055,h*.10,w*.89,h*.81,{quiet:options.quiet,alpha:.93});
  const shade=c.createLinearGradient(0,h*.11,0,h*.91);shade.addColorStop(0,'#ffffff30');shade.addColorStop(.42,'#ffffff00');shade.addColorStop(1,'#24094638');c.fillStyle=shade;c.fillRect(0,0,w,h);
  if(options.deposit!=null&&assets.deposit&&!options.quiet){const im=assets.deposit,f=Math.min(3,Math.floor(options.deposit*4)),cw=im.width/4;c.save();c.globalAlpha=.85;c.drawImage(im,f*cw,0,cw,im.height,w*.40,-h*.14,w*.20,h*.56);c.restore()}
  c.restore();front.clearRect(0,0,w,h);const lip=options.compact?c:front;lip.save();lip.beginPath();lip.rect(0,h*.38,w,h*.62);lip.clip();lip.globalAlpha=.32;glass(lip,w,h);lip.restore();
  lip.strokeStyle='#fff8e8bb';lip.lineWidth=w*.005;lip.beginPath();lip.ellipse(w*.5,h*.30,w*.445,h*.19,0,0,Math.PI);lip.stroke();c.restore();
  pc.clearRect(0,0,272,592);if(assets.paddle){const im=assets.paddle,f=options.quiet?1:Math.floor(phase*4)%4,cw=im.width/4,scale=Math.min(272/cw,592/im.height),dw=cw*scale,dh=im.height*scale;pc.drawImage(im,f*cw,0,cw,im.height,(272-dw)/2,592-dh,dw,dh)}
 }
 return {ready,size,draw};
}
globalThis.SquishyScene04Renderer={create};
})();
