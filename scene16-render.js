(() => {
'use strict';
const A=SquishyScene16Atlas,images={};const ready=Promise.all(Object.entries(A).map(([key,a])=>new Promise(resolve=>{const im=new Image();im.onload=()=>{images[key]=im;resolve(true)};im.onerror=()=>resolve(false);im.src=a.image})));
function paint(canvas,id,index){canvas.width=canvas.height=96;const x=canvas.getContext('2d');x.clearRect(0,0,96,96);if(images[id])x.drawImage(images[id],...A[id].crops[index],0,0,96,96)}
function icon(index){const el=document.createElement('canvas');paint(el,'icons',index);return el}
function gate(index){const el=document.createElement('canvas');paint(el,'gate',index);return el}
function feedback(canvas,index){paint(canvas,'feedback',index)}
globalThis.SquishyScene16Renderer={ready,icon,gate,feedback};
})();
