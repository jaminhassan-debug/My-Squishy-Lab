/* Prepared frames from the supplied cube clip. One-shot preview, with PNG fallback. */
(() => {
function create(el,options={}){
 const request=options.requestFrame||requestAnimationFrame,cancel=options.cancelFrame||cancelAnimationFrame;
 const image=options.image||new Image();
 const path='assets/scene03/cube/';let ready=false,shape=null,handle=null,generation=0;
 image.onload=()=>{ready=true};image.src=path+'cube_preview_sheet.png';
 function rest(){if(shape==='cube'){el.style.backgroundImage=`url('${path}cube_rest.png')`;el.style.backgroundSize='100% 100%';el.style.backgroundPosition='0% 0%'}}
 function stop(){generation++;if(handle!==null)cancel(handle);handle=null;rest()}
 function setShape(id){stop();shape=id;if(id==='cube')rest();else{el.style.backgroundImage='';el.style.backgroundSize=''}}
 function play(quiet=false){
  stop();if(quiet||shape!=='cube'||!ready)return false;
  const run=generation;let start;
  el.style.backgroundImage=`url('${path}cube_preview_sheet.png')`;el.style.backgroundSize='600% 600%';
  function tick(time){
   if(run!==generation)return;
   if(start===undefined)start=time;
   const elapsed=time-start;if(elapsed>=1500){stop();return}
   const frame=Math.min(35,Math.floor(elapsed*24/1000));
   el.style.backgroundPosition=`${(frame%6)*20}% ${Math.floor(frame/6)*20}%`;
   handle=request(tick);
  }
  handle=request(tick);return true;
 }
 return {setShape,play,stop};
}
globalThis.SquishyScene03Cube={create};
})();
