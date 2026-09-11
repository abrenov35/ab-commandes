from pathlib import Path
import re

p = Path('index.html')
s = p.read_text(encoding='utf-8')

# Ne rien refaire si la nouvelle notice est déjà présente.
if 'Simple : chantier, produit, fournisseur et statut.' in s:
    print('AB COMMANDES est déjà simplifié')
    raise SystemExit(0)

# Tableau commandes plus compact : suppression de la date nécessaire.
s = s.replace(
    '.order-row{display:grid;grid-template-columns:1.4fr 90px 150px 145px 130px 175px 95px 76px;',
    '.order-row{display:grid;grid-template-columns:1.6fr 90px 160px 145px 180px 95px 76px;'
)
s = s.replace(
    '.order-row{grid-template-columns:1fr 80px 130px 130px 120px 165px 90px 72px}',
    '.order-row{grid-template-columns:1fr 80px 140px 130px 165px 90px 72px}'
)
s = s.replace(
    '<div class="order-row header"><div>Produit / besoin</div><div>Qté</div><div>Fournisseur</div><div>Responsable</div><div>Date nécessaire</div><div>Statut</div><div>PDF</div><div></div></div>',
    '<div class="order-row header"><div>Produit / besoin</div><div>Qté</div><div>Fournisseur</div><div>Responsable</div><div>Statut</div><div>PDF</div><div></div></div>'
)

# Vue chantiers : suppression de la date de démarrage.
s = s.replace(
    '<th>Chantier</th><th>Démarrage</th><th>Responsable</th><th>État commandes</th><th>Alerte</th>',
    '<th>Chantier</th><th>Responsable</th><th>État commandes</th><th>Alerte</th>'
)

# Modale minimale.
modal = '''<div id="modal" class="modal"><div class="dialog"><h3 id="modalTitle">Ajouter un produit</h3><div class="notice">Simple : chantier, produit, fournisseur et statut. Le statut suffit pour savoir où en est la commande.</div><div class="form-grid">
  <div class="full"><label class="label">Chantier Yaya</label><select id="fChantier" class="field"><option value="">— Choisir un chantier —</option></select><div id="yayaChantierInfo" class="small" style="margin-top:6px">Le chantier est sélectionné depuis Yaya.</div></div>
  <div><label class="label">Produit / besoin</label><input id="fProduit" class="field" placeholder="Ex. Faïence SDB"></div>
  <div><label class="label">Fournisseur</label><input id="fFournisseur" class="field" placeholder="Ex. CDO"></div>
  <div><label class="label">Quantité <span class="small">(facultatif)</span></label><input id="fQte" class="field" placeholder="Ex. 28 m²"></div>
  <div><label class="label">Responsable</label><select id="fResp" class="field"><option>Solenn 🍭</option><option>Mathieu ⚽️</option><option>Morvan ⛑️</option><option>Pascale</option><option>Younès</option></select></div>
  <div class="full"><label class="label">Statut</label><select id="fStatus" class="field"></select></div>
  <div class="full"><label class="label">Précision <span class="small">(facultatif)</span></label><input id="fNotes" class="field" placeholder="Uniquement si une précision est utile"></div>
</div><div class="dialog-actions"><button id="cancelBtn" class="btn secondary">Annuler</button><button id="saveBtn" class="btn">Enregistrer</button></div></div></div>'''
s, n = re.subn(r'<div id="modal" class="modal">.*?</div></div>\s*\n\s*<div id="docModal"', modal + '\n\n<div id="docModal"', s, count=1, flags=re.S)
if n != 1:
    raise SystemExit('Modale principale introuvable')

# Nettoyage de la liste Yaya.
s = s.replace(
    "function activeYayaChantiers(){return yayaChantiers.filter(c=>c.statut!=='Terminé'&&c.statut!=='Archivé')}",
    "function activeYayaChantiers(){return yayaChantiers.filter(c=>c.statut!=='Terminé'&&c.statut!=='Archivé'&&!['AB RENOV35','AB RENOV 35'].includes(normName(c.nom)))}"
)

# Synthèse chantier sans date, triée par niveau d'attention.
chantier_funcs = r'''function chantierData(){
  const m=new Map();
  filtered().forEach(o=>{
    if(!m.has(o.chantier))m.set(o.chantier,{chantier:o.chantier,responsable:o.responsable,all:0,received:0,problem:0,todo:0,choice:0});
    const x=m.get(o.chantier);x.all++;if(o.responsable)x.responsable=o.responsable;
    if(o.status==='received')x.received++;if(o.status==='problem')x.problem++;if(o.status==='todo')x.todo++;if(o.status==='choice')x.choice++;
  });
  const rank=x=>x.problem?0:x.todo?1:x.choice?2:x.received<x.all?3:4;
  return [...m.values()].sort((a,b)=>rank(a)-rank(b)||String(a.chantier).localeCompare(String(b.chantier),'fr',{sensitivity:'base'}));
}
function chantierRows(){return chantierData().map(x=>{const pct=x.all?Math.round(x.received/x.all*100):0;let al='Aucune',cl='ok';if(x.problem){al=`${x.problem} problème${x.problem>1?'s':''}`;cl=''}else if(x.todo){al=`${x.todo} à commander`;cl=''}else if(x.choice){al=`${x.choice} choix client`;cl='orange'}return `<tr><td><b>${esc(x.chantier)}</b></td><td>${esc(x.responsable||'—')}</td><td><span class="progress ${pct===100?'ok':''}"><span style="width:${pct}%"></span></span>${x.received} / ${x.all} reçues</td><td><span class="pill ${cl}">${al}</span></td></tr>`}).join('')}
function renderChantiers(){const rows=chantierRows()||'<tr><td colspan="4">Aucun chantier</td></tr>';$('#chantierSummary').innerHTML=rows;$('#chantierSummary2').innerHTML=rows}
function docCount'''
s, n = re.subn(r'function chantierData\(\)\{.*?\nfunction docCount', chantier_funcs, s, count=1, flags=re.S)
if n != 1:
    raise SystemExit('Fonctions chantier introuvables')

# Liste commandes sans date nécessaire.
render_orders = r'''function renderOrders(){const a=filtered(),list=$('#ordersList');if(!a.length){list.innerHTML='<div class="empty">Aucun produit à afficher.</div>';return}list.innerHTML=a.map(o=>{const n=docCount(o.id);return `<div class="order-row" data-id="${esc(o.id)}"><div data-label="Produit"><b>${esc(o.chantier)}</b><br><span class="small">${esc(o.produit)}</span></div><div data-label="Quantité">${esc(o.qte||'—')}</div><div data-label="Fournisseur">${esc(o.fournisseur||'—')}</div><div data-label="Responsable">${esc(o.responsable||'—')}</div><div data-label="Statut"><select class="status-select" data-status-id="${esc(o.id)}">${Object.entries(STATUSES).map(([k,s])=>`<option value="${k}" ${o.status===k?'selected':''}>${s.label}</option>`).join('')}</select></div><div data-label="PDF"><button class="doc-btn ${n?'has':''}" data-doc-id="${esc(o.id)}">📄 ${n||''}</button></div><div><button class="icon-btn edit" title="Modifier">✎</button><button class="icon-btn del" title="Supprimer">×</button></div></div>`}).join('');$$('[data-status-id]').forEach(el=>el.onchange=async()=>{const o=orders.find(x=>x.id===el.dataset.statusId);if(!o)return;if((el.value==='ordered'||el.value==='received')&&!String(o.fournisseur||'').trim()){alert('Renseigne d’abord le fournisseur.');el.value=o.status;return}await saveOrder({...o,status:el.value})});$$('[data-doc-id]').forEach(b=>b.onclick=()=>openDocs(b.dataset.docId));$$('.edit').forEach(b=>b.onclick=()=>openModal(b.closest('.order-row').dataset.id));$$('.del').forEach(b=>b.onclick=async()=>{const id=b.closest('.order-row').dataset.id;if(confirm('Supprimer cette ligne ?'))await deleteOrder(id)})}
function renderSuppliers'''
s, n = re.subn(r'function renderOrders\(\)\{.*?\nfunction renderSuppliers', render_orders, s, count=1, flags=re.S)
if n != 1:
    raise SystemExit('renderOrders introuvable')

# Ouverture de la modale simplifiée, statut À commander par défaut.
open_modal = r'''function openModal(id=null){editId=id;const o=id?orders.find(x=>x.id===id):null;$('#modalTitle').textContent=o?'Modifier le produit':'Ajouter un produit';const yc=findYayaForOrder(o);refreshChantierSelect(yc?.id||o?.chantierId||'',o?.chantier||'');if(!o)$('#fChantier').value='';$('#fProduit').value=o?.produit||'';$('#fQte').value=o?.qte||'';$('#fFournisseur').value=o?.fournisseur||'';$('#fResp').value=o?.responsable||'Solenn 🍭';$('#fStatus').innerHTML=Object.entries(STATUSES).map(([k,s])=>`<option value="${k}">${s.label}</option>`).join('');$('#fStatus').value=o?.status||'todo';$('#fNotes').value=o?.notes||'';$('#modal').classList.add('show')}
function closeModal'''
s, n = re.subn(r'function openModal\(id=null\)\{.*?\nfunction closeModal', open_modal, s, count=1, flags=re.S)
if n != 1:
    raise SystemExit('openModal introuvable')

# Enregistrement minimal. Les anciennes colonnes restent en base, sans être demandées.
submit = r'''async function submit(){const old=editId?orders.find(x=>x.id===editId):{};const chantierId=$('#fChantier').value;const yc=yayaChantiers.find(c=>String(c.id)===String(chantierId));const chantier=yc?String(yc.nom||'').trim():String(old?.chantier||'').trim();const status=$('#fStatus').value;const fournisseur=$('#fFournisseur').value.trim();const data={...old,id:editId||uid(),chantierId,chantier,produit:$('#fProduit').value.trim(),qte:$('#fQte').value.trim(),fournisseur,responsable:$('#fResp').value,status,notes:$('#fNotes').value.trim()};if(!data.chantierId||!data.chantier||!data.produit){alert('Choisis un chantier Yaya et indique le produit.');return}if((status==='ordered'||status==='received')&&!fournisseur){alert('Le fournisseur est nécessaire quand la commande est commandée ou reçue.');return}closeModal();await saveOrder(data)}'''
s, n = re.subn(r'async function submit\(\)\{.*?\}\nfunction openDocs', submit + '\nfunction openDocs', s, count=1, flags=re.S)
if n != 1:
    raise SystemExit('submit introuvable')

p.write_text(s, encoding='utf-8')
print('AB COMMANDES simplifié')
