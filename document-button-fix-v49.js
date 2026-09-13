(function(){
  'use strict';

  const VERSION='49.0';
  const STYLE_ID='ab-commandes-document-button-fix-v49-style';

  function injectStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      /* V49 : aucun second lanceur dans le corps de la modale */
      #modal #abDocLaunchV47{display:none!important}
      /* V49 : suppression du texte d'aide sous le titre */
      #modal .ab-modal-subtitle{display:none!important}
      #modal .ab-modal-head{padding-bottom:10px!important}
    `;
    document.head.appendChild(s);
  }

  function removeSubtitle(){
    document.querySelector('#modal .ab-modal-subtitle')?.remove();
  }

  function hideBodyLauncher(){
    const host=document.getElementById('abDocLaunchV47');
    if(host)host.style.setProperty('display','none','important');
    const old=document.getElementById('abEditUploadWrap');
    if(old)old.style.setProperty('display','none','important');
  }

  function footerButton(){
    return document.getElementById('abEditDocBtn');
  }

  function bindFooterButton(){
    injectStyle();
    removeSubtitle();
    hideBodyLauncher();
    const btn=footerButton();
    if(!btn)return;
    btn.textContent='📎 Ajouter un document';
    btn.title='Ajouter un document à cette commande';
  }

  function openDedicatedUpload(){
    hideBodyLauncher();
    const launcher=document.getElementById('abOpenUploadModalV47');
    if(!launcher){
      console.error('AB COMMANDES V49 : lanceur upload V47 introuvable');
      return;
    }
    launcher.click();
  }

  document.addEventListener('click',function(e){
    const btn=e.target&&e.target.closest?e.target.closest('#abEditDocBtn'):null;
    if(!btn)return;
    e.preventDefault();
    e.stopPropagation();
    if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
    openDedicatedUpload();
  },true);

  document.addEventListener('ab-commandes-modal-open',()=>{
    bindFooterButton();
    requestAnimationFrame(bindFooterButton);
    setTimeout(bindFooterButton,80);
  });

  try{
    if(typeof openModal==='function'&&!openModal.__abDocumentButtonFixV49){
      const previous=openModal;
      const wrapped=async function(){
        const out=await previous.apply(this,arguments);
        bindFooterButton();
        requestAnimationFrame(bindFooterButton);
        setTimeout(bindFooterButton,80);
        return out;
      };
      wrapped.__abDocumentButtonFixV49=true;
      openModal=wrapped;
    }
  }catch(err){console.error('AB COMMANDES V49 openModal',err)}

  injectStyle();
  bindFooterButton();
  new MutationObserver(()=>bindFooterButton()).observe(document.body,{childList:true,subtree:true});
  window.__AB_COMMANDES_DOCUMENT_BUTTON_FIX_VERSION=VERSION;
})();
