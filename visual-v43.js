// v49 · UX visual unificada para Reconectadores MT. No modifica datos ni lógica de negocio.
(function(){
  const THEME_KEY='reco_mt_theme_v49';
  const ICONS={inicio:'⌂',catalogo:'⚡',mapa:'⌖',gestion:'▥',manuales:'▤',administrar:'⚙'};
  const LABELS={inicio:'Inicio',catalogo:'Equipos',mapa:'Mapa',gestion:'Gestión',manuales:'Manuales',administrar:'Admin'};

  function safeCount(){try{return state?.reconectadores?.length||0}catch(_){return 0}}
  function safeIns(){try{return state?.inspecciones?.length||0}catch(_){return 0}}

  function addHeader(){
    const brandText=document.querySelector('.brand > div:last-child');
    if(brandText){
      const h=brandText.querySelector('h1'); if(h)h.textContent='Reconectadores MT';
      const p=brandText.querySelector('p'); if(p)p.textContent='CGE · Delegación Iquique · Gestión de activos';
      let row=document.getElementById('visualStatusRow');
      if(!row){row=document.createElement('div');row.id='visualStatusRow';row.className='visualStatusRow';brandText.appendChild(row);}
      row.innerHTML='<span id="visualOnline" class="visualStatusChip">● Revisando conexión</span><span id="visualClock" class="visualStatusChip subtle"></span>';
    }
    const actions=document.querySelector('.top-actions'); if(!actions)return;
    if(!document.getElementById('refreshPageV45')){
      const b=document.createElement('button');b.id='refreshPageV45';b.className='btn ghost-light refreshPageV45';b.type='button';
      b.title='Actualizar información';b.setAttribute('aria-label','Actualizar información');
      b.innerHTML='<span class="refreshIconV45">↻</span><span class="refreshTextV45">Actualizar</span>';
      b.addEventListener('click',async()=>{
        b.disabled=true;b.classList.add('isRefreshing');
        try{if('serviceWorker'in navigator){const reg=await navigator.serviceWorker.getRegistration();if(reg)await reg.update();}}catch(_){}
        try{if(typeof loadData==='function'){await loadData(true);b.disabled=false;b.classList.remove('isRefreshing');return;}}catch(_){}
        location.reload();
      });
      actions.insertBefore(b,actions.lastElementChild);
    }
    if(!document.getElementById('themeToggleV43')){
      const b=document.createElement('button');b.id='themeToggleV43';b.className='btn ghost-light themeToggleV43';b.type='button';b.title='Cambiar apariencia';b.setAttribute('aria-label','Cambiar apariencia');
      b.addEventListener('click',()=>applyTheme(document.body.dataset.theme==='dark'?'light':'dark'));
      actions.insertBefore(b,actions.lastElementChild);
    }
  }

  function decorateTabs(){
    document.querySelectorAll('.tabs .tab').forEach(b=>{
      const v=b.dataset.view;if(!v)return;
      b.innerHTML='<span class="navIcon">'+(ICONS[v]||'•')+'</span><span>'+LABELS[v]+'</span>';
      b.title=LABELS[v];
    });
  }

  function buildMobileNav(){
    let nav=document.getElementById('mobileNavV43');
    if(nav)nav.remove();
    nav=document.createElement('nav');nav.id='mobileNavV43';nav.className='mobileNavV43';nav.setAttribute('aria-label','Navegación principal');
    ['inicio','catalogo','mapa','gestion','manuales'].forEach(v=>{
      const b=document.createElement('button');b.type='button';b.className='mobileNavBtn';b.dataset.mobileView=v;
      b.innerHTML='<span class="mobileNavIcon">'+ICONS[v]+'</span><small>'+LABELS[v]+'</small>';
      b.addEventListener('click',()=>{try{goView(v)}catch(_){document.querySelector('.tabs .tab[data-view="'+v+'"]')?.click();}syncMobileNav();});
      nav.appendChild(b);
    });
    document.body.appendChild(nav);syncMobileNav();
  }

  function syncMobileNav(){
    const active=document.querySelector('.view.active-view')?.id||'inicio';
    document.querySelectorAll('.mobileNavBtn').forEach(b=>b.classList.toggle('active',b.dataset.mobileView===active));
  }

  function improveHero(){
    const hero=document.querySelector('#inicio .hero');if(!hero)return;
    const left=hero.querySelector(':scope > div:first-child');
    if(left){
      const eyebrow=left.querySelector('.eyebrow');if(eyebrow)eyebrow.textContent='CENTRO DE CONTROL · ACTIVOS MT';
      const h2=left.querySelector('h2');if(h2)h2.innerHTML='Información clara para gestionar <span class="heroAccentV49">la red MT.</span>';
      const p=left.querySelector('p');if(p)p.textContent='Revisa equipos, estado operacional, ubicación, comunicación remota e inspecciones desde una sola aplicación.';
      let quick=left.querySelector('.quickActionsV49');
      if(!quick){
        quick=document.createElement('div');quick.className='quickActionsV49';
        quick.innerHTML='<button type="button" onclick="goView(\'catalogo\')"><b>⚡</b><span><strong>Equipos</strong><small>Buscar y revisar fichas</small></span></button><button type="button" onclick="goView(\'mapa\')"><b>⌖</b><span><strong>Mapa</strong><small>Ubicación y rutas</small></span></button><button type="button" onclick="goView(\'gestion\')"><b>▥</b><span><strong>Gestión</strong><small>Indicadores y estado</small></span></button>';
        const btns=left.querySelector('.hero-buttons'); if(btns)left.insertBefore(quick,btns);else left.appendChild(quick);
      }
      const primary=left.querySelector('.hero-buttons .primary');if(primary)primary.textContent='Ver todos los equipos';
    }
    const visual=hero.querySelector('.hero-visual');if(visual&&!document.getElementById('heroInfoV43')){
      const card=document.createElement('div');card.id='heroInfoV43';card.className='heroInfoV43';
      card.innerHTML='<div><span>Estado de la base</span><strong id="heroDataV43">Conectando…</strong></div><div><span>Reconectadores</span><strong id="heroCountV43">—</strong></div><div><span>Inspecciones</span><strong id="heroInsV49">—</strong></div><div><span>Última actualización</span><strong id="heroClockV43">—</strong></div>';
      visual.appendChild(card);
    }
  }

  function improveSections(){
    const cfg={
      catalogo:['EQUIPOS DE LA RED','Reconectadores','Busca por código, alimentador, ubicación, estado, cuadrante o gestor.'],
      mapa:['UBICACIÓN Y RUTAS','Mapa operacional','Visualiza los equipos georreferenciados y planifica recorridos de inspección.'],
      gestion:['INDICADORES','Gestión de activos','Revisa disponibilidad, criticidad, pendientes y estado general de la flota.'],
      manuales:['APOYO TÉCNICO','Manuales','Documentación de consulta para los principales equipos de la red.']
    };
    Object.entries(cfg).forEach(([id,v])=>{
      const s=document.getElementById(id);if(!s)return;
      const title=s.querySelector('.sectionTitle');if(!title)return;
      const e=title.querySelector('.eyebrow');if(e)e.textContent=v[0];
      const h=title.querySelector('h2');if(h)h.textContent=v[1];
      if(!title.querySelector('.sectionDescV49')){
        const d=document.createElement('p');d.className='sectionDescV49';d.textContent=v[2];
        title.querySelector('div')?.appendChild(d);
      }
    });
  }

  function improveFilters(){
    const filters=document.querySelector('#catalogo .filters');if(!filters)return;
    filters.classList.add('filtersV49');
    const search=document.getElementById('searchReco');
    if(search){search.placeholder='Buscar equipo, alimentador, ubicación, gestor…';search.setAttribute('aria-label','Buscar reconectadores');}
    if(!document.getElementById('catalogSummaryV49')){
      const box=document.createElement('div');box.id='catalogSummaryV49';box.className='catalogSummaryV49';
      box.innerHTML='<span><strong id="catalogVisibleV49">0</strong> equipos visibles</span><small>Selecciona una tarjeta para abrir la ficha técnica</small>';
      filters.parentNode.insertBefore(box,filters.nextSibling);
    }
  }

  function enhanceCards(){
    document.querySelectorAll('#kpis .card').forEach((c,i)=>{
      c.classList.add('kpiV49');
      const subs=['Base maestra','Disponibilidad','Seguimiento','Prioridad','Historial'];
      let sub=c.querySelector('.cardSubV43');
      if(!sub){sub=document.createElement('div');sub.className='cardSubV43';c.appendChild(sub);}
      sub.textContent=subs[i]||'Indicador';
    });
    document.querySelectorAll('.recoCard').forEach(c=>{
      c.classList.add('recoCardV49');
      const btn=c.querySelector('.btn.primary');if(btn)btn.textContent='Ver ficha →';
    });
    const visible=[...document.querySelectorAll('#recoGrid .recoCard')].filter(c=>c.style.display!=='none').length;
    const el=document.getElementById('catalogVisibleV49');if(el)el.textContent=visible;
  }

  function updateStatus(){
    const now=new Date();
    const count=safeCount(),ins=safeIns();
    const online=navigator.onLine&&count>0;
    const chip=document.getElementById('visualOnline');
    if(chip){chip.className='visualStatusChip '+(online?'online':'offline');chip.textContent=online?'● Base conectada':'● Sin conexión a datos';}
    const clock=document.getElementById('visualClock');if(clock)clock.textContent=now.toLocaleString('es-CL',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
    const d=document.getElementById('heroDataV43');if(d)d.textContent=online?'Operativa':'Sin conexión';
    const c=document.getElementById('heroCountV43');if(c)c.textContent=count?String(count):'—';
    const i=document.getElementById('heroInsV49');if(i)i.textContent=ins?String(ins):'0';
    const hc=document.getElementById('heroClockV43');if(hc)hc.textContent=now.toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'});
    enhanceCards();
  }

  function applyTheme(theme){
    document.body.dataset.theme=theme;localStorage.setItem(THEME_KEY,theme);
    const b=document.getElementById('themeToggleV43');if(b)b.textContent=theme==='dark'?'☀':'☾';
  }

  function init(){
    document.body.classList.add('uxV49');
    addHeader();decorateTabs();buildMobileNav();improveHero();improveSections();improveFilters();
    applyTheme(localStorage.getItem(THEME_KEY)||localStorage.getItem('reco_mt_theme_v43')||'light');
    updateStatus();
    const obs=new MutationObserver(()=>{syncMobileNav();enhanceCards();});
    obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
    window.addEventListener('online',updateStatus);window.addEventListener('offline',updateStatus);
    document.addEventListener('click',e=>{if(e.target.closest('.tab,.mobileNavBtn'))setTimeout(syncMobileNav,20);});
    setInterval(updateStatus,1500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();