(function(){
  'use strict';

  const BADGE_ID='abCommandesLiveVersionBadge';
  const STYLE_ID='abCommandesLiveVersionBadgeStyle';
  const VERSION_URL='version.json';
  let lastVersion='';

  function targetDocument(){
    try{
      if(window.parent&&window.parent!==window&&window.parent.location.origin===window.location.origin){
        return window.parent.document;
      }
    }catch(_){ }
    return document;
  }

  function injectStyle(doc){
    if(doc.getElementById(STYLE_ID))return;
    const style=doc.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #${BADGE_ID}{
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        height:24px!important;
        margin-left:8px!important;
        padding:0 8px!important;
        border:1px solid rgba(255,255,255,.35)!important;
        border-radius:999px!important;
        background:#e8f5ec!important;
        color:#287a46!important;
        font-size:10px!important;
        font-weight:900!important;
        letter-spacing:.02em!important;
        line-height:1!important;
        white-space:nowrap!important;
        box-shadow:0 1px 2px rgba(0,0,0,.08)!important;
      }
      body:not(:has(.hdr)) #${BADGE_ID}{
        position:fixed!important;
        right:10px!important;
        bottom:10px!important;
        z-index:9999!important;
        margin:0!important;
        border-color:#b9dfc5!important;
      }
    `;
    doc.head.appendChild(style);
  }

  function ensureBadge(version){
    const doc=targetDocument();
    injectStyle(doc);
    let badge=doc.getElementById(BADGE_ID);
    if(!badge){
      badge=doc.createElement('span');
      badge.id=BADGE_ID;
      badge.title='Version AB COMMANDES actuellement publiée';

      const header=doc.querySelector('.hdr');
      const brand=header&&header.querySelector('.brand');
      if(brand)brand.appendChild(badge);
      else if(header)header.appendChild(badge);
      else doc.body.appendChild(badge);
    }

    badge.textContent='CMD v'+version+' ✓';
    badge.dataset.version=version;

    try{
      const clean=doc.title.replace(/\s·\sCMD\sv[^·]+$/i,'');
      doc.title=clean+' · CMD v'+version;
    }catch(_){ }
  }

  async function refresh(){
    try{
      const r=await fetch(VERSION_URL+'?_='+Date.now(),{cache:'no-store'});
      if(!r.ok)throw new Error('version '+r.status);
      const data=await r.json();
      const version=String(data&&data.version||'').trim().replace(/^v/i,'');
      if(!version)return;
      lastVersion=version;
      ensureBadge(version);
      window.__AB_COMMANDES_LIVE_VERSION=version;
    }catch(_){
      if(lastVersion)ensureBadge(lastVersion);
    }
  }

  refresh();
  setInterval(refresh,30000);
  window.addEventListener('focus',refresh);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
})();
