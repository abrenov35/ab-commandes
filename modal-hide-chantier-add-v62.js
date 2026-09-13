(function(){
  'use strict';

  const VERSION='62.0';

  function applyChantierVisibility(editing){
    const field=document.getElementById('fChantier');
    const wrap=field&&field.parentElement;
    if(!wrap)return;
    wrap.style.setProperty('display',editing?'':'none','important');
  }

  try{
    if(typeof openModal==='function'&&!openModal.__abHideChantierAddV62){
      const previous=openModal;
      const wrapped=async function(id=null){
        const out=await previous.apply(this,arguments);
        const editing=!!String(id||'');
        applyChantierVisibility(editing);
        requestAnimationFrame(()=>applyChantierVisibility(editing));
        return out;
      };
      wrapped.__abHideChantierAddV62=true;
      openModal=wrapped;
    }
  }catch(e){console.error('AB COMMANDES V62 chantier ajout',e)}

  const modal=document.getElementById('modal');
  if(modal&&modal.classList.contains('show')){
    applyChantierVisibility(!!String(typeof editId!=='undefined'?editId:''));
  }

  window.__AB_COMMANDES_HIDE_CHANTIER_ADD_VERSION=VERSION;
})();
