(function(){
  'use strict';
  const params=new URL(window.location.href).searchParams;

  /* AB_COMMANDES_TOPBAR_V29 */
  const shellStyle=document.createElement('style');
  shellStyle.id='ab-commandes-topbar-v29-style';
  shellStyle.textContent=`
    @media(max-width:1150px){
      body:not(.ab-embed-mode) .app{display:block!important;min-height:0!important}
      body:not(.ab-embed-mode) .side{
        height:56px!important;
        min-height:56px!important;
        max-height:56px!important;
        padding:0 12px!important;
        position:sticky!important;
        top:0!important;
        z-index:40!important;
        display:block!important;
        overflow:hidden!important;
        background:var(--navy)!important;
        border:0!important;
        border-bottom:1px solid rgba(255,255,255,.12)!important;
        box-shadow:0 4px 16px rgba(20,33,61,.12)!important;
      }
      body:not(.ab-embed-mode) .side .brand,
      body:not(.ab-embed-mode) .side .sync{display:none!important}
      body:not(.ab-embed-mode) .side .nav{
        height:56px!important;
        display:flex!important;
        align-items:center!important;
        gap:6px!important;
        overflow-x:auto!important;
        overflow-y:hidden!important;
        scrollbar-width:none;
      }
      body:not(.ab-embed-mode) .side .nav::-webkit-scrollbar{display:none}
      body:not(.ab-embed-mode) .side .nav button{
        flex:0 0 auto!important;
        white-space:nowrap!important;
        color:rgba(255,255,255,.88)!important;
        background:transparent!important;
        padding:10px 13px!important;
        border-radius:9px!important;
      }
      body:not(.ab-embed-mode) .side .nav button:hover{background:rgba(255,255,255,.10)!important;color:#fff!important}
      body:not(.ab-embed-mode) .side .nav button.active{
        background:#fff!important;
        color:#1f5cc6!important;
        box-shadow:0 1px 5px rgba(0,0,0,.08)!important;
      }
      body:not(.ab-embed-mode) .main{
        padding:12px 18px 18px!important;
        margin:0 auto!important;
      }
      body:not(.ab-embed-mode) #chantierFiche .fiche-back{margin-top:0!important;margin-bottom:12px!important}
    }
    @media(max-width:760px){
      body:not(.ab-embed-mode) .side{height:52px!important;min-height:52px!important;max-height:52px!important;padding:0 8px!important}
      body:not(.ab-embed-mode) .side .nav{height:52px!important;gap:4px!important}
      body:not(.ab-embed-mode) .side .nav button{padding:9px 10px!important;font-size:13px!important}
      body:not(.ab-embed-mode) .main{padding:10px 9px 14px!important}
    }
  `;
  document.head.appendChild(shellStyle);

  if(params.get('embed')!=='1')return;

  const DATA_CACHE_KEY='AB_COMMANDES_EMBED_CACHE_V2';
  const CACHE_MAX_AGE_MS=30*24*60*60*1000;

  document.documentElement.classList.add('ab-embed-mode');
  document.body.classList.add('ab-embed-mode');

  const style=document.createElement('style');
  style.id='ab-commandes-embed-style';
  style.textContent=`
    html.ab-embed-mode,body.ab-embed-mode{background:#fff!important;min-height:0!important;overflow:hidden!important}
    body.ab-embed-mode .app{display:block!important;min-height:0!important}
    body.ab-embed-mode .side{display:none!important}
    body.ab-embed-mode .main{padding:8px 14px 8px!important;max-width:none!important;margin:0!important}
    body.ab-embed-mode #chantierFiche{margin:0!important;padding-bottom:0!important}
    body.ab-embed-mode .fiche-back{display:none!important}
    body.ab-embed-mode #chantierFiche .yaya{display:none!important}
    body.ab-embed-mode #chantierFiche .top{display:none!important}
    body.ab-embed-mode #chantierFiche .title{display:none!important}
    body.ab-embed-mode #chantierFiche .fiche-sub{display:none!important}
    body.ab-embed-mode .fiche-kpis{margin:0 0 14px!important;gap:7px!important;grid-template-columns:repeat(4,minmax(0,1fr))!important}
    body.ab-embed-mode .fiche-kpis .kpi{min-width:0!important;padding:11px 12px!important;gap:8px!important;box-shadow:none!important}
    body.ab-embed-mode .fiche-kpis .status-dot{width:21px!important;height:21px!important;flex:0 0 21px!important}
    body.ab-embed-mode .fiche-kpis .kpi strong{font-size:22px!important;line-height:1!important}
    body.ab-embed-mode .fiche-kpis .kpi span{font-size:11px!important;line-height:1.15!important}
    body.ab-embed-mode .toolbar{margin:12px 0 9px!important}
    body.ab-embed-mode .toolbar h2{font-size:18px!important}
    body.ab-embed-mode .order-row{box-shadow:none!important}
    body.ab-embed-mode .empty{margin-bottom:0!important;padding:18px!important}
    body.ab-embed-mode .ab-status-groups{gap:8px!important}
    body.ab-embed-mode .ab-status-section summary{padding:10px 12px!important}
    body.ab-embed-mode .ab-status-body{padding:0 8px 8px!important}
    @media(max-width:760px){
      body.ab-embed-mode .main{padding:7px 9px 4px!important}
      body.ab-embed-mode .fiche-kpis{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:4px!important}
      body.ab-embed-mode .fiche-kpis .kpi{padding:8px 6px!important;gap:5px!important}
      body.ab-embed-mode .fiche-kpis .status-dot{width:15px!important;height:15px!important;flex-basis:15px!important}
      body.ab-embed-mode .fiche-kpis .kpi strong{font-size:18px!important}
      body.ab-embed-mode .fiche-kpis .kpi span{font-size:9px!important}
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
      const h=Math.max(120,Math.ceil(contentHeight||260)+2);
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
  setTimeout(sendHeight,2200);

  window.__AB_COMMANDES_EMBED_CACHE_VERSION='2.4';
})();