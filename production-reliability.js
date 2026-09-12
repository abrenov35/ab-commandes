(function(){
  'use strict';

  const VERSION='28.3';
  const MAX_ATTEMPTS=7;
  const BASE_DELAY=260;
  const TRACKED_ACTIONS=new Set(['upsert','delete','document_upsert','document_delete']);
  const ORDER_FIELDS=['chantier','produit','qte','fournisseur','responsable','status','notes'];
  const DOC_FIELDS=['commande_id','chantier','type','nom_fichier','url_pdf','source','date_document','auteur'];

  if(typeof window.post!=='function'||typeof GAS==='undefined'){
    console.warn('AB COMMANDES V28 · post/GAS indisponible');
    return;
  }
  if(window.post.__abReliableV28)return;

  const rawPost=window.post;

  function text(v){return String(v==null?'':v).trim()}
  function same(a,b){return text(a)===text(b)}
  function fieldValue(key,v){
    const s=text(v);
    return key==='chantier'?s.toLocaleUpperCase('fr-FR'):s;
  }
  function sameField(key,a,b){return fieldValue(key,a)===fieldValue(key,b)}
  function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms))}

  function jsonpRequest(action,params){
    return new Promise((resolve,reject)=>{
      const cb='abrel_'+Date.now()+'_'+Math.floor(Math.random()*100000);
      const script=document.createElement('script');
      const query=new URLSearchParams({action:String(action||''),callback:cb,_:String(Date.now())});
      Object.entries(params||{}).forEach(([k,v])=>query.set(k,text(v)));
      let done=false;
      const timer=setTimeout(()=>finish(new Error('Délai de confirmation dépassé')),9000);

      function cleanup(){clearTimeout(timer);try{delete window[cb]}catch(_){window[cb]=undefined}script.remove()}
      function finish(err,data){if(done)return;done=true;cleanup();err?reject(err):resolve(data)}

      window[cb]=data=>finish(null,data);
      script.onerror=()=>finish(new Error('Confirmation Sheet impossible'));
      script.src=GAS+'?'+query.toString();
      document.body.appendChild(script);
    });
  }

  async function getRemoteOrder(id){
    try{
      const one=await jsonpRequest('commande',{id});
      if(one&&one.ok&&Object.prototype.hasOwnProperty.call(one,'commande'))return one.commande||null;
    }catch(_){}
    const all=await jsonpRequest('list',{});
    if(!all||!all.ok||!Array.isArray(all.commandes))throw new Error((all&&all.error)||'Lecture commandes impossible');
    return all.commandes.find(o=>same(o&&o.id,id))||null;
  }

  async function getRemoteDocument(id){
    try{
      const one=await jsonpRequest('document',{id});
      if(one&&one.ok&&Object.prototype.hasOwnProperty.call(one,'document'))return one.document||null;
    }catch(_){}
    const all=await jsonpRequest('documents',{});
    if(!all||!all.ok||!Array.isArray(all.documents))throw new Error((all&&all.error)||'Lecture documents impossible');
    return all.documents.find(d=>same(d&&d.id,id))||null;
  }

  function comparableOrder(remote,payload){
    if(!remote)return false;
    if(!same(remote.id,payload.id))return false;
    for(const key of ORDER_FIELDS){
      if(Object.prototype.hasOwnProperty.call(payload,key)&&!sameField(key,remote[key],payload[key]))return false;
    }
    /* Les champs ajoutés récemment ne sont vérifiés que si le backend les expose déjà. */
    for(const key of ['chantierId','prix']){
      if(Object.prototype.hasOwnProperty.call(payload,key)&&Object.prototype.hasOwnProperty.call(remote,key)&&!sameField(key,remote[key],payload[key]))return false;
    }
    return true;
  }

  function comparableDocument(remote,payload){
    if(!remote)return false;
    if(!same(remote.id,payload.id))return false;
    for(const key of DOC_FIELDS){
      if(Object.prototype.hasOwnProperty.call(payload,key)&&!sameField(key,remote[key],payload[key]))return false;
    }
    return true;
  }

  async function confirmed(data){
    const action=text(data&&data.action)||'upsert';
    const id=text(data&&data.id);
    if(!id)throw new Error('ID manquant pour confirmer l’enregistrement');

    if(action==='upsert')return comparableOrder(await getRemoteOrder(id),data);
    if(action==='delete')return !(await getRemoteOrder(id));
    if(action==='document_upsert')return comparableDocument(await getRemoteDocument(id),data);
    if(action==='document_delete')return !(await getRemoteDocument(id));
    return true;
  }

  async function confirmMutation(data){
    let lastError=null;
    for(let i=0;i<MAX_ATTEMPTS;i++){
      if(i)await sleep(BASE_DELAY*Math.min(1+i,5));
      try{
        if(await confirmed(data))return true;
      }catch(err){lastError=err}
    }
    const action=text(data&&data.action)||'upsert';
    const label=action.startsWith('document_')?'document':'commande';
    throw new Error((lastError&&lastError.message)||('Le '+label+' n’a pas été confirmé dans Google Sheets.'));
  }

  const reliablePost=async function(data){
    await rawPost.call(this,data);
    const action=text(data&&data.action)||'upsert';
    if(!TRACKED_ACTIONS.has(action))return {ok:true,unconfirmed:true};
    await confirmMutation(data||{});
    return {ok:true,confirmed:true};
  };
  reliablePost.__abReliableV28=true;
  reliablePost.__abRawPost=rawPost;
  window.post=reliablePost;

  window.addEventListener('unhandledrejection',event=>{
    const msg=text(event&&event.reason&&event.reason.message);
    if(!/confirm|Google Sheets|enregistrement/i.test(msg))return;
    try{if(typeof setSync==='function')setSync(false,'Modification conservée localement · renvoi à la prochaine ouverture')}catch(_){}
  });

  window.__AB_COMMANDES_PRODUCTION_RELIABILITY_VERSION=VERSION;
})();
