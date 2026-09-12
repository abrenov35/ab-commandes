from pathlib import Path

TAG='<script src="web-link-v31.js?v=3"></script>'
ANCHOR='<script src="modal-product-v4.js?v=3"></script>'

p=Path('index.html')
s=p.read_text(encoding='utf-8')
for old in (
    '<script src="web-link-v31.js?v=1"></script>',
    '<script src="web-link-v31.js?v=2"></script>',
    '<script src="web-link-v31.js?v=3"></script>',
):
    s=s.replace(old,'')
if ANCHOR not in s:
    raise SystemExit('Ancre modal-product introuvable')
s=s.replace(ANCHOR,ANCHOR+'\n'+TAG,1)
p.write_text(s,encoding='utf-8')

installer=Path('tools/install_embed_mode.py')
if installer.exists():
    t=installer.read_text(encoding='utf-8')
    t=t.replace(
        "web_link_new='<script src=\"web-link-v31.js?v=1\"></script>'",
        "web_link_new='<script src=\"web-link-v31.js?v=3\"></script>'"
    )
    t=t.replace(
        "web_link_new='<script src=\"web-link-v31.js?v=2\"></script>'",
        "web_link_new='<script src=\"web-link-v31.js?v=3\"></script>'"
    )
    if "'<script src=\"web-link-v31.js?v=3\"></script>\\n'" not in t:
        t=t.replace(
            "'<script src=\"web-link-v31.js?v=2\"></script>\\n',\n    '<script src=\"web-link-v31.js?v=2\"></script>',",
            "'<script src=\"web-link-v31.js?v=2\"></script>\\n',\n    '<script src=\"web-link-v31.js?v=2\"></script>',\n    '<script src=\"web-link-v31.js?v=3\"></script>\\n',\n    '<script src=\"web-link-v31.js?v=3\"></script>',"
        )
    installer.write_text(t,encoding='utf-8')

print('AB COMMANDES V33 - sauvegarde modale non bloquante active')
