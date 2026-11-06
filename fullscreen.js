(() => {
  'use strict';
  const root = document.documentElement;
  let launchPending = true;

  async function enter() {
    launchPending = false;
    if (document.fullscreenElement) return true;
    if (!root.requestFullscreen || document.fullscreenEnabled === false) return false;
    try {
      await root.requestFullscreen();
      try { await screen.orientation?.lock?.('landscape'); } catch {}
      return true;
    } catch {
      return false;
    }
  }

  async function toggle() {
    launchPending = false;
    if (!document.fullscreenElement) return enter();
    try {
      await document.exitFullscreen();
      return true;
    } catch {
      return false;
    }
  }

  // Start in the workshop document, where fullscreen survives scene changes.
  document.addEventListener('click', event => {
    if (!launchPending || !event.isTrusted || root.classList.contains('rotate-required')) return;
    if (!event.target.closest('button') || event.target.closest('#s9-fullscreen')) return;
    void enter();
  }, true);

  window.SquishyFullscreen = {toggle};
})();
