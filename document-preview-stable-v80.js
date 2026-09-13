(function(){
  'use strict';

  const VERSION='80.1';
  const MODAL_ID='abDocumentPreviewV64';
  const STYLE_ID='abDocumentPreviewStableV80Style';

  function ordersList(){return (typeof orders!=='undefined'&&Array.isArray(orders))?orders:[];}
  function docsList(){return (typeof documents!=='undefined'&&Array.isArray(documents))?documents:[];}
  function orderById(id){return ordersList().find(o=>String(o.id||'')===String(id||''))||null;}
  function realDocs(orderId){
    const id=String(orderId||'');
    return docsList().filter(d=>String(d.commande_id||'')===id&&String(d.type||'').trim().toLowerCase()!=='lien web');
  }
  function originalUrl(doc){return String(doc?.url_pdf||doc?.url||'').trim();}
  function fileName(doc){return String(doc?.nom_fichier||doc?.file_name||doc?.type||'Document').trim()||'Document';}
  function drivePreviewUrl(url){
    const u=String(url||'').trim();
    let m=u.match(/^https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/(?:view|edit|preview)(?:\?.*)?$/i);
    if(m)return 'https://drive.google.com/file/d/'+encodeURIComponent(m[1])+'/preview';
    m=u.match(/^https:\/\/drive\.google\.com\/open\?id=([^&#]+)/i);
    if(m)return 'https://drive.google.com/file/d/'+encodeURIComponent(m[1])+'/preview';
    return u;
  }
  function isImage(doc,url){
    const mime=String(doc?.mime_type||'').toLowerCase();
    const name=fileName(doc).toLowerCase();
    return mime.startsWith('image/')||/\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name)||/\.(png|jpe?g|gif|webp|bmp|svg)(?:\?|#|$)/i.test(url);
  }

  function injectStyle(){
    let s=document.getElementById(STYLE_ID);
    if(!s){s=document.createElement('style');s.id=STYLE_ID;document.head.appendChild(s);}
    s.textContent=`
      #${MODAL_ID}{position:fixed;inset:0;z-index:320;display:none;align-items:center;justify-content:center;padding:8px;background:rgba(12,27,47,.62);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px)}
      #${MODAL_ID}.show{display:flex!important}
      #${MODAL_ID} .ab-doc-preview-card{width:calc(100vw - 16px)!important;height:calc(100vh - 16px)!important;max-width:none!important;max-height:none!important;display:flex!important;flex-direction:column!important;background:#fff;border:1px solid #b8c6d7;border-radius:10px;box-shadow:0 28px 80px rgba(8,25,45,.34);overflow:hidden}
      #${MODAL_ID} .ab-doc-preview-head{display:flex;align-items:center;gap:12px;padding:10px 12px;border-bottom:1px solid #d7e0ea;background:#f7f9fc}
      #${MODAL_ID} .ab-doc-preview-title{min-width:0;flex:1;color:#102d50;font-size:16px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #${MODAL_ID} .ab-doc-preview-close{width:32px;height:32px;border:1px solid #c4cfdd;border-radius:8px;background:#fff;color:#2c405d;font-size:19px;font-weight:800;cursor:pointer}
      #${MODAL_ID} .ab-doc-preview-tabs{display:none;gap:7px;overflow:auto;padding:7px 10px;border-bottom:1px solid #dde5ef;background:#fff}
      #${MODAL_ID} .ab-doc-preview-tabs.show{display:flex!important}
      #${MODAL_ID} .ab-doc-preview-tab{flex:0 0 auto;max-width:260px;height:30px;padding:0 10px;border:1px solid #c9d4e2;border-radius:7px;background:#fff;color:#314966;font-size:11px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}
      #${MODAL_ID} .ab-doc-preview-tab.active{background:#e9f2ff;border-color:#6d98c8;color:#174d82}
      #${MODAL_ID} .ab-doc-preview-body{position:relative;flex:1;min-height:0;display:block!important;overflow:hidden!important;padding:0!important;background:#2f3030!important}
      #${MODAL_ID} .ab-doc-preview-frame{display:block!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;margin:0!important;border:0!important;transform:none!important;background:#2f3030!important}
      #${MODAL_ID} .ab-doc-preview-img{display:block!important;max-width:100%!important;max-height:100%!important;width:auto!important;height:auto!important;margin:auto!important;object-fit:contain!important}
      #${MODAL_ID} .ab-doc-preview-empty{height:100%;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;color:#fff;font-size:15px;font-weight:700}
      #${MODAL_ID} .ab-doc-preview-foot{display:none!important}
    `;
  }

  function ensureModal(){
    injectStyle();
    let modal=document.getElementById(MODAL_ID);
    if(!modal){
      modal=document.createElement('div');
      modal.id=MODAL_ID;
      modal.innerHTML=`
        <div class="ab-doc-preview-card" role="dialog" aria-modal="true" aria-labelledby="abDocPreviewTitleV64">
          <div class="ab-doc-preview-head">
            <div id="abDocPreviewTitleV64" class="ab-doc-preview-title">Document</div>
            <button type="button" class="ab-doc-preview-close" aria-label="Fermer">×</button>
          </div>
          <div class="ab-doc-preview-tabs"></div>
          <div class="ab-doc-preview-body"></div>
        </div>`;
      document.body.appendChild(modal);
      const close=()=>modal.classList.remove('show');
      modal.querySelector('.ab-doc-preview-close').onclick=close;
      modal.addEventListener('click',e=>{if(e.target===modal)close();});
      document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('show'))close();});
    }
    const foot=modal.querySelector('.ab-doc-preview-foot');
    if(foot)foot.style.setProperty('display','none','important');
    return modal;
  }

  function renderDoc(modal,doc,order){
    const body=modal.querySelector('.ab-doc-preview-body');
    const title=modal.querySelector('.ab-doc-preview-title');
    if(!body)return;
    const url=originalUrl(doc);
    if(title)title.textContent=(order?.produit?order.produit+' · ':'')+fileName(doc);
    body.innerHTML='';
    if(!url){body.innerHTML='<div class="ab-doc-preview-empty">Aucun aperçu disponible.</div>';return;}
    if(isImage(doc,url)){
      const img=document.createElement('img');
      img.className='ab-doc-preview-img';
      img.src=url;
      img.alt=fileName(doc);
      body.appendChild(img);
      return;
    }
    const frame=document.createElement('iframe');
    frame.className='ab-doc-preview-frame';
    frame.src=drivePreviewUrl(url);
    frame.title=fileName(doc);
    frame.setAttribute('loading','eager');
    frame.setAttribute('allow','autoplay');
    body.appendChild(frame);
  }

  function openStable(orderId){
    const id=String(orderId||'');
    const order=orderById(id);
    const list=realDocs(id);
    const modal=ensureModal();
    const tabs=modal.querySelector('.ab-doc-preview-tabs');
    tabs.innerHTML='';
    tabs.classList.toggle('show',list.length>1);
    if(!list.length){
      const title=modal.querySelector('.ab-doc-preview-title');
      if(title)title.textContent=order?.produit||'Documents';
      const body=modal.querySelector('.ab-doc-preview-body');
      if(body)body.innerHTML='<div class="ab-doc-preview-empty">Aucun document joint à cette commande.</div>';
      modal.classList.add('show');
      return;
    }
    const select=index=>{
      [...tabs.children].forEach((b,i)=>b.classList.toggle('active',i===index));
      renderDoc(modal,list[index],order);
    };
    if(list.length>1){
      list.forEach((doc,i)=>{
        const b=document.createElement('button');
        b.type='button';
        b.className='ab-doc-preview-tab';
        b.textContent='📄 '+fileName(doc);
        b.title=fileName(doc);
        b.onclick=()=>select(i);
        tabs.appendChild(b);
      });
    }
    select(0);
    modal.classList.add('show');
  }

  injectStyle();
  window.openDocs=openStable;
  window.__AB_COMMANDES_DOCUMENT_PREVIEW_STABLE_VERSION=VERSION;
})();
