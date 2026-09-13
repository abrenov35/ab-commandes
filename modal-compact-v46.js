(function(){
  'use strict';

  const STYLE_ID='ab-commandes-modal-compact-v46-style';

  function injectStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      #modal{padding:8px!important;background:rgba(16,31,51,.62)!important;backdrop-filter:blur(5px)!important;-webkit-backdrop-filter:blur(5px)!important}
      #modal .dialog{width:min(690px,calc(100vw - 16px))!important;max-width:690px!important;max-height:calc(100vh - 12px)!important;overflow:hidden!important;border:1px solid #bfcddd!important;border-radius:15px!important;box-shadow:0 22px 58px rgba(9,24,43,.34)!important}
      #modal .ab-modal-head{padding:12px 18px 10px!important;border-bottom:1px solid #cfd9e5!important;background:#f7f9fc!important}
      #modal #modalTitle{font-size:20px!important;color:#102a4c!important;gap:9px!important}
      #modal #modalTitle::before{width:31px!important;height:31px!important;flex-basis:31px!important;border-radius:9px!important;font-size:15px!important;background:#e5efff!important;color:#135ec9!important}
      #modal .ab-modal-subtitle{margin:4px 0 0 40px!important;font-size:10.5px!important;line-height:1.25!important;color:#586c86!important}

      #modal .form-grid{grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:7px 12px!important;padding:10px 18px 2px!important}
      #modal .ab-modal-section{margin:1px 0 -1px!important;gap:8px!important;font-size:10.5px!important;line-height:1!important;color:#12385f!important;letter-spacing:.035em!important}
      #modal .ab-modal-section::after{background:#cfd9e5!important}
      #modal .label{margin:0 0 3px!important;font-size:11px!important;line-height:1.05!important;color:#1f3d5d!important;font-weight:850!important}
      #modal .label .small{font-size:9.5px!important;color:#687b92!important}
      #modal .field,#modal select.field,#modal input.field,#modal textarea.field{min-height:36px!important;height:36px!important;padding:6px 9px!important;border:1px solid #aebed1!important;border-radius:8px!important;background:#fff!important;color:#122f50!important;font-size:13px!important;font-weight:650!important;box-shadow:0 1px 2px rgba(18,43,76,.04)!important}
      #modal .field:hover{border-color:#8fa5bd!important}
      #modal .field:focus,#modal select.field:focus,#modal input.field:focus,#modal textarea.field:focus{border-color:#3d79c7!important;box-shadow:0 0 0 3px rgba(43,104,184,.14)!important}
      #modal #fNotes{min-height:36px!important;height:36px!important}

      #modal #abEditUploadWrap{margin-top:1px!important;padding:9px 10px 8px!important;border:1px solid #b9c8d9!important;border-radius:9px!important;background:#f2f6fa!important}
      #modal #abEditUploadWrap .ab-edit-upload-title{margin-bottom:5px!important;font-size:11px!important;color:#173a60!important}
      #modal #abEditDriveDrop{min-height:48px!important;padding:7px 10px!important;border:1px dashed #a7bad0!important;border-radius:8px!important;background:#fff!important}
      #modal #abEditDriveDrop strong{font-size:11.5px!important;color:#173a60!important;margin-bottom:1px!important}
      #modal #abEditDriveDrop span{font-size:9.5px!important;color:#687b92!important}
      #modal #abEditFileMeta{margin-top:4px!important;padding:5px 7px!important;font-size:10.5px!important}
      #modal #abEditUploadStatus{margin-top:4px!important;min-height:12px!important;font-size:10px!important}
      #modal #abEditUploadBtn{margin-top:5px!important;min-height:31px!important;height:31px!important;font-size:10.5px!important;border-radius:7px!important}
      #modal #abEditDocList{gap:4px!important;margin-top:5px!important}
      #modal .ab-edit-doc-item{padding:5px 7px!important;border-color:#c9d4e0!important;border-radius:7px!important}
      #modal .ab-edit-doc-item a{font-size:10.5px!important}
      #modal .ab-edit-doc-item .btn{min-height:28px!important;height:28px!important;padding:0 7px!important;font-size:9.5px!important}

      #modal .dialog-actions{margin:7px 18px 0!important;padding:8px 0 9px!important;gap:8px!important;border-top:1px solid #cfd9e5!important}
      #modal .dialog-actions .btn{min-height:35px!important;height:35px!important;padding:0 13px!important;border-radius:8px!important;font-size:11.5px!important}
      #modal #cancelBtn{border-color:#b9c7d7!important;color:#243f5d!important}
      #modal #saveBtn{min-width:130px!important;background:#164f91!important;border-color:#164f91!important;box-shadow:none!important}
      #modal #saveBtn:hover{background:#103f76!important}

      #modal .ab-danger-zone{margin:0 18px 8px!important;padding:0!important;border:0!important;background:transparent!important;border-radius:0!important}
      #modal .ab-danger-row{justify-content:flex-start!important;gap:0!important}
      #modal .ab-danger-copy{display:none!important}
      #modal #abEditDeleteBtn{min-height:27px!important;height:27px!important;padding:0 8px!important;border:0!important;background:transparent!important;color:#8d3d4b!important;font-size:9.5px!important;font-weight:750!important;opacity:.72!important}
      #modal #abEditDeleteBtn:hover{background:#fff0f2!important;color:#b5253f!important;opacity:1!important}
      #modal #abEditDeleteBtn.ab-armed{background:#b52740!important;color:#fff!important;opacity:1!important}
      #modal .ab-danger-msg{margin-top:4px!important;font-size:9.5px!important}

      @media(max-width:650px){
        #modal{padding:4px!important}
        #modal .dialog{width:calc(100vw - 8px)!important;max-height:calc(100vh - 8px)!important;border-radius:12px!important}
        #modal .ab-modal-head{padding:10px 12px 8px!important}
        #modal #modalTitle{font-size:17px!important}
        #modal #modalTitle::before{width:28px!important;height:28px!important;flex-basis:28px!important}
        #modal .ab-modal-subtitle{margin-left:37px!important;font-size:9.5px!important}
        #modal .form-grid{grid-template-columns:1fr 1fr!important;gap:6px 8px!important;padding:8px 12px 2px!important}
        #modal .form-grid>div:has(#fProduit),#modal .form-grid>div:has(#fNotes),#modal #abEditUploadWrap,#modal .ab-modal-section{grid-column:1/-1!important}
        #modal .field,#modal select.field,#modal input.field,#modal textarea.field{min-height:34px!important;height:34px!important;padding:5px 7px!important;font-size:12px!important}
        #modal .label{font-size:10px!important}
        #modal #abEditDriveDrop{min-height:44px!important}
        #modal .dialog-actions{margin:6px 12px 0!important;padding:7px 0 8px!important}
        #modal .dialog-actions .btn{min-height:33px!important;height:33px!important;font-size:10.5px!important}
        #modal .ab-danger-zone{margin:0 12px 6px!important}
      }
    `;
    document.head.appendChild(s);
  }

  function tidyDanger(){
    const zone=document.querySelector('#modal .ab-danger-zone');
    if(!zone)return;
    const copy=zone.querySelector('.ab-danger-copy');
    if(copy)copy.remove();
    const btn=document.getElementById('abEditDeleteBtn');
    if(btn&&!btn.classList.contains('ab-armed'))btn.textContent='Supprimer la commande';
    if(btn)btn.setAttribute('title','Suppression protégée : une confirmation supplémentaire sera demandée');
  }

  function fitDialog(){
    injectStyle();
    tidyDanger();
    const dialog=document.querySelector('#modal.show .dialog');
    if(!dialog)return;
    const max=Math.max(440,window.innerHeight-12);
    dialog.style.setProperty('max-height',max+'px','important');
  }

  injectStyle();
  document.addEventListener('ab-commandes-modal-open',()=>{requestAnimationFrame(fitDialog);setTimeout(fitDialog,50)});
  document.addEventListener('click',e=>{if(e.target&&e.target.id==='abEditDeleteBtn')setTimeout(tidyDanger,0)},true);
  window.addEventListener('resize',fitDialog);
  window.addEventListener('load',()=>{tidyDanger();fitDialog();},{once:true});
  setTimeout(()=>{tidyDanger();fitDialog();},100);

  window.__AB_COMMANDES_MODAL_COMPACT_VERSION='46.0';
})();
