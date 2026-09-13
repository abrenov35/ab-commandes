(function(){
  'use strict';
  const id='ab-commandes-remove-doc-check-v67';
  if(document.getElementById(id))return;
  const s=document.createElement('style');
  s.id=id;
  s.textContent=`
    #modal #abEditDocBtn.ab-has-doc-v63::after{
      content:none!important;
      display:none!important;
    }
  `;
  document.head.appendChild(s);
  window.__AB_COMMANDES_REMOVE_DOC_CHECK_VERSION='67.0';
})();
