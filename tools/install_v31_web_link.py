from pathlib import Path

TAG='<script src="web-link-v31.js?v=1"></script>'
ANCHOR='<script src="modal-product-v4.js?v=3"></script>'

p=Path('index.html')
s=p.read_text(encoding='utf-8')
if TAG not in s:
    if ANCHOR not in s:
        raise SystemExit('Ancre modal-product introuvable')
    s=s.replace(ANCHOR,ANCHOR+'\n'+TAG,1)
p.write_text(s,encoding='utf-8')

installer=Path('tools/install_embed_mode.py')
if installer.exists():
    t=installer.read_text(encoding='utf-8')
    if "web_link_new='<script src=\"web-link-v31.js?v=1\"></script>'" not in t:
        t=t.replace(
            "price_new='<script src=\"modal-product-v4.js?v=3\"></script>'",
            "price_new='<script src=\"modal-product-v4.js?v=3\"></script>'\nweb_link_new='<script src=\"web-link-v31.js?v=1\"></script>'",
            1,
        )
        marker='# Upload PDF v4 : fermeture immédiate, traitement arrière-plan, modale Upload failed en cas d\'échec.'
        block="""# V31 : lien web rattaché au produit, ouvert dans un nouvel onglet.\nfor old in (\n    '<script src=\"web-link-v31.js?v=1\"></script>\\n',\n    '<script src=\"web-link-v31.js?v=1\"></script>',\n):\n    s=s.replace(old,'')\ns=s.replace(price_new,price_new+'\\n'+web_link_new,1)\n\n"""
        if marker in t:
            t=t.replace(marker,block+marker,1)
        installer.write_text(t,encoding='utf-8')

print('AB COMMANDES V31 - lien web actif')
