(() => {
'use strict';
function create(canvas){const c=canvas.getContext('2d'),A=SquishyScene15Atlas,images={};let ref=[1024,768],layout=Object.fromEntries(Object.entries(SquishyScene15Layout).map(([k,r])=>[k,r.landscape]));const ready=Promise.all(Object.entries(A).filter(([k])=>k!=='quietbackground').map(([key,a])=>new Promise(resolve=>{const im=new Image();im.onload=()=>{images[key]=im;resolve(true)};im.onerror=()=>resolve(false);im.src=a.image})));
function size(w,h,portrait=false){ref=portrait?[768,1024]:[1024,768];canvas.width=Math.max(1,Math.round(w*1.5));canvas.height=Math.max(1,Math.round(h*1.5));layout=Object.fromEntries(Object.entries(SquishyScene15Layout).map(([k,r])=>[k,r[portrait?'portrait':'landscape']]))}
function sprite(ctx,id,f,rect){if(!images[id])return;const a=A[id].crops[f];ctx.drawImage(images[id],...a,...rect)}
function draw({elapsed=0,quiet=false,reduced=false,help=false}={}){c.setTransform(canvas.width/ref[0],0,0,canvas.height/ref[1],0,0);c.clearRect(0,0,...ref);sprite(c,'panel',0,layout.panel);const pf=quiet||reduced?2:Math.min(3,Math.floor(elapsed/160));if(!help)sprite(c,'pip',pf,[ref[0]*.43,ref[1]*.68,ref[0]*.14,ref[1]*.12])}
function icon(canvas,index){canvas.width=canvas.height=96;const x=canvas.getContext('2d');x.clearRect(0,0,96,96);sprite(x,'icons',index,[0,0,96,96])}
function help(canvas,index,elapsed=0,animate=false){canvas.width=480;canvas.height=200;const x=canvas.getContext('2d');x.clearRect(0,0,480,200);const f=animate?Math.min(7,index+Math.min(1,Math.floor(elapsed/350))):index;sprite(x,'guide',f,[140,0,200,200])}
return {ready,size,draw,icon,help};}
globalThis.SquishyScene15Renderer={create};
})();
