(function(){
  'use strict';

  const params=new URL(window.location.href).searchParams;
  if(params.get('embed')!=='1')return;

  const STYLE_ID='ab-commandes-doc-modal-simple-style';

  function injectStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      body.ab-embed-mode #docModal .notice{display:none!important}
      body.ab-embed-mode #docModal.ab-doc-empty .dialog{width:min(470px,calc(100% - 8px))!important;max-width:470px!important}
      body.ab-embed-mode #docModal.ab-doc-empty .form-grid{grid-template-columns:1fr!important;gap:8px!important}
      body.ab-embed-mode #docModal.ab-doc-empty #dType,
      body.ab-embed-mode #docModal.ab-doc-empty #dName,
      body.ab-embed-mode #docModal.ab-doc-empty #dSource,
      body.ab-embed-mode #docModal.ab-doc-empty #dDate{display:none!important}
      body.ab-embed-mode #docModal.ab-doc-empty #dType+*,
      body.ab-embed-mode #docModal.ab-doc-empty #dName+*,
      body.ab-embed-mode #docModal.ab-doc-empty #dSource+*,
      body.ab-embed-mode #docModal.ab-doc-empty #dDate+*{display:none!important}
      body.ab-embed-mode #docModal.ab-doc-empty #dType{visibility:hidden!important}
      body.ab-embed-mode #docModal.ab-doc-empty #dName{visibility:hidden!important}
      body.ab-embed-mode #docModal.ab-doc-empty #dSource{visibility:hidden!important}
      body.ab-embed-mode #docModal.ab-doc-empty #dDate{visibility:hidden!important}
      body.ab-embed-mode #docModal.ab-doc-empty #docList{display:none!important}
      body.ab-embed-mode #docModal.ab-doc-empty .dialog-actions{margin-top:10px!important}
      body.ab-embed-mode #docModal.ab-doc-empty #dUrl{min-height:40px!important}
    `;
    document.head.appendChild(style);
  }

  function fieldWrap(id){
    const el=document.getElementById(id);
    return el?el.parentElement:null;
  }

  function refreshDocModal(){
    const modal=document.getElementById('docModal');
    if(!modal)return;
    const id=typeof currentDocOrderId!=='undefined'?String(currentDocOrderId||''):'';
    const list=(typeof documents!=='undefined'&&Array.isArray(documents))?documents:[];
    const count=id?list.filter(d=>String(d.commande_id||'')===id).length:0;
    const empty=count===0;

    modal.classList.toggle('ab-doc-empty',empty);

    ['dType','dName','dSource','dDate'].forEach(fieldId=>{
      const wrap=fieldWrap(fieldId);
      if(wrap)wrap.style.display=empty?'none':'';
    });

    const docList=document.getElementById('docList');
    if(docList){
      docList.style.display=empty?'none':'';
      if(empty)docList.innerHTML='';
    }

    const title=document.getElementById('docTitle');
    const order=(typeof orders!=='undefined'&&Array.isArray(orders))?orders.find(o=>String(o.id||'')===id):null;
    if(title&&order){
      title.textContent=empty?'Ajouter un PDF · '+String(order.produit||''):'Documents · '+String(order.produit||'');
    }

    const add=document.getElementById('addDocBtn');
    if(add)add.textContent='Ajouter le PDF';

    const url=document.getElementById('dUrl');
    if(url){
      const label=url.parentElement?.querySelector('.label');
      if(label)label.textContent='Lien du PDF';
      url.placeholder='https://…';
    }
  }

  injectStyle();

  try{
    if(typeof openDocs==='function'&&!openDocs.__abSimpleDocWrapped){
      const previous=openDocs;
      const wrapped=function(){
        const out=previous.apply(this,arguments);
        refreshDocModal();
        return out;
      };
      wrapped.__abSimpleDocWrapped=true;
      openDocs=wrapped;
    }
  }catch(e){console.error('AB COMMANDES · modale document',e)}

  try{
    if(typeof renderDocList==='function'&&!renderDocList.__abSimpleDocWrapped){
      const previous=renderDocList;
      const wrapped=function(){
        const out=previous.apply(this,arguments);
        refreshDocModal();
        return out;
      };
      wrapped.__abSimpleDocWrapped=true;
      renderDocList=wrapped;
    }
  }catch(e){console.error('AB COMMANDES · liste document',e)}

  window.addEventListener('load',refreshDocModal,{once:true});
  window.__AB_COMMANDES_DOC_MODAL_SIMPLE_VERSION='1.0';
})();
