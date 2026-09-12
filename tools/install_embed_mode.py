from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

collapsed_new='<script src="collapsed-status-groups.js?v=4"></script>'
embed_new='<script src="embed-mode.js?v=10"></script>'
stable_new='<script src="embed-modal-stable.js?v=1"></script>'
kpi_new='<script src="embed-kpi-shortcuts.js?v=7"></script>'
choice_new='<script src="choice-client-label.js?v=2"></script>'
bg_new='<script src="background-sync.js?v=5"></script>'
note_fix_new='<script src="command-note-save-fix.js?v=1"></script>'
detail_new='<script src="embed-order-row-details.js?v=3"></script>'
price_new='<script src="modal-product-v4.js?v=3"></script>'
web_link_new='<script src="web-link-v31.js?v=1"></script>'
doc_new='<script src="doc-modal-simple.js?v=5"></script>'
reliability_new='<script src="production-reliability.js?v=3"></script>'
contrast_new='<script src="embed-contrast.js?v=3"></script>'

if embed_new not in s:
    replaced=False
    for old in (
        '<script src="embed-mode.js?v=9"></script>',
        '<script src="embed-mode.js?v=8"></script>',
        '<script src="embed-mode.js?v=7"></script>',
    ):
        if old in s:
            s=s.replace(old,embed_new,1)
            replaced=True
            break
    if not replaced:
        raise SystemExit('Référence embed-mode introuvable')

for old in (
    '<script src="collapsed-status-groups.js?v=1"></script>\n',
    '<script src="collapsed-status-groups.js?v=2"></script>\n',
    '<script src="collapsed-status-groups.js?v=3"></script>\n',
    '<script src="collapsed-status-groups.js?v=4"></script>\n',
    '<script src="collapsed-status-groups.js?v=1"></script>',
    '<script src="collapsed-status-groups.js?v=2"></script>',
    '<script src="collapsed-status-groups.js?v=3"></script>',
    '<script src="collapsed-status-groups.js?v=4"></script>',
):
    s=s.replace(old,'')

for old in (
    '<script src="embed-modal-fit.js?v=2"></script>\n',
    '<script src="embed-modal-fit.js?v=1"></script>\n',
    '<script src="embed-modal-compact.js?v=1"></script>\n',
    '<script src="embed-modal-fit.js?v=2"></script>',
    '<script src="embed-modal-fit.js?v=1"></script>',
    '<script src="embed-modal-compact.js?v=1"></script>',
):
    s=s.replace(old,'')

if stable_new not in s:s=s.replace(embed_new,embed_new+'\n'+stable_new,1)

kpi_replaced=False
for old in (
    '<script src="embed-kpi-shortcuts.js?v=7"></script>',
    '<script src="embed-kpi-shortcuts.js?v=6"></script>',
    '<script src="embed-kpi-shortcuts.js?v=5"></script>',
    '<script src="embed-kpi-shortcuts.js?v=4"></script>',
    '<script src="embed-kpi-shortcuts.js?v=3"></script>',
    '<script src="embed-kpi-shortcuts.js?v=2"></script>',
    '<script src="embed-kpi-shortcuts.js?v=1"></script>',
):
    if old in s:
        if old!=kpi_new:s=s.replace(old,kpi_new,1)
        kpi_replaced=True
        break
if not kpi_replaced:s=s.replace(stable_new,stable_new+'\n'+kpi_new,1)

choice_replaced=False
for old in (
    '<script src="choice-client-label.js?v=2"></script>',
    '<script src="choice-client-label.js?v=1"></script>',
):
    if old in s:
        if old!=choice_new:s=s.replace(old,choice_new,1)
        choice_replaced=True
        break
if not choice_replaced:s=s.replace(kpi_new,kpi_new+'\n'+choice_new,1)

bg_replaced=False
for old in (
    '<script src="background-sync.js?v=5"></script>',
    '<script src="background-sync.js?v=4"></script>',
    '<script src="background-sync.js?v=3"></script>',
    '<script src="background-sync.js?v=2"></script>',
    '<script src="background-sync.js?v=1"></script>',
):
    if old in s:
        if old!=bg_new:s=s.replace(old,bg_new,1)
        bg_replaced=True
        break
if not bg_replaced:s=s.replace(choice_new,choice_new+'\n'+bg_new,1)

for old in (
    '<script src="command-note-save-fix.js?v=1"></script>\n',
    '<script src="command-note-save-fix.js?v=1"></script>',
):
    s=s.replace(old,'')
s=s.replace(bg_new,bg_new+'\n'+note_fix_new,1)

detail_replaced=False
for old in (
    '<script src="embed-order-row-details.js?v=3"></script>',
    '<script src="embed-order-row-details.js?v=2"></script>',
    '<script src="embed-order-row-details.js?v=1"></script>',
):
    if old in s:
        if old!=detail_new:s=s.replace(old,detail_new,1)
        detail_replaced=True
        break
if not detail_replaced:s=s.replace(note_fix_new,note_fix_new+'\n'+detail_new,1)

# Modale produit premium : clic extérieur bloqué ; Annuler ou Enregistrer ferment la modale.
for old in (
    '<script src="modal-price-lock.js?v=1"></script>\n',
    '<script src="modal-price-lock.js?v=2"></script>\n',
    '<script src="modal-price-lock.js?v=3"></script>\n',
    '<script src="modal-product-v4.js?v=1"></script>\n',
    '<script src="modal-product-v4.js?v=2"></script>\n',
    '<script src="modal-product-v4.js?v=3"></script>\n',
    '<script src="modal-price-lock.js?v=1"></script>',
    '<script src="modal-price-lock.js?v=2"></script>',
    '<script src="modal-price-lock.js?v=3"></script>',
    '<script src="modal-product-v4.js?v=1"></script>',
    '<script src="modal-product-v4.js?v=2"></script>',
    '<script src="modal-product-v4.js?v=3"></script>',
):
    s=s.replace(old,'')
s=s.replace(detail_new,detail_new+'\n'+price_new,1)

# V31 : lien web rattaché au produit, ouvert dans un nouvel onglet.
for old in (
    '<script src="web-link-v31.js?v=1"></script>\n',
    '<script src="web-link-v31.js?v=1"></script>',
):
    s=s.replace(old,'')
s=s.replace(price_new,price_new+'\n'+web_link_new,1)

# Upload PDF v4 : fermeture immédiate, traitement arrière-plan, modale Upload failed en cas d'échec.
for old in (
    '<script src="doc-modal-simple.js?v=1"></script>\n',
    '<script src="doc-modal-simple.js?v=2"></script>\n',
    '<script src="doc-modal-simple.js?v=3"></script>\n',
    '<script src="doc-modal-simple.js?v=4"></script>\n',
    '<script src="doc-modal-simple.js?v=1"></script>',
    '<script src="doc-modal-simple.js?v=2"></script>',
    '<script src="doc-modal-simple.js?v=3"></script>',
    '<script src="doc-modal-simple.js?v=4"></script>',
):
    s=s.replace(old,'')
s=s.replace(price_new,price_new+'\n'+doc_new,1)

# V28 : une écriture n'est retirée de la file locale qu'après confirmation dans Google Sheets.
for old in (
    '<script src="production-reliability.js?v=1"></script>\n',
    '<script src="production-reliability.js?v=2"></script>\n',
    '<script src="production-reliability.js?v=3"></script>\n',
    '<script src="production-reliability.js?v=1"></script>',
    '<script src="production-reliability.js?v=2"></script>',
    '<script src="production-reliability.js?v=3"></script>',
):
    s=s.replace(old,'')
s=s.replace(doc_new,doc_new+'\n'+reliability_new,1)

# Contraste renforcé des titres et de la note commandes uniquement dans Yaya.
for old in (
    '<script src="embed-contrast.js?v=1"></script>\n',
    '<script src="embed-contrast.js?v=2"></script>\n',
    '<script src="embed-contrast.js?v=3"></script>\n',
    '<script src="embed-contrast.js?v=1"></script>',
    '<script src="embed-contrast.js?v=2"></script>',
    '<script src="embed-contrast.js?v=3"></script>',
):
    s=s.replace(old,'')
s=s.replace(reliability_new,reliability_new+'\n'+contrast_new,1)

# Le contrôleur d'état reste le dernier wrapper : un groupe ouvert reste ouvert jusqu'au clic utilisateur.
if collapsed_new not in s:
    s=s.replace(contrast_new,contrast_new+'\n'+collapsed_new,1)

old_boot='renderAll();hydrateYayaCache();tryOpenDeepLink();loadYayaChantiers().then(tryOpenDeepLink);loadAll();'
new_boot='renderAll();hydrateYayaCache();tryOpenDeepLink();'
if old_boot in s:s=s.replace(old_boot,new_boot,1)

old_poll='loadAll();setInterval(()=>{loadAll(true);loadYayaChantiers()},60000);'
if old_poll in s:s=s.replace(old_poll,'',1)

p.write_text(s,encoding='utf-8')
print('AB COMMANDES V28 - fiabilisation production installée')
