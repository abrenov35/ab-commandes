(function(){
  'use strict';

  const STYLE_ID='ab-commandes-modal-light-v53';
  if(document.getElementById(STYLE_ID))return;

  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
    /* V54 : allègement visuel uniquement — aucun comportement/clic modifié */
    #modal .ab-modal-subtitle{display:none!important}
    #modal .ab-modal-section{display:none!important}
    #modal #abWebLinkWrap>.label{display:none!important}
    #modal #abDocLaunchV47{display:none!important}

    #modal .ab-modal-head{padding-bottom:11px!important}
    #modal .form-grid{padding-top:12px!important;row-gap:9px!important}
    #modal #abWebLinkWrap{margin-top:0!important}
  `;
  document.head.appendChild(s);
  window.__AB_COMMANDES_MODAL_LIGHT_VERSION='54.0';
})();
