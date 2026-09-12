(function(){
  'use strict';

  const state=new Map();

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
    return rootId+'::'+(id||norm(name)||'chantier');
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
    const context=root.dataset.abGroupContext||'';
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
    state.set(stateKey(context,section),section.open);
  },true);

  initialize(document.getElementById('ordersList'),'ordersList');
  initialize(document.getElementById('ficheOrdersList'),'ficheOrdersList');
  wrap('renderOrders','ordersList');
  wrap('renderChantierFiche','ficheOrdersList');

  window.__AB_COMMANDES_COLLAPSED_STATUS_GROUPS_VERSION='4.0';
})();
