const stage=document.getElementById('stage'),cube=document.getElementById('cube'),pip=document.getElementById('pip'),panel=document.getElementById('panel'),status=document.getElementById('status');
let quiet=matchMedia('(prefers-reduced-motion: reduce)').matches,blinkTimer,releaseTimer,pipTimer,previousFocus;
function applyQuiet(){stage.classList.toggle('quiet',quiet);document.getElementById('quiet').setAttribute('aria-pressed',String(quiet));document.getElementById('motion-toggle').setAttribute('aria-pressed',String(quiet));document.getElementById('motion-toggle').textContent=quiet?'Resume ambient motion':'Pause ambient motion';if(quiet)pip.classList.remove('blink');}
function release(){cube.classList.remove('pressed');cube.classList.add('released');clearTimeout(releaseTimer);releaseTimer=setTimeout(()=>cube.classList.remove('released'),950);}
cube.addEventListener('pointerdown',e=>{cube.setPointerCapture(e.pointerId);cube.classList.remove('released');cube.classList.add('pressed')});
for(const event of ['pointerup','pointercancel','lostpointercapture'])cube.addEventListener(event,release);
cube.addEventListener('click',e=>{if(e.detail===0){cube.classList.add('pressed');setTimeout(release,250)}});
pip.addEventListener('click',()=>{clearTimeout(pipTimer);pip.classList.remove('blink');pip.classList.add('delight');pipTimer=setTimeout(()=>pip.classList.remove('delight'),1100)});
function openPanel(title,copy){previousFocus=document.activeElement;panel.hidden=false;document.getElementById('panel-title').textContent=title;document.getElementById('panel-copy').textContent=copy;cube.disabled=pip.disabled=document.getElementById('play').disabled=document.getElementById('grown').disabled=true;document.getElementById('close-panel').focus()}
function closePanel(){panel.hidden=true;cube.disabled=pip.disabled=document.getElementById('play').disabled=document.getElementById('grown').disabled=false;previousFocus?.focus()}
document.getElementById('play').addEventListener('click',()=>{if(document.getElementById('play').disabled)return;document.getElementById('play').disabled=true;window.dispatchEvent(new CustomEvent('squishylab:play',{detail:{scene:'01',nextScene:'02'}}));window.location.href='../preview.html#workshop';});
document.getElementById('grown').addEventListener('click',()=>openPanel('Grown-up preview controls','This panel controls the artwork preview only. Quiet preview stops ambient wobble and blinking. It is not a parental security gate.'));
document.getElementById('close-panel').addEventListener('click',closePanel);
panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closePanel()}if(e.key==='Tab'){const a=document.getElementById('quiet'),b=document.getElementById('close-panel');if(e.shiftKey&&document.activeElement===a){e.preventDefault();b.focus()}else if(!e.shiftKey&&document.activeElement===b){e.preventDefault();a.focus()}}});
for(const id of ['quiet','motion-toggle'])document.getElementById(id).addEventListener('click',()=>{quiet=!quiet;applyQuiet()});
function blink(){clearTimeout(blinkTimer);if(!document.hidden&&!quiet&&panel.hidden&&!pip.classList.contains('delight')){pip.classList.add('blink');setTimeout(()=>pip.classList.remove('blink'),140)}blinkTimer=setTimeout(blink,4300)}
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(blinkTimer);release();pip.classList.remove('blink')}else blink()});
window.addEventListener('blur',release);applyQuiet();blinkTimer=setTimeout(blink,3400);

// Grown-up controls route through the local symbol gate.
document.getElementById('grown').addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();try{sessionStorage.setItem('squishylab.parent.return','01')}catch{}window.location.href='../preview.html#scene16'},true);

window.addEventListener('pageshow',()=>{document.getElementById('play').disabled=false});
