(() => {
  'use strict';
  const dialog = document.getElementById('founders-dialog');
  if (!dialog) return;
  const closeButton = dialog.querySelector('form button');
  const intro = dialog.querySelector('.founders-intro');
  const guide = dialog.querySelector('.founders-squish-guide');
  const demo = guide.querySelector('.founders-demo');
  const tip = guide.querySelector('.founders-tip');
  const gestures = [...guide.querySelectorAll('button[data-gesture]')];
  const speak = dialog.querySelector('.founders-speak');
  const tryIt = dialog.querySelector('.founders-try');
  const voiceStatus = dialog.querySelector('.founders-voice-status');
  const stories = {
    poke: ['Jaida','Tap one spot with one finger, then lift it and watch the dent spring back.'],
    squeeze: ['EEva','Press and hold your squishy. Let go when you’re ready and watch it puff back up.'],
    stretch: ['Jaida','Place two fingers on your squishy and slide them gently apart. Lift both fingers to let it return.']
  };
  let trigger, gesture, guideOpen = false;
  function select(id) {
    gesture = id;
    const [name, text] = stories[id];
    tip.textContent = name + ' says: ' + text;
    demo.dataset.gesture = id;
    for (const button of gestures) button.setAttribute('aria-pressed', String(button.dataset.gesture === id));
    tryIt.hidden = id === 'poke' || !trigger?.classList.contains('founders-play');
  }
  for (const button of document.querySelectorAll('.founders-button')) {
    button.addEventListener('click', () => {
      trigger = button;
      if (button.classList.contains('founders-play')) closeButton.textContent = 'Back to squishing';
      else closeButton.textContent = button.classList.contains('founders-welcome') ? 'Back to welcome' : 'Back to Workshop';
      guideOpen = !button.classList.contains('founders-welcome');
      guide.hidden = !guideOpen;
      intro.hidden = guideOpen;
      voiceStatus.textContent = '';
      tryIt.hidden = true;
      if (guideOpen) select('poke');
      dialog.classList.toggle('squishy-quiet', !!window.SquishyLabHub?.getAudioSettings().quiet);
      window.SquishyAudio?.play('tap');
      dialog.showModal();
    });
  }
  for (const button of gestures) button.addEventListener('click', () => {
    select(button.dataset.gesture);
    voiceStatus.textContent = '';
    window.SquishyAudio?.play('tap');
  });
  speak.addEventListener('click', () => {
    const audio = window.SquishyAudio;
    if (!audio?.canVoice()) {
      voiceStatus.textContent = 'Turn on Voice and turn off Quiet in the game’s pause menu to hear tips.';
      return;
    }
    const words = guideOpen ? stories[gesture][1] : 'Hello! We’re Jaida and EEva. Come and make a squishy with us.';
    const pitch = guideOpen && stories[gesture][0] === 'EEva' ? 1.14 : 1.02;
    voiceStatus.textContent = audio.speak(words, pitch) ? '' : 'Spoken tips are unavailable on this device.';
  });
  tryIt.addEventListener('click', () => {
    dialog.close();
    const scene = window.SquishyLabScene09;
    if (gesture === 'squeeze') scene?.squeeze();
    if (gesture === 'stretch') scene?.pullDemo();
  });
  dialog.addEventListener('close', () => {
    window.speechSynthesis?.cancel();
    if (trigger?.getClientRects().length) trigger.focus();
  });
  window.addEventListener('squishylab:navigate', () => {
    if (dialog.open) dialog.close();
  });
})();
