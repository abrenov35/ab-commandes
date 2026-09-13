(function(){
  'use strict';

  const STYLE_ID='ab-commandes-modal-sections-clean-v50';
  let scheduled=false;

  function injectStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      #modal .ab-modal-section{display:none!important}
      #modal .form-grid{row-gap:6px!important}
    `;
    document.head.appendChild(s);
  }

  function clean(){
    injectStyle();
    document.querySelectorAll('#modal .ab-modal-section').forEach(el=>el.remove());
  }

  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;clean();});
  }

  injectStyle();
  clean();
  document.addEventListener('ab-commandes-modal-open',()=>{clean();setTimeout(clean,40);setTimeout(clean,120)});
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.__AB_COMMANDES_MODAL_SECTIONS_CLEAN_VERSION='50.0';
})();
