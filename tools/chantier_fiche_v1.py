from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

MARKER = 'AB_COMMANDES_CHANTIER_FICHE_V1'
if MARKER in s:
    print('Fiche chantier déjà installée')
    raise SystemExit(0)

# 1) Styles dédiés à la liste des chantiers et à la fiche chantier.
css = r'''
/* AB_COMMANDES_CHANTIER_FICHE_V1 */
.chantier-link{border:0;background:transparent;color:#1f5cc6;font-weight:900;padding:0;cursor:pointer;text-align:left}
.chantier-link:hover{text-decoration:underline}
.overview-chantiers .chantier-table{min-width:620px}
.overview-chantiers td:last-child,.overview-chantiers th:last-child{text-align:right}
.fiche-back{margin-bottom:18px}
.fiche-sub{color:#7a879c;margin-top:7px}
.fiche-kpis{margin:22px 0 18px}
.fiche-orders{margin-top:12px}
@media(max-width:760px){.overview-chantiers .chantier-table{min-width:560px}.fiche-kpis{grid-template-columns:1fr 1fr}}
'''
s = s.replace('</style>', css + '\n</style>', 1)

# 2) La vue d'ensemble devient une vraie liste d'accès aux fiches chantier.
old_overview = '''      <div class="kpis">
        <div class="card kpi"><span class="status-dot orange"></span><div><strong id="kpiTodo">0</strong><span>À commander</span></div></div>
        <div class="card kpi"><span class="status-dot blue"></span><div><strong id="kpiOrdered">0</strong><span>Commandé</span></div></div>
        <div class="card kpi"><span class="status-dot green"></span><div><strong id="kpiReceived">0</strong><span>Reçu</span></div></div>
        <div class="card kpi"><span class="status-dot red"></span><div><strong id="kpiProblem">0</strong><span>Problème</span></div></div>
      </div>
      <div class="middle">
        <div class="card panel"><h2>⚠ Actions prioritaires</h2><div id="priorityList" class="actions"></div></div>
        <div class="card panel"><h2>Légende des statuts</h2><div class="legend" id="legend"></div></div>
      </div>
      <div class="card table-card"><div class="table-head"><h2>🏢 Chantiers à sécuriser</h2><span class="small">commandes non reçues</span></div><div class="table-wrap"><table class="chantier-table"><thead><tr><th>Chantier</th><th>Responsable</th><th>État commandes</th><th>Alerte</th></tr></thead><tbody id="chantierSummary"></tbody></table></div></div>'''
new_overview = '''      <div class="card table-card overview-chantiers">
        <div class="table-head"><h2>Chantiers</h2><span class="small">Clique sur un chantier pour ouvrir sa fiche commandes</span></div>
        <div class="table-wrap"><table class="chantier-table"><thead><tr><th>Chantier</th><th>Suivi</th><th></th></tr></thead><tbody id="overviewChantiers"></tbody></table></div>
      </div>'''
if old_overview not in s:
    raise SystemExit('Bloc vue ensemble attendu introuvable')
s = s.replace(old_overview, new_overview, 1)

# 3) Ajout d'une fiche chantier dédiée, avec les 4 pavés demandés uniquement ici.
anchor = '''    <section id="commandes" class="view">'''
fiche_html = '''    <section id="chantierFiche" class="view">
      <button id="ficheBackBtn" class="btn secondary fiche-back">← Retour aux chantiers</button>
      <div class="top"><div class="title"><h1 id="ficheChantierTitle">Fiche chantier</h1><p id="ficheChantierSub" class="fiche-sub">Suivi des commandes du chantier</p></div><div class="yaya">Yaya · fiche chantier</div></div>
      <div class="kpis fiche-kpis">
        <div class="card kpi"><span class="status-dot orange"></span><div><strong id="ficheKpiTodo">0</strong><span>À commander</span></div></div>
        <div class="card kpi"><span class="status-dot blue"></span><div><strong id="ficheKpiOrdered">0</strong><span>Commandé</span></div></div>
        <div class="card kpi"><span class="status-dot green"></span><div><strong id="ficheKpiReceived">0</strong><span>Reçu</span></div></div>
        <div class="card kpi"><span class="status-dot red"></span><div><strong id="ficheKpiProblem">0</strong><span>Problème</span></div></div>
      </div>
      <div class="toolbar"><h2>Produits / besoins</h2><button id="ficheAddBtn" class="btn">+ Ajouter un produit</button></div>
      <div class="order-row header"><div>Produit / besoin</div><div>Qté</div><div>Fournisseur</div><div>Responsable</div><div>Statut</div><div>PDF</div><div></div></div>
      <div id="ficheOrdersList" class="list fiche-orders"></div>
    </section>

'''
if anchor not in s:
    raise SystemExit('Point insertion fiche chantier introuvable')
s = s.replace(anchor, fiche_html + anchor, 1)

# 4) État courant de la fiche et présélection lors d'un ajout depuis la fiche.
old_state = "let orders=[],documents=[],yayaChantiers=[],editId=null,currentDocOrderId=null,loading=false,yayaLoaded=false;"
new_state = "let orders=[],documents=[],yayaChantiers=[],editId=null,currentDocOrderId=null,loading=false,yayaLoaded=false,selectedChantierId='',selectedChantierName='',presetChantierId='';"
if old_state not in s:
    raise SystemExit('Déclaration état attendue introuvable')
s = s.replace(old_state, new_state, 1)

# 5) Remplace le rendu chantiers pour rendre les noms cliquables.
old_rows = "function chantierRows(){return chantierData().map(x=>{const pct=x.all?Math.round(x.received/x.all*100):0;let al='Aucune',cl='ok';if(x.problem){al=`${x.problem} problème${x.problem>1?'s':''}`;cl=''}else if(x.todo){al=`${x.todo} à commander`;cl=''}else if(x.choice){al=`${x.choice} choix client`;cl='orange'}return `<tr><td><b>${esc(x.chantier)}</b></td><td>${esc(x.responsable||'—')}</td><td><span class=\"progress ${pct===100?'ok':''}\"><span style=\"width:${pct}%\"></span></span>${x.received} / ${x.all} reçues</td><td><span class=\"pill ${cl}\">${al}</span></td></tr>`}).join('')}"
new_rows = "function chantierRows(){return chantierData().map(x=>{const pct=x.all?Math.round(x.received/x.all*100):0;let al='Aucune',cl='ok';if(x.problem){al=`${x.problem} problème${x.problem>1?'s':''}`;cl=''}else if(x.todo){al=`${x.todo} à commander`;cl=''}else if(x.choice){al=`${x.choice} choix client`;cl='orange'}return `<tr><td><button class=\"chantier-link chantier-open-name\" data-chantier-name=\"${esc(x.chantier)}\">${esc(x.chantier)}</button></td><td>${esc(x.responsable||'—')}</td><td><span class=\"progress ${pct===100?'ok':''}\"><span style=\"width:${pct}%\"></span></span>${x.received} / ${x.all} reçues</td><td><span class=\"pill ${cl}\">${al}</span></td></tr>`}).join('')}"
if old_rows not in s:
    raise SystemExit('Fonction chantierRows attendue introuvable')
s = s.replace(old_rows, new_rows, 1)

old_render_chantiers = "function renderChantiers(){const rows=chantierRows()||'<tr><td colspan=\"4\">Aucun chantier</td></tr>';$('#chantierSummary').innerHTML=rows;$('#chantierSummary2').innerHTML=rows}"
new_render_chantiers = "function renderChantiers(){const rows=chantierRows()||'<tr><td colspan=\"4\">Aucun chantier</td></tr>';const a=$('#chantierSummary');if(a)a.innerHTML=rows;$('#chantierSummary2').innerHTML=rows;$$('.chantier-open-name').forEach(b=>b.onclick=()=>openChantierFicheByName(b.dataset.chantierName))}"
if old_render_chantiers not in s:
    raise SystemExit('Fonction renderChantiers attendue introuvable')
s = s.replace(old_render_chantiers, new_render_chantiers, 1)

# 6) Fonctions de la vue d'ensemble et de la fiche chantier.
anchor_fn = "function docCount(id){return documents.filter(d=>String(d.commande_id)===String(id)).length}"
addition = r'''
function showView(id){$$('.view').forEach(v=>v.classList.remove('active'));const v=$('#'+id);if(v)v.classList.add('active')}
function matchingOrdersForChantier(chantierId,chantierName){const id=String(chantierId||''),name=normName(chantierName);return orders.filter(o=>(id&&String(o.chantierId||'')===id)||(!id&&name&&normName(o.chantier)===name)||(id&&name&&normName(o.chantier)===name))}
function overviewChantierList(){
  const byKey=new Map();
  activeYayaChantiers().forEach(c=>byKey.set('id:'+String(c.id),{id:String(c.id),name:String(c.nom||'').trim()}));
  orders.forEach(o=>{const id=String(o.chantierId||'');const key=id?'id:'+id:'name:'+normName(o.chantier);if(!byKey.has(key)&&o.chantier)byKey.set(key,{id,name:String(o.chantier||'').trim()})});
  const q=$('#search').value.trim().toLowerCase(),resp=$('#filterResp').value,st=$('#filterStatus').value;
  return [...byKey.values()].filter(c=>{
    const os=matchingOrdersForChantier(c.id,c.name);
    const searchOk=!q||c.name.toLowerCase().includes(q)||os.some(o=>[o.produit,o.fournisseur,o.responsable].join(' ').toLowerCase().includes(q));
    const respOk=!resp||os.some(o=>o.responsable===resp);
    const statusOk=!st||os.some(o=>o.status===st);
    return searchOk&&respOk&&statusOk;
  }).sort((a,b)=>a.name.localeCompare(b.name,'fr',{sensitivity:'base'}));
}
function renderOverviewChantiers(){
  const body=$('#overviewChantiers');if(!body)return;
  const list=overviewChantierList();
  body.innerHTML=list.length?list.map(c=>{const os=matchingOrdersForChantier(c.id,c.name);const suivi=os.length?`${os.length} produit${os.length>1?'s':''} suivi${os.length>1?'s':''}`:'Aucune commande';return `<tr><td><button class="chantier-link chantier-open" data-chantier-id="${esc(c.id)}" data-chantier-name="${esc(c.name)}">${esc(c.name)}</button></td><td>${suivi}</td><td><button class="btn secondary chantier-open" data-chantier-id="${esc(c.id)}" data-chantier-name="${esc(c.name)}">Ouvrir la fiche</button></td></tr>`}).join(''):'<tr><td colspan="3">Aucun chantier</td></tr>';
  $$('.chantier-open').forEach(b=>b.onclick=()=>openChantierFiche(b.dataset.chantierId,b.dataset.chantierName));
}
function openChantierFicheByName(name){const y=yayaChantiers.find(c=>normName(c.nom)===normName(name));openChantierFiche(y?.id||'',y?.nom||name)}
function openChantierFiche(id,name){selectedChantierId=String(id||'');selectedChantierName=String(name||'').trim();$$('.nav button').forEach(x=>x.classList.remove('active'));const n=$('.nav button[data-view="chantiers"]');if(n)n.classList.add('active');showView('chantierFiche');renderChantierFiche();window.scrollTo({top:0,behavior:'smooth'})}
function closeChantierFiche(){showView('overview');$$('.nav button').forEach(x=>x.classList.remove('active'));const n=$('.nav button[data-view="overview"]');if(n)n.classList.add('active');window.scrollTo({top:0,behavior:'smooth'})}
function renderChantierFiche(){
  const list=$('#ficheOrdersList');if(!list||!selectedChantierName&&!selectedChantierId)return;
  const yc=yayaChantiers.find(c=>String(c.id)===String(selectedChantierId));const name=String(yc?.nom||selectedChantierName||'Chantier');selectedChantierName=name;
  const a=matchingOrdersForChantier(selectedChantierId,name);
  $('#ficheChantierTitle').textContent=name;$('#ficheChantierSub').textContent=a.length?`${a.length} produit${a.length>1?'s':''} suivi${a.length>1?'s':''}`:'Aucune commande enregistrée';
  $('#ficheKpiTodo').textContent=a.filter(o=>o.status==='todo').length;$('#ficheKpiOrdered').textContent=a.filter(o=>o.status==='ordered').length;$('#ficheKpiReceived').textContent=a.filter(o=>o.status==='received').length;$('#ficheKpiProblem').textContent=a.filter(o=>o.status==='problem').length;
  if(!a.length){list.innerHTML='<div class="empty">Aucun produit à suivre pour ce chantier.</div>';return}
  list.innerHTML=a.map(o=>{const n=docCount(o.id);return `<div class="order-row" data-fiche-id="${esc(o.id)}"><div data-label="Produit"><b>${esc(o.produit)}</b>${o.notes?`<br><span class="small">${esc(o.notes)}</span>`:''}</div><div data-label="Quantité">${esc(o.qte||'—')}</div><div data-label="Fournisseur">${esc(o.fournisseur||'—')}</div><div data-label="Responsable">${esc(o.responsable||'—')}</div><div data-label="Statut"><select class="status-select fiche-status" data-fiche-status-id="${esc(o.id)}">${Object.entries(STATUSES).map(([k,s])=>`<option value="${k}" ${o.status===k?'selected':''}>${s.label}</option>`).join('')}</select></div><div data-label="PDF"><button class="doc-btn ${n?'has':''}" data-fiche-doc-id="${esc(o.id)}">📄 ${n||''}</button></div><div><button class="icon-btn fiche-edit" title="Modifier">✎</button><button class="icon-btn fiche-del" title="Supprimer">×</button></div></div>`}).join('');
  $$('[data-fiche-status-id]').forEach(el=>el.onchange=async()=>{const o=orders.find(x=>x.id===el.dataset.ficheStatusId);if(!o)return;if((el.value==='ordered'||el.value==='received')&&!String(o.fournisseur||'').trim()){alert('Renseigne d’abord le fournisseur.');el.value=o.status;return}await saveOrder({...o,status:el.value})});
  $$('[data-fiche-doc-id]').forEach(b=>b.onclick=()=>openDocs(b.dataset.ficheDocId));
  $$('.fiche-edit').forEach(b=>b.onclick=()=>openModal(b.closest('.order-row').dataset.ficheId));
  $$('.fiche-del').forEach(b=>b.onclick=async()=>{const id=b.closest('.order-row').dataset.ficheId;if(confirm('Supprimer cette ligne ?'))await deleteOrder(id)});
}
function addProductForCurrentChantier(){presetChantierId=selectedChantierId;openModal()}
'''
if anchor_fn not in s:
    raise SystemExit('Point insertion fonctions fiche introuvable')
s = s.replace(anchor_fn, anchor_fn + addition, 1)

# 7) Le rendu global n'affiche plus les KPI/actions sur la vue d'ensemble.
old_render_all = "function renderAll(){refreshFilters();renderLegend();renderKPIs();renderPriority();renderChantiers();renderOrders();renderSuppliers()}"
new_render_all = "function renderAll(){refreshFilters();renderOverviewChantiers();renderChantiers();renderOrders();renderSuppliers();renderChantierFiche()}"
if old_render_all not in s:
    raise SystemExit('renderAll attendu introuvable')
s = s.replace(old_render_all, new_render_all, 1)

# 8) Présélection du chantier lorsque l'ajout est lancé depuis sa fiche.
old_open = "async function openModal(id=null){editId=id;const o=id?orders.find(x=>x.id===id):null;$('#modalTitle').textContent=o?'Modifier le produit':'Ajouter un produit';if(!yayaChantiers.length)hydrateYayaCache();if(!yayaChantiers.length)await loadYayaChantiers(true);const yc=findYayaForOrder(o);refreshChantierSelect(yc?.id||o?.chantierId||'',o?.chantier||'');if(!o)$('#fChantier').value='';$('#fProduit').value=o?.produit||'';$('#fQte').value=o?.qte||'';$('#fFournisseur').value=o?.fournisseur||'';$('#fResp').value=o?.responsable||'Solenn 🍭';$('#fStatus').innerHTML=Object.entries(STATUSES).map(([k,s])=>`<option value=\"${k}\">${s.label}</option>`).join('');$('#fStatus').value=o?.status||'todo';$('#fNotes').value=o?.notes||'';$('#modal').classList.add('show')}"
new_open = "async function openModal(id=null){editId=id;const o=id?orders.find(x=>x.id===id):null;$('#modalTitle').textContent=o?'Modifier le produit':'Ajouter un produit';if(!yayaChantiers.length)hydrateYayaCache();if(!yayaChantiers.length)await loadYayaChantiers(true);const yc=findYayaForOrder(o);const preset=!o&&presetChantierId?presetChantierId:'';refreshChantierSelect(yc?.id||o?.chantierId||preset,o?.chantier||'');if(!o)$('#fChantier').value=preset;presetChantierId='';$('#fProduit').value=o?.produit||'';$('#fQte').value=o?.qte||'';$('#fFournisseur').value=o?.fournisseur||'';$('#fResp').value=o?.responsable||'Solenn 🍭';$('#fStatus').innerHTML=Object.entries(STATUSES).map(([k,s])=>`<option value=\"${k}\">${s.label}</option>`).join('');$('#fStatus').value=o?.status||'todo';$('#fNotes').value=o?.notes||'';$('#modal').classList.add('show')}"
if old_open not in s:
    raise SystemExit('openModal attendu introuvable')
s = s.replace(old_open, new_open, 1)

# 9) Les boutons de la fiche sont branchés.
old_bind = "$('#addBtn').onclick=()=>openModal();$('#addBtnTop').onclick=()=>openModal();$('#cancelBtn').onclick=closeModal;"
new_bind = "$('#addBtn').onclick=()=>openModal();$('#addBtnTop').onclick=()=>openModal();$('#ficheBackBtn').onclick=closeChantierFiche;$('#ficheAddBtn').onclick=addProductForCurrentChantier;$('#cancelBtn').onclick=closeModal;"
if old_bind not in s:
    raise SystemExit('Branchement boutons attendu introuvable')
s = s.replace(old_bind, new_bind, 1)

p.write_text(s, encoding='utf-8')
print('Vue ensemble simplifiée et fiches chantier ajoutées')
