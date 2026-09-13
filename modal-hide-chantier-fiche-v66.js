(function(){
  'use strict';

  const STYLE_ID='ab-commandes-hide-chantier-fiche-v66';
  if(document.getElementById(STYLE_ID))return;

  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
    body:has(#chantierFiche.active) #modal .form-grid>div:has(#fChantier){
      display:none!important;
    }
  `;
  document.head.appendChild(s);

  window.__AB_COMMANDES_HIDE_CHANTIER_FICHE_VERSION='66.0';
})();
