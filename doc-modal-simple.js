(function(){
  'use strict';

  const MAX_BYTES=8*1024*1024;
  const STYLE_ID='ab-commandes-doc-modal-edit-upload-v6';
  let busy=false;
  let pendingUpload=null;

  function escHtml(value){
    return String(value==null?'':value)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function humanSize(bytes){
    const n=Number(bytes||0);if(!n)return '';
    if(n<1024*1024)return Math.max(1,Math.round(n/1024))+' Ko';
    return (n/(1024*1024)).toFixed(1).replace('.0','')+' Mo';
  }

  function allOrders(){
    return (typeof orders!=='undefined'&&Array.isArray(orders))?orders:[];
  }

  function allDocuments(){
    return (typeof documents!=='undefined'&&Array.isArray(documents))?documents:[];
  }

  function orderById(id){
    return allOrders().find(o=>String(o.id||'')===String(id||''))||null;
  }

  function getEditOrder(){
    const id=typeof editId!=='undefined'?String(editId||''):'';
    return id?orderById(id):null;
  }

  function docsFor(orderId){
    return allDocuments().filter(d=>String(d.commande_id||'')===String(orderId||''));
  }

  function injectStyle(){
    if(document.getElementById(STYLE_ID))return;
    ['ab-commandes-doc-modal-drive-style-v5','ab-commandes-doc-modal-drive-style-v4','ab-commandes-doc-modal-drive-style-v3','ab-commandes-doc-modal-drive-style-v2','ab-commandes-doc-modal-simple-style-v1'].forEach(id=>document.getElementById(id)?.remove());
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #docModal .notice,#docModal .form-grid,#docModal #addDocBtn,#docModal #abDriveUploadBox{display:none!important}
      #docModal .dialog{width:min(560px,calc(100% - 8px))!important;max-width:560px!important}
      #docModal .dialog-actions{margin-top:12px!important}
      #docModal .doc-del{display:none!important}
      #docModal .doc-list{margin-top:12px!important}
      #abEditUploadWrap{display:none;margin-top:2px;padding-top:10px;border-top:1px solid #e5eaf1}
      #abEditUploadWrap .ab-edit-upload-title{font-size:12px;font-weight:800;color:#66748a;margin-bottom:7px}
      #abEditDriveFile{position:absolute!important;opacity:0!important;pointer-events:none!important;width:1px!important;height:1px!important}
      #abEditDriveDrop{display:flex;align-items:center;justify-content:center;min-height:82px;padding:14px;border:2px dashed #cfd8e6;border-radius:10px;background:#fafcff;cursor:pointer;text-align:center;transition:.15s ease}
      #abEditDriveDrop:hover,#abEditDriveDrop.ab-drag{border-color:#7ba5e8;background:#f2f7ff}
      #abEditDriveDrop strong{display:block;color:#16345c;font-size:13px;margin-bottom:3px}
      #abEditDriveDrop span{display:block;color:#7a879c;font-size:11px}
      #abEditFileMeta{margin-top:7px;padding:7px 9px;border-radius:8px;background:#f6f8fb;color:#33445f;font-size:12px;display:none}
      #abEditUploadStatus{margin-top:7px;font-size:12px;color:#64748b;min-height:16px}
      #abEditUploadStatus.ok{color:#13865b;font-weight:700}
      #abEditUploadStatus.err{color:#c52c48;font-weight:700}
      #abEditUploadBtn{margin-top:8px;width:100%}
      #abEditUploadBtn:disabled{opacity:.45;cursor:not-allowed}
      #abEditDocList{display:grid;gap:7px;margin-top:9px}
      .ab-edit-doc-item{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:7px;align-items:center;border:1px solid #e5eaf1;border-radius:9px;padding:8px 9px}
      .ab-edit-doc-item a{color:#1f5cc6;font-weight:800;text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}
      .ab-edit-doc-item .btn{padding:7px 9px;font-size:11px}
      @media(max-width:760px){.ab-edit-doc-item{grid-template-columns:minmax(0,1fr) auto}.ab-edit-doc-item .ab-edit-doc-del{grid-column:2}}
    `;
    document.head.appendChild(style);
  }

  function clearLegacyDocUpload(){
    document.getElementById('abDriveUploadBox')?.remove();
    const docModal=document.getElementById('docModal');
    if(!docModal)return;
    const notice=docModal.querySelector('.notice');if(notice)notice.style.setProperty('display','none','important');
    const form=docModal.querySelector('.form-grid');if(form)form.style.setProperty('display','none','important');
    const add=document.getElementById('addDocBtn');if(add)add.style.setProperty('display','none','important');
  }

  function editStatus(text,kind=''){
    const el=document.getElementById('abEditUploadStatus');
    if(!el)return;
    el.textContent=text||'';
    el.className=kind;
  }

  function setSelected(file){
    const meta=document.getElementById('abEditFileMeta');
    const btn=document.getElementById('abEditUploadBtn');
    if(meta){meta.style.display='none';meta.textContent='';}
    editStatus('');
    if(!file){if(btn)btn.disabled=true;return;}
    if(file.size>MAX_BYTES){editStatus('Fichier trop volumineux : 8 Mo maximum.','err');if(btn)btn.disabled=true;return;}
    if(meta){meta.style.display='block';meta.textContent='📎 '+String(file.name||'fichier')+' · '+humanSize(file.size);}
    if(btn){btn.disabled=false;btn.textContent='Téléverser le fichier';}
  }

  function ensureEditUploadUi(){
    injectStyle();clearLegacyDocUpload();
    const modal=document.getElementById('modal');
    const form=modal?.querySelector('.form-grid');
    if(!form)return null;
    let wrap=document.getElementById('abEditUploadWrap');
    if(wrap)return wrap;

    wrap=document.createElement('div');
    wrap.id='abEditUploadWrap';
    wrap.className='full';
    wrap.innerHTML=`
      <div class="ab-edit-upload-title">Pièce jointe</div>
      <input id="abEditDriveFile" type="file">
      <label id="abEditDriveDrop" for="abEditDriveFile" tabindex="0"><div><strong>Choisir un fichier</strong><span>PDF, image, Word, Excel ou autre · 8 Mo maximum</span></div></label>
      <div id="abEditFileMeta"></div>
      <div id="abEditUploadStatus"></div>
      <button id="abEditUploadBtn" type="button" class="btn secondary" disabled>Téléverser le fichier</button>
      <div id="abEditDocList"></div>`;
    form.appendChild(wrap);

    const input=wrap.querySelector('#abEditDriveFile');
    const drop=wrap.querySelector('#abEditDriveDrop');
    const btn=wrap.querySelector('#abEditUploadBtn');
    input.addEventListener('change',()=>{pendingUpload=null;setSelected(input.files&&input.files[0]?input.files[0]:null);});
    drop.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();input.click();}});
    ['dragenter','dragover'].forEach(type=>drop.addEventListener(type,e=>{e.preventDefault();drop.classList.add('ab-drag');}));
    ['dragleave','drop'].forEach(type=>drop.addEventListener(type,e=>{e.preventDefault();drop.classList.remove('ab-drag');}));
    drop.addEventListener('drop',e=>{
      const f=e.dataTransfer?.files?.[0]||null;if(!f)return;
      try{const dt=new DataTransfer();dt.items.add(f);input.files=dt.files;}catch(_){}
      pendingUpload=null;setSelected(f);
    });
    btn.addEventListener('click',uploadFromEdit);
    return wrap;
  }

  function renderEditDocs(){
    const box=document.getElementById('abEditDocList');
    const order=getEditOrder();
    if(!box)return;
    if(!order){box.innerHTML='';return;}
    const list=docsFor(order.id);
    box.innerHTML=list.length?list.map(d=>`<div class="ab-edit-doc-item"><a href="${escHtml(d.url_pdf||'#')}" target="_blank" rel="noopener">📄 ${escHtml(d.nom_fichier||d.type||'Fichier')}</a><a class="btn secondary" href="${escHtml(d.url_pdf||'#')}" target="_blank" rel="noopener">Voir</a><button type="button" class="btn red ab-edit-doc-del" data-id="${escHtml(d.id||'')}">×</button></div>`).join(''):'';
    box.querySelectorAll('.ab-edit-doc-del').forEach(btn=>{
      btn.onclick=async()=>{
        if(!btn.dataset.id||!confirm('Supprimer ce fichier ?'))return;
        try{
          if(typeof deleteDocument==='function')await deleteDocument(btn.dataset.id);
          renderEditDocs();
          try{if(typeof renderAll==='function')renderAll();}catch(_){}
        }catch(err){editStatus((err&&err.message)||'Suppression impossible.','err');}
      };
    });
  }

  function refreshEditUpload(){
    const wrap=ensureEditUploadUi();if(!wrap)return;
    const order=getEditOrder();
    wrap.style.display=order?'block':'none';
    if(!order){
      const input=document.getElementById('abEditDriveFile');if(input)input.value='';
      pendingUpload=null;busy=false;setSelected(null);renderEditDocs();return;
    }
    renderEditDocs();
  }

  function fileToBase64(file){
    return new Promise((resolve,reject)=>{
      const r=new FileReader();
      r.onload=()=>{const s=String(r.result||'');resolve(s.includes(',')?s.split(',').pop():s);};
      r.onerror=()=>reject(new Error('Lecture du fichier impossible.'));
      r.readAsDataURL(file);
    });
  }

  function documentType(file){
    const name=String(file&&file.name||'').toLowerCase();
    const mime=String(file&&file.type||'').toLowerCase();
    if(mime==='application/pdf'||name.endsWith('.pdf'))return 'PDF';
    if(mime.startsWith('image/')||/\.(jpg|jpeg|png|gif|webp|heic|heif|bmp|tif|tiff)$/i.test(name))return 'Image';
    if(/\.(doc|docx|odt|rtf)$/i.test(name)||mime.includes('word')||mime.includes('opendocument.text'))return 'Word';
    if(/\.(xls|xlsx|xlsm|csv|ods)$/i.test(name)||mime.includes('excel')||mime.includes('spreadsheet')||mime.includes('csv'))return 'Excel';
    return 'Fichier';
  }

  function safeMime(file){return String(file&&file.type||'').trim()||'application/octet-stream';}
  function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

  function fileKey(file,order){
    return [String(order?.id||''),String(file?.name||''),String(file?.size||0),String(file?.lastModified||0)].join('|');
  }

  function uploadId(file,order){
    const key=fileKey(file,order);
    if(pendingUpload&&pendingUpload.key===key&&pendingUpload.id)return pendingUpload.id;
    const id=(typeof uid==='function')?uid():(crypto.randomUUID?crypto.randomUUID():String(Date.now()));
    pendingUpload={key,id:String(id)};
    return pendingUpload.id;
  }

  function targetedJsonp(id){
    return new Promise((resolve,reject)=>{
      const cb='__abEditFileV44_'+Date.now()+'_'+Math.random().toString(36).slice(2);
      const script=document.createElement('script');
      let finished=false;
      const cleanup=()=>{if(finished)return;finished=true;try{delete window[cb];}catch(_){window[cb]=undefined;}script.remove();};
      const timer=setTimeout(()=>{cleanup();reject(new Error('Confirmation Google trop longue.'));},4500);
      window[cb]=data=>{clearTimeout(timer);cleanup();resolve(data);};
      script.onerror=()=>{clearTimeout(timer);cleanup();reject(new Error('Impossible de vérifier l’enregistrement.'));};
      script.src=GAS+'?action=document&id='+encodeURIComponent(id)+'&callback='+encodeURIComponent(cb)+'&_='+Date.now();
      document.head.appendChild(script);
    });
  }

  async function findDocument(id){
    try{
      const res=await targetedJsonp(id);
      if(res&&res.ok&&res.document&&String(res.document.id||'')===String(id))return res.document;
    }catch(_){}
    return null;
  }

  async function waitForDocument(id){
    for(let i=0;i<6;i++){
      if(i)await sleep(650);
      const found=await findDocument(id);
      if(found)return found;
    }
    return null;
  }

  async function uploadFromEdit(){
    if(busy)return;
    const order=getEditOrder();
    const input=document.getElementById('abEditDriveFile');
    const file=input&&input.files&&input.files[0]?input.files[0]:null;
    const btn=document.getElementById('abEditUploadBtn');
    if(!order){editStatus('Enregistre d’abord le produit avant d’ajouter un fichier.','err');return;}
    if(!file){editStatus('Choisis un fichier.','err');return;}
    if(file.size>MAX_BYTES){editStatus('Fichier trop volumineux : 8 Mo maximum.','err');return;}

    busy=true;if(btn){btn.disabled=true;btn.textContent='Envoi en cours…';}
    const docId=uploadId(file,order);
    try{
      editStatus('Vérification…');
      const existing=await findDocument(docId);
      if(existing){
        if(!allDocuments().some(d=>String(d.id||'')===String(existing.id||'')))allDocuments().push(existing);
        editStatus('Fichier déjà enregistré.','ok');
        if(input)input.value='';pendingUpload=null;setSelected(null);renderEditDocs();
        try{if(typeof renderAll==='function')renderAll();}catch(_){}
        return;
      }

      editStatus('Envoi vers Google Drive…');
      const base64=await fileToBase64(file);
      const fileName=String(file.name||'fichier');
      const payload={
        action:'document_upload',id:docId,commande_id:String(order.id||''),chantier:String(order.chantier||''),
        type:documentType(file),file_name:fileName,nom_fichier:fileName,mime_type:safeMime(file),file_base64:base64,source:'Google Drive'
      };
      await fetch(GAS,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(payload)});
      editStatus('Vérification de l’enregistrement…');
      const found=await waitForDocument(docId);
      if(!found)throw new Error('Envoi non confirmé.');

      const list=allDocuments();
      const idx=list.findIndex(d=>String(d.id||'')===String(found.id||''));
      if(idx>=0)list[idx]=found;else list.push(found);
      if(input)input.value='';pendingUpload=null;setSelected(null);
      editStatus('Fichier enregistré.','ok');
      renderEditDocs();
      try{if(typeof renderAll==='function')renderAll();}catch(_){}
    }catch(err){
      console.error('AB COMMANDES V44 · upload modification',err);
      editStatus((err&&err.message)||'Échec de l’envoi du fichier.','err');
    }finally{
      busy=false;
      if(btn){btn.disabled=!(input&&input.files&&input.files[0]);btn.textContent='Téléverser le fichier';}
    }
  }

  function prepareViewer(){
    clearLegacyDocUpload();
    const modal=document.getElementById('docModal');if(!modal)return;
    const add=document.getElementById('addDocBtn');if(add)add.style.setProperty('display','none','important');
    modal.querySelectorAll('.doc-del').forEach(x=>x.style.setProperty('display','none','important'));
    const title=document.getElementById('docTitle');
    const id=typeof currentDocOrderId!=='undefined'?currentDocOrderId:null;
    const order=orderById(id);
    if(title&&order)title.textContent='Fichiers · '+String(order.produit||'');
  }

  injectStyle();clearLegacyDocUpload();ensureEditUploadUi();

  try{
    if(typeof openModal==='function'&&!openModal.__abEditUploadWrappedV6){
      const previous=openModal;
      const wrapped=function(){
        const out=previous.apply(this,arguments);
        Promise.resolve(out).then(()=>{refreshEditUpload();requestAnimationFrame(refreshEditUpload);setTimeout(refreshEditUpload,60);});
        return out;
      };
      wrapped.__abEditUploadWrappedV6=true;openModal=wrapped;
    }
  }catch(e){console.error('AB COMMANDES V44 · modale modification',e);}

  try{
    if(typeof closeModal==='function'&&!closeModal.__abEditUploadWrappedV6){
      const previous=closeModal;
      const wrapped=function(){
        const out=previous.apply(this,arguments);
        const input=document.getElementById('abEditDriveFile');if(input)input.value='';
        pendingUpload=null;busy=false;setSelected(null);refreshEditUpload();
        return out;
      };
      wrapped.__abEditUploadWrappedV6=true;closeModal=wrapped;
    }
  }catch(e){console.error('AB COMMANDES V44 · fermeture modification',e);}

  try{
    if(typeof openDocs==='function'&&!openDocs.__abViewerWrappedV6){
      const previous=openDocs;
      const wrapped=function(orderId){
        const list=docsFor(orderId);
        if(list.length===1&&String(list[0].url_pdf||'').trim()){
          window.open(String(list[0].url_pdf),'_blank','noopener');
          return;
        }
        const out=previous.apply(this,arguments);
        prepareViewer();requestAnimationFrame(prepareViewer);setTimeout(prepareViewer,40);
        return out;
      };
      wrapped.__abViewerWrappedV6=true;openDocs=wrapped;
    }
  }catch(e){console.error('AB COMMANDES V44 · visualisation fichiers',e);}

  try{
    if(typeof renderDocList==='function'&&!renderDocList.__abViewerWrappedV6){
      const previous=renderDocList;
      const wrapped=function(){const out=previous.apply(this,arguments);prepareViewer();return out;};
      wrapped.__abViewerWrappedV6=true;renderDocList=wrapped;
    }
  }catch(e){console.error('AB COMMANDES V44 · liste visualisation',e);}

  window.addEventListener('load',()=>{clearLegacyDocUpload();refreshEditUpload();prepareViewer();},{once:true});
  window.__AB_COMMANDES_DOC_MODAL_SIMPLE_VERSION='6.0';
  window.__AB_COMMANDES_EDIT_UPLOAD_VERSION='44.0';
})();
