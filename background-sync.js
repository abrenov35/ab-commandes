(function(){
  'use strict';

  const LOCAL_STATE_KEY='AB_COMMANDES_LOCAL_STATE_V1';
  const EMBED_STATE_KEY='AB_COMMANDES_EMBED_CACHE_V2';
  const PENDING_KEY='AB_COMMANDES_PENDING_OPS_V1';
  const LOCAL_MAX_AGE=30*24*60*60*1000;
  const REMOTE_SYNC_MS=60*1000;
  const MIN_REMOTE_GAP_MS=45*1000;
  const YAYA_SYNC_MS=5*60*1000;
  const FLUSH_MS=12*1000;
  const RESEND_MS=10*1000;
  const VERIFY_DELAY_MS=1800;

  let queue=readQueue();
  let remoteSyncInFlight=false;
  let flushInFlight=false;
  let deferredRender=false;
  let lastYayaSync=0;
  let lastRemoteSync=0;
  let verifyTimer=0;

  function safeArray(v){return Array.isArray(v)?v:[]}
  function text(v){return String(v==null?'':v)}

  function orderComparable(o){return {id:text(o&&o.id),chantierId:text(o&&(o.chantierId||o.chantier_id)),chantier:text(o&&o.chantier),produit:text(o&&o.produit),qte:text(o&&o.qte),fournisseur:text(o&&o.fournisseur),responsable:text(o&&o.responsable),status:text(o&&o.status),notes:text(o&&o.notes)}}
  function docComparable(d){return {id:text(d&&d.id),commande_id:text(d&&d.commande_id),chantier:text(d&&d.chantier),type:text(d&&d.type),nom_fichier:text(d&&d.nom_fichier),url_pdf:text(d&&d.url_pdf),source:text(d&&d.source),date_document:text(d&&d.date_document),auteur:text(d&&d.auteur)}}
  function sameComparable(a,b){return JSON.stringify(a)===JSON.stringify(b)}
  function stateSignature(orderList,docList){
    const os=safeArray(orderList).map(orderComparable).sort((a,b)=>a.id.localeCompare(b.id)||JSON.stringify(a).localeCompare(JSON.stringify(b)));
    const ds=safeArray(docList).map(docComparable).sort((a,b)=>a.id.localeCompare(b.id)||JSON.stringify(a).localeCompare(JSON.stringify(b)));
    return JSON.stringify([os,ds]);
  }

  function readQueue(){try{const raw=localStorage.getItem(PENDING_KEY);const parsed=raw?JSON.parse(raw):[];return Array.isArray(parsed)?parsed:[]}catch(e){return []}}
  function persistQueue(){try{localStorage.setItem(PENDING_KEY,JSON.stringify(queue))}catch(e){}}

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
        const raw=localStorage.getItem(key);if(!raw)continue;
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
      orders=cached.orders.map(o=>{try{return typeof normalizeFromSheet==='function'?normalizeFromSheet(o):o}catch(e){return o}});
      documents=safeArray(cached.documents);
      const merged=overlayPending(orders,documents);
      orders=merged.orders;documents=merged.documents;
      if(typeof renderAll==='function')renderAll();
      try{setSync(true,queue.length?'Dernier affichage chargé · modifications en attente':'Dernier affichage chargé · mise à jour en arrière-plan')}catch(e){}
      return true;
    }catch(e){return false}
  }

  function coalesce(op){queue=queue.filter(x=>!(x&&x.entity===op.entity&&text(x.targetId)===text(op.targetId)));queue.push(op);persistQueue()}
  function queueOrderUpsert(obj){coalesce({entity:'order',action:'upsert',targetId:text(obj.id),payload:obj,createdAt:Date.now(),lastSentAt:0,attempts:0})}
  function queueOrderDelete(id){coalesce({entity:'order',action:'delete',targetId:text(id),createdAt:Date.now(),lastSentAt:0,attempts:0})}
  function queueDocUpsert(obj){coalesce({entity:'document',action:'upsert',targetId:text(obj.id),payload:obj,createdAt:Date.now(),lastSentAt:0,attempts:0})}
  function queueDocDelete(id){coalesce({entity:'document',action:'delete',targetId:text(id),createdAt:Date.now(),lastSentAt:0,attempts:0})}

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

  function reconcileQueue(remoteOrders,remoteDocs){const before=queue.length;queue=queue.filter(op=>!pendingConfirmed(op,remoteOrders,remoteDocs));if(queue.length!==before)persistQueue()}

  function overlayPending(remoteOrders,remoteDocs){
    const orderMap=new Map(safeArray(remoteOrders).map(o=>[text(o.id),o]));
    const docMap=new Map(safeArray(remoteDocs).map(d=>[text(d.id),d]));
    queue.forEach(op=>{
      const id=text(op.targetId);
      if(op.entity==='order'){
        if(op.action==='delete')orderMap.delete(id);
        else{let next={...(orderMap.get(id)||{}),...op.payload};try{if(typeof normalizeFromSheet==='function')next=normalizeFromSheet(next)}catch(e){}orderMap.set(id,next)}
      }else if(op.entity==='document'){
        if(op.action==='delete')docMap.delete(id);else docMap.set(id,{...(docMap.get(id)||{}),...op.payload});
      }
    });
    return {orders:[...orderMap.values()],documents:[...docMap.values()]};
  }

  function modalOpen(){return !!document.querySelector('.modal.show')}
  function renderWhenIdle(){if(!deferredRender)return;if(modalOpen()){setTimeout(renderWhenIdle,250);return}deferredRender=false;if(typeof renderAll==='function')renderAll()}

  function applyState(nextOrders,nextDocs,allowRender=true){
    const before=stateSignature(orders,documents),after=stateSignature(nextOrders,nextDocs);
    if(before===after)return false;
    orders=nextOrders;documents=nextDocs;saveLocalState();
    if(allowRender){if(modalOpen()){deferredRender=true;setTimeout(renderWhenIdle,250)}else if(typeof renderAll==='function')renderAll()}
    return true;
  }

  async function backgroundLoadAll(silent=true,force=false){
    if(remoteSyncInFlight)return false;
    const now=Date.now();
    if(!force&&silent&&lastRemoteSync&&now-lastRemoteSync<MIN_REMOTE_GAP_MS)return false;
    if(silent&&document.hidden&&!queue.length)return false;
    remoteSyncInFlight=true;
    try{
      const [a,b]=await Promise.all([jsonp('list'),jsonp('documents')]);
      if(!a||!a.ok)throw new Error((a&&a.error)||'Lecture commandes impossible');
      if(!b||!b.ok)throw new Error((b&&b.error)||'Lecture documents impossible');
      const remoteOrders=safeArray(a.commandes).map(o=>{try{return typeof normalizeFromSheet==='function'?normalizeFromSheet(o):o}catch(e){return o}});
      const remoteDocs=safeArray(b.documents);
      reconcileQueue(remoteOrders,remoteDocs);
      const merged=overlayPending(remoteOrders,remoteDocs);
      const changed=applyState(merged.orders,merged.documents,true);
      lastRemoteSync=Date.now();
      if(changed)saveLocalState();
      try{setSync(true,queue.length?'Enregistré localement · envoi en arrière-plan':'À jour')}catch(e){}
      return changed;
    }catch(e){
      console.warn('AB COMMANDES · synchro arrière-plan',e);
      if(!silent){try{setSync(false,'Dernier affichage conservé · reprise automatique')}catch(err){}}
      return false;
    }finally{remoteSyncInFlight=false}
  }

  function scheduleVerification(){clearTimeout(verifyTimer);verifyTimer=setTimeout(()=>backgroundLoadAll(true,true),VERIFY_DELAY_MS)}

  async function flushQueue(){
    if(flushInFlight||!queue.length)return;
    if(typeof navigator!=='undefined'&&navigator.onLine===false)return;
    flushInFlight=true;let sent=false;
    try{
      const now=Date.now();
      for(const op of [...queue]){
        if(Number(op.lastSentAt||0)&&now-Number(op.lastSentAt)<RESEND_MS)continue;
        try{
          if(op.entity==='order'&&op.action==='upsert')await post({action:'upsert',...op.payload});
          else if(op.entity==='order'&&op.action==='delete')await post({action:'delete',id:op.targetId});
          else if(op.entity==='document'&&op.action==='upsert')await post({action:'document_upsert',...op.payload});
          else if(op.entity==='document'&&op.action==='delete')await post({action:'document_delete',id:op.targetId});
          const current=queue.find(x=>x.entity===op.entity&&text(x.targetId)===text(op.targetId));
          if(current){current.lastSentAt=Date.now();current.attempts=Number(current.attempts||0)+1}
          sent=true;
        }catch(e){console.warn('AB COMMANDES · envoi différé',e)}
      }
      persistQueue();
    }finally{flushInFlight=false}
    if(sent)scheduleVerification();
  }

  try{
    saveOrder=async function(obj){
      const id=text(obj&&obj.id),current=safeArray(orders),idx=current.findIndex(o=>text(o.id)===id),existing=idx>=0?current[idx]:{};
      let next={...existing,...obj};try{if(typeof normalizeFromSheet==='function')next=normalizeFromSheet(next)}catch(e){}
      const nextOrders=current.slice();if(idx>=0)nextOrders[idx]=next;else nextOrders.push(next);orders=nextOrders;
      queueOrderUpsert(next);saveLocalState();if(typeof renderAll==='function')renderAll();
      try{setSync(true,'Enregistré immédiatement · envoi en arrière-plan')}catch(e){}
      setTimeout(flushQueue,0);return true;
    };

    deleteOrder=async function(id){const target=text(id);orders=safeArray(orders).filter(o=>text(o.id)!==target);queueOrderDelete(target);saveLocalState();if(typeof renderAll==='function')renderAll();try{setSync(true,'Suppression immédiate · envoi en arrière-plan')}catch(e){}setTimeout(flushQueue,0);return true};

    saveDocument=async function(doc){const id=text(doc&&doc.id),current=safeArray(documents),idx=current.findIndex(d=>text(d.id)===id),nextDocs=current.slice();if(idx>=0)nextDocs[idx]={...current[idx],...doc};else nextDocs.push(doc);documents=nextDocs;queueDocUpsert(doc);saveLocalState();if(typeof renderAll==='function')renderAll();try{if(typeof renderDocList==='function')renderDocList()}catch(e){}try{setSync(true,'Document enregistré immédiatement · envoi en arrière-plan')}catch(e){}setTimeout(flushQueue,0);return true};

    deleteDocument=async function(id){const target=text(id);documents=safeArray(documents).filter(d=>text(d.id)!==target);queueDocDelete(target);saveLocalState();if(typeof renderAll==='function')renderAll();try{if(typeof renderDocList==='function')renderDocList()}catch(e){}try{setSync(true,'Suppression immédiate · envoi en arrière-plan')}catch(e){}setTimeout(flushQueue,0);return true};

    loadAll=backgroundLoadAll;
  }catch(e){console.error('AB COMMANDES · installation synchro locale',e)}

  try{
    if(typeof loadYayaChantiers==='function'){
      const originalLoadYayaChantiers=loadYayaChantiers;
      loadYayaChantiers=async function(force=false){
        const now=Date.now();if(!force&&lastYayaSync&&now-lastYayaSync<YAYA_SYNC_MS)return true;
        lastYayaSync=now;return originalLoadYayaChantiers(force);
      };
    }
  }catch(e){}

  const hadCache=hydrateLocalState();
  if(queue.length){const merged=overlayPending(safeArray(orders),safeArray(documents));applyState(merged.orders,merged.documents,true);setTimeout(flushQueue,0)}
  else if(!hadCache)saveLocalState();

  /* Le réseau ne bloque jamais le premier affichage : cache d'abord, réseau ensuite. */
  setTimeout(()=>{
    backgroundLoadAll(true,true);
    try{
      if(typeof loadYayaChantiers==='function'){
        Promise.resolve(loadYayaChantiers(false)).then(()=>{try{if(typeof tryOpenDeepLink==='function')tryOpenDeepLink()}catch(e){}});
      }
    }catch(e){}
  },700);

  setInterval(()=>backgroundLoadAll(true,false),REMOTE_SYNC_MS);
  setInterval(()=>flushQueue(),FLUSH_MS);
  setInterval(()=>{try{if(!document.hidden&&typeof loadYayaChantiers==='function')loadYayaChantiers(false)}catch(e){}},YAYA_SYNC_MS);
  window.addEventListener('online',()=>{flushQueue();backgroundLoadAll(true,true)});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){flushQueue();backgroundLoadAll(true,false)}});

  window.__AB_COMMANDES_BACKGROUND_SYNC_VERSION='1.2';
})();
