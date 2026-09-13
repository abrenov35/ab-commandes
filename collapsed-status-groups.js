(function(){
  'use strict';

  const state=new Map();
  const lastContextByRoot=new Map();

  function norm(v){
    return String(v||'')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .trim()
      .replace(/\s+/g,' ')
      .toLowerCase();
  }

  function sectionKey(section){
    if(!section)return '';
    return String(
      section.dataset.status ||
      section.dataset.abStatus ||
      norm(
        section.querySelector('.ab-status-heading')?.textContent ||
        section.querySelector('summary')?.textContent ||
        ''
      )
    );
  }

  function currentContext(rootId){
    if(rootId!=='ficheOrdersList')return rootId;

    let id='';
    let name='';
    try{id=String(selectedChantierId||'').trim()}catch(e){}
    try{name=String(selectedChantierName||'').trim()}catch(e){}

    const resolved=id||norm(name);
    if(resolved){
      const context=rootId+'::'+resolved;
      lastContextByRoot.set(rootId,context);
      return context;
    }

    return lastContextByRoot.get(rootId)||rootId+'::chantier';
  }

  function stateKey(context,section){
    return context+'::'+sectionKey(section);
  }

  function capture(root,rootId){
    if(!root)return;
    const context=currentContext(rootId);
    if(context)lastContextByRoot.set(rootId,context);

    root.querySelectorAll('details.ab-status-section').forEach(section=>{
      state.set(stateKey(context,section),!!section.open);
    });
  }

  function restore(root,rootId){
    if(!root)return;
    const context=currentContext(rootId);
    if(context)lastContextByRoot.set(rootId,context);

    root.querySelectorAll('details.ab-status-section').forEach(section=>{
      const key=stateKey(context,section);
      if(state.has(key)){
        section.open=!!state.get(key);
      }else{
        // Première apparition : groupes fermés, puis le clic natif du navigateur
        // devient la seule source de changement d'état.
        section.open=false;
        state.set(key,false);
      }
    });

    root.dataset.abGroupContext=context;
    root.dataset.abGroupsReady='1';
  }

  function captureAll(){
    capture(document.getElementById('ordersList'),'ordersList');
    capture(document.getElementById('ficheOrdersList'),'ficheOrdersList');
  }

  function restoreAll(){
    restore(document.getElementById('ordersList'),'ordersList');
    restore(document.getElementById('ficheOrdersList'),'ficheOrdersList');
  }

  function wrap(name){
    const previous=window[name];
    if(typeof previous!=='function'||previous.__abGroupStateV5)return;

    const wrapped=function(){
      captureAll();
      const out=previous.apply(this,arguments);
      // Le rendu est synchrone : on restaure immédiatement, sans observer le DOM
      // et sans tâche différée susceptible d'annuler le clic de l'utilisateur.
      restoreAll();
      return out;
    };

    wrapped.__abGroupStateV5=true;
    wrapped.__abOriginalGroupState=previous;
    window[name]=wrapped;

    try{
      if(name==='renderOrders')renderOrders=wrapped;
      if(name==='renderChantierFiche')renderChantierFiche=wrapped;
      if(name==='renderAll')renderAll=wrapped;
    }catch(e){}
  }

  document.addEventListener('toggle',e=>{
    const section=e.target;
    if(!(section instanceof HTMLDetailsElement))return;
    if(!section.classList.contains('ab-status-section'))return;

    const root=section.closest('#ficheOrdersList,#ordersList');
    if(!root)return;

    const rootId=root.id;
    const context=currentContext(rootId);
    state.set(stateKey(context,section),!!section.open);
  });

  // Pas de MutationObserver ici : l'ancienne version pouvait restaurer un ancien
  // état juste après un clic et donner l'impression qu'il fallait cliquer plusieurs fois.
  wrap('renderOrders');
  wrap('renderChantierFiche');
  wrap('renderAll');

  restoreAll();
  setTimeout(restoreAll,80);
  setTimeout(restoreAll,350);

  window.__AB_COMMANDES_COLLAPSED_STATUS_GROUPS_VERSION='5.0-direct-toggle';
})();
