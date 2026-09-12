(function(){
  'use strict';

  const LOCAL_STATE_KEY='AB_COMMANDES_LOCAL_STATE_V1';
  const EMBED_STATE_KEY='AB_COMMANDES_EMBED_CACHE_V2';
  const PENDING_KEY='AB_COMMANDES_PENDING_OPS_V1';
  const LOCAL_MAX_AGE=30*24*60*60*1000;
  const OPEN_SYNC_DELAY_MS=0;
  const IS_EMBED=new URL(window.location.href).searchParams.get('embed')==='1';

  let queue=readQueue();
  let remoteSyncInFlight=false;
  let flushInFlight=false;
  let openingSyncDone=false;
  let hadCacheAtOpen=false;
  let userInteracted=false;
  let localRenderPending=false;

  function safeArray(v){return Array.isArray(v)?v:[]}
  function text(v){return String(v==null?'':v)}

  function markUserInteraction(){userInteracted=true}
  ['pointerdown','touchstart','keydown','input','change'].forEach(function(type){document.addEventListener(type,markUserInteraction,{capture:true,passive:true})});

  function orderComparable(o){return {id:text(o&&o.id),chantierId:text(o&&(o.chantierId||o.chantier_id)),chantier:text(o&&o.chantier),produit:text(o&&o.produit),qte:text(o&&o.qte),prix:text(o&&o.prix),fournisseur:text(o&&o.fournisseur),responsable:text(o&&o.responsable),status:text(o&&o.status),notes:text(o&&o.notes)}}
  function docComparable(d){return {id:text(d&&d.id),commande_id:text(d&&d.commande_id),chantier:text(d&&d.chantier),type:text(d&&d.type),nom_fichier:text(d&&d.nom_fichier),url_pdf:text(d&&d.url_pdf),source:text(d&&d.source),date_document:text(d&&d.date_document),auteur:text(d&&d.auteur)}}
  function sameComparable(a,b){return JSON.stringify(a)===JSON.stringify(b)}
  function stateSignature(orderList,docList){const os=safeArray(orderList).map(orderComparable).sort((a,b)=>a.id.localeCompare(b.id)||JSON.stringify(a).localeCompare(JSON.stringify(b)));const ds=safeArray(docList).map(docComparable).sort((a,b)=>a.id.localeCompare(b.id)||JSON.stringify(a).localeCompare(JSON.stringify(b)));return JSON.stringify([os,ds])}

  function readQueue(){try{const raw=localStorage.getItem(PENDING_KEY);const parsed=raw?JSON.parse(raw):[];return Array.isArray(parsed)?parsed:[]}catch(e){return []}}
  function persistQueue(){try{localStorage.setItem(PENDING_KEY,JSON.stringify(queue))}catch(e){}}
  function saveSnapshot(nextOrders,nextDocs){try{const payload={savedAt:Date.now(),orders:safeArray(nextOrders),documents:safeArray(nextDocs)};localStorage.setItem(LOCAL_STATE_KEY,JSON.stringify(payload));localStorage.setItem(EMBED_STATE_KEY,JSON.stringify({version:3,...payload}))}catch(e){}}
  function saveLocalState(){saveSnapshot(orders,documents)}
  function readCachedState(){for(const key of [LOCAL_STATE_KEY,EMBED_STATE_KEY]){try{const raw=localStorage.getItem(key);if(!raw)continue;const cached=JSON.parse(raw);if(!cached||!Array.isArray(cached.orders))continue;if(cached.savedAt&&Date.now()-Number(cached.savedAt)>LOCAL_MAX_AGE)continue;return cached}catch(e){}}return null}
  function hydrateLocalState(){try{const cached=readCachedState();if(!cached||safeArray(orders).length)return false;orders=cached.orders.map(o=>{try{return typeof normalizeFromSheet==='function'?normalizeFromSheet(o):o}catch(e){return o}});documents=safeArray(cached.documents);const merged=overlayPending(orders,documents);orders=merged.orders;documents=merged.documents;if(typeof renderAll==='function')renderAll();try{setSync(true,queue.length?'Affichage instantané · modifications en attente':'Affichage instantané · synchro en arrière-plan')}catch(e){}return true}catch(e){return false}}

  function coalesce(op){queue=queue.filter(x=>!(x&&x.entity===op.entity&&text(x.targetId)===text(op.targetId)));queue.push(op);persistQueue()}
  function queueOrderUpsert(obj){coalesce({entity:'order',action:'upsert',targetId:text(obj.id),payload:obj,createdAt:Date.now()})}
  function queueOrderDelete(id){coalesce({entity:'order',action:'delete',targetId:text(id),createdAt:Date.now()})}
  function queueDocUpsert(obj){coalesce({entity:'document',action:'upsert',targetId:text(obj.id),payload:obj,createdAt:Date.now()})}
  function queueDocDelete(id){coalesce({entity:'document',action:'delete',targetId:text(id),createdAt:Date.now()})}
  function pendingConfirmed(op,remoteOrders,remoteDocs){if(op.entity==='order'){const found=remoteOrders.find(o=>text(o.id)===text(op.targetId));if(op.action==='delete')return !found;return !!found&&sameComparable(orderComparable(found),orderComparable(op.payload))}const found=remoteDocs.find(d=>text(d.id)===text(op.targetId));if(op.action==='delete')return !found;return !!found&&sameComparable(docComparable(found),docComparable(op.payload))}
  function reconcileQueue(remoteOrders,remoteDocs){const before=queue.length;queue=queue.filter(op=>!pendingConfirmed(op,remoteOrders,remoteDocs));if(queue.length!==before)persistQueue()}
  function overlayPending(remoteOrders,remoteDocs){const orderMap=new Map(safeArray(remoteOrders).map(o=>[text(o.id),o]));const docMap=new Map(safeArray(remoteDocs).map(d=>[text(d.id),d]));queue.forEach(op=>{const id=text(op.targetId);if(op.entity==='order'){if(op.action==='delete')orderMap.delete(id);else{let next={...(orderMap.get(id)||{}),...op.payload};try{if(typeof normalizeFromSheet==='function')next=normalizeFromSheet(next)}catch(e){}orderMap.set(id,next)}}else if(op.entity==='document'){if(op.action==='delete')docMap.delete(id);else docMap.set(id,{...(docMap.get(id)||{}),...op.payload})}});return {orders:[...orderMap.values()],documents:[...docMap.values()]}}

  function modalOpen(){return !!document.querySelector('#modal.show,#docModal.show,.modal.show,[role="dialog"][open]')}
  function renderLocalChangeWhenSafe(){if(localRenderPending)return;localRenderPending=true;const run=function(){if(modalOpen()){setTimeout(run,80);return}localRenderPending=false;try{if(typeof renderAll==='function')renderAll()}catch(e){}};setTimeout(run,0)}
  function applyLiveState(nextOrders,nextDocs,renderNow){const before=stateSignature(orders,documents),after=stateSignature(nextOrders,nextDocs);if(before===after)return false;orders=nextOrders;documents=nextDocs;saveLocalState();if(renderNow&&!modalOpen()&&typeof renderAll==='function')renderAll();return true}

  async function fetchRemoteState(){const [a,b]=await Promise.all([jsonp('list'),jsonp('documents')]);if(!a||!a.ok)throw new Error((a&&a.error)||'Lecture commandes impossible');if(!b||!b.ok)throw new Error((b&&b.error)||'Lecture documents impossible');const remoteOrders=safeArray(a.commandes).map(o=>{try{return typeof normalizeFromSheet==='function'?normalizeFromSheet(o):o}catch(e){return o}});const remoteDocs=safeArray(b.documents);reconcileQueue(remoteOrders,remoteDocs);return overlayPending(remoteOrders,remoteDocs)}

  async function syncAfterSave(){
    if(remoteSyncInFlight)return false;
    remoteSyncInFlight=true;
    try{
      const merged=await fetchRemoteState();
      applyLiveState(merged.orders,merged.documents,false);
      saveSnapshot(merged.orders,merged.documents);
      renderLocalChangeWhenSafe();
      try{setSync(true,queue.length?'Synchronisé · modifications encore en attente':'Synchronisé')}catch(e){}
      return true;
    }catch(e){
      console.warn('AB COMMANDES · synchro après enregistrement',e);
      renderLocalChangeWhenSafe();
      return false;
    }finally{remoteSyncInFlight=false}
  }

  async function syncOnceOnOpen(){if(openingSyncDone||remoteSyncInFlight)return false;openingSyncDone=true;remoteSyncInFlight=true;try{const merged=await fetchRemoteState();if(hadCacheAtOpen)saveSnapshot(merged.orders,merged.documents);else applyLiveState(merged.orders,merged.documents,!modalOpen());try{setSync(true,queue.length?'Synchronisé en arrière-plan · modifications à envoyer':'Synchronisé en arrière-plan · affichage stable')}catch(e){}return true}catch(e){console.warn('AB COMMANDES · synchro à l’ouverture',e);try{setSync(false,hadCacheAtOpen?'Dernier affichage conservé':'Connexion impossible')}catch(err){}return false}finally{remoteSyncInFlight=false}}

  async function sendOperation(op){let result;if(op.entity==='order'&&op.action==='upsert')result=await post({action:'upsert',...op.payload});else if(op.entity==='order'&&op.action==='delete')result=await post({action:'delete',id:op.targetId});else if(op.entity==='document'&&op.action==='upsert')result=await post({action:'document_upsert',...op.payload});else if(op.entity==='document'&&op.action==='delete')result=await post({action:'document_delete',id:op.targetId});if(result&&result.ok===false)throw new Error(result.error||'Envoi impossible');return result}
  async function flushQueue(){if(flushInFlight||!queue.length)return false;if(typeof navigator!=='undefined'&&navigator.onLine===false)return false;flushInFlight=true;let sentAny=false;try{for(const op of [...queue]){try{await sendOperation(op);queue=queue.filter(current=>current!==op);persistQueue();sentAny=true}catch(e){console.warn('AB COMMANDES · envoi différé',e)}}}finally{flushInFlight=false}if(sentAny){try{setSync(true,queue.length?'Certaines modifications restent en attente':'Enregistré')}catch(e){}}return sentAny}
  async function flushThenSync(){await flushQueue();await syncAfterSave()}

  try{
    saveOrder=async function(obj){const id=text(obj&&obj.id);const current=safeArray(orders);const idx=current.findIndex(o=>text(o.id)===id);const existing=idx>=0?current[idx]:{};let next={...existing,...obj};try{if(typeof normalizeFromSheet==='function')next=normalizeFromSheet(next)}catch(e){}const nextOrders=current.slice();if(idx>=0)nextOrders[idx]=next;else nextOrders.push(next);orders=nextOrders;queueOrderUpsert(next);saveLocalState();renderLocalChangeWhenSafe();try{setSync(true,'Enregistré localement · synchronisation…')}catch(e){}setTimeout(flushThenSync,0);return true};
    deleteOrder=async function(id){const target=text(id);orders=safeArray(orders).filter(o=>text(o.id)!==target);queueOrderDelete(target);saveLocalState();renderLocalChangeWhenSafe();try{setSync(true,'Suppression locale · synchronisation…')}catch(e){}setTimeout(flushThenSync,0);return true};
    saveDocument=async function(doc){const id=text(doc&&doc.id);const current=safeArray(documents);const idx=current.findIndex(d=>text(d.id)===id);const nextDocs=current.slice();if(idx>=0)nextDocs[idx]={...current[idx],...doc};else nextDocs.push(doc);documents=nextDocs;queueDocUpsert(doc);saveLocalState();try{if(typeof renderDocList==='function')renderDocList()}catch(e){}renderLocalChangeWhenSafe();try{setSync(true,'Document enregistré · synchronisation…')}catch(e){}setTimeout(flushThenSync,0);return true};
    deleteDocument=async function(id){const target=text(id);documents=safeArray(documents).filter(d=>text(d.id)!==target);queueDocDelete(target);saveLocalState();try{if(typeof renderDocList==='function')renderDocList()}catch(e){}renderLocalChangeWhenSafe();try{setSync(true,'Suppression document · synchronisation…')}catch(e){}setTimeout(flushThenSync,0);return true};
    loadAll=async function(){return false};
  }catch(e){console.error('AB COMMANDES · installation synchro stable',e)}

  hadCacheAtOpen=hydrateLocalState();
  if(queue.length){const merged=overlayPending(safeArray(orders),safeArray(documents));applyLiveState(merged.orders,merged.documents,!modalOpen())}else if(!hadCacheAtOpen)saveLocalState();
  setTimeout(async()=>{await syncOnceOnOpen();await flushQueue();if(!IS_EMBED&&!userInteracted){try{if(typeof loadYayaChantiers==='function'){await Promise.resolve(loadYayaChantiers(true));try{if(typeof tryOpenDeepLink==='function')tryOpenDeepLink()}catch(e){}}}catch(e){}}},OPEN_SYNC_DELAY_MS);

  window.__AB_COMMANDES_BACKGROUND_SYNC_VERSION='1.7-sync-after-save';
})();
