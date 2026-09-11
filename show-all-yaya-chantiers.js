(function(){
  'use strict';

  const ARCHIVE_COMMAND_ID='__AB_CHANTIER_ARCHIVE__';
  const ARCHIVE_TYPE='Archive chantier';
  let showArchived=false;

  function cleanName(v){return String(v||'').replace(/^[\s•·▪◦\-–—]+/,'').trim()}
  function keyName(v){return normName(cleanName(v)).replace(/[^A-Z0-9]+/g,' ').trim()}
  function isRealChantierName(v){return !!keyName(v)}

  /*
   * Important : on conserve tous les chantiers Yaya actifs dans le sélecteur
   * "Ajouter un produit" afin de pouvoir démarrer le suivi d'un nouveau chantier.
   * Les vues de suivi, elles, sont construites exclusivement depuis les commandes.
   */
  window.activeYayaChantiers=function(){
    const src=Array.isArray(yayaChantiers)?yayaChantiers:[];
    return src.filter(c=>{
      const statut=String(c?.statut||'').trim().toLowerCase();
      return statut!=='terminé'&&statut!=='termine'&&statut!=='archivé'&&statut!=='archive';
    });
  };

  function archiveDocs(){
    const src=Array.isArray(documents)?documents:[];
    return src.filter(d=>String(d?.commande_id||'')===ARCHIVE_COMMAND_ID&&String(d?.type||'')===ARCHIVE_TYPE);
  }

  function archiveMap(){
    const m=new Map();
    archiveDocs().forEach(d=>{
      const key=keyName(d?.chantier);
      if(key&&!m.has(key))m.set(key,d);
    });
    return m;
  }

  function isArchived(name){return archiveMap().has(keyName(name))}

  function markerId(name){
    const s=keyName(name);
    let h=2166136261;
    for(let i=0;i<s.length;i++){
      h^=s.charCodeAt(i);
      h=Math.imul(h,16777619);
    }
    return 'AB-CHANTIER-ARCHIVE-'+(h>>>0).toString(36).toUpperCase();
  }

  function makeArchiveDoc(name){
    return {
      id:markerId(name),
      commande_id:ARCHIVE_COMMAND_ID,
      chantier:cleanName(name),
      type:ARCHIVE_TYPE,
      nom_fichier:'Chantier archivé du suivi commandes',
      url_pdf:'',
      source:'AB COMMANDES',
      date_document:new Date().toISOString().slice(0,10),
      auteur:''
    };
  }

  function orderChantiers(source){
    const byName=new Map();
    const rows=Array.isArray(source)?source:[];

    rows.forEach(o=>{
      const name=cleanName(o?.chantier),key=keyName(name),id=String(o?.chantierId||'');
      if(!key||!isRealChantierName(name))return;
      const prev=byName.get(key);
      if(!prev)byName.set(key,{id,name});
      else if(!prev.id&&id)prev.id=id;
    });

    return [...byName.values()];
  }

  window.overviewChantierList=function(){
    const q=$('#search')?.value.trim().toLowerCase()||'';
    const resp=$('#filterResp')?.value||'';
    const st=$('#filterStatus')?.value||'';

    return orderChantiers(orders).filter(c=>{
      if(isArchived(c.name))return false;
      const os=matchingOrdersForChantier(c.id,c.name);
      if(!os.length)return false;
      const searchOk=!q||c.name.toLowerCase().includes(q)||os.some(o=>[o.produit,o.fournisseur,o.responsable].join(' ').toLowerCase().includes(q));
      const respOk=!resp||os.some(o=>o.responsable===resp);
      const statusOk=!st||os.some(o=>o.status===st);
      return searchOk&&respOk&&statusOk;
    }).sort((a,b)=>a.name.localeCompare(b.name,'fr',{sensitivity:'base'}));
  };

  function chantierDataFromOrders(){
    const m=new Map();

    (Array.isArray(orders)?orders:[]).forEach(o=>{
      const name=cleanName(o?.chantier),key=keyName(name);
      if(!key||!isRealChantierName(name))return;
      if(!m.has(key))m.set(key,{
        chantier:name,
        chantierId:String(o?.chantierId||''),
        responsable:'',
        all:0,
        received:0,
        problem:0,
        todo:0,
        choice:0,
        ordered:0
      });
      const x=m.get(key);
      if(!x.chantierId&&o?.chantierId)x.chantierId=String(o.chantierId);
      x.all++;
      if(o?.responsable)x.responsable=o.responsable;
      if(o?.status==='received')x.received++;
      if(o?.status==='problem')x.problem++;
      if(o?.status==='todo')x.todo++;
      if(o?.status==='choice')x.choice++;
      if(o?.status==='ordered')x.ordered++;
    });

    const rank=x=>x.problem?0:x.todo?1:x.choice?2:x.received<x.all?3:4;
    return [...m.values()]
      .filter(x=>showArchived?isArchived(x.chantier):!isArchived(x.chantier))
      .sort((a,b)=>rank(a)-rank(b)||String(a.chantier).localeCompare(String(b.chantier),'fr',{sensitivity:'base'}));
  }

  window.chantierData=function(){return chantierDataFromOrders()};

  function rowAlert(x){
    if(x.problem)return {label:`${x.problem} problème${x.problem>1?'s':''}`,cl:''};
    if(x.todo)return {label:`${x.todo} à commander`,cl:''};
    if(x.choice)return {label:`${x.choice} choix client`,cl:'orange'};
    if(x.received===x.all)return {label:'Tout reçu',cl:'ok'};
    return {label:'En cours',cl:'orange'};
  }

  window.chantierRows=function(){
    return chantierDataFromOrders().map(x=>{
      const pct=x.all?Math.round(x.received/x.all*100):0;
      const alert=rowAlert(x);
      const archived=isArchived(x.chantier);
      const action=archived
        ? `<button type="button" class="tracked-archive-btn restore" data-chantier-name="${esc(x.chantier)}">Réactiver</button>`
        : `<button type="button" class="tracked-archive-btn" data-chantier-name="${esc(x.chantier)}">Archiver</button>`;
      return `<tr>`+
        `<td><button class="chantier-link chantier-open-name" data-chantier-name="${esc(x.chantier)}">${esc(x.chantier)}</button></td>`+
        `<td>${esc(x.responsable||'—')}</td>`+
        `<td><span class="progress ${pct===100?'ok':''}"><span style="width:${pct}%"></span></span>${x.received} / ${x.all} reçues</td>`+
        `<td><span class="pill ${alert.cl}">${alert.label}</span></td>`+
        `<td>${action}</td>`+
      `</tr>`;
    }).join('');
  };

  function installStyle(){
    if(document.getElementById('ab-commandes-tracked-style'))return;
    const s=document.createElement('style');
    s.id='ab-commandes-tracked-style';
    s.textContent=`
      .tracked-archive-btn{border:1px solid #d9dee7;background:#fff;color:#5c687b;border-radius:8px;padding:7px 10px;font-size:12px;font-weight:800;cursor:pointer;white-space:nowrap}
      .tracked-archive-btn:hover{background:#f5f7fa;color:#25354d}
      .tracked-archive-btn.restore{border-color:#b9dbc7;background:#f0faf4;color:#237245}
      #trackedArchiveToggle{border:1px solid #dfe5ee;background:#fff;color:#33445d;border-radius:10px;padding:10px 14px;font-weight:800;cursor:pointer;white-space:nowrap}
      #chantiers .chantier-table th:last-child,#chantiers .chantier-table td:last-child{text-align:right;width:120px}
      @media(max-width:760px){#trackedArchiveToggle{width:100%;margin-top:10px}}
    `;
    document.head.appendChild(s);
  }

  function patchLabels(){
    const nav=document.querySelector('.nav button[data-view="chantiers"]');
    if(nav)nav.textContent='🛠 Chantiers à suivre';

    const h1=document.querySelector('#chantiers .title h1');
    if(h1)h1.textContent=showArchived?'Chantiers archivés':'Chantiers à suivre';

    const p=document.querySelector('#chantiers .title p');
    if(p)p.textContent=showArchived
      ? 'Chantiers retirés du suivi actif · les commandes sont conservées'
      : 'Uniquement les chantiers ayant des données de commande';

    const overviewH2=document.querySelector('#overview .overview-chantiers .table-head h2');
    if(overviewH2)overviewH2.textContent='Chantiers à suivre';
  }

  function ensureArchiveToggle(){
    const top=document.querySelector('#chantiers > .top');
    if(!top)return;
    let btn=document.getElementById('trackedArchiveToggle');
    if(!btn){
      btn=document.createElement('button');
      btn.id='trackedArchiveToggle';
      btn.type='button';
      top.appendChild(btn);
      btn.onclick=function(){
        showArchived=!showArchived;
        rerenderTrackedViews();
      };
    }
    const count=archiveMap().size;
    btn.textContent=showArchived?'← Retour aux chantiers à suivre':`Archivés (${count})`;
  }

  async function archiveChantier(name){
    const chantier=cleanName(name);
    if(!chantier||isArchived(chantier))return;
    if(!confirm(`Archiver ${chantier} du suivi ?\n\nLes commandes seront conservées.`))return;

    const marker=makeArchiveDoc(chantier);
    const before=Array.isArray(documents)?documents.slice():[];
    documents=[...before.filter(d=>String(d?.id||'')!==marker.id),marker];
    rerenderTrackedViews();

    try{
      await post({action:'document_upsert',...marker});
      setTimeout(()=>{try{loadAll(true)}catch(e){}},600);
    }catch(e){
      documents=before;
      rerenderTrackedViews();
      alert('Archivage impossible : '+String(e?.message||e));
    }
  }

  async function restoreChantier(name){
    const chantier=cleanName(name),key=keyName(chantier);
    const markers=archiveDocs().filter(d=>keyName(d?.chantier)===key);
    if(!markers.length)return;

    const before=Array.isArray(documents)?documents.slice():[];
    documents=before.filter(d=>!markers.some(m=>String(m?.id||'')===String(d?.id||'')));
    rerenderTrackedViews();

    try{
      for(const marker of markers){
        await post({action:'document_delete',id:String(marker.id||'')});
      }
      setTimeout(()=>{try{loadAll(true)}catch(e){}},600);
    }catch(e){
      documents=before;
      rerenderTrackedViews();
      alert('Réactivation impossible : '+String(e?.message||e));
    }
  }

  window.renderOverviewChantiers=function(){
    const body=$('#overviewChantiers');
    if(!body)return;
    const list=overviewChantierList();
    body.innerHTML=list.length
      ? list.map(c=>{
          const os=matchingOrdersForChantier(c.id,c.name);
          const suivi=`${os.length} produit${os.length>1?'s':''} suivi${os.length>1?'s':''}`;
          return `<tr>`+
            `<td><button class="chantier-link chantier-open" data-chantier-id="${esc(c.id)}" data-chantier-name="${esc(c.name)}">${esc(c.name)}</button></td>`+
            `<td>${suivi}</td>`+
            `<td><button class="btn secondary chantier-open" data-chantier-id="${esc(c.id)}" data-chantier-name="${esc(c.name)}">Ouvrir la fiche</button></td>`+
          `</tr>`;
        }).join('')
      : '<tr><td colspan="3">Aucun chantier à suivre.</td></tr>';

    $$('.chantier-open').forEach(b=>b.onclick=()=>openChantierFiche(b.dataset.chantierId,b.dataset.chantierName));
  };

  window.renderChantiers=function(){
    const body=$('#chantierSummary2');
    if(!body)return;
    const table=body.closest('table');
    const head=table?.querySelector('thead tr');
    if(head)head.innerHTML='<th>Chantier</th><th>Responsable</th><th>État commandes</th><th>Alerte</th><th></th>';

    const rows=chantierRows();
    body.innerHTML=rows||`<tr><td colspan="5">${showArchived?'Aucun chantier archivé.':'Aucun chantier à suivre.'}</td></tr>`;

    body.querySelectorAll('.chantier-open-name').forEach(b=>{
      b.onclick=()=>openChantierFicheByName(b.dataset.chantierName);
    });
    body.querySelectorAll('.tracked-archive-btn').forEach(b=>{
      b.onclick=()=>b.classList.contains('restore')
        ? restoreChantier(b.dataset.chantierName)
        : archiveChantier(b.dataset.chantierName);
    });
  };

  function rerenderTrackedViews(){
    try{
      patchLabels();
      ensureArchiveToggle();
      if(typeof refreshChantierSelect==='function')refreshChantierSelect($('#fChantier')?.value||'','');
      renderOverviewChantiers();
      renderChantiers();
      const badge=document.querySelector('.yaya');
      if(badge)badge.textContent=`Yaya · ${activeYayaChantiers().length} chantiers`;
    }catch(e){
      console.error('AB COMMANDES chantiers à suivre:',e);
    }
  }

  installStyle();
  rerenderTrackedViews();
  setTimeout(rerenderTrackedViews,500);
  setTimeout(rerenderTrackedViews,1500);
  setTimeout(rerenderTrackedViews,3500);
  window.addEventListener('focus',()=>setTimeout(rerenderTrackedViews,100));
  window.__AB_COMMANDES_SHOW_ALL_CHANTIERS_VERSION='2.0';
})();
