(function(){
  'use strict';

  const VERSION='77.0';
  const MODAL_ID='abDocumentPreviewV64';
  const STYLE_ID='abDocumentPreviewPageModeV77Style';

  function injectStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      #${MODAL_ID} .ab-doc-preview-body{
        display:flex!important;
        align-items:stretch!important;
        justify-content:stretch!important;
        overflow:hidden!important;
        padding:0!important;
      }
      #${MODAL_ID} .ab-doc-preview-frame{
        display:block!important;
        width:100%!important;
        height:100%!important;
        max-width:none!important;
        max-height:none!important;
        margin:0!important;
        border:0!important;
        background:#eef2f6!important;
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

  function pageViewerUrl(id){
    return 'https://docs.google.com/viewer?srcid='+encodeURIComponent(id)+
      '&pid=explorer&efh=false&a=v&chrome=false&embedded=true';
  }

  function apply(){
    injectStyle();
    const modal=document.getElementById(MODAL_ID);
    if(!modal||!modal.classList.contains('show'))return;
    const frame=modal.querySelector('.ab-doc-preview-frame');
    if(!frame)return;

    const id=driveIdFrom(frame.src);
    if(id && !/docs\.google\.com\/viewer/i.test(frame.src)){
      frame.src=pageViewerUrl(id);
    }

    // V71/V75/V76 appliquent encore un dimensionnement étroit.
    // On reprend la main en dernier pour laisser le lecteur utiliser toute la zone.
    frame.style.setProperty('width','100%','important');
    frame.style.setProperty('height','100%','important');
    frame.style.setProperty('max-width','none','important');
    frame.style.setProperty('max-height','none','important');
    frame.style.setProperty('margin','0','important');
    frame.setAttribute('scrolling','no');
  }

  function schedule(){
    requestAnimationFrame(apply);
    setTimeout(apply,80);
    setTimeout(apply,360);
    setTimeout(apply,800);
  }

  function install(){
    injectStyle();
    if(typeof window.openDocs==='function'&&!window.openDocs.__abPageModeV77){
      const previous=window.openDocs;
      const wrapped=function(){
        const out=previous.apply(this,arguments);
        schedule();
        return out;
      };
      wrapped.__abPageModeV77=true;
      window.openDocs=wrapped;
    }
    window.addEventListener('resize',()=>setTimeout(apply,0),{passive:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();

  window.__AB_COMMANDES_DOCUMENT_PREVIEW_PAGE_MODE_VERSION=VERSION;
})();
