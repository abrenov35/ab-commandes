from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')
old = '      <button data-view="fournisseurs">🚚 Fournisseurs</button>\n'
if old not in s:
    print('Bouton Fournisseurs déjà supprimé')
    raise SystemExit(0)
s = s.replace(old, '', 1)
p.write_text(s, encoding='utf-8')
print('Bouton Fournisseurs supprimé')
