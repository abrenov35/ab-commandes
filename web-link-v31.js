(function(){
  'use strict';

  const TYPE='Lien web';
  const VERSION='33.0';
  let scheduled=false;

  function docs(){return (typeof documents!=='undefined'&&Array.isArray(documents))?documents:[]}
  function ordersList(){return (typeof orders!=='undefined'&&Array.isArray(orders))?orders:[]}
  function webDoc(orderId){
    const id=String(orderId||'');
    return docs().find(d=>String(d.commande_id||'')===id&&(String(d.type||'')===TYPE||String(d.id||'')==='weblink-'+id))||null;
  }
  function webUrl(orderId){return String(webDoc(orderId)?.url_pdf||'').trim()}
  function normalizeUrl(v){
    let s=String(v||'').trim();
    if(!s)return '';
    if(!/^[a-z][a-z0-9+.-]*:\/\//i.test(s))s='https://'+s;
    try{
      const u=new URL(s);
      if(u.protocol!=='http:'&&u.protocol!=='https:')throw new Error('Protocole non autorisé');
      return u.href;
    }catch(_){throw new Error('Lien web invalide. Exemple : https://www.site.fr/page')}
  }
  function today(){
    try{return new Date().toLocaleDateString('fr-CA')}
    catch(_){return new Date().toISOString().slice(0,10)}
  }

  function ensureStyle(){
    if(document.getElementById('ab-web-link-v32-style'))return;
    const s=document.createElement('style');
    s.id='ab-web-link-v32-style';
    s.textContent=`
      #modal #abWebLinkWrap{grid-column:1/-1!important}
      #modal #fWebLink{font-weight:600!important}

      .ab-web-link-btn{
        margin-left:0!important;
        min-width:48px!important;
        width:48px!important;
        height:42px!important;
        padding:0!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        border:1px solid #7898b8!important;
        background:#eaf3fc!important;
        color:#173b63!important;
        border-radius:9px!important;
        font-size:18px!important;
        line-height:1!important;
        box-shadow:0 1px 2px rgba(25,50,80,.10)!important;
        flex:0 0 auto!important;
      }
      .ab-web-link-btn:not([disabled]):hover{background:#dcecff!important;border-color:#4f82b7!important}
      .ab-web-link-btn[disabled]{
        opacity:.62!important;
        background:#f3f6f9!important;
        border-color:#aebdcb!important;
        color:#66788b!important;
        cursor:default!important;
      }

      body.ab-embed-mode #chantierFiche .fiche-orders .order-row.ab-row-simple{
        grid-template-columns:minmax(180px,1.65fr) minmax(100px,.75fr) minmax(150px,1fr) 106px!important;
      }
      body.ab-embed-mode #chantierFiche .ab-order-doc{
        display:flex!important;
        align-items:center!important;
        justify-content:flex-end!important;
        flex-wrap:nowrap!important;
        gap:8px!important;
        min-width:104px!important;
      }
      body.ab-embed-mode #chantierFiche .ab-order-doc .doc-btn{
        margin:0!important;
        min-width:48px!important;
        width:48px!important;
        height:42px!important;
        padding:0!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        border:1px solid #7898b8!important;
        background:#f1f6fb!important;
        color:#173b63!important;
        border-radius:9px!important;
        font-size:14px!important;
        line-height:1!important;
        box-shadow:0 1px 2px rgba(25,50,80,.10)!important;
        flex:0 0 auto!important;
      }
      body.ab-embed-mode #chantierFiche .ab-order-doc .doc-btn.has{
        background:#dfedfb!important;
        border-color:#5687b9!important;
        color:#0f4f86!important;
      }
      body.ab-embed-mode #chantierFiche .ab-order-doc .ab-web-link-btn{
        margin-left:0!important;
        background:#e9f3ff!important;
        border-color:#6f98c3!important;
        color:#173f68!important;
      }

      @media(max-width:620px){
        body.ab-embed-mode #chantierFiche .fiche-orders .order-row.ab-row-simple{
          grid-template-columns:minmax(112px,1.28fr) minmax(72px,.62fr) minmax(108px,.9fr) 85px!important;
          gap:5px!important;
        }
        body.ab-embed-mode #chantierFiche .ab-order-doc{
          min-width:85px!important;
          gap:5px!important;
        }
        body.ab-embed-mode #chantierFiche .ab-order-doc .doc-btn,
        body.ab-embed-mode #chantierFiche .ab-order-doc .ab-web-link-btn,
        .ab-web-link-btn{
          min-width:40px!important;
          width:40px!important;
          height:38px!important;
          padding:0!important;
          border-radius:8px!important;
        }
      }
    `;
    document.head.appendChild(s);
  }

  function ensureField(){
    ensureStyle();
    let input=document.getElementById('fWebLink');
    if(input)return input;
    const notes=document.getElementById('fNotes');
    const grid=notes?.closest('.form-grid')||document.querySelector('#modal .form-grid');
    if(!grid)return null;
    const wrap=document.createElement('div');
    wrap.id='abWebLinkWrap';
    wrap.className='full';
    wrap.innerHTML='<label class="label">Lien web <span class="small">(facultatif)</span></label><input id="fWebLink" class="field" type="url" inputmode="url" autocomplete="off" placeholder="https://www.fournisseur.fr/produit">';
    const notesWrap=notes?.parentElement;
    if(notesWrap&&notesWrap.parentElement===grid)grid.insertBefore(wrap,notesWrap);
    else grid.appendChild(wrap);
    return wrap.querySelector('#fWebLink');
  }

  function fillField(orderId){
    const input=ensureField();
    if(input)input.value=webUrl(orderId);
  }

  async function syncLink(order,raw){
    if(!order||!order.id||typeof post!=='function')return;
    const id=String(order.id);
    const existing=webDoc(id);
    let url='';
    try{url=normalizeUrl(raw)}catch(err){throw err}

    if(!url){
      if(existing){
        await post({action:'document_delete',id:String(existing.id||'weblink-'+id)});
        try{documents=docs().filter(d=>String(d.id||'')!==String(existing.id||''))}catch(_){}
      }
      schedule();
      return;
    }

    const doc={
      id:String(existing?.id||('weblink-'+id)),
      commande_id:id,
      chantier:String(order.chantier||''),
      type:TYPE,
      nom_fichier:'Lien web',
      url_pdf:url,
      source:'Web',
      date_document:today(),
      auteur:String(existing?.auteur||''),
      created_at:String(existing?.created_at||new Date().toISOString())
    };
    await post({action:'document_upsert',...doc});
    try{
      const list=docs();
      const i=list.findIndex(d=>String(d.id||'')===doc.id);
      if(i>=0)list[i]={...list[i],...doc};else list.push(doc);
    }catch(_){}
    schedule();
  }

  function installDocCount(){
    try{
      if(typeof docCount==='function'&&!docCount.__abWebLinkV31){
        const wrapped=function(id){
          return docs().filter(d=>String(d.commande_id||'')===String(id)&&String(d.type||'')!==TYPE).length;
        };
        wrapped.__abWebLinkV31=true;
        docCount=wrapped;
      }
    }catch(err){console.error('AB COMMANDES V33 docCount',err)}
  }

  function rowId(row){return String(row?.dataset?.id||row?.dataset?.ficheId||'')}
  function ensureButton(row){
    const id=rowId(row);if(!id)return;
    const url=webUrl(id);
    const host=row.querySelector('.ab-order-doc')||row.querySelector('[data-label="PDF"]');
    if(!host)return;
    let btn=host.querySelector('.ab-web-link-btn');
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';
      btn.className='doc-btn ab-web-link-btn';
      btn.textContent='🔗';
      host.appendChild(btn);
    }
    btn.disabled=!url;
    btn.title=url?'Ouvrir le lien web dans un nouvel onglet':'Aucun lien web renseigné';
    btn.onclick=e=>{
      e.preventDefault();e.stopPropagation();
      const current=webUrl(id);if(!current)return;
      window.open(current,'_blank','noopener,noreferrer');
    };
  }
  function addButtons(){
    document.querySelectorAll('#ordersList .order-row[data-id],#ficheOrdersList .order-row[data-id],#ficheOrdersList .order-row[data-fiche-id]').forEach(ensureButton);
  }
  function schedule(){
    if(scheduled)return;scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;installDocCount();addButtons()});
  }

  try{
    if(typeof openModal==='function'&&!openModal.__abWebLinkV31){
      const previous=openModal;
      const wrapped=async function(id=null){
        ensureField();
        const out=await previous.apply(this,arguments);
        fillField(id);
        const save=document.getElementById('saveBtn');
        if(save){save.disabled=false;save.textContent='Enregistrer'}
        return out;
      };
      wrapped.__abWebLinkV31=true;
      openModal=wrapped;
    }
  }catch(err){console.error('AB COMMANDES V33 openModal',err)}

  try{
    if(typeof saveOrder==='function'&&!saveOrder.__abWebLinkV31){
      const previous=saveOrder;
      const wrapped=async function(obj){
        const modal=document.getElementById('modal');
        const editing=!!(modal&&modal.classList.contains('show'));
        const input=editing?ensureField():null;
        const raw=editing&&input?String(input.value||''):null;
        if(raw!==null&&String(raw).trim())normalizeUrl(raw);
        const out=await previous.apply(this,arguments);
        if(raw!==null){
          const snapshot={...(obj||{})};
          Promise.resolve().then(()=>syncLink(snapshot,raw)).catch(err=>{
            console.error('AB COMMANDES V33 synchronisation lien web',err);
            try{if(typeof setSync==='function')setSync(false,'Produit enregistré · lien web à resynchroniser')}catch(_){}
          });
        }
        return out;
      };
      wrapped.__abWebLinkV31=true;
      saveOrder=wrapped;
    }
  }catch(err){console.error('AB COMMANDES V33 saveOrder',err)}

  ensureField();installDocCount();schedule();
  const observer=new MutationObserver(schedule);
  observer.observe(document.body,{childList:true,subtree:true});
  window.__AB_COMMANDES_WEB_LINK_VERSION=VERSION;
})();
