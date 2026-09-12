(function(){
  'use strict';

  const params=new URL(window.location.href).searchParams;
  if(params.get('embed')!=='1')return;

  let busy=false;

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
      r.onerror=()=>reject(new Error('Lecture du PDF impossible.'));
      r.readAsDataURL(file);
    });
  }

  function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

  function targetedJsonp(action,id){
    return new Promise((resolve,reject)=>{
      const cb='__abPdfV29_'+Date.now()+'_'+Math.random().toString(36).slice(2);
      const script=document.createElement('script');
      let done=false;
      const cleanup=()=>{
        if(done)return;
        done=true;
        try{delete window[cb]}catch(_){window[cb]=undefined}
        script.remove();
      };
      const timer=setTimeout(()=>{cleanup();reject(new Error('Confirmation Google trop longue.'));},5000);
      window[cb]=(data)=>{clearTimeout(timer);cleanup();resolve(data);};
      script.onerror=()=>{clearTimeout(timer);cleanup();reject(new Error('Impossible de vérifier l’enregistrement.'));};
      script.src=GAS+'?action='+encodeURIComponent(action)+'&id='+encodeURIComponent(id)+'&callback='+encodeURIComponent(cb)+'&_='+Date.now();
      document.head.appendChild(script);
    });
  }

  async function waitForDocument(id){
    for(let i=0;i<8;i++){
      if(i)await sleep(650);
      try{
        const res=await targetedJsonp('document',id);
        if(res&&res.ok&&res.document&&String(res.document.id||'')===String(id))return res.document;
      }catch(_){ }
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
    try{if(typeof renderAll==='function')renderAll()}catch(_){ }
    const input=document.getElementById('abDriveFile');
    if(input)input.value='';
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
    if(!file){status('Choisis un PDF.','err');return;}
    if(file.size>8*1024*1024){status('PDF trop volumineux : 8 Mo maximum.','err');return;}

    busy=true;
    setButton('Envoi en cours…',true);
    status('Envoi vers Google Drive…','');

    const docId=(typeof uid==='function')?uid():(crypto.randomUUID?crypto.randomUUID():String(Date.now()));

    try{
      const base64=await fileToBase64(file);
      const payload={
        action:'document_upload',
        id:docId,
        commande_id:String(order.id||''),
        chantier:String(order.chantier||''),
        type:'PDF',
        file_name:String(file.name||'document.pdf'),
        nom_fichier:String(file.name||'document.pdf'),
        mime_type:String(file.type||'application/pdf'),
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
      if(!found)throw new Error('PDF non enregistré. Vérifie les autorisations Google Drive de l’Apps Script.');

      status('PDF enregistré.','ok');
      setButton('PDF enregistré',true);
      closeAfterSuccess(found);
    }catch(err){
      console.error('AB COMMANDES V29 · upload PDF',err);
      busy=false;
      status((err&&err.message)||'Échec de l’envoi du PDF.','err');
      setButton('Réessayer',false);
      return;
    }

    busy=false;
  }

  document.addEventListener('click',function(e){
    const btn=e.target&&e.target.closest?e.target.closest('#addDocBtn'):null;
    if(!btn)return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    upload();
  },true);

  window.__AB_COMMANDES_PDF_RELIABILITY_VERSION='29.0';
})();
