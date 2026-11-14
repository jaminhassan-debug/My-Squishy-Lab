/* Shared, offline Web Audio mixer for music, tactile effects and narration. */
(() => {
'use strict';
const api = window.SquishyLabHub;
const defaultSettings = {music:false, effects:true};
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const clips = new Map();
const effects = new Set();
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

const rate = 22050;
const tau = 2 * Math.PI;
const tones = {
  tap: [.11, 440, 310, .06, .08],
  mould: [.16, 390, 245, .09, .14],
  pigment: [.21, 360, 155, .13, .16],
  pick: [.11, 610, 460, .05, .08],
  drop: [.19, 540, 220, .12, .12],
  undo: [.15, 385, 240, .08, .07],
  foam: [.23, 175, 87, .13, .19],
  gel: [.28, 300, 83, .19, .13],
  bounce: [.24, 450, 132, .14, .06],
  release: [.15, 150, 380, .09, .06],
  peel: [.39, 263, 87, .07, .25],
  land: [.25, 175, 63, .16, .09],
  shutter: [.13, 740, 270, .04, .23]
};
const phrases = {
  confirm: [64, 69],
  gift: [67, 71, 74],
  reward: [60, 64, 67, 72],
  decorate: [62, 69, 74]
};

function makeClip(name) {
  const spec = tones[name];
  const phrase = phrases[name];
  const bed = name === 'music';
  const liquid = name === 'pour' || name === 'stir';
  const duration = spec?.[0] ?? (phrase ? .18 * phrase.length + .23 : bed ? 24 : 2);
  const buffer = context.createBuffer(1, Math.round(rate * duration), rate);
  const samples = buffer.getChannelData(0);
  let seed = 34537, filtered = 0, phase = 0;

  if (spec || liquid) {
    for (let i = 0; i < samples.length; i++) {
      const time = i / rate;
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const noise = seed / 2147483648 - 1;
      filtered += (noise - filtered) * (name === 'peel' ? .25 : .08);
      if (liquid) {
        const motion = name === 'pour' ? .76 + .14 * Math.sin(tau * 7 * time) : .55 + .35 * Math.sin(tau * 2 * time);
        const bubbles = Math.sin(tau * (name === 'pour' ? 94 : 112) * time + 1.8 * Math.sin(tau * 5 * time));
        const edge = Math.min(1, time * 28, (duration - time) * 28);
        samples[i] = edge * motion * (filtered * .35 + bubbles * .024);
      } else {
        const [, from, to, body, texture] = spec;
        const progress = time / duration;
        phase += tau * (to + (from - to) * Math.exp(-4 * progress)) / rate;
        const impact = Math.min(1, time * 185) * (1 - progress) ** 2;
        samples[i] = impact * (body * (Math.sin(phase) + .24 * Math.sin(2 * phase)) + texture * filtered);
      }
    }
  } else {
    function note(midi, start, length, volume) {
      const hz = 440 * 2 ** ((midi - 69) / 12);
      const startSample = Math.round(start * rate);
      for (let i = 0; i < length * rate && startSample + i < samples.length; i++) {
        const time = i / rate;
        const phase = tau * hz * time;
        const envelope = Math.min(time / .018, 1) * (1 - time / length) ** 2;
        samples[startSample + i] += volume * envelope * (Math.sin(phase) + .22 * Math.sin(phase * 2) * Math.exp(-7 * time));
      }
    }
    if (bed) {
      const chords = [[48,55,64,67],[45,52,60,64],[53,60,64,69],[43,50,59,62]];
      chords.forEach(([bass, fifth, third, high], bar) => {
        const at = bar * 6;
        note(bass, at, 3.9, .065);
        [fifth, third, high, third, fifth].forEach((midi, beat) =>
          note(midi, at + .65 + beat * .82, 1.65, .046));
      });
    } else {
      phrase?.forEach((midi, beat) => note(midi, beat * .085, .29, .095));
    }
  }
  return buffer;
}

function source(name, bus, loop = false, delay = 0, variation = 1) {
  if (!clips.has(name)) clips.set(name, makeClip(name));
  const node = context.createBufferSource();
  node.buffer = clips.get(name);
  node.loop = loop;
  node.playbackRate.value = variation;
  node.connect(bus);
  node.onended = () => { effects.delete(node); node.disconnect(); };
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
  if (loops.has(name) || !unlocked || !preferences().effects || !context) return;
  const gain = context.createGain();
  gain.gain.setValueAtTime(0, context.currentTime);
  gain.gain.setTargetAtTime(.63, context.currentTime, .05);
  gain.connect(effectsBus);
  loops.set(name, {gain, node: source(name, gain, true)});
}
function stopEffects() {
  for (const name of loops.keys()) stopLoop(name);
  for (const node of effects) stopNode(node);
  effects.clear();
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
function play(name, delay = 0) {
  if (!unlocked || !preferences().effects || !context || effects.size >= 8 || !(name in tones || name in phrases)) return;
  const now = performance.now();
  if (now - (lastPlayed.get(name) ?? -Infinity) < 65) return;
  lastPlayed.set(name, now);
  effects.add(source(name, effectsBus, false, delay, .94 + Math.random() * .12));
}
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
window.addEventListener('squishylab:navigate', () => { stopEffects(); window.speechSynthesis?.cancel(); });
window.SquishyAudio = {apply, stop, userGesture, play, startLoop, stopLoop, speak,
  canEffects: () => preferences().effects, canVoice: () => preferences().voice,
  getStatus: () => ({musicPlaying: !!musicSource || !!player && !player.paused, track: player && !player.paused ? tracks[track][0] : null, unlocked, ...preferences()})};
})();
