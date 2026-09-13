(function(){
  'use strict';
  const id='ab-commandes-web-link-present-v60';
  if(document.getElementById(id))return;
  const s=document.createElement('style');
  s.id=id;
  s.textContent=`
    /* V60 : rendre immédiatement visible qu'un lien web est disponible */
    .ab-web-link-btn[href]{
      position:relative!important;
      background:#dcebff!important;
      border:2px solid #2f6fa8!important;
      color:#123f67!important;
      box-shadow:0 0 0 2px rgba(47,111,168,.12),0 2px 5px rgba(20,50,80,.14)!important;
      opacity:1!important;
    }
    .ab-web-link-btn[href]:hover{
      background:#cfe3fb!important;
      border-color:#1f5f98!important;
    }
    .ab-web-link-btn[href]::after{
      content:'✓';
      position:absolute;
      top:-6px;
      right:-6px;
      width:16px;
      height:16px;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      background:#198754;
      color:#fff;
      border:2px solid #fff;
      font-size:10px;
      font-weight:900;
      line-height:1;
      box-shadow:0 1px 3px rgba(0,0,0,.18);
      pointer-events:none;
    }
  `;
  document.head.appendChild(s);
  window.__AB_COMMANDES_WEB_LINK_PRESENT_VERSION='60.0';
})();
