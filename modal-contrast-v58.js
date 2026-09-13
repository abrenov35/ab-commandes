(function(){
  'use strict';

  const STYLE_ID='ab-commandes-modal-contrast-v58';
  if(document.getElementById(STYLE_ID))return;

  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
    /* V58 : contraste visuel uniquement — aucun clic/comportement modifié */
    #modal{background:rgba(25,39,60,.50)!important}

    #modal .dialog{
      background:#ffffff!important;
      border:1px solid #cbd5e1!important;
      box-shadow:0 24px 70px rgba(15,23,42,.30)!important;
    }

    #modal .ab-modal-head{
      border-bottom:1px solid #d7dee8!important;
      background:#f8fafc!important;
    }

    #modal #modalTitle,
    #modal .label{
      color:#183153!important;
    }

    #modal .label{
      font-weight:850!important;
    }

    #modal .field,
    #modal input.field,
    #modal select.field,
    #modal textarea.field,
    #modal input:not([type="hidden"]),
    #modal select,
    #modal textarea{
      background:#f8fafc!important;
      border-color:#aebdce!important;
      color:#183153!important;
      box-shadow:inset 0 1px 2px rgba(15,23,42,.025)!important;
    }

    #modal .field:hover,
    #modal input:not([type="hidden"]):hover,
    #modal select:hover,
    #modal textarea:hover{
      border-color:#8fa1b6!important;
    }

    #modal .field:focus,
    #modal input:not([type="hidden"]):focus,
    #modal select:focus,
    #modal textarea:focus{
      background:#fff!important;
      border-color:#5b8fd8!important;
      box-shadow:0 0 0 3px rgba(59,130,246,.13)!important;
      outline:none!important;
    }

    #modal input::placeholder,
    #modal textarea::placeholder{
      color:#8796aa!important;
      opacity:1!important;
    }

    #modal .dialog-actions{
      border-top:1px solid #d7dee8!important;
      padding-top:12px!important;
    }

    #modal #cancelBtn{
      background:#fff!important;
      border:1px solid #b9c6d6!important;
      color:#24364f!important;
      box-shadow:0 1px 2px rgba(15,23,42,.04)!important;
    }

    #modal #saveBtn{
      box-shadow:0 2px 5px rgba(18,73,135,.18)!important;
    }

    #modal #abEditDocBtn{
      box-shadow:0 2px 5px rgba(24,121,78,.16)!important;
    }
  `;
  document.head.appendChild(s);
  window.__AB_COMMANDES_MODAL_CONTRAST_VERSION='58.0';
})();
