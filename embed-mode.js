(function(){
  'use strict';
  const params=new URL(window.location.href).searchParams;
  if(params.get('embed')!=='1')return;

  document.documentElement.classList.add('ab-embed-mode');
  document.body.classList.add('ab-embed-mode');

  const style=document.createElement('style');
  style.id='ab-commandes-embed-style';
  style.textContent=`
    html.ab-embed-mode,body.ab-embed-mode{background:#fff!important;min-height:0!important}
    body.ab-embed-mode .app{display:block!important;min-height:0!important}
    body.ab-embed-mode .side{display:none!important}
    body.ab-embed-mode .main{padding:12px 14px 18px!important;max-width:none!important;margin:0!important}
    body.ab-embed-mode #chantierFiche{margin:0!important}
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
    @media(max-width:760px){
      body.ab-embed-mode .main{padding:9px!important}
      body.ab-embed-mode #chantierFiche .title h1{font-size:20px!important}
      body.ab-embed-mode .fiche-kpis{grid-template-columns:1fr 1fr!important}
    }
  `;
  document.head.appendChild(style);

  function sendHeight(){
    try{
      const h=Math.max(300,Math.min(1400,document.documentElement.scrollHeight||document.body.scrollHeight||600));
      window.parent.postMessage({type:'AB_COMMANDES_HEIGHT',height:h},'*');
    }catch(e){}
  }

  const ro=new ResizeObserver(()=>requestAnimationFrame(sendHeight));
  ro.observe(document.documentElement);
  window.addEventListener('load',sendHeight);
  window.addEventListener('resize',sendHeight);
  new MutationObserver(()=>requestAnimationFrame(sendHeight)).observe(document.body,{childList:true,subtree:true,attributes:true});
  setTimeout(sendHeight,150);
  setTimeout(sendHeight,700);
  setTimeout(sendHeight,1800);
})();
