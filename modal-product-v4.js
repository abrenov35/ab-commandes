(function(){
  'use strict';

  const PRICE_STORE_KEY='AB_COMMANDES_ORDER_PRICES_V1';
  const IS_EMBED=new URL(window.location.href).searchParams.get('embed')==='1';
  const RESPONSABLES=['','Solenn','Mathieu','Morvan','Pascale','Younès','Autre'];
  let saveBusy=false;
  let deleteArmTimer=null;

  function readPrices(){
    try{const raw=localStorage.getItem(PRICE_STORE_KEY);const o=raw?JSON.parse(raw):{};return o&&typeof o==='object'&&!Array.isArray(o)?o:{}}
    catch(_){return {}}
  }
  let prices=readPrices();
  function savePrices(){try{localStorage.setItem(PRICE_STORE_KEY,JSON.stringify(prices))}catch(_){}}
  function getPrice(id){return String(prices[String(id||'')] ?? '')}
  function setPrice(id,value){
    id=String(id||'');if(!id)return;
    const v=String(value ?? '').trim();
    if(v)prices[id]=v;else delete prices[id];
    savePrices();
  }
  function cleanResp(v){
    const s=String(v||'').trim();
    if(/^solenn/i.test(s))return 'Solenn';
    if(/^mathieu/i.test(s))return 'Mathieu';
    if(/^morvan/i.test(s))return 'Morvan';
    if(/^pascale/i.test(s))return 'Pascale';
    if(/^youn[eèé]s/i.test(s))return 'Younès';
    if(/^autre/i.test(s))return 'Autre';
    return s;
  }

  function ensureStyle(){
    document.getElementById('ab-product-modal-style-v5')?.remove();
    if(document.getElementById('ab-product-modal-style-v45'))return;
    const s=document.createElement('style');
    s.id='ab-product-modal-style-v45';
    s.textContent=`
      .order-row .del,.order-row .fiche-del{display:none!important}
      #modal{
        background:rgba(19,34,55,.52)!important;
        backdrop-filter:blur(6px)!important;
        -webkit-backdrop-filter:blur(6px)!important;
        padding:18px!important;
      }
      #modal .dialog{
        width:min(720px,calc(100vw - 36px))!important;
        max-width:720px!important;
        max-height:none!important;
        overflow:visible!important;
        padding:0!important;
        border:1px solid #d7e1ed!important;
        border-radius:18px!important;
        background:#fff!important;
        box-shadow:0 28px 80px rgba(15,34,60,.28),0 5px 18px rgba(15,34,60,.10)!important;
        pointer-events:auto!important;
      }
      #modal .ab-modal-head{
        padding:22px 24px 18px!important;
        border-bottom:1px solid #e7edf4!important;
        background:linear-gradient(180deg,#ffffff 0%,#f9fbfe 100%)!important;
        border-radius:18px 18px 0 0!important;
      }
      #modal #modalTitle{
        display:flex!important;
        align-items:center!important;
        gap:12px!important;
        margin:0!important;
        color:#102846!important;
        font-size:23px!important;
        font-weight:900!important;
        letter-spacing:-.02em!important;
        line-height:1.15!important;
      }
      #modal #modalTitle::before{
        content:'✓'!important;
        display:grid!important;
        place-items:center!important;
        width:38px!important;
        height:38px!important;
        flex:0 0 38px!important;
        border-radius:11px!important;
        background:#eaf2ff!important;
        color:#2166d1!important;
        font-size:18px!important;
        font-weight:900!important;
      }
      #modal .ab-modal-subtitle{
        margin:7px 0 0 50px!important;
        color:#6c7d94!important;
        font-size:12.5px!important;
        font-weight:600!important;
        line-height:1.45!important;
      }
      #modal .form-grid{
        display:grid!important;
        grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
        gap:14px 16px!important;
        padding:20px 24px 6px!important;
      }
      #modal .form-grid>div{min-width:0!important}
      #modal .form-grid>div:has(#fChantier),
      #modal .form-grid>div:has(#fProduit),
      #modal .form-grid>div:has(#fNotes),
      #modal #abEditUploadWrap,
      #modal .ab-modal-section{grid-column:1/-1!important}
      #modal .ab-modal-section{
        display:flex!important;
        align-items:center!important;
        gap:9px!important;
        margin:5px 0 -2px!important;
        color:#1d385a!important;
        font-size:12px!important;
        font-weight:900!important;
        letter-spacing:.02em!important;
        text-transform:uppercase!important;
      }
      #modal .ab-modal-section::after{
        content:''!important;
        height:1px!important;
        flex:1!important;
        background:#e8edf4!important;
      }
      #modal .label{
        display:block!important;
        margin:0 0 6px!important;
        color:#3e5573!important;
        font-size:12.5px!important;
        font-weight:800!important;
        line-height:1.2!important;
      }
      #modal .label .small{font-size:11px!important;color:#8290a4!important;font-weight:600!important}
      #modal .field,
      #modal select.field,
      #modal input.field,
      #modal textarea.field{
        width:100%!important;
        min-height:48px!important;
        padding:11px 13px!important;
        border:1px solid #cfd9e6!important;
        border-radius:10px!important;
        background:#fff!important;
        color:#172f4d!important;
        box-shadow:0 1px 2px rgba(18,43,76,.03)!important;
        font-size:14.5px!important;
        font-weight:650!important;
        outline:none!important;
        transition:border-color .15s ease,box-shadow .15s ease,background .15s ease!important;
      }
      #modal .field:hover{border-color:#bac8da!important}
      #modal .field:focus,
      #modal select.field:focus,
      #modal input.field:focus,
      #modal textarea.field:focus{
        border-color:#6596dc!important;
        box-shadow:0 0 0 4px rgba(47,111,237,.11)!important;
      }
      #modal .field::placeholder{color:#9aa8bb!important;font-weight:500!important}
      #modal #fChantier.ab-locked-chantier{
        background:#f3f6fa!important;
        color:#273f5e!important;
        opacity:1!important;
        cursor:default!important;
        pointer-events:none!important;
        -webkit-appearance:none!important;
        appearance:none!important;
        background-image:none!important;
        border-color:#d6e0eb!important;
        font-weight:800!important;
      }
      #modal #fPrix{font-variant-numeric:tabular-nums!important}
      #modal #fNotes{min-height:58px!important}
      #modal #abEditUploadWrap{
        margin-top:5px!important;
        padding:16px!important;
        border:1px solid #dbe4ef!important;
        border-radius:12px!important;
        background:#f8fafc!important;
      }
      #modal #abEditUploadWrap .ab-edit-upload-title{
        margin-bottom:9px!important;
        color:#203b5d!important;
        font-size:12.5px!important;
        font-weight:900!important;
      }
      #modal #abEditDriveDrop{
        min-height:80px!important;
        background:#fff!important;
        border-color:#c9d6e6!important;
      }
      #modal #abEditDriveDrop strong{font-size:13.5px!important;color:#173658!important}
      #modal #abEditUploadBtn{min-height:40px!important;border-radius:9px!important}
      #modal .ab-edit-doc-item{background:#fff!important}
      #modal .ab-edit-doc-del{
        min-width:auto!important;
        padding:7px 8px!important;
        border:0!important;
        background:transparent!important;
        color:#9a4050!important;
        box-shadow:none!important;
        font-size:0!important;
        font-weight:750!important;
      }
      #modal .ab-edit-doc-del::after{content:'Retirer';font-size:11px!important}
      #modal .ab-edit-doc-del:hover{background:#fff1f3!important;color:#c02a43!important}
      #modal .dialog-actions{
        display:flex!important;
        justify-content:flex-end!important;
        align-items:center!important;
        gap:10px!important;
        margin:14px 24px 0!important;
        padding:16px 0 18px!important;
        border-top:1px solid #e7edf4!important;
        background:#fff!important;
      }
      #modal .dialog-actions .btn{
        min-height:44px!important;
        height:44px!important;
        padding:0 17px!important;
        border-radius:10px!important;
        box-shadow:none!important;
        font-size:13px!important;
        font-weight:850!important;
        white-space:nowrap!important;
      }
      #modal #cancelBtn{
        border:1px solid #d3deeb!important;
        background:#fff!important;
        color:#304763!important;
      }
      #modal #cancelBtn:hover{background:#f5f7fa!important}
      #modal #saveBtn{
        min-width:150px!important;
        border:1px solid #1757c9!important;
        background:#2368d7!important;
        color:#fff!important;
        box-shadow:0 7px 18px rgba(35,104,215,.20)!important;
      }
      #modal #saveBtn:hover{background:#1d5fc9!important}
      #modal #saveBtn:disabled{opacity:.66!important;cursor:wait!important}
      #modal .ab-danger-zone{
        margin:0 24px 22px!important;
        padding:12px 14px!important;
        border:1px solid #f0d8dd!important;
        border-radius:11px!important;
        background:#fffafb!important;
      }
      #modal .ab-danger-row{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:16px!important}
      #modal .ab-danger-copy{min-width:0!important}
      #modal .ab-danger-copy strong{display:block!important;color:#7d3542!important;font-size:12px!important;margin-bottom:2px!important}
      #modal .ab-danger-copy span{display:block!important;color:#9b6b74!important;font-size:11px!important;line-height:1.35!important}
      #modal #abEditDeleteBtn{
        flex:0 0 auto!important;
        min-height:34px!important;
        padding:0 11px!important;
        border:1px solid #e4b9c1!important;
        border-radius:8px!important;
        background:#fff!important;
        color:#9e3347!important;
        box-shadow:none!important;
        font-size:11px!important;
        font-weight:800!important;
        cursor:pointer!important;
      }
      #modal #abEditDeleteBtn:hover{background:#fff0f2!important;border-color:#d994a0!important}
      #modal #abEditDeleteBtn.ab-armed{
        background:#c5304b!important;
        border-color:#c5304b!important;
        color:#fff!important;
      }
      #modal .ab-danger-msg{display:none!important;margin-top:8px!important;color:#b02f45!important;font-size:11px!important;font-weight:700!important}
      #modal .ab-danger-msg.show{display:block!important}
      @media(max-width:650px){
        #modal{padding:7px!important}
        #modal .dialog{width:calc(100vw - 14px)!important;border-radius:14px!important}
        #modal .ab-modal-head{padding:17px 16px 14px!important}
        #modal #modalTitle{font-size:19px!important}
        #modal #modalTitle::before{width:32px!important;height:32px!important;flex-basis:32px!important}
        #modal .ab-modal-subtitle{margin-left:44px!important;font-size:11.5px!important}
        #modal .form-grid{grid-template-columns:1fr!important;gap:11px!important;padding:16px 16px 4px!important}
        #modal .form-grid>div{grid-column:1!important}
        #modal .field,#modal select.field,#modal input.field,#modal textarea.field{min-height:46px!important;font-size:16px!important}
        #modal .dialog-actions{margin:12px 16px 0!important;padding:14px 0 16px!important}
        #modal .dialog-actions .btn{flex:1!important;min-width:0!important;padding:0 10px!important}
        #modal .ab-danger-zone{margin:0 16px 17px!important}
        #modal .ab-danger-row{align-items:flex-start!important;flex-direction:column!important}
      }
    `;
    document.head.appendChild(s);
  }

  function ensurePriceField(){
    let input=document.getElementById('fPrix');
    let box=input&&input.parentElement;
    if(!box){
      box=document.createElement('div');
      box.id='abPrixWrap';
      box.innerHTML='<label class="label">Prix <span class="small">(facultatif)</span></label><input id="fPrix" class="field" inputmode="decimal" placeholder="Ex. 245 €">';
      input=box.querySelector('#fPrix');
    }
    const resp=document.getElementById('fResp');
    const grid=resp&&resp.closest('.form-grid');
    const anchor=resp&&resp.parentElement;
    if(grid&&box.parentElement!==grid){anchor?grid.insertBefore(box,anchor):grid.appendChild(box)}
    return input;
  }

  function ensureHeader(){
    const dialog=document.querySelector('#modal .dialog');
    const title=document.getElementById('modalTitle');
    if(!dialog||!title)return;
    let head=dialog.querySelector('.ab-modal-head');
    if(!head){
      head=document.createElement('div');head.className='ab-modal-head';
      dialog.insertBefore(head,dialog.firstChild);
      head.appendChild(title);
      const sub=document.createElement('div');sub.className='ab-modal-subtitle';
      sub.textContent='Vérifiez les informations avant d’enregistrer. Ces données pilotent le suivi du chantier.';
      head.appendChild(sub);
    }
  }

  function section(title,key){
    const el=document.createElement('div');el.className='ab-modal-section';el.dataset.section=key;el.textContent=title;return el;
  }

  function wrapper(id){const el=document.getElementById(id);return el&&el.parentElement?el.parentElement:null}

  function arrangeFields(){
    const grid=document.querySelector('#modal .form-grid');if(!grid)return;
    ensurePriceField();
    grid.querySelectorAll('.ab-modal-section').forEach(x=>x.remove());
    const chantier=wrapper('fChantier'),produit=wrapper('fProduit'),fournisseur=wrapper('fFournisseur'),qte=wrapper('fQte'),prix=wrapper('fPrix'),resp=wrapper('fResp'),status=wrapper('fStatus'),notes=wrapper('fNotes');
    const upload=document.getElementById('abEditUploadWrap');
    const identification=section('Identification','identification');grid.appendChild(identification);
    if(chantier)grid.appendChild(chantier);if(produit)grid.appendChild(produit);
    const commande=section('Commande','commande');grid.appendChild(commande);
    if(fournisseur)grid.appendChild(fournisseur);if(qte)grid.appendChild(qte);if(prix)grid.appendChild(prix);
    const suivi=section('Suivi','suivi');grid.appendChild(suivi);
    if(resp)grid.appendChild(resp);if(status)grid.appendChild(status);if(notes)grid.appendChild(notes);
    if(upload)grid.appendChild(upload);

    const labels={fChantier:'Chantier',fProduit:'Produit / besoin à traiter',fFournisseur:'Fournisseur',fQte:'Quantité',fPrix:'Prix',fResp:'Responsable',fStatus:'Statut de suivi',fNotes:'Précision / note'};
    Object.entries(labels).forEach(([id,text])=>{const el=document.getElementById(id);const lab=el&&el.parentElement&&el.parentElement.querySelector('.label');if(lab)lab.textContent=text;});
    document.getElementById('fProduit')?.setAttribute('placeholder','Ex. Faïence salle de bain');
    document.getElementById('fFournisseur')?.setAttribute('placeholder','Ex. CDO');
    document.getElementById('fQte')?.setAttribute('placeholder','Ex. 28 m²');
    document.getElementById('fPrix')?.setAttribute('placeholder','Ex. 245 €');
    document.getElementById('fNotes')?.setAttribute('placeholder','Seulement si une précision est utile au suivi');
  }

  function lockChantier(){
    const f=document.getElementById('fChantier');if(!f)return;
    f.disabled=true;f.tabIndex=-1;f.classList.add('ab-locked-chantier');f.setAttribute('aria-disabled','true');
  }

  function configureResp(current){
    const f=document.getElementById('fResp');if(!f)return;
    const value=cleanResp(current||f.value);
    f.innerHTML=RESPONSABLES.map(x=>'<option value="'+x+'">'+x+'</option>').join('');
    f.value=RESPONSABLES.includes(value)?value:'Autre';
  }

  function resetDeleteArm(){
    if(deleteArmTimer){clearTimeout(deleteArmTimer);deleteArmTimer=null;}
    const btn=document.getElementById('abEditDeleteBtn');
    const msg=document.querySelector('#modal .ab-danger-msg');
    if(btn){btn.dataset.armed='0';btn.classList.remove('ab-armed');btn.textContent='Supprimer cette ligne';btn.disabled=false;}
    if(msg)msg.classList.remove('show');
  }

  function ensureDangerZone(editing){
    const dialog=document.querySelector('#modal .dialog');if(!dialog)return;
    let zone=dialog.querySelector('.ab-danger-zone');
    if(!zone){
      zone=document.createElement('div');zone.className='ab-danger-zone';
      zone.innerHTML='<div class="ab-danger-row"><div class="ab-danger-copy"><strong>Zone sensible</strong><span>La suppression est volontairement séparée des actions courantes.</span></div><button id="abEditDeleteBtn" type="button">Supprimer cette ligne</button></div><div class="ab-danger-msg">Cliquez une seconde fois pour confirmer la suppression définitive.</div>';
      dialog.appendChild(zone);
      const btn=zone.querySelector('#abEditDeleteBtn');
      btn.addEventListener('click',async()=>{
        const id=typeof editId!=='undefined'?String(editId||''):'';
        if(!id)return;
        if(btn.dataset.armed!=='1'){
          btn.dataset.armed='1';btn.classList.add('ab-armed');btn.textContent='Confirmer la suppression';
          zone.querySelector('.ab-danger-msg')?.classList.add('show');
          deleteArmTimer=setTimeout(resetDeleteArm,5000);
          return;
        }
        if(deleteArmTimer){clearTimeout(deleteArmTimer);deleteArmTimer=null;}
        btn.disabled=true;btn.textContent='Suppression…';
        try{
          delete prices[id];savePrices();
          if(typeof deleteOrder==='function')await deleteOrder(id);
          if(typeof closeModal==='function')closeModal();
        }catch(e){
          console.error('AB COMMANDES V45 suppression',e);
          resetDeleteArm();
        }
      });
    }
    zone.style.display=editing?'block':'none';
    resetDeleteArm();
  }

  function polishDocuments(){
    const wrap=document.getElementById('abEditUploadWrap');
    if(wrap){
      const title=wrap.querySelector('.ab-edit-upload-title');if(title)title.textContent='Documents associés';
      const strong=wrap.querySelector('#abEditDriveDrop strong');if(strong)strong.textContent='Ajouter un document';
      const span=wrap.querySelector('#abEditDriveDrop span');if(span)span.textContent='PDF, image, Word, Excel ou autre · 8 Mo maximum';
    }
  }

  function enhanceModal(editing){
    ensureStyle();ensureHeader();arrangeFields();ensureDangerZone(editing);polishDocuments();
    const title=document.getElementById('modalTitle');
    if(title)title.textContent=editing?'Modifier la commande':'Ajouter un produit / besoin';
    const save=document.getElementById('saveBtn');if(save&&!saveBusy)save.textContent='Enregistrer';
    const cancel=document.getElementById('cancelBtn');if(cancel)cancel.textContent='Annuler';
  }

  function installClosePolicy(){
    if(window.__AB_PRODUCT_MODAL_CLOSE_POLICY_V45)return;
    window.__AB_PRODUCT_MODAL_CLOSE_POLICY_V45=true;
    const blockOutside=e=>{
      const modal=document.getElementById('modal');
      if(!modal||!modal.classList.contains('show'))return;
      if(e.target===modal){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();}
    };
    document.addEventListener('pointerdown',blockOutside,true);
    document.addEventListener('click',blockOutside,true);
    document.addEventListener('keydown',e=>{
      const modal=document.getElementById('modal');
      if(e.key==='Escape'&&modal&&modal.classList.contains('show')){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();}
    },true);
  }

  try{
    if(typeof normalizeFromSheet==='function'&&!normalizeFromSheet.__abProductModalV45){
      const previous=normalizeFromSheet;
      const wrapped=function(o){
        const next=previous.apply(this,arguments)||{};
        const id=String(next.id||''),remote=String(next.prix ?? '').trim();
        if(id&&remote)setPrice(id,remote);else if(id&&getPrice(id))next.prix=getPrice(id);
        next.responsable=cleanResp(next.responsable);return next;
      };
      wrapped.__abProductModalV45=true;normalizeFromSheet=wrapped;
    }
  }catch(e){console.error('AB COMMANDES V45 normalize',e)}

  try{
    if(typeof saveOrder==='function'&&!saveOrder.__abProductModalV45){
      const previous=saveOrder;
      const wrapped=async function(obj){
        const next={...(obj||{})},id=String(next.id||'');
        if(Object.prototype.hasOwnProperty.call(next,'prix'))setPrice(id,next.prix);else if(id&&getPrice(id))next.prix=getPrice(id);
        next.responsable=cleanResp(next.responsable);return previous.call(this,next);
      };
      wrapped.__abProductModalV45=true;saveOrder=wrapped;
    }
  }catch(e){console.error('AB COMMANDES V45 save',e)}

  try{
    if(typeof openModal==='function'&&!openModal.__abProductModalV45){
      const previous=openModal;
      const wrapped=async function(id=null){
        ensureStyle();ensurePriceField();installClosePolicy();
        const out=await previous.apply(this,arguments);
        const order=id&&Array.isArray(orders)?orders.find(x=>String(x.id||'')===String(id)):null;
        const input=ensurePriceField();
        if(input)input.value=String((order&&order.prix!=null)?order.prix:getPrice(id));
        configureResp((order&&order.responsable)||document.getElementById('fResp')?.value||'');
        if(IS_EMBED||order)lockChantier();
        enhanceModal(!!order);
        requestAnimationFrame(()=>enhanceModal(!!order));
        setTimeout(()=>enhanceModal(!!order),120);
        return out;
      };
      wrapped.__abProductModalV45=true;openModal=wrapped;
    }
  }catch(e){console.error('AB COMMANDES V45 open',e)}

  try{
    if(typeof closeModal==='function'&&!closeModal.__abProductModalV45){
      const previous=closeModal;
      const wrapped=function(){resetDeleteArm();return previous.apply(this,arguments)};
      wrapped.__abProductModalV45=true;closeModal=wrapped;
    }
  }catch(e){}

  async function submitProfessional(){
    if(saveBusy)return;
    const old=editId?orders.find(x=>String(x.id)===String(editId)):{};
    const field=document.getElementById('fChantier');
    const chantierId=String((field&&field.value)||old?.chantierId||selectedChantierId||'');
    const yc=Array.isArray(yayaChantiers)?yayaChantiers.find(c=>String(c.id)===chantierId):null;
    const chantier=yc?String(yc.nom||'').trim():String(old?.chantier||selectedChantierName||'').trim();
    const status=document.getElementById('fStatus')?.value||'choice';
    const fournisseur=(document.getElementById('fFournisseur')?.value||'').trim();
    const prix=(document.getElementById('fPrix')?.value||'').trim();
    const data={...old,id:editId||uid(),chantierId,chantier,produit:(document.getElementById('fProduit')?.value||'').trim(),qte:(document.getElementById('fQte')?.value||'').trim(),prix,fournisseur,responsable:cleanResp(document.getElementById('fResp')?.value||''),status,notes:(document.getElementById('fNotes')?.value||'').trim()};
    if(!data.chantier||!data.produit){alert('Indique le produit / besoin à traiter.');document.getElementById('fProduit')?.focus();return}
    if((status==='ordered'||status==='received')&&!fournisseur){alert('Le fournisseur est nécessaire lorsque le statut est « Commandé » ou « Reçu ».');document.getElementById('fFournisseur')?.focus();return}
    const save=document.getElementById('saveBtn');
    saveBusy=true;if(save){save.disabled=true;save.textContent='Enregistrement…'}
    try{
      setPrice(data.id,prix);await saveOrder(data);if(typeof closeModal==='function')closeModal();
    }catch(e){
      console.error('AB COMMANDES V45 save',e);if(save){save.textContent='Enregistrer';save.disabled=false}
    }finally{saveBusy=false;}
  }

  ensureStyle();ensurePriceField();ensureHeader();arrangeFields();installClosePolicy();
  try{submit=submitProfessional;const save=document.getElementById('saveBtn');if(save)save.onclick=submitProfessional}catch(e){console.error('AB COMMANDES V45 submit',e)}
  window.__AB_COMMANDES_PRODUCT_MODAL_VERSION='45.0';
})();
