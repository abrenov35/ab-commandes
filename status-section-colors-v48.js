(function(){
  'use strict';

  const STYLE_ID='ab-commandes-status-colors-v48-style';
  let scheduled=false;

  function norm(v){
    return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
  }

  function toneFromText(v){
    const t=norm(v);
    if(t.includes('choix client'))return 'choice';
    if(t.includes('a commander'))return 'todo';
    if(t.includes('commande'))return 'ordered';
    if(t.includes('recu'))return 'received';
    return '';
  }

  function injectStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      /* V48 : ordre visuel 1 violet / 2 orange / 3 bleu / 4 vert */
      .ab-status-section[data-ab-tone="choice"]{background:#fbf7ff!important;border-color:#cfb2ef!important}
      .ab-status-section[data-ab-tone="choice"]>summary{background:#f5edff!important;color:#563080!important}
      .ab-status-section[data-ab-tone="choice"] .ab-status-count{background:#a96ee0!important;color:#fff!important;border:1px solid #9558cf!important}
      .ab-status-section[data-ab-tone="choice"] .ab-status-heading .mini-dot{background:#a96ee0!important}

      .ab-status-section[data-ab-tone="todo"]{background:#fffaf3!important;border-color:#efc58e!important}
      .ab-status-section[data-ab-tone="todo"]>summary{background:#fff2df!important;color:#8a4b12!important}
      .ab-status-section[data-ab-tone="todo"] .ab-status-count{background:#e99a43!important;color:#fff!important;border:1px solid #d7852c!important}
      .ab-status-section[data-ab-tone="todo"] .ab-status-heading .mini-dot{background:#e99a43!important}

      .ab-status-section[data-ab-tone="ordered"]{background:#f5f9ff!important;border-color:#9fc3e8!important}
      .ab-status-section[data-ab-tone="ordered"]>summary{background:#eaf4ff!important;color:#245f98!important}
      .ab-status-section[data-ab-tone="ordered"] .ab-status-count{background:#4e8fd0!important;color:#fff!important;border:1px solid #367abf!important}
      .ab-status-section[data-ab-tone="ordered"] .ab-status-heading .mini-dot{background:#4e8fd0!important}

      .ab-status-section[data-ab-tone="received"]{background:#f3fbf7!important;border-color:#98d4b3!important}
      .ab-status-section[data-ab-tone="received"]>summary{background:#e8f8ef!important;color:#286c4a!important}
      .ab-status-section[data-ab-tone="received"] .ab-status-count{background:#49a978!important;color:#fff!important;border:1px solid #368f63!important}
      .ab-status-section[data-ab-tone="received"] .ab-status-heading .mini-dot{background:#49a978!important}

      body.ab-embed-mode #chantierFiche .fiche-kpis .ab-kpi-shortcut[data-ab-status="choice"]{background:#f5edff!important;border-color:#cfb2ef!important}
      body.ab-embed-mode #chantierFiche .fiche-kpis .ab-kpi-shortcut[data-ab-status="todo"]{background:#fff2df!important;border-color:#efc58e!important}
      body.ab-embed-mode #chantierFiche .fiche-kpis .ab-kpi-shortcut[data-ab-status="ordered"]{background:#eaf4ff!important;border-color:#9fc3e8!important}
      body.ab-embed-mode #chantierFiche .fiche-kpis .ab-kpi-shortcut[data-ab-status="received"]{background:#e8f8ef!important;border-color:#98d4b3!important}

      body.ab-embed-mode #chantierFiche .fiche-kpis .ab-kpi-shortcut[data-ab-status="choice"] .status-dot{background:#a96ee0!important}
      body.ab-embed-mode #chantierFiche .fiche-kpis .ab-kpi-shortcut[data-ab-status="todo"] .status-dot{background:#e99a43!important}
      body.ab-embed-mode #chantierFiche .fiche-kpis .ab-kpi-shortcut[data-ab-status="ordered"] .status-dot{background:#4e8fd0!important}
      body.ab-embed-mode #chantierFiche .fiche-kpis .ab-kpi-shortcut[data-ab-status="received"] .status-dot{background:#49a978!important}

      .ab-status-section>summary{transition:background .15s ease,border-color .15s ease!important}
      .ab-status-section .ab-status-count{font-weight:900!important;box-shadow:0 1px 2px rgba(20,33,61,.10)!important}
    `;
    document.head.appendChild(s);
  }

  function apply(){
    injectStyle();
    document.querySelectorAll('.ab-status-section').forEach(section=>{
      const heading=section.querySelector('.ab-status-heading');
      const tone=toneFromText(heading?.textContent||section.textContent||'');
      if(tone)section.dataset.abTone=tone;
    });
  }

  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;apply();});
  }

  injectStyle();
  apply();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('load',apply,{once:true});
  setTimeout(apply,80);
  setTimeout(apply,500);

  window.__AB_COMMANDES_STATUS_COLORS_VERSION='48.0';
})();
