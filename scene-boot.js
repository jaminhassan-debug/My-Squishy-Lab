/* Hide all scenes before controllers resolve the destination. No scene is revealed by this gate. */
(()=>{'use strict';const root=document.documentElement;root.classList.add('lab-booting');
const route=hash=>{if(hash==='#workshop')return 'stage';const n=Number(hash.replace('#scene',''));return n>=4&&n<=16?(n===13||n===15||n===16?'s'+n+'-overlay':'s'+n+'-stage'):'scene03'};
let ready=false,queued=false;
function check(){if(queued||!ready)return;const target=document.getElementById(route(location.hash));if(!target||target.hidden)return;queued=true;requestAnimationFrame(()=>requestAnimationFrame(()=>{queued=false;const current=document.getElementById(route(location.hash));if(!current||current.hidden)return;root.classList.remove('lab-booting');document.getElementById('lab-boot')?.remove();observer.disconnect()}))}
const observer=new MutationObserver(check);observer.observe(root,{subtree:true,attributes:true,attributeFilter:['hidden'],childList:true});
document.addEventListener('DOMContentLoaded',()=>{const cover=document.createElement('div');cover.id='lab-boot';cover.setAttribute('role','status');cover.textContent='Opening your workshop…';document.body.append(cover);ready=true;check()},{once:true});window.addEventListener('hashchange',check);
window.SquishyBoot={route,check};})();
