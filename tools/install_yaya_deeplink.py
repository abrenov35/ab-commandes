from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')
marker='/* AB_COMMANDES_YAYA_DEEPLINK_V1 */'
if marker in s:
    print('Deep link Yaya déjà installé')
    raise SystemExit(0)

needle="let orders=[],documents=[],yayaChantiers=[],editId=null,currentDocOrderId=null,loading=false,yayaLoaded=false,selectedChantierId='',selectedChantierName='',presetChantierId='';"
if needle not in s:
    raise SystemExit('Point insertion état AB COMMANDES introuvable')

insert=needle+"\n"+marker+"\nconst DEEP_LINK_PARAMS=new URL(window.location.href).searchParams;\nconst DEEP_LINK_CHANTIER_ID=String(DEEP_LINK_PARAMS.get('chantierId')||'').trim();\nconst DEEP_LINK_CHANTIER_NAME=String(DEEP_LINK_PARAMS.get('chantierName')||'').trim();\nlet deepLinkOpened=false;\nfunction tryOpenDeepLink(){\n  if(deepLinkOpened||(!DEEP_LINK_CHANTIER_ID&&!DEEP_LINK_CHANTIER_NAME))return;\n  const y=DEEP_LINK_CHANTIER_ID?yayaChantiers.find(c=>String(c.id||'')===DEEP_LINK_CHANTIER_ID):null;\n  const id=String(y?.id||DEEP_LINK_CHANTIER_ID||'');\n  const name=String(y?.nom||DEEP_LINK_CHANTIER_NAME||'').trim();\n  if(!id&&!name)return;\n  if(!name&&DEEP_LINK_CHANTIER_ID&&!yayaChantiers.length)return;\n  deepLinkOpened=true;\n  openChantierFiche(id,name||'Chantier');\n}\n"
s=s.replace(needle,insert,1)

init="renderAll();hydrateYayaCache();loadYayaChantiers();loadAll();setInterval(()=>{loadAll(true);loadYayaChantiers()},60000);"
replacement="renderAll();hydrateYayaCache();tryOpenDeepLink();loadYayaChantiers().then(tryOpenDeepLink);loadAll();setInterval(()=>{loadAll(true);loadYayaChantiers()},60000);"
if init not in s:
    raise SystemExit('Initialisation AB COMMANDES introuvable')
s=s.replace(init,replacement,1)

p.write_text(s,encoding='utf-8')
print('Deep link chantier Yaya installé')
