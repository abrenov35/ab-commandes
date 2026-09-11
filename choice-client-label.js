(function(){
  'use strict';

  const OLD='Choix client à faire';
  const NEW='Choix client';

  try{
    if(typeof STATUSES!=='undefined'&&STATUSES.choice){
      STATUSES.choice.label=NEW;
    }
  }catch(e){}

  function replaceText(root){
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      if(String(node.nodeValue||'').includes(OLD)){
        node.nodeValue=String(node.nodeValue).replaceAll(OLD,NEW);
      }
    });
  }

  function refresh(){
    try{
      if(typeof STATUSES!=='undefined'&&STATUSES.choice){
        STATUSES.choice.label=NEW;
      }
    }catch(e){}
    replaceText(document.body);
  }

  refresh();
  new MutationObserver(refresh).observe(document.body,{childList:true,subtree:true,characterData:true});
  window.addEventListener('load',refresh);

  window.__AB_COMMANDES_CHOICE_CLIENT_LABEL_VERSION='1.0';
})();
