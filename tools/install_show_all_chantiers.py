from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')
old='<script src="show-all-yaya-chantiers.js?v=allchantiers-2"></script>'
new='<script src="show-all-yaya-chantiers.js?v=allchantiers-3"></script>'

if new in s:
    print('Version chantiers à suivre déjà à jour')
    raise SystemExit(0)

if old in s:
    s=s.replace(old,new,1)
else:
    needle='</body>'
    if needle not in s:
        raise SystemExit('Balise body introuvable')
    s=s.replace(needle,new+'\n'+needle,1)

p.write_text(s,encoding='utf-8')
print('AB COMMANDES chantiers à suivre + archivage + cache bust v3')
