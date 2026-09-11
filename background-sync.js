(function(){
  'use strict';

  const LOCAL_STATE_KEY='AB_COMMANDES_LOCAL_STATE_V1';
  const EMBED_STATE_KEY='AB_COMMANDES_EMBED_CACHE_V2';
  const PENDING_KEY='AB_COMMANDES_PENDING_OPS_V1';
  const LOCAL_MAX_AGE=30*24*60*60*1000;
  const OPEN_SYNC_DELAY_MS=700;

  let queue=readQueue();
  let remoteSyncInFlight=false;
  let flushInFlight=false;
  let deferredRender=false;
  let openingSyncDone=false;

  function safeArray(v){return Array.isArray(v)?v:[]}
  function text(v){return String(v==null?'':v)}

  function orderComparable(o){
    return {
      id:text(o&&o.id),
      chantierId:text(o&&(o.chantierId||o.chantier_id)),
      chantier:text(o&&o.chantier),
      produit:text(o&&o.produit),
      qte:text(o&&o.qte),
      prix:text(o&&o.prix),
      fournisseur:text(o&&o.fournisseur),
      responsable:text(o&&o.responsable),
      status:text(o&&o.status),
      notes:text(o&&o.notes)
    };
  }

  function docComparable(d){
    return {
      id:text(d&&d.id),
      commande_id:text(d&&d.commande_id),
      chantier:text(d&&d.chantier),
      type:text(d&&d.type),
      nom_fichier:text(d&&d.nom_fichier),
      url_pdf:text(d&&d.url_pdf),
      source:text(d&&d.source),
      date_document:text(d&&d.date_document),
      auteur:text(d&&d.auteur)
    };
  }

  function sameComparable(a,b){return JSON.stringify(a)===JSON.stringify(b)}

  function stateSignature(orderList,docList){
    const os=safeArray(orderList).map(orderComparable).sort((a,b)=>a.id.localeCompare(b.id)||JSON.stringify(a).localeCompare(JSON.stringify(b)));
    const ds=safeArray(docList).map(docComparable).sort((a,b)=>a.id.localeCompare(b.id)||JSON.stringify(a).localeCompare(JSON.stringify(b)));
    return JSON.stringify([os,ds]);
  }

  function readQueue(){
    try{
      const raw=localStorage.getItem(PENDING_KEY);
      const parsed=raw?JSON.parse(raw):[];
      return Array.isArray(parsed)?parsed:[];
    }catch(e){return []}
  }

  function persistQueue(){
    try{localStorage.setItem(PENDING_KEY,JSON.stringify(queue))}catch(e){}
  }

  function saveLocalState(){
    try{
      const payload={savedAt:Date.now(),orders:safeArray(orders),documents:safeArray(documents)};
      localStorage.setItem(LOCAL_STATE_KEY,JSON.stringify(payload));
      localStorage.setItem(EMBED_STATE_KEY,JSON.stringify({version:2,...payload}));
    }catch(e){}
  }

  function readCachedState(){
    for(const key of [LOCAL_STATE_KEY,EMBED_STATE_KEY]){
      try{
        const raw=localStorage.getItem(key);
        if(!raw)continue;
        const cached=JSON.parse(raw);
        if(!cached||!Array.isArray(cached.orders))continue;
        if(cached.savedAt&&Date.now()-Number(cached.savedAt)>LOCAL_MAX_AGE)continue;
        return cached;
      }catch(e){}
    }
    return null;
  }

  function hydrateLocalState(){
    try{
      const cached=readCachedState();
      if(!cached)return false;
      if(safeArray(orders).length)return false;
      orders=cached.orders.map(o=>{
        try{return typeof normalizeFromSheet==='function'?normalizeFromSheet(o):o}catch(e){return o}
      });
      documents=safeArray(cached.documents);
      const merged=overlayPending(orders,documents);
      orders=merged.orders;
      documents=merged.documents;
      if(typeof renderAll==='function')renderAll();
      try{setSync(true,queue.length?'Dernier affichage chargé · modifications en attente':'Dernier affichage chargé')}catch(e){}
      return true;
    }catch(e){return false}
  }

  function coalesce(op){
    queue=queue.filter(x=>!(x&&x.entity===op.entity&&text(x.targetId)===text(op.targetId)));
    queue.push(op);
    persistQueue();
  }

  function queueOrderUpsert(obj){coalesce({entity:'order',action:'upsert',targetId:text(obj.id),payload:obj,createdAt:Date.now()})}
  function queueOrderDelete(id){coalesce({entity:'order',action:'delete',targetId:text(id),createdAt:Date.now()})}
  function queueDocUpsert(obj){coalesce({entity:'document',action:'upsert',targetId:text(obj.id),payload:obj,createdAt:Date.now()})}
  function queueDocDelete(id){coalesce({entity:'document',action:'delete',targetId:text(id),createdAt:Date.now()})}

  function pendingConfirmed(op,remoteOrders,remoteDocs){
    if(op.entity==='order'){
      const found=remoteOrders.find(o=>text(o.id)===text(op.targetId));
      if(op.action==='delete')return !found;
      return !!found&&sameComparable(orderComparable(found),orderComparable(op.payload));
    }
    const found=remoteDocs.find(d=>text(d.id)===text(op.targetId));
    if(op.action==='delete')return !found;
    return !!found&&sameComparable(docComparable(found),docComparable(op.payload));
  }

  function reconcileQueue(remoteOrders,remoteDocs){
    const before=queue.length;
    queue=queue.filter(op=>!pendingConfirmed(op,remoteOrders,remoteDocs));
    if(queue.length!==before)persistQueue();
  }

  function overlayPending(remoteOrders,remoteDocs){
    const orderMap=new Map(safeArray(remoteOrders).map(o=>[text(o.id),o]));
    const docMap=new Map(safeArray(remoteDocs).map(d=>[text(d.id),d]));

    queue.forEach(op=>{
      const id=text(op.targetId);
      if(op.entity==='order'){
        if(op.action==='delete')orderMap.delete(id);
        else{
          let next={...(orderMap.get(id)||{}),...op.payload};
          try{if(typeof normalizeFromSheet==='function')next=normalizeFromSheet(next)}catch(e){}
          orderMap.set(id,next);
        }
      }else if(op.entity==='document'){
        if(op.action==='delete')docMap.delete(id);
        else docMap.set(id,{...(docMap.get(id)||{}),...op.payload});
      }
    });

    return {orders:[...orderMap.values()],documents:[...docMap.values()]};
  }

  function modalOpen(){return !!document.querySelector('.modal.show')}

  function renderWhenIdle(){
    if(!deferredRender)return;
    if(modalOpen()){setTimeout(renderWhenIdle,250);return}
    deferredRender=false;
    if(typeof renderAll==='function')renderAll();
  }

  function applyState(nextOrders,nextDocs,allowRender=true){
    const before=stateSignature(orders,documents);
    const after=stateSignature(nextOrders,nextDocs);
    if(before===after)return false;
    orders=nextOrders;
    documents=nextDocs;
    saveLocalState();
    if(allowRender){
      if(modalOpen()){
        deferredRender=true;
        setTimeout(renderWhenIdle,250);
      }else if(typeof renderAll==='function'){
        renderAll();
      }
    }
    return true;
  }

  async function syncOnceOnOpen(){
    if(openingSyncDone||remoteSyncInFlight)return false;
    openingSyncDone=true;
    remoteSyncInFlight=true;
    try{
      const [a,b]=await Promise.all([jsonp('list'),jsonp('documents')]);
      if(!a||!a.ok)throw new Error((a&&a.error)||'Lecture commandes impossible');
      if(!b||!b.ok)throw new Error((b&&b.error)||'Lecture documents impossible');

      const remoteOrders=safeArray(a.commandes).map(o=>{
        try{return typeof normalizeFromSheet==='function'?normalizeFromSheet(o):o}catch(e){return o}
      });
      const remoteDocs=safeArray(b.documents);

      reconcileQueue(remoteOrders,remoteDocs);
      const merged=overlayPending(remoteOrders,remoteDocs);
      applyState(merged.orders,merged.documents,true);
      try{setSync(true,queue.length?'Données chargées · modifications à envoyer':'À jour à l’ouverture')}catch(e){}
      return true;
    }catch(e){
      console.warn('AB COMMANDES · synchro à l’ouverture',e);
      try{setSync(false,'Dernier affichage conservé')}catch(err){}
      return false;
    }finally{
      remoteSyncInFlight=false;
    }
  }

  async function sendOperation(op){
    let result;
    if(op.entity==='order'&&op.action==='upsert')result=await post({action:'upsert',...op.payload});
    else if(op.entity==='order'&&op.action==='delete')result=await post({action:'delete',id:op.targetId});
    else if(op.entity==='document'&&op.action==='upsert')result=await post({action:'document_upsert',...op.payload});
    else if(op.entity==='document'&&op.action==='delete')result=await post({action:'document_delete',id:op.targetId});
    if(result&&result.ok===false)throw new Error(result.error||'Envoi impossible');
    return result;
  }

  async function flushQueue(){
    if(flushInFlight||!queue.length)return false;
    if(typeof navigator!=='undefined'&&navigator.onLine===false)return false;
    flushInFlight=true;
    let sentAny=false;

    try{
      for(const op of [...queue]){
        try{
          await sendOperation(op);
          queue=queue.filter(current=>current!==op);
          persistQueue();
          sentAny=true;
        }catch(e){
          console.warn('AB COMMANDES · envoi différé',e);
        }
      }
    }finally{
      flushInFlight=false;
    }

    if(sentAny){
      try{setSync(true,queue.length?'Certaines modifications restent en attente':'Enregistré')}catch(e){}
    }
    return sentAny;
  }

  try{
    saveOrder=async function(obj){
      const id=text(obj&&obj.id);
      const current=safeArray(orders);
      const idx=current.findIndex(o=>text(o.id)===id);
      const existing=idx>=0?current[idx]:{};
      let next={...existing,...obj};
      try{if(typeof normalizeFromSheet==='function')next=normalizeFromSheet(next)}catch(e){}
      const nextOrders=current.slice();
      if(idx>=0)nextOrders[idx]=next;else nextOrders.push(next);
      orders=nextOrders;
      queueOrderUpsert(next);
      saveLocalState();
      if(typeof renderAll==='function')renderAll();
      try{setSync(true,'Enregistré localement · envoi en cours')}catch(e){}
      setTimeout(flushQueue,0);
      return true;
    };

    deleteOrder=async function(id){
      const target=text(id);
      orders=safeArray(orders).filter(o=>text(o.id)!==target);
      queueOrderDelete(target);
      saveLocalState();
      if(typeof renderAll==='function')renderAll();
      try{setSync(true,'Suppression locale · envoi en cours')}catch(e){}
      setTimeout(flushQueue,0);
      return true;
    };

    saveDocument=async function(doc){
      const id=text(doc&&doc.id);
      const current=safeArray(documents);
      const idx=current.findIndex(d=>text(d.id)===id);
      const nextDocs=current.slice();
      if(idx>=0)nextDocs[idx]={...current[idx],...doc};else nextDocs.push(doc);
      documents=nextDocs;
      queueDocUpsert(doc);
      saveLocalState();
      if(typeof renderAll==='function')renderAll();
      try{if(typeof renderDocList==='function')renderDocList()}catch(e){}
      try{setSync(true,'Document enregistré localement · envoi en cours')}catch(e){}
      setTimeout(flushQueue,0);
      return true;
    };

    deleteDocument=async function(id){
      const target=text(id);
      documents=safeArray(documents).filter(d=>text(d.id)!==target);
      queueDocDelete(target);
      saveLocalState();
      if(typeof renderAll==='function')renderAll();
      try{if(typeof renderDocList==='function')renderDocList()}catch(e){}
      try{setSync(true,'Suppression locale · envoi en cours')}catch(e){}
      setTimeout(flushQueue,0);
      return true;
    };

    /* Toute demande de relecture pendant que la page reste ouverte est neutralisée. */
    loadAll=async function(){return false};
  }catch(e){
    console.error('AB COMMANDES · installation synchro ouverture seule',e);
  }

  const hadCache=hydrateLocalState();
  if(queue.length){
    const merged=overlayPending(safeArray(orders),safeArray(documents));
    applyState(merged.orders,merged.documents,true);
  }else if(!hadCache){
    saveLocalState();
  }

  /* Une seule synchronisation : au chargement / à la réouverture de la page Commande. */
  setTimeout(async()=>{
    await syncOnceOnOpen();
    await flushQueue();
    try{
      if(typeof loadYayaChantiers==='function'){
        await Promise.resolve(loadYayaChantiers(true));
        try{if(typeof tryOpenDeepLink==='function')tryOpenDeepLink()}catch(e){}
      }
    }catch(e){}
  },OPEN_SYNC_DELAY_MS);

  /* Aucun setInterval, aucun visibilitychange, aucune resynchronisation automatique. */
  window.__AB_COMMANDES_BACKGROUND_SYNC_VERSION='1.4-open-only';
})();
