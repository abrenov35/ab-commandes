(function(){
  'use strict';

  if(typeof openModal!=='function'||openModal.__abProductTitleV61)return;

  const previous=openModal;
  const wrapped=async function(id=null){
    const out=await previous.apply(this,arguments);
    if(id){
      const order=(typeof orders!=='undefined'&&Array.isArray(orders))
        ? orders.find(x=>String(x.id||'')===String(id))
        : null;
      const produit=String(order?.produit||document.getElementById('fProduit')?.value||'').trim();
      const title=document.getElementById('modalTitle');
      if(title&&produit)title.textContent=produit;
      requestAnimationFrame(()=>{
        const current=String(document.getElementById('fProduit')?.value||produit).trim();
        const currentTitle=document.getElementById('modalTitle');
        if(currentTitle&&current)currentTitle.textContent=current;
      });
    }
    return out;
  };

  wrapped.__abProductTitleV61=true;
  openModal=wrapped;
  window.__AB_COMMANDES_PRODUCT_TITLE_VERSION='61.0';
})();
