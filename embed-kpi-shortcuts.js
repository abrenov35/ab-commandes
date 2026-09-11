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

  try{
    if(typeof STATUSES!=='undefined'&&STATUSES.choice){
      STATUSES.choice.label='Choix client';
    }
  }catch(e){}

  const style=document.createElement('style');
  style.id='ab-commandes-embed-kpi-shortcuts-style';
  style.textContent=`
    body.ab-embed-mode #chantierFiche .fiche-kpis{
      display:grid!important;
      grid-template-columns:repeat(4,minmax(0,1fr))!important;
      gap:7px!important;
      margin:0 0 14px!important;
    }
    body.ab-embed-mode #chantierFiche .fiche-kpis .kpi.ab-kpi-shortcut{
      min-width:0!important;
      cursor:pointer!important;
      user-select:none!important;
      transition:border-color .12s ease,background .12s ease,transform .12s ease!important;
    }
    body.ab-embed-mode #chantierFiche .fiche-kpis .kpi.ab-kpi-shortcut:hover{
      border-color:#aebed2!important;
      background:#fbfcfe!important;
    }
    body.ab-embed-mode #chantierFiche .fiche-kpis .kpi.ab-kpi-shortcut:active{
      transform:translateY(1px)!important;
    }
    body.ab-embed-mode #chantierFiche .fiche-kpis .kpi.ab-kpi-shortcut:focus-visible{
      outline:2px solid #8fb4ef!important;
      outline-offset:2px!important;
    }
    body.ab-embed-mode #ficheAddBtn,
    body.ab-embed-mode #addBtn,
    body.ab-embed-mode #addBtnTop{
      display:none!important;
    }
    @media(max-width:760px){
      body.ab-embed-mode #chantierFiche .fiche-kpis{
        grid-template-columns:repeat(4,minmax(0,1fr))!important;
        gap:4px!important;
      }
    }
  `;
  document.head.appendChild(style);

  function keyName(v){
    return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toUpperCase();
  }

  function currentFicheOrders(){
    let all=[];
    try{all=(typeof orders!=='undefined'&&Array.isArray(orders))?orders:[];}catch(e){return []}

    let id='',name='';
    try{id=String(selectedChantierId||'').trim();}catch(e){}
    try{name=String(selectedChantierName||'').trim();}catch(e){}

    try{
      if(typeof matchingOrdersForChantier==='function')return matchingOrdersForChantier(id,name);
    }catch(e){}

    if(id){
      const k=keyName(name);
      return all.filter(o=>String(o&&o.chantierId||'').trim()===id||(k&&keyName(o&&o.chantier)===k));
    }
    if(name){
      const k=keyName(name);
      return all.filter(o=>keyName(o&&o.chantier)===k);
    }
    return [];
  }

  async function openForStatus(status){
    try{
      if(typeof selectedChantierId!=='undefined'&&selectedChantierId&&typeof presetChantierId!=='undefined'){
        presetChantierId=String(selectedChantierId);
      }
    }catch(e){}

    try{
      if(typeof openModal==='function')await openModal();
      const select=document.getElementById('fStatus');
      if(select){
        select.value=status;
        select.dispatchEvent(new Event('change',{bubbles:true}));
      }
    }catch(e){console.error('AB COMMANDES - ouverture raccourci statut',e)}
  }

  function removeLegacyAddButtons(){
    ['ficheAddBtn','addBtn','addBtnTop'].forEach(id=>{
      const el=document.getElementById(id);
      if(el)el.remove();
    });
  }

  function buildKpis(host){
    host.innerHTML=KPI_DEFS.map(k=>`
      <div class="card kpi ab-kpi-shortcut" data-ab-status="${k.status}" role="button" tabindex="0" aria-label="Ajouter un produit · ${k.label}" title="Ajouter un produit · ${k.label}">
        <span class="status-dot ${k.color}"></span>
        <div><strong id="${k.id}">0</strong><span>${k.label}</span></div>
      </div>
    `).join('')+'<span id="ficheKpiProblem" hidden aria-hidden="true">0</span>';
    host.dataset.abShortcutKpis='3';

    host.querySelectorAll('.ab-kpi-shortcut').forEach(card=>{
      const activate=()=>openForStatus(card.dataset.abStatus||'todo');
      card.addEventListener('click',activate);
      card.addEventListener('keydown',e=>{
        if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}
      });
    });
  }

  function updateKpis(){
    const host=document.querySelector('#chantierFiche .fiche-kpis');
    if(!host)return;
    if(host.dataset.abShortcutKpis!=='3'||host.querySelectorAll('.ab-kpi-shortcut').length!==4)buildKpis(host);

    const list=currentFicheOrders();
    KPI_DEFS.forEach(k=>{
      const el=document.getElementById(k.id);
      if(!el)return;
      const n=list.filter(o=>String(o&&o.status||'')===k.status).length;
      if(el.textContent!==String(n))el.textContent=String(n);
    });

    const problem=document.getElementById('ficheKpiProblem');
    if(problem)problem.textContent=String(list.filter(o=>String(o&&o.status||'')==='problem').length);
  }

  function renameChoiceLabels(){
    document.querySelectorAll('#chantierFiche,#commandes,#overview,#chantiers').forEach(root=>{
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
      const nodes=[];
      while(walker.nextNode())nodes.push(walker.currentNode);
      nodes.forEach(node=>{
        if(String(node.nodeValue||'').includes('Choix client à faire')){
          node.nodeValue=String(node.nodeValue).replaceAll('Choix client à faire','Choix client');
        }
      });
    });
  }

  function refresh(){
    removeLegacyAddButtons();
    updateKpis();
    renameChoiceLabels();
  }

  try{
    if(typeof renderChantierFiche==='function'){
      const originalRenderChantierFiche=renderChantierFiche;
      renderChantierFiche=function(){
        const result=originalRenderChantierFiche.apply(this,arguments);
        queueMicrotask(refresh);
        return result;
      };
    }
  }catch(e){}

  let scheduled=false;
  const observer=new MutationObserver(()=>{
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;refresh();});
  });
  observer.observe(document.body,{childList:true,subtree:true});

  window.addEventListener('load',refresh);
  setTimeout(refresh,20);
  setTimeout(refresh,150);
  setTimeout(refresh,600);

  window.__AB_COMMANDES_EMBED_KPI_SHORTCUTS_VERSION='3.0';
})();
