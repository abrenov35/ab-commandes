(function(){
  'use strict';

  const VERSION='86.0';
  const CONFIRM_ID='abDocumentDeleteConfirmV86';
  const STYLE_ID='abDocumentDeleteConfirmV86Style';
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
      #${CONFIRM_ID}{position:fixed;inset:0;z-index:520;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(11,24,42,.55);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
      #${CONFIRM_ID}.show{display:flex!important}
      #${CONFIRM_ID} .ab-v86-card{width:min(430px,calc(100vw - 32px));background:#fff;border:1px solid #d8e0ea;border-radius:16px;box-shadow:0 24px 70px rgba(7,24,45,.28);overflow:hidden}
      #${CONFIRM_ID} .ab-v86-head{display:flex;align-items:center;gap:10px;padding:18px 20px 10px}
      #${CONFIRM_ID} .ab-v86-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:#fff0f2;color:#c1283d;font-size:18px;flex:0 0 auto}
      #${CONFIRM_ID} .ab-v86-title{font-size:18px;font-weight:900;color:#122d4f}
      #${CONFIRM_ID} .ab-v86-body{padding:6px 20px 18px;color:#506176;font-size:14px;line-height:1.45}
      #${CONFIRM_ID} .ab-v86-file{margin-top:10px;padding:10px 12px;border:1px solid #e1e6ee;border-radius:9px;background:#f7f9fc;color:#213a5a;font-weight:800;word-break:break-word}
      #${CONFIRM_ID} .ab-v86-actions{display:flex;justify-content:flex-end;gap:10px;padding:14px 20px 18px;border-top:1px solid #edf0f4}
      #${CONFIRM_ID} .ab-v86-btn{height:38px;padding:0 16px;border-radius:9px;font-weight:800;cursor:pointer}
      #${CONFIRM_ID} .ab-v86-cancel{border:1px solid #cbd5e1;background:#fff;color:#263c59}
      #${CONFIRM_ID} .ab-v86-delete{border:1px solid #c92d42;background:#d93a4f;color:#fff;min-width:110px}
      #${CONFIRM_ID} .ab-v86-delete:hover{background:#c92d42}
      #${CONFIRM_ID} .ab-v86-btn:disabled{opacity:.55;cursor:wait}
    `;
    document.head.appendChild(s);
  }

  function ensureConfirm(){
    injectStyle();
    let modal=document.getElementById(CONFIRM_ID);
    if(modal)return modal;

    modal=document.createElement('div');
    modal.id=CONFIRM_ID;
    modal.innerHTML=`
      <div class="ab-v86-card" role="dialog" aria-modal="true" aria-labelledby="abV86Title">
        <div class="ab-v86-head">
          <div class="ab-v86-icon">🗑</div>
          <div id="abV86Title" class="ab-v86-title">Supprimer le document ?</div>
        </div>
        <div class="ab-v86-body">
          Cette action supprimera le document de la commande et placera le fichier Drive dans la corbeille.
          <div class="ab-v86-file"></div>
        </div>
        <div class="ab-v86-actions">
          <button type="button" class="ab-v86-btn ab-v86-cancel">Annuler</button>
          <button type="button" class="ab-v86-btn ab-v86-delete">Supprimer</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    return modal;
  }

  function askDelete(doc,orderId){
    return new Promise(resolve=>{
      const modal=ensureConfirm();
      const file=modal.querySelector('.ab-v86-file');
      const cancel=modal.querySelector('.ab-v86-cancel');
      const del=modal.querySelector('.ab-v86-delete');
      if(file)file.textContent=nameOf(doc);
      del.disabled=false;
      cancel.disabled=false;

      const cleanup=result=>{
        modal.classList.remove('show');
        document.removeEventListener('keydown',onKey);
        resolve(result);
      };
      const onKey=e=>{if(e.key==='Escape')cleanup(false);};
      cancel.onclick=()=>cleanup(false);
      del.onclick=async()=>{
        if(typeof window.deleteDocument!=='function'){
          cleanup(false);
          window.alert('Suppression indisponible.');
          return;
        }
        del.disabled=true;
        cancel.disabled=true;
        del.textContent='Suppression…';
        try{
          await window.deleteDocument(String(doc.id||''));
          del.textContent='Supprimer';
          cleanup(true);
          window.openDocs(orderId);
        }catch(err){
          del.textContent='Supprimer';
          del.disabled=false;
          cancel.disabled=false;
          window.alert('Suppression impossible : '+String(err&&err.message?err.message:err||'Erreur inconnue'));
        }
      };
      modal.onclick=e=>{if(e.target===modal)cleanup(false);};
      document.addEventListener('keydown',onKey);
      modal.classList.add('show');
      setTimeout(()=>cancel.focus(),0);
    });
  }

  function decorate(orderId){
    const list=docsFor(orderId);
    if(!list.length)return;
    const modal=document.getElementById('abDocumentPreviewV64');
    if(!modal)return;
    const wraps=[...modal.querySelectorAll('.ab-doc-v85-wrap')];
    if(!wraps.length)return;

    wraps.forEach((wrap,i)=>{
      const del=wrap.querySelector('.ab-doc-v85-delete');
      const doc=list[i];
      if(!del||!doc)return;
      del.onclick=e=>{
        e.stopPropagation();
        e.preventDefault();
        askDelete(doc,String(orderId||''));
      };
    });
  }

  window.openDocs=function(orderId){
    baseOpenDocs(orderId);
    requestAnimationFrame(()=>requestAnimationFrame(()=>decorate(String(orderId||''))));
  };

  injectStyle();
  window.__AB_COMMANDES_DOCUMENT_DELETE_MODAL_VERSION=VERSION;
})();
