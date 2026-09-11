from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')
old='<script src="embed-mode.js?v=4"></script>'
new='<script src="embed-mode.js?v=5"></script>'

if new in s:
    print('embed-mode v5 déjà installé')
    raise SystemExit(0)

if old not in s:
    raise SystemExit('Référence embed-mode v4 introuvable : aucune insertion automatique')

s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
print('AB COMMANDES V28 mode Yaya + cache bust v5')
