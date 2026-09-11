(function(){
  'use strict';

  /* AB_COMMANDES_TOPBAR_V38
     Mise en bandeau uniquement par CSS.
     Les clics restent gérés par embed-mode.js pour éviter les conflits de handlers. */
  const topbarStyle=document.createElement('style');
  topbarStyle.id='ab-commandes-topbar-v38-style';
  topbarStyle.textContent=`
    html,body{margin:0!important;padding:0!important}
    body:not(.ab-embed-mode) .app{
      display:block!important;
      min-height:0!important;
      height:auto!important;
    }
    body:not(.ab-embed-mode) .side{
      box-sizing:border-box!important;
      width:100%!important;
      height:46px!important;
      min-height:46px!important;
      max-height:46px!important;
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
      border-bottom:1px solid rgba(255,255,255,.16)!important;
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
      padding:0 12px 0 7px!important;
      border-right:1px solid rgba(255,255,255,.28)!important;
      font-weight:900!important;
    }
    body:not(.ab-embed-mode) .side .brand small,
    body:not(.ab-embed-mode) .side .sync{
      display:none!important;
    }
    body:not(.ab-embed-mode) .side .nav{
      min-width:0!important;
      height:46px!important;
      flex:1 1 auto!important;
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
      height:29px!important;
      min-height:29px!important;
      display:inline-flex!important;
      align-items:center!important;
      justify-content:center!important;
      white-space:nowrap!important;
      color:#fff!important;
      background:rgba(255,255,255,.07)!important;
      border:1px solid rgba(255,255,255,.36)!important;
      padding:0 11px!important;
      margin:0!important;
      border-radius:5px!important;
      font-size:12px!important;
      line-height:1!important;
      font-weight:800!important;
      box-shadow:none!important;
      cursor:pointer!important;
      pointer-events:auto!important;
    }
    body:not(.ab-embed-mode) .side .nav button:hover{
      background:rgba(255,255,255,.15)!important;
      color:#fff!important;
    }
    body:not(.ab-embed-mode) .side .nav button.active{
      background:rgba(255,255,255,.14)!important;
      color:#fff!important;
      border-color:rgba(255,255,255,.65)!important;
      box-shadow:inset 0 -2px 0 #f5c400!important;
    }
    body:not(.ab-embed-mode) .main{
      display:block!important;
      width:100%!important;
      max-width:1500px!important;
      min-height:0!important;
      margin:0 auto!important;
      padding:8px 12px 16px!important;
    }
    body:not(.ab-embed-mode) .view.active{
      margin-top:0!important;
      padding-top:0!important;
    }
    @media(max-width:760px){
      body:not(.ab-embed-mode) .side{
        height:42px!important;
        min-height:42px!important;
        max-height:42px!important;
        padding:0 6px!important;
        gap:6px!important;
      }
      body:not(.ab-embed-mode) .side .brand{
        font-size:11px!important;
        padding:0 8px 0 4px!important;
      }
      body:not(.ab-embed-mode) .side .nav{
        height:42px!important;
        gap:5px!important;
      }
      body:not(.ab-embed-mode) .side .nav button{
        height:27px!important;
        min-height:27px!important;
        padding:0 8px!important;
        font-size:11px!important;
      }
      body:not(.ab-embed-mode) .main{padding:7px 8px 12px!important}
    }
  `;
  document.head.appendChild(topbarStyle);

  const params=new URL(window.location.href).searchParams;
  if(params.get('embed')!=='1')return;

  const STYLE_ID='ab-commandes-embed-modal-fit-style';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      html.ab-embed-mode,body.ab-embed-mode{
        overflow:visible!important;
      }
      body.ab-embed-mode .modal{
        overflow:visible!important;
        align-items:flex-start!important;
        justify-content:center!important;
        padding:14px!important;
      }
      body.ab-embed-mode .modal.show{
        display:flex!important;
      }
      body.ab-embed-mode .modal .dialog{
        width:min(650px,calc(100% - 4px))!important;
        max-height:none!important;
        overflow:visible!important;
        margin:0 auto!important;
      }
      body.ab-embed-mode .dialog-actions{
        position:static!important;
        background:#fff!important;
      }
      @media(max-width:760px){
        body.ab-embed-mode .modal{padding:8px!important}
        body.ab-embed-mode .modal .dialog{
          width:100%!important;
          padding:16px!important;
          border-radius:12px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  let forcedHeight=0;
  let lastPostedHeight=0;

  function clearForcedHeight(){
    if(!forcedHeight)return;
    forcedHeight=0;
    document.body.style.removeProperty('min-height');
    document.documentElement.style.removeProperty('min-height');
  }

  function postHeight(height){
    const h=Math.max(120,Math.ceil(height));
    if(Math.abs(h-lastPostedHeight)<2)return;
    lastPostedHeight=h;
    try{
      window.parent.postMessage({type:'AB_COMMANDES_HEIGHT',height:h},'*');
    }catch(e){}
  }

  function fitModal(){
    const modal=document.querySelector('.modal.show');
    if(!modal){
      clearForcedHeight();
      requestAnimationFrame(()=>{
        const natural=Math.max(
          document.body.scrollHeight||0,
          document.body.offsetHeight||0,
          document.documentElement.scrollHeight||0,
          document.documentElement.offsetHeight||0
        );
        postHeight(natural+2);
      });
      return;
    }

    const dialog=modal.querySelector('.dialog');
    if(!dialog)return;

    requestAnimationFrame(()=>{
      const dialogHeight=Math.ceil(Math.max(dialog.scrollHeight||0,dialog.getBoundingClientRect().height||0));
      const needed=Math.max(420,dialogHeight+32);
      if(Math.abs(needed-forcedHeight)>=2){
        forcedHeight=needed;
        document.body.style.setProperty('min-height',needed+'px','important');
        document.documentElement.style.setProperty('min-height',needed+'px','important');
      }

      const natural=Math.max(
        document.body.scrollHeight||0,
        document.body.offsetHeight||0,
        document.documentElement.scrollHeight||0,
        document.documentElement.offsetHeight||0,
        needed
      );
      postHeight(natural+2);
    });
  }

  const observer=new MutationObserver(()=>fitModal());
  observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
  window.addEventListener('resize',fitModal);
  window.addEventListener('load',fitModal);
  setTimeout(fitModal,50);
  setTimeout(fitModal,250);

  window.__AB_COMMANDES_EMBED_MODAL_FIT_VERSION='1.3';
})();
