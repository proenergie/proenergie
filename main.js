// FILE: main.js
(() => {
  'use strict';

  // ======================================================
  // 1. CONFIG & ELEMENTS
  // ======================================================
  const DOM = {
    mobileBtn: document.getElementById('mobile-menu-btn'),
    hamburgerIcon: document.getElementById('hamburger-icon'),
    mobileMenu: document.getElementById('mobile-menu'),
    blurOverlay: document.getElementById('page-blur-overlay'),
    footerVideo: document.getElementById('footer-logo'),
    footerFallback: document.getElementById('footer-logo-fallback'),
  };

  const CONFIG = {
    logo: {
      basePath: 'bilder',
      // Dateinamen aus deinem Python-Skript: logo_projekt-64.webm etc.
      webmPattern: (res) => `bilder/logo_projekt-${res}.webm`,
      webpFallback: 'bilder/logo_projekt-512.png',
      timeoutMs: 2500,
    }
  };

  let scrollY = 0;

  // ======================================================
  // 2. UTILS
  // ======================================================
  function isSlowConnection() {
    const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!c) return false;
    return c.saveData || ['slow-2g', '2g'].includes(c.effectiveType) || c.downlink < 1.5;
  }

  function getLogoResolution() {
    const w = window.innerWidth;
    const isSlow = isSlowConnection();
    const isGood =!isSlow;

    if (w >= 1536) return isGood? '512' : '256';
    if (w >= 768) return isGood? '256' : '128';
    return isGood? '128' : '64';
  }

  // ======================================================
  // 3. MOBILE MENU
  // ======================================================
  function setMenuButtonState(isOpen) {
    if (!DOM.mobileBtn) return;
    DOM.mobileBtn.setAttribute('aria-expanded', String(isOpen));
    DOM.mobileBtn.setAttribute('aria-label', isOpen? 'Menü schließen' : 'Menü öffnen');
    if (DOM.hamburgerIcon) DOM.hamburgerIcon.classList.toggle('is-open', isOpen);
  }

  function openMobileMenu() {
    if (!DOM.mobileMenu) return;
    scrollY = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';

    DOM.mobileMenu.classList.add('active');
    if (DOM.blurOverlay) DOM.blurOverlay.classList.add('active');
    document.body.classList.add('menu-open');
    setMenuButtonState(true);
  }

  function closeMobileMenu() {
    if (DOM.mobileMenu) DOM.mobileMenu.classList.remove('active');
    if (DOM.blurOverlay) DOM.blurOverlay.classList.remove('active');

    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';

    document.body.classList.remove('menu-open');
    setMenuButtonState(false);
    window.scrollTo(0, scrollY);
  }

  function toggleSubmenu(id) {
    const sub = document.getElementById(`${id}-submenu`);
    const icon = document.getElementById(`${id}-icon`);
    const button = sub? sub.previousElementSibling : null;
    if (!sub) return;

    const willOpen =!sub.classList.contains('active');
    sub.classList.toggle('active', willOpen);

    if (icon) {
      icon.classList.toggle('fa-chevron-down',!willOpen);
      icon.classList.toggle('fa-chevron-up', willOpen);
    }
    if (button) button.setAttribute('aria-expanded', String(willOpen));
  }

  function initMobileMenu() {
    if (DOM.mobileBtn && DOM.mobileMenu) {
      DOM.mobileBtn.setAttribute('aria-controls', 'mobile-menu');
      DOM.mobileBtn.setAttribute('aria-expanded', 'false');
      DOM.mobileBtn.addEventListener('click', () => {
        DOM.mobileMenu.classList.contains('active')? closeMobileMenu() : openMobileMenu();
      });
    }
    if (DOM.blurOverlay) DOM.blurOverlay.addEventListener('click', closeMobileMenu);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && DOM.mobileMenu?.classList.contains('active')) {
        closeMobileMenu();
        DOM.mobileBtn?.focus();
      }
    });
    document.querySelectorAll('#mobile-menu a').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  // Expose für inline onclick
  window.toggleSubmenu = toggleSubmenu;
  window.closeMobileMenu = closeMobileMenu;

  // ======================================================
  // 4. TEXT COLLAPSE (Vorschau / Ausklappen)
  // ======================================================
  function getCollapseInner(collapse) {
    return collapse?.querySelector('.text-collapse-inner');
  }

  function setCollapseState(collapse, expanded) {
    const inner = getCollapseInner(collapse);
    const button = collapse?.querySelector('.text-collapse-toggle');
    if (!inner ||!button) return;

    const preview = getComputedStyle(collapse).getPropertyValue('--collapse-preview-height').trim() || '4.2em';

    if (expanded) {
      inner.style.maxHeight = `${inner.scrollHeight}px`;
      collapse.classList.add('is-expanded');
      button.setAttribute('aria-expanded', 'true');
      button.setAttribute('aria-label', 'Text einklappen');
    } else {
      inner.style.maxHeight = `${inner.scrollHeight}px`;
      requestAnimationFrame(() => {
        collapse.classList.remove('is-expanded');
        inner.style.maxHeight = preview;
      });
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Text ausklappen');
    }
  }

  function initTextCollapse(collapse) {
    const inner = getCollapseInner(collapse);
    const button = collapse.querySelector('.text-collapse-toggle');
    if (!inner ||!button) return;

    button.addEventListener('click', (e) => {
      e.preventDefault();
      setCollapseState(collapse,!collapse.classList.contains('is-expanded'));
    });

    const media = window.matchMedia('(max-width: 767px)');
    const sync = () => {
      if (media.matches) {
        if (!collapse.classList.contains('is-expanded')) {
          const preview = getComputedStyle(collapse).getPropertyValue('--collapse-preview-height').trim() || '4.2em';
          inner.style.maxHeight = preview;
        }
      } else {
        collapse.classList.remove('is-expanded');
        inner.style.maxHeight = '';
        button.setAttribute('aria-expanded', 'false');
      }
    };
    sync();
    if (media.addEventListener) media.addEventListener('change', sync);
    else media.addListener(sync);
  }

  function initAllCollapses() {
    document.querySelectorAll('.text-collapse').forEach(initTextCollapse);

    // Why-Cards automatisch zu Collapse umbauen
    document.querySelectorAll('#why-cards-grid.why-card').forEach(card => {
      if (card.querySelector('.text-collapse')) return;
      const p = card.querySelector(':scope > p');
      if (!p) return;

      const collapse = document.createElement('div');
      collapse.className = 'text-collapse';
      collapse.style.setProperty('--collapse-preview-height', '4.5em');
      const inner = document.createElement('div');
      inner.className = 'text-collapse-inner';
      p.parentNode.insertBefore(collapse, p);
      inner.appendChild(p);
      collapse.appendChild(inner);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'text-collapse-toggle';
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Text ausklappen');
      btn.innerHTML = '<i aria-hidden="true" class="fas fa-chevron-down"></i>';
      collapse.appendChild(btn);

      initTextCollapse(collapse);
    });

    window.addEventListener('resize', () => {
      document.querySelectorAll('.text-collapse.is-expanded.text-collapse-inner').forEach(inner => {
        inner.style.maxHeight = `${inner.scrollHeight}px`;
      });
    }, { passive: true });
  }

  // ======================================================
  // 5. FOOTER LOGO - Lazy Load + Auto Play/Pause
  // ======================================================
  function showLogoFallback() {
    if (!DOM.footerVideo || !DOM.footerFallback) return;
    DOM.footerVideo.style.display = 'none';
    DOM.footerVideo.pause();
    DOM.footerVideo.removeAttribute('src');
    DOM.footerVideo.innerHTML = '';
    DOM.footerFallback.src = CONFIG.logo.webpFallback;
    DOM.footerFallback.style.display = 'block';
  }

  function loadFooterLogo() {
    const { footerVideo: video, footerFallback: fallback } = DOM;
    if (!video || !fallback) return;

    if (isSlowConnection()) {
      showLogoFallback();
      return;
    }

    const res = getLogoResolution();
    const src = CONFIG.logo.webmPattern(res);
    if (video.dataset.loaded === src) {
      // Schon geladen, nur wieder abspielen
      video.play().catch(()=>{});
      return;
    }

    video.dataset.loaded = src;
    video.innerHTML = `<source src="${src}" type="video/webm">`;

    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      showLogoFallback();
    }, CONFIG.logo.timeoutMs);

    video.addEventListener('canplay', () => {
      if (timedOut) return;
      clearTimeout(timeout);
      video.play().catch(()=>{});
    }, { once: true });

    video.addEventListener('error', () => {
      clearTimeout(timeout);
      showLogoFallback();
    }, { once: true });

    video.load();
  }

  function initFooterLogo() {
    if (!DOM.footerVideo) return;

    if (!('IntersectionObserver' in window)) {
      loadFooterLogo();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Footer kommt ins Bild -> laden / abspielen
          if (DOM.footerVideo.style.display === 'none' && DOM.footerFallback.style.display === 'block') {
            // War im WebP Fallback, bleibt so
            return;
          }
          loadFooterLogo();
        } else {
          // Footer ist raus -> Video pausieren, spart Akku
          if (DOM.footerVideo && !DOM.footerVideo.paused) {
            DOM.footerVideo.pause();
          }
        }
      });
    }, { 
      rootMargin: '300px', // 300px vorher anfangen zu laden
      threshold: 0 // schon bei 1px sichtbar triggern
    });

    observer.observe(DOM.footerVideo);
  }

  // ======================================================
  // 6. LIGHT MODE & URL CLEANUP
  // ======================================================
  function enforceLightAndCleanURL() {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('proenergie-theme');
    const url = new URL(window.location.href);
    if (url.searchParams.has('erscheinungsbild')) {
      url.searchParams.delete('erscheinungsbild');
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    }
  }

  // ======================================================
  // 7. INIT
  // ======================================================
  document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initAllCollapses();
    initFooterLogo();
    enforceLightAndCleanURL();
  });

})();