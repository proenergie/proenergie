(() => {
  'use strict';
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
      basePath: '/bilder',
      webmPattern: (res) => `/bilder/logo_projekt-${res}.webm`,
      webpFallback: '/bilder/logo_projekt-512.webp',
      timeoutMs: 2500,
    }
  };
  const SUBMENU_IDS = ['leistungen', 'druckluft-effizienz'];
  const MENU_KEY = 'menu';
  const STATE_KEYS = [...SUBMENU_IDS, MENU_KEY];
  const INDEX_PATHS = ['/', '/index.html', '/index.htm', ''];
  function isIndexPage(path = location.pathname) {
    const p = path.toLowerCase();
    return INDEX_PATHS.includes(p) || p.endsWith('/index.html') || p === '';
  }
  let scrollY = 0;

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
  function setMenuButtonState(isOpen) {
    if (!DOM.mobileBtn) return;
    DOM.mobileBtn.setAttribute('aria-expanded', String(isOpen));
    DOM.mobileBtn.setAttribute('aria-label', isOpen? 'Menü schließen' : 'Menü öffnen');
    if (DOM.hamburgerIcon) DOM.hamburgerIcon.classList.toggle('is-open', isOpen);
  }
  function openMobileMenu() {
    if (!DOM.mobileMenu) return;
    // KEIN position:fixed mehr - damit bleibt Springen möglich
    DOM.mobileMenu.classList.add('active');
    if (DOM.blurOverlay) DOM.blurOverlay.classList.add('active');
    document.body.classList.add('menu-open');
    setMenuButtonState(true);
    updateHashFromDOM();
  }

  function closeMobileMenu({ updateHash = true } = {}) {
    if (DOM.mobileMenu) DOM.mobileMenu.classList.remove('active');
    if (DOM.blurOverlay) DOM.blurOverlay.classList.remove('active');
    document.body.classList.remove('menu-open');
    setMenuButtonState(false);
    if (updateHash) updateHashFromDOM();
  }
  function getHashParams() {
    return new URLSearchParams(location.hash.replace(/^#/, ''));
  }
  function setHashParams(params) {
    const str = params.toString();
    const url = str? `#${str}` : (location.pathname + location.search);
    history.replaceState(null, '', url);
  }
  function cleanHashForNonIndexPage() {
    if (isIndexPage()) return;
    const params = getHashParams();
    if (params.has('anfrage')) {
      params.delete('anfrage');
      setHashParams(params);
    }
  }
  function setSubmenuState(id, isOpen) {
    const sub = document.getElementById(`${id}-submenu`);
    const icon = document.getElementById(`${id}-icon`);
    const button = sub?.previousElementSibling || document.querySelector(`[aria-controls="${id}-submenu"]`);
    if (!sub) return;
    sub.classList.toggle('active', isOpen);
    if (icon) {
      icon.classList.toggle('fa-chevron-down',!isOpen);
      icon.classList.toggle('fa-chevron-up', isOpen);
    }
    if (button) button.setAttribute('aria-expanded', String(isOpen));
  }
  function buildStateParams() {
    const params = new URLSearchParams();
    SUBMENU_IDS.forEach(id => {
      const sub = document.getElementById(`${id}-submenu`);
      const isOpen = sub?.classList.contains('active') || document.documentElement.classList.contains(`preopen-${id}`);
      if (isOpen) params.set(id, '1');
    });
    const menuIsOpen = DOM.mobileMenu?.classList.contains('active') || document.documentElement.classList.contains('menu-preopen') || document.documentElement.classList.contains(`preopen-${MENU_KEY}`);
    if (menuIsOpen) params.set(MENU_KEY, '1');
    // anfrage immer als 1 normalisieren, nie leer
    getHashParams().forEach((value, key) => {
      if (!STATE_KEYS.includes(key)) {
        params.set(key, '1');
      }
    });
    return params;
  }
  function updateHashFromDOM() {
    if (document.documentElement.classList.contains('menu-preopen')) return;
    setHashParams(buildStateParams());
    syncHashToInternalLinks();
  }
  function syncHashToInternalLinks() {
    document.querySelectorAll('a[href$="/"], a[href*="/#"]').forEach(a => {
      if (a.hostname!== location.hostname) return;
      try {
        const originalUrl = new URL(a.href, location.href);
        const originalHashParams = new URLSearchParams(originalUrl.hash.replace(/^#/, ''));
        const stateParams = buildStateParams();
        originalHashParams.forEach((value, key) => {
          if (!STATE_KEYS.includes(key)) stateParams.set(key, '1');
        });
        originalUrl.hash = stateParams.toString()? `#${stateParams.toString()}` : '';
        a.href = originalUrl.toString();
      } catch (e) {}
    });
  }

  // NEU: Einmalig genutzte Sprung-Keys (z.B. "anfrage") nach dem Sprung wieder
  // aus dem Hash entfernen. Ohne das blieb z.B. "anfrage=1" für immer im Hash
  // "kleben" (buildStateParams() übernimmt unbekannte Hash-Keys automatisch in
  // JEDEN neuen Hash), wodurch jeder weitere Menü-Klick am Desktop wieder zum
  // Kontaktformular zurückgesprungen ist, statt zum eigentlichen Ziel.
  function clearOneOffKeys(keysUsed) {
    if (!keysUsed || !keysUsed.length) return;
    const params = getHashParams();
    let changed = false;
    keysUsed.forEach(k => {
      if (params.has(k)) {
        params.delete(k);
        changed = true;
      }
    });
    if (changed) {
      setHashParams(params);
      syncHashToInternalLinks();
    }
  }

  function jumpToId(id) {
    const el = document.getElementById(id);
    if (!el) return;
    // SPRUNG, kein Scroll - instant
    el.scrollIntoView({ behavior: 'auto', block: 'start' });
  }

  function applyHashState() {
    const params = getHashParams();
    const hasAnyParam = [...params.keys()].length > 0;
    if (!hasAnyParam) {
      const isMobile = window.matchMedia('(pointer: coarse), (hover: none), (max-width: 1279px)').matches;
      if (isMobile) {
        SUBMENU_IDS.forEach(id => setSubmenuState(id, true));
        updateHashFromDOM();
      }
      syncHashToInternalLinks();
      // Nach Seitenwechsel von Unterseite
      const stored = sessionStorage.getItem('jumpTo');
      if (stored && isIndexPage()) {
        sessionStorage.removeItem('jumpTo');
        jumpToId(stored);
      }
      return;
    }
    SUBMENU_IDS.forEach(id => setSubmenuState(id, params.has(id)));
    if (params.has(MENU_KEY)) {
      if (DOM.mobileMenu &&!DOM.mobileMenu.classList.contains('active')) {
        DOM.mobileMenu.classList.add('active');
        if (DOM.blurOverlay) DOM.blurOverlay.classList.add('active');
        document.body.classList.add('menu-open');
        setMenuButtonState(true);
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (DOM.mobileMenu) DOM.mobileMenu.style.transition = '';
          if (DOM.blurOverlay) DOM.blurOverlay.style.transition = '';
          document.documentElement.classList.remove('menu-preopen');
          document.documentElement.className = document.documentElement.className.replace(/preopen-\S+/g, '').replace(/\s{2,}/g, ' ').trim();
          setTimeout(() => {
            closeMobileMenu();
            // NEU: hier nicht nur MENU_KEY entfernen, sondern auch alle
            // Nicht-State-Keys (z.B. "anfrage") - die wurden weiter unten
            // bereits per jumpToId() konsumiert und dürfen nicht im Hash
            // "kleben" bleiben.
            const cleaned = new URLSearchParams();
            params.forEach((value, key) => {
              if (STATE_KEYS.includes(key) && key !== MENU_KEY) {
                cleaned.set(key, value);
              }
            });
            setHashParams(cleaned);
            syncHashToInternalLinks();
          }, 150);
        });
      });
    } else {
      document.documentElement.classList.remove('menu-preopen');
      document.documentElement.className = document.documentElement.className.replace(/preopen-\S+/g, '').replace(/\s{2,}/g, ' ').trim();
      syncHashToInternalLinks();
    }
    // Direkter Aufruf /#anfrage=1 oder nach Seitenwechsel
    const stored = sessionStorage.getItem('jumpTo');
    if (stored && isIndexPage()) {
      sessionStorage.removeItem('jumpTo');
      jumpToId(stored);
      // NEU: auch hier den einmalig genutzten Key wieder aus dem Hash entfernen
      clearOneOffKeys([stored]);
    } else {
      const jumped = [];
      params.forEach((v, k) => {
        if (!STATE_KEYS.includes(k)) {
          jumpToId(k);
          jumped.push(k);
        }
      });
      // NEU: einmalig genutzte Keys (z.B. "anfrage") nicht dauerhaft im Hash lassen
      clearOneOffKeys(jumped);
    }
  }

  function toggleSubmenu(id) {
    const sub = document.getElementById(`${id}-submenu`);
    if (!sub) return;
    const willOpen =!sub.classList.contains('active');
    setSubmenuState(id, willOpen);
    updateHashFromDOM();
  }
  function initMobileMenu() {
    if (DOM.mobileBtn && DOM.mobileMenu) {
      DOM.mobileBtn.setAttribute('aria-controls', 'mobile-menu');
      DOM.mobileBtn.setAttribute('aria-expanded', 'false');
      DOM.mobileBtn.addEventListener('click', () => {
        DOM.mobileMenu.classList.contains('active')? closeMobileMenu() : openMobileMenu();
      });
    }
    if (DOM.blurOverlay) DOM.blurOverlay.addEventListener('click', () => closeMobileMenu());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && DOM.mobileMenu?.classList.contains('active')) {
        closeMobileMenu();
        DOM.mobileBtn?.focus();
      }
    });
  }
  function initScrollLinks() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"], a[href*="/#"]');
      if (!link) return;
      let key = '';
      let targetUrl = null;
      try {
        targetUrl = new URL(link.href, location.href);
        key = targetUrl.hash.replace(/^#/, '').split('=')[0].split('&')[0];
      } catch {
        key = (link.getAttribute('href') || '').replace(/^#/, '').split('=')[0].split('&')[0];
      }
      if (!key || STATE_KEYS.includes(key)) return;
      const isMenuOpen = DOM.mobileMenu?.classList.contains('active');
      const targetIsIndex = targetUrl? isIndexPage(targetUrl.pathname) : false;
      const currentIsIndex = isIndexPage();

      if (targetIsIndex &&!currentIsIndex) {
        e.preventDefault();
        e.stopPropagation();
        if (isMenuOpen) closeMobileMenu({ restoreScroll: false, updateHash: false });
        sessionStorage.setItem('jumpTo', key);
        window.location.href = `/#${key}=1`;
        return;
      }
      if (!document.getElementById(key)) return;
      e.preventDefault();
      e.stopPropagation();
      const doJump = () => {
        const p = buildStateParams();
        p.set(key, '1');
        setHashParams(p);
        jumpToId(key);
        // NEU: einmalig genutzten Sprung-Key (z.B. "anfrage") direkt danach
        // wieder aus dem Hash entfernen, statt ihn dauerhaft "kleben" zu lassen.
        clearOneOffKeys([key]);
      };
      if (isMenuOpen) {
        closeMobileMenu({ restoreScroll: false, updateHash: false });
        requestAnimationFrame(() => requestAnimationFrame(() => doJump()));
      } else {
        doJump();
      }
    }, true);
  }
  window.toggleSubmenu = toggleSubmenu;
  window.closeMobileMenu = closeMobileMenu;
  function getCollapseInner(collapse) { return collapse?.querySelector('.text-collapse-inner'); }
  function setCollapseState(collapse, expanded) {
    const inner = getCollapseInner(collapse);
    const button = collapse?.querySelector('.text-collapse-toggle');
    if (!inner ||!button) return;
    const preview = getComputedStyle(collapse).getPropertyValue('--collapse-preview-height').trim() || '4.2em';
    if (expanded) {
      inner.style.maxHeight = `${inner.scrollHeight}px`;
      collapse.classList.add('is-expanded');
      button.setAttribute('aria-expanded', 'true');
    } else {
      inner.style.maxHeight = `${inner.scrollHeight}px`;
      requestAnimationFrame(() => {
        collapse.classList.remove('is-expanded');
        inner.style.maxHeight = preview;
      });
      button.setAttribute('aria-expanded', 'false');
    }
  }
  function initTextCollapse(collapse) {
    const inner = getCollapseInner(collapse);
    const button = collapse.querySelector('.text-collapse-toggle');
    if (!inner ||!button) return;
    button.addEventListener('click', (e) => { e.preventDefault(); setCollapseState(collapse,!collapse.classList.contains('is-expanded')); });
    const media = window.matchMedia('(max-width: 767px)');
    const sync = () => {
      if (media.matches) { if (!collapse.classList.contains('is-expanded')) inner.style.maxHeight = getComputedStyle(collapse).getPropertyValue('--collapse-preview-height').trim() || '4.2em'; }
      else { collapse.classList.remove('is-expanded'); inner.style.maxHeight = ''; button.setAttribute('aria-expanded', 'false'); }
    };
    sync();
    if (media.addEventListener) media.addEventListener('change', sync); else media.addListener(sync);
  }
  function initAllCollapses() {
    document.querySelectorAll('.text-collapse').forEach(initTextCollapse);
    document.querySelectorAll('#why-cards-grid.why-card').forEach(card => {
      if (card.querySelector('.text-collapse')) return;
      const p = card.querySelector(':scope > p'); if (!p) return;
      const collapse = document.createElement('div'); collapse.className = 'text-collapse'; collapse.style.setProperty('--collapse-preview-height', '4.5em');
      const inner = document.createElement('div'); inner.className = 'text-collapse-inner';
      p.parentNode.insertBefore(collapse, p); inner.appendChild(p); collapse.appendChild(inner);
      const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'text-collapse-toggle'; btn.setAttribute('aria-expanded', 'false'); btn.innerHTML = '<i aria-hidden="true" class="fas fa-chevron-down"></i>';
      collapse.appendChild(btn); initTextCollapse(collapse);
    });
    window.addEventListener('resize', () => { document.querySelectorAll('.text-collapse.is-expanded.text-collapse-inner').forEach(inner => { inner.style.maxHeight = `${inner.scrollHeight}px`; }); }, { passive: true });
  }
  function isSafari() { const ua = navigator.userAgent; return /Safari/.test(ua) &&!/Chrome|Chromium|Android/.test(ua); }
  function showLogoFallback() {
    if (!DOM.footerVideo ||!DOM.footerFallback) return;
    DOM.footerVideo.style.display = 'none'; DOM.footerVideo.pause(); DOM.footerVideo.removeAttribute('src'); DOM.footerVideo.innerHTML = '';
    DOM.footerFallback.src = CONFIG.logo.webpFallback; DOM.footerFallback.style.display = 'block';
  }
  function loadFooterLogo() {
    const { footerVideo: video, footerFallback: fallback } = DOM;
    if (!video ||!fallback) return;
    if (isSafari() || isSlowConnection()) { showLogoFallback(); return; }
    const res = getLogoResolution(); const src = CONFIG.logo.webmPattern(res);
    if (video.dataset.loaded === src) { video.play().catch(() => {}); return; }
    video.dataset.loaded = src; video.innerHTML = `<source src="${src}" type="video/webm">`;
    let timedOut = false;
    const timeout = setTimeout(() => { timedOut = true; showLogoFallback(); }, CONFIG.logo.timeoutMs);
    video.addEventListener('canplay', () => { if (timedOut) return; clearTimeout(timeout); video.play().catch(() => {}); }, { once: true });
    video.addEventListener('error', () => { clearTimeout(timeout); showLogoFallback(); }, { once: true });
    video.load();
  }
  function initFooterLogo() {
    if (!DOM.footerVideo) return;
    if (!('IntersectionObserver' in window)) { loadFooterLogo(); return; }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (DOM.footerVideo.style.display === 'none' && DOM.footerFallback.style.display === 'block') return;
          loadFooterLogo();
        } else { if (DOM.footerVideo &&!DOM.footerVideo.paused) DOM.footerVideo.pause(); }
      });
    }, { rootMargin: '300px', threshold: 0 });
    observer.observe(DOM.footerVideo);
  }
  function enforceLightAndCleanURL() {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('proenergie-theme');
    const url = new URL(window.location.href);
    if (url.searchParams.has('erscheinungsbild')) {
      url.searchParams.delete('erscheinungsbild');
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    }
  }
  function initLogoJump() {
    document.querySelectorAll('a.logo-wrapper').forEach(a => {
      a.addEventListener('click', (e) => {
        if (!isIndexPage()) return;

        e.preventDefault();
        e.stopPropagation();

        if (DOM.mobileMenu?.classList.contains('active')) {
          closeMobileMenu({ updateHash: false });
        }

        sessionStorage.removeItem('jumpTo');

        // nur #anfrage raus, alles andere bleibt
        const p = getHashParams();
        if (p.has('anfrage')) {
          p.delete('anfrage');
          setHashParams(p);
        }

        // instant springen
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, true);
    });
  }
  document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initScrollLinks();
    initLogoJump();
    initAllCollapses();
    initFooterLogo();
    enforceLightAndCleanURL();
    cleanHashForNonIndexPage();
    applyHashState();
  });
  window.addEventListener('hashchange', applyHashState);
})();