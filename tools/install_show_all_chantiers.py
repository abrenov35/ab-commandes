from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')
old='<script src="show-all-yaya-chantiers.js?v=allchantiers-3"></script>'
new='<script src="show-all-yaya-chantiers.js?v=allchantiers-4"></script>'

if new in s:
    print('Version affichage stable v4 déjà à jour')
    raise SystemExit(0)

if old not in s:
    raise SystemExit('Référence show-all-yaya-chantiers v3 introuvable : aucune insertion automatique')

s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
print('AB COMMANDES affichage stable + cache bust allchantiers v4')
