// preopen.js - MUSS synchron vor style.css im <head> laufen!
(function(){
  try {
    var raw = (location.hash || '').replace(/^#/, '').trim();
    if (!raw) return;

    var root = document.documentElement;
    var hasMenu = false;
    var allowed = ['menu', 'leistungen', 'druckluft-effizienz', 'anfrage'];

    raw.split('&').forEach(function(p){
      if (!p) return;
      var k = p.split('=')[0].trim();
      if (!k) return;
      if (allowed.indexOf(k) === -1) return;

      root.classList.add('preopen-' + k);
      if (k === 'menu') hasMenu = true;
    });

    if (hasMenu) {
      root.classList.add('menu-preopen');
      // Verhindert den 1-Frame Layout-Shift in Firefox beim Neuladen
      root.style.scrollbarGutter = 'stable';
    }
  } catch(e) {}
})();