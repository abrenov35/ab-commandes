(function(){
  'use strict';

  const VERSION='73.0';
  const MODAL_ID='abDocumentPreviewV64';
  const STYLE_ID='abDocumentPreviewToolbarV73Style';

  function injectStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      #${MODAL_ID} .ab-doc-preview-tabs{
        display:flex!important;
        align-items:center!important;
        gap:7px!important;
        min-height:50px!important;
        padding:9px 12px!important;
      }
      #${MODAL_ID} .ab-doc-preview-actions-v73{
        margin-left:auto;
        display:flex;
        align-items:center;
        gap:8px;
        flex:0 0 auto;
        position:sticky;
        right:0;
        background:#fff;
        padding-left:8px;
      }
      #${MODAL_ID} .ab-doc-preview-foot{display:none!important}
      @media(max-width:650px){
        #${MODAL_ID} .ab-doc-preview-tabs{gap:5px!important;padding:7px!important;min-height:46px!important}
        #${MODAL_ID} .ab-doc-preview-actions-v73{gap:5px;padding-left:5px}
        #${MODAL_ID} .ab-doc-preview-open,
        #${MODAL_ID} .ab-doc-preview-done{min-height:32px;padding:0 9px;font-size:10px}
      }
    `;
    document.head.appendChild(s);
  }

  function moveButtons(){
    injectStyle();
    const modal=document.getElementById(MODAL_ID);
    if(!modal)return;
    const tabs=modal.querySelector('.ab-doc-preview-tabs');
    const foot=modal.querySelector('.ab-doc-preview-foot');
    if(!tabs||!foot)return;

    let actions=tabs.querySelector('.ab-doc-preview-actions-v73');
    if(!actions){
      actions=document.createElement('div');
      actions.className='ab-doc-preview-actions-v73';
      tabs.appendChild(actions);
    }

    const open=foot.querySelector('.ab-doc-preview-open')||modal.querySelector('.ab-doc-preview-open');
    const done=foot.querySelector('.ab-doc-preview-done')||modal.querySelector('.ab-doc-preview-done');
    if(open&&open.parentElement!==actions)actions.appendChild(open);
    if(done&&done.parentElement!==actions)actions.appendChild(done);
  }

  injectStyle();

  if(typeof window.openDocs==='function'&&!window.openDocs.__abToolbarV73){
    const previous=window.openDocs;
    const wrapped=function(){
      const out=previous.apply(this,arguments);
      requestAnimationFrame(moveButtons);
      setTimeout(moveButtons,0);
      return out;
    };
    wrapped.__abToolbarV73=true;
    window.openDocs=wrapped;
  }

  window.__AB_COMMANDES_DOCUMENT_PREVIEW_TOOLBAR_VERSION=VERSION;
})();
