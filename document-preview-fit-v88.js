(function(){
  'use strict';

  const VERSION='91.0';
  const MODAL_ID='abDocumentPreviewV64';
  const STYLE_ID='abDocumentPreviewFitV91';
  let resizeObserver=null;

  function injectStyle(){
    let s=document.getElementById(STYLE_ID);
    if(!s){
      s=document.createElement('style');
      s.id=STYLE_ID;
      document.head.appendChild(s);
    }

    s.textContent=`
      #${MODAL_ID}{
        padding:8px!important;
        align-items:center!important;
        justify-content:center!important;
        overflow:hidden!important;
        background:rgba(12,27,47,.62)!important;
      }

      #${MODAL_ID} .ab-doc-preview-card{
        width:min(96vw,1100px)!important;
        height:calc(100dvh - 16px)!important;
        max-width:1100px!important;
        max-height:calc(100dvh - 16px)!important;
        min-height:320px!important;
        margin:auto!important;
        display:flex!important;
        flex-direction:column!important;
        overflow:hidden!important;
        background:#fff!important;
        border:1px solid #b8c6d7!important;
        border-radius:10px!important;
        box-shadow:0 18px 55px rgba(15,31,53,.28)!important;
      }

      #${MODAL_ID} .ab-doc-preview-head{
        flex:0 0 auto!important;
        min-height:42px!important;
        padding:7px 10px!important;
        margin:0!important;
        display:flex!important;
        align-items:center!important;
        gap:10px!important;
        background:#fff!important;
        border-bottom:1px solid #d7e0ea!important;
      }

      #${MODAL_ID} .ab-doc-preview-title{
        min-width:0!important;
        flex:1 1 auto!important;
        color:#162d49!important;
        font-size:14px!important;
        font-weight:800!important;
        white-space:nowrap!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
      }

      #${MODAL_ID} .ab-doc-preview-close{
        flex:0 0 auto!important;
        width:auto!important;
        height:32px!important;
        min-width:58px!important;
        padding:5px 12px!important;
        border:1px solid rgba(22,45,73,.24)!important;
        border-radius:8px!important;
        background:#fff!important;
        color:#162d49!important;
        font-size:0!important;
        font-weight:700!important;
        cursor:pointer!important;
      }

      #${MODAL_ID} .ab-doc-preview-close::after{
        content:'Fermer';
        font-size:12px!important;
      }

      #${MODAL_ID} .ab-doc-preview-tabs{
        flex:0 0 auto!important;
        gap:6px!important;
        overflow-x:auto!important;
        overflow-y:hidden!important;
        padding:6px 9px!important;
        border-bottom:1px solid #dde5ef!important;
        background:#fff!important;
        scrollbar-gutter:stable!important;
      }

      #${MODAL_ID} .ab-doc-preview-tab{
        height:30px!important;
        max-width:240px!important;
        padding:0 10px!important;
        border-radius:7px!important;
        font-size:11px!important;
      }

      #${MODAL_ID} .ab-doc-preview-body{
        position:relative!important;
        flex:1 1 auto!important;
        min-width:0!important;
        min-height:0!important;
        width:100%!important;
        height:auto!important;
        max-width:none!important;
        margin:0!important;
        padding:4px!important;
        overflow:auto!important;
        overscroll-behavior:contain!important;
        touch-action:pan-x pan-y!important;
        scrollbar-gutter:stable both-edges!important;
        background:#eef1f5!important;
      }

      #${MODAL_ID} .ab-doc-preview-frame{
        display:block!important;
        width:100%!important;
        min-width:100%!important;
        height:100%!important;
        min-height:100%!important;
        max-width:none!important;
        max-height:none!important;
        margin:0!important;
        position:static!important;
        transform:none!important;
        pointer-events:auto!important;
        border:0!important;
        border-radius:6px!important;
        background:#eef1f5!important;
      }

      #${MODAL_ID} .ab-doc-preview-img{
        display:block!important;
        width:auto!important;
        height:auto!important;
        max-width:100%!important;
        max-height:none!important;
        margin:0 auto!important;
        object-fit:contain!important;
        object-position:center top!important;
      }

      @media(max-width:640px){
        #${MODAL_ID}{padding:4px!important}
        #${MODAL_ID} .ab-doc-preview-card{
          width:calc(100vw - 8px)!important;
          height:calc(100dvh - 8px)!important;
          max-width:none!important;
          max-height:calc(100dvh - 8px)!important;
          border-radius:8px!important;
        }
        #${MODAL_ID} .ab-doc-preview-head{min-height:38px!important;padding:5px 7px!important}
        #${MODAL_ID} .ab-doc-preview-title{font-size:13px!important}
        #${MODAL_ID} .ab-doc-preview-close{height:30px!important;min-width:54px!important;padding:4px 9px!important}
        #${MODAL_ID} .ab-doc-preview-tabs{padding:4px 6px!important}
        #${MODAL_ID} .ab-doc-preview-body{padding:2px!important}
      }
    `;
  }

  function sizeFrame(){
    const modal=document.getElementById(MODAL_ID);
    if(!modal||!modal.classList.contains('show'))return;

    const card=modal.querySelector('.ab-doc-preview-card');
    const body=modal.querySelector('.ab-doc-preview-body');
    const frame=modal.querySelector('.ab-doc-preview-frame');
    if(!card||!body)return;

    card.style.setProperty('width','min(96vw,1100px)','important');
    card.style.setProperty('height','calc(100dvh - 16px)','important');
    card.style.setProperty('max-width','1100px','important');
    card.style.setProperty('max-height','calc(100dvh - 16px)','important');

    body.style.setProperty('width','100%','important');
    body.style.setProperty('height','auto','important');
    body.style.setProperty('max-width','none','important');
    body.style.setProperty('margin','0','important');
    body.style.setProperty('overflow','auto','important');
    body.style.setProperty('overscroll-behavior','contain','important');
    body.style.setProperty('touch-action','pan-x pan-y','important');
    body.style.setProperty('background','#eef1f5','important');

    if(frame){
      const h=Math.max(260,Math.floor(body.clientHeight-8));
      frame.style.setProperty('width','100%','important');
      frame.style.setProperty('min-width','100%','important');
      frame.style.setProperty('height',h+'px','important');
      frame.style.setProperty('min-height',h+'px','important');
      frame.style.setProperty('margin','0','important');
      frame.style.setProperty('position','static','important');
      frame.style.setProperty('transform','none','important');
      frame.style.setProperty('pointer-events','auto','important');
      frame.setAttribute('scrolling','yes');
    }

    try{
      if(resizeObserver)resizeObserver.disconnect();
      resizeObserver=new ResizeObserver(()=>{
        if(!modal.classList.contains('show'))return;
        const f=modal.querySelector('.ab-doc-preview-frame');
        if(!f)return;
        const h=Math.max(260,Math.floor(body.clientHeight-8));
        if(f.style.height!==h+'px'){
          f.style.setProperty('height',h+'px','important');
          f.style.setProperty('min-height',h+'px','important');
        }
      });
      resizeObserver.observe(body);
    }catch(_){ }
  }

  function installOpenDocsWrapper(){
    const previous=window.openDocs;
    if(typeof previous!=='function'||previous.__abFitV91)return;

    const wrapped=function(){
      const out=previous.apply(this,arguments);
      requestAnimationFrame(sizeFrame);
      setTimeout(sizeFrame,40);
      setTimeout(sizeFrame,140);
      setTimeout(sizeFrame,350);
      return out;
    };

    wrapped.__abFitV91=true;
    wrapped.__abPreviousOpenDocs=previous;
    window.openDocs=wrapped;
  }

  injectStyle();
  installOpenDocsWrapper();
  setTimeout(installOpenDocsWrapper,100);
  window.addEventListener('resize',()=>requestAnimationFrame(sizeFrame),{passive:true});
  if(window.visualViewport){
    window.visualViewport.addEventListener('resize',()=>requestAnimationFrame(sizeFrame),{passive:true});
  }
  window.__AB_COMMANDES_DOCUMENT_PREVIEW_FIT_VERSION=VERSION;
})();
