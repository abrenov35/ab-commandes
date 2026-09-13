(function(){
  'use strict';

  const VERSION='71.0';
  const MODAL_ID='abDocumentPreviewV64';
  const STYLE_ID='abDocumentPreviewFitV71Style';

  function injectStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      #${MODAL_ID}{padding:5px!important}
      #${MODAL_ID} .ab-doc-preview-card{
        height:calc(100dvh - 10px)!important;
        max-height:calc(100dvh - 10px)!important;
      }
      #${MODAL_ID} .ab-doc-preview-body{
        min-height:0!important;
        overflow:hidden!important;
      }
      #${MODAL_ID} .ab-doc-preview-frame{
        height:100%!important;
        max-height:100%!important;
        border:0!important;
      }
      @media(max-width:650px){
        #${MODAL_ID}{padding:3px!important}
        #${MODAL_ID} .ab-doc-preview-card{
          width:calc(100vw - 6px)!important;
          height:calc(100dvh - 6px)!important;
          max-height:calc(100dvh - 6px)!important;
        }
      }
    `;
    document.head.appendChild(s);
  }

  function fitFrame(frame){
    if(!frame||frame.dataset.abFitHeightV71==='1')return;
    frame.dataset.abFitHeightV71='1';

    // Google Drive zoome automatiquement les PDF à la largeur de l'iframe.
    // On démarre à largeur nulle puis on restitue 100 % après chargement :
    // le lecteur conserve alors l'affichage page entière.
    frame.style.setProperty('width','0','important');
    frame.style.setProperty('height','100%','important');

    const reveal=function(){
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){
          if(!frame.isConnected)return;
          frame.style.setProperty('width','100%','important');
          frame.style.setProperty('height','100%','important');
        });
      });
    };

    frame.addEventListener('load',reveal,{once:true});
    setTimeout(reveal,900);
  }

  function scan(){
    injectStyle();
    const modal=document.getElementById(MODAL_ID);
    if(!modal)return;
    modal.querySelectorAll('.ab-doc-preview-frame').forEach(fitFrame);
  }

  function install(){
    injectStyle();
    const root=document.body;
    if(!root)return;
    const observer=new MutationObserver(function(){
      scan();
    });
    observer.observe(root,{childList:true,subtree:true});
    window.addEventListener('resize',scan,{passive:true});
    scan();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();

  window.__AB_COMMANDES_DOCUMENT_PREVIEW_FIT_VERSION=VERSION;
})();
