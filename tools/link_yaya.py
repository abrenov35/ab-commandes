from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

MARKER = 'AB_COMMANDES_YAYA_CACHE_V1'
if MARKER in s:
    print('Liaison Yaya robuste déjà présente')
    raise SystemExit(0)

old_loader = """async function loadYayaChantiers(){
  try{
    const r=await fetch(YAYA_API,{method:'GET',cache:'no-store'});const j=await r.json();
    if(!j.ok)throw new Error(j.error||'Réponse Yaya invalide');
    yayaChantiers=Array.isArray(j.data?.chantiers)?j.data.chantiers:[];yayaLoaded=true;
    refreshChantierSelect($('#fChantier')?.value||'','');
    const badge=document.querySelector('.yaya');if(badge)badge.textContent=`Yaya · ${activeYayaChantiers().length} chantiers`;
  }catch(e){console.error('Yaya:',e);yayaLoaded=false;const info=$('#yayaChantierInfo');if(info)info.textContent='Impossible de charger les chantiers Yaya.'}
}"""

new_loader = """const AB_COMMANDES_YAYA_CACHE_V1='AB_COMMANDES_YAYA_CHANTIERS_V1';
function hydrateYayaCache(){
  try{
    const yayaRaw=localStorage.getItem('YAYA_CACHE_DATA_V2');
    if(yayaRaw){
      const data=JSON.parse(yayaRaw);
      if(Array.isArray(data?.chantiers)&&data.chantiers.length){
        yayaChantiers=data.chantiers;yayaLoaded=true;
        refreshChantierSelect($('#fChantier')?.value||'','');
        const badge=document.querySelector('.yaya');if(badge)badge.textContent=`Yaya · ${activeYayaChantiers().length} chantiers`;
        return true;
      }
    }
  }catch(e){}
  try{
    const raw=localStorage.getItem(AB_COMMANDES_YAYA_CACHE_V1);
    const cached=raw?JSON.parse(raw):null;
    if(Array.isArray(cached)&&cached.length){
      yayaChantiers=cached;yayaLoaded=true;
      refreshChantierSelect($('#fChantier')?.value||'','');
      const badge=document.querySelector('.yaya');if(badge)badge.textContent=`Yaya · ${activeYayaChantiers().length} chantiers`;
      return true;
    }
  }catch(e){}
  return false;
}
async function loadYayaChantiers(force=false){
  if(!yayaChantiers.length)hydrateYayaCache();
  let lastErr=null;
  for(let tentative=1;tentative<=3;tentative++){
    try{
      const ctrl=new AbortController();
      const timer=setTimeout(()=>ctrl.abort(),tentative===1?12000:tentative===2?16000:20000);
      let r;
      try{
        const sep=YAYA_API.includes('?')?'&':'?';
        r=await fetch(YAYA_API+sep+'_abcommandes='+Date.now()+'_'+tentative+(force?'&force=1':''),{method:'GET',cache:'no-store',signal:ctrl.signal});
      }finally{clearTimeout(timer)}
      const txt=await r.text();
      let j;
      try{j=JSON.parse(txt)}catch(e){throw new Error('Réponse Yaya invalide')}
      if(!j.ok)throw new Error(j.error||'Réponse Yaya invalide');
      const list=Array.isArray(j.data?.chantiers)?j.data.chantiers:[];
      if(!list.length)throw new Error('Aucun chantier reçu de Yaya');
      yayaChantiers=list;yayaLoaded=true;
      try{localStorage.setItem(AB_COMMANDES_YAYA_CACHE_V1,JSON.stringify(list))}catch(e){}
      refreshChantierSelect($('#fChantier')?.value||'','');
      const badge=document.querySelector('.yaya');if(badge)badge.textContent=`Yaya · ${activeYayaChantiers().length} chantiers`;
      return true;
    }catch(e){
      lastErr=e;
      if(tentative<3)await new Promise(r=>setTimeout(r,500*tentative));
    }
  }
  console.error('Yaya:',lastErr);
  const cached=hydrateYayaCache();
  yayaLoaded=!!cached;
  const info=$('#yayaChantierInfo');
  if(info)info.textContent=cached?`${activeYayaChantiers().length} chantiers chargés depuis Yaya.`:'Impossible de charger les chantiers Yaya.';
  return cached;
}"""

if old_loader not in s:
    raise SystemExit('Fonction loadYayaChantiers attendue introuvable')
s = s.replace(old_loader, new_loader, 1)

old_modal = "function openModal(id=null){editId=id;const o=id?orders.find(x=>x.id===id):null;$('#modalTitle').textContent=o?'Modifier le produit':'Ajouter un produit';const yc=findYayaForOrder(o);refreshChantierSelect(yc?.id||o?.chantierId||'',o?.chantier||'');if(!o)$('#fChantier').value='';$('#fProduit').value=o?.produit||'';$('#fQte').value=o?.qte||'';$('#fFournisseur').value=o?.fournisseur||'';$('#fResp').value=o?.responsable||'Solenn 🍭';$('#fStatus').innerHTML=Object.entries(STATUSES).map(([k,s])=>`<option value=\"${k}\">${s.label}</option>`).join('');$('#fStatus').value=o?.status||'todo';$('#fNotes').value=o?.notes||'';$('#modal').classList.add('show')}"
new_modal = "async function openModal(id=null){editId=id;const o=id?orders.find(x=>x.id===id):null;$('#modalTitle').textContent=o?'Modifier le produit':'Ajouter un produit';if(!yayaChantiers.length)hydrateYayaCache();if(!yayaChantiers.length)await loadYayaChantiers(true);const yc=findYayaForOrder(o);refreshChantierSelect(yc?.id||o?.chantierId||'',o?.chantier||'');if(!o)$('#fChantier').value='';$('#fProduit').value=o?.produit||'';$('#fQte').value=o?.qte||'';$('#fFournisseur').value=o?.fournisseur||'';$('#fResp').value=o?.responsable||'Solenn 🍭';$('#fStatus').innerHTML=Object.entries(STATUSES).map(([k,s])=>`<option value=\"${k}\">${s.label}</option>`).join('');$('#fStatus').value=o?.status||'todo';$('#fNotes').value=o?.notes||'';$('#modal').classList.add('show')}"
if old_modal not in s:
    raise SystemExit('openModal simplifiée introuvable')
s = s.replace(old_modal, new_modal, 1)

old_init = "renderAll();loadYayaChantiers();loadAll();setInterval(()=>{loadAll(true);loadYayaChantiers()},60000);"
new_init = "renderAll();hydrateYayaCache();loadYayaChantiers();loadAll();setInterval(()=>{loadAll(true);loadYayaChantiers()},60000);"
if old_init not in s:
    raise SystemExit('Initialisation Yaya introuvable')
s = s.replace(old_init, new_init, 1)

p.write_text(s, encoding='utf-8')
print('Liaison Yaya renforcée')
