(function(){
  'use strict';

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

  window.__AB_COMMANDES_EMBED_MODAL_FIT_VERSION='1.1';
})();
