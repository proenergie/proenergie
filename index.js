// FILE: index.js
// === Nur verwendet in: index.html - FORMULAR ANTI-SPAM ===
(() => {
  'use strict';

  let hasInteracted = false;

  function initFormProtection() {
    const tsField = document.getElementById('formTimestamp');
    if (tsField) tsField.value = new Date().getTime();

    document.addEventListener('mousemove', () => { hasInteracted = true; }, { once: false });
    document.addEventListener('keydown', () => { hasInteracted = true; }, { once: false });
    document.addEventListener('click', () => { hasInteracted = true; }, { once: false });
  }

  // global für onsubmit="return validate..."
  window.validateHoneypot = function() {
    const honeypot = document.getElementById('honeypot');
    if (honeypot && honeypot.value) {
      alert('Bitte füllen Sie das Formular korrekt aus.');
      return false;
    }
    return true;
  };

  window.validateTime = function() {
    const startField = document.getElementById('formTimestamp');
    if (!startField) return true;
    const startTime = parseInt(startField.value, 10);
    const endTime = new Date().getTime();
    const timeDiff = (endTime - startTime) / 1000;
    if (timeDiff < 2) {
      alert('Bitte nehmen Sie sich etwas Zeit für das Formular.');
      return false;
    }
    return true;
  };

  window.validateInteraction = function() {
    if (!hasInteracted) {
      alert('Bitte interagieren Sie mit der Seite.');
      return false;
    }
    return true;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFormProtection);
  } else {
    initFormProtection();
  }
})();
