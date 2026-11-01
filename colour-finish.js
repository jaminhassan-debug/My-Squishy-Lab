(() => {
'use strict';
const image=new Image(),src='assets/scene04/glitter.png';let loaded=false;
const ready=new Promise(resolve=>{image.onload=()=>{loaded=true;resolve(true)};image.onerror=()=>resolve(false);image.src=globalThis.SquishyEmbeddedImages?.[src]||src});
function draw(c,r,x,y,w,h,options={}){if(r.colourFinish!=='glitter')return;c.save();c.globalAlpha=options.alpha??.8;
 if(loaded){const cw=image.width/4,ch=image.height/2,angle=r.swirlAngle||0,phase=((angle/(Math.PI*2))%1+1)%1,f=options.quiet?0:Math.floor(phase*8)%8;c.drawImage(image,(f%4)*cw,Math.floor(f/4)*ch,cw,ch,x,y,w,h)}
 else{for(let i=0;i<64;i++){const px=x+((i*73+19)%127)/127*w,py=y+((i*47+11)%131)/131*h,s=Math.min(w,h)*(i%5===0?.012:.003);c.fillStyle=['#FFF8ED','#FFE85C','#91FFFF','#FF9CEA'][i%4];c.beginPath();c.ellipse(px,py,s,s,0,0,Math.PI*2);c.fill()}}
 c.restore()}
globalThis.SquishyColourFinish={ready,draw};
})();
