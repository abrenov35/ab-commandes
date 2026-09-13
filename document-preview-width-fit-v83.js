(function(){
  'use strict';
  const STYLE_ID='abDocumentPreviewWidthFitV83';
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
    /* V83 : largeur de la fenêtre calée sur une page A4 visible en hauteur */
    #abDocumentPreviewV64 .ab-doc-preview-card{
      width:min(calc((100vh - 100px) * .74),calc(100vw - 16px))!important;
      max-width:calc(100vw - 16px)!important;
      margin-left:auto!important;
      margin-right:auto!important;
    }
    #abDocumentPreviewV64 .ab-doc-preview-body{
      width:100%!important;
      background:#2f3030!important;
    }
    @media(max-width:650px){
      #abDocumentPreviewV64 .ab-doc-preview-card{
        width:calc(100vw - 8px)!important;
        max-width:calc(100vw - 8px)!important;
      }
    }
  `;
  document.head.appendChild(s);
  window.__AB_COMMANDES_DOCUMENT_PREVIEW_WIDTH_FIT_VERSION='83.0';
})();
