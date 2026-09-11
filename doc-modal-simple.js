(function(){
  'use strict';

  const params=new URL(window.location.href).searchParams;
  if(params.get('embed')!=='1')return;

  const STYLE_ID='ab-commandes-doc-modal-drive-style-v3';
  const MAX_BYTES=8*1024*1024;
  let selectedFile=null;
  let uploading=false;

  function injectStyle(){
    if(document.getElementById(STYLE_ID))return;
    ['ab-commandes-doc-modal-drive-style-v2','ab-commandes-doc-modal-simple-style-v1'].forEach(id=>document.getElementById(id)?.remove());
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #docModal .notice,#docModal .form-grid{display:none!important}
      #docModal .dialog{width:min(470px,calc(100% - 8px))!important;max-width:470px!important}
      #docModal #docList:empty{display:none!important}
      #docModal .dialog-actions{margin-top:10px!important}
      #docModal #addDocBtn:disabled{opacity:.45!important;cursor:not-allowed!important}
      #abDriveUploadBox{margin-top:4px}
      #abDriveFile{position:absolute!important;opacity:0!important;pointer-events:none!important;width:1px!important;height:1px!important}
      #abDriveDrop{display:flex;align-items:center;justify-content:center;min-height:98px;padding:16px;border:2px dashed #cfd8e6;border-radius:12px;background:#fafcff;cursor:pointer;text-align:center;transition:.15s ease}
      #abDriveDrop:hover,#abDriveDrop.ab-drag{border-color:#7ba5e8;background:#f2f7ff}
      #abDriveDrop strong{display:block;color:#16345c;font-size:14px;margin-bottom:4px}
      #abDriveDrop span{display:block;color:#7a879c;font-size:11px}
      #abDriveFileMeta{margin-top:8px;padding:8px 10px;border-radius:9px;background:#f6f8fb;color:#33445f;font-size:12px;display:none}
      #abDriveStatus{margin-top:8px;font-size:12px;color:#64748b;min-height:16px}
      #abDriveStatus.ok{color:#13865b;font-weight:700}
      #abDriveStatus.err{color:#c52c48;font-weight:700}
      #docModal .doc-list{margin-top:12px!important}
    `;
    document.head.appendChild(style);
  }

  function getOrder(){
    const id=typeof currentDocOrderId!=='undefined'?String(currentDocOrderId||''):'';
    const list=(typeof orders!=='undefined'&&Array.isArray(orders))?orders:[];
    return list.find(o=>String(o.id||'')===id)||null;
  }

  function docsForCurrent(){
    const id=typeof currentDocOrderId!=='undefined'?String(currentDocOrderId||''):'';
    const list=(typeof documents!=='undefined'&&Array.isArray(documents))?documents:[];
    return id?list.filter(d=>String(d.commande_id||'')===id):[];
  }

  function humanSize(bytes){
    const n=Number(bytes||0);if(!n)return '';
    if(n<1024*1024)return Math.max(1,Math.round(n/1024))+' Ko';
    return (n/(1024*1024)).toFixed(1).replace('.0','')+' Mo';
  }

  function legacyFieldsOff(){
    const modal=document.getElementById('docModal');
    if(!modal)return;
    const legacy=modal.querySelector('.form-grid');
    if(legacy){legacy.hidden=true;legacy.style.setProperty('display','none','important')}
    const notice=modal.querySelector('.notice');
    if(notice){notice.hidden=true;notice.style.setProperty('display','none','important')}
  }

  function ensureUploadUi(){
    injectStyle();
    legacyFieldsOff();
    const modal=document.getElementById('docModal');
    const dialog=modal?.querySelector('.dialog');
    if(!dialog)return null;

    let box=document.getElementById('abDriveUploadBox');
    if(box)return box;

    box=document.createElement('div');
    box.id='abDriveUploadBox';
    box.innerHTML=`
      <input id="abDriveFile" type="file" accept=".pdf,application/pdf">
      <label id="abDriveDrop" for="abDriveFile" tabindex="0">
        <div><strong>Choisir un PDF</strong><span>Clique ici ou dépose le fichier · 8 Mo maximum</span></div>
      </label>
      <div id="abDriveFileMeta"></div>
      <div id="abDriveStatus"></div>`;

    const actions=dialog.querySelector('.dialog-actions');
    if(actions)dialog.insertBefore(box,actions);else dialog.appendChild(box);

    const input=box.querySelector('#abDriveFile');
    const drop=box.querySelector('#abDriveDrop');
    input.addEventListener('change',()=>setSelected(input.files&&input.files[0]?input.files[0]:null));
    drop.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();input.click()}});
    ['dragenter','dragover'].forEach(type=>drop.addEventListener(type,e=>{e.preventDefault();drop.classList.add('ab-drag')}));
    ['dragleave','drop'].forEach(type=>drop.addEventListener(type,e=>{e.preventDefault();drop.classList.remove('ab-drag')}));
    drop.addEventListener('drop',e=>{
      const f=e.dataTransfer?.files?.[0]||null;
      if(!f)return;
      setSelected(f);
      try{const dt=new DataTransfer();dt.items.add(f);input.files=dt.files}catch(_){ }
    });
    return box;
  }

  function status(text,kind=''){
    const el=document.getElementById('abDriveStatus');if(!el)return;
    el.textContent=text||'';el.className=kind;
  }

  function setSelected(file){
    selectedFile=null;
    const meta=document.getElementById('abDriveFileMeta');
    const btn=document.getElementById('addDocBtn');
    if(meta){meta.style.display='none';meta.textContent=''}
    status('');
    if(!file){if(btn)btn.disabled=true;return}
    const isPdf=(file.type==='application/pdf')||/\.pdf$/i.test(file.name||'');
    if(!isPdf){status('Choisis un fichier PDF.','err');if(btn)btn.disabled=true;return}
    if(file.size>MAX_BYTES){status('PDF trop volumineux : 8 Mo maximum.','err');if(btn)btn.disabled=true;return}
    selectedFile=file;
    if(meta){meta.style.display='block';meta.textContent='📄 '+file.name+' · '+humanSize(file.size)}
    if(btn)btn.disabled=false;
  }

  function fileToBase64(file){
    return new Promise((resolve,reject)=>{
      const r=new FileReader();
      r.onload=()=>{const s=String(r.result||'');resolve(s.includes(',')?s.split(',').pop():s)};
      r.onerror=()=>reject(new Error('Lecture du fichier impossible'));
      r.readAsDataURL(file);
    });
  }

  function sleep(ms){return new Promise(r=>setTimeout(r,ms))}

  async function waitForDocument(id){
    if(typeof jsonp!=='function')return null;
    for(let i=0;i<10;i++){
      await sleep(i===0?500:700);
      try{
        const res=await jsonp('documents');
        if(res&&res.ok&&Array.isArray(res.documents)){
          const found=res.documents.find(d=>String(d.id||'')===String(id));
          if(found){
            try{documents=res.documents}catch(_){ }
            return found;
          }
        }
      }catch(_){ }
    }
    return null;
  }

  async function uploadCurrentFile(){
    if(uploading)return;
    const order=getOrder();
    if(!order){status('Commande introuvable.','err');return}
    if(!selectedFile){status('Choisis un PDF.','err');return}

    uploading=true;
    const btn=document.getElementById('addDocBtn');
    if(btn){btn.disabled=true;btn.textContent='Envoi…'}
    status('Envoi vers Google Drive…');
    try{if(typeof showSaving==='function')showSaving(true,'Upload vers Google Drive…')}catch(_){ }

    try{
      const base64=await fileToBase64(selectedFile);
      const docId=typeof uid==='function'?uid():String(Date.now());
      const payload={
        action:'document_upload',
        id:docId,
        commande_id:String(order.id||''),
        chantier:String(order.chantier||''),
        type:'PDF',
        file_name:String(selectedFile.name||'document.pdf'),
        mime_type:String(selectedFile.type||'application/pdf'),
        file_base64:base64,
        source:'Google Drive'
      };

      await fetch(GAS,{
        method:'POST',
        mode:'no-cors',
        headers:{'Content-Type':'text/plain;charset=UTF-8'},
        body:JSON.stringify(payload)
      });

      status('Fichier reçu. Enregistrement…');
      const found=await waitForDocument(docId);
      if(!found)throw new Error('Le backend actuel ne confirme pas encore l’upload Drive. Redéploie le Web App Apps Script avec le Code.gs actuel.');

      selectedFile=null;
      const input=document.getElementById('abDriveFile');if(input)input.value='';
      const meta=document.getElementById('abDriveFileMeta');if(meta){meta.style.display='none';meta.textContent=''}
      status('PDF stocké dans Google Drive et lié dans le Sheet.','ok');
      try{if(typeof renderAll==='function')renderAll()}catch(_){ }
      try{if(typeof renderDocList==='function')renderDocList()}catch(_){ }
      refreshDocModal();
    }catch(err){
      console.error('Upload Drive',err);
      status(err&&err.message?err.message:'Upload impossible.','err');
    }finally{
      uploading=false;
      if(btn){btn.textContent='Téléverser le PDF';btn.disabled=!selectedFile}
      try{if(typeof showSaving==='function')showSaving(false)}catch(_){ }
    }
  }

  function refreshDocModal(){
    legacyFieldsOff();
    ensureUploadUi();
    const modal=document.getElementById('docModal');
    if(!modal)return;

    const count=docsForCurrent().length;
    const title=document.getElementById('docTitle');
    const order=getOrder();
    if(title&&order)title.textContent=(count?'Documents · ':'Ajouter un PDF · ')+String(order.produit||'');

    const docList=document.getElementById('docList');
    if(docList){
      docList.style.display=count?'grid':'none';
      if(!count)docList.innerHTML='';
    }

    const add=document.getElementById('addDocBtn');
    if(add){add.textContent='Téléverser le PDF';add.disabled=!selectedFile||uploading;add.onclick=uploadCurrentFile}
  }

  injectStyle();
  ensureUploadUi();

  try{
    if(typeof openDocs==='function'&&!openDocs.__abDriveUploadWrappedV3){
      const previous=openDocs;
      const wrapped=function(){
        const out=previous.apply(this,arguments);
        selectedFile=null;
        const input=document.getElementById('abDriveFile');if(input)input.value='';
        setSelected(null);
        refreshDocModal();
        requestAnimationFrame(refreshDocModal);
        setTimeout(refreshDocModal,50);
        return out;
      };
      wrapped.__abDriveUploadWrappedV3=true;
      openDocs=wrapped;
    }
  }catch(e){console.error('AB COMMANDES · modale Drive',e)}

  try{
    if(typeof renderDocList==='function'&&!renderDocList.__abDriveUploadWrappedV3){
      const previous=renderDocList;
      const wrapped=function(){
        const out=previous.apply(this,arguments);
        refreshDocModal();
        return out;
      };
      wrapped.__abDriveUploadWrappedV3=true;
      renderDocList=wrapped;
    }
  }catch(e){console.error('AB COMMANDES · liste Drive',e)}

  const add=document.getElementById('addDocBtn');if(add)add.onclick=uploadCurrentFile;
  window.addEventListener('load',refreshDocModal,{once:true});
  window.__AB_COMMANDES_DOC_MODAL_SIMPLE_VERSION='3.0';
})();
