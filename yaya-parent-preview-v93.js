// V93 — ouvre directement les documents AB COMMANDES dans le lecteur principal Yaya
(function(){
  'use strict';

  if(window.__AB_COMMANDES_YAYA_PARENT_PREVIEW_V93)return;
  window.__AB_COMMANDES_YAYA_PARENT_PREVIEW_V93=true;

  let currentDocs=[];
  let currentIndex=0;
  const STYLE_ID='ab-commandes-yaya-parent-tabs-v93';

  function ordersList(){
    try{return Array.isArray(orders)?orders:[]}catch(_){return []}
  }

  function docsList(){
    try{return Array.isArray(documents)?documents:[]}catch(_){return []}
  }

  function realDocs(orderId){
    const id=String(orderId||'');
    return docsList().filter(d=>
      String(d&&d.commande_id||'')===id &&
      String(d&&d.type||'').trim().toLowerCase()!=='lien web'
    );
  }

  function docUrl(doc){
    return String(doc&&doc.url_pdf||doc&&doc.url||'').trim();
  }

  function docName(doc){
    return String(doc&&doc.nom_fichier||doc&&doc.file_name||doc&&doc.type||'Document').trim()||'Document';
  }

  function parentYaya(){
    try{
      if(window.parent===window)return null;
      if(window.parent.location.origin!==window.location.origin)return null;
      if(typeof window.parent.voirPiece!=='function')return null;
      return window.parent;
    }catch(_){return null}
  }

  function installParentStyle(parent){
    const doc=parent.document;
    if(doc.getElementById(STYLE_ID))return;
    const style=doc.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #modalRoot .yaya-command-preview-tabs{
        flex:0 0 auto!important;
        display:flex!important;
        align-items:center!important;
        gap:6px!important;
        width:100%!important;
        min-width:0!important;
        padding:6px 4px 7px!important;
        margin:0!important;
        overflow-x:auto!important;
        overflow-y:hidden!important;
        background:#fff!important;
        border-bottom:1px solid #dde5ef!important;
        scrollbar-width:thin;
      }
      #modalRoot .yaya-command-preview-tab{
        flex:0 0 auto!important;
        max-width:260px!important;
        height:30px!important;
        padding:0 10px!important;
        border:1px solid #c9d4e2!important;
        border-radius:7px!important;
        background:#fff!important;
        color:#314966!important;
        font:800 11px/1 system-ui,-apple-system,Segoe UI,sans-serif!important;
        white-space:nowrap!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        cursor:pointer!important;
      }
      #modalRoot .yaya-command-preview-tab.active{
        background:#e9f2ff!important;
        border-color:#6d98c8!important;
        color:#174d82!important;
      }
    `;
    doc.head.appendChild(style);
  }

  function attachTabs(parent){
    if(currentDocs.length<2)return;
    const doc=parent.document;
    const modal=doc.querySelector('#modalRoot .piece-preview-modal');
    if(!modal)return;

    modal.querySelectorAll('.yaya-command-preview-tabs').forEach(x=>x.remove());
    const tabs=doc.createElement('div');
    tabs.className='yaya-command-preview-tabs';

    currentDocs.forEach((item,index)=>{
      const button=doc.createElement('button');
      button.type='button';
      button.className='yaya-command-preview-tab'+(index===currentIndex?' active':'');
      button.textContent='📄 '+item.name;
      button.title=item.name;
      button.onclick=function(e){
        e.preventDefault();
        e.stopPropagation();
        openAt(parent,index);
      };
      tabs.appendChild(button);
    });

    const head=modal.querySelector('.piece-preview-head');
    const stage=modal.querySelector('.piece-preview-stage');
    if(head)head.insertAdjacentElement('afterend',tabs);
    else if(stage&&stage.parentNode)stage.parentNode.insertBefore(tabs,stage);
    else modal.insertBefore(tabs,modal.firstChild);
  }

  function scheduleTabs(parent){
    [0,40,120,260,550].forEach(ms=>setTimeout(()=>attachTabs(parent),ms));
  }

  function openAt(parent,index){
    const item=currentDocs[index];
    if(!item)return;
    currentIndex=index;
    try{
      const out=parent.voirPiece(item.url);
      if(out&&typeof out.catch==='function'){
        out.catch(()=>parent.open(item.url,'_blank','noopener'));
      }
      scheduleTabs(parent);
    }catch(_){
      parent.open(item.url,'_blank','noopener');
    }
  }

  function delegate(orderId){
    const parent=parentYaya();
    if(!parent)return false;

    const list=realDocs(orderId).map(doc=>({
      url:docUrl(doc),
      name:docName(doc)
    })).filter(item=>/^https:\/\//i.test(item.url));

    if(!list.length)return false;

    currentDocs=list;
    currentIndex=0;
    installParentStyle(parent);
    openAt(parent,0);
    return true;
  }

  function install(){
    const previous=window.openDocs;
    if(typeof previous!=='function'){
      setTimeout(install,120);
      return;
    }
    if(previous.__abYayaParentPreviewV93)return;

    const wrapped=function(orderId){
      if(delegate(orderId))return;
      return previous.apply(this,arguments);
    };
    wrapped.__abYayaParentPreviewV93=true;
    wrapped.__abPreviousOpenDocs=previous;
    window.openDocs=wrapped;
  }

  install();
  setTimeout(install,150);
  setTimeout(install,500);
})();
