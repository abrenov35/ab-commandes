(function(){
  'use strict';

  function removeVisibleChantier(){
    const field=document.getElementById('fChantier');
    if(!field)return;

    let hidden=document.getElementById('abHiddenChantierV69');
    if(!hidden){
      hidden=document.createElement('div');
      hidden.id='abHiddenChantierV69';
      hidden.style.setProperty('display','none','important');
      const modal=document.getElementById('modal');
      (modal||document.body).appendChild(hidden);
    }

    const oldWrap=field.parentElement;
    if(oldWrap!==hidden){
      hidden.appendChild(field);
      if(oldWrap&&oldWrap.id!=='abHiddenChantierV69')oldWrap.remove();
    }

    hidden.style.setProperty('display','none','important');
    const info=document.getElementById('yayaChantierInfo');
    if(info)info.remove();
  }

  removeVisibleChantier();

  try{
    if(typeof openModal==='function'&&!openModal.__abRemoveChantierV69){
      const previous=openModal;
      const wrapped=async function(){
        const out=await previous.apply(this,arguments);
        removeVisibleChantier();
        requestAnimationFrame(removeVisibleChantier);
        setTimeout(removeVisibleChantier,160);
        return out;
      };
      wrapped.__abRemoveChantierV69=true;
      openModal=wrapped;
    }
  }catch(e){console.error('AB COMMANDES V69 chantier',e)}

  window.__AB_COMMANDES_REMOVE_CHANTIER_VERSION='69.0';
})();
