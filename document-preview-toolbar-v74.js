(function(){
  'use strict';

  const VERSION='74.0';
  const MODAL_ID='abDocumentPreviewV64';
  const STYLE_ID='abDocumentPreviewToolbarV74Style';

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
      #${MODAL_ID} .ab-doc-preview-actions-v74{
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
        #${MODAL_ID} .ab-doc-preview-actions-v74{gap:5px;padding-left:5px}
        #${MODAL_ID} .ab-doc-preview-actions-v74 .ab-doc-preview-open,
        #${MODAL_ID} .ab-doc-preview-actions-v74 .ab-doc-preview-done{min-height:32px;padding:0 9px;font-size:10px}
      }
    `;
    document.head.appendChild(s);
  }

  function installToolbar(){
    injectStyle();
    const modal=document.getElementById(MODAL_ID);
    if(!modal)return;
    const tabs=modal.querySelector('.ab-doc-preview-tabs');
    if(!tabs)return;

    const old=tabs.querySelector('.ab-doc-preview-actions-v73');
    if(old)old.remove();

    let actions=tabs.querySelector('.ab-doc-preview-actions-v74');
    if(!actions){
      actions=document.createElement('div');
      actions.className='ab-doc-preview-actions-v74';

      const open=document.createElement('a');
      open.className='ab-doc-preview-open';
      open.href='#';
      open.target='_blank';
      open.rel='noopener';
      open.textContent='Ouvrir dans un nouvel onglet';

      const done=document.createElement('button');
      done.type='button';
      done.className='ab-doc-preview-done';
      done.textContent='Fermer';
      done.onclick=()=>modal.classList.remove('show');

      actions.append(open,done);
      tabs.appendChild(actions);
    }

    const activeOpen=actions.querySelector('.ab-doc-preview-open');
    const footOpen=modal.querySelector('.ab-doc-preview-foot .ab-doc-preview-open');
    if(activeOpen&&footOpen){
      activeOpen.href=footOpen.href||'#';
      activeOpen.style.display=footOpen.style.display||'inline-flex';
    }
  }

  injectStyle();

  if(typeof window.openDocs==='function'&&!window.openDocs.__abToolbarV74){
    const previous=window.openDocs;
    const wrapped=function(){
      const out=previous.apply(this,arguments);
      requestAnimationFrame(installToolbar);
      setTimeout(installToolbar,0);
      setTimeout(installToolbar,120);
      return out;
    };
    wrapped.__abToolbarV74=true;
    window.openDocs=wrapped;
  }

  window.__AB_COMMANDES_DOCUMENT_PREVIEW_TOOLBAR_VERSION=VERSION;
})();
