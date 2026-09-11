from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')
embed_new='<script src="embed-mode.js?v=10"></script>'
modal_new='<script src="embed-modal-fit.js?v=2"></script>'
kpi_new='<script src="embed-kpi-shortcuts.js?v=1"></script>'

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
        raise SystemExit('Référence embed-mode v9/v8/v7 introuvable : aucune insertion automatique')

if modal_new not in s:
    modal_old='<script src="embed-modal-fit.js?v=1"></script>'
    if modal_old in s:
        s=s.replace(modal_old,modal_new,1)
    else:
        s=s.replace(embed_new,embed_new+'\n'+modal_new,1)

if kpi_new not in s:
    s=s.replace(modal_new,modal_new+'\n'+kpi_new,1)

p.write_text(s,encoding='utf-8')
print('AB COMMANDES intégré Yaya - 4 KPI Choix client / À commander / Commandé / Reçu + raccourcis ajout')
