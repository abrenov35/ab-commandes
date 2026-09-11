(function(){
  'use strict';
  const params=new URL(window.location.href).searchParams;

  /* AB_COMMANDES_V36 */
  const STATUS_SEQUENCE=['choice','todo','ordered','received'];
  const COMMAND_NOTE_COMMAND_ID='__AB_NOTE_COMMANDES__';
  const COMMAND_NOTE_TYPE='Note commandes';
  const ACTIVE_CHANTIER_COMMAND_ID='__AB_CHANTIER_ACTIVE__';
  const ACTIVE_CHANTIER_TYPE='Chantier actif';
  const ACTIVE_CHANTIER_NAME='CHANTIER_ACTIF';

  const style=document.createElement('style');
  style.id='ab-commandes-v36-style';
  style.textContent=`
    @media(max-width:1150px){
      html,body{margin:0!important;padding:0!important}
      body:not(.ab-embed-mode) .app{display:block!important;min-height:0!important;height:auto!important}
      body:not(.ab-embed-mode) .side{box-sizing:border-box!important;width:100%!important;height:42px!important;min-height:42px!important;max-height:42px!important;padding:0 8px!important;margin:0!important;position:sticky!important;top:0!important;left:0!important;z-index:100!important;display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:flex-start!important;gap:8px!important;overflow:hidden!important;background:#123f6b!important;border:0!important;border-bottom:1px solid rgba(255,255,255,.14)!important;box-shadow:0 3px 12px rgba(20,33,61,.14)!important}
      body:not(.ab-embed-mode) .side .brand{display:flex!important;align-items:center!important;align-self:stretch!important;flex:0 0 auto!important;color:#fff!important;font-size:13px!important;line-height:1!important;white-space:nowrap!important;margin:0!important;padding:0 11px 0 7px!important;border-right:1px solid rgba(255,255,255,.28)!important;font-weight:900!important}
      body:not(.ab-embed-mode) .side .brand small,body:not(.ab-embed-mode) .side .sync{display:none!important}
      body:not(.ab-embed-mode) .side .nav{min-width:0!important;height:42px!important;flex:0 1 auto!important;display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:flex-start!important;gap:7px!important;margin:0!important;padding:0!important;overflow-x:auto!important;overflow-y:hidden!important;scrollbar-width:none!important}
      body:not(.ab-embed-mode) .side .nav::-webkit-scrollbar{display:none!important}
      body:not(.ab-embed-mode) .side .nav button{box-sizing:border-box!important;flex:0 0 auto!important;height:28px!important;min-height:28px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;white-space:nowrap!important;color:#fff!important;background:rgba(255,255,255,.08)!important;border:1px solid rgba(255,255,255,.38)!important;padding:0 12px!important;margin:0!important;border-radius:5px!important;font-size:12px!important;line-height:1!important;font-weight:800!important;box-shadow:none!important}
      body:not(.ab-embed-mode) .side .nav button:hover{background:rgba(255,255,255,.16)!important;color:#fff!important}
      body:not(.ab-embed-mode) .side .nav button.active{background:rgba(255,255,255,.13)!important;color:#fff!important;border-color:rgba(255,255,255,.65)!important;box-shadow:inset 0 -2px 0 #f5c400!important}
      body:not(.ab-embed-mode) .main{display:block!important;padding:8px 12px 16px!important;margin:0 auto!important;max-width:1500px!important;min-height:0!important}
      body:not(.ab-embed-mode) .view.active{margin-top:0!important;padding-top:0!important}
    }
    @media(max-width:760px){
      body:not(.ab-embed-mode) .side{height:40px!important;min-height:40px!important;max-height:40px!important;padding:0 6px!important;gap:6px!important}
      body:not(.ab-embed-mode) .side .brand{font-size:11px!important;padding:0 8px 0 4px!important}
      body:not(.ab-embed-mode) .side .nav{height:40px!important;gap:5px!important}
      body:not(.ab-embed-mode) .side .nav button{height:27px!important;min-height:27px!important;padding:0 9px!important;font-size:11px!important}
      body:not(.ab-embed-mode) .main{padding:7px 8px 12px!important}
    }
    .ab-status-body>.order-row.header{display:none!important}
    #chantierFiche>.order-row.header,#commandes>.order-row.header{display:none!important}
    #chantierFiche .fiche-kpis .kpi[data-ab-hidden-problem="1"],#abOverviewKpis .ab-kpi-card[data-ab-hidden-problem="1"]{display:none!important}
    #chantiers .ab-section-title{display:none!important}
    #chantiers .top{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;margin-bottom:12px!important}
    #chantiers .top .title{display:flex!important;align-items:baseline!important;gap:10px!important;flex-wrap:wrap!important}
    #chantiers .top .title h1,#chantiers .top .title p{margin:0!important}
    .ab-chantiers-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end}
    .ab-open-block-btn{background:#162d49!important;color:#fff!important;border-color:#162d49!important}
    .ab-open-panel{display:none;background:#fff;border:1px solid #dfe5ee;border-radius:11px;padding:12px;margin:0 0 12px;box-shadow:0 5px 18px rgba(20,33,61,.04)}
    .ab-open-panel.show{display:grid;grid-template-columns:minmax(220px,1fr) auto auto;gap:8px;align-items:center}
    .ab-open-panel select{width:100%;border:1px solid #dfe5ee;border-radius:8px;padding:9px 10px;background:#fff;color:#17243a}
    .ab-manual-empty{font-size:11px;color:#7b8799}
    .ab-command-note{margin-top:14px;background:#f7f9fc;border:1px solid #ccd6e3;border-radius:11px;padding:12px}
    .ab-command-note-title{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:900;color:#233a5a;margin-bottom:8px;text-transform:uppercase;letter-spacing:.02em}
    .ab-command-note-empty{width:100%;border:1px dashed #95a9c1;background:#fff;border-radius:8px;min-height:38px;padding:9px 12px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#28476e;cursor:pointer}
    .ab-command-note-text{white-space:pre-wrap;background:#fff;border:1px solid #dce3eb;border-radius:8px;padding:10px 12px;font-size:13px;line-height:1.45;color:#2e405a;cursor:pointer}
    .ab-command-note-edit{display:grid;gap:8px}
    .ab-command-note-edit textarea{width:100%;min-height:82px;resize:vertical;border:1px solid #b9c7d8;border-radius:8px;padding:10px 11px;background:#fff;color:#1e304a;outline:none}
    .ab-command-note-actions{display:flex;justify-content:flex-end;gap:7px}
    .ab-command-note-actions button{border-radius:7px;padding:7px 11px;font-size:12px;font-weight:800;cursor:pointer}
    .ab-command-note-cancel{background:#fff;border:1px solid #d5dde7;color:#44546b}
    .ab-command-note-save{background:#162d49;border:1px solid #162d49;color:#fff}
    .ab-command-note-status{font-size:11px;color:#7b889b;margin-top:6px}
    @media(max-width:620px){.ab-open-panel.show{grid-template-columns:1fr}#chantiers .top{align-items:flex-start!important}.ab-command-note{padding:10px;margin-top:10px}}
  `;
  document.head.appendChild(style);

  function textKey(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase()}
  function escHtml(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  function switchView(id){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));const v=document.getElementById(id);if(v)v.classList.add('active')}
  function setNavActive(btn){document.querySelectorAll('.side .nav button').forEach(x=>x.classList.remove('active'));if(btn)btn.classList.add('active')}
  function clearStatusFilter(){const f=document.getElementById('filterStatus');if(f)f.value=''}

  function makeNavButton(nav,attrs,before){
    const b=document.createElement('button');b.type='button';Object.entries(attrs||{}).forEach(([k,v])=>b.dataset[k]=v);
    if(before)nav.insertBefore(b,before);else nav.appendChild(b);return b;
  }

  function installToolbar(){
    const nav=document.querySelector('.side .nav');if(!nav)return;
    let overview=nav.querySelector('button[data-view="overview"]');
    if(!overview){overview=makeNavButton(nav,{view:'overview'},nav.firstElementChild);}
    let chantiers=nav.querySelector('button[data-view="chantiers"]');
    if(!chantiers){chantiers=makeNavButton(nav,{view:'chantiers'},overview.nextElementSibling);}
    let commandes=nav.querySelector('button[data-view="commandes"]');
    if(!commandes){commandes=makeNavButton(nav,{view:'commandes'},chantiers.nextElementSibling);}

    overview.textContent="⌂ Vue d'ensemble";
    chantiers.textContent='🛠 Chantiers actifs';
    chantiers.title='Voir les chantiers actifs';
    commandes.textContent='📦 Commandes';

    overview.onclick=()=>{clearStatusFilter();setNavActive(overview);switchView('overview');if(typeof renderAll==='function')renderAll()};
    chantiers.onclick=()=>{clearStatusFilter();setNavActive(chantiers);switchView('chantiers');if(typeof renderAll==='function')renderAll()};
    commandes.onclick=()=>{clearStatusFilter();setNavActive(commandes);switchView('commandes');if(typeof renderAll==='function')renderAll()};

    const defs=[['todo','🟠 À commander'],['received','🟢 Reçu'],['choice','🟣 Choix client']];
    const statusButtons=[];
    defs.forEach(([status,label])=>{
      let b=nav.querySelector(`button[data-ab-status-nav="${status}"]`);
      if(!b){b=document.createElement('button');b.type='button';b.dataset.abStatusNav=status;}
      b.textContent=label;
      b.onclick=()=>{const f=document.getElementById('filterStatus');if(f)f.value=status;setNavActive(b);switchView('commandes');if(typeof renderAll==='function')renderAll()};
      statusButtons.push(b);
    });

    [overview,chantiers,commandes,...statusButtons].forEach(b=>nav.appendChild(b));
  }

  function statusFromText(v){const t=textKey(v);if(t.includes('choix client'))return 'choice';if(t.includes('a commander'))return 'todo';if(t==='commande'||t.includes('commande'))return 'ordered';if(t.includes('recu'))return 'received';if(t.includes('probleme'))return 'problem';return ''}
  function patchStatusSelect(sel){
    if(!sel||!sel.options)return;const current=String(sel.value||'');const map=new Map([...sel.options].map(o=>[o.value,o]));const problem=map.get('problem');if(problem)problem.remove();STATUS_SEQUENCE.forEach(k=>{const o=map.get(k);if(o)sel.appendChild(o)});if(current&&current!=='problem'&&map.get(current))sel.value=current;else if(current==='problem'&&map.get('todo'))sel.value='todo';
  }
  function patchStatuses(){
    document.querySelectorAll('.ab-status-groups').forEach(group=>{const sections=[...group.querySelectorAll(':scope > .ab-status-section')],byStatus=new Map();sections.forEach(section=>{const key=statusFromText(section.querySelector('.ab-status-heading')?.textContent||'');if(key==='problem'){section.remove();return}if(key)byStatus.set(key,section)});STATUS_SEQUENCE.forEach(k=>{const s=byStatus.get(k);if(s)group.appendChild(s)})});
    document.querySelectorAll('select.status-select,#fStatus,#filterStatus').forEach(patchStatusSelect);
    document.querySelectorAll('#chantierFiche .fiche-kpis .kpi').forEach(card=>{if(textKey(card.textContent).includes('probleme'))card.dataset.abHiddenProblem='1'});
    document.querySelectorAll('#abOverviewKpis .ab-kpi-card').forEach(card=>{if(textKey(card.textContent).includes('probleme'))card.dataset.abHiddenProblem='1'});
    document.querySelectorAll('.ab-status-body>.order-row.header,#chantierFiche>.order-row.header,#commandes>.order-row.header').forEach(x=>x.remove());
  }

  function commandNoteMarkers(){try{return (Array.isArray(documents)?documents:[]).filter(d=>String(d.commande_id||'')===COMMAND_NOTE_COMMAND_ID||String(d.type||'')===COMMAND_NOTE_TYPE)}catch(e){return []}}
  function currentCommandNote(){const id=String(typeof selectedChantierId!=='undefined'?selectedChantierId:'').trim(),name=String(typeof selectedChantierName!=='undefined'?selectedChantierName:'').trim(),nk=textKey(name);return commandNoteMarkers().find(d=>{const did=String(d.auteur||'').trim();return(id&&did&&id===did)||(nk&&textKey(d.chantier)===nk)})||null}
  function renderCommandNote(){
    const list=document.getElementById('ficheOrdersList');if(!list)return;const id=String(typeof selectedChantierId!=='undefined'?selectedChantierId:'').trim(),name=String(typeof selectedChantierName!=='undefined'?selectedChantierName:'').trim();if(!id&&!name)return;
    let box=document.getElementById('abCommandNote');if(!box){box=document.createElement('section');box.id='abCommandNote';box.className='ab-command-note';list.insertAdjacentElement('afterend',box)}
    const key=id||textKey(name);if(box.dataset.editing==='1'&&box.dataset.key===key)return;box.dataset.key=key;const marker=currentCommandNote(),note=marker?String(marker.nom_fichier||'').trim():'';
    box.innerHTML=`<div class="ab-command-note-title">📝 NOTE COMMANDES</div>${note?`<div class="ab-command-note-text" id="abCommandNoteText">${escHtml(note)}</div><div class="ab-command-note-status">Cliquer sur la note pour la modifier.</div>`:`<button type="button" class="ab-command-note-empty" id="abCommandNoteAdd">+ Ajouter une note</button>`}`;
    const trigger=box.querySelector('#abCommandNoteAdd,#abCommandNoteText');if(trigger)trigger.onclick=()=>editCommandNote(note);
  }
  function editCommandNote(value){
    const box=document.getElementById('abCommandNote');if(!box)return;box.dataset.editing='1';box.innerHTML=`<div class="ab-command-note-title">📝 NOTE COMMANDES</div><div class="ab-command-note-edit"><textarea id="abCommandNoteInput" placeholder="Ajouter une note utile pour les commandes de ce chantier…">${escHtml(value||'')}</textarea><div class="ab-command-note-actions"><button type="button" class="ab-command-note-cancel" id="abCommandNoteCancel">Annuler</button><button type="button" class="ab-command-note-save" id="abCommandNoteSave">Enregistrer</button></div></div>`;
    const input=box.querySelector('#abCommandNoteInput');if(input)input.focus();box.querySelector('#abCommandNoteCancel').onclick=()=>{box.dataset.editing='0';renderCommandNote()};box.querySelector('#abCommandNoteSave').onclick=()=>saveCommandNote(input?.value||'');
  }
  async function saveCommandNote(value){
    const text=String(value||'').trim(),existing=currentCommandNote(),id=String(typeof selectedChantierId!=='undefined'?selectedChantierId:'').trim(),name=String(typeof selectedChantierName!=='undefined'?selectedChantierName:'').trim(),box=document.getElementById('abCommandNote');
    try{if(typeof showSaving==='function')showSaving(true,'Enregistrement de la note…');if(!text){if(existing&&typeof post==='function')await post({action:'document_delete',id:existing.id})}else if(typeof post==='function')await post({action:'document_upsert',id:existing?.id||('note-commandes-'+(typeof uid==='function'?uid():Date.now())),commande_id:COMMAND_NOTE_COMMAND_ID,chantier:name,type:COMMAND_NOTE_TYPE,nom_fichier:text,url_pdf:'',source:'AB COMMANDES',date_document:new Date().toISOString().slice(0,10),auteur:id});if(box)box.dataset.editing='0';await new Promise(r=>setTimeout(r,350));if(typeof loadAll==='function')await loadAll(true);else renderCommandNote()}catch(e){alert('Enregistrement de la note impossible : '+(e?.message||e))}finally{if(typeof showSaving==='function')showSaving(false)}
  }

  function activeChantierMarkers(){try{return (Array.isArray(documents)?documents:[]).filter(d=>String(d.commande_id||'')===ACTIVE_CHANTIER_COMMAND_ID||(String(d.type||'')===ACTIVE_CHANTIER_TYPE&&String(d.nom_fichier||'')===ACTIVE_CHANTIER_NAME))}catch(e){return []}}
  function markerMatchesChantier(marker,id,name){const mid=String(marker.auteur||'').trim(),idStr=String(id||'').trim();return(mid&&idStr&&mid===idStr)||Boolean(textKey(name)&&textKey(marker.chantier)===textKey(name))}
  function existingCardFor(id,name){return[...document.querySelectorAll('#abActiveChantiers .ab-chantier-card')].some(card=>{const btn=card.querySelector('.ab-open-chantier,.ab-open-manual');if(!btn)return false;return(id&&String(btn.dataset.id||'')===String(id))||textKey(btn.dataset.name||'')===textKey(name)})}
  function ensureChantiersTop(){
    const view=document.getElementById('chantiers'),top=view?.querySelector('.top');if(!view||!top)return;const h=top.querySelector('.title h1');if(h)h.textContent='Chantiers actifs';const p=top.querySelector('.title p');if(p)p.textContent='Chantiers ouverts pour le suivi des commandes';
    let actions=top.querySelector('.ab-chantiers-actions');if(!actions){actions=document.createElement('div');actions.className='ab-chantiers-actions';top.appendChild(actions)}const archive=top.querySelector('#abArchivesToggle');let openBtn=document.getElementById('abOpenChantierBlock');if(!openBtn){openBtn=document.createElement('button');openBtn.id='abOpenChantierBlock';openBtn.className='btn ab-open-block-btn';openBtn.textContent='+ Ouvrir un chantier';openBtn.onclick=toggleOpenChantierPanel;actions.appendChild(openBtn)}if(archive&&archive.parentElement!==actions)actions.appendChild(archive);ensureOpenChantierPanel(top);
  }
  function ensureOpenChantierPanel(top){let panel=document.getElementById('abOpenChantierPanel');if(panel)return panel;panel=document.createElement('div');panel.id='abOpenChantierPanel';panel.className='ab-open-panel';panel.innerHTML='<select id="abOpenChantierSelect"><option value="">Choisir un chantier Yaya…</option></select><button type="button" class="btn" id="abOpenChantierConfirm">Créer le pavé</button><button type="button" class="btn secondary" id="abOpenChantierCancel">Annuler</button>';top.insertAdjacentElement('afterend',panel);panel.querySelector('#abOpenChantierConfirm').onclick=createActiveChantierBlock;panel.querySelector('#abOpenChantierCancel').onclick=()=>panel.classList.remove('show');return panel}
  async function toggleOpenChantierPanel(){
    const panel=document.getElementById('abOpenChantierPanel');if(!panel)return;const show=!panel.classList.contains('show');panel.classList.toggle('show',show);if(!show)return;try{if((!Array.isArray(yayaChantiers)||!yayaChantiers.length)&&typeof loadYayaChantiers==='function')await loadYayaChantiers(true)}catch(e){}
    const select=document.getElementById('abOpenChantierSelect');if(!select)return;const markers=activeChantierMarkers();const options=(Array.isArray(yayaChantiers)?yayaChantiers:[]).filter(c=>{const id=String(c.id||''),name=String(c.nom||'').trim();return name&&!existingCardFor(id,name)&&!markers.some(m=>markerMatchesChantier(m,id,name))}).sort((a,b)=>String(a.nom||'').localeCompare(String(b.nom||''),'fr',{sensitivity:'base'}));select.innerHTML='<option value="">Choisir un chantier Yaya…</option>'+options.map(c=>`<option value="${escHtml(c.id)}">${escHtml(c.nom)}</option>`).join('');
  }
  async function createActiveChantierBlock(){
    const select=document.getElementById('abOpenChantierSelect');if(!select?.value){alert('Choisis un chantier.');return}const yc=(Array.isArray(yayaChantiers)?yayaChantiers:[]).find(c=>String(c.id)===String(select.value));if(!yc)return;const name=String(yc.nom||'').trim();
    try{if(typeof showSaving==='function')showSaving(true,'Ouverture du chantier…');await post({action:'document_upsert',id:'active-'+(typeof uid==='function'?uid():Date.now()),commande_id:ACTIVE_CHANTIER_COMMAND_ID,chantier:name,type:ACTIVE_CHANTIER_TYPE,nom_fichier:ACTIVE_CHANTIER_NAME,url_pdf:'',source:'AB COMMANDES',date_document:new Date().toISOString().slice(0,10),auteur:String(yc.id||'')});await new Promise(r=>setTimeout(r,350));if(typeof loadAll==='function')await loadAll(true);document.getElementById('abOpenChantierPanel')?.classList.remove('show');applyAll()}catch(e){alert('Impossible d’ouvrir le chantier : '+(e?.message||e))}finally{if(typeof showSaving==='function')showSaving(false)}
  }
  function renderManualActiveCards(){
    const host=document.getElementById('abActiveChantiers');if(!host)return;activeChantierMarkers().forEach(m=>{const id=String(m.auteur||''),name=String(m.chantier||'').trim();if(!name||existingCardFor(id,name))return;const card=document.createElement('article');card.className='card ab-chantier-card';card.innerHTML=`<div class="ab-chantier-top"><div><button class="ab-chantier-name ab-open-manual" data-id="${escHtml(id)}" data-name="${escHtml(name)}">${escHtml(name)}</button><div class="ab-chantier-meta">0 produit</div></div></div><div class="ab-manual-empty">Aucun produit enregistré pour ce chantier.</div><div class="ab-card-actions"><button class="ab-btn-small primary ab-open-manual" data-id="${escHtml(id)}" data-name="${escHtml(name)}">Ouvrir</button></div>`;host.appendChild(card)});host.querySelectorAll('.ab-open-manual').forEach(b=>b.onclick=()=>{if(typeof openChantierFiche==='function')openChantierFiche(b.dataset.id,b.dataset.name)});
  }

  function patchCommandesTitle(){const v=document.getElementById('commandes');if(!v)return;const h=v.querySelector('.title h1');if(h)h.textContent='Commandes';const p=v.querySelector('.title p');if(p)p.textContent='Toutes les commandes, avec accès rapide par statut'}
  function applyAll(){try{installToolbar();patchStatuses();renderCommandNote();ensureChantiersTop();renderManualActiveCards();patchCommandesTitle()}catch(e){console.error('AB COMMANDES V36:',e)}}

  try{if(typeof renderAll==='function'&&!renderAll.__abV36){const original=renderAll;const wrapped=function(){const r=original.apply(this,arguments);requestAnimationFrame(applyAll);return r};wrapped.__abV36=true;renderAll=wrapped;window.renderAll=wrapped}}catch(e){}
  try{if(typeof openModal==='function'&&!openModal.__abV36){const original=openModal;const wrapped=async function(){const r=await original.apply(this,arguments);patchStatusSelect(document.getElementById('fStatus'));return r};wrapped.__abV36=true;openModal=wrapped;window.openModal=wrapped}}catch(e){}

  installToolbar();requestAnimationFrame(applyAll);[200,500,1200,2500].forEach(t=>setTimeout(applyAll,t));
  const nav=document.querySelector('.side .nav');if(nav)new MutationObserver(()=>requestAnimationFrame(installToolbar)).observe(nav,{childList:true,subtree:true,characterData:true});

  if(params.get('embed')!=='1')return;
  document.documentElement.classList.add('ab-embed-mode');document.body.classList.add('ab-embed-mode');
  const embedStyle=document.createElement('style');embedStyle.id='ab-commandes-embed-style';embedStyle.textContent=`
    html.ab-embed-mode,body.ab-embed-mode{background:#fff!important;min-height:0!important;overflow:hidden!important}
    body.ab-embed-mode .app{display:block!important;min-height:0!important}body.ab-embed-mode .side{display:none!important}
    body.ab-embed-mode .main{padding:8px 14px 8px!important;max-width:none!important;margin:0!important}
    body.ab-embed-mode #chantierFiche{margin:0!important;padding-bottom:0!important}body.ab-embed-mode .fiche-back{display:none!important}
    body.ab-embed-mode #chantierFiche .yaya,body.ab-embed-mode #chantierFiche .top,body.ab-embed-mode #chantierFiche .title,body.ab-embed-mode #chantierFiche .fiche-sub,body.ab-embed-mode #chantierFiche>.order-row.header{display:none!important}
    body.ab-embed-mode .toolbar{margin:12px 0 9px!important}body.ab-embed-mode #chantierFiche .toolbar h2{display:none!important}
    body.ab-embed-mode .order-row{box-shadow:none!important}body.ab-embed-mode .empty{margin-bottom:0!important;padding:18px!important}body.ab-embed-mode .ab-status-groups{gap:8px!important}body.ab-embed-mode .ab-status-section summary{padding:10px 12px!important}body.ab-embed-mode .ab-status-body{padding:0 8px 8px!important}
  `;document.head.appendChild(embedStyle);
  function sendHeight(){try{const h=Math.max(120,Math.ceil(Math.max(document.body.scrollHeight||0,document.documentElement.scrollHeight||0))+2);window.parent.postMessage({type:'AB_COMMANDES_HEIGHT',height:h},'*')}catch(e){}}
  const ro=new ResizeObserver(()=>requestAnimationFrame(sendHeight));ro.observe(document.documentElement);ro.observe(document.body);window.addEventListener('load',sendHeight);window.addEventListener('resize',sendHeight);new MutationObserver(()=>requestAnimationFrame(sendHeight)).observe(document.body,{childList:true,subtree:true,attributes:true});[50,180,500,1200,2200].forEach(t=>setTimeout(sendHeight,t));
  window.__AB_COMMANDES_EMBED_CACHE_VERSION='3.4';
})();
