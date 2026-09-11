from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')
new='<script src="embed-mode.js?v=9"></script>'

if new in s:
    print('embed-mode v9 déjà installé')
    raise SystemExit(0)

replaced=False
for old in (
    '<script src="embed-mode.js?v=8"></script>',
    '<script src="embed-mode.js?v=7"></script>',
):
    if old in s:
        s=s.replace(old,new,1)
        replaced=True
        break

if not replaced:
    raise SystemExit('Référence embed-mode v8/v7 introuvable : aucune insertion automatique')

p.write_text(s,encoding='utf-8')
print('AB COMMANDES intégré Yaya - titre Etat des commandes retiré + cache bust v9')
