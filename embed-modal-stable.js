(function(){
  'use strict';

  const params=new URL(window.location.href).searchParams;
  if(params.get('embed')!=='1')return;

  const STYLE_ID='ab-commandes-embed-modal-stable-style';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      html.ab-embed-mode,body.ab-embed-mode{overflow:visible!important}
      body.ab-embed-mode .modal{
        position:absolute!important;inset:0 0 auto 0!important;width:100%!important;height:auto!important;
        min-height:100%!important;padding:8px!important;align-items:flex-start!important;justify-content:center!important;
        overflow:visible!important;
      }
      body.ab-embed-mode .modal.show{display:flex!important}
      body.ab-embed-mode .modal .dialog{
        width:min(560px,calc(100% - 8px))!important;max-width:560px!important;max-height:none!important;
        overflow:visible!important;margin:0 auto!important;padding:14px 16px 13px!important;border-radius:12px!important;
        box-shadow:0 14px 38px rgba(9,19,38,.18)!important;
      }
      body.ab-embed-mode .modal .dialog h3{margin:0 0 8px!important;font-size:19px!important;line-height:1.15!important}
      body.ab-embed-mode #modal .notice,body.ab-embed-mode #yayaChantierInfo{display:none!important}
      body.ab-embed-mode #modal .form-grid{grid-template-columns:1fr 1fr!important;gap:8px 10px!important}
      body.ab-embed-mode #modal .label{margin-bottom:3px!important;font-size:11px!important;line-height:1.1!important}
      body.ab-embed-mode #modal .field{min-height:36px!important;padding:7px 9px!important;border-radius:8px!important;font-size:13px!important}
      body.ab-embed-mode #modal .dialog-actions{position:static!important;margin-top:10px!important;padding-top:9px!important;gap:8px!important;border-top:1px solid #edf0f4!important;background:#fff!important}
      body.ab-embed-mode #modal .dialog-actions .btn{min-height:34px!important;padding:8px 13px!important;border-radius:8px!important;font-size:12px!important}
      @media(max-width:540px){
        body.ab-embed-mode .modal{padding:5px!important}
        body.ab-embed-mode .modal .dialog{width:100%!important;max-width:none!important;padding:12px!important}
        body.ab-embed-mode #modal .form-grid{grid-template-columns:1fr!important;gap:7px!important}
        body.ab-embed-mode #modal .form-grid .full{grid-column:auto!important}
      }
    `;
    document.head.appendChild(style);
  }

  function compactFields(){
    const status=document.getElementById('fStatus');
    const notes=document.getElementById('fNotes');
    if(status&&status.parentElement)status.parentElement.classList.remove('full');
    if(notes&&notes.parentElement)notes.parentElement.classList.remove('full');
  }

  let lastHeight=0;
  function postHeight(value){
    const h=Math.max(120,Math.ceil(Number(value)||0));
    if(Math.abs(h-lastHeight)<2)return;
    lastHeight=h;
    try{window.parent.postMessage({type:'AB_COMMANDES_HEIGHT',height:h},'*')}catch(e){}
  }

  function naturalHeight(){
    return Math.max(
      document.body.scrollHeight||0,document.body.offsetHeight||0,
      document.documentElement.scrollHeight||0,document.documentElement.offsetHeight||0
    );
  }

  function fit(){
    compactFields();
    const modal=document.querySelector('.modal.show');
    if(!modal){release();return}
    const dialog=modal.querySelector('.dialog');if(!dialog)return;
    requestAnimationFrame(()=>{
      const dh=Math.ceil(Math.max(dialog.scrollHeight||0,dialog.getBoundingClientRect().height||0));
      const target=Math.max(440,dh+24);
      document.body.style.setProperty('min-height',target+'px','important');
      document.documentElement.style.setProperty('min-height',target+'px','important');
      postHeight(Math.max(target,naturalHeight())+2);
    });
  }

  function release(){
    if(document.querySelector('.modal.show')){fit();return}
    document.body.style.removeProperty('min-height');
    document.documentElement.style.removeProperty('min-height');
    requestAnimationFrame(()=>postHeight(naturalHeight()+2));
  }

  function scheduleFit(){setTimeout(()=>document.querySelector('.modal.show')?fit():release(),0)}

  document.addEventListener('ab-commandes-modal-open',scheduleFit);
  document.addEventListener('ab-commandes-modal-close',scheduleFit);

  /* Un contrôle après les interactions suffit ; aucune observation permanente du DOM. */
  document.addEventListener('click',scheduleFit,true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')scheduleFit()},true);
  window.addEventListener('resize',scheduleFit);
  window.addEventListener('load',release,{once:true});

  try{
    if(typeof closeModal==='function'&&!closeModal.__abStableWrapped){
      const originalClose=closeModal;
      const wrapped=function(){const out=originalClose.apply(this,arguments);document.dispatchEvent(new CustomEvent('ab-commandes-modal-close'));return out};
      wrapped.__abStableWrapped=true;
      closeModal=wrapped;
    }
  }catch(e){}

  try{
    if(typeof openModal==='function'&&!openModal.__abStableWrapped){
      const originalOpen=openModal;
      const wrapped=async function(){const out=await originalOpen.apply(this,arguments);document.dispatchEvent(new CustomEvent('ab-commandes-modal-open'));return out};
      wrapped.__abStableWrapped=true;
      openModal=wrapped;
    }
  }catch(e){}

  setTimeout(release,50);
  setTimeout(release,250);
  window.__AB_COMMANDES_EMBED_MODAL_STABLE_VERSION='1.0';
})();
