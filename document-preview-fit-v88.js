(function(){
  'use strict';

  const VERSION='89.0';
  const MODAL_ID='abDocumentPreviewV64';
  const STYLE_ID='abDocumentPreviewFitV88';
  const RATIO=.70;

  function injectStyle(){
    let s=document.getElementById(STYLE_ID);
    if(!s){s=document.createElement('style');s.id=STYLE_ID;document.head.appendChild(s);}
    s.textContent=`
      #${MODAL_ID}{padding:3px!important}
      #${MODAL_ID} .ab-doc-preview-card{
        width:calc(100vw - 6px)!important;
        height:calc(100vh - 6px)!important;
        max-width:none!important;
        max-height:none!important;
        margin:0 auto!important;
      }
      #${MODAL_ID} .ab-doc-preview-body{
        min-height:0!important;
        height:100%!important;
        margin-left:auto!important;
        margin-right:auto!important;
        padding:0!important;
        overflow:hidden!important;
        background:#fff!important;
      }
      #${MODAL_ID} .ab-doc-preview-frame{
        display:block!important;
        width:100%!important;
        height:100%!important;
        max-width:none!important;
        max-height:none!important;
        margin:0!important;
        position:static!important;
        transform:none!important;
        transform-origin:center top!important;
        pointer-events:auto!important;
        border:0!important;
      }
    `;
  }

  function apply(){
    const modal=document.getElementById(MODAL_ID);
    if(!modal||!modal.classList.contains('show'))return;
    const card=modal.querySelector('.ab-doc-preview-card');
    const body=modal.querySelector('.ab-doc-preview-body');
    const frame=modal.querySelector('.ab-doc-preview-frame');
    if(!card||!body||!frame)return;

    card.style.setProperty('height','calc(100vh - 6px)','important');
    card.style.setProperty('max-height','none','important');

    requestAnimationFrame(()=>{
      const h=Math.max(1,body.clientHeight);
      const w=Math.round(h*RATIO);
      body.style.setProperty('width',w+'px','important');
      body.style.setProperty('max-width','calc(100vw - 12px)','important');
      body.style.setProperty('height','100%','important');
      body.style.setProperty('margin-left','auto','important');
      body.style.setProperty('margin-right','auto','important');
      body.style.setProperty('overflow','hidden','important');
      body.style.setProperty('background','#fff','important');

      frame.style.setProperty('width','100%','important');
      frame.style.setProperty('height','100%','important');
      frame.style.setProperty('margin','0','important');
      frame.style.setProperty('position','static','important');
      frame.style.setProperty('transform','none','important');
      frame.style.setProperty('pointer-events','auto','important');
      frame.setAttribute('scrolling','yes');
    });
  }

  function installOpenDocsWrapper(){
    const previous=window.openDocs;
    if(typeof previous!=='function'||previous.__abFitV89)return;
    const wrapped=function(){
      const out=previous.apply(this,arguments);
      requestAnimationFrame(apply);
      setTimeout(apply,60);
      setTimeout(apply,180);
      return out;
    };
    wrapped.__abFitV89=true;
    wrapped.__abPreviousOpenDocs=previous;
    window.openDocs=wrapped;
  }

  injectStyle();
  installOpenDocsWrapper();
  setTimeout(installOpenDocsWrapper,100);
  window.addEventListener('resize',()=>requestAnimationFrame(apply),{passive:true});
  window.__AB_COMMANDES_DOCUMENT_PREVIEW_FIT_VERSION=VERSION;
})();