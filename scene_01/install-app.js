(() => {
  'use strict';
  let installPrompt;
  let button;

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    if (button) button.hidden = false;
  });
  window.addEventListener('appinstalled', () => {
    installPrompt = undefined;
    if (button) button.hidden = true;
  });

  document.addEventListener('DOMContentLoaded', () => {
    button = document.getElementById('install-app');
    button.hidden = !installPrompt;
    button.addEventListener('click', async () => {
      const prompt = installPrompt;
      if (!prompt) return;
      installPrompt = undefined;
      button.hidden = true;
      try { await prompt.prompt(); }
      catch { /* The browser may dismiss the prompt when the page loses focus. */ }
    });
  }, {once: true});
})();
