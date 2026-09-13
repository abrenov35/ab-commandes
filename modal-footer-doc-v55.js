(function(){
  'use strict';

  const VERSION='55.0';
  const STYLE_ID='ab-commandes-modal-footer-doc-v55-style';
  let draftId='';
  let committingDraft=false;

  function byId(id){return document.getElementById(id)}
  function listOrders(){return (typeof orders!=='undefined'&&Array.isArray(orders))?orders:null}
  function listDocs(){return (typeof documents!=='undefined'&&Array.isArray(documents))?documents:null}
  function getOrder(id){const a=listOrders();return a?a.find(o=>String(o.id||'')===String(id||''))||null:null}
  function newId(){try{return typeof uid==='function'?uid():crypto.randomUUID()}catch(_){return Date.now()+'-'+Math.random().toString(36).slice(2)}}

  function injectStyle(){
    if(byId(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      /* V55 : un seul bouton document, aligné au pied et vert */
      #modal #abDocLaunchV47{display:none!important}
      #modal .dialog-actions{
        display:flex!important;
        flex-wrap:nowrap!important;
        align-items:center!important;
        justify-content:flex-end!important;
        gap:9px!important;
      }
      #modal #abEditDocBtn{
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        margin-right:auto!important;
        min-height:36px!important;
        height:36px!important;
        padding:0 13px!important;
        border:1px solid #18794e!important;
        border-radius:8px!important;
        background:#198754!important;
        color:#fff!important;
        box-shadow:none!important;
        font-size:11px!important;
        font-weight:850!important;
        white-space:nowrap!important;
        cursor:pointer!important;
      }
      #modal #abEditDocBtn:hover{background:#157347!important;border-color:#146c43!important}
      #modal #cancelBtn,#modal #saveBtn{flex:0 0 auto!important}
      @media(max-width:520px){
        #modal .dialog-actions{gap:6px!important}
        #modal #abEditDocBtn{padding:0 9px!important;font-size:10px!important}
        #modal #cancelBtn,#modal #saveBtn{padding-left:10px!important;padding-right:10px!important}
      }
    `;
    document.head.appendChild(s);
  }

  function ensureFooterButton(){
    injectStyle();
    const actions=document.querySelector('#modal .dialog-actions');
    if(!actions)return null;
    let btn=byId('abEditDocBtn');
    if(!btn){
      btn=document.createElement('button');
      btn.id='abEditDocBtn';
      btn.type='button';
      btn.className='btn';
      btn.textContent='📎 Ajouter un document';
      const cancel=byId('cancelBtn');
      if(cancel&&cancel.parentElement===actions)actions.insertBefore(btn,cancel);else actions.prepend(btn);
    }
    btn.textContent='📎 Ajouter un document';
    btn.title='Ajouter un document';
    return btn;
  }

  function formSnapshot(id){
    const chantierEl=byId('fChantier');
    const chantierId=String(chantierEl?.value||'');
    let chantier='';
    try{
      const ys=(typeof yayaChantiers!=='undefined'&&Array.isArray(yayaChantiers))?yayaChantiers:[];
      const yc=ys.find(c=>String(c.id||'')===chantierId);
      chantier=String(yc?.nom||'').trim();
    }catch(_){}
    if(!chantier){
      const txt=String(chantierEl?.selectedOptions?.[0]?.textContent||'').trim();
      chantier=txt.replace(/^\s*[•·-]\s*/,'');
    }
    return {
      id:String(id||''),
      chantierId,
      chantier,
      produit:String(byId('fProduit')?.value||'').trim(),
      qte:String(byId('fQte')?.value||'').trim(),
      fournisseur:String(byId('fFournisseur')?.value||'').trim(),
      responsable:String(byId('fResp')?.value||''),
      status:String(byId('fStatus')?.value||'todo'),
      notes:String(byId('fNotes')?.value||'').trim()
    };
  }

  function ensureDraftOrder(){
    const a=listOrders();
    if(!a)return '';
    let id=String(typeof editId!=='undefined'&&editId?editId:draftId||'');
    let order=id?getOrder(id):null;
    if(order){
      if(draftId&&id===draftId)Object.assign(order,formSnapshot(id));
      return id;
    }
    id=draftId||newId();
    const draft=formSnapshot(id);
    try{Object.defineProperty(draft,'__abDraftV55',{value:true,writable:true,configurable:true,enumerable:false})}catch(_){draft.__abDraftV55=true}
    a.push(draft);
    draftId=id;
    try{editId=id}catch(_){}
    return id;
  }

  function isActiveDraft(){
    if(!draftId)return false;
    const o=getOrder(draftId);
    return !!(o&&o.__abDraftV55);
  }

  function cleanupDraft(){
    if(!draftId)return;
    const id=String(draftId);
    const ds=listDocs();
    const orphanDocs=ds?ds.filter(d=>String(d.commande_id||'')===id):[];
    try{
      if(typeof orders!=='undefined'&&Array.isArray(orders))orders=orders.filter(o=>String(o.id||'')!==id);
      if(typeof documents!=='undefined'&&Array.isArray(documents))documents=documents.filter(d=>String(d.commande_id||'')!==id);
    }catch(_){}
    if(typeof post==='function'){
      orphanDocs.forEach(d=>Promise.resolve(post({action:'document_delete',id:String(d.id||'')})).catch(err=>console.error('AB COMMANDES V55 nettoyage document brouillon',err)));
    }
    draftId='';
    committingDraft=false;
    try{if(typeof renderAll==='function')renderAll()}catch(_){}
  }

  function openUploadFromFooter(){
    const id=ensureDraftOrder();
    if(!id)return;
    const launcher=byId('abOpenUploadModalV47');
    if(!launcher){
      console.error('AB COMMANDES V55 : modale upload V47 indisponible');
      return;
    }
    launcher.click();
  }

  document.addEventListener('click',function(e){
    const btn=e.target&&e.target.closest?e.target.closest('#abEditDocBtn'):null;
    if(!btn)return;
    e.preventDefault();
    e.stopPropagation();
    if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
    openUploadFromFooter();
  },true);

  document.addEventListener('click',function(e){
    const save=e.target&&e.target.closest?e.target.closest('#saveBtn'):null;
    if(!save||!isActiveDraft())return;
    committingDraft=true;
    setTimeout(()=>{
      const modal=byId('modal');
      if(modal&&modal.classList.contains('show'))committingDraft=false;
    },0);
  },true);

  try{
    if(typeof closeModal==='function'&&!closeModal.__abFooterDocV55){
      const previous=closeModal;
      const wrapped=function(){
        const mustClean=isActiveDraft()&&!committingDraft;
        const out=previous.apply(this,arguments);
        if(mustClean)cleanupDraft();
        return out;
      };
      wrapped.__abFooterDocV55=true;
      closeModal=wrapped;
    }
  }catch(err){console.error('AB COMMANDES V55 closeModal',err)}

  try{
    if(typeof saveOrder==='function'&&!saveOrder.__abFooterDocV55){
      const previous=saveOrder;
      const wrapped=async function(obj){
        const id=String(obj?.id||'');
        const wasDraft=!!draftId&&id===String(draftId);
        try{return await previous.apply(this,arguments)}
        finally{
          if(wasDraft){draftId='';committingDraft=false;}
        }
      };
      wrapped.__abFooterDocV55=true;
      saveOrder=wrapped;
    }
  }catch(err){console.error('AB COMMANDES V55 saveOrder',err)}

  function refresh(){
    ensureFooterButton();
    const top=byId('abDocLaunchV47');if(top)top.style.setProperty('display','none','important');
  }

  document.addEventListener('ab-commandes-modal-open',()=>{refresh();requestAnimationFrame(refresh);setTimeout(refresh,80)});
  try{
    if(typeof openModal==='function'&&!openModal.__abFooterDocV55){
      const previous=openModal;
      const wrapped=async function(){
        const out=await previous.apply(this,arguments);
        refresh();requestAnimationFrame(refresh);setTimeout(refresh,80);
        return out;
      };
      wrapped.__abFooterDocV55=true;
      openModal=wrapped;
    }
  }catch(err){console.error('AB COMMANDES V55 openModal',err)}

  injectStyle();refresh();
  window.__AB_COMMANDES_MODAL_FOOTER_DOC_VERSION=VERSION;
})();
