(function(){
  'use strict';
  const id='ab-commandes-modal-doc-dedup-v54';
  if(!document.getElementById(id)){
    const s=document.createElement('style');
    s.id=id;
    s.textContent=`#modal #abDocLaunchV47{display:none!important}`;
    document.head.appendChild(s);
  }
  if(!document.querySelector('script[data-ab-footer-doc-v55]')){
    const script=document.createElement('script');
    script.src='modal-footer-doc-v55.js?v=55';
    script.dataset.abFooterDocV55='1';
    document.head.appendChild(script);
  }
  window.__AB_COMMANDES_MODAL_DOC_DEDUP_VERSION='54.1';
})();
