(function(){
  'use strict';

  const VERSION='79.0';
  const MODAL_ID='abDocumentPreviewV64';
  const STYLE_ID='abDocumentPreviewRestoreV79Style';

  function injectStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      #${MODAL_ID} .ab-doc-preview-body{
        overflow:hidden!important;
        display:flex!important;
        align-items:stretch!important;
        justify-content:stretch!important;
        background:#eef2f6!important;
      }
      #${MODAL_ID} .ab-doc-preview-frame{
        display:block!important;
        width:100%!important;
        height:100%!important;
        max-width:none!important;
        max-height:none!important;
        margin:0!important;
        border:0!important;
        transform:none!important;
        background:#fff!important;
      }
    `;
    document.head.appendChild(s);
  }

  function driveIdFrom(src){
    const s=String(src||'');
    let m=s.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);
    if(m)return m[1];
    m=s.match(/[?&]srcid=([^&#]+)/i);
    return m?decodeURIComponent(m[1]):'';
  }

  function restore(){
    injectStyle();
    const modal=document.getElementById(MODAL_ID);
    if(!modal||!modal.classList.contains('show'))return;
    const frame=modal.querySelector('.ab-doc-preview-frame');
    if(!frame)return;

    const src=String(frame.src||'');
    const id=driveIdFrom(src);
    if(id && /docs\.google\.com\/viewer/i.test(src)){
      frame.src='https://drive.google.com/file/d/'+encodeURIComponent(id)+'/preview';
    }

    frame.style.setProperty('width','100%','important');
    frame.style.setProperty('height','100%','important');
    frame.style.setProperty('max-width','none','important');
    frame.style.setProperty('max-height','none','important');
    frame.style.setProperty('margin','0','important');
    frame.style.setProperty('transform','none','important');
  }

  function schedule(){
    requestAnimationFrame(restore);
    setTimeout(restore,80);
    setTimeout(restore,300);
    setTimeout(restore,800);
  }

  function install(){
    injectStyle();
    if(typeof window.openDocs==='function'&&!window.openDocs.__abRestoreV79){
      const previous=window.openDocs;
      const wrapped=function(){
        const out=previous.apply(this,arguments);
        schedule();
        return out;
      };
      wrapped.__abRestoreV79=true;
      window.openDocs=wrapped;
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();

  window.__AB_COMMANDES_DOCUMENT_PREVIEW_RESTORE_VERSION=VERSION;
})();
