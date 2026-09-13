(function(){
  'use strict';

  const VERSION='64.0';
  const MODAL_ID='abDocumentPreviewV64';
  const STYLE_ID='abDocumentPreviewV64Style';

  function ordersList(){return (typeof orders!=='undefined'&&Array.isArray(orders))?orders:[];}
  function docsList(){return (typeof documents!=='undefined'&&Array.isArray(documents))?documents:[];}
  function orderById(id){return ordersList().find(o=>String(o.id||'')===String(id||''))||null;}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  function realDocs(orderId){
    const id=String(orderId||'');
    return docsList().filter(d=>
      String(d.commande_id||'')===id &&
      String(d.type||'').trim().toLowerCase()!=='lien web'
    );
  }

  function originalUrl(doc){return String(doc?.url_pdf||doc?.url||'').trim();}
  function previewUrl(url){
    const u=String(url||'').trim();
    const m=u.match(/^https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/(?:view|edit)(?:\?.*)?$/i);
    if(m)return 'https://drive.google.com/file/d/'+encodeURIComponent(m[1])+'/preview';
    return u;
  }
  function fileName(doc){return String(doc?.nom_fichier||doc?.file_name||doc?.type||'Document').trim()||'Document';}
  function isImage(doc,url){
    const mime=String(doc?.mime_type||'').toLowerCase();
    const name=fileName(doc).toLowerCase();
    return mime.startsWith('image/')||/\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name)||/\.(png|jpe?g|gif|webp|bmp|svg)(?:\?|#|$)/i.test(url);
  }

  function injectStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      #${MODAL_ID}{position:fixed;inset:0;z-index:320;display:none;align-items:center;justify-content:center;padding:14px;background:rgba(12,27,47,.62);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px)}
      #${MODAL_ID}.show{display:flex}
      #${MODAL_ID} .ab-doc-preview-card{width:min(1000px,calc(100vw - 28px));height:min(86vh,820px);display:flex;flex-direction:column;background:#fff;border:1px solid #b8c6d7;border-radius:16px;box-shadow:0 28px 80px rgba(8,25,45,.34);overflow:hidden}
      #${MODAL_ID} .ab-doc-preview-head{display:flex;align-items:center;gap:12px;padding:12px 14px;border-bottom:1px solid #d7e0ea;background:#f7f9fc}
      #${MODAL_ID} .ab-doc-preview-title{min-width:0;flex:1;color:#102d50;font-size:17px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #${MODAL_ID} .ab-doc-preview-close{width:34px;height:34px;border:1px solid #c4cfdd;border-radius:9px;background:#fff;color:#2c405d;font-size:19px;font-weight:800;cursor:pointer}
      #${MODAL_ID} .ab-doc-preview-tabs{display:none;gap:7px;overflow:auto;padding:9px 12px;border-bottom:1px solid #dde5ef;background:#fff}
      #${MODAL_ID} .ab-doc-preview-tabs.show{display:flex}
      #${MODAL_ID} .ab-doc-preview-tab{flex:0 0 auto;max-width:240px;height:32px;padding:0 10px;border:1px solid #c9d4e2;border-radius:8px;background:#fff;color:#314966;font-size:11px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}
      #${MODAL_ID} .ab-doc-preview-tab.active{background:#e9f2ff;border-color:#6d98c8;color:#174d82}
      #${MODAL_ID} .ab-doc-preview-body{position:relative;flex:1;min-height:0;background:#eef2f6}
      #${MODAL_ID} .ab-doc-preview-frame{width:100%;height:100%;border:0;background:#fff}
      #${MODAL_ID} .ab-doc-preview-img{display:block;max-width:100%;max-height:100%;margin:auto;object-fit:contain}
      #${MODAL_ID} .ab-doc-preview-empty{height:100%;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;color:#60728a;font-size:13px;font-weight:700}
      #${MODAL_ID} .ab-doc-preview-foot{display:flex;justify-content:flex-end;gap:8px;padding:10px 12px;border-top:1px solid #dce4ed;background:#fff}
      #${MODAL_ID} .ab-doc-preview-open,#${MODAL_ID} .ab-doc-preview-done{min-height:36px;padding:0 13px;border-radius:8px;font-size:11px;font-weight:850;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}
      #${MODAL_ID} .ab-doc-preview-open{border:1px solid #2d6ca5;background:#eaf3ff;color:#174d82}
      #${MODAL_ID} .ab-doc-preview-done{border:1px solid #c4cfdd;background:#fff;color:#2c405d;cursor:pointer}
      @media(max-width:650px){#${MODAL_ID}{padding:7px}#${MODAL_ID} .ab-doc-preview-card{width:calc(100vw - 14px);height:88vh;border-radius:12px}#${MODAL_ID} .ab-doc-preview-title{font-size:15px}}
    `;
    document.head.appendChild(s);
  }

  function ensureModal(){
    injectStyle();
    let modal=document.getElementById(MODAL_ID);
    if(modal)return modal;
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
        <div class="ab-doc-preview-foot">
          <a class="ab-doc-preview-open" href="#" target="_blank" rel="noopener">Ouvrir dans un nouvel onglet</a>
          <button type="button" class="ab-doc-preview-done">Fermer</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    const close=()=>modal.classList.remove('show');
    modal.querySelector('.ab-doc-preview-close').onclick=close;
    modal.querySelector('.ab-doc-preview-done').onclick=close;
    modal.addEventListener('click',e=>{if(e.target===modal)close();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('show'))close();});
    return modal;
  }

  function renderDoc(modal,doc,order){
    const body=modal.querySelector('.ab-doc-preview-body');
    const open=modal.querySelector('.ab-doc-preview-open');
    const title=modal.querySelector('.ab-doc-preview-title');
    const url=originalUrl(doc);
    const purl=previewUrl(url);
    title.textContent=(order?.produit?order.produit+' · ':'')+fileName(doc);
    open.href=url||'#';
    open.style.display=url?'inline-flex':'none';
    body.innerHTML='';
    if(!url){
      body.innerHTML='<div class="ab-doc-preview-empty">Le document est bien rattaché, mais aucune URL de visualisation n’est disponible.</div>';
      return;
    }
    if(isImage(doc,url)){
      const img=document.createElement('img');
      img.className='ab-doc-preview-img';
      img.src=url;
      img.alt=fileName(doc);
      body.appendChild(img);
    }else{
      const frame=document.createElement('iframe');
      frame.className='ab-doc-preview-frame';
      frame.src=purl;
      frame.title=fileName(doc);
      frame.setAttribute('loading','eager');
      body.appendChild(frame);
    }
  }

  function openPreview(orderId){
    const id=String(orderId||'');
    const order=orderById(id);
    const list=realDocs(id);
    const modal=ensureModal();
    const tabs=modal.querySelector('.ab-doc-preview-tabs');
    tabs.innerHTML='';
    tabs.classList.toggle('show',list.length>1);

    if(!list.length){
      modal.querySelector('.ab-doc-preview-title').textContent=order?.produit||'Documents';
      modal.querySelector('.ab-doc-preview-body').innerHTML='<div class="ab-doc-preview-empty">Aucun document joint à cette commande.</div>';
      modal.querySelector('.ab-doc-preview-open').style.display='none';
      modal.classList.add('show');
      return;
    }

    let active=0;
    const select=index=>{
      active=index;
      [...tabs.children].forEach((b,i)=>b.classList.toggle('active',i===active));
      renderDoc(modal,list[active],order);
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

  window.openDocs=openPreview;
  window.__AB_COMMANDES_DOCUMENT_PREVIEW_VERSION=VERSION;
})();
