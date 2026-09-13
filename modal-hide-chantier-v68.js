(function(){
  'use strict';
  const id='ab-commandes-hide-chantier-v68';
  if(!document.getElementById(id)){
    const s=document.createElement('style');
    s.id=id;
    s.textContent=`
      #modal .form-grid > div:has(#fChantier){display:none!important}
    `;
    document.head.appendChild(s);
  }
  function hide(){
    const f=document.getElementById('fChantier');
    const w=f&&f.parentElement;
    if(w)w.style.setProperty('display','none','important');
  }
  hide();
  requestAnimationFrame(hide);
  setTimeout(hide,150);
  document.addEventListener('ab-commandes-modal-open',hide);
  window.__AB_COMMANDES_HIDE_CHANTIER_VERSION='68.0';
})();
