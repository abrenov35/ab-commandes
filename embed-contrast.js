(function(){
  'use strict';

  const params=new URL(window.location.href).searchParams;
  if(params.get('embed')!=='1')return;

  if(document.getElementById('ab-commandes-embed-contrast-v3'))return;
  document.getElementById('ab-commandes-embed-contrast-v1')?.remove();
  document.getElementById('ab-commandes-embed-contrast-v2')?.remove();

  const style=document.createElement('style');
  style.id='ab-commandes-embed-contrast-v3';
  style.textContent=`
    body.ab-embed-mode #ficheOrdersList{gap:10px!important}

    body.ab-embed-mode #ficheOrdersList details.ab-status-section{
      background:#fff!important;
      border:1px solid #9fb0c4!important;
      border-radius:11px!important;
      overflow:hidden!important;
      box-shadow:0 2px 7px rgba(20,45,73,.12)!important;
      margin:0 0 10px!important;
    }

    body.ab-embed-mode #ficheOrdersList details.ab-status-section > summary{
      background:#cbd7e5!important;
      color:#0b213d!important;
      border:0!important;
      min-height:40px!important;
      padding:10px 13px!important;
      font-size:14px!important;
      line-height:1.2!important;
      font-weight:950!important;
      box-shadow:inset 0 -1px 0 #9eafc3!important;
    }

    body.ab-embed-mode #ficheOrdersList details.ab-status-section[open] > summary{
      background:#c1cedd!important;
    }

    body.ab-embed-mode #ficheOrdersList details.ab-status-section:not([open]) > summary{
      box-shadow:none!important;
    }

    body.ab-embed-mode #ficheOrdersList details.ab-status-section > summary:hover{
      background:#b9c8d9!important;
    }

    body.ab-embed-mode #ficheOrdersList details.ab-status-section > summary .ab-status-heading,
    body.ab-embed-mode #ficheOrdersList details.ab-status-section > summary b,
    body.ab-embed-mode #ficheOrdersList details.ab-status-section > summary strong{
      color:#081c35!important;
      font-weight:950!important;
    }

    body.ab-embed-mode #ficheOrdersList details.ab-status-section > summary .ab-status-count,
    body.ab-embed-mode #ficheOrdersList details.ab-status-section > summary .count,
    body.ab-embed-mode #ficheOrdersList details.ab-status-section > summary .small{
      background:#eef3f8!important;
      color:#10233f!important;
      border:1px solid #9caec3!important;
      font-weight:900!important;
    }

    body.ab-embed-mode #ficheOrdersList details.ab-status-section .order-row{
      background:#fff!important;
      border:1px solid #b8c6d6!important;
      border-radius:9px!important;
      box-shadow:0 1px 3px rgba(20,45,73,.08)!important;
      margin:8px 9px!important;
    }

    body.ab-embed-mode #ficheOrdersList details.ab-status-section .order-row:nth-child(even){background:#f7f9fc!important}
    body.ab-embed-mode #ficheOrdersList details.ab-status-section .order-row:hover{background:#eef3f8!important;border-color:#8fa4bc!important}

    body.ab-embed-mode #ficheOrdersList details.ab-status-section .order-row select,
    body.ab-embed-mode #ficheOrdersList details.ab-status-section .order-row .doc-btn{
      border-color:#aebfd1!important;
      background:#fff!important;
    }

    body.ab-embed-mode #ficheOrdersList details.ab-status-section .ab-order-label{
      color:#0d223d!important;
      font-weight:900!important;
    }

    /* NOTE COMMANDES : même contraste que les titres de statut */
    body.ab-embed-mode #abCommandNote.ab-command-note{
      margin-top:14px!important;
      padding:0!important;
      background:#eef3f8!important;
      border:1px solid #9fb0c4!important;
      border-radius:11px!important;
      overflow:hidden!important;
      box-shadow:0 2px 7px rgba(20,45,73,.12)!important;
    }

    body.ab-embed-mode #abCommandNote .ab-command-note-title{
      display:flex!important;
      align-items:center!important;
      min-height:40px!important;
      margin:0!important;
      padding:10px 13px!important;
      background:#cbd7e5!important;
      border-bottom:1px solid #9eafc3!important;
      color:#081c35!important;
      font-size:14px!important;
      line-height:1.2!important;
      font-weight:950!important;
      letter-spacing:.02em!important;
      box-shadow:inset 0 -1px 0 #9eafc3!important;
    }

    body.ab-embed-mode #abCommandNote .ab-command-note-text{
      margin:10px!important;
      padding:12px 13px!important;
      min-height:72px!important;
      background:#fff!important;
      border:1px solid #aebfd1!important;
      border-radius:9px!important;
      color:#0d223d!important;
      font-size:13px!important;
      line-height:1.5!important;
      box-shadow:0 1px 3px rgba(20,45,73,.08)!important;
    }

    body.ab-embed-mode #abCommandNote .ab-command-note-status{
      margin:0 11px 10px!important;
      color:#52667e!important;
      font-weight:650!important;
    }

    body.ab-embed-mode #abCommandNote .ab-command-note-empty{
      width:calc(100% - 20px)!important;
      margin:10px!important;
      min-height:42px!important;
      background:#fff!important;
      border:1px dashed #8fa4bc!important;
      border-radius:9px!important;
      color:#0d223d!important;
      font-weight:900!important;
    }

    body.ab-embed-mode #abCommandNote .ab-command-note-edit{
      padding:10px!important;
      background:#eef3f8!important;
    }

    body.ab-embed-mode #abCommandNote .ab-command-note-edit textarea{
      border:1px solid #9fb0c4!important;
      background:#fff!important;
      box-shadow:0 1px 3px rgba(20,45,73,.08)!important;
    }
  `;

  document.head.appendChild(style);
  window.__AB_COMMANDES_EMBED_CONTRAST_VERSION='3.0';
})();
