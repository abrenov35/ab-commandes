(function(){
  'use strict';

  if(window.__AB_COMMANDES_NO_FLICKER_GUARD_V1)return;
  window.__AB_COMMANDES_NO_FLICKER_GUARD_V1=true;

  let localUiUpdate=false;
  let firstNetworkRenderAllowed=false;
  let originalRenderAll=null;

  function hasUsableCache(){
    try{
      const raw=localStorage.getItem('AB_COMMANDES_LOCAL_STATE_V1');
      const o=raw?JSON.parse(raw):null;
      return !!(o&&Array.isArray(o.orders));
    }catch(e){
      return false;
    }
  }

  firstNetworkRenderAllowed=!hasUsableCache();

  function installRenderGuard(){
    if(typeof window.renderAll!=='function'){
      setTimeout(installRenderGuard,30);
      return;
    }
    if(window.renderAll.__abNoFlickerGuard)return;

    originalRenderAll=window.renderAll;

    function guardedRenderAll(){
      if(localUiUpdate){
        return originalRenderAll.apply(this,arguments);
      }

      if(firstNetworkRenderAllowed){
        firstNetworkRenderAllowed=false;
        return originalRenderAll.apply(this,arguments);
      }

      // Les synchronisations distantes mettent le cache à jour mais ne reconstruisent
      // jamais l'écran courant. Cela évite clignotements et fermeture des modales.
      window.__AB_COMMANDES_REMOTE_RENDER_DEFERRED=true;
      return false;
    }

    guardedRenderAll.__abNoFlickerGuard=true;
    guardedRenderAll.__abOriginalRenderAll=originalRenderAll;
    window.renderAll=guardedRenderAll;
  }

  function wrapLocalAction(name){
    const fn=window[name];
    if(typeof fn!=='function'||fn.__abNoFlickerLocalAction)return;

    const wrapped=function(){
      localUiUpdate=true;
      try{
        return fn.apply(this,arguments);
      }finally{
        localUiUpdate=false;
      }
    };

    wrapped.__abNoFlickerLocalAction=true;
    wrapped.__abOriginalAction=fn;
    window[name]=wrapped;
  }

  function installActions(){
    ['saveOrder','deleteOrder','saveDocument','deleteDocument'].forEach(wrapLocalAction);
  }

  installRenderGuard();
  installActions();
  [50,150,500].forEach(function(ms){
    setTimeout(function(){
      installRenderGuard();
      installActions();
    },ms);
  });

  window.__AB_COMMANDES_NO_FLICKER_VERSION='1.0-cache-first-no-live-rerender';
})();
