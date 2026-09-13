(function(){
  'use strict';

  const params=new URL(window.location.href).searchParams;
  if(params.get('embed')!=='1')return;

  const STYLE_ID='ab-commandes-order-row-details-style-v3';
  const CONFIRM_ID='abDeleteProductConfirm';
  let activeEditId='';
  let scheduled=false;

  function e(v){
    try{return typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
    catch(_){return String(v??'')}
  }

  function getOrders(){return (typeof orders!=='undefined'&&Array.isArray(orders))?orders:[]}
  function getOrder(id){return getOrders().find(x=>String(x.id||'')===String(id||''))||null}

  function injectStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      body.ab-embed-mode #chantierFiche .fiche-orders .order-row.ab-row-simple{
        display:grid!important;
        grid-template-columns:minmax(190px,1.7fr) minmax(105px,.75fr) minmax(160px,1fr) 74px!important;
        gap:10px!important;align-items:center!important;padding:10px 12px!important;
      }
      body.ab-embed-mode #chantierFiche .ab-order-label{
        appearance:none!important;border:0!important;background:transparent!important;padding:0!important;margin:0!important;
        text-align:left!important;color:var(--text)!important;font-weight:900!important;line-height:1.2!important;cursor:pointer!important;
      }
      body.ab-embed-mode #chantierFiche .ab-order-label:hover,
      body.ab-embed-mode #chantierFiche .ab-order-label:focus-visible{
        color:#1f5cc6!important;text-decoration:underline!important;
      }
      body.ab-embed-mode #chantierFiche .ab-order-resp{
        font-weight:700!important;color:#24364f!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;
      }
      body.ab-embed-mode #chantierFiche .ab-order-doc{display:flex!important;justify-content:flex-end!important}
      body.ab-embed-mode #chantierFiche .ab-order-doc .doc-btn{min-width:46px!important;padding:8px 10px!important}
      body.ab-embed-mode #chantierFiche .ab-row-simple .status-select{min-width:0!important;width:100%!important}

      body.ab-embed-mode #modal .dialog-actions{flex-wrap:wrap!important}
      body.ab-embed-mode #abEditDeleteBtn{margin-right:auto!important}
      body.ab-embed-mode #abEditDeleteBtn,
      body.ab-embed-mode #abEditDocBtn{display:none}
      body.ab-embed-mode #abEditDeleteBtn.ab-visible,
      body.ab-embed-mode #abEditDocBtn.ab-visible{display:inline-flex!important;align-items:center!important;justify-content:center!important}

      #${CONFIRM_ID}{
        position:absolute!important;left:0!important;right:0!important;z-index:99999!important;
        display:none!important;align-items:center!important;justify-content:center!important;
        padding:18px!important;background:rgba(14,28,48,.42)!important;
        backdrop-filter:blur(5px)!important;-webkit-backdrop-filter:blur(5px)!important;
        overflow:hidden!important;
      }
      #${CONFIRM_ID}.show{display:flex!important}
      #${CONFIRM_ID} .ab-confirm-card{
        width:min(430px,calc(100vw - 32px))!important;
        padding:24px!important;border:1px solid #e4eaf1!important;border-radius:20px!important;
        background:#fff!important;box-shadow:0 24px 70px rgba(18,38,63,.28)!important;
        text-align:center!important;
      }
      #${CONFIRM_ID} .ab-confirm-icon{
        width:46px!important;height:46px!important;margin:0 auto 13px!important;border-radius:14px!important;
        display:grid!important;place-items:center!important;background:#fff1f3!important;color:#c9344f!important;
        font-size:23px!important;font-weight:900!important;
      }
      #${CONFIRM_ID} .ab-confirm-title{
        margin:0!important;color:#172b49!important;font-size:20px!important;font-weight:900!important;line-height:1.2!important;
      }
      #${CONFIRM_ID} .ab-confirm-text{
        margin:9px 0 20px!important;color:#6f7f95!important;font-size:13px!important;font-weight:600!important;line-height:1.45!important;
      }
      #${CONFIRM_ID} .ab-confirm-actions{display:flex!important;justify-content:center!important;gap:10px!important}
      #${CONFIRM_ID} button{
        min-width:112px!important;height:42px!important;border-radius:11px!important;padding:0 16px!important;
        font-size:13px!important;font-weight:850!important;cursor:pointer!important;
      }
      #${CONFIRM_ID} .ab-confirm-cancel{border:1px solid #d5dfea!important;background:#fff!important;color:#2d405d!important}
      #${CONFIRM_ID} .ab-confirm-delete{border:1px solid #e9a9b5!important;background:#fff0f2!important;color:#c72c48!important}
      #${CONFIRM_ID} .ab-confirm-delete:hover{background:#ffe5e9!important}

      @media(max-width:620px){
        body.ab-embed-mode #chantierFiche .fiche-orders .order-row.ab-row-simple{
          grid-template-columns:minmax(130px,1.45fr) minmax(82px,.7fr) minmax(120px,1fr) 52px!important;
          gap:6px!important;padding:9px 7px!important;
        }
        body.ab-embed-mode #chantierFiche .ab-order-label{font-size:12px!important}
        body.ab-embed-mode #chantierFiche .ab-order-resp{font-size:11px!important}
        body.ab-embed-mode #chantierFiche .ab-row-simple .status-select{font-size:11px!important;padding:7px 5px!important}
        body.ab-embed-mode #chantierFiche .ab-order-doc .doc-btn{min-width:40px!important;padding:7px 5px!important;font-size:11px!important}
        body.ab-embed-mode #modal .dialog-actions{gap:6px!important}
        body.ab-embed-mode #modal .dialog-actions .btn{padding:7px 9px!important;font-size:11px!important}
        #${CONFIRM_ID} .ab-confirm-card{padding:21px 17px!important;border-radius:17px!important}
        #${CONFIRM_ID} .ab-confirm-title{font-size:18px!important}
        #${CONFIRM_ID} .ab-confirm-actions{gap:8px!important}
        #${CONFIRM_ID} button{min-width:0!important;flex:1!important}
      }
    `;
    document.head.appendChild(style);
  }

  function positionConfirmOverlay(overlay){
    if(!overlay)return;
    let top=0;
    let height=Math.max(260,window.innerHeight||600);
    try{
      const frame=window.frameElement;
      if(frame&&window.parent&&window.parent!==window){
        const rect=frame.getBoundingClientRect();
        const parentH=Math.max(260,window.parent.innerHeight||height);
        const visibleTop=Math.max(0,-rect.top);
        const visibleBottom=Math.min(rect.height,parentH-rect.top);
        const visibleH=Math.max(260,visibleBottom-visibleTop);
        top=visibleTop;
        height=visibleH;
      }
    }catch(_){ }
    overlay.style.setProperty('top',Math.round(top)+'px','important');
    overlay.style.setProperty('height',Math.round(height)+'px','important');
    overlay.style.setProperty('bottom','auto','important');
  }

  function customDeleteConfirm(){
    let overlay=document.getElementById(CONFIRM_ID);
    if(!overlay){
      overlay=document.createElement('div');
      overlay.id=CONFIRM_ID;
      overlay.setAttribute('role','dialog');
      overlay.setAttribute('aria-modal','true');
      overlay.setAttribute('aria-labelledby','abDeleteConfirmTitle');
      overlay.innerHTML=`
        <div class="ab-confirm-card">
          <div class="ab-confirm-icon">×</div>
          <h3 id="abDeleteConfirmTitle" class="ab-confirm-title">Supprimer ce produit ?</h3>
          <p class="ab-confirm-text">Cette action supprimera le produit de la commande.</p>
          <div class="ab-confirm-actions">
            <button type="button" class="ab-confirm-cancel">Annuler</button>
            <button type="button" class="ab-confirm-delete">Supprimer</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
    }

    return new Promise(resolve=>{
      const cancel=overlay.querySelector('.ab-confirm-cancel');
      const del=overlay.querySelector('.ab-confirm-delete');
      let done=false;
      const reposition=()=>positionConfirmOverlay(overlay);
      const finish=value=>{
        if(done)return;done=true;
        overlay.classList.remove('show');
        cancel.onclick=null;del.onclick=null;overlay.onclick=null;
        document.removeEventListener('keydown',onKey,true);
        window.removeEventListener('resize',reposition);
        try{window.parent.removeEventListener('scroll',reposition,true);window.parent.removeEventListener('resize',reposition)}catch(_){ }
        resolve(value);
      };
      const onKey=ev=>{if(ev.key==='Escape'){ev.preventDefault();finish(false)}};
      cancel.onclick=()=>finish(false);
      del.onclick=()=>finish(true);
      overlay.onclick=ev=>{if(ev.target===overlay)finish(false)};
      document.addEventListener('keydown',onKey,true);
      window.addEventListener('resize',reposition);
      try{window.parent.addEventListener('scroll',reposition,true);window.parent.addEventListener('resize',reposition)}catch(_){ }
      positionConfirmOverlay(overlay);
      overlay.classList.add('show');
      requestAnimationFrame(reposition);
      setTimeout(()=>{reposition();cancel.focus()},0);
    });
  }

  function removeLegacyReadModal(){
    const old=document.getElementById('abOrderReadModal');
    if(old)old.remove();
  }

  function ensureEditButtons(){
    const actions=document.querySelector('#modal .dialog-actions');
    if(!actions)return null;

    let del=document.getElementById('abEditDeleteBtn');
    if(!del){
      del=document.createElement('button');
      del.id='abEditDeleteBtn';
      del.type='button';
      del.className='btn red';
      del.textContent='Supprimer';
      actions.prepend(del);
    }

    let doc=document.getElementById('abEditDocBtn');
    if(!doc){
      doc=document.createElement('button');
      doc.id='abEditDocBtn';
      doc.type='button';
      doc.className='btn secondary';
      doc.textContent='📎 Ajouter un document';
      if(del.nextSibling)actions.insertBefore(doc,del.nextSibling);else actions.appendChild(doc);
    }

    del.onclick=async()=>{
      const id=String(activeEditId||'');
      if(!id||!getOrder(id))return;
      if(!await customDeleteConfirm())return;
      try{
        if(typeof closeModal==='function')closeModal();
        activeEditId='';
        if(typeof deleteOrder==='function')await deleteOrder(id);
      }catch(err){console.error('Suppression commande:',err)}
    };

    doc.onclick=()=>{
      const id=String(activeEditId||'');
      if(!id||!getOrder(id))return;
      try{
        if(typeof closeModal==='function')closeModal();
        setTimeout(()=>{if(typeof openDocs==='function')openDocs(id)},0);
      }catch(err){console.error('Ouverture document:',err)}
    };

    return {del,doc};
  }

  function updateEditButtons(id){
    activeEditId=String(id||'');
    const buttons=ensureEditButtons();
    if(!buttons)return;
    const editing=!!activeEditId&&!!getOrder(activeEditId);
    buttons.del.classList.toggle('ab-visible',editing);
    buttons.doc.classList.toggle('ab-visible',editing);
  }

  function openEditModal(id){
    if(typeof openModal!=='function')return;
    openModal(String(id||''));
  }

  function rowId(row){return String(row?.dataset?.id||row?.dataset?.ficheId||'')}

  function transformRow(row){
    if(!row||row.classList.contains('header'))return;
    const id=rowId(row);if(!id)return;
    const o=getOrder(id);if(!o)return;
    const n=typeof docCount==='function'?docCount(o.id):0;

    row.dataset.abSimpleRow='1';
    row.classList.add('ab-row-simple');
    row.innerHTML=`
      <div><button type="button" class="ab-order-label" data-ab-edit-id="${e(o.id)}" title="Modifier ce produit">${e(o.produit||'—')}</button></div>
      <div class="ab-order-resp">${e(o.responsable||'—')}</div>
      <div><select class="status-select ab-simple-status" data-ab-status-id="${e(o.id)}">${Object.entries(STATUSES).map(([k,s])=>`<option value="${e(k)}" ${o.status===k?'selected':''}>${e(s.label)}</option>`).join('')}</select></div>
      <div class="ab-order-doc"><button type="button" class="doc-btn ${n?'has':''}" data-ab-doc-id="${e(o.id)}" title="Documents">📄${n?' '+n:''}</button></div>`;

    row.querySelector('[data-ab-edit-id]').onclick=()=>openEditModal(id);

    const status=row.querySelector('[data-ab-status-id]');
    status.onchange=async()=>{
      const current=getOrder(id);if(!current)return;
      if((status.value==='ordered'||status.value==='received')&&!String(current.fournisseur||'').trim()){
        alert('Renseigne d’abord le fournisseur.');status.value=current.status;return;
      }
      try{if(typeof saveOrder==='function')await saveOrder({...current,status:status.value})}
      catch(err){console.error('Statut commande:',err)}
    };

    const doc=row.querySelector('[data-ab-doc-id]');
    doc.onclick=()=>{if(typeof openDocs==='function')openDocs(id)};
  }

  function transformRows(){
    document.querySelectorAll('#chantierFiche #ficheOrdersList .order-row[data-id],#chantierFiche #ficheOrdersList .order-row[data-fiche-id]').forEach(transformRow);
  }

  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;transformRows()});
  }

  injectStyle();
  removeLegacyReadModal();
  ensureEditButtons();
  schedule();

  try{
    if(typeof openModal==='function'&&!openModal.__abCentralEditWrapped){
      const previous=openModal;
      const wrapped=async function(){
        const id=arguments.length?arguments[0]:null;
        const out=await previous.apply(this,arguments);
        updateEditButtons(id);
        return out;
      };
      wrapped.__abCentralEditWrapped=true;
      openModal=wrapped;
    }
  }catch(err){console.error('Wrapper openModal:',err)}

  try{
    if(typeof closeModal==='function'&&!closeModal.__abCentralEditWrapped){
      const previous=closeModal;
      const wrapped=function(){
        const out=previous.apply(this,arguments);
        updateEditButtons('');
        return out;
      };
      wrapped.__abCentralEditWrapped=true;
      closeModal=wrapped;
    }
  }catch(err){console.error('Wrapper closeModal:',err)}

  try{
    if(typeof renderChantierFiche==='function'&&!renderChantierFiche.__abRowsWrappedV3){
      const previous=renderChantierFiche;
      const wrapped=function(){
        const out=previous.apply(this,arguments);
        queueMicrotask(schedule);
        return out;
      };
      wrapped.__abRowsWrappedV3=true;
      renderChantierFiche=wrapped;
    }
  }catch(err){console.error('Wrapper renderChantierFiche:',err)}

  window.addEventListener('load',schedule,{once:true});
  setTimeout(schedule,100);
  setTimeout(schedule,500);
  window.__AB_COMMANDES_ORDER_ROW_DETAILS_VERSION='3.2-visible-viewport-confirm';
})();
