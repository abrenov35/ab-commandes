(function(){
  'use strict';

  const VERSION='85.0';
  const MODAL_ID='abDocumentPreviewV64';
  const STYLE_ID='abDocumentDeleteV85Style';
  const baseOpenDocs=window.openDocs;

  if(typeof baseOpenDocs!=='function')return;

  function docsFor(orderId){
    const id=String(orderId||'');
    if(typeof documents==='undefined'||!Array.isArray(documents))return [];
    return documents.filter(d=>String(d.commande_id||'')===id&&String(d.type||'').trim().toLowerCase()!=='lien web');
  }

  function nameOf(doc){
    return String(doc?.nom_fichier||doc?.file_name||doc?.type||'Document').trim()||'Document';
  }

  function injectStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      #${MODAL_ID} .ab-doc-preview-tabs{align-items:center!important}
      #${MODAL_ID} .ab-doc-v85-wrap{display:flex;align-items:center;gap:4px;flex:0 0 auto}
      #${MODAL_ID} .ab-doc-v85-delete{width:30px;height:30px;display:flex;align-items:center;justify-content:center;border:1px solid #efb6bd;border-radius:7px;background:#fff5f6;color:#ba2638;font-size:14px;font-weight:900;cursor:pointer}
      #${MODAL_ID} .ab-doc-v85-delete:hover{background:#ffe9ec;border-color:#df7d89}
      #${MODAL_ID} .ab-doc-v85-delete:disabled{opacity:.45;cursor:wait}
    `;
    document.head.appendChild(s);
  }

  async function removeDoc(doc,orderId,button){
    const label=nameOf(doc);
    if(!window.confirm('Supprimer définitivement le document « '+label+' » ?'))return;
    if(typeof window.deleteDocument!=='function'){
      window.alert('Suppression indisponible.');
      return;
    }
    if(button)button.disabled=true;
    try{
      await window.deleteDocument(String(doc.id||''));
      window.openDocs(orderId);
    }catch(err){
      window.alert('Suppression impossible : '+String(err&&err.message?err.message:err||'Erreur inconnue'));
      if(button)button.disabled=false;
    }
  }

  function decorate(orderId){
    injectStyle();
    const modal=document.getElementById(MODAL_ID);
    if(!modal)return;
    const tabs=modal.querySelector('.ab-doc-preview-tabs');
    if(!tabs)return;

    const list=docsFor(orderId);
    if(!list.length)return;

    tabs.classList.add('show');
    const currentButtons=[...tabs.querySelectorAll(':scope > .ab-doc-preview-tab')];

    if(currentButtons.length===list.length){
      currentButtons.forEach((tab,i)=>{
        const wrap=document.createElement('div');
        wrap.className='ab-doc-v85-wrap';
        tabs.insertBefore(wrap,tab);
        wrap.appendChild(tab);

        const del=document.createElement('button');
        del.type='button';
        del.className='ab-doc-v85-delete';
        del.textContent='🗑';
        del.title='Supprimer '+nameOf(list[i]);
        del.setAttribute('aria-label','Supprimer '+nameOf(list[i]));
        del.onclick=e=>{e.stopPropagation();removeDoc(list[i],orderId,del);};
        wrap.appendChild(del);
      });
      return;
    }

    if(list.length===1&&currentButtons.length===0){
      const wrap=document.createElement('div');
      wrap.className='ab-doc-v85-wrap';

      const label=document.createElement('button');
      label.type='button';
      label.className='ab-doc-preview-tab active';
      label.textContent='📄 '+nameOf(list[0]);
      label.title=nameOf(list[0]);
      wrap.appendChild(label);

      const del=document.createElement('button');
      del.type='button';
      del.className='ab-doc-v85-delete';
      del.textContent='🗑';
      del.title='Supprimer '+nameOf(list[0]);
      del.setAttribute('aria-label','Supprimer '+nameOf(list[0]));
      del.onclick=e=>{e.stopPropagation();removeDoc(list[0],orderId,del);};
      wrap.appendChild(del);
      tabs.appendChild(wrap);
    }
  }

  window.openDocs=function(orderId){
    baseOpenDocs(orderId);
    requestAnimationFrame(()=>decorate(String(orderId||'')));
  };

  injectStyle();
  window.__AB_COMMANDES_DOCUMENT_DELETE_VERSION=VERSION;
})();
