(function(){
  'use strict';
  const params=new URL(window.location.href).searchParams;
  if(params.get('embed')!=='1')return;

  const DATA_CACHE_KEY='AB_COMMANDES_EMBED_CACHE_V2';
  const CACHE_MAX_AGE_MS=30*24*60*60*1000;

  document.documentElement.classList.add('ab-embed-mode');
  document.body.classList.add('ab-embed-mode');

  const style=document.createElement('style');
  style.id='ab-commandes-embed-style';
  style.textContent=`
    html.ab-embed-mode,body.ab-embed-mode{background:#fff!important;min-height:0!important}
    body.ab-embed-mode .app{display:block!important;min-height:0!important}
    body.ab-embed-mode .side{display:none!important}
    body.ab-embed-mode .main{padding:12px 14px 8px!important;max-width:none!important;margin:0!important}
    body.ab-embed-mode #chantierFiche{margin:0!important;padding-bottom:0!important}
    body.ab-embed-mode .fiche-back{display:none!important}
    body.ab-embed-mode #chantierFiche .yaya{display:none!important}
    body.ab-embed-mode #chantierFiche .top{margin:0 0 8px!important}
    body.ab-embed-mode #chantierFiche .title h1{font-size:23px!important}
    body.ab-embed-mode #chantierFiche .fiche-sub{margin-top:4px!important}
    body.ab-embed-mode .fiche-kpis{margin:14px 0!important;gap:10px!important}
    body.ab-embed-mode .kpi{padding:14px 16px!important;box-shadow:none!important}
    body.ab-embed-mode .status-dot{width:26px!important;height:26px!important}
    body.ab-embed-mode .kpi strong{font-size:26px!important}
    body.ab-embed-mode .kpi span{font-size:14px!important}
    body.ab-embed-mode .toolbar{margin:14px 0 10px!important}
    body.ab-embed-mode .toolbar h2{font-size:19px!important}
    body.ab-embed-mode .order-row{box-shadow:none!important}
    body.ab-embed-mode .empty{margin-bottom:0!important;padding:18px!important}
    @media(max-width:760px){
      body.ab-embed-mode .main{padding:9px 9px 4px!important}
      body.ab-embed-mode #chantierFiche .title h1{font-size:20px!important}
      body.ab-embed-mode .fiche-kpis{grid-template-columns:1fr 1fr!important}
    }
  `;
  document.head.appendChild(style);

  function saveSnapshot(){
    try{
      if(typeof orders==='undefined'||!Array.isArray(orders))return;
      const payload={
        version:2,
        savedAt:Date.now(),
        orders:orders,
        documents:(typeof documents!=='undefined'&&Array.isArray(documents))?documents:[]
      };
      localStorage.setItem(DATA_CACHE_KEY,JSON.stringify(payload));
    }catch(e){}
  }

  function hydrateSnapshot(){
    try{
      const raw=localStorage.getItem(DATA_CACHE_KEY);
      if(!raw)return false;
      const cached=JSON.parse(raw);
      if(!cached||!Array.isArray(cached.orders))return false;
      if(cached.savedAt&&Date.now()-Number(cached.savedAt)>CACHE_MAX_AGE_MS){
        localStorage.removeItem(DATA_CACHE_KEY);
        return false;
      }

      orders=cached.orders.map(function(o){
        try{return typeof normalizeFromSheet==='function'?normalizeFromSheet(o):o;}catch(e){return o;}
      });
      documents=Array.isArray(cached.documents)?cached.documents:[];

      if(typeof renderAll==='function')renderAll();
      if(typeof tryOpenDeepLink==='function')tryOpenDeepLink();
      try{window.parent.postMessage({type:'AB_COMMANDES_CACHE_READY',savedAt:Number(cached.savedAt)||0},'*');}catch(e){}
      return true;
    }catch(e){
      return false;
    }
  }

  try{
    if(typeof renderAll==='function'){
      const originalRenderAll=renderAll;
      renderAll=function(){
        const result=originalRenderAll.apply(this,arguments);
        saveSnapshot();
        return result;
      };
    }
  }catch(e){}

  const restoredFromCache=hydrateSnapshot();
  if(restoredFromCache){
    try{setSync(true,'Affichage local · mise à jour en arrière-plan…');}catch(e){}
  }

  function sendHeight(){
    try{
      const contentHeight=Math.max(
        document.body.scrollHeight||0,
        document.body.offsetHeight||0,
        document.documentElement.scrollHeight||0,
        document.documentElement.offsetHeight||0
      );
      const h=Math.max(120,Math.min(1400,contentHeight||260));
      window.parent.postMessage({type:'AB_COMMANDES_HEIGHT',height:h},'*');
    }catch(e){}
  }

  const ro=new ResizeObserver(()=>requestAnimationFrame(sendHeight));
  ro.observe(document.documentElement);
  ro.observe(document.body);
  window.addEventListener('load',sendHeight);
  window.addEventListener('resize',sendHeight);
  new MutationObserver(()=>requestAnimationFrame(sendHeight)).observe(document.body,{childList:true,subtree:true,attributes:true});
  setTimeout(sendHeight,50);
  setTimeout(sendHeight,180);
  setTimeout(sendHeight,500);
  setTimeout(sendHeight,1200);

  window.__AB_COMMANDES_EMBED_CACHE_VERSION='2.0';
})();
