// ===================== INTRO ANIMATION =====================

export function initIntro(): void {
  // Total animation: 0.1s delay + 6.4s drive = 6.5s → site opens immediately after
  const dur = 6533; // ms — matches animation end
  let done = false;

  function endIntro(): void {
    if (done) return;
    done = true;
    const overlay = document.getElementById('introOverlay');
    if (overlay) overlay.classList.add('done');
  }

  setTimeout(endIntro, dur);

  // Expose global skip function
  (window as any).skipIntro = endIntro;

  function attachWrapListener(): void {
    const wrap = document.getElementById('iCarWrap');
    if (wrap) {
      wrap.addEventListener('animationend', () => {
        setTimeout(endIntro, 40);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachWrapListener);
  } else {
    attachWrapListener();
  }
}

