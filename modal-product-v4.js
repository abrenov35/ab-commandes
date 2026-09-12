(function(){
  'use strict';

  const PRICE_STORE_KEY='AB_COMMANDES_ORDER_PRICES_V1';
  const IS_EMBED=new URL(window.location.href).searchParams.get('embed')==='1';
  const RESPONSABLES=['Solenn','Mathieu','Morvan','Pascale','Younès','Autre'];
  let saveBusy=false;

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
    if(document.getElementById('ab-product-modal-style-v5'))return;
    const s=document.createElement('style');
    s.id='ab-product-modal-style-v5';
    s.textContent=`
      #modal{
        background:rgba(31,45,66,.48)!important;
        backdrop-filter:blur(5px)!important;
        -webkit-backdrop-filter:blur(5px)!important;
        padding:14px!important;
      }
      #modal .dialog{
        width:min(610px,calc(100vw - 28px))!important;
        max-width:610px!important;
        max-height:none!important;
        overflow:visible!important;
        padding:20px 22px 18px!important;
        border:1px solid #d9e3ef!important;
        border-radius:20px!important;
        background:linear-gradient(180deg,#ffffff 0%,#fbfdff 100%)!important;
        box-shadow:0 24px 65px rgba(19,37,63,.24),0 5px 16px rgba(19,37,63,.10)!important;
        pointer-events:auto!important;
      }
      #modal #modalTitle{
        position:relative!important;
        display:flex!important;
        align-items:center!important;
        gap:11px!important;
        margin:0 0 15px!important;
        color:#132b4f!important;
        font-size:21px!important;
        font-weight:900!important;
        letter-spacing:-.02em!important;
        line-height:1.15!important;
      }
      #modal #modalTitle::before{
        content:'◇'!important;
        display:inline-grid!important;
        place-items:center!important;
        width:34px!important;
        height:34px!important;
        flex:0 0 34px!important;
        border-radius:10px!important;
        background:#e9f2ff!important;
        color:#2470df!important;
        font-size:22px!important;
        font-weight:900!important;
      }
      #modal .form-grid{
        display:grid!important;
        grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
        gap:10px 12px!important;
      }
      #modal .form-grid>div{min-width:0!important}
      #modal .form-grid>div:has(#fChantier),
      #modal .form-grid>div:has(#fNotes){grid-column:1/-1!important}
      #modal .label{
        display:block!important;
        margin:0 0 4px!important;
        color:#617491!important;
        font-size:10.5px!important;
        font-weight:800!important;
        line-height:1.15!important;
      }
      #modal .label .small{font-size:10px!important;color:#7c8da7!important}
      #modal .field,
      #modal select.field,
      #modal input.field,
      #modal textarea.field{
        width:100%!important;
        min-height:42px!important;
        padding:9px 11px!important;
        border:1px solid #d4dfed!important;
        border-radius:10px!important;
        background:#fff!important;
        color:#18304f!important;
        box-shadow:0 1px 2px rgba(22,45,73,.025)!important;
        font-size:13px!important;
        font-weight:600!important;
        outline:none!important;
        transition:border-color .15s ease,box-shadow .15s ease,background .15s ease!important;
      }
      #modal .field:focus,
      #modal select.field:focus,
      #modal input.field:focus,
      #modal textarea.field:focus{
        border-color:#7ca7e6!important;
        box-shadow:0 0 0 3px rgba(47,111,237,.10)!important;
      }
      #modal .field::placeholder{color:#9aa9bd!important;font-weight:500!important}
      #modal #fChantier.ab-locked-chantier{
        background:#f3f7fc!important;
        color:#17365f!important;
        opacity:1!important;
        cursor:default!important;
        pointer-events:none!important;
        -webkit-appearance:none!important;
        appearance:none!important;
        background-image:none!important;
        padding-left:14px!important;
        padding-right:12px!important;
        border-color:#d2deec!important;
        font-weight:850!important;
      }
      #modal #fChantier.ab-locked-chantier::-ms-expand{display:none!important}
      #modal #fPrix{font-variant-numeric:tabular-nums!important}
      #modal #fNotes{min-height:42px!important}
      #modal .dialog-actions{
        display:flex!important;
        align-items:center!important;
        gap:8px!important;
        flex-wrap:nowrap!important;
        margin-top:16px!important;
        padding-top:14px!important;
        border-top:1px solid #e7edf5!important;
      }
      #modal .dialog-actions .btn{
        min-height:40px!important;
        height:40px!important;
        padding:0 13px!important;
        border-radius:10px!important;
        box-shadow:none!important;
        font-size:12px!important;
        font-weight:800!important;
        white-space:nowrap!important;
      }
      #modal #abEditDeleteBtn{
        margin-right:auto!important;
        border:1px solid #f2b9c1!important;
        background:#fff5f6!important;
        color:#cf2945!important;
      }
      #modal #abEditDeleteBtn:hover{background:#ffedf0!important;border-color:#e99aa8!important}
      #modal #abEditDocBtn,
      #modal #cancelBtn{
        border:1px solid #d3deeb!important;
        background:#fff!important;
        color:#233b5b!important;
      }
      #modal #abEditDocBtn:hover,
      #modal #cancelBtn:hover{background:#f4f7fb!important;border-color:#b8c8da!important}
      #modal #saveBtn{
        border:1px solid #1757c9!important;
        background:linear-gradient(180deg,#2f78ef 0%,#195dce 100%)!important;
        color:#fff!important;
        box-shadow:0 7px 16px rgba(31,95,207,.20)!important;
        padding-left:16px!important;
        padding-right:16px!important;
      }
      #modal #saveBtn:hover{background:linear-gradient(180deg,#3881f6 0%,#1b62d8 100%)!important}
      #modal #saveBtn:disabled{opacity:.66!important;cursor:wait!important}
      @media(max-width:620px){
        #modal{padding:8px!important}
        #modal .dialog{width:calc(100vw - 16px)!important;padding:16px!important;border-radius:17px!important}
        #modal #modalTitle{font-size:18px!important;margin-bottom:12px!important}
        #modal #modalTitle::before{width:30px!important;height:30px!important;flex-basis:30px!important;font-size:19px!important}
        #modal .form-grid{gap:8px!important}
        #modal .field,#modal select.field,#modal input.field,#modal textarea.field{min-height:39px!important;font-size:12.5px!important;padding:8px 9px!important}
        #modal .dialog-actions{gap:6px!important;overflow-x:auto!important;padding-bottom:2px!important}
        #modal .dialog-actions .btn{min-height:37px!important;height:37px!important;padding:0 9px!important;font-size:10.5px!important}
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
    const qte=document.getElementById('fQte');
    const grid=(resp&&resp.closest('.form-grid'))||(qte&&qte.closest('.form-grid'));
    const anchor=resp&&resp.parentElement;
    if(grid&&box.parentElement!==grid){anchor?grid.insertBefore(box,anchor):grid.appendChild(box)}
    return input;
  }

  function premiumLayout(){
    ensureStyle();
    const chantier=document.getElementById('fChantier');
    const notes=document.getElementById('fNotes');
    if(chantier&&chantier.parentElement)chantier.parentElement.classList.add('ab-premium-full');
    if(notes&&notes.parentElement)notes.parentElement.classList.add('ab-premium-full');
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

  function installClosePolicy(){
    if(window.__AB_PRODUCT_MODAL_CLOSE_POLICY_V2)return;
    window.__AB_PRODUCT_MODAL_CLOSE_POLICY_V2=true;

    const blockOutside=e=>{
      const modal=document.getElementById('modal');
      if(!modal||!modal.classList.contains('show'))return;
      if(e.target===modal){
        e.preventDefault();
        e.stopPropagation();
        if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      }
    };
    document.addEventListener('pointerdown',blockOutside,true);
    document.addEventListener('click',blockOutside,true);
    document.addEventListener('keydown',e=>{
      const modal=document.getElementById('modal');
      if(e.key==='Escape'&&modal&&modal.classList.contains('show')){
        e.preventDefault();
        e.stopPropagation();
        if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      }
    },true);
  }

  try{
    if(typeof normalizeFromSheet==='function'&&!normalizeFromSheet.__abProductModalV5){
      const previous=normalizeFromSheet;
      const wrapped=function(o){
        const next=previous.apply(this,arguments)||{};
        const id=String(next.id||'');
        const remote=String(next.prix ?? '').trim();
        if(id&&remote)setPrice(id,remote);else if(id&&getPrice(id))next.prix=getPrice(id);
        next.responsable=cleanResp(next.responsable);
        return next;
      };
      wrapped.__abProductModalV5=true;normalizeFromSheet=wrapped;
    }
  }catch(e){console.error('AB COMMANDES modale produit normalize',e)}

  try{
    if(typeof saveOrder==='function'&&!saveOrder.__abProductModalV5){
      const previous=saveOrder;
      const wrapped=async function(obj){
        const next={...(obj||{})};const id=String(next.id||'');
        if(Object.prototype.hasOwnProperty.call(next,'prix'))setPrice(id,next.prix);else if(id&&getPrice(id))next.prix=getPrice(id);
        next.responsable=cleanResp(next.responsable);
        return previous.call(this,next);
      };
      wrapped.__abProductModalV5=true;saveOrder=wrapped;
    }
  }catch(e){console.error('AB COMMANDES modale produit save',e)}

  try{
    if(typeof openModal==='function'&&!openModal.__abProductModalV5){
      const previous=openModal;
      const wrapped=async function(id=null){
        premiumLayout();ensurePriceField();installClosePolicy();
        const out=await previous.apply(this,arguments);
        const order=id&&Array.isArray(orders)?orders.find(x=>String(x.id||'')===String(id)):null;
        const input=ensurePriceField();
        const value=(order&&order.prix!=null)?order.prix:getPrice(id);
        if(input)input.value=String(value ?? '');
        configureResp((order&&order.responsable)||document.getElementById('fResp')?.value||'Solenn');
        if(IS_EMBED||order)lockChantier();
        premiumLayout();
        return out;
      };
      wrapped.__abProductModalV5=true;openModal=wrapped;
    }
  }catch(e){console.error('AB COMMANDES modale produit open',e)}

  async function submitWithPrice(){
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
    if(!data.chantier||!data.produit){alert('Indique le produit.');return}
    if((status==='ordered'||status==='received')&&!fournisseur){alert('Le fournisseur est nécessaire quand la commande est commandée ou reçue.');return}

    const save=document.getElementById('saveBtn');
    saveBusy=true;
    if(save){save.disabled=true;save.textContent='Enregistrement…'}
    try{
      setPrice(data.id,prix);
      await saveOrder(data);
      if(typeof closeModal==='function')closeModal();
    }catch(e){
      console.error('AB COMMANDES modale produit save',e);
      if(save){save.textContent='Enregistrer';save.disabled=false}
    }finally{
      saveBusy=false;
    }
  }

  premiumLayout();ensurePriceField();configureResp(document.getElementById('fResp')?.value||'Solenn');installClosePolicy();
  try{submit=submitWithPrice;const save=document.getElementById('saveBtn');if(save)save.onclick=submitWithPrice}catch(e){console.error('AB COMMANDES modale produit submit',e)}
  window.__AB_COMMANDES_PRODUCT_MODAL_VERSION='5.0';
})();
