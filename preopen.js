// preopen.js - muss synchron vor style.css laufen!
(function(){
  const raw = (location.hash || '').replace('#','');
  if(!raw) return;
  const parts = raw.split('&');
  parts.forEach(p => {
    const k = p.split('=')[0];
    if(k) document.documentElement.classList.add('preopen-' + k);
  });
  if(raw.includes('menu')){
    document.documentElement.classList.add('menu-preopen');
  }
})();