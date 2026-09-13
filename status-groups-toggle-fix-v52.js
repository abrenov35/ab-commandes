(function(){
  'use strict';

  const VERSION='52.0';

  function isStatusSummary(node){
    return !!(node && node.matches && node.matches('details.ab-status-section > summary'));
  }

  function toggleFromEvent(e){
    const summary=e.target && e.target.closest ? e.target.closest('details.ab-status-section > summary') : null;
    if(!summary || !isStatusSummary(summary))return;

    const details=summary.parentElement;
    if(!details || !details.classList.contains('ab-status-section'))return;

    e.preventDefault();
    e.stopPropagation();
    if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();

    details.open=!details.open;
    details.dispatchEvent(new CustomEvent('ab-commandes-status-section-toggle',{
      bubbles:true,
      detail:{open:details.open,status:details.dataset.status||details.dataset.abStatus||''}
    }));
  }

  document.addEventListener('click',toggleFromEvent,true);
  document.addEventListener('keydown',function(e){
    if(e.key!=='Enter' && e.key!==' ')return;
    const summary=e.target && e.target.closest ? e.target.closest('details.ab-status-section > summary') : null;
    if(!summary || !isStatusSummary(summary))return;
    toggleFromEvent(e);
  },true);

  window.__AB_COMMANDES_STATUS_GROUPS_TOGGLE_FIX_VERSION=VERSION;
})();
