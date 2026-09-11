(function(){
  'use strict';

  const params=new URL(window.location.href).searchParams;
  if(params.get('embed')!=='1')return;

  if(document.getElementById('ab-commandes-embed-contrast-v1'))return;

  const style=document.createElement('style');
  style.id='ab-commandes-embed-contrast-v1';
  style.textContent=`
    body.ab-embed-mode #ficheOrdersList{
      gap:10px!important;
    }

    body.ab-embed-mode #ficheOrdersList details.ab-status-section{
      background:#ffffff!important;
      border:1px solid #bcc9d8!important;
      border-radius:11px!important;
      overflow:hidden!important;
      box-shadow:0 2px 6px rgba(20,45,73,.08)!important;
      margin:0 0 10px!important;
    }

    body.ab-embed-mode #ficheOrdersList details.ab-status-section > summary{
      background:#edf2f7!important;
      color:#10233f!important;
      border:0!important;
      min-height:38px!important;
      padding:9px 12px!important;
      font-weight:900!important;
      box-shadow:inset 0 -1px 0 rgba(160,176,196,.55)!important;
    }

    body.ab-embed-mode #ficheOrdersList details.ab-status-section:not([open]) > summary{
      box-shadow:none!important;
    }

    body.ab-embed-mode #ficheOrdersList details.ab-status-section > summary:hover{
      background:#e5ecf4!important;
    }

    body.ab-embed-mode #ficheOrdersList details.ab-status-section .order-row{
      background:#ffffff!important;
      border:1px solid #c7d3e1!important;
      border-radius:9px!important;
      box-shadow:0 1px 3px rgba(20,45,73,.07)!important;
      margin:8px 9px!important;
    }

    body.ab-embed-mode #ficheOrdersList details.ab-status-section .order-row:nth-child(even){
      background:#f8fafc!important;
    }

    body.ab-embed-mode #ficheOrdersList details.ab-status-section .order-row:hover{
      background:#f2f6fb!important;
      border-color:#9fb1c6!important;
    }

    body.ab-embed-mode #ficheOrdersList details.ab-status-section .order-row select,
    body.ab-embed-mode #ficheOrdersList details.ab-status-section .order-row .doc-btn{
      border-color:#b9c7d8!important;
      background:#ffffff!important;
    }

    body.ab-embed-mode #ficheOrdersList details.ab-status-section .ab-order-label{
      color:#10233f!important;
      font-weight:900!important;
    }
  `;

  document.head.appendChild(style);
  window.__AB_COMMANDES_EMBED_CONTRAST_VERSION='1.0';
})();
