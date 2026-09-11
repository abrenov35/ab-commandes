(function(){
  'use strict';

  const params=new URL(window.location.href).searchParams;
  if(params.get('embed')!=='1')return;

  const KPI_DEFS=[
    {status:'choice',label:'Choix client',color:'purple',id:'ficheKpiChoice'},
    {status:'todo',label:'À commander',color:'orange',id:'ficheKpiTodo'},
    {status:'ordered',label:'Commandé',color:'blue',id:'ficheKpiOrdered'},
    {status:'received',label:'Reçu',color:'green',id:'ficheKpiReceived'}
  ];

  try{if(typeof STATUSES!=='undefined'&&STATUSES.choice)STATUSES.choice.label='Choix client'}catch(e){}

  const style=document.createElement('style');
  style.id='ab-commandes-embed-kpi-shortcuts-style';
  style.textContent=`
    body.ab-embed-mode #chantierFiche .fiche-kpis{
      display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;
      gap:7px!important;margin:0 0 14px!important;
    }
    body.ab-embed-mode #chantierFiche .fiche-kpis .kpi.ab-kpi-shortcut{
      min-width:0!important;cursor:pointer!important;user-select:none!important;touch-action:manipulation!important;
      transition:border-color .12s ease,background .12s ease,transform .12s ease!important;
    }
    body.ab-embed-mode #chantierFiche .fiche-kpis .kpi.ab-kpi-shortcut *{pointer-events:none!important}
    body.ab-embed-mode #chantierFiche .fiche-kpis .kpi.ab-kpi-shortcut:hover{border-color:#aebed2!important;background:#fbfcfe!important}
    body.ab-embed-mode #chantierFiche .fiche-kpis .kpi.ab-kpi-shortcut:active{transform:translateY(1px)!important}
    body.ab-embed-mode #ficheAddBtn,body.ab-embed-mode #addBtn,body.ab-embed-mode #addBtnTop{display:none!important}
    @media(max-width:760px){body.ab-embed-mode #chantierFiche .fiche-kpis{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:4px!important}}
  `;
  document.head.appendChild(style);

  function keyName(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toUpperCase()}

  function currentFicheOrders(){
    let all=[];try{all=(typeof orders!=='undefined'&&Array.isArray(orders))?orders:[]}catch(e){return []}
    let id='',name='';
    try{id=String(selectedChantierId||'').trim()}catch(e){}
    try{name=String(selectedChantierName||'').trim()}catch(e){}
    try{if(typeof matchingOrdersForChantier==='function')return matchingOrdersForChantier(id,name)}catch(e){}
    if(id){const k=keyName(name);return all.filter(o=>String(o&&o.chantierId||'').trim()===id||(k&&keyName(o&&o.chantier)===k))}
    if(name){const k=keyName(name);return all.filter(o=>keyName(o&&o.chantier)===k)}
    return [];
  }

  function currentChantier(){
    let id='',name='';
    try{id=String(selectedChantierId||'').trim()}catch(e){}
    try{name=String(selectedChantierName||'').trim()}catch(e){}
    try{if(typeof hydrateYayaCache==='function')hydrateYayaCache()}catch(e){}
    try{
      if(typeof yayaChantiers!=='undefined'&&Array.isArray(yayaChantiers)&&id&&!yayaChantiers.some(c=>String(c.id||'')===id)){
        yayaChantiers.unshift({id,nom:name||'Chantier',statut:'En cours'});
      }
    }catch(e){}
    return {id,name};
  }

  function openForStatus(status){
    const c=currentChantier();
    const modal=document.getElementById('modal');
    if(!modal)return;

    try{editId=null}catch(e){}
    try{presetChantierId=''}catch(e){}

    const title=document.getElementById('modalTitle');if(title)title.textContent='Ajouter un produit';
    try{if(typeof refreshChantierSelect==='function')refreshChantierSelect(c.id,c.name)}catch(e){}

    const chantier=document.getElementById('fChantier');
    if(chantier&&c.id){
      if(![...chantier.options].some(o=>String(o.value)===c.id)){
        const opt=document.createElement('option');opt.value=c.id;opt.textContent=c.name||'Chantier';chantier.appendChild(opt);
      }
      chantier.value=c.id;
    }

    const produit=document.getElementById('fProduit');if(produit)produit.value='';
    const qte=document.getElementById('fQte');if(qte)qte.value='';
    const fournisseur=document.getElementById('fFournisseur');if(fournisseur)fournisseur.value='';
    const resp=document.getElementById('fResp');if(resp)resp.value='Solenn 🍭';
    const notes=document.getElementById('fNotes');if(notes)notes.value='';
    const statusSelect=document.getElementById('fStatus');
    if(statusSelect){
      try{statusSelect.innerHTML=Object.entries(STATUSES).map(([k,s])=>`<option value="${k}">${s.label}</option>`).join('')}catch(e){}
      statusSelect.value=status;
    }

    modal.classList.add('show');
    document.dispatchEvent(new CustomEvent('ab-commandes-modal-open',{detail:{id:'modal'}}));
    requestAnimationFrame(()=>{try{produit&&produit.focus()}catch(e){}});
  }

  function removeLegacyAddButtons(){
    ['ficheAddBtn','addBtn','addBtnTop'].forEach(id=>{const el=document.getElementById(id);if(el)el.remove()});
  }

  function buildKpis(host){
    host.innerHTML=KPI_DEFS.map(k=>`
      <div class="card kpi ab-kpi-shortcut" data-ab-status="${k.status}" role="button" tabindex="0" aria-label="Ajouter un produit · ${k.label}" title="Ajouter un produit · ${k.label}">
        <span class="status-dot ${k.color}"></span><div><strong id="${k.id}">0</strong><span>${k.label}</span></div>
      </div>`).join('')+'<span id="ficheKpiProblem" hidden aria-hidden="true">0</span>';
    host.dataset.abShortcutKpis='6';
  }

  function updateKpis(){
    const host=document.querySelector('#chantierFiche .fiche-kpis');if(!host)return;
    if(host.dataset.abShortcutKpis!=='6'||host.querySelectorAll('.ab-kpi-shortcut').length!==4)buildKpis(host);
    const list=currentFicheOrders();
    KPI_DEFS.forEach(k=>{const el=document.getElementById(k.id);if(el)el.textContent=String(list.filter(o=>String(o&&o.status||'')===k.status).length)});
    const problem=document.getElementById('ficheKpiProblem');if(problem)problem.textContent=String(list.filter(o=>String(o&&o.status||'')==='problem').length);
  }

  function renameChoiceLabels(){
    document.querySelectorAll('#chantierFiche,#commandes,#overview,#chantiers').forEach(root=>{
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];
      while(walker.nextNode())nodes.push(walker.currentNode);
      nodes.forEach(node=>{if(String(node.nodeValue||'').includes('Choix client à faire'))node.nodeValue=String(node.nodeValue).replaceAll('Choix client à faire','Choix client')});
    });
  }

  function refresh(){removeLegacyAddButtons();updateKpis();renameChoiceLabels()}

  document.addEventListener('click',e=>{
    const card=e.target&&e.target.closest?e.target.closest('#chantierFiche .ab-kpi-shortcut'):null;
    if(!card)return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    openForStatus(card.dataset.abStatus||'todo');
  },true);

  document.addEventListener('keydown',e=>{
    if(e.key!=='Enter'&&e.key!==' ')return;
    const card=e.target&&e.target.closest?e.target.closest('#chantierFiche .ab-kpi-shortcut'):null;
    if(!card)return;
    e.preventDefault();e.stopPropagation();
    openForStatus(card.dataset.abStatus||'todo');
  },true);

  try{
    if(typeof renderChantierFiche==='function'&&!renderChantierFiche.__abKpiWrapped){
      const original=renderChantierFiche;
      const wrapped=function(){const result=original.apply(this,arguments);queueMicrotask(refresh);return result};
      wrapped.__abKpiWrapped=true;
      renderChantierFiche=wrapped;
    }
  }catch(e){}

  window.addEventListener('load',refresh,{once:true});
  setTimeout(refresh,20);setTimeout(refresh,180);setTimeout(refresh,700);
  window.__AB_COMMANDES_EMBED_KPI_SHORTCUTS_VERSION='6.0';
})();
