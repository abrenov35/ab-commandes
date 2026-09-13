(function(){
  'use strict';

  const VERSION='78.0';
  const MODAL_ID='abDocumentPreviewV64';
  const STYLE_ID='abDocumentPreviewReadableV78Style';

  function injectStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      #${MODAL_ID} .ab-doc-preview-body{
        overflow:hidden!important;
        display:flex!important;
        align-items:flex-start!important;
        justify-content:center!important;
        background:#e9eef4!important;
      }
      #${MODAL_ID} .ab-doc-preview-frame{
        width:100%!important;
        height:100%!important;
        max-width:none!important;
        max-height:none!important;
        margin:0!important;
        border:0!important;
        transform:scale(1.24)!important;
        transform-origin:center top!important;
        background:#e9eef4!important;
      }
      @media(max-width:900px){
        #${MODAL_ID} .ab-doc-preview-frame{transform:scale(1.12)!important}
      }
      @media(max-width:650px){
        #${MODAL_ID} .ab-doc-preview-frame{transform:scale(1)!important}
      }
    `;
    document.head.appendChild(s);
  }

  function install(){
    injectStyle();
    const modal=document.getElementById(MODAL_ID);
    if(!modal)return;
    const obs=new MutationObserver(()=>{
      if(modal.classList.contains('show'))injectStyle();
    });
    obs.observe(modal,{attributes:true,attributeFilter:['class']});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();

  window.__AB_COMMANDES_DOCUMENT_PREVIEW_READABLE_VERSION=VERSION;
})();
