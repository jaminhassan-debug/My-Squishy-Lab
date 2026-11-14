/* Shared, offline Web Audio mixer for music, tactile effects and narration. */
(() => {
'use strict';
const api = window.SquishyLabHub;
const defaultSettings = {music:false, effects:true};
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const clips = new Map();
const effects = new Set();
const transitionEffects = new Set();
const loops = new Map();
const lastPlayed = new Map();
const tracks = [
  ['Bubblegum Dreams','bubblegum-dreams'],
  ['Big Bright Squish','big-bright-squish'],
  ['The Perfect Touch','the-perfect-touch']
];
let context, musicBus, effectsBus, musicSource, player, unlocked = false;
let track = 0, failedTracks = 0, playPending = false, resumeNextTrack = false;

let foreground = true;

function settings() {
  if (api) return api.getAudioSettings();
  try { return {...defaultSettings, ...JSON.parse(localStorage.getItem('squishylab.scene02.v1'))?.settings, musicEnabled:false}; }
  catch { return defaultSettings; }
}
function preferences() {
  return SquishyScene15Model.effective(settings(), reduced.matches,
    !!window.SquishyPauseRuntime?.paused || document.hidden || !foreground);
}
function unlock() {
  unlocked = true;
  if (!context) {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return false;
    try {
      context = new Audio();
      musicBus = context.createGain();
      effectsBus = context.createGain();
      musicBus.gain.value = .18;
      effectsBus.gain.value = .72;
      musicBus.connect(context.destination);
      effectsBus.connect(context.destination);
    } catch { return false; }
  }
  if (context.state !== 'running') context.resume().catch(() => {});
  return true;
}

const foley = window.SquishyFoley;
function musicFallback() {
  const rate=22050,buffer=context.createBuffer(1,24*rate,rate),samples=buffer.getChannelData(0);
  function note(midi,start,length,volume) {
    const hz=440*2**((midi-69)/12),offset=Math.round(start*rate);
    for(let i=0;i<length*rate&&offset+i<samples.length;i++) {
      const t=i/rate,phase=2*Math.PI*hz*t;
      const envelope=Math.min(t/.018,1)*(1-t/length)**2;
      samples[offset+i]+=volume*envelope*(Math.sin(phase)+.22*Math.sin(phase*2)*Math.exp(-7*t));
    }
  }
  const chords=[[48,55,64,67],[45,52,60,64],[53,60,64,69],[43,50,59,62]];
  chords.forEach(([bass,fifth,third,high],bar)=>{
    const at=bar*6;
    note(bass,at,3.9,.065);
    [fifth,third,high,third,fifth].forEach((midi,beat)=>note(midi,at+.65+beat*.82,1.65,.046));
  });
  return buffer;
}

function source(name, bus, loop = false, delay = 0, variation = 1) {
  if (!clips.has(name)) clips.set(name, name==='music'?musicFallback():foley.create(context,name));
  const node = context.createBufferSource();
  node.buffer = clips.get(name);
  node.loop = loop;
  node.playbackRate.value = variation;
  node.connect(bus);
  node.onended = () => { effects.delete(node); transitionEffects.delete(node); node.disconnect(); };
  node.start(context.currentTime + delay);
  return node;
}
function stopNode(node) { if (node) node.stop(); }
function stopLoop(name) {
  const loop = loops.get(name);
  if (!loop) return;
  loops.delete(name);
  const now = context.currentTime;
  loop.gain.gain.setTargetAtTime(0, now, .025);
  loop.node.onended = () => { loop.node.disconnect(); loop.gain.disconnect(); };
  loop.node.stop(now + .12);
}
function startLoop(name) {
  if (!foley?.isLoop(name) || loops.has(name) || !unlocked || !preferences().effects || !context) return;
  const gain = context.createGain();
  gain.gain.setValueAtTime(0, context.currentTime);
  gain.gain.setTargetAtTime(.63, context.currentTime, .05);
  gain.connect(effectsBus);
  loops.set(name, {gain, node: source(name, gain, true)});
}
function stopEffects(keepTransitions=false) {
  for (const name of loops.keys()) stopLoop(name);
  for (const node of effects) {
    if (keepTransitions && transitionEffects.has(node)) continue;
    stopNode(node);
    effects.delete(node);
    transitionEffects.delete(node);
  }
}
function pauseMusic() {
  player?.pause();
  stopNode(musicSource);
  musicSource = null;
}
function selectTrack() {
  player.src = 'assets/audio/' + tracks[track][1] + '.mp3';
}
function advanceTrack() {
  track = (track + 1) % tracks.length;
  selectTrack();
  if (playPending) resumeNextTrack = true;
  else playMusic();
}
function playMusic() {
  if (!unlocked || !context || !preferences().music) return;
  if (failedTracks >= tracks.length) {
    if (context.state === 'running' && !musicSource) musicSource = source('music', musicBus, true);
    return;
  }
  if (!player) {
    player = new Audio();
    player.preload = 'none';
    try { context.createMediaElementSource(player).connect(musicBus); }
    catch { player.volume = .18; }
    player.addEventListener('ended', () => { failedTracks = 0; advanceTrack(); });
    player.addEventListener('error', () => {
      failedTracks++;
      if (failedTracks < tracks.length) advanceTrack();
      else playMusic();
    });
    selectTrack();
  }
  if (!player.paused || playPending) return;
  playPending = true;
  player.play().catch(() => {}).finally(() => {
    playPending = false;
    const resume = resumeNextTrack;
    resumeNextTrack = false;
    if (!preferences().music) player.pause();
    else if (resume) playMusic();
  });
}
function stop() {
  pauseMusic();
  stopEffects();
  window.speechSynthesis?.cancel();
}
function apply() {
  const enabled = preferences();
  const quiet = !!settings().quiet;
  document.documentElement.classList.toggle('squishy-quiet', quiet);
  for (const image of document.querySelectorAll('.s9-background')) {
    image.dataset.normalSrc ??= image.getAttribute('src');
    const src = quiet ? 'assets/scene15/quietbackground.png' : image.dataset.normalSrc;
    if (image.getAttribute('src') !== src) image.src = src;
  }
  if (!enabled.effects) stopEffects();
  if (!enabled.voice) window.speechSynthesis?.cancel();
  if (enabled.music) playMusic();
  else pauseMusic();
}
function userGesture() {
  if (!foreground || document.hidden || !unlock()) return;
  apply();
  if (context.state !== 'running') context.resume().then(apply, () => {});
}
function play(name, delay = 0, acrossScenes = false) {
  if (!unlocked || !preferences().effects || !context || effects.size >= 8 || !foley?.has(name)) return;
  const now = performance.now();
  if (now - (lastPlayed.get(name) ?? -Infinity) < 65) return;
  lastPlayed.set(name, now);
  const node=source(name,effectsBus,false,delay,.96+Math.random()*.08);
  effects.add(node);
  if(acrossScenes)transitionEffects.add(node);
}
function touch(material, action='poke', delay=0) {
  if (action==='release') return play(material==='gel'?'release':material+'-release',delay);
  if (action==='stretch') return play('stretch',delay);
  play(action==='squeeze'?material+'-squeeze':material,delay);
}
const bespokeControls = [
  '#cube','#pip','.founders-button','.founders-gestures button',
  '#s4-auto','#s4-blend','[id^="s4-colour-"]','#s5-foam,#s5-gel,#s5-bounce,#s5-squeeze',
  '[id^="s6-jar"]','#s6-bowl','#s6-undo','#s7-pour_button','#s7-pause_flow',
  '#s8-closed_mould','#s9-pull-demo','#s9-tool_0', '#s10-capture','#s10-save','#s12-give','[id^="s11-slot_"]',
  '#s14-confirm','#s14-undo','#squish-auto','#squish-open'
].join(',');
document.addEventListener('click',event=>{
  if(!event.isTrusted)return;
  const control=event.target?.closest?.('button, [role="button"]');
  if(!control||control.disabled||control.getAttribute('aria-disabled')==='true'||control.closest('[inert]')||control.matches(bespokeControls))return;
  const label=[control.id,control.getAttribute('aria-label'),control.textContent].join(' ');
  const sound=/(next|back|previous|page|workshop|close|home|return)/i.test(label)?'turn':
    /look|rotate|front view/i.test(label)?'rotate':
    /shelf|cabinet/i.test(label)?'cabinet':'tap';
  if(!unlocked)userGesture();
  play(sound,0,true);
},true);
document.addEventListener('change',event=>{
  if(event.isTrusted&&event.target?.matches?.('select'))play('turn');
},true);

function speak(text, pitch = 1) {
  if (!preferences().voice || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return false;
  window.speechSynthesis.cancel();
  const line = new SpeechSynthesisUtterance(text);
  line.lang = 'en-GB';
  line.rate = .91;
  line.pitch = pitch;
  line.volume = .48;
  window.speechSynthesis.speak(line);
  return true;
}
for (const event of ['pointerdown', 'pointerup', 'keydown', 'click']) {
  document.addEventListener(event, e => { if (e.isTrusted && (!unlocked || context?.state !== 'running' || (player && player.paused && preferences().music))) userGesture(); }, true);
}
document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else apply(); });
window.addEventListener('blur', () => { foreground = false; stop(); });
window.addEventListener('focus', () => { foreground = true; apply(); });
window.addEventListener('pagehide', stop);
window.addEventListener('pageshow', apply);
window.addEventListener('squishylab:navigate', () => { stopEffects(true); window.speechSynthesis?.cancel(); });
window.SquishyAudio = {apply, stop, userGesture, play, touch, startLoop, stopLoop, speak,
  canEffects: () => preferences().effects, canVoice: () => preferences().voice,
  getStatus: () => ({musicPlaying: !!musicSource || !!player && !player.paused, track: player && !player.paused ? tracks[track][0] : null, unlocked, ...preferences()})};
})();
