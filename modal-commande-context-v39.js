(function(){
  'use strict';

  if(window.__AB_COMMANDES_MODAL_CONTEXT_V39)return;
  window.__AB_COMMANDES_MODAL_CONTEXT_V39=true;

  const IS_EMBED=new URL(window.location.href).searchParams.get('embed')==='1';

  function chantierWrap(){
    const f=document.getElementById('fChantier');
    return f&&f.parentElement?f.parentElement:null;
  }

  function showChantierField(show){
    const wrap=chantierWrap();
    if(!wrap)return;
    wrap.style.setProperty('display',show?'':'none',show?'':'important');
    if(show)wrap.style.removeProperty('display');
  }

  function forceBlankResponsable(){
    const f=document.getElementById('fResp');
    if(!f)return;
    const hasBlank=[...f.options].some(o=>String(o.value||'')==='');
    if(!hasBlank){
      const o=document.createElement('option');
      o.value='';
      o.textContent='';
      f.insertBefore(o,f.firstChild);
    }
    f.value='';
    if(f.value!=='')f.selectedIndex=0;
  }

  function lockAndHideChantier(){
    const f=document.getElementById('fChantier');
    if(f){
      f.disabled=true;
      f.tabIndex=-1;
      f.setAttribute('aria-disabled','true');
    }
    showChantierField(false);
  }

  function unlockChantier(){
    const f=document.getElementById('fChantier');
    if(f){
      f.disabled=false;
      f.removeAttribute('aria-disabled');
      if(f.tabIndex<0)f.tabIndex=0;
    }
    showChantierField(true);
  }

  try{
    if(typeof openModal==='function'&&!openModal.__abCommandeContextV39){
      const previous=openModal;
      const wrapped=async function(id=null){
        let hadPreset=false;
        try{hadPreset=!id&&typeof presetChantierId!=='undefined'&&String(presetChantierId||'').trim()!=='';}catch(e){}
        const fixedContext=!!id||IS_EMBED||hadPreset;

        const out=await previous.apply(this,arguments);

        if(!id)forceBlankResponsable();
        if(fixedContext)lockAndHideChantier();
        else unlockChantier();

        try{document.dispatchEvent(new CustomEvent('ab-commandes-modal-open'));}catch(e){}
        return out;
      };
      wrapped.__abCommandeContextV39=true;
      openModal=wrapped;
    }
  }catch(e){
    console.error('AB COMMANDES V39 modale chantier',e);
  }

  window.__AB_COMMANDES_MODAL_CONTEXT_VERSION='39.0';
})();
