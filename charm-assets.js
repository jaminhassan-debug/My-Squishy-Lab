/* Shared generated charm artwork for jars, mixing, pouring, reveal and squishy play. */
(()=>{'use strict';const is=id=>id==='rainbow'||id==='unicorn';let image=null;const ready=new Promise(resolve=>{const im=new Image();im.onload=()=>{image=im;resolve(true)};im.onerror=()=>resolve(false);im.src=globalThis.SquishyEmbeddedImages?.['assets/charms/rainbow-unicorn.png']||'assets/charms/rainbow-unicorn.png'});
function draw(c,id,x,y,w,h){if(!is(id)||!image)return false;const sw=image.width/2,sh=image.height,crop=id==='rainbow'?0:sw;c.drawImage(image,crop,0,sw,sh,x,y,w,h);return true}
globalThis.SquishyCharms={is,draw,ready,get image(){return image}};})();
