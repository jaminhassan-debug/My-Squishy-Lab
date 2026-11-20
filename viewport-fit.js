/* One reference board, uniformly fitted to the visible viewport. */
(()=>{'use strict';const root=document.documentElement;root.classList.add('fit-board');
function fit(){
 const v=window.visualViewport,w=v?.width||innerWidth,h=v?.height||innerHeight;
 const portrait=w<h,bw=portrait?768:1024,bh=portrait?1024:768,scale=Math.min(w/bw,h/bh);
 globalThis.SquishyViewport={portrait,width:bw,height:bh,scale};
 root.classList.toggle('board-portrait',portrait);
 root.classList.remove('rotate-required');
 const gate=document.getElementById('landscape-gate');
 if(gate)gate.hidden=true;
 root.style.setProperty('--board-width',w/scale+'px');
 root.style.setProperty('--board-height',h/scale+'px');
 root.style.setProperty('--board-scale',String(Math.max(.1,scale)));
 root.style.setProperty('--board-left',((v?.offsetLeft||0)+w/2)+'px');
 root.style.setProperty('--board-top',((v?.offsetTop||0)+h/2)+'px');
}
document.addEventListener('DOMContentLoaded',fit);
fit();
window.addEventListener('resize',fit);
window.visualViewport?.addEventListener('resize',()=>{fit();window.dispatchEvent(new Event('resize'))});
window.visualViewport?.addEventListener('scroll',fit);

const gameSurface = 'main, #squish-overlay, #s13-overlay, #s15-overlay, #s16-overlay';
const editable = 'input, textarea, [contenteditable]:not([contenteditable="false"])';
function blockNativeLongPress(event) {
  const target = event.target;
  if (target?.closest?.(gameSurface) && !target.closest(editable)) {
    event.preventDefault();
  }
}
document.addEventListener('contextmenu', blockNativeLongPress, {capture:true, passive:false});
document.addEventListener('selectstart', blockNativeLongPress, {capture:true, passive:false});
})();
