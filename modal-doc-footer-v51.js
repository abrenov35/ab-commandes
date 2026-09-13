(function(){
  'use strict';

  const VERSION='51.0';
  const STYLE_ID='ab-commandes-modal-doc-footer-v51-style';
  let scheduled=false;

  function injectStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      /* V51 : plus aucun bouton document dans le corps de la modale */
      #modal #abDocLaunchV47,
      #modal #abEditUploadWrap{display:none!important}

      /* V51 : ligne d'actions unique en pied de modale */
      #modal .dialog-actions{
        display:flex!important;
        align-items:center!important;
        flex-wrap:nowrap!important;
        gap:8px!important;
      }
      #modal #abEditDocBtn{
        order:-10!important;
        margin-right:auto!important;
        min-height:35px!important;
        height:35px!important;
        padding:0 12px!important;
        border:1px solid #aebed1!important;
        border-radius:8px!important;
        background:#fff!important;
        color:#173a60!important;
        box-shadow:none!important;
        font-size:11px!important;
        font-weight:850!important;
        white-space:nowrap!important;
      }
      #modal #abEditDocBtn:hover{
        background:#f2f6fa!important;
        border-color:#7f9ab8!important;
      }
      #modal #cancelBtn{order:10!important;margin-left:0!important}
      #modal #saveBtn{order:20!important}

      @media(max-width:650px){
        #modal .dialog-actions{gap:6px!important}
        #modal #abEditDocBtn{padding:0 8px!important;font-size:10px!important;min-width:0!important}
        #modal #cancelBtn,#modal #saveBtn{flex:0 1 auto!important}
      }
    `;
    document.head.appendChild(s);
  }

  function bodyLauncher(){return document.getElementById('abOpenUploadModalV47');}

  function ensureFooterButton(){
    injectStyle();
    const actions=document.querySelector('#modal .dialog-actions');
    if(!actions)return null;

    let btn=document.getElementById('abEditDocBtn');
    if(!btn){
      btn=document.createElement('button');
      btn.id='abEditDocBtn';
      btn.type='button';
      btn.className='btn secondary';
      actions.prepend(btn);
    }else if(btn.parentElement!==actions){
      actions.prepend(btn);
    }

    btn.textContent='📎 Ajouter un document';
    btn.title='Ajouter un document à cette commande';

    const editing=!!String(typeof editId!=='undefined'?editId:'');
    btn.classList.toggle('ab-visible',editing);
    btn.style.setProperty('display',editing?'inline-flex':'none','important');

    const body=document.getElementById('abDocLaunchV47');
    if(body)body.style.setProperty('display','none','important');
    const old=document.getElementById('abEditUploadWrap');
    if(old)old.style.setProperty('display','none','important');

    return btn;
  }

  function openUpload(){
    const launcher=bodyLauncher();
    if(!launcher){
      console.error('AB COMMANDES V51 : lanceur upload dédié introuvable');
      return;
    }
    launcher.click();
  }

  document.addEventListener('click',e=>{
    const btn=e.target&&e.target.closest?e.target.closest('#abEditDocBtn'):null;
    if(!btn)return;
    e.preventDefault();
    e.stopPropagation();
    if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
    openUpload();
  },true);

  function refresh(){
    scheduled=false;
    ensureFooterButton();
  }
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(refresh);
  }

  document.addEventListener('ab-commandes-modal-open',()=>{
    ensureFooterButton();
    requestAnimationFrame(ensureFooterButton);
    setTimeout(ensureFooterButton,80);
  });

  try{
    if(typeof openModal==='function'&&!openModal.__abDocFooterV51){
      const previous=openModal;
      const wrapped=async function(){
        const out=await previous.apply(this,arguments);
        ensureFooterButton();
        requestAnimationFrame(ensureFooterButton);
        setTimeout(ensureFooterButton,80);
        return out;
      };
      wrapped.__abDocFooterV51=true;
      openModal=wrapped;
    }
  }catch(err){console.error('AB COMMANDES V51 openModal',err)}

  injectStyle();
  ensureFooterButton();
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
  window.__AB_COMMANDES_MODAL_DOC_FOOTER_VERSION=VERSION;
})();
