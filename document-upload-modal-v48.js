(function(){
  'use strict';

  const VERSION='48.0';
  const MAX_BYTES=8*1024*1024;
  const STYLE_ID='ab-commandes-document-upload-modal-v48-style';
  const ID_STORE='AB_COMMANDES_DOC_UPLOAD_IDS_V48';
  const jobs=new Map();
  let currentOrderId='';

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function ordersList(){return (typeof orders!=='undefined'&&Array.isArray(orders))?orders:[];}
  function docsList(){return (typeof documents!=='undefined'&&Array.isArray(documents))?documents:[];}
  function orderById(id){return ordersList().find(o=>String(o.id||'')===String(id||''))||null;}
  function sizeLabel(bytes){const n=Number(bytes||0);if(n<1024*1024)return Math.max(1,Math.round(n/1024))+' Ko';return (n/(1024*1024)).toFixed(1).replace('.0','')+' Mo';}
  function fileType(file){
    const n=String(file?.name||'').toLowerCase(),m=String(file?.type||'').toLowerCase();
    if(m==='application/pdf'||n.endsWith('.pdf'))return 'PDF';
    if(m.startsWith('image/')||/\.(jpg|jpeg|png|gif|webp|heic|heif|bmp|tif|tiff)$/i.test(n))return 'Image';
    if(/\.(doc|docx|odt|rtf)$/i.test(n)||m.includes('word'))return 'Word';
    if(/\.(xls|xlsx|xlsm|csv|ods)$/i.test(n)||m.includes('excel')||m.includes('spreadsheet')||m.includes('csv'))return 'Excel';
    return 'Fichier';
  }
  function uid48(){try{return typeof uid==='function'?uid():crypto.randomUUID();}catch(_){return Date.now()+'-'+Math.random().toString(36).slice(2);}}
  function fileToBase64(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{const s=String(r.result||'');resolve(s.includes(',')?s.split(',').pop():s)};r.onerror=()=>reject(new Error('Lecture du fichier impossible.'));r.readAsDataURL(file);});}
  function yieldUi(){return new Promise(resolve=>{if(typeof requestIdleCallback==='function')requestIdleCallback(()=>resolve(),{timeout:180});else setTimeout(resolve,0);});}

  function readIds(){try{const o=JSON.parse(sessionStorage.getItem(ID_STORE)||'{}');return o&&typeof o==='object'?o:{};}catch(_){return {};}}
  function stableId(key){const all=readIds();if(all[key])return String(all[key]);const id=uid48();all[key]=id;try{sessionStorage.setItem(ID_STORE,JSON.stringify(all));}catch(_){}return String(id);}

  function injectStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;
    s.textContent=`
      #modal #abEditUploadWrap{display:none!important}
      #modal #abDocLaunchV47{grid-column:1/-1!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;margin-top:1px!important;padding-top:2px!important}
      #modal #abOpenUploadModalV47{min-height:33px!important;height:33px!important;padding:0 11px!important;border:1px solid #aebed1!important;border-radius:8px!important;background:#fff!important;color:#173a60!important;font-size:11px!important;font-weight:800!important;cursor:pointer!important;box-shadow:none!important}
      #modal #abOpenUploadModalV47:hover{background:#f2f6fa!important;border-color:#7f9ab8!important}
      #abUploadModalV47{position:fixed;inset:0;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(13,29,49,.58);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);z-index:220}
      #abUploadModalV47.show{display:flex}
      #abUploadModalV47 .ab-upload-card{width:min(470px,calc(100vw - 28px));background:#fff;border:1px solid #bdcbdc;border-radius:15px;box-shadow:0 24px 70px rgba(8,25,46,.32);overflow:hidden}
      #abUploadModalV47 .ab-upload-head{padding:14px 16px 12px;border-bottom:1px solid #d7e0ea;background:#f7f9fc}
      #abUploadModalV47 .ab-upload-title{margin:0;color:#102d50;font-size:18px;font-weight:900}
      #abUploadModalV47 .ab-upload-sub{margin-top:4px;color:#5d718a;font-size:11px;font-weight:600}
      #abUploadModalV47 .ab-upload-body{padding:14px 16px}
      #abUploadModalV47 #abUploadFileV47{position:absolute;opacity:0;pointer-events:none;width:1px;height:1px}
      #abUploadModalV47 .ab-upload-drop{display:flex;align-items:center;justify-content:center;min-height:94px;padding:15px;border:2px dashed #aebfd3;border-radius:11px;background:#f8fafc;text-align:center;cursor:pointer}
      #abUploadModalV47 .ab-upload-drop:hover,#abUploadModalV47 .ab-upload-drop.drag{border-color:#507fba;background:#f0f6fd}
      #abUploadModalV47 .ab-upload-drop strong{display:block;color:#14375e;font-size:13px;margin-bottom:4px}
      #abUploadModalV47 .ab-upload-drop span{display:block;color:#6f8095;font-size:10px}
      #abUploadModalV47 .ab-upload-file{display:none;margin-top:9px;padding:8px 10px;border:1px solid #d3dde8;border-radius:8px;background:#f6f8fb;color:#263f5d;font-size:11px;font-weight:700}
      #abUploadModalV47 .ab-upload-status{min-height:16px;margin-top:8px;color:#64748b;font-size:11px;font-weight:700}
      #abUploadModalV47 .ab-upload-status.ok{color:#167a55}
      #abUploadModalV47 .ab-upload-status.err{color:#b52d44}
      #abUploadModalV47 .ab-upload-actions{display:flex;justify-content:flex-end;gap:8px;padding:11px 16px 14px;border-top:1px solid #e1e7ef}
      #abUploadModalV47 .ab-upload-actions button{min-height:36px;height:36px;padding:0 13px;border-radius:8px;font-size:11px;font-weight:850;cursor:pointer}
      #abUploadCancelV47{border:1px solid #bdcad8;background:#fff;color:#29425f}
      #abUploadSendV47{border:1px solid #164f91;background:#164f91;color:#fff;min-width:105px}
      #abUploadSendV47:disabled{opacity:.48;cursor:not-allowed}
      #abUploadBgToastV48{position:fixed;right:18px;bottom:18px;z-index:500;max-width:min(420px,calc(100vw - 36px));padding:11px 14px;border-radius:10px;background:#173a60;color:#fff;box-shadow:0 12px 32px rgba(9,28,50,.24);font-size:12px;font-weight:800;display:none;pointer-events:none}
      #abUploadBgToastV48.show{display:block}
      #abUploadBgToastV48.ok{background:#177245}
      #abUploadBgToastV48.err{background:#a82f43}
    `;
    document.head.appendChild(s);
  }

  function toast(text,kind=''){
    injectStyle();let el=document.getElementById('abUploadBgToastV48');
    if(!el){el=document.createElement('div');el.id='abUploadBgToastV48';document.body.appendChild(el);}
    el.textContent=text||'';el.className='show'+(kind?' '+kind:'');
    clearTimeout(el.__abTimer);el.__abTimer=setTimeout(()=>{el.className='';},kind==='err'?6500:4200);
  }

  function ensureModal(){
    injectStyle();
    let modal=document.getElementById('abUploadModalV47');
    if(modal)return modal;
    modal=document.createElement('div');modal.id='abUploadModalV47';
    modal.innerHTML=`<div class="ab-upload-card" role="dialog" aria-modal="true" aria-labelledby="abUploadTitleV47">
      <div class="ab-upload-head"><h3 id="abUploadTitleV47" class="ab-upload-title">Ajouter un document</h3><div id="abUploadSubV47" class="ab-upload-sub"></div></div>
      <div class="ab-upload-body">
        <input id="abUploadFileV47" type="file">
        <label class="ab-upload-drop" for="abUploadFileV47" tabindex="0"><div><strong>Choisir un fichier</strong><span>PDF, image, Word, Excel ou autre · 8 Mo maximum</span></div></label>
        <div id="abUploadFileMetaV47" class="ab-upload-file"></div><div id="abUploadStatusV47" class="ab-upload-status"></div>
      </div>
      <div class="ab-upload-actions"><button id="abUploadCancelV47" type="button">Annuler</button><button id="abUploadSendV47" type="button" disabled>Téléverser</button></div>
    </div>`;
    document.body.appendChild(modal);
    const input=modal.querySelector('#abUploadFileV47'),drop=modal.querySelector('.ab-upload-drop');
    input.addEventListener('change',()=>selectFile(input.files?.[0]||null));
    drop.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();input.click();}});
    ['dragenter','dragover'].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.add('drag')}));
    ['dragleave','drop'].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.remove('drag')}));
    drop.addEventListener('drop',e=>{const f=e.dataTransfer?.files?.[0]||null;if(!f)return;try{const dt=new DataTransfer();dt.items.add(f);input.files=dt.files}catch(_){}selectFile(f)});
    modal.querySelector('#abUploadCancelV47').onclick=closeUpload;
    modal.querySelector('#abUploadSendV47').onclick=startUpload;
    modal.addEventListener('click',e=>{if(e.target===modal)closeUpload()});
    return modal;
  }

  function status(text,kind=''){
    const el=document.getElementById('abUploadStatusV47');if(!el)return;el.textContent=text||'';el.className='ab-upload-status'+(kind?' '+kind:'');
  }
  function selectFile(file){
    const meta=document.getElementById('abUploadFileMetaV47'),send=document.getElementById('abUploadSendV47');status('');
    if(meta){meta.style.display='none';meta.textContent=''};
    if(!file){if(send)send.disabled=true;return;}
    if(file.size>MAX_BYTES){status('Fichier trop volumineux : 8 Mo maximum.','err');if(send)send.disabled=true;return;}
    if(meta){meta.style.display='block';meta.textContent='📎 '+file.name+' · '+sizeLabel(file.size)}
    if(send){send.disabled=false;send.textContent='Envoyer en arrière-plan'}
  }

  function ensureLaunchButton(){
    injectStyle();
    const grid=document.querySelector('#modal .form-grid');if(!grid)return;
    let host=document.getElementById('abDocLaunchV47');
    if(!host){host=document.createElement('div');host.id='abDocLaunchV47';host.innerHTML='<button id="abOpenUploadModalV47" type="button">📎&nbsp; Ajouter un document</button>';grid.appendChild(host);host.querySelector('button').onclick=()=>openUpload(String(typeof editId!=='undefined'?editId:''));}
    const editing=!!String(typeof editId!=='undefined'?editId:'');
    host.style.display=editing?'flex':'none';
    const old=document.getElementById('abEditUploadWrap');if(old)old.style.setProperty('display','none','important');
  }

  function openUpload(orderId){
    const order=orderById(orderId);if(!order)return;
    currentOrderId=String(order.id||'');
    const modal=ensureModal(),input=document.getElementById('abUploadFileV47');if(input)input.value='';selectFile(null);
    const sub=document.getElementById('abUploadSubV47');if(sub)sub.textContent=String(order.produit||order.chantier||'Commande');
    modal.classList.add('show');setTimeout(()=>modal.querySelector('.ab-upload-drop')?.focus(),30);
  }
  function closeUpload(){document.getElementById('abUploadModalV47')?.classList.remove('show');currentOrderId='';}

  function targetedJsonp(id){return new Promise((resolve,reject)=>{
    const cb='__abUploadV48_'+Date.now()+'_'+Math.random().toString(36).slice(2),s=document.createElement('script');let done=false;
    const clean=()=>{if(done)return;done=true;try{delete window[cb]}catch(_){window[cb]=undefined}s.remove()};
    const timer=setTimeout(()=>{clean();reject(new Error('Confirmation trop longue.'))},4500);
    window[cb]=data=>{clearTimeout(timer);clean();resolve(data)};s.onerror=()=>{clearTimeout(timer);clean();reject(new Error('Vérification impossible.'))};
    s.src=GAS+'?action=document&id='+encodeURIComponent(id)+'&callback='+encodeURIComponent(cb)+'&_='+Date.now();document.head.appendChild(s);
  });}
  async function findDoc(id){try{const r=await targetedJsonp(id);return r&&r.ok&&r.document&&String(r.document.id||'')===String(id)?r.document:null}catch(_){return null}}
  async function waitDoc(id){for(let i=0;i<6;i++){if(i)await new Promise(r=>setTimeout(r,650));const d=await findDoc(id);if(d)return d}return null}

  async function deleteOrphan(id){
    try{await fetch(GAS,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:new URLSearchParams({action:'document_delete',id:String(id||'')})});}catch(_){}
  }

  async function runJob(job){
    try{
      await yieldUi();
      let found=await findDoc(job.id);
      if(!found){
        const base64=await fileToBase64(job.file);
        await yieldUi();
        const payload={action:'document_upload',id:job.id,commande_id:job.orderId,chantier:job.chantier,type:fileType(job.file),file_name:job.fileName,nom_fichier:job.fileName,mime_type:String(job.file.type||'application/octet-stream'),file_base64:base64,source:'Google Drive'};
        await fetch(GAS,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(payload)});
        found=await waitDoc(job.id);
      }
      if(!found)throw new Error('Envoi non confirmé.');

      // Si l'opérateur a annulé entre-temps une commande brouillon, on ne laisse pas de document orphelin.
      if(!orderById(job.orderId)){
        await deleteOrphan(found.id);
        toast('Document annulé : la commande a été fermée.','err');
        return;
      }

      const list=docsList(),i=list.findIndex(d=>String(d.id||'')===String(found.id||''));if(i>=0)list[i]=found;else list.push(found);
      // Aucun renderAll ici : l'écran de l'opérateur ne doit jamais être reconstruit par l'envoi.
      toast('Document enregistré : '+job.fileName,'ok');
    }catch(err){
      console.error('AB COMMANDES V48 upload arrière-plan',err);
      toast('Échec document : '+job.fileName+' · '+(err?.message||'réessayer'),'err');
    }finally{
      jobs.delete(job.key);
    }
  }

  function startUpload(){
    const order=orderById(currentOrderId),input=document.getElementById('abUploadFileV47'),file=input?.files?.[0]||null;
    if(!order){status('Commande introuvable. Fermez puis recommencez.','err');return}
    if(!file){status('Choisissez un fichier.','err');return}
    if(file.size>MAX_BYTES){status('Fichier trop volumineux : 8 Mo maximum.','err');return}

    const key=[String(order.id||''),String(file.name||''),String(file.size||0),String(file.lastModified||0)].join('|');
    if(jobs.has(key)){
      toast('Ce document est déjà en cours d’envoi.');
      closeUpload();
      return;
    }

    const job={key,id:stableId(key),orderId:String(order.id||''),chantier:String(order.chantier||''),file,fileName:String(file.name||'fichier')};
    jobs.set(key,job);

    // Libération immédiate de l'interface : l'opérateur peut continuer à travailler.
    if(input)input.value='';
    closeUpload();
    toast('Envoi en arrière-plan : '+job.fileName);
    setTimeout(()=>runJob(job),0);
  }

  injectStyle();ensureModal();ensureLaunchButton();
  try{
    if(typeof openModal==='function'&&!openModal.__abDocUploadV48){const prev=openModal;openModal=async function(){const out=await prev.apply(this,arguments);ensureLaunchButton();requestAnimationFrame(ensureLaunchButton);setTimeout(ensureLaunchButton,80);return out};openModal.__abDocUploadV48=true;}
  }catch(e){console.error('AB COMMANDES V48 open modal',e)}
  try{
    if(typeof closeModal==='function'&&!closeModal.__abDocUploadV48){const prev=closeModal;closeModal=function(){document.getElementById('abUploadModalV47')?.classList.remove('show');currentOrderId='';return prev.apply(this,arguments)};closeModal.__abDocUploadV48=true;}
  }catch(e){}
  document.addEventListener('ab-commandes-modal-open',()=>{ensureLaunchButton();setTimeout(ensureLaunchButton,50)});
  window.__AB_COMMANDES_DOCUMENT_UPLOAD_MODAL_VERSION=VERSION;
})();
