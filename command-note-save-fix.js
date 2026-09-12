(function(){
  'use strict';

  if(window.__AB_COMMAND_NOTE_SAVE_FIX_V1)return;
  window.__AB_COMMAND_NOTE_SAVE_FIX_V1=true;

  const COMMAND_NOTE_COMMAND_ID='__AB_NOTE_COMMANDES__';
  const COMMAND_NOTE_TYPE='Note commandes';

  function key(v){
    return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
  }

  function existingNote(id,name){
    try{
      const list=Array.isArray(documents)?documents:[];
      const nk=key(name);
      return list.find(d=>{
        if(String(d&&d.commande_id||'')!==COMMAND_NOTE_COMMAND_ID&&String(d&&d.type||'')!==COMMAND_NOTE_TYPE)return false;
        const did=String(d&&d.auteur||'').trim();
        return (id&&did&&String(id)===did)||(nk&&key(d&&d.chantier)===nk);
      })||null;
    }catch(e){return null;}
  }

  function refresh(){
    try{if(typeof renderAll==='function')renderAll();}catch(e){}
  }

  document.addEventListener('click',function(event){
    const button=event.target&&event.target.closest&&event.target.closest('#abCommandNoteSave');
    if(!button)return;

    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();

    const box=document.getElementById('abCommandNote');
    const input=document.getElementById('abCommandNoteInput');
    if(!box||!input)return;

    const text=String(input.value||'').trim();
    const id=String(typeof selectedChantierId!=='undefined'?selectedChantierId:'').trim();
    const name=String(typeof selectedChantierName!=='undefined'?selectedChantierName:'').trim();
    const existing=existingNote(id,name);

    button.disabled=true;
    button.textContent='Enregistré';

    /* Fermer l'éditeur immédiatement. Le rendu local prend le relais. */
    box.dataset.editing='0';

    try{
      if(!text){
        if(existing&&typeof deleteDocument==='function'){
          Promise.resolve(deleteDocument(existing.id)).catch(function(err){
            console.error('NOTE COMMANDES · suppression',err);
            alert('Suppression de la note impossible.');
          });
        }else{
          refresh();
        }
        return;
      }

      if(typeof saveDocument!=='function')throw new Error('saveDocument indisponible');

      const doc={
        ...(existing||{}),
        id:existing&&existing.id?existing.id:('note-commandes-'+(typeof uid==='function'?uid():Date.now())),
        commande_id:COMMAND_NOTE_COMMAND_ID,
        chantier:name,
        type:COMMAND_NOTE_TYPE,
        nom_fichier:text,
        url_pdf:'',
        source:'AB COMMANDES',
        date_document:new Date().toISOString().slice(0,10),
        auteur:id
      };

      /* saveDocument applique d'abord l'état local puis envoie en arrière-plan. */
      Promise.resolve(saveDocument(doc)).catch(function(err){
        console.error('NOTE COMMANDES · enregistrement',err);
        alert('Enregistrement de la note impossible.');
      });
    }catch(err){
      console.error('NOTE COMMANDES · enregistrement',err);
      box.dataset.editing='1';
      button.disabled=false;
      button.textContent='Enregistrer';
      alert('Enregistrement de la note impossible.');
    }
  },true);

  window.__AB_COMMAND_NOTE_SAVE_FIX_VERSION='1.0';
})();
