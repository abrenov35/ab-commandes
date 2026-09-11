(function(){
  'use strict';

  const params=new URL(window.location.href).searchParams;
  if(params.get('embed')!=='1')return;

  const STYLE_ID='ab-commandes-order-row-details-style';
  const MODAL_ID='abOrderReadModal';
  let currentOrderId='';
  let scheduled=false;

  function e(v){
    try{return typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
    catch(_){return String(v??'')}
  }

  function injectStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      body.ab-embed-mode #chantierFiche .fiche-orders .order-row.ab-row-simple{
        display:grid!important;grid-template-columns:minmax(190px,1.7fr) minmax(105px,.75fr) minmax(160px,1fr) 74px!important;
        gap:10px!important;align-items:center!important;padding:10px 12px!important;
      }
      body.ab-embed-mode #chantierFiche .ab-order-label{appearance:none!important;border:0!important;background:transparent!important;padding:0!important;margin:0!important;text-align:left!important;color:var(--text)!important;font-weight:900!important;line-height:1.2!important;cursor:pointer!important}
      body.ab-embed-mode #chantierFiche .ab-order-label:hover{color:#1f5cc6!important;text-decoration:underline!important}
      body.ab-embed-mode #chantierFiche .ab-order-resp{font-weight:700!important;color:#24364f!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      body.ab-embed-mode #chantierFiche .ab-order-doc{display:flex!important;justify-content:flex-end!important}
      body.ab-embed-mode #chantierFiche .ab-order-doc .doc-btn{min-width:46px!important;padding:8px 10px!important}
      body.ab-embed-mode #chantierFiche .ab-row-simple .status-select{min-width:0!important;width:100%!important}
      body.ab-embed-mode #${MODAL_ID}{align-items:flex-start!important;justify-content:center!important;padding:18px!important;overflow:visible!important}
      body.ab-embed-mode #${MODAL_ID} .dialog{width:min(430px,calc(100% - 6px))!important;max-height:none!important;overflow:visible!important;padding:16px 18px!important;border-radius:14px!important}
      #${MODAL_ID} h3{margin:0 0 14px!important;font-size:18px!important}
      #${MODAL_ID} .ab-read-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 14px}
      #${MODAL_ID} .ab-read-field{min-width:0;padding:8px 0;border-bottom:1px solid #edf0f4}
      #${MODAL_ID} .ab-read-field.full{grid-column:1/-1}
      #${MODAL_ID} .ab-read-label{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#7a879c;margin-bottom:3px}
      #${MODAL_ID} .ab-read-value{font-size:14px;font-weight:800;color:#1f2e45;overflow-wrap:anywhere}
      #${MODAL_ID} .ab-read-actions{display:flex;justify-content:space-between;gap:10px;margin-top:14px}
      #${MODAL_ID} .ab-read-actions .btn{padding:9px 13px!important}
      @media(max-width:620px){
        body.ab-embed-mode #chantierFiche .fiche-orders .order-row.ab-row-simple{grid-template-columns:minmax(130px,1.45fr) minmax(82px,.7fr) minmax(120px,1fr) 52px!important;gap:6px!important;padding:9px 7px!important}
        body.ab-embed-mode #chantierFiche .ab-order-label{font-size:12px!important}
        body.ab-embed-mode #chantierFiche .ab-order-resp{font-size:11px!important}
        body.ab-embed-mode #chantierFiche .ab-row-simple .status-select{font-size:11px!important;padding:7px 5px!important}
        body.ab-embed-mode #chantierFiche .ab-order-doc .doc-btn{min-width:40px!important;padding:7px 5px!important;font-size:11px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureModal(){
    let modal=document.getElementById(MODAL_ID);if(modal)return modal;
    modal=document.createElement('div');modal.id=MODAL_ID;modal.className='modal';
    modal.innerHTML=`<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="abOrderReadTitle"><h3 id="abOrderReadTitle">Détail du produit</h3><div class="ab-read-grid"><div class="ab-read-field full"><div class="ab-read-label">Libellé</div><div id="abReadProduit" class="ab-read-value">—</div></div><div class="ab-read-field"><div class="ab-read-label">Quantité</div><div id="abReadQte" class="ab-read-value">—</div></div><div class="ab-read-field"><div class="ab-read-label">Unité</div><div id="abReadUnite" class="ab-read-value">—</div></div><div class="ab-read-field full"><div class="ab-read-label">Prix éventuel</div><div id="abReadPrix" class="ab-read-value">—</div></div></div><div class="ab-read-actions"><button id="abReadDelete" type="button" class="btn red">Supprimer</button><button id="abReadClose" type="button" class="btn secondary">Fermer</button></div></div>`;
    document.body.appendChild(modal);
    modal.querySelector('#abReadClose').onclick=closeReadModal;
    modal.onclick=ev=>{if(ev.target===modal)closeReadModal()};
    modal.querySelector('#abReadDelete').onclick=async()=>{const id=currentOrderId;if(!id||!confirm('Supprimer ce produit ?'))return;closeReadModal();try{if(typeof deleteOrder==='function')await deleteOrder(id)}catch(err){console.error(err)}};
    return modal;
  }

  function splitQty(raw){const s=String(raw||'').trim();if(!s)return {qte:'—',unite:'—'};const m=s.match(/^([+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+))\s*([^\d].*)?$/);if(!m)return {qte:s,unite:'—'};return {qte:m[1]||s,unite:String(m[2]||'').trim()||'—'}}
  function orderPrice(o){const v=o?.prix??o?.prix_unitaire??o?.price??o?.montant??o?.montant_ht??'';if(v===null||v===undefined||String(v).trim()==='')return '—';const s=String(v).trim();return /€/.test(s)?s:s+' €'}

  function openReadModal(id){
    const arr=(typeof orders!=='undefined'&&Array.isArray(orders))?orders:[];const o=arr.find(x=>String(x.id||'')===String(id||''));if(!o)return;
    currentOrderId=String(o.id||'');const parsed=splitQty(o.qte);const modal=ensureModal();
    modal.querySelector('#abReadProduit').textContent=String(o.produit||'—');modal.querySelector('#abReadQte').textContent=parsed.qte;modal.querySelector('#abReadUnite').textContent=String(o.unite||o.unité||parsed.unite||'—');modal.querySelector('#abReadPrix').textContent=orderPrice(o);modal.classList.add('show');
    document.dispatchEvent(new CustomEvent('ab-commandes-modal-open',{detail:{id:MODAL_ID}}));
  }

  function closeReadModal(){const modal=document.getElementById(MODAL_ID);if(modal)modal.classList.remove('show');currentOrderId='';document.dispatchEvent(new CustomEvent('ab-commandes-modal-close',{detail:{id:MODAL_ID}}))}

  function transformRow(row){
    if(!row||row.dataset.abSimpleRow==='1')return;const id=String(row.dataset.ficheId||'');if(!id)return;
    const arr=(typeof orders!=='undefined'&&Array.isArray(orders))?orders:[];const o=arr.find(x=>String(x.id||'')===id);if(!o)return;const n=typeof docCount==='function'?docCount(o.id):0;
    row.dataset.abSimpleRow='1';row.classList.add('ab-row-simple');
    row.innerHTML=`<div><button type="button" class="ab-order-label" data-ab-read-id="${e(o.id)}">${e(o.produit||'—')}</button></div><div class="ab-order-resp">${e(o.responsable||'—')}</div><div><select class="status-select ab-simple-status" data-ab-status-id="${e(o.id)}">${Object.entries(STATUSES).map(([k,s])=>`<option value="${e(k)}" ${o.status===k?'selected':''}>${e(s.label)}</option>`).join('')}</select></div><div class="ab-order-doc"><button type="button" class="doc-btn ${n?'has':''}" data-ab-doc-id="${e(o.id)}" title="Documents">📄${n?' '+n:''}</button></div>`;
    row.querySelector('[data-ab-read-id]').onclick=()=>openReadModal(id);
    const status=row.querySelector('[data-ab-status-id]');status.onchange=async()=>{const current=arr.find(x=>String(x.id||'')===id);if(!current)return;if((status.value==='ordered'||status.value==='received')&&!String(current.fournisseur||'').trim()){alert('Renseigne d’abord le fournisseur.');status.value=current.status;return}try{if(typeof saveOrder==='function')await saveOrder({...current,status:status.value})}catch(err){console.error(err)}};
    const doc=row.querySelector('[data-ab-doc-id]');doc.onclick=()=>{if(typeof openDocs==='function')openDocs(id)};
  }

  function transformRows(){document.querySelectorAll('#chantierFiche #ficheOrdersList .order-row[data-fiche-id]').forEach(transformRow)}
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;transformRows()})}

  injectStyle();ensureModal();schedule();
  try{
    if(typeof renderChantierFiche==='function'&&!renderChantierFiche.__abRowsWrapped){
      const previous=renderChantierFiche;const wrapped=function(){const out=previous.apply(this,arguments);queueMicrotask(schedule);return out};wrapped.__abRowsWrapped=true;renderChantierFiche=wrapped;
    }
  }catch(err){console.error(err)}
  window.addEventListener('load',schedule,{once:true});setTimeout(schedule,100);setTimeout(schedule,500);
  window.__AB_COMMANDES_ORDER_ROW_DETAILS_VERSION='2.0';
})();
