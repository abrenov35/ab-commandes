(function(){
  'use strict';

  const PRICE_STORE_KEY='AB_COMMANDES_ORDER_PRICES_V1';
  const IS_EMBED=new URL(window.location.href).searchParams.get('embed')==='1';
  const RESPONSABLES=['Solenn','Mathieu','Morvan','Pascale','Younès','Autre'];

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
    return s||'Solenn';
  }
  function ensureStyle(){
    if(document.getElementById('ab-product-modal-style-v4'))return;
    const s=document.createElement('style');
    s.id='ab-product-modal-style-v4';
    s.textContent=`
      #fChantier.ab-locked-chantier{background:#f3f5f8!important;color:#24364f!important;opacity:1!important;cursor:default!important;pointer-events:none!important;-webkit-appearance:none!important;appearance:none!important;background-image:none!important;padding-right:12px!important;font-weight:800!important}
      #fChantier.ab-locked-chantier::-ms-expand{display:none!important}
      #fPrix{font-variant-numeric:tabular-nums}
      #modal .dialog{pointer-events:auto!important}
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
    const qte=document.getElementById('fQte');
    const grid=(resp&&resp.closest('.form-grid'))||(qte&&qte.closest('.form-grid'));
    const anchor=resp&&resp.parentElement;
    if(grid&&box.parentElement!==grid){anchor?grid.insertBefore(box,anchor):grid.appendChild(box)}
    return input;
  }
  function lockChantier(){
    const f=document.getElementById('fChantier');if(!f)return;
    f.disabled=true;f.tabIndex=-1;f.classList.add('ab-locked-chantier');f.setAttribute('aria-disabled','true');
    const label=f.parentElement&&f.parentElement.querySelector('.label');if(label)label.textContent='Chantier';
  }
  function configureResp(current){
    const f=document.getElementById('fResp');if(!f)return;
    const value=cleanResp(current||f.value);
    f.innerHTML=RESPONSABLES.map(x=>'<option value="'+x+'">'+x+'</option>').join('');
    f.value=RESPONSABLES.includes(value)?value:'Autre';
  }
  function installBackdropGuard(){
    if(window.__AB_PRODUCT_MODAL_BACKDROP_GUARD_V4)return;
    window.__AB_PRODUCT_MODAL_BACKDROP_GUARD_V4=true;
    const guard=e=>{
      const modal=document.getElementById('modal');
      if(!modal||!modal.classList.contains('show')||e.target!==modal)return;
      e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    };
    document.addEventListener('pointerdown',guard,true);
    document.addEventListener('click',guard,true);
  }

  try{
    if(typeof normalizeFromSheet==='function'&&!normalizeFromSheet.__abProductModalV4){
      const previous=normalizeFromSheet;
      const wrapped=function(o){
        const next=previous.apply(this,arguments)||{};
        const id=String(next.id||'');
        const remote=String(next.prix ?? '').trim();
        if(id&&remote)setPrice(id,remote);else if(id&&getPrice(id))next.prix=getPrice(id);
        next.responsable=cleanResp(next.responsable);
        return next;
      };
      wrapped.__abProductModalV4=true;normalizeFromSheet=wrapped;
    }
  }catch(e){console.error('AB COMMANDES modale produit normalize',e)}

  try{
    if(typeof saveOrder==='function'&&!saveOrder.__abProductModalV4){
      const previous=saveOrder;
      const wrapped=async function(obj){
        const next={...(obj||{})};const id=String(next.id||'');
        if(Object.prototype.hasOwnProperty.call(next,'prix'))setPrice(id,next.prix);else if(id&&getPrice(id))next.prix=getPrice(id);
        next.responsable=cleanResp(next.responsable);
        return previous.call(this,next);
      };
      wrapped.__abProductModalV4=true;saveOrder=wrapped;
    }
  }catch(e){console.error('AB COMMANDES modale produit save',e)}

  try{
    if(typeof openModal==='function'&&!openModal.__abProductModalV4){
      const previous=openModal;
      const wrapped=async function(id=null){
        ensureStyle();ensurePriceField();installBackdropGuard();
        const out=await previous.apply(this,arguments);
        const order=id&&Array.isArray(orders)?orders.find(x=>String(x.id||'')===String(id)):null;
        const input=ensurePriceField();
        const value=(order&&order.prix!=null)?order.prix:getPrice(id);
        if(input)input.value=String(value ?? '');
        configureResp((order&&order.responsable)||document.getElementById('fResp')?.value||'Solenn');
        if(IS_EMBED||order)lockChantier();
        return out;
      };
      wrapped.__abProductModalV4=true;openModal=wrapped;
    }
  }catch(e){console.error('AB COMMANDES modale produit open',e)}

  async function submitWithPrice(){
    const old=editId?orders.find(x=>String(x.id)===String(editId)):{};
    const field=document.getElementById('fChantier');
    const chantierId=String((field&&field.value)||old?.chantierId||selectedChantierId||'');
    const yc=Array.isArray(yayaChantiers)?yayaChantiers.find(c=>String(c.id)===chantierId):null;
    const chantier=yc?String(yc.nom||'').trim():String(old?.chantier||selectedChantierName||'').trim();
    const status=document.getElementById('fStatus')?.value||'choice';
    const fournisseur=(document.getElementById('fFournisseur')?.value||'').trim();
    const prix=(document.getElementById('fPrix')?.value||'').trim();
    const data={...old,id:editId||uid(),chantierId,chantier,produit:(document.getElementById('fProduit')?.value||'').trim(),qte:(document.getElementById('fQte')?.value||'').trim(),prix,fournisseur,responsable:cleanResp(document.getElementById('fResp')?.value||''),status,notes:(document.getElementById('fNotes')?.value||'').trim()};
    if(!data.chantier||!data.produit){alert('Indique le produit.');return}
    if((status==='ordered'||status==='received')&&!fournisseur){alert('Le fournisseur est nécessaire quand la commande est commandée ou reçue.');return}
    setPrice(data.id,prix);closeModal();await saveOrder(data);
  }

  ensureStyle();ensurePriceField();configureResp(document.getElementById('fResp')?.value||'Solenn');installBackdropGuard();
  try{submit=submitWithPrice;const save=document.getElementById('saveBtn');if(save)save.onclick=submitWithPrice}catch(e){console.error('AB COMMANDES modale produit submit',e)}
  window.__AB_COMMANDES_PRODUCT_MODAL_VERSION='4.0';
})();
