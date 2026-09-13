(function(){
  'use strict';

  const NEW='Attente choix client';
  const OLD_LABELS=['Choix client à faire','Choix client'];
  let supplierPatchScheduled=false;

  function patchStatusDefinition(){
    try{
      if(typeof STATUSES!=='undefined'&&STATUSES.choice){
        STATUSES.choice.label=NEW;
      }
    }catch(e){}
  }

  function removeProblemChoices(root){
    if(!root)return;
    root.querySelectorAll('select option[value="problem"]').forEach(option=>option.remove());
  }

  function forceBlankResponsibleForNew(){
    try{
      if(typeof editId!=='undefined'&&editId)return;
    }catch(e){}
    const select=document.getElementById('fResp');
    if(!select)return;
    let blank=[...select.options].find(o=>String(o.value||'')==='');
    if(!blank){
      blank=document.createElement('option');
      blank.value='';
      blank.textContent='— Choisir —';
      select.insertBefore(blank,select.firstChild);
    }else if(!String(blank.textContent||'').trim()){
      blank.textContent='— Choisir —';
    }
    select.value='';
    if(select.value!=='')select.selectedIndex=0;
  }

  function orderForRow(row){
    try{
      const id=String(row?.dataset?.id||row?.dataset?.ficheId||'');
      if(!id||typeof orders==='undefined'||!Array.isArray(orders))return null;
      return orders.find(o=>String(o.id||'')===id)||null;
    }catch(e){return null}
  }

  function patchOrderSupplierLabels(root){
    if(!root)return;
    root.querySelectorAll('.order-row[data-id],.order-row[data-fiche-id]').forEach(row=>{
      const cell=row.querySelector('.ab-order-resp');
      if(!cell)return;
      const order=orderForRow(row);
      if(!order)return;
      cell.textContent=String(order.fournisseur||'—');
      cell.title='Fournisseur';
    });
  }

  function scheduleSupplierPatch(){
    if(supplierPatchScheduled)return;
    supplierPatchScheduled=true;
    requestAnimationFrame(()=>{
      supplierPatchScheduled=false;
      patchOrderSupplierLabels(document);
    });
  }

  function patchRenderedLabels(root){
    if(!root)return;

    root.querySelectorAll('option[value="choice"]').forEach(option=>{
      option.textContent=NEW;
    });

    removeProblemChoices(root);

    root.querySelectorAll('.ab-status-heading').forEach(el=>{
      const value=String(el.textContent||'').trim();
      if(OLD_LABELS.includes(value))el.textContent=NEW;
    });

    root.querySelectorAll('.kpi .kpi-label,.ab-kpi-card .ab-kpi-label').forEach(el=>{
      const value=String(el.textContent||'').trim();
      if(OLD_LABELS.includes(value))el.textContent=NEW;
    });

    patchOrderSupplierLabels(root);
  }

  function refresh(){
    patchStatusDefinition();
    patchRenderedLabels(document);
    scheduleSupplierPatch();
  }

  function wrapRender(name){
    const previous=window[name];
    if(typeof previous!=='function'||previous.__abChoiceLabelWrapped)return;
    const wrapped=function(){
      const out=previous.apply(this,arguments);
      patchRenderedLabels(document);
      scheduleSupplierPatch();
      return out;
    };
    wrapped.__abChoiceLabelWrapped=true;
    window[name]=wrapped;
  }

  patchStatusDefinition();
  wrapRender('renderOrders');
  wrapRender('renderChantierFiche');
  refresh();

  document.addEventListener('ab-commandes-modal-open',()=>{
    patchRenderedLabels(document);
    forceBlankResponsibleForNew();
    setTimeout(()=>{
      patchRenderedLabels(document);
      forceBlankResponsibleForNew();
    },60);
  });

  new MutationObserver(scheduleSupplierPatch).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('load',refresh,{once:true});

  window.__AB_COMMANDES_CHOICE_CLIENT_LABEL_VERSION='3.1-supplier-display';
})();
