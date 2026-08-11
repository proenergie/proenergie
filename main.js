// FILE: main.js
(() => {
  'use strict';

  // === MOBILE MENU ===
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const hamburgerIcon = document.getElementById('hamburger-icon');
  const mobileMenu = document.getElementById('mobile-menu');
  const blurOverlay = document.getElementById('page-blur-overlay');
  let scrollY = 0;

  function openMobileMenu() {
    scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    if (mobileMenu) mobileMenu.classList.add('active');
    if (blurOverlay) blurOverlay.classList.add('active');
    document.body.classList.add('menu-open');
    if (hamburgerIcon) hamburgerIcon.classList.add('is-open');
  }

  function closeMobileMenu() {
    if (mobileMenu) mobileMenu.classList.remove('active');
    if (blurOverlay) blurOverlay.classList.remove('active');
    document.body.style.position = '';
    document.body.style.top = '';
    window.scrollTo(0, scrollY);
    document.body.classList.remove('menu-open');
    if (hamburgerIcon) hamburgerIcon.classList.remove('is-open');
  }

  function toggleSubmenu(id) {
    const sub = document.getElementById(`${id}-submenu`);
    const icon = document.getElementById(`${id}-icon`);
    if (sub) {
      sub.classList.toggle('active');
      if (icon) {
        icon.classList.toggle('fa-chevron-down');
        icon.classList.toggle('fa-chevron-up');
      }
    }
  }
  window.toggleSubmenu = toggleSubmenu;
  window.closeMobileMenu = closeMobileMenu;

  if (mobileBtn) mobileBtn.addEventListener('click', () => mobileMenu.classList.contains('active') ? closeMobileMenu() : openMobileMenu());
  if (blurOverlay) blurOverlay.addEventListener('click', closeMobileMenu);

  // Close menu on link click - OHNE Smooth Scroll Logik, nur schließen
  document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenu && mobileMenu.classList.contains('active')) {
        closeMobileMenu();
      }
    });
  });

  // === LIGHT MODE ENFORCE + URL CLEANUP ===
  function enforceLightAndCleanURL() {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('proenergie-theme');
    const url = new URL(window.location.href);
    if (url.searchParams.has('erscheinungsbild')) {
      url.searchParams.delete('erscheinungsbild');
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enforceLightAndCleanURL);
  } else {
    enforceLightAndCleanURL();
  }
})();