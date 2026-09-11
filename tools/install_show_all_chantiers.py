from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')
needle='</body>'
tag='<script src="show-all-yaya-chantiers.js?v=allchantiers-1"></script>'
if tag in s:
    print('Script tous chantiers déjà installé')
    raise SystemExit(0)
if needle not in s:
    raise SystemExit('Balise body introuvable')
s=s.replace(needle,tag+'\n'+needle,1)
p.write_text(s,encoding='utf-8')
print('Script tous chantiers installé')
