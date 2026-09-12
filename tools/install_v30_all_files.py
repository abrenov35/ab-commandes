from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')
s = s.replace('doc-modal-simple.js?v=4', 'doc-modal-simple.js?v=5')
s = s.replace('doc-upload-reliability-v29.js?v=1', 'doc-upload-reliability-v29.js?v=2')
p.write_text(s, encoding='utf-8')

installer = Path('tools/install_embed_mode.py')
if installer.exists():
    t = installer.read_text(encoding='utf-8')
    t = t.replace("doc_new='<script src=\"doc-modal-simple.js?v=4\"></script>'", "doc_new='<script src=\"doc-modal-simple.js?v=5\"></script>'")
    if '<script src="doc-modal-simple.js?v=5"></script>' not in t:
        t = t.replace("'<script src=\"doc-modal-simple.js?v=4\"></script>\\n',", "'<script src=\"doc-modal-simple.js?v=4\"></script>\\n',\n    '<script src=\"doc-modal-simple.js?v=5\"></script>\\n',")
        t = t.replace("'<script src=\"doc-modal-simple.js?v=4\"></script>',", "'<script src=\"doc-modal-simple.js?v=4\"></script>',\n    '<script src=\"doc-modal-simple.js?v=5\"></script>',")
    installer.write_text(t, encoding='utf-8')

print('AB COMMANDES V30 - tous fichiers actifs')
