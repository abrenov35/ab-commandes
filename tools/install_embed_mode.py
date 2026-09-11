from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')
new='<script src="embed-mode.js?v=2"></script>'
if new in s:
    print('embed-mode v2 déjà installé')
    raise SystemExit(0)
old='<script src="embed-mode.js?v=1"></script>'
if old in s:
    s=s.replace(old,new,1)
else:
    needle='</body>'
    if needle not in s:
        raise SystemExit('balise body introuvable')
    s=s.replace(needle,new+'\n'+needle,1)
p.write_text(s,encoding='utf-8')
print('embed-mode v2 installé')
