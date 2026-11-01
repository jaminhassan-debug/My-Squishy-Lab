/* One reference board, uniformly fitted to the visible viewport. */
(()=>{'use strict';const root=document.documentElement;root.classList.add('fit-board');
function fit(){const v=window.visualViewport,w=v?.width||innerWidth,h=v?.height||innerHeight,portrait=w<h,bw=portrait?768:1024,bh=portrait?1024:768,pad=8,scale=Math.min((w-pad*2)/bw,(h-pad*2)/bh);globalThis.SquishyViewport={portrait,width:bw,height:bh,scale};root.classList.toggle('board-portrait',portrait);root.style.setProperty('--board-width',bw+'px');root.style.setProperty('--board-height',bh+'px');root.style.setProperty('--board-scale',String(Math.max(.1,scale)));root.style.setProperty('--board-left',((v?.offsetLeft||0)+w/2)+'px');root.style.setProperty('--board-top',((v?.offsetTop||0)+h/2)+'px')}
fit();window.addEventListener('resize',fit);window.visualViewport?.addEventListener('resize',()=>{fit();window.dispatchEvent(new Event('resize'))});window.visualViewport?.addEventListener('scroll',fit);
})();
