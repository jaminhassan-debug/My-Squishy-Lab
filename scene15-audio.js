/* Soft procedural ambient pad. No network audio or backlog of scheduled cues. */
(() => {
'use strict';
let ctx=null,voices=[],unlocked=false;const api=window.SquishyLabHub;
function effective(){return SquishyScene15Model.effective(api.getState().settings,matchMedia('(prefers-reduced-motion: reduce)').matches,!!SquishyPauseRuntime.paused||document.hidden)}
function stop(){for(const node of voices)try{node.stop();node.disconnect()}catch{}voices=[];try{ctx?.suspend()}catch{}}
function apply(){const e=effective();document.documentElement.classList.toggle('squishy-quiet',!!api.getState().settings.quiet);for(const im of document.querySelectorAll('.s9-background')){im.dataset.normalSrc??=im.getAttribute('src');const src=api.getState().settings.quiet?'assets/scene15/quietbackground.png':im.dataset.normalSrc;if(im.getAttribute('src')!==src)im.src=src}if(!e.music||!unlocked){stop();return}if(voices.length)return;try{ctx??=new(window.AudioContext||window.webkitAudioContext)();ctx.resume().catch(()=>{});const mix=ctx.createGain();mix.gain.value=.005;mix.connect(ctx.destination);for(const hz of [130.81,164.81,196]){const osc=ctx.createOscillator();osc.type='sine';osc.frequency.value=hz;osc.connect(mix);osc.start();voices.push(osc)}voices.push({stop(){mix.disconnect()},disconnect(){}})}catch{stop()}}
function userGesture(){unlocked=true;apply()}
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});window.addEventListener('blur',stop);window.addEventListener('pagehide',stop);
window.SquishyAudio={apply,stop,userGesture,canEffects:()=>effective().effects,canVoice:()=>effective().voice,getStatus:()=>({musicPlaying:voices.length>0,unlocked,...effective()})};
})();
