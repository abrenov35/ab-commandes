(function(){
  'use strict';

  const params=new URL(window.location.href).searchParams;
  if(params.get('embed')!=='1')return;

  const MAX_BYTES=8*1024*1024;
  let busy=false;
  let pendingUpload=null;

  function getOrder(){
    const id=typeof currentDocOrderId!=='undefined'?String(currentDocOrderId||''):'';
    const list=(typeof orders!=='undefined'&&Array.isArray(orders))?orders:[];
    return list.find(o=>String(o.id||'')===id)||null;
  }

  function status(text,kind){
    const el=document.getElementById('abDriveStatus');
    if(!el)return;
    el.textContent=text||'';
    el.className=kind||'';
  }

  function setButton(text,disabled){
    const btn=document.getElementById('addDocBtn');
    if(!btn)return;
    btn.textContent=text;
    btn.disabled=!!disabled;
  }

  function fileToBase64(file){
    return new Promise((resolve,reject)=>{
      const r=new FileReader();
      r.onload=()=>{
        const s=String(r.result||'');
        resolve(s.includes(',')?s.split(',').pop():s);
      };
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

  function safeMime(file){
    return String(file&&file.type||'').trim()||'application/octet-stream';
  }

  function fileKey(file,order){
    return [
      String(order&&order.id||''),
      String(file&&file.name||''),
      String(file&&file.size||0),
      String(file&&file.lastModified||0)
    ].join('|');
  }

  function getDocId(file,order){
    const key=fileKey(file,order);
    if(pendingUpload&&pendingUpload.key===key&&pendingUpload.id)return pendingUpload.id;
    const id=(typeof uid==='function')?uid():(crypto.randomUUID?crypto.randomUUID():String(Date.now()));
    pendingUpload={key:key,id:String(id)};
    return pendingUpload.id;
  }

  function clearPending(){
    pendingUpload=null;
  }

  function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

  function targetedJsonp(action,id){
    return new Promise((resolve,reject)=>{
      const cb='__abFileV43_'+Date.now()+'_'+Math.random().toString(36).slice(2);
      const script=document.createElement('script');
      let done=false;
      const cleanup=()=>{
        if(done)return;
        done=true;
        try{delete window[cb];}catch(_){window[cb]=undefined;}
        script.remove();
      };
      const timer=setTimeout(()=>{cleanup();reject(new Error('Confirmation Google trop longue.'));},5000);
      window[cb]=(data)=>{clearTimeout(timer);cleanup();resolve(data);};
      script.onerror=()=>{clearTimeout(timer);cleanup();reject(new Error('Impossible de vérifier l’enregistrement.'));};
      script.src=GAS+'?action='+encodeURIComponent(action)+'&id='+encodeURIComponent(id)+'&callback='+encodeURIComponent(cb)+'&_='+Date.now();
      document.head.appendChild(script);
    });
  }

  async function findDocument(id){
    try{
      const res=await targetedJsonp('document',id);
      if(res&&res.ok&&res.document&&String(res.document.id||'')===String(id))return res.document;
    }catch(_){ }
    return null;
  }

  async function waitForDocument(id){
    for(let i=0;i<12;i++){
      if(i)await sleep(750);
      const found=await findDocument(id);
      if(found)return found;
    }
    return null;
  }

  function closeAfterSuccess(found){
    try{
      if(typeof documents!=='undefined'&&Array.isArray(documents)){
        const i=documents.findIndex(d=>String(d.id||'')===String(found.id||''));
        if(i>=0)documents[i]=found;else documents.push(found);
      }
    }catch(_){ }
    try{if(typeof renderAll==='function')renderAll();}catch(_){ }
    const input=document.getElementById('abDriveFile');
    if(input)input.value='';
    clearPending();
    setTimeout(()=>{
      try{
        if(typeof closeDocs==='function')closeDocs();
        else document.getElementById('docModal')?.classList.remove('show');
      }catch(_){ }
    },350);
  }

  async function upload(){
    if(busy)return;
    const input=document.getElementById('abDriveFile');
    const file=input&&input.files&&input.files[0]?input.files[0]:null;
    const order=getOrder();

    if(!order){status('Commande introuvable.','err');return;}
    if(!file){status('Choisis un fichier.','err');return;}
    if(file.size>MAX_BYTES){status('Fichier trop volumineux : 8 Mo maximum.','err');return;}

    busy=true;
    setButton('Vérification…',true);

    const docId=getDocId(file,order);

    try{
      status('Vérification d’un envoi précédent…','');
      const alreadySaved=await findDocument(docId);
      if(alreadySaved){
        status('Fichier déjà enregistré.','ok');
        setButton('Fichier enregistré',true);
        closeAfterSuccess(alreadySaved);
        busy=false;
        return;
      }

      status('Envoi vers Google Drive…','');
      setButton('Envoi en cours…',true);
      const base64=await fileToBase64(file);
      const fileName=String(file.name||'fichier');
      const payload={
        action:'document_upload',
        id:docId,
        commande_id:String(order.id||''),
        chantier:String(order.chantier||''),
        type:documentType(file),
        file_name:fileName,
        nom_fichier:fileName,
        mime_type:safeMime(file),
        file_base64:base64,
        source:'Google Drive'
      };

      await fetch(GAS,{
        method:'POST',
        mode:'no-cors',
        headers:{'Content-Type':'text/plain;charset=UTF-8'},
        body:JSON.stringify(payload)
      });

      status('Vérification de l’enregistrement…','');
      const found=await waitForDocument(docId);
      if(!found)throw new Error('Envoi non confirmé. Réessayer vérifiera d’abord le premier envoi.');

      status('Fichier enregistré.','ok');
      setButton('Fichier enregistré',true);
      closeAfterSuccess(found);
    }catch(err){
      console.error('AB COMMANDES V43 · upload fichier',err);
      busy=false;
      status((err&&err.message)||'Échec de l’envoi du fichier.','err');
      setButton('Réessayer',false);
      return;
    }

    busy=false;
  }

  document.addEventListener('change',function(e){
    if(e.target&&e.target.id==='abDriveFile')clearPending();
  },true);

  document.addEventListener('click',function(e){
    const btn=e.target&&e.target.closest?e.target.closest('#addDocBtn'):null;
    if(!btn)return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    upload();
  },true);

  window.__AB_COMMANDES_FILE_RELIABILITY_VERSION='43.0';
  window.__AB_COMMANDES_PDF_RELIABILITY_VERSION='43.0';
})();
