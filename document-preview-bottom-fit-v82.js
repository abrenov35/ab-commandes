(function(){
  'use strict';
  const STYLE_ID='abDocumentPreviewBottomFitV82';
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
    #abDocumentPreviewV64 .ab-doc-preview-body{overflow:hidden!important}
    #abDocumentPreviewV64 .ab-doc-preview-frame{
      width:106.4%!important;
      height:106.4%!important;
      max-width:none!important;
      max-height:none!important;
      margin-left:-3.2%!important;
      margin-right:-3.2%!important;
      transform:scale(.94)!important;
      transform-origin:center top!important;
    }
  `;
  document.head.appendChild(s);
  window.__AB_COMMANDES_DOCUMENT_PREVIEW_BOTTOM_FIT_VERSION='82.0';
})();
