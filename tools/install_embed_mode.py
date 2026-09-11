from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

embed_new='<script src="embed-mode.js?v=10"></script>'
modal_new='<script src="embed-modal-fit.js?v=2"></script>'
kpi_new='<script src="embed-kpi-shortcuts.js?v=4"></script>'
choice_new='<script src="choice-client-label.js?v=1"></script>'
bg_new='<script src="background-sync.js?v=2"></script>'

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

if modal_new not in s:
    modal_old='<script src="embed-modal-fit.js?v=1"></script>'
    if modal_old in s:
        s=s.replace(modal_old,modal_new,1)
    else:
        s=s.replace(embed_new,embed_new+'\n'+modal_new,1)

kpi_replaced=False
for old in (
    '<script src="embed-kpi-shortcuts.js?v=3"></script>',
    '<script src="embed-kpi-shortcuts.js?v=2"></script>',
    '<script src="embed-kpi-shortcuts.js?v=1"></script>',
):
    if old in s:
        s=s.replace(old,kpi_new,1)
        kpi_replaced=True
        break
if not kpi_replaced and kpi_new not in s:
    s=s.replace(modal_new,modal_new+'\n'+kpi_new,1)

if choice_new not in s:
    s=s.replace(kpi_new,kpi_new+'\n'+choice_new,1)

bg_replaced=False
for old in (
    '<script src="background-sync.js?v=2"></script>',
    '<script src="background-sync.js?v=1"></script>',
):
    if old in s:
        if old!=bg_new:s=s.replace(old,bg_new,1)
        bg_replaced=True
        break
if not bg_replaced:
    s=s.replace(choice_new,choice_new+'\n'+bg_new,1)

old_poll='loadAll();setInterval(()=>{loadAll(true);loadYayaChantiers()},60000);'
if old_poll in s:
    s=s.replace(old_poll,'loadAll();',1)

p.write_text(s,encoding='utf-8')
print('AB COMMANDES - Choix client partout + raccourcis KPI v4')
