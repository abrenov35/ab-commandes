from pathlib import Path
import re

p = Path('index.html')
s = p.read_text(encoding='utf-8')

marker = '/* AB_COMMANDES_OVERVIEW_DEDUPE_V1 */'
if marker in s:
    print('Déduplication déjà installée')
    raise SystemExit(0)

pattern = re.compile(r"function overviewChantierList\(\)\{[\s\S]*?\n\}\nfunction renderOverviewChantiers\(\)\{")
replacement = r'''/* AB_COMMANDES_OVERVIEW_DEDUPE_V1 */
function overviewNameClean(v){return String(v||'').replace(/^[\s•·▪◦\-–—]+/,'').trim()}
function overviewNameKey(v){return normName(overviewNameClean(v)).replace(/[^A-Z0-9]+/g,' ').trim()}
function overviewChantierList(){
  const byName=new Map();
  activeYayaChantiers().forEach(c=>{
    const name=overviewNameClean(c.nom),key=overviewNameKey(name),id=String(c.id||'');
    if(!key||key.replace(/\s+/g,'')==='ABRENOV35')return;
    const prev=byName.get(key);
    if(!prev)byName.set(key,{id,name});
    else if(!prev.id&&id)prev.id=id;
  });
  orders.forEach(o=>{
    const name=overviewNameClean(o.chantier),key=overviewNameKey(name),id=String(o.chantierId||'');
    if(!key||key.replace(/\s+/g,'')==='ABRENOV35')return;
    const prev=byName.get(key);
    if(!prev)byName.set(key,{id,name});
    else if(!prev.id&&id)prev.id=id;
  });
  const q=$('#search').value.trim().toLowerCase(),resp=$('#filterResp').value,st=$('#filterStatus').value;
  return [...byName.values()].filter(c=>{
    const os=matchingOrdersForChantier(c.id,c.name);
    const searchOk=!q||c.name.toLowerCase().includes(q)||os.some(o=>[o.produit,o.fournisseur,o.responsable].join(' ').toLowerCase().includes(q));
    const respOk=!resp||os.some(o=>o.responsable===resp);
    const statusOk=!st||os.some(o=>o.status===st);
    return searchOk&&respOk&&statusOk;
  }).sort((a,b)=>a.name.localeCompare(b.name,'fr',{sensitivity:'base'}));
}
function renderOverviewChantiers(){'''

s2, n = pattern.subn(lambda m: replacement, s, count=1)
if n != 1:
    raise SystemExit('Fonction overviewChantierList introuvable')

p.write_text(s2, encoding='utf-8')
print('Déduplication des chantiers installée')
