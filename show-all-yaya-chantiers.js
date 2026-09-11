(function(){
  'use strict';

  function cleanName(v){return String(v||'').replace(/^[\s•·▪◦\-–—]+/,'').trim()}
  function keyName(v){return normName(cleanName(v)).replace(/[^A-Z0-9]+/g,' ').trim()}
  function isRealChantierName(v){return !!keyName(v)}

  /* AB RENOV 35 est un vrai chantier test : ne plus l'exclure. */
  window.activeYayaChantiers=function(){
    const src=Array.isArray(yayaChantiers)?yayaChantiers:[];
    return src.filter(c=>{
      const statut=String(c?.statut||'').trim().toLowerCase();
      return statut!=='terminé'&&statut!=='termine'&&statut!=='archivé'&&statut!=='archive';
    });
  };

  function baseYayaChantiers(){
    const src=(typeof activeYayaChantiers==='function')?activeYayaChantiers():Array.isArray(yayaChantiers)?yayaChantiers:[];
    return src.filter(c=>isRealChantierName(c?.nom));
  }

  window.overviewChantierList=function(){
    const byName=new Map();

    baseYayaChantiers().forEach(c=>{
      const name=cleanName(c.nom),key=keyName(name),id=String(c.id||'');
      const prev=byName.get(key);
      if(!prev)byName.set(key,{id,name});
      else if(!prev.id&&id)prev.id=id;
    });

    orders.forEach(o=>{
      const name=cleanName(o.chantier),key=keyName(name),id=String(o.chantierId||'');
      if(!isRealChantierName(name))return;
      const prev=byName.get(key);
      if(!prev)byName.set(key,{id,name});
      else if(!prev.id&&id)prev.id=id;
    });

    const q=$('#search')?.value.trim().toLowerCase()||'';
    const resp=$('#filterResp')?.value||'';
    const st=$('#filterStatus')?.value||'';

    return [...byName.values()].filter(c=>{
      const os=matchingOrdersForChantier(c.id,c.name);
      const searchOk=!q||c.name.toLowerCase().includes(q)||os.some(o=>[o.produit,o.fournisseur,o.responsable].join(' ').toLowerCase().includes(q));
      const respOk=!resp||os.some(o=>o.responsable===resp);
      const statusOk=!st||os.some(o=>o.status===st);
      return searchOk&&respOk&&statusOk;
    }).sort((a,b)=>a.name.localeCompare(b.name,'fr',{sensitivity:'base'}));
  };

  window.chantierData=function(){
    const m=new Map();

    baseYayaChantiers().forEach(c=>{
      const name=cleanName(c.nom),key=keyName(name);
      if(!key)return;
      m.set(key,{chantier:name,chantierId:String(c.id||''),responsable:'',all:0,received:0,problem:0,todo:0,choice:0});
    });

    filtered().forEach(o=>{
      const name=cleanName(o.chantier),key=keyName(name);
      if(!key||!isRealChantierName(name))return;
      if(!m.has(key))m.set(key,{chantier:name,chantierId:String(o.chantierId||''),responsable:o.responsable||'',all:0,received:0,problem:0,todo:0,choice:0});
      const x=m.get(key);
      x.all++;
      if(o.responsable)x.responsable=o.responsable;
      if(o.status==='received')x.received++;
      if(o.status==='problem')x.problem++;
      if(o.status==='todo')x.todo++;
      if(o.status==='choice')x.choice++;
    });

    const rank=x=>x.problem?0:x.todo?1:x.choice?2:x.all===0?3:x.received<x.all?4:5;
    return [...m.values()].sort((a,b)=>rank(a)-rank(b)||String(a.chantier).localeCompare(String(b.chantier),'fr',{sensitivity:'base'}));
  };

  window.chantierRows=function(){
    return chantierData().map(x=>{
      const pct=x.all?Math.round(x.received/x.all*100):0;
      let al=x.all?'Aucune alerte':'Aucune commande',cl=x.all?'ok':'orange';
      if(x.problem){al=`${x.problem} problème${x.problem>1?'s':''}`;cl=''}
      else if(x.todo){al=`${x.todo} à commander`;cl=''}
      else if(x.choice){al=`${x.choice} choix client`;cl='orange'}
      const etat=x.all?`<span class="progress ${pct===100?'ok':''}"><span style="width:${pct}%"></span></span>${x.received} / ${x.all} reçues`:'—';
      return `<tr><td><button class="chantier-link chantier-open-name" data-chantier-name="${esc(x.chantier)}">${esc(x.chantier)}</button></td><td>${esc(x.responsable||'—')}</td><td>${etat}</td><td><span class="pill ${cl}">${al}</span></td></tr>`;
    }).join('');
  };

  function rerender(){
    try{
      if(typeof refreshChantierSelect==='function')refreshChantierSelect($('#fChantier')?.value||'','');
      renderOverviewChantiers();
      renderChantiers();
      const badge=document.querySelector('.yaya');
      if(badge)badge.textContent=`Yaya · ${activeYayaChantiers().length} chantiers`;
    }catch(e){console.error('AB COMMANDES tous chantiers:',e)}
  }

  rerender();
  setTimeout(rerender,800);
  setTimeout(rerender,2500);
  window.__AB_COMMANDES_SHOW_ALL_CHANTIERS_VERSION='1.1';
})();
