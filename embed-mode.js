(function(){
  'use strict';
  const params=new URL(window.location.href).searchParams;

  /* AB_COMMANDES_TOPBAR_V31 */
  const shellStyle=document.createElement('style');
  shellStyle.id='ab-commandes-topbar-v31-style';
  shellStyle.textContent=`
    @media(max-width:1150px){
      html,body{margin:0!important;padding:0!important}
      body:not(.ab-embed-mode) .app{display:block!important;min-height:0!important;height:auto!important}
      body:not(.ab-embed-mode) .side{
        box-sizing:border-box!important;
        width:100%!important;
        height:42px!important;
        min-height:42px!important;
        max-height:42px!important;
        padding:0 8px!important;
        margin:0!important;
        position:sticky!important;
        top:0!important;
        left:0!important;
        z-index:100!important;
        display:flex!important;
        flex-direction:row!important;
        align-items:center!important;
        justify-content:flex-start!important;
        gap:8px!important;
        overflow:hidden!important;
        background:#123f6b!important;
        border:0!important;
        border-bottom:1px solid rgba(255,255,255,.14)!important;
        box-shadow:0 3px 12px rgba(20,33,61,.14)!important;
      }
      body:not(.ab-embed-mode) .side .brand{
        display:flex!important;
        align-items:center!important;
        align-self:stretch!important;
        flex:0 0 auto!important;
        color:#fff!important;
        font-size:13px!important;
        line-height:1!important;
        white-space:nowrap!important;
        margin:0!important;
        padding:0 11px 0 7px!important;
        border-right:1px solid rgba(255,255,255,.28)!important;
        font-weight:900!important;
      }
      body:not(.ab-embed-mode) .side .brand small{display:none!important}
      body:not(.ab-embed-mode) .side .sync{display:none!important}
      body:not(.ab-embed-mode) .side .nav{
        min-width:0!important;
        height:42px!important;
        flex:0 1 auto!important;
        display:flex!important;
        flex-direction:row!important;
        align-items:center!important;
        justify-content:flex-start!important;
        gap:7px!important;
        margin:0!important;
        padding:0!important;
        overflow-x:auto!important;
        overflow-y:hidden!important;
        scrollbar-width:none!important;
      }
      body:not(.ab-embed-mode) .side .nav::-webkit-scrollbar{display:none!important}
      body:not(.ab-embed-mode) .side .nav button{
        box-sizing:border-box!important;
        flex:0 0 auto!important;
        height:28px!important;
        min-height:28px!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        white-space:nowrap!important;
        color:#fff!important;
        background:rgba(255,255,255,.08)!important;
        border:1px solid rgba(255,255,255,.38)!important;
        padding:0 12px!important;
        margin:0!important;
        border-radius:5px!important;
        font-size:12px!important;
        line-height:1!important;
        font-weight:800!important;
        box-shadow:none!important;
      }
      body:not(.ab-embed-mode) .side .nav button:hover{background:rgba(255,255,255,.16)!important;color:#fff!important}
      body:not(.ab-embed-mode) .side .nav button.active{
        background:rgba(255,255,255,.13)!important;
        color:#fff!important;
        border-color:rgba(255,255,255,.65)!important;
        box-shadow:inset 0 -2px 0 #f5c400!important;
      }
      body:not(.ab-embed-mode) .main{
        display:block!important;
        padding:8px 12px 16px!important;
        margin:0 auto!important;
        max-width:1500px!important;
        min-height:0!important;
      }
      body:not(.ab-embed-mode) .view.active{margin-top:0!important;padding-top:0!important}
      body:not(.ab-embed-mode) #overview,
      body:not(.ab-embed-mode) #chantiers,
      body:not(.ab-embed-mode) #commandes,
      body:not(.ab-embed-mode) #chantierFiche{margin-top:0!important;padding-top:0!important}
      body:not(.ab-embed-mode) #overview>.top,
      body:not(.ab-embed-mode) #chantiers>.top,
      body:not(.ab-embed-mode) #commandes>.top,
      body:not(.ab-embed-mode) #chantierFiche>.top{margin-top:0!important;padding-top:0!important}
      body:not(.ab-embed-mode) #chantiers .ab-section-title{margin-top:12px!important}
      body:not(.ab-embed-mode) #chantiers .ab-active-grid{margin-top:8px!important}
      body:not(.ab-embed-mode) #chantierFiche .fiche-back{margin-top:0!important;margin-bottom:10px!important}
    }
    @media(max-width:760px){
      body:not(.ab-embed-mode) .side{
        height:40px!important;
        min-height:40px!important;
        max-height:40px!important;
        padding:0 6px!important;
        gap:6px!important;
      }
      body:not(.ab-embed-mode) .side .brand{font-size:11px!important;padding:0 8px 0 4px!important}
      body:not(.ab-embed-mode) .side .nav{height:40px!important;gap:5px!important}
      body:not(.ab-embed-mode) .side .nav button{height:27px!important;min-height:27px!important;padding:0 9px!important;font-size:11px!important}
      body:not(.ab-embed-mode) .main{padding:7px 8px 12px!important}
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
    body.ab-embed-mode #chantierFiche .order-row.header{display:none!important}
    body.ab-embed-mode .fiche-kpis{margin:0 0 14px!important;gap:7px!important;grid-template-columns:repeat(4,minmax(0,1fr))!important}
    body.ab-embed-mode .fiche-kpis .kpi{min-width:0!important;padding:11px 12px!important;gap:8px!important;box-shadow:none!important}
    body.ab-embed-mode .fiche-kpis .status-dot{width:21px!important;height:21px!important;flex:0 0 21px!important}
    body.ab-embed-mode .fiche-kpis .kpi strong{font-size:22px!important;line-height:1!important}
    body.ab-embed-mode .fiche-kpis .kpi span{font-size:11px!important;line-height:1.15!important}
    body.ab-embed-mode .toolbar{margin:12px 0 9px!important}
    body.ab-embed-mode .toolbar h2{font-size:18px!important}
    body.ab-embed-mode #chantierFiche .toolbar h2{font-size:0!important}
    body.ab-embed-mode #chantierFiche .toolbar h2::after{content:'État des commandes';font-size:18px!important;line-height:1.2!important}
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
      const payload={version:2,savedAt:Date.now(),orders:orders,documents:(typeof documents!=='undefined'&&Array.isArray(documents))?documents:[]};
      localStorage.setItem(DATA_CACHE_KEY,JSON.stringify(payload));
    }catch(e){}
  }

  function hydrateSnapshot(){
    try{
      const raw=localStorage.getItem(DATA_CACHE_KEY);
      if(!raw)return false;
      const cached=JSON.parse(raw);
      if(!cached||!Array.isArray(cached.orders))return false;
      if(cached.savedAt&&Date.now()-Number(cached.savedAt)>CACHE_MAX_AGE_MS){localStorage.removeItem(DATA_CACHE_KEY);return false;}
      orders=cached.orders.map(function(o){try{return typeof normalizeFromSheet==='function'?normalizeFromSheet(o):o;}catch(e){return o;}});
      documents=Array.isArray(cached.documents)?cached.documents:[];
      if(typeof renderAll==='function')renderAll();
      if(typeof tryOpenDeepLink==='function')tryOpenDeepLink();
      try{window.parent.postMessage({type:'AB_COMMANDES_CACHE_READY',savedAt:Number(cached.savedAt)||0},'*');}catch(e){}
      return true;
    }catch(e){return false;}
  }

  try{
    if(typeof renderAll==='function'){
      const originalRenderAll=renderAll;
      renderAll=function(){const result=originalRenderAll.apply(this,arguments);saveSnapshot();return result;};
    }
  }catch(e){}

  const restoredFromCache=hydrateSnapshot();
  if(restoredFromCache){try{setSync(true,'Affichage local · mise à jour en arrière-plan…');}catch(e){}}

  function sendHeight(){
    try{
      const contentHeight=Math.max(document.body.scrollHeight||0,document.body.offsetHeight||0,document.documentElement.scrollHeight||0,document.documentElement.offsetHeight||0);
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

  window.__AB_COMMANDES_EMBED_CACHE_VERSION='2.8';
})();