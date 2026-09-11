from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')
old='<script src="embed-mode.js?v=5"></script>'
new='<script src="embed-mode.js?v=6"></script>'

if new in s:
    print('embed-mode v6 déjà installé')
    raise SystemExit(0)

if old not in s:
    raise SystemExit('Référence embed-mode v5 introuvable : aucune insertion automatique')

s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
print('AB COMMANDES intégré sans ascenseur + cache bust v6')
