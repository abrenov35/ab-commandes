(function(){
  'use strict';

  const VERSION='75.0';
  const MODAL_ID='abDocumentPreviewV64';
  const STYLE_ID='abDocumentPreviewFinalV75Style';

  function injectStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      #${MODAL_ID}{padding:3px!important}
      #${MODAL_ID} .ab-doc-preview-card{
        width:calc(100vw - 6px)!important;
        height:calc(100dvh - 6px)!important;
        max-height:calc(100dvh - 6px)!important;
        border-radius:10px!important;
      }
      #${MODAL_ID} .ab-doc-preview-head{padding:8px 10px!important;min-height:44px!important}
      #${MODAL_ID} .ab-doc-preview-tabs{min-height:42px!important;padding:6px 9px!important}
      #${MODAL_ID} .ab-doc-preview-tabs:not(.show){display:none!important}
      #${MODAL_ID} .ab-doc-preview-tabs.show{display:flex!important}
      #${MODAL_ID} .ab-doc-preview-actions-v73,
      #${MODAL_ID} .ab-doc-preview-actions-v74,
      #${MODAL_ID} .ab-doc-preview-foot,
      #${MODAL_ID} .ab-doc-preview-open,
      #${MODAL_ID} .ab-doc-preview-done{display:none!important}
      #${MODAL_ID} .ab-doc-preview-body{
        flex:1!important;
        min-height:0!important;
        overflow:hidden!important;
        display:flex!important;
        align-items:stretch!important;
        justify-content:center!important;
        background:#e9eef4!important;
      }
      #${MODAL_ID} .ab-doc-preview-frame{
        display:block!important;
        height:100%!important;
        border:0!important;
        background:#fff!important;
        margin:0 auto!important;
      }
      #${MODAL_ID} .ab-doc-preview-img{
        max-width:100%!important;
        max-height:100%!important;
        object-fit:contain!important;
      }
      @media(max-width:650px){
        #${MODAL_ID}{padding:0!important}
        #${MODAL_ID} .ab-doc-preview-card{
          width:100vw!important;
          height:100dvh!important;
          max-height:100dvh!important;
          border-radius:0!important;
        }
      }
    `;
    document.head.appendChild(s);
  }

  function fitFrame(){
    const modal=document.getElementById(MODAL_ID);
    if(!modal||!modal.classList.contains('show'))return;
    const body=modal.querySelector('.ab-doc-preview-body');
    const frame=modal.querySelector('.ab-doc-preview-frame');
    if(!body||!frame)return;

    const h=Math.max(1,body.clientHeight);
    const w=Math.max(1,body.clientWidth);
    // Le lecteur Google Drive ajuste surtout le PDF a la largeur.
    // On limite donc la largeur en fonction de la hauteur disponible
    // afin d'afficher une page A4 entiere de haut en bas.
    const target=Math.max(220,Math.min(w,Math.floor(h*0.62)));
    frame.style.setProperty('width',target+'px','important');
    frame.style.setProperty('height',h+'px','important');
    frame.style.setProperty('max-width','100%','important');
  }

  function cleanupToolbar(){
    injectStyle();
    const modal=document.getElementById(MODAL_ID);
    if(!modal)return;
    modal.querySelectorAll('.ab-doc-preview-actions-v73,.ab-doc-preview-actions-v74').forEach(el=>el.remove());
    fitFrame();
  }

  function install(){
    injectStyle();

    if(typeof window.openDocs==='function'&&!window.openDocs.__abFinalV75){
      const previous=window.openDocs;
      const wrapped=function(){
        const out=previous.apply(this,arguments);
        requestAnimationFrame(cleanupToolbar);
        setTimeout(cleanupToolbar,50);
        setTimeout(cleanupToolbar,250);
        return out;
      };
      wrapped.__abFinalV75=true;
      window.openDocs=wrapped;
    }

    window.addEventListener('resize',fitFrame,{passive:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();

  window.__AB_COMMANDES_DOCUMENT_PREVIEW_FINAL_VERSION=VERSION;
})();
