(function(){
  'use strict';

  const state=new Map();
  const lastContextByRoot=new Map();
  let restoreScheduled=false;

  function norm(v){
    return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toLowerCase();
  }

  function sectionKey(section){
    if(!section)return '';
    return String(section.dataset.status||section.dataset.abStatus||norm(section.querySelector('.ab-status-heading')?.textContent||section.querySelector('summary')?.textContent||''));
  }

  function currentContext(rootId){
    if(rootId!=='ficheOrdersList')return rootId;
    let id='',name='';
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

  function stateKey(context,section){return context+'::'+sectionKey(section)}

  function initialize(root,rootId){
    if(!root||root.dataset.abGroupsReady==='1')return;
    const context=currentContext(rootId);
    root.querySelectorAll('details.ab-status-section').forEach(section=>{
      section.removeAttribute('open');
      state.set(stateKey(context,section),false);
    });
    root.dataset.abGroupContext=context;
    root.dataset.abGroupsReady='1';
  }

  function capture(root){
    if(!root||root.dataset.abGroupsReady!=='1')return;
    const context=root.dataset.abGroupContext||currentContext(root.id);
    if(context)lastContextByRoot.set(root.id,context);
    root.querySelectorAll('details.ab-status-section').forEach(section=>{
      state.set(stateKey(context,section),section.open);
    });
  }

  function restore(root,rootId){
    if(!root)return;
    const context=currentContext(rootId);
    root.querySelectorAll('details.ab-status-section').forEach(section=>{
      const key=stateKey(context,section);
      if(state.has(key))section.open=!!state.get(key);
      else{
        section.removeAttribute('open');
        state.set(key,false);
      }
    });
    root.dataset.abGroupContext=context;
    root.dataset.abGroupsReady='1';
  }

  function restoreAll(){
    restore(document.getElementById('ordersList'),'ordersList');
    restore(document.getElementById('ficheOrdersList'),'ficheOrdersList');
  }

  function scheduleRestore(){
    if(restoreScheduled)return;
    restoreScheduled=true;
    requestAnimationFrame(()=>{
      restoreScheduled=false;
      restoreAll();
    });
  }

  function wrap(name,rootId){
    const previous=window[name];
    if(typeof previous!=='function'||previous.__abGroupStateWrapped)return;
    const wrapped=function(){
      const root=document.getElementById(rootId);
      capture(root);
      const out=previous.apply(this,arguments);
      queueMicrotask(()=>restore(document.getElementById(rootId),rootId));
      return out;
    };
    wrapped.__abGroupStateWrapped=true;
    window[name]=wrapped;
  }

  document.addEventListener('toggle',e=>{
    const section=e.target;
    if(!(section instanceof HTMLDetailsElement)||!section.classList.contains('ab-status-section'))return;
    const root=section.closest('#ficheOrdersList,#ordersList');
    if(!root)return;
    const rootId=root.id;
    const context=root.dataset.abGroupContext||currentContext(rootId);
    if(context)lastContextByRoot.set(rootId,context);
    state.set(stateKey(context,section),section.open);
  },true);

  initialize(document.getElementById('ordersList'),'ordersList');
  initialize(document.getElementById('ficheOrdersList'),'ficheOrdersList');
  wrap('renderOrders','ordersList');
  wrap('renderChantierFiche','ficheOrdersList');

  // Certains rafraîchissements de synchronisation passent par renderAll et
  // remplacent directement les blocs sans appeler les fonctions enveloppées.
  // On restaure donc aussi l'état des groupes après toute reconstruction DOM.
  new MutationObserver(function(mutations){
    for(const m of mutations){
      if(m.type!=='childList'||(!m.addedNodes.length&&!m.removedNodes.length))continue;
      const target=m.target instanceof Element?m.target:null;
      if(target&&(target.closest('#ordersList,#ficheOrdersList')||target.id==='ordersList'||target.id==='ficheOrdersList')){
        scheduleRestore();
        return;
      }
      for(const node of m.addedNodes){
        if(!(node instanceof Element))continue;
        if(node.matches?.('#ordersList,#ficheOrdersList,details.ab-status-section')||node.querySelector?.('#ordersList,#ficheOrdersList,details.ab-status-section')){
          scheduleRestore();
          return;
        }
      }
    }
  }).observe(document.documentElement,{childList:true,subtree:true});

  window.__AB_COMMANDES_COLLAPSED_STATUS_GROUPS_VERSION='4.1-sync-preserve';
})();
