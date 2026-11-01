/* Supplied Gemini clip: optional view-only help, never a selection or reward. */
(() => {
function create(video,{quiet,announce}){
 let generation=0;
 function stop(){generation++;video.pause();video.controls=!quiet()}
 function hide(){stop();video.hidden=true}
 async function show(){
  const request=++generation;video.pause();video.hidden=false;video.controls=!quiet();
  try{video.currentTime=0}catch{}
  if(quiet()){announce('Mould demonstration shown as a still in Quiet or reduced-motion mode.');return false}
  try{
   await video.play();
   if(request!==generation){video.pause();return false}
   announce('Mould demonstration playing. Your selected shape stays the same.');return true;
  }catch{
   if(request===generation)announce('Use the video play control to watch the moulds.');return false;
  }
 }
 video.addEventListener('play',()=>{if(quiet())stop()});
 video.addEventListener('error',()=>{stop();announce('The mould video could not load. You can keep choosing shapes.');video.hidden=true});
 return {show,hide,stop};
}
globalThis.SquishyScene03Video={create};
})();
