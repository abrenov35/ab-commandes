// V92 — délègue l'ouverture des documents au lecteur principal Yaya quand AB COMMANDES est intégré
(function(){
  'use strict';

  if(window.__AB_COMMANDES_YAYA_PARENT_PREVIEW_V92)return;
  window.__AB_COMMANDES_YAYA_PARENT_PREVIEW_V92=true;

  const MESSAGE_TYPE='AB_COMMANDES_OPEN_DOCUMENTS_V1';

  function ordersList(){
    try{return Array.isArray(orders)?orders:[]}catch(_){return []}
  }

  function docsList(){
    try{return Array.isArray(documents)?documents:[]}catch(_){return []}
  }

  function orderById(id){
    return ordersList().find(o=>String(o&&o.id||'')===String(id||''))||null;
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

  function embeddedInYaya(){
    if(window.parent===window)return false;
    try{return window.parent.location.origin===window.location.origin}catch(_){return false}
  }

  function delegate(orderId){
    if(!embeddedInYaya())return false;

    const list=realDocs(orderId).map(doc=>({
      url:docUrl(doc),
      name:docName(doc)
    })).filter(doc=>/^https:\/\//i.test(doc.url));

    if(!list.length)return false;

    const order=orderById(orderId);
    try{
      window.parent.postMessage({
        type:MESSAGE_TYPE,
        source:'ab-commandes',
        orderId:String(orderId||''),
        title:String(order&&order.produit||'Documents'),
        docs:list
      },window.location.origin);
      return true;
    }catch(_){return false}
  }

  function install(){
    const previous=window.openDocs;
    if(typeof previous!=='function'){
      setTimeout(install,120);
      return;
    }
    if(previous.__abYayaParentPreviewV92)return;

    const wrapped=function(orderId){
      if(delegate(orderId))return;
      return previous.apply(this,arguments);
    };
    wrapped.__abYayaParentPreviewV92=true;
    wrapped.__abPreviousOpenDocs=previous;
    window.openDocs=wrapped;
  }

  install();
  setTimeout(install,150);
  setTimeout(install,500);
})();
