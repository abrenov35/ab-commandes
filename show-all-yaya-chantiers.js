(function(){
  'use strict';

  const ARCHIVE_COMMAND_ID='__AB_CHANTIER_ARCHIVE__';
  const ARCHIVE_TYPE='Archive chantier';
  const ARCHIVE_NAME='ARCHIVE_CHANTIER';
  const STATUS_ORDER=['todo','ordered','problem','choice','received'];
  const KPI_ORDER=['todo','ordered','received','problem'];

  function cleanName(v){return String(v||'').replace(/^[\s•·▪◦\-–—]+/,'').trim()}
  function nameKey(v){return normName(cleanName(v)).replace(/[^A-Z0-9]+/g,' ').trim()}
  function statusDef(k){return STATUSES[k]||STATUSES.choice}
  function plural(n,singular,pluralForm){return n>1?(pluralForm||singular+'s'):singular}

  function archiveMarkers(){
    return (Array.isArray(documents)?documents:[]).filter(d=>
      String(d.commande_id||'')===ARCHIVE_COMMAND_ID ||
      (String(d.type||'')===ARCHIVE_TYPE && String(d.nom_fichier||'')===ARCHIVE_NAME)
    );
  }

  function markerMatches(marker,id,name){
    const mid=String(marker.auteur||'').trim();
    const idStr=String(id||'').trim();
    if(mid&&idStr&&mid===idStr)return true;
    return !!nameKey(name)&&nameKey(marker.chantier)===nameKey(name);
  }

  function isArchived(id,name){
    return archiveMarkers().some(m=>markerMatches(m,id,name));
  }

  function matchingArchiveMarkers(id,name){
    return archiveMarkers().filter(m=>markerMatches(m,id,name));
  }

  function groupAllOrders(){
    const map=new Map();
    (Array.isArray(orders)?orders:[]).forEach(o=>{
      const name=cleanName(o.chantier);
      const key=nameKey(name);
      if(!key)return;
      if(!map.has(key))map.set(key,{key,name,id:String(o.chantierId||''),orders:[],responsables:new Set()});
      const g=map.get(key);
      if(!g.name&&name)g.name=name;
      if(!g.id&&o.chantierId)g.id=String(o.chantierId);
      g.orders.push(o);
      if(o.responsable)g.responsables.add(String(o.responsable));
    });
    return [...map.values()].map(g=>{
      const counts={choice:0,todo:0,ordered:0,received:0,problem:0};
      g.orders.forEach(o=>{if(Object.prototype.hasOwnProperty.call(counts,o.status))counts[o.status]++});
      const archived=isArchived(g.id,g.name);
      const finished=g.orders.length>0&&g.orders.every(o=>o.status==='received');
      return {...g,counts,archived,finished,responsables:[...g.responsables]};
    });
  }

  function orderMatchesUi(o){
    const q=$('#search')?.value.trim().toLowerCase()||'';
    const resp=$('#filterResp')?.value||'';
    const st=$('#filterStatus')?.value||'';
    const hay=[o.chantier,o.produit,o.fournisseur,o.responsable].join(' ').toLowerCase();
    return (!q||hay.includes(q))&&(!resp||o.responsable===resp)&&(!st||o.status===st);
  }

  function groupMatchesUi(g){
    const q=$('#search')?.value.trim().toLowerCase()||'';
    const resp=$('#filterResp')?.value||'';
    const st=$('#filterStatus')?.value||'';
    const nameOk=!q||String(g.name).toLowerCase().includes(q);
    const orderOk=g.orders.some(orderMatchesUi);
    const respOk=!resp||g.orders.some(o=>o.responsable===resp);
    const statusOk=!st||g.orders.some(o=>o.status===st);
    const searchOk=!q||nameOk||orderOk;
    return searchOk&&respOk&&statusOk;
  }

  function activeGroups(){
    return groupAllOrders().filter(g=>!g.archived&&groupMatchesUi(g)).sort((a,b)=>{
      const rank=g=>g.counts.problem?0:g.counts.todo?1:g.counts.choice?2:g.counts.ordered?3:4;
      return rank(a)-rank(b)||a.name.localeCompare(b.name,'fr',{sensitivity:'base'});
    });
  }

  function archivedGroups(){
    return groupAllOrders().filter(g=>g.archived&&groupMatchesUi(g)).sort((a,b)=>a.name.localeCompare(b.name,'fr',{sensitivity:'base'}));
  }

  function visibleActiveOrders(){
    return activeGroups().flatMap(g=>g.orders).filter(orderMatchesUi);
  }

  function countLabel(status,count){
    const s=statusDef(status);
    if(!count)return '';
    return `<span class="ab-chip ab-chip-${status}"><span class="ab-chip-dot ${s.color}"></span>${count} ${esc(s.label.toLowerCase())}</span>`;
  }

  function injectStyle(){
    if(document.getElementById('ab-commandes-dashboard-v2-style'))return;
    const style=document.createElement('style');
    style.id='ab-commandes-dashboard-v2-style';
    style.textContent=`
      .ab-kpi-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:0 0 18px}
      .ab-kpi-card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:16px 18px;display:flex;align-items:center;gap:12px;min-width:0;box-shadow:0 5px 18px rgba(20,33,61,.045)}
      .ab-kpi-card .status-dot{width:26px;height:26px;flex:0 0 26px}
      .ab-kpi-card strong{font-size:27px;line-height:1;display:block;color:var(--text)}
      .ab-kpi-card span.ab-kpi-label{display:block;font-size:12px;font-weight:800;color:#536078;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .ab-section-title{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:24px 0 12px}
      .ab-section-title h2{margin:0;font-size:20px}
      .ab-section-title .small{white-space:nowrap}
      .ab-active-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:12px}
      .ab-chantier-card{padding:16px 17px;display:grid;gap:12px}
      .ab-chantier-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
      .ab-chantier-name{font-size:16px;font-weight:900;color:#1f5cc6;border:0;background:transparent;padding:0;text-align:left;cursor:pointer}
      .ab-chantier-meta{font-size:12px;color:#778399;margin-top:4px}
      .ab-chips{display:flex;gap:6px;flex-wrap:wrap}
      .ab-chip{display:inline-flex;align-items:center;gap:6px;padding:5px 8px;border-radius:999px;background:#f5f7fa;color:#506078;font-size:11px;font-weight:800;border:1px solid #e8edf3}
      .ab-chip-dot{width:8px;height:8px;border-radius:50%;display:inline-block;flex:0 0 8px}
      .ab-card-actions{display:flex;justify-content:flex-end;gap:8px;align-items:center}
      .ab-btn-small{border:1px solid #dfe5ee;background:#fff;color:#253954;border-radius:9px;padding:8px 10px;font-weight:800;font-size:12px;cursor:pointer}
      .ab-btn-small.primary{background:var(--navy);color:#fff;border-color:var(--navy)}
      .ab-btn-small.archive{color:#9b5a18;background:#fff8ef;border-color:#f6dcc1}
      .ab-btn-small:disabled{opacity:.42;cursor:not-allowed}
      .ab-status-groups{display:grid;gap:11px}
      .ab-status-section{background:#fff;border:1px solid var(--line);border-radius:13px;overflow:hidden}
      .ab-status-section summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 15px;font-weight:900;user-select:none}
      .ab-status-section summary::-webkit-details-marker{display:none}
      .ab-status-heading{display:flex;align-items:center;gap:9px;min-width:0}
      .ab-status-heading .mini-dot{width:12px;height:12px}
      .ab-status-count{min-width:28px;text-align:center;border-radius:999px;padding:3px 7px;background:#f1f4f8;color:#4d5c73;font-size:11px}
      .ab-status-body{padding:0 12px 12px}
      .ab-status-body .order-row{box-shadow:none}
      .ab-status-empty{padding:12px 4px;color:#8a96a9;font-size:12px}
      .ab-archive-panel{margin-top:18px;display:none}
      .ab-archive-panel.show{display:block}
      .ab-archive-card{padding:13px 15px;display:flex;align-items:center;justify-content:space-between;gap:12px}
      .ab-archive-card+.ab-archive-card{border-top:1px solid var(--line)}
      .ab-finished{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:800;color:#16865b;background:#e8f8f0;border-radius:999px;padding:5px 8px}
      #chantiers .top{align-items:center}
      #chantiers .ab-active-grid{margin-top:16px}
      #commandes>.order-row.header,#chantierFiche>.order-row.header{display:none!important}
      .fiche-kpis{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:8px!important}
      .fiche-kpis .kpi{min-width:0;padding:12px 14px!important;gap:9px!important}
      .fiche-kpis .status-dot{width:22px!important;height:22px!important;flex:0 0 22px!important}
      .fiche-kpis .kpi strong{font-size:23px!important}
      .fiche-kpis .kpi span{font-size:12px!important}
      @media(max-width:900px){
        .ab-kpi-strip{gap:7px}
        .ab-kpi-card{padding:12px 10px;gap:8px}
        .ab-kpi-card .status-dot{width:20px;height:20px;flex-basis:20px}
        .ab-kpi-card strong{font-size:22px}
        .ab-kpi-card span.ab-kpi-label{font-size:10px}
      }
      @media(max-width:620px){
        .ab-kpi-strip{grid-template-columns:repeat(4,minmax(0,1fr));gap:5px}
        .ab-kpi-card{padding:10px 7px;gap:5px;border-radius:10px}
        .ab-kpi-card .status-dot{width:16px;height:16px;flex-basis:16px}
        .ab-kpi-card strong{font-size:19px}
        .ab-kpi-card span.ab-kpi-label{font-size:9px}
        .ab-active-grid{grid-template-columns:1fr}
        .ab-section-title{align-items:flex-start;flex-direction:column}
        .fiche-kpis{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:4px!important}
        .fiche-kpis .kpi{padding:9px 6px!important;gap:5px!important;border-radius:10px!important}
        .fiche-kpis .status-dot{width:16px!important;height:16px!important;flex-basis:16px!important}
        .fiche-kpis .kpi strong{font-size:18px!important}
        .fiche-kpis .kpi span{font-size:9px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureOverviewLayout(){
    const overview=$('#overview');
    if(!overview)return;
    const filters=overview.querySelector('.filters');
    if(filters&&!$('#abOverviewKpis')){
      const k=document.createElement('div');
      k.id='abOverviewKpis';
      k.className='ab-kpi-strip';
      filters.insertAdjacentElement('afterend',k);
    }
    const card=overview.querySelector('.overview-chantiers');
    if(card){
      const h=card.querySelector('.table-head h2');if(h)h.textContent='Chantiers actifs';
      const small=card.querySelector('.table-head .small');if(small)small.textContent='Uniquement les chantiers ayant au moins une entrée';
      const thead=card.querySelector('thead tr');if(thead)thead.innerHTML='<th>Chantier</th><th>Suivi</th><th>Statuts</th><th></th>';
    }
  }

  function ensureChantiersLayout(){
    const view=$('#chantiers');
    if(!view||view.dataset.abV2==='1')return;
    view.dataset.abV2='1';
    view.innerHTML=`
      <div class="top">
        <div class="title"><h1>Chantiers actifs</h1><p>Chantiers ayant au moins une entrée de commande</p></div>
        <button id="abArchivesToggle" class="btn secondary">Voir les archives</button>
      </div>
      <div class="ab-section-title"><h2>À suivre</h2><span id="abActiveCount" class="small"></span></div>
      <div id="abActiveChantiers" class="ab-active-grid"></div>
      <div id="abArchivePanel" class="ab-archive-panel card">
        <div class="table-head"><h2>Chantiers archivés</h2><span id="abArchiveCount" class="small"></span></div>
        <div id="abArchivedChantiers"></div>
      </div>`;
    $('#abArchivesToggle').onclick=()=>{
      const p=$('#abArchivePanel');
      const show=!p.classList.contains('show');
      p.classList.toggle('show',show);
      $('#abArchivesToggle').textContent=show?'Masquer les archives':'Voir les archives';
    };
  }

  function ensureCommandesLayout(){
    const v=$('#commandes');if(!v)return;
    const title=v.querySelector('.title h1');if(title)title.textContent='Produits / besoins';
    const sub=v.querySelector('.title p');if(sub)sub.textContent='Suivi opérationnel classé par statut';
    const h=v.querySelector('.toolbar h2');if(h)h.textContent='Suivi des produits';
  }

  function ensureFicheLayout(){
    const h=$('#chantierFiche .toolbar h2');if(h)h.textContent='Produits / besoins par statut';
  }

  function renderKpiStrip(){
    const host=$('#abOverviewKpis');if(!host)return;
    const a=visibleActiveOrders();
    host.innerHTML=KPI_ORDER.map(k=>{
      const s=statusDef(k),count=a.filter(o=>o.status===k).length;
      return `<div class="ab-kpi-card"><span class="status-dot ${s.color}"></span><div><strong>${count}</strong><span class="ab-kpi-label">${esc(s.label)}</span></div></div>`;
    }).join('');
  }

  function groupStatusChips(g){
    return ['todo','ordered','received','problem','choice'].map(k=>countLabel(k,g.counts[k])).filter(Boolean).join('');
  }

  function chantierCard(g){
    const resp=g.responsables.length?g.responsables.join(' · '):'Responsable non défini';
    const archiveDisabled=g.finished?'':'disabled';
    const archiveTitle=g.finished?'Archiver ce chantier':'Archivage disponible lorsque tous les produits sont reçus';
    return `<article class="card ab-chantier-card" data-ab-chantier-key="${esc(g.key)}">
      <div class="ab-chantier-top">
        <div><button class="ab-chantier-name ab-open-chantier" data-id="${esc(g.id)}" data-name="${esc(g.name)}">${esc(g.name)}</button><div class="ab-chantier-meta">${g.orders.length} ${plural(g.orders.length,'produit')} · ${esc(resp)}</div></div>
        ${g.finished?'<span class="ab-finished">✓ Terminé</span>':''}
      </div>
      <div class="ab-chips">${groupStatusChips(g)||'<span class="small">Aucun statut</span>'}</div>
      <div class="ab-card-actions"><button class="ab-btn-small primary ab-open-chantier" data-id="${esc(g.id)}" data-name="${esc(g.name)}">Ouvrir</button><button class="ab-btn-small archive ab-archive-chantier" data-id="${esc(g.id)}" data-name="${esc(g.name)}" ${archiveDisabled} title="${esc(archiveTitle)}">Archiver</button></div>
    </article>`;
  }

  function bindOpenChantier(root=document){
    root.querySelectorAll('.ab-open-chantier').forEach(b=>b.onclick=()=>openChantierFiche(b.dataset.id,b.dataset.name));
  }

  async function archiveChantier(id,name){
    const g=groupAllOrders().find(x=>(id&&x.id===String(id))||nameKey(x.name)===nameKey(name));
    if(!g)return;
    if(!g.finished){alert('Ce chantier ne peut être archivé que lorsque tous ses produits sont au statut « Reçu ».');return}
    if(!confirm(`Archiver le chantier ${g.name} ?\n\nIl disparaîtra des chantiers actifs mais restera accessible dans les archives.`))return;
    showSaving(true,'Archivage du chantier…');
    try{
      const now=new Date();
      await post({
        action:'document_upsert',id:'archive-'+uid(),commande_id:ARCHIVE_COMMAND_ID,chantier:g.name,type:ARCHIVE_TYPE,
        nom_fichier:ARCHIVE_NAME,url_pdf:'',source:'AB COMMANDES',date_document:now.toISOString().slice(0,10),auteur:g.id||''
      });
      await new Promise(r=>setTimeout(r,450));
      await loadAll(true);
    }catch(e){alert('Archivage impossible : '+e.message)}finally{showSaving(false)}
  }

  async function restoreChantier(id,name){
    const markers=matchingArchiveMarkers(id,name);
    if(!markers.length)return;
    if(!confirm(`Réactiver le chantier ${name} ?`))return;
    showSaving(true,'Réactivation…');
    try{
      for(const m of markers)await post({action:'document_delete',id:m.id});
      await new Promise(r=>setTimeout(r,450));
      await loadAll(true);
    }catch(e){alert('Réactivation impossible : '+e.message)}finally{showSaving(false)}
  }

  function bindArchiveButtons(root=document){
    root.querySelectorAll('.ab-archive-chantier').forEach(b=>b.onclick=()=>archiveChantier(b.dataset.id,b.dataset.name));
    root.querySelectorAll('.ab-restore-chantier').forEach(b=>b.onclick=()=>restoreChantier(b.dataset.id,b.dataset.name));
  }

  function renderOverviewV2(){
    ensureOverviewLayout();
    renderKpiStrip();
    const body=$('#overviewChantiers');if(!body)return;
    const list=activeGroups();
    body.innerHTML=list.length?list.map(g=>`<tr>
      <td><button class="chantier-link ab-open-chantier" data-id="${esc(g.id)}" data-name="${esc(g.name)}">${esc(g.name)}</button></td>
      <td>${g.orders.length} ${plural(g.orders.length,'produit')} suivi${g.orders.length>1?'s':''}</td>
      <td><div class="ab-chips">${groupStatusChips(g)}</div></td>
      <td><button class="btn secondary ab-open-chantier" data-id="${esc(g.id)}" data-name="${esc(g.name)}">Ouvrir</button></td>
    </tr>`).join(''):'<tr><td colspan="4">Aucun chantier actif avec des commandes.</td></tr>';
    bindOpenChantier(body);
  }

  function renderChantiersV2(){
    ensureChantiersLayout();
    const active=activeGroups();
    const archived=archivedGroups();
    const a=$('#abActiveChantiers'),ar=$('#abArchivedChantiers');
    if(a)a.innerHTML=active.length?active.map(chantierCard).join(''):'<div class="empty">Aucun chantier actif à suivre.</div>';
    if(ar)ar.innerHTML=archived.length?archived.map(g=>`<div class="ab-archive-card"><div><b>${esc(g.name)}</b><div class="small">${g.orders.length} ${plural(g.orders.length,'produit')} · archivé</div></div><div class="ab-card-actions"><button class="ab-btn-small primary ab-open-chantier" data-id="${esc(g.id)}" data-name="${esc(g.name)}">Ouvrir</button><button class="ab-btn-small ab-restore-chantier" data-id="${esc(g.id)}" data-name="${esc(g.name)}">Réactiver</button></div></div>`).join(''):'<div class="empty">Aucun chantier archivé.</div>';
    if($('#abActiveCount'))$('#abActiveCount').textContent=`${active.length} chantier${active.length>1?'s':''} actif${active.length>1?'s':''}`;
    if($('#abArchiveCount'))$('#abArchiveCount').textContent=`${archived.length} chantier${archived.length>1?'s':''}`;
    bindOpenChantier($('#chantiers')||document);
    bindArchiveButtons($('#chantiers')||document);
  }

  function productRow(o,context){
    const n=docCount(o.id);
    const cls=context==='fiche'?'ab-fiche-row':'ab-order-row-v2';
    return `<div class="order-row ${cls}" data-id="${esc(o.id)}">
      <div data-label="Produit"><b>${context==='fiche'?esc(o.produit):esc(o.chantier)}</b>${context==='fiche'?(o.notes?`<br><span class="small">${esc(o.notes)}</span>`:''):`<br><span class="small">${esc(o.produit)}</span>`}</div>
      <div data-label="Quantité">${esc(o.qte||'—')}</div>
      <div data-label="Fournisseur">${esc(o.fournisseur||'—')}</div>
      <div data-label="Responsable">${esc(o.responsable||'—')}</div>
      <div data-label="Statut"><select class="status-select ab-status-select" data-ab-status-id="${esc(o.id)}">${Object.entries(STATUSES).map(([k,s])=>`<option value="${k}" ${o.status===k?'selected':''}>${esc(s.label)}</option>`).join('')}</select></div>
      <div data-label="PDF"><button class="doc-btn ${n?'has':''}" data-ab-doc-id="${esc(o.id)}">📄 ${n||''}</button></div>
      <div><button class="icon-btn ab-edit-order" title="Modifier">✎</button><button class="icon-btn ab-delete-order" title="Supprimer">×</button></div>
    </div>`;
  }

  function statusGroupsHtml(list,context){
    if(!list.length)return '<div class="empty">Aucun produit à afficher.</div>';
    return `<div class="ab-status-groups">${STATUS_ORDER.map(k=>{
      const s=statusDef(k),rows=list.filter(o=>o.status===k);
      const open=k==='received'?'':' open';
      return `<details class="ab-status-section"${open}><summary><span class="ab-status-heading"><span class="mini-dot ${s.color}"></span>${esc(s.label)}</span><span class="ab-status-count">${rows.length}</span></summary><div class="ab-status-body">${rows.length?`<div class="order-row header"><div>Produit / besoin</div><div>Qté</div><div>Fournisseur</div><div>Responsable</div><div>Statut</div><div>PDF</div><div></div></div>${rows.map(o=>productRow(o,context)).join('')}`:'<div class="ab-status-empty">Aucun élément dans ce statut.</div>'}</div></details>`;
    }).join('')}</div>`;
  }

  function bindProductRows(root){
    if(!root)return;
    root.querySelectorAll('[data-ab-status-id]').forEach(el=>el.onchange=async()=>{
      const o=orders.find(x=>x.id===el.dataset.abStatusId);if(!o)return;
      if((el.value==='ordered'||el.value==='received')&&!String(o.fournisseur||'').trim()){
        alert('Renseigne d’abord le fournisseur.');el.value=o.status;return;
      }
      await saveOrder({...o,status:el.value});
    });
    root.querySelectorAll('[data-ab-doc-id]').forEach(b=>b.onclick=()=>openDocs(b.dataset.abDocId));
    root.querySelectorAll('.ab-edit-order').forEach(b=>b.onclick=()=>openModal(b.closest('.order-row').dataset.id));
    root.querySelectorAll('.ab-delete-order').forEach(b=>b.onclick=async()=>{
      const id=b.closest('.order-row').dataset.id;
      if(confirm('Supprimer cette ligne ?'))await deleteOrder(id);
    });
  }

  function renderOrdersV2(){
    ensureCommandesLayout();
    const list=$('#ordersList');if(!list)return;
    const a=filtered().filter(o=>!isArchived(o.chantierId,o.chantier));
    list.innerHTML=statusGroupsHtml(a,'global');
    bindProductRows(list);
  }

  function renderChantierFicheV2(){
    ensureFicheLayout();
    const list=$('#ficheOrdersList');if(!list||(!selectedChantierName&&!selectedChantierId))return;
    const yc=yayaChantiers.find(c=>String(c.id)===String(selectedChantierId));
    const name=String(yc?.nom||selectedChantierName||'Chantier');selectedChantierName=name;
    const a=matchingOrdersForChantier(selectedChantierId,name);
    $('#ficheChantierTitle').textContent=name;
    $('#ficheChantierSub').textContent=a.length?`${a.length} ${plural(a.length,'produit')} suivi${a.length>1?'s':''}`:'Aucune commande enregistrée';
    $('#ficheKpiTodo').textContent=a.filter(o=>o.status==='todo').length;
    $('#ficheKpiOrdered').textContent=a.filter(o=>o.status==='ordered').length;
    $('#ficheKpiReceived').textContent=a.filter(o=>o.status==='received').length;
    $('#ficheKpiProblem').textContent=a.filter(o=>o.status==='problem').length;
    list.innerHTML=statusGroupsHtml(a,'fiche');
    bindProductRows(list);
  }

  function install(){
    injectStyle();
    ensureOverviewLayout();
    ensureChantiersLayout();
    ensureCommandesLayout();
    ensureFicheLayout();
    const nav=$('.nav button[data-view="chantiers"]');if(nav)nav.textContent='🛠 Chantiers actifs';

    window.renderOverviewChantiers=renderOverviewV2;
    window.renderChantiers=renderChantiersV2;
    window.renderOrders=renderOrdersV2;
    window.renderChantierFiche=renderChantierFicheV2;

    try{renderAll()}catch(e){console.error('AB COMMANDES dashboard v2:',e)}
    setTimeout(()=>{try{renderAll()}catch(e){}},700);
    setTimeout(()=>{try{renderAll()}catch(e){}},2200);
    window.__AB_COMMANDES_DASHBOARD_VERSION='2.0';
  }

  install();
})();
