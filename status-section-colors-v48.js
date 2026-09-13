/* Compatibilité anciennes pages V48 : aucune couleur, allègement modale + chargement V55. */
(function(){
  'use strict';
  const id='ab-commandes-v48-cache-modal-light';
  if(!document.getElementById(id)){
    const s=document.createElement('style');
    s.id=id;
    s.textContent=`
      #modal .ab-modal-subtitle{display:none!important}
      #modal .ab-modal-section{display:none!important}
      #modal #abWebLinkWrap .label,
      #modal #abWebLinkWrap label{display:none!important}
      #modal #abDocLaunchV47{display:none!important}
      #modal .ab-modal-head{padding-bottom:10px!important}
      #modal .form-grid{padding-top:10px!important;row-gap:8px!important}
      #modal #abWebLinkWrap{margin-top:0!important}
    `;
    document.head.appendChild(s);
  }
  if(!document.querySelector('script[data-ab-footer-doc-v55]')){
    const script=document.createElement('script');
    script.src='modal-footer-doc-v55.js?v=55';
    script.dataset.abFooterDocV55='1';
    document.head.appendChild(script);
  }
  window.__AB_COMMANDES_STATUS_SECTION_COLORS_VERSION='48-cache-v55';
})();
