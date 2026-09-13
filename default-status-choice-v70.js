(function(){
  'use strict';

  if(typeof openModal!=='function'||openModal.__abDefaultChoiceV70)return;

  const previous=openModal;
  const wrapped=async function(id=null){
    const out=await previous.apply(this,arguments);
    if(!id){
      const apply=()=>{
        const status=document.getElementById('fStatus');
        if(status)status.value='choice';
      };
      apply();
      requestAnimationFrame(apply);
      setTimeout(apply,120);
    }
    return out;
  };

  wrapped.__abDefaultChoiceV70=true;
  openModal=wrapped;
  window.__AB_COMMANDES_DEFAULT_STATUS_VERSION='70.0';
})();
