(function(){
  'use strict';

  const VERSION='63.0';
  const STYLE_ID='ab-commandes-document-present-v63-style';

  function docs(){
    return (typeof documents!=='undefined'&&Array.isArray(documents))?documents:[];
  }

  function currentOrderId(){
    try{return String(typeof editId!=='undefined'&&editId?editId:'');}
    catch(_){return '';}
  }

  function realDocCount(orderId){
    const id=String(orderId||'');
    if(!id)return 0;
    return docs().filter(d=>
      String(d.commande_id||'')===id &&
      String(d.type||'').trim().toLowerCase()!=='lien web'
    ).length;
  }

  function injectStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      #modal #abEditDocBtn.ab-has-doc-v63{
        position:relative!important;
        border:2px solid #0f6b3e!important;
        background:#157347!important;
        color:#fff!important;
        box-shadow:0 0 0 2px rgba(21,115,71,.12),0 2px 5px rgba(20,70,45,.14)!important;
      }
      #modal #abEditDocBtn.ab-has-doc-v63:hover{
        background:#12633d!important;
        border-color:#0d5b35!important;
      }
      #modal #abEditDocBtn.ab-has-doc-v63::after{
        content:'✓';
        position:absolute;
        top:-7px;
        right:-7px;
        width:17px;
        height:17px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        background:#22a06b;
        color:#fff;
        border:2px solid #fff;
        font-size:10px;
        font-weight:900;
        line-height:1;
        box-shadow:0 1px 3px rgba(0,0,0,.18);
        pointer-events:none;
      }
    `;
    document.head.appendChild(s);
  }

  function refresh(){
    injectStyle();
    const btn=document.getElementById('abEditDocBtn');
    if(!btn)return;
    const count=realDocCount(currentOrderId());
    btn.classList.toggle('ab-has-doc-v63',count>0);
    btn.dataset.docCount=String(count);
    btn.title=count>0
      ? (count===1?'1 document présent · Ajouter ou gérer les documents':count+' documents présents · Ajouter ou gérer les documents')
      : 'Ajouter un document';
  }

  document.addEventListener('ab-commandes-modal-open',()=>{
    refresh();
    requestAnimationFrame(refresh);
    setTimeout(refresh,120);
  });

  setInterval(()=>{
    const modal=document.getElementById('modal');
    if(modal&&modal.classList.contains('show'))refresh();
  },700);

  injectStyle();
  refresh();
  window.__AB_COMMANDES_DOCUMENT_PRESENT_VERSION=VERSION;
})();
