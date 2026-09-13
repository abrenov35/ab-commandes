// V95 — ouvre les documents AB COMMANDES dans le lecteur principal Yaya avec suppression et modale propre
(function(){
  'use strict';

  if(window.__AB_COMMANDES_YAYA_PARENT_PREVIEW_V95)return;
  window.__AB_COMMANDES_YAYA_PARENT_PREVIEW_V95=true;

  let currentDocs=[];
  let currentIndex=0;
  let currentOrderId='';
  const STYLE_ID='ab-commandes-yaya-parent-tabs-v95';

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

  function mappedDocs(orderId){
    const oid=String(orderId||'');
    return realDocs(oid).map(doc=>({
      id:String(doc&&doc.id||''),
      orderId:oid,
      url:docUrl(doc),
      name:docName(doc)
    })).filter(item=>/^https:\/\//i.test(item.url));
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
      #modalRoot .yaya-command-preview-wrap{
        display:flex!important;
        align-items:center!important;
        gap:4px!important;
        flex:0 0 auto!important;
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
      #modalRoot .yaya-command-preview-delete{
        flex:0 0 30px!important;
        width:30px!important;
        height:30px!important;
        min-width:30px!important;
        padding:0!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        border:1px solid #efb6bd!important;
        border-radius:7px!important;
        background:#fff5f6!important;
        color:#ba2638!important;
        font-size:14px!important;
        font-weight:900!important;
        cursor:pointer!important;
      }
      #modalRoot .yaya-command-preview-delete:hover{background:#ffe9ec!important;border-color:#df7d89!important;}
      #modalRoot .yaya-command-preview-delete:disabled{opacity:.45!important;cursor:not-allowed!important;}
      .yaya-command-confirm-overlay{
        position:fixed!important;
        inset:0!important;
        z-index:2147483646!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        padding:20px!important;
        background:rgba(15,23,42,.48)!important;
        backdrop-filter:blur(2px)!important;
      }
      .yaya-command-confirm-box{
        width:min(92vw,430px)!important;
        background:#fff!important;
        border:1px solid #dfe6ef!important;
        border-radius:16px!important;
        box-shadow:0 24px 70px rgba(15,23,42,.28)!important;
        padding:22px!important;
        color:#14213d!important;
        font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif!important;
      }
      .yaya-command-confirm-title{font-size:18px!important;font-weight:800!important;margin:0 0 8px!important;}
      .yaya-command-confirm-text{font-size:14px!important;line-height:1.45!important;color:#55657b!important;margin:0!important;overflow-wrap:anywhere!important;}
      .yaya-command-confirm-actions{display:flex!important;justify-content:flex-end!important;gap:10px!important;margin-top:20px!important;}
      .yaya-command-confirm-btn{
        min-width:96px!important;
        height:38px!important;
        border-radius:9px!important;
        padding:0 14px!important;
        font-size:13px!important;
        font-weight:800!important;
        cursor:pointer!important;
      }
      .yaya-command-confirm-cancel{background:#fff!important;color:#314966!important;border:1px solid #cbd6e4!important;}
      .yaya-command-confirm-delete{background:#c92d42!important;color:#fff!important;border:1px solid #c92d42!important;}
      .yaya-command-confirm-delete:hover{background:#b62337!important;border-color:#b62337!important;}
    `;
    doc.head.appendChild(style);
  }

  function closeParentPreview(parent){
    try{
      if(typeof parent.closeModal==='function'){
        parent.closeModal();
        return;
      }
    }catch(_){ }
    try{
      const root=parent.document.getElementById('modalRoot');
      if(root)root.replaceChildren();
    }catch(_){ }
  }

  function confirmDelete(parent,fileName){
    return new Promise(resolve=>{
      const doc=parent.document;
      const overlay=doc.createElement('div');
      overlay.className='yaya-command-confirm-overlay';

      const box=doc.createElement('div');
      box.className='yaya-command-confirm-box';

      const title=doc.createElement('div');
      title.className='yaya-command-confirm-title';
      title.textContent='Supprimer le document';

      const text=doc.createElement('p');
      text.className='yaya-command-confirm-text';
      text.textContent='Voulez-vous vraiment supprimer « '+fileName+' » ?';

      const actions=doc.createElement('div');
      actions.className='yaya-command-confirm-actions';

      const cancel=doc.createElement('button');
      cancel.type='button';
      cancel.className='yaya-command-confirm-btn yaya-command-confirm-cancel';
      cancel.textContent='Annuler';

      const remove=doc.createElement('button');
      remove.type='button';
      remove.className='yaya-command-confirm-btn yaya-command-confirm-delete';
      remove.textContent='Supprimer';

      let done=false;
      function finish(value){
        if(done)return;
        done=true;
        doc.removeEventListener('keydown',onKey,true);
        overlay.remove();
        resolve(value);
      }
      function onKey(e){
        if(e.key==='Escape'){e.preventDefault();finish(false);}
        if(e.key==='Enter'){e.preventDefault();finish(true);}
      }

      cancel.onclick=()=>finish(false);
      remove.onclick=()=>finish(true);
      overlay.onclick=e=>{if(e.target===overlay)finish(false);};
      doc.addEventListener('keydown',onKey,true);

      actions.append(cancel,remove);
      box.append(title,text,actions);
      overlay.appendChild(box);
      doc.body.appendChild(overlay);
      setTimeout(()=>remove.focus(),0);
    });
  }

  async function removeAt(parent,index,button){
    const item=currentDocs[index];
    if(!item)return;

    if(!item.id){
      try{parent.alert('Suppression indisponible pour ce document.');}catch(_){window.alert('Suppression indisponible pour ce document.');}
      return;
    }

    const ok=await confirmDelete(parent,item.name);
    if(!ok)return;

    if(typeof window.deleteDocument!=='function'){
      try{parent.alert('Suppression indisponible.');}catch(_){window.alert('Suppression indisponible.');}
      return;
    }

    if(button)button.disabled=true;

    try{
      await window.deleteDocument(item.id);
      currentDocs=mappedDocs(item.orderId||currentOrderId);

      if(!currentDocs.length){
        closeParentPreview(parent);
        return;
      }

      currentIndex=Math.max(0,Math.min(index,currentDocs.length-1));
      openAt(parent,currentIndex);
    }catch(err){
      if(button)button.disabled=false;
      const message='Suppression impossible : '+String(err&&err.message?err.message:err||'Erreur inconnue');
      try{parent.alert(message);}catch(_){window.alert(message);}
      scheduleTabs(parent);
    }
  }

  function attachTabs(parent){
    if(!currentDocs.length)return;
    const doc=parent.document;
    const modal=doc.querySelector('#modalRoot .piece-preview-modal');
    if(!modal)return;

    modal.querySelectorAll('.yaya-command-preview-tabs').forEach(x=>x.remove());
    const tabs=doc.createElement('div');
    tabs.className='yaya-command-preview-tabs';

    currentDocs.forEach((item,index)=>{
      const wrap=doc.createElement('div');
      wrap.className='yaya-command-preview-wrap';

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

      const del=doc.createElement('button');
      del.type='button';
      del.className='yaya-command-preview-delete';
      del.textContent='🗑';
      del.title=item.id?'Supprimer '+item.name:'Suppression indisponible';
      del.setAttribute('aria-label',del.title);
      del.disabled=!item.id;
      del.onclick=function(e){
        e.preventDefault();
        e.stopPropagation();
        removeAt(parent,index,del);
      };

      wrap.append(button,del);
      tabs.appendChild(wrap);
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

    const list=mappedDocs(orderId);
    if(!list.length)return false;

    currentOrderId=String(orderId||'');
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
    if(previous.__abYayaParentPreviewV95)return;

    const wrapped=function(orderId){
      if(delegate(orderId))return;
      return previous.apply(this,arguments);
    };
    wrapped.__abYayaParentPreviewV95=true;
    wrapped.__abPreviousOpenDocs=previous;
    window.openDocs=wrapped;
  }

  install();
  setTimeout(install,150);
  setTimeout(install,500);
})();
