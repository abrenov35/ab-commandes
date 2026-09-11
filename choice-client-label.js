(function(){
  'use strict';

  const NEW='Attente choix client';
  const OLD_LABELS=['Choix client à faire','Choix client'];

  function patchStatusDefinition(){
    try{
      if(typeof STATUSES!=='undefined'&&STATUSES.choice){
        STATUSES.choice.label=NEW;
      }
    }catch(e){}
  }

  function patchRenderedLabels(root){
    if(!root)return;

    root.querySelectorAll('option[value="choice"]').forEach(option=>{
      option.textContent=NEW;
    });

    root.querySelectorAll('.ab-status-heading').forEach(el=>{
      const value=String(el.textContent||'').trim();
      if(OLD_LABELS.includes(value))el.textContent=NEW;
    });

    root.querySelectorAll('.kpi .kpi-label,.ab-kpi-card .ab-kpi-label').forEach(el=>{
      const value=String(el.textContent||'').trim();
      if(OLD_LABELS.includes(value))el.textContent=NEW;
    });
  }

  function refresh(){
    patchStatusDefinition();
    patchRenderedLabels(document);
  }

  function wrapRender(name){
    const previous=window[name];
    if(typeof previous!=='function'||previous.__abChoiceLabelWrapped)return;
    const wrapped=function(){
      const out=previous.apply(this,arguments);
      patchRenderedLabels(document);
      return out;
    };
    wrapped.__abChoiceLabelWrapped=true;
    window[name]=wrapped;
  }

  patchStatusDefinition();
  wrapRender('renderOrders');
  wrapRender('renderChantierFiche');
  refresh();
  window.addEventListener('load',refresh,{once:true});

  window.__AB_COMMANDES_CHOICE_CLIENT_LABEL_VERSION='2.0';
})();
