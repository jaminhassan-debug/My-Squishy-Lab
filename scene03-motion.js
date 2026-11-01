/* Free local animation assets. Cancellable, interruptible and reduced-motion aware. */
(() => {
const clips={
 anim_mould_pick:{duration:320,keyframes:[{transform:'translateY(0) scale(1)'},{transform:'translateY(-18px) scale(1.035)',offset:.45},{transform:'translateY(3px) scale(1.02,.98)',offset:.8},{transform:'translateY(0) scale(1)'}]},
 anim_shape_swap:{duration:300,keyframes:[{opacity:.25,transform:'translateY(12px) scale(.9)'},{opacity:1,transform:'translateY(-8px) scale(1.025)',offset:.65},{opacity:1,transform:'translateY(0) scale(1)'}]},
 anim_button:{duration:160,keyframes:[{transform:'scale(1)'},{transform:'scale(.94)',offset:.45},{transform:'scale(1)'}]},
 anim_pip_delight:{duration:650,keyframes:[{transform:'translateY(0)'},{transform:'translateY(-10px) rotate(-4deg)',offset:.4},{transform:'translateY(0) rotate(0)'}]},
 anim_help:{duration:900,keyframes:[{boxShadow:'0 0 0 0 #fff6e700'},{boxShadow:'0 0 0 8px #fff6e7',offset:.5},{boxShadow:'0 0 0 0 #fff6e700'}]},
 anim_scene:{duration:220,keyframes:[{opacity:0},{opacity:1}]}
};
const running=new Map();
function stop(el){running.get(el)?.cancel();running.delete(el)}
function play(el,id,quiet=false){stop(el);if(quiet||!el.animate||!clips[id])return;const a=el.animate(clips[id].keyframes,{duration:clips[id].duration,easing:'cubic-bezier(.2,.7,.25,1)'});running.set(el,a);a.finished.then(()=>{if(running.get(el)===a)running.delete(el)}).catch(()=>{});return a}
function stopAll(){for(const el of running.keys())stop(el)}
globalThis.SquishyScene03Motion={clips,play,stop,stopAll};
})();
