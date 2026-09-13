(function(){
  'use strict';

  const VERSION='76.0';
  const MODAL_ID='abDocumentPreviewV64';
  const STYLE_ID='abDocumentPreviewFitV76Style';

  function injectStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      #${MODAL_ID} .ab-doc-preview-body{
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        overflow:hidden!important;
        padding:0!important;
      }
      #${MODAL_ID} .ab-doc-preview-frame{
        display:block!important;
        flex:0 0 auto!important;
        margin:auto!important;
        border:0!important;
        background:#fff!important;
      }
      #${MODAL_ID} .ab-doc-preview-img{
        display:block!important;
        width:auto!important;
        height:auto!important;
        max-width:100%!important;
        max-height:100%!important;
        object-fit:contain!important;
        margin:auto!important;
      }
    `;
    document.head.appendChild(s);
  }

  function fit(){
    injectStyle();
    const modal=document.getElementById(MODAL_ID);
    if(!modal||!modal.classList.contains('show'))return;
    const body=modal.querySelector('.ab-doc-preview-body');
    const frame=modal.querySelector('.ab-doc-preview-frame');
    if(!body||!frame)return;

    const bodyW=Math.max(1,body.clientWidth);
    const bodyH=Math.max(1,body.clientHeight);

    // Zone utile du lecteur : on garde une marge pour sa barre interne,
    // puis on dimensionne l'iframe sur le ratio A4 afin que la page entière
    // reste visible de haut en bas tout en étant centrée.
    const usableH=Math.max(240,bodyH-72);
    const a4Width=Math.floor(usableH*0.7071);
    const targetW=Math.max(260,Math.min(bodyW,a4Width));

    frame.style.setProperty('width',targetW+'px','important');
    frame.style.setProperty('height',bodyH+'px','important');
    frame.style.setProperty('max-width','100%','important');
    frame.style.setProperty('max-height','100%','important');
    frame.style.setProperty('margin','auto','important');
  }

  function install(){
    injectStyle();
    if(typeof window.openDocs==='function'&&!window.openDocs.__abFitV76){
      const previous=window.openDocs;
      const wrapped=function(){
        const out=previous.apply(this,arguments);
        requestAnimationFrame(fit);
        setTimeout(fit,80);
        setTimeout(fit,300);
        return out;
      };
      wrapped.__abFitV76=true;
      window.openDocs=wrapped;
    }
    window.addEventListener('resize',fit,{passive:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();

  window.__AB_COMMANDES_DOCUMENT_PREVIEW_FIT_VERSION=VERSION;
})();
