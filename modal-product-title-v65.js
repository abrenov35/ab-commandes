(function(){
  'use strict';

  const VERSION='65.0';

  function productName(id){
    const sid=String(id||'');
    if(!sid)return '';
    try{
      if(typeof orders!=='undefined'&&Array.isArray(orders)){
        const o=orders.find(x=>String(x.id||'')===sid);
        if(o&&String(o.produit||'').trim())return String(o.produit).trim();
      }
    }catch(_){}
    return String(document.getElementById('fProduit')?.value||'').trim();
  }

  function apply(id){
    const sid=String(id||'');
    if(!sid)return;
    const title=document.getElementById('modalTitle');
    if(!title)return;
    const name=productName(sid);
    if(name)title.textContent=name;
  }

  try{
    if(typeof openModal==='function'&&!openModal.__abProductTitleV65){
      const previous=openModal;
      const wrapped=async function(id=null){
        const out=await previous.apply(this,arguments);
        if(id){
          apply(id);
          requestAnimationFrame(()=>apply(id));
          setTimeout(()=>apply(id),180);
          setTimeout(()=>apply(id),320);
        }
        return out;
      };
      wrapped.__abProductTitleV65=true;
      openModal=wrapped;
    }
  }catch(err){console.error('AB COMMANDES V65 titre produit',err)}

  window.__AB_COMMANDES_PRODUCT_TITLE_VERSION='65.0';
})();
