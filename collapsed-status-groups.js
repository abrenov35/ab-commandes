(function(){
  'use strict';

  function collapse(root){
    if(!root)return;
    root.querySelectorAll('details.ab-status-section[open]').forEach(d=>d.removeAttribute('open'));
  }

  function collapseAll(){
    collapse(document.getElementById('ordersList'));
    collapse(document.getElementById('ficheOrdersList'));
  }

  function wrap(name,rootId){
    const previous=window[name];
    if(typeof previous!=='function'||previous.__abCollapsedGroupsWrapped)return;
    const wrapped=function(){
      const out=previous.apply(this,arguments);
      collapse(document.getElementById(rootId));
      return out;
    };
    wrapped.__abCollapsedGroupsWrapped=true;
    window[name]=wrapped;
  }

  wrap('renderOrders','ordersList');
  wrap('renderChantierFiche','ficheOrdersList');
  collapseAll();

  window.addEventListener('load',collapseAll,{once:true});
  setTimeout(collapseAll,50);

  window.__AB_COMMANDES_COLLAPSED_STATUS_GROUPS_VERSION='1.0';
})();
