(function(){
  'use strict';

  const PRICE_STORE_KEY='AB_COMMANDES_ORDER_PRICES_V1';
  const isEmbed=new URL(window.location.href).searchParams.get('embed')==='1';
  let priceMap=readPriceMap();

  function readPriceMap(){
    try{const raw=localStorage.getItem(PRICE_STORE_KEY);const o=raw?JSON.parse(raw):{};return o&&typeof o==='object'&&!Array.isArray(o)?o:{}}
    catch(e){return {}}
  }
  function persistPriceMap(){try{localStorage.setItem(PRICE_STORE_KEY,JSON.stringify(priceMap))}catch(e){}}
  function getPrice(id){return String(priceMap[String(id||'')]??'')}
  function setPrice(id,value){
    id=String(id||'');if(!id)return;
    const v=String(value??'').trim();
    if(v)priceMap[id]=v;else delete priceMap[id];
    persistPriceMap();
  }

  function ensureStyle(){
    if(document.getElementById('ab-price-lock-style'))return;
    const s=document.createElement('style');s.id='ab-price-lock-style';s.textContent=`
      #fChantier.ab-locked-chantier{background:#f4f6f9!important;color:#33445d!important;opacity:1!important;cursor:not-allowed!important}
      #fPrix{font-variant-numeric:tabular-nums}
    `;document.head.appendChild(s);
  }

  function ensurePriceField(){
    let input=document.getElementById('fPrix');if(input)return input;
    const qte=document.getElementById('fQte');
    if(!qte||!qte.parentElement)return null;
    const box=document.createElement('div');
    box.innerHTML='<label class="label">Prix <span class="small">(facultatif)</span></label><input id="fPrix" class="field" inputmode="decimal" placeholder="Ex. 245 €">';
    qte.parentElement.insertAdjacentElement('afterend',box);
    return box.querySelector('#fPrix');
  }

  function lockChantier(locked){
    const field=document.getElementById('fChantier');if(!field)return;
    field.disabled=!!locked;
    field.classList.toggle('ab-locked-chantier',!!locked);
    field.setAttribute('aria-disabled',locked?'true':'false');
  }

  /* Conserve le prix localement même tant que le web-app Apps Script n'a pas encore été redéployé. */
  try{
    if(typeof normalizeFromSheet==='function'&&!normalizeFromSheet.__abPriceWrapped){
      const previous=normalizeFromSheet;
      const wrapped=function(o){
        const next=previous.apply(this,arguments)||{};
        const id=String(next.id||'');
        const remote=String(next.prix??'').trim();
        if(id&&remote){if(getPrice(id)!==remote)setPrice(id,remote)}
        else if(id&&getPrice(id))next.prix=getPrice(id);
        return next;
      };
      wrapped.__abPriceWrapped=true;
      normalizeFromSheet=wrapped;
    }
  }catch(e){console.error('AB COMMANDES prix normalize:',e)}

  try{
    if(typeof saveOrder==='function'&&!saveOrder.__abPriceWrapped){
      const previous=saveOrder;
      const wrapped=async function(obj){
        let next={...(obj||{})};
        const id=String(next.id||'');
        if(Object.prototype.hasOwnProperty.call(next,'prix'))setPrice(id,next.prix);
        else if(id&&getPrice(id))next.prix=getPrice(id);
        return previous.call(this,next);
      };
      wrapped.__abPriceWrapped=true;
      saveOrder=wrapped;
    }
  }catch(e){console.error('AB COMMANDES prix save:',e)}

  try{
    if(typeof openModal==='function'&&!openModal.__abPriceLockWrapped){
      const previous=openModal;
      const wrapped=async function(id=null){
        ensurePriceField();
        const out=await previous.apply(this,arguments);
        const order=id&&Array.isArray(orders)?orders.find(x=>String(x.id||'')===String(id)):null;
        const input=ensurePriceField();
        if(input)input.value=String(order?.prix??getPrice(id)||'');
        /* En modification le chantier ne change jamais. Dans Yaya il est toujours imposé par la fiche ouverte. */
        lockChantier(!!order||isEmbed);
        return out;
      };
      wrapped.__abPriceLockWrapped=true;
      openModal=wrapped;
    }
  }catch(e){console.error('AB COMMANDES prix openModal:',e)}

  try{
    if(typeof closeModal==='function'&&!closeModal.__abPriceLockWrapped){
      const previous=closeModal;
      const wrapped=function(){const out=previous.apply(this,arguments);lockChantier(false);return out};
      wrapped.__abPriceLockWrapped=true;
      closeModal=wrapped;
    }
  }catch(e){console.error('AB COMMANDES prix closeModal:',e)}

  async function submitWithPrice(){
    const old=editId?orders.find(x=>x.id===editId):{};
    const chantierId=document.getElementById('fChantier')?.value||'';
    const yc=Array.isArray(yayaChantiers)?yayaChantiers.find(c=>String(c.id)===String(chantierId)):null;
    const chantier=yc?String(yc.nom||'').trim():String(old?.chantier||'').trim();
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
      responsable:document.getElementById('fResp')?.value||'',
      status,
      notes:(document.getElementById('fNotes')?.value||'').trim()
    };
    if(!data.chantierId||!data.chantier||!data.produit){alert('Choisis un chantier Yaya et indique le produit.');return}
    if((status==='ordered'||status==='received')&&!fournisseur){alert('Le fournisseur est nécessaire quand la commande est commandée ou reçue.');return}
    setPrice(data.id,prix);
    closeModal();
    await saveOrder(data);
  }

  ensureStyle();
  ensurePriceField();
  try{
    submit=submitWithPrice;
    const save=document.getElementById('saveBtn');if(save)save.onclick=submitWithPrice;
  }catch(e){console.error('AB COMMANDES prix submit:',e)}

  window.__AB_COMMANDES_MODAL_PRICE_LOCK_VERSION='1.0';
})();
