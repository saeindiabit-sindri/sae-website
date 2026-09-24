import './styles/main.css';
import './styles/intro.css';
import { initIntro } from './intro';
import { renderAll, initRouter, initMobileNav } from './app';

// Initialize intro animation
initIntro();

function startApp(): void {
  renderAll();
  initRouter();
  initMobileNav();
}

// Initialize app after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}

