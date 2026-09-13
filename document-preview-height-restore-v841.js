(function(){
  'use strict';
  const STYLE_ID='abDocumentPreviewHeightRestoreV841';

  function apply(){
    const old=document.getElementById('abDocumentPreviewWidthFitV83');
    if(old)old.remove();

    let s=document.getElementById(STYLE_ID);
    if(!s){
      s=document.createElement('style');
      s.id=STYLE_ID;
      document.head.appendChild(s);
    }
    s.textContent=`
      #abDocumentPreviewV64 .ab-doc-preview-card{
        width:calc(100vw - 16px)!important;
        height:calc(100vh - 16px)!important;
        max-width:none!important;
        max-height:none!important;
        margin:0!important;
      }
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
  }

  apply();
  setTimeout(apply,100);
  setTimeout(apply,500);
  window.__AB_COMMANDES_DOCUMENT_PREVIEW_HEIGHT_RESTORE_VERSION='84.1';
})();
