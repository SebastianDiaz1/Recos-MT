// v43 · Capa visual moderna sin alterar datos ni lógica de negocio.
(function(){
  const THEME_KEY='reco_mt_theme_v43';
  const ICONS={inicio:'⌂',catalogo:'⚡',mapa:'📍',gestion:'📊',manuales:'📘',administrar:'🛠️'};
  const LABELS={inicio:'Inicio',catalogo:'Equipos',mapa:'Mapa',gestion:'Gestión',manuales:'Manuales',administrar:'Admin'};

  function addHeaderStatus(){
    const brandText=document.querySelector('.brand > div:last-child');
    if(brandText&&!document.getElementById('visualStatusRow')){
      const row=document.createElement('div');
      row.id='visualStatusRow'; row.className='visualStatusRow';
      row.innerHTML='<span id="visualOnline" class="visualStatusChip">● Comprobando base</span><span id="visualClock" class="visualStatusChip subtle"></span>';
      brandText.appendChild(row);
    }
    const actions=document.querySelector('.top-actions');
    if(actions&&!document.getElementById('themeToggleV43')){
      const b=document.createElement('button');b.id='themeToggleV43';b.className='btn ghost-light themeToggleV43';b.type='button';b.title='Cambiar tema';actions.insertBefore(b,actions.lastElementChild);
      b.addEventListener('click',()=>applyTheme(document.body.dataset.theme==='dark'?'light':'dark'));
    }
  }

  function decorateTabs(){
    document.querySelectorAll('.tabs .tab').forEach(b=>{
      const v=b.dataset.view;if(!v||b.dataset.v43Decorated)return;
      b.dataset.v43Decorated='1';
      b.innerHTML='<span class="navIcon">'+(ICONS[v]||'•')+'</span><span>'+((v==='catalogo')?'Equipos':(v==='mapa'?'Mapa':(v==='administrar'?'Administrar':LABELS[v]||b.textContent)))+'</span>';
    });
  }

  function buildMobileNav(){
    if(document.getElementById('mobileNavV43'))return;
    const nav=document.createElement('nav');nav.id='mobileNavV43';nav.className='mobileNavV43';
    const views=['inicio','catalogo','mapa','gestion','manuales'];
    views.forEach(v=>{
      const b=document.createElement('button');b.type='button';b.className='mobileNavBtn';b.dataset.mobileView=v;
      b.innerHTML='<span>'+(ICONS[v]||'•')+'</span><small>'+LABELS[v]+'</small>';
      b.addEventListener('click',()=>{try{goView(v)}catch(_){document.querySelector('.tabs .tab[data-view="'+v+'"]')?.click();}syncMobileNav();});
      nav.appendChild(b);
    });
    document.body.appendChild(nav);
    syncMobileNav();
  }

  function syncMobileNav(){
    const active=document.querySelector('.view.active-view')?.id||'inicio';
    document.querySelectorAll('.mobileNavBtn').forEach(b=>b.classList.toggle('active',b.dataset.mobileView===active));
  }

  function addHeroInfo(){
    const hero=document.querySelector('#inicio .hero'); if(!hero)return;
    const visual=hero.querySelector('.hero-visual'); if(!visual)return;
    if(!document.getElementById('heroInfoV43')){
      const card=document.createElement('div');card.id='heroInfoV43';card.className='heroInfoV43';
      card.innerHTML='<div><span>Fecha y hora</span><strong id="heroClockV43">--</strong></div><div><span>Estado de datos</span><strong id="heroDataV43">Conectando...</strong></div><div><span>Equipos cargados</span><strong id="heroCountV43">--</strong></div>';
      visual.appendChild(card);
    }
    const left=hero.querySelector(':scope > div:first-child');
    if(left&&!left.querySelector('.heroChipsV43')){
      const chips=document.createElement('div');chips.className='heroChipsV43';
      chips.innerHTML='<span>⚡ Red MT · Iquique</span><span>📊 Gestión operacional</span><span>📘 Biblioteca técnica</span>';
      const buttons=left.querySelector('.hero-buttons');
      if(buttons)left.insertBefore(chips,buttons);else left.appendChild(chips);
    }
  }

  function enhanceKpis(){
    const cards=document.querySelectorAll('#kpis .card');
    cards.forEach((c,i)=>{
      if(c.dataset.v43Enhanced)return;c.dataset.v43Enhanced='1';
      const extras=['Base maestra','Disponibilidad actual','Seguimiento','Prioridad operacional','Historial técnico'];
      const sub=document.createElement('div');sub.className='cardSubV43';sub.textContent=extras[i]||'Indicador de gestión';c.appendChild(sub);
    });
  }

  function updateStatus(){
    const now=new Date();
    const dt=now.toLocaleString('es-CL',{weekday:'short',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
    const full=now.toLocaleString('es-CL',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'});
    const clock=document.getElementById('visualClock');if(clock)clock.textContent=dt;
    const heroClock=document.getElementById('heroClockV43');if(heroClock)heroClock.textContent=full;
    let count=0;try{count=state?.reconectadores?.length||0}catch(_){}
    const online=navigator.onLine&&count>0;
    const chip=document.getElementById('visualOnline');
    if(chip){chip.className='visualStatusChip '+(online?'online':'offline');chip.textContent=online?'● Base online':'● Sin datos / conexión';}
    const data=document.getElementById('heroDataV43');if(data)data.textContent=online?'Base online':'Esperando conexión';
    const countEl=document.getElementById('heroCountV43');if(countEl)countEl.textContent=count?count+' equipos':'Sin datos';
    enhanceKpis();
  }

  function applyTheme(theme){
    document.body.dataset.theme=theme;
    localStorage.setItem(THEME_KEY,theme);
    const b=document.getElementById('themeToggleV43');if(b)b.textContent=theme==='dark'?'☀️':'🌙';
  }

  function init(){
    addHeaderStatus();decorateTabs();buildMobileNav();addHeroInfo();applyTheme(localStorage.getItem(THEME_KEY)||'light');updateStatus();
    const bodyObs=new MutationObserver(()=>{decorateTabs();syncMobileNav();addHeroInfo();enhanceKpis();});
    bodyObs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
    window.addEventListener('online',updateStatus);window.addEventListener('offline',updateStatus);
    setInterval(updateStatus,1000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();