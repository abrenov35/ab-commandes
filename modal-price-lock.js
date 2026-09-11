(function(){
  'use strict';

  const PRICE_STORE_KEY='AB_COMMANDES_ORDER_PRICES_V1';
  const isEmbed=new URL(window.location.href).searchParams.get('embed')==='1';
  const RESPONSABLES=['Solenn','Mathieu','Morvan','Pascale','Younès','Autre'];
  let priceMap=readPriceMap();

  function readPriceMap(){
    try{
      const raw=localStorage.getItem(PRICE_STORE_KEY);
      const o=raw?JSON.parse(raw):{};
      return o&&typeof o==='object'&&!Array.isArray(o)?o:{};
    }catch(e){return {}}
  }
  function persistPriceMap(){try{localStorage.setItem(PRICE_STORE_KEY,JSON.stringify(priceMap))}catch(e){}}
  function getPrice(id){return String(priceMap[String(id||'')]??'')}
  function setPrice(id,value){
    id=String(id||'');
    if(!id)return;
    const v=String(value??'').trim();
    if(v)priceMap[id]=v;else delete priceMap[id];
    persistPriceMap();
  }

  function cleanResponsable(v){
    const s=String(v||'').trim();
    if(/^solenn/i.test(s))return 'Solenn';
    if(/^mathieu/i.test(s))return 'Mathieu';
    if(/^morvan/i.test(s))return 'Morvan';
    if(/^pascale/i.test(s))return 'Pascale';
    if(/^youn[eèé]s/i.test(s))return 'Younès';
    if(/^autre/i.test(s))return 'Autre';
    return s||'Solenn';
  }

  function ensureStyle(){
    if(document.getElementById('ab-product-modal-style-v3'))return;
    document.getElementById('ab-price-lock-style-v2')?.remove();
    document.getElementById('ab-price-lock-style')?.remove();
    const s=document.createElement('style');
    s.id='ab-product-modal-style-v3';
    s.textContent=`
      #fChantier.ab-locked-chantier{
        background:#f3f5f8!important;
        color:#24364f!important;
        opacity:1!important;
        cursor:default!important;
        pointer-events:none!important;
        -webkit-appearance:none!important;
        appearance:none!important;
        background-image:none!important;
        padding-right:12px!important;
        font-weight:800!important;
      }
      #fChantier.ab-locked-chantier::-ms-expand{display:none!important}
      #fPrix{font-variant-numeric:tabular-nums}
      #modal .dialog{pointer-events:auto!important}
    `;
    document.head.appendChild(s);
  }

  function ensurePriceField(){
    let input=document.getElementById('fPrix');
    let box=input?.parentElement||null;
    if(!box){
      box=document.createElement('div');
      box.id='abPrixWrap';
      box.innerHTML='<label class="label">Prix <span class="small">(facultatif)</span></label><input id="fPrix" class="field" inputmode="decimal" placeholder="Ex. 245 €">';
      input=box.querySelector('#fPrix');
    }
    const qte=document.getElementById('fQte');
    const resp=document.getElementById('fResp');
    const grid=resp?.closest('.form-grid')||qte?.closest('.form-grid');
    if(grid){
      const anchor=resp?.parentElement||qte?.parentElement?.nextElementSibling||null;
      if(anchor&&box!==anchor&&box.nextElementSibling!==anchor)grid.insertBefore(box,anchor);
      else if(!box.parentElement)grid.appendChild(box);
    }
    return input;
  }

  function lockChantier(locked){
    const field=document.getElementById('fChantier');
    if(!field)return;
    field.disabled=!!locked;
    field.tabIndex=locked?-1:0;
    field.classList.toggle('ab-locked-chantier',!!locked);
    field.setAttribute('aria-disabled',locked?'true':'false');
    const label=field.parentElement?.querySelector('.label');
    if(label)label.textContent='Chantier';
  }

  function configureResponsables(current){
    const field=document.getElementById('fResp');
    if(!field)return;
    const value=cleanResponsable(current||field.value);
    field.innerHTML=RESPONSABLES.map(x=>`<option value="${x}">${x}</option>`).join('');
    field.value=RESPONSABLES.includes(value)?value:'Autre';
  }

  function installBackdropGuard(){
    if(window.__AB_PRODUCT_MODAL_BACKDROP_GUARD_V3)return;
    window.__AB_PRODUCT_MODAL_BACKDROP_GUARD_V3=true;
    const guard=e=>{
      const modal=document.getElementById('modal');
      if(!modal||!modal.classList.contains('show'))return;
      if(e.target===modal){
        e.preventDefault();
        e.stopPropagation();
        if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
      }
    };
    document.addEventListener('pointerdown',guard,true);
    document.addEventListener('click',guard,true);
  }

  try{
    if(typeof normalizeFromSheet==='function'&&!normalizeFromSheet.__abProductModalV3){
      const previous=normalizeFromSheet;
      const wrapped=function(o){
        const next=previous.apply(this,arguments)||{};
        const id=String(next.id||'');
        const remote=String(next.prix??'').trim();
        if(id&&remote){if(getPrice(id)!==remote)setPrice(id,remote)}
        else if(id&&getPrice(id))next.prix=getPrice(id);
        next.responsable=cleanResponsable(next.responsable);
        return next;
      };
      wrapped.__abProductModalV3=true;
      normalizeFromSheet=wrapped;
    }
  }catch(e){console.error('AB COMMANDES modale produit normalize:',e)}

  try{
    if(typeof saveOrder==='function'&&!saveOrder.__abProductModalV3){
      const previous=saveOrder;
      const wrapped=async function(obj){
        const next={...(obj||{})};
        const id=String(next.id||'');
        if(Object.prototype.hasOwnProperty.call(next,'prix'))setPrice(id,next.prix);
        else if(id&&getPrice(id))next.prix=getPrice(id);
        next.responsable=cleanResponsable(next.responsable);
        return previous.call(this,next);
      };
      wrapped.__abProductModalV3=true;
      saveOrder=wrapped;
    }
  }catch(e){console.error('AB COMMANDES modale produit save:',e)}

  try{
    if(typeof openModal==='function'&&!openModal.__abProductModalV3){
      const previous=openModal;
      const wrapped=async function(id=null){
        ensureStyle();
        ensurePriceField();
        installBackdropGuard();
        const out=await previous.apply(this,arguments);
        const order=id&&Array.isArray(orders)?orders.find(x=>String(x.id||'')===String(id)):null;
        const input=ensurePriceField();
        if(input)input.value=String(order?.prix??getPrice(id)||'');
        configureResponsables(order?.responsable||document.getElementById('fResp')?.value||'Solenn');
        lockChantier(!!order||isEmbed);
        return out;
      };
      wrapped.__abProductModalV3=true;
      openModal=wrapped;
    }
  }catch(e){console.error('AB COMMANDES modale produit open:',e)}

  try{
    if(typeof closeModal==='function'&&!closeModal.__abProductModalV3){
      const previous=closeModal;
      const wrapped=function(){
        const out=previous.apply(this,arguments);
        lockChantier(false);
        return out;
      };
      wrapped.__abProductModalV3=true;
      closeModal=wrapped;
    }
  }catch(e){console.error('AB COMMANDES modale produit close:',e)}

  async function submitWithPrice(){
    const old=editId?orders.find(x=>x.id===editId):{};
    const chantierField=document.getElementById('fChantier');
    const chantierId=chantierField?.value||String(old?.chantierId||selectedChantierId||'');
    const yc=Array.isArray(yayaChantiers)?yayaChantiers.find(c=>String(c.id)===String(chantierId)):null;
    const chantier=yc?String(yc.nom||'').trim():String(old?.chantier||selectedChantierName||'').trim();
    const status=document.getElementById('fStatus')?.value||'choice';
    const fournisseur=(document.getElementById('fFournisseur')?.value||'').trim();
    const prix=(document.getElementById('fPrix')?.value||'').trim();
    const data={
      ...old,
      id:editId||uid(),
      chantierId,
      chantier,
      produit:(document.getElementById('fProduit')?.value||'').trim(),
      qte:(document.getElementById('fQte')?.value||'').trim(),
      prix,
      fournisseur,
      responsable:cleanResponsable(document.getElementById('fResp')?.value||''),
      status,
      notes:(document.getElementById('fNotes')?.value||'').trim()
    };
    if(!data.chantier||!data.produit){alert('Indique le produit.');return}
    if((status==='ordered'||status==='received')&&!fournisseur){alert('Le fournisseur est nécessaire quand la commande est commandée ou reçue.');return}
    setPrice(data.id,prix);
    closeModal();
    await saveOrder(data);
  }

  ensureStyle();
  ensurePriceField();
  configureResponsables(document.getElementById('fResp')?.value||'Solenn');
  installBackdropGuard();
  try{
    submit=submitWithPrice;
    const save=document.getElementById('saveBtn');
    if(save)save.onclick=submitWithPrice;
  }catch(e){console.error('AB COMMANDES modale produit submit:',e)}

  window.__AB_COMMANDES_MODAL_PRICE_LOCK_VERSION='3.0';
})();
