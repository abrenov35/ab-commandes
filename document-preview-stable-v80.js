(function(){
  'use strict';

  const VERSION='80.0';
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
    const m=u.match(/^https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/(?:view|edit|preview)(?:\?.*)?$/i);
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
      #${MODAL_ID} .ab-doc-preview-body{display:block!important;overflow:hidden!important;padding:0!important;background:#2f3030!important}
      #${MODAL_ID} .ab-doc-preview-frame{display:block!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;margin:0!important;border:0!important;transform:none!important;background:#2f3030!important}
      #${MODAL_ID} .ab-doc-preview-img{display:block!important;max-width:100%!important;max-height:100%!important;width:auto!important;height:auto!important;margin:auto!important;object-fit:contain!important}
      #${MODAL_ID} .ab-doc-preview-foot{display:none!important}
    `;
  }

  function ensureModal(){
    injectStyle();
    let modal=document.getElementById(MODAL_ID);
    if(!modal)return null;
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
    if(!modal)return;
    const tabs=modal.querySelector('.ab-doc-preview-tabs');
    if(!tabs)return;
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
  // Reprise directe de openDocs : on ne passe plus par V77/V78/V79.
  window.openDocs=openStable;
  window.__AB_COMMANDES_DOCUMENT_PREVIEW_STABLE_VERSION=VERSION;
})();
