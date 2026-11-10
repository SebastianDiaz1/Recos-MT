// v54 · Catálogo profesional de equipos.
(function(){
  const ui={query:'',status:'',quadrant:'',manager:'',comm:'',brand:'',sort:'code',view:'grid'};

  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function norm(v){return String(v||'').trim();}
  function lower(v){return norm(v).toLowerCase();}
  function comm(v){const s=norm(v).toUpperCase();return s==='SI'?'SI':s==='NO'?'NO':'-';}
  function fdate(v){try{return typeof fmtDate==='function'?fmtDate(v):(v||'-')}catch(_){return v||'-'}}
  function statusClass(s){return s==='Fuera de servicio'?'danger':s==='Con observaciones'?'warn':'ok';}
  function statusIcon(s){return s==='Fuera de servicio'?'⛔':s==='Con observaciones'?'⚠':'✓';}
  function hasCoords(r){return Number.isFinite(Number(r?.lat))&&Number.isFinite(Number(r?.lon));}

  function ensureStyles(){
    if(document.getElementById('equiposV54Styles'))return;
    const s=document.createElement('style');s.id='equiposV54Styles';s.textContent=`
      #catalogo.equiposV54>.sectionTitle{display:none}
      #catalogo.equiposV54>.panel{padding:0!important;background:transparent!important;border:0!important;box-shadow:none!important;overflow:visible!important}
      #catalogo.equiposV54 .filters{display:none!important}
      #catalogo.equiposV54 .catalogSummaryV49{display:none!important}
      .equiposHeroV54{position:relative;overflow:hidden;border-radius:21px;background:linear-gradient(120deg,#0a1b2b 0%,#0c365b 58%,#0b7197 100%);color:#fff;padding:22px 24px;margin-bottom:12px;box-shadow:0 14px 38px rgba(9,39,66,.12)}
      .equiposHeroV54:after{content:"";position:absolute;width:300px;height:300px;border-radius:50%;right:-90px;top:-180px;background:rgba(255,255,255,.06)}
      .equiposHeroInnerV54{position:relative;z-index:1;display:flex;justify-content:space-between;gap:18px;align-items:center}
      .equiposHeroV54 .eyebrow{color:#94cbea;font-size:9px}.equiposHeroV54 h2{font-size:28px;letter-spacing:-.035em;margin:5px 0 6px;color:#fff}.equiposHeroV54 p{margin:0;color:#d0e0ec;font-size:11px;line-height:1.5;max-width:650px}
      .equiposHeroStatsV54{display:grid;grid-template-columns:repeat(3,minmax(92px,1fr));gap:7px;min-width:320px}.equiposHeroStatV54{padding:10px 11px;border-radius:12px;background:rgba(5,20,33,.24);border:1px solid rgba(255,255,255,.09)}.equiposHeroStatV54 span{display:block;font-size:8px;color:#a9c7da;text-transform:uppercase}.equiposHeroStatV54 strong{display:block;font-size:20px;margin-top:3px;color:#fff}
      .equiposToolbarV54{background:#fff;border:1px solid #e1e7ee;border-radius:17px;padding:12px;box-shadow:0 7px 22px rgba(15,35,60,.045);margin-bottom:10px}
      .equiposSearchRowV54{display:grid;grid-template-columns:minmax(260px,1.5fr) repeat(3,minmax(135px,.55fr)) auto;gap:8px}.equiposSearchBoxV54{position:relative}.equiposSearchBoxV54:before{content:"⌕";position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#7890a8;font-size:17px;pointer-events:none}.equiposSearchBoxV54 input{width:100%;height:43px;padding-left:36px;margin:0;font-size:11px;background:#fbfcfe;border-color:#dbe3ec}
      .equiposToolbarV54 select{height:43px;margin:0;font-size:10px;background:#fbfcfe;border-color:#dbe3ec}.equiposClearV54{height:43px;font-size:10px;white-space:nowrap}
      .equiposFilterRowV54{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-top:9px}.equiposChipsV54{display:flex;gap:6px;flex-wrap:wrap}.equiposChipV54{border:1px solid #dbe3ec;background:#fff;border-radius:999px;padding:6px 9px;font-size:9px;font-weight:900;color:#586b80;cursor:pointer}.equiposChipV54.active{background:#e9f2ff;border-color:#bcd4f7;color:#1559c9}.equiposChipV54.warn.active{background:#fff3df;border-color:#edcf98;color:#8c5b00}.equiposChipV54.danger.active{background:#fdecea;border-color:#efc0bb;color:#a23b32}
      .equiposToolbarRightV54{display:flex;gap:6px;align-items:center}.equiposToolbarRightV54 select{height:34px;min-width:150px}.equiposViewBtnV54{width:34px;height:34px;border:1px solid #dbe3ec;border-radius:9px;background:#fff;color:#65788d;cursor:pointer}.equiposViewBtnV54.active{background:#e9f2ff;color:#1559c9;border-color:#bfd4ef}
      .equiposResultBarV54{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:8px 2px 10px}.equiposResultBarV54 strong{font-size:11px;color:#263d55}.equiposResultBarV54 span{font-size:9px;color:#7c8999}
      #recoGrid.equiposGridV54{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
      #recoGrid.equiposGridV54.listViewV54{grid-template-columns:1fr}
      .equipoCardV54{position:relative;overflow:hidden;background:#fff;border:1px solid #e1e7ee;border-radius:16px;padding:14px;box-shadow:0 5px 18px rgba(15,35,60,.04);cursor:pointer;transition:.16s}.equipoCardV54:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(15,35,60,.08);border-color:#cfdbe8}.equipoCardV54:before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:#20a56f}.equipoCardV54.warn:before{background:#d18b11}.equipoCardV54.danger:before{background:#cb493f}
      .equipoCardHeadV54{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.equipoFeederV54{font-size:8px;color:#7d8b9c;text-transform:uppercase;font-weight:900;letter-spacing:.06em}.equipoCodeV54{font-size:22px;line-height:1.05;letter-spacing:-.025em;font-weight:900;color:#1f354e;margin-top:4px}.equipoStatusV54{font-size:8px;font-weight:900;padding:5px 7px;border-radius:999px;white-space:nowrap}.equipoStatusV54.ok{background:#e5f6ed;color:#08724c}.equipoStatusV54.warn{background:#fff2d9;color:#885a00}.equipoStatusV54.danger{background:#fde9e7;color:#a23b32}
      .equipoLocationV54{display:flex;gap:6px;align-items:flex-start;margin-top:9px;color:#67778a;font-size:9px;line-height:1.35;min-height:25px}.equipoLocationV54 b{color:#486078}
      .equipoMetaV54{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px}.equipoMetaItemV54{padding:8px 9px;border-radius:9px;background:#f8fafc;border:1px solid #edf1f4;min-height:53px}.equipoMetaItemV54 span{display:block;font-size:7px;text-transform:uppercase;letter-spacing:.05em;color:#8592a2}.equipoMetaItemV54 strong{display:block;margin-top:4px;font-size:10px;color:#2c425a;line-height:1.25;overflow-wrap:anywhere}
      .equipoFlagsV54{display:flex;gap:5px;flex-wrap:wrap;margin-top:9px}.equipoFlagV54{padding:4px 6px;border-radius:7px;font-size:8px;font-weight:800;background:#f0f4f8;color:#5b6e82}.equipoFlagV54.remoteYes{background:#e9f6ef;color:#13714e}.equipoFlagV54.remoteNo{background:#eef1f5;color:#657080}.equipoFlagV54.alert{background:#fff0ee;color:#a23c33}
      .equipoActionsV54{display:flex;gap:6px;margin-top:11px}.equipoActionsV54 button{flex:1;border:0;border-radius:9px;padding:8px;font-size:9px;font-weight:900;cursor:pointer}.equipoActionsV54 .open{background:#1559c9;color:#fff}.equipoActionsV54 .map{background:#edf3f8;color:#40566d}.equipoActionsV54 .route{background:#edf3f8;color:#40566d}
      .listViewV54 .equipoCardV54{display:grid;grid-template-columns:minmax(180px,.65fr) minmax(260px,1fr) minmax(330px,1.15fr) auto;gap:14px;align-items:center}.listViewV54 .equipoLocationV54{margin:0;min-height:0}.listViewV54 .equipoMetaV54{margin:0;grid-template-columns:repeat(2,minmax(0,1fr))}.listViewV54 .equipoFlagsV54{margin:0}.listViewV54 .equipoActionsV54{margin:0;min-width:210px}
      .equiposEmptyV54{grid-column:1/-1;text-align:center;padding:40px 20px;background:#fff;border:1px dashed #d5dee7;border-radius:15px;color:#7d8998}.equiposEmptyV54 strong{display:block;color:#334960;font-size:13px}.equiposEmptyV54 span{display:block;font-size:10px;margin-top:4px}
      body[data-theme="dark"] .equiposToolbarV54,body[data-theme="dark"] .equipoCardV54,body[data-theme="dark"] .equiposEmptyV54{background:#101d2b;border-color:#293c4f}
      body[data-theme="dark"] .equiposSearchBoxV54 input,body[data-theme="dark"] .equiposToolbarV54 select{background:#0b1725;color:#eef5fb;border-color:#2c4056}
      body[data-theme="dark"] .equipoCodeV54,body[data-theme="dark"] .equipoMetaItemV54 strong,body[data-theme="dark"] .equiposResultBarV54 strong{color:#eef5fb}
      body[data-theme="dark"] .equipoMetaItemV54{background:#142334;border-color:#293c4f}.uxV49 body[data-theme="dark"]{}
      body[data-theme="dark"] .equiposChipV54,body[data-theme="dark"] .equiposViewBtnV54{background:#101d2b;border-color:#30455a;color:#b8c7d8}
      @media(max-width:1100px){#recoGrid.equiposGridV54{grid-template-columns:repeat(2,1fr)}.equiposSearchRowV54{grid-template-columns:1fr 1fr 1fr}.equiposSearchBoxV54{grid-column:1/-1}.listViewV54 .equipoCardV54{grid-template-columns:1fr 1fr}.listViewV54 .equipoActionsV54{min-width:0}}
      @media(max-width:760px){
        .equiposHeroV54{padding:18px 16px;border-radius:18px}.equiposHeroInnerV54{display:block}.equiposHeroV54 h2{font-size:25px}.equiposHeroStatsV54{min-width:0;margin-top:13px;grid-template-columns:repeat(3,1fr)}
        .equiposToolbarV54{padding:9px;border-radius:14px}.equiposSearchRowV54{grid-template-columns:1fr}.equiposSearchBoxV54{grid-column:auto}.equiposSearchBoxV54 input,.equiposToolbarV54 select,.equiposClearV54{width:100%;height:44px}
        .equiposFilterRowV54{display:block}.equiposChipsV54{overflow:auto;flex-wrap:nowrap;padding-bottom:4px}.equiposChipV54{white-space:nowrap}.equiposToolbarRightV54{margin-top:7px}.equiposToolbarRightV54 select{flex:1;min-width:0}
        #recoGrid.equiposGridV54{grid-template-columns:1fr;gap:8px}.listViewV54 .equipoCardV54{display:block}.listViewV54 .equipoLocationV54,.listViewV54 .equipoMetaV54,.listViewV54 .equipoFlagsV54,.listViewV54 .equipoActionsV54{margin-top:9px}
        .equipoCardV54{padding:13px}.equipoCodeV54{font-size:22px}.equipoMetaV54{grid-template-columns:1fr 1fr}.equipoActionsV54 button{min-height:38px}
      }
    `;document.head.appendChild(s);
  }

  function ensureUI(){
    ensureStyles();
    const view=document.getElementById('catalogo');if(!view)return;
    view.classList.add('equiposV54');
    const panel=view.querySelector(':scope>.panel');if(!panel)return;
    if(!document.getElementById('equiposHeroV54')){
      const hero=document.createElement('section');hero.id='equiposHeroV54';hero.className='equiposHeroV54';
      hero.innerHTML='<div class="equiposHeroInnerV54"><div><span class="eyebrow">CATÁLOGO TÉCNICO · RED MT</span><h2>Equipos de la red</h2><p>Encuentra rápidamente cualquier reconectador y revisa su condición, responsable, comunicación, ubicación y ficha técnica.</p></div><div class="equiposHeroStatsV54"><div class="equiposHeroStatV54"><span>Total</span><strong id="equiposTotalV54">0</strong></div><div class="equiposHeroStatV54"><span>Operativos</span><strong id="equiposOpV54">0</strong></div><div class="equiposHeroStatV54"><span>Atención</span><strong id="equiposAttV54">0</strong></div></div></div>';
      panel.parentNode.insertBefore(hero,panel);
    }
    if(!document.getElementById('equiposToolbarV54')){
      const bar=document.createElement('div');bar.id='equiposToolbarV54';bar.className='equiposToolbarV54';
      bar.innerHTML=`
        <div class="equiposSearchRowV54">
          <div class="equiposSearchBoxV54"><input id="equiposSearchV54" placeholder="Buscar código, alimentador, ubicación, gestor o equipo…"></div>
          <select id="equiposQuadrantV54"><option value="">Todos los cuadrantes</option></select>
          <select id="equiposManagerV54"><option value="">Todos los gestores</option></select>
          <select id="equiposCommV54"><option value="">Toda comunicación</option><option value="SI">Con comunicación remota</option><option value="NO">Sin comunicación remota</option></select>
          <button id="equiposClearV54" class="btn ghost equiposClearV54" type="button">Limpiar filtros</button>
        </div>
        <div class="equiposFilterRowV54">
          <div class="equiposChipsV54">
            <button class="equiposChipV54 active" data-equipos-status="">Todos</button>
            <button class="equiposChipV54" data-equipos-status="Operativo">✓ Operativos</button>
            <button class="equiposChipV54 warn" data-equipos-status="Con observaciones">⚠ Observaciones</button>
            <button class="equiposChipV54 danger" data-equipos-status="Fuera de servicio">⛔ Fuera de servicio</button>
          </div>
          <div class="equiposToolbarRightV54">
            <select id="equiposSortV54"><option value="code">Ordenar: código</option><option value="feeder">Alimentador</option><option value="quadrant">Cuadrante</option><option value="status">Estado</option><option value="manager">Gestor</option></select>
            <button id="equiposGridBtnV54" class="equiposViewBtnV54 active" type="button" title="Vista tarjetas">▦</button>
            <button id="equiposListBtnV54" class="equiposViewBtnV54" type="button" title="Vista lista">☷</button>
          </div>
        </div>`;
      panel.insertBefore(bar,panel.querySelector('.filters'));
      const summary=document.createElement('div');summary.id='equiposResultBarV54';summary.className='equiposResultBarV54';bar.after(summary);
    }
    bindUI();populateSelects();updateHero();
  }

  function populateSelects(){
    const recos=state.reconectadores||[];
    const q=document.getElementById('equiposQuadrantV54'),m=document.getElementById('equiposManagerV54');
    if(q){const cur=ui.quadrant,vals=[...new Set(recos.map(r=>norm(r.cuadrante)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));q.innerHTML='<option value="">Todos los cuadrantes</option>'+vals.map(v=>'<option value="'+esc(v)+'">Cuadrante '+esc(v)+'</option>').join('');q.value=vals.includes(cur)?cur:'';}
    if(m){const cur=ui.manager,vals=[...new Set(recos.map(r=>norm(r.gestor_cuadrante)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));m.innerHTML='<option value="">Todos los gestores</option>'+vals.map(v=>'<option value="'+esc(v)+'">'+esc(v)+'</option>').join('');m.value=vals.includes(cur)?cur:'';}
  }

  function bindUI(){
    const bar=document.getElementById('equiposToolbarV54');if(!bar||bar.dataset.bound==='1')return;bar.dataset.bound='1';
    const search=document.getElementById('equiposSearchV54'),q=document.getElementById('equiposQuadrantV54'),m=document.getElementById('equiposManagerV54'),c=document.getElementById('equiposCommV54'),sort=document.getElementById('equiposSortV54');
    search?.addEventListener('input',()=>{ui.query=search.value;render();});
    q?.addEventListener('change',()=>{ui.quadrant=q.value;render();});
    m?.addEventListener('change',()=>{ui.manager=m.value;render();});
    c?.addEventListener('change',()=>{ui.comm=c.value;render();});
    sort?.addEventListener('change',()=>{ui.sort=sort.value;render();});
    document.querySelectorAll('[data-equipos-status]').forEach(b=>b.addEventListener('click',()=>{ui.status=b.dataset.equiposStatus||'';syncChips();render();}));
    document.getElementById('equiposClearV54')?.addEventListener('click',()=>{ui.query='';ui.status='';ui.quadrant='';ui.manager='';ui.comm='';ui.brand='';const ids=['equiposSearchV54','equiposQuadrantV54','equiposManagerV54','equiposCommV54'];ids.forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});syncChips();render();});
    document.getElementById('equiposGridBtnV54')?.addEventListener('click',()=>{ui.view='grid';syncView();render();});
    document.getElementById('equiposListBtnV54')?.addEventListener('click',()=>{ui.view='list';syncView();render();});
  }

  function syncChips(){document.querySelectorAll('[data-equipos-status]').forEach(b=>b.classList.toggle('active',(b.dataset.equiposStatus||'')===ui.status));}
  function syncView(){
    document.getElementById('equiposGridBtnV54')?.classList.toggle('active',ui.view==='grid');
    document.getElementById('equiposListBtnV54')?.classList.toggle('active',ui.view==='list');
  }

  function updateHero(){
    const recos=state.reconectadores||[],op=recos.filter(r=>r.estado==='Operativo').length,att=recos.length-op;
    const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};set('equiposTotalV54',recos.length);set('equiposOpV54',op);set('equiposAttV54',att);
  }

  function filtered(){
    const q=lower(ui.query);
    let arr=(state.reconectadores||[]).filter(r=>
      (!ui.status||r.estado===ui.status)&&
      (!ui.quadrant||norm(r.cuadrante)===ui.quadrant)&&
      (!ui.manager||norm(r.gestor_cuadrante)===ui.manager)&&
      (!ui.comm||comm(r.comunicacion_remota)===ui.comm)&&
      (!q||[r.codigo,r.alimentador,r.ubicacion,r.gestor_cuadrante,r.marca,r.estado,r.cuadrante,r.observaciones].some(v=>lower(v).includes(q)))
    );
    const rank={Operativo:0,'Con observaciones':1,'Fuera de servicio':2};
    arr.sort((a,b)=>{
      if(ui.sort==='feeder')return norm(a.alimentador).localeCompare(norm(b.alimentador),'es',{numeric:true});
      if(ui.sort==='quadrant')return norm(a.cuadrante).localeCompare(norm(b.cuadrante),'es',{numeric:true})||norm(a.codigo).localeCompare(norm(b.codigo),'es',{numeric:true});
      if(ui.sort==='status')return (rank[a.estado]??9)-(rank[b.estado]??9)||norm(a.codigo).localeCompare(norm(b.codigo),'es',{numeric:true});
      if(ui.sort==='manager')return norm(a.gestor_cuadrante).localeCompare(norm(b.gestor_cuadrante),'es')||norm(a.codigo).localeCompare(norm(b.codigo),'es',{numeric:true});
      return norm(a.codigo).localeCompare(norm(b.codigo),'es',{numeric:true});
    });
    return arr;
  }

  function card(r){
    const cls=statusClass(r.estado),remote=comm(r.comunicacion_remota),obs=norm(r.observaciones);
    const flags=[
      '<span class="equipoFlagV54 '+(remote==='SI'?'remoteYes':remote==='NO'?'remoteNo':'')+'">◉ Remota: '+esc(remote)+'</span>',
      r.fecha_verificacion?'<span class="equipoFlagV54">◷ '+esc(fdate(r.fecha_verificacion))+'</span>':'<span class="equipoFlagV54 alert">◷ Sin fecha verificación</span>',
      /bypass/i.test(obs)?'<span class="equipoFlagV54 alert">↯ BYPASS</span>':''
    ].filter(Boolean).join('');
    return `<article class="equipoCardV54 ${cls}" data-equipo-id="${r.id}">
      <div class="equipoCardHeadV54"><div><span class="equipoFeederV54">${esc(r.alimentador||'Sin alimentador')}</span><div class="equipoCodeV54">${esc(r.codigo)}</div></div><span class="equipoStatusV54 ${cls}">${statusIcon(r.estado)} ${esc(r.estado||'-')}</span></div>
      <div class="equipoLocationV54"><b>⌖</b><span>${esc(r.ubicacion||'Ubicación sin registro')}</span></div>
      <div class="equipoMetaV54">
        <div class="equipoMetaItemV54"><span>Equipo / referencia</span><strong>${esc(r.marca||'-')}</strong></div>
        <div class="equipoMetaItemV54"><span>Cuadrante</span><strong>${esc(r.cuadrante||'-')}</strong></div>
        <div class="equipoMetaItemV54"><span>Gestor</span><strong>${esc(r.gestor_cuadrante||'Sin gestor')}</strong></div>
        <div class="equipoMetaItemV54"><span>Protección F / R</span><strong>${esc((r.sobrecorriente_fase||'-')+' / '+(r.sobrecorriente_residual||'-'))}</strong></div>
      </div>
      <div class="equipoFlagsV54">${flags}</div>
      <div class="equipoActionsV54">
        <button class="open" type="button" data-open-equipo="${r.id}">Ver ficha</button>
        ${hasCoords(r)?'<button class="map" type="button" data-map-equipo="'+r.id+'">Mapa</button><button class="route" type="button" data-route-equipo="'+r.id+'">Ruta</button>':''}
      </div>
    </article>`;
  }

  function render(){
    ensureUI();updateHero();populateSelects();syncChips();syncView();
    const arr=filtered(),grid=document.getElementById('recoGrid');if(!grid)return;
    grid.className='recoGrid equiposGridV54'+(ui.view==='list'?' listViewV54':'');
    grid.innerHTML=arr.length?arr.map(card).join(''):'<div class="equiposEmptyV54"><strong>No encontramos equipos con esos filtros.</strong><span>Prueba limpiando la búsqueda o cambiando los filtros seleccionados.</span></div>';
    const bar=document.getElementById('equiposResultBarV54');
    if(bar){
      const total=(state.reconectadores||[]).length,att=arr.filter(r=>r.estado!=='Operativo').length;
      bar.innerHTML='<div><strong>'+arr.length+' equipos visibles</strong><span> de '+total+' registrados</span></div><span>'+att+' requieren atención en esta vista</span>';
    }
    grid.querySelectorAll('[data-open-equipo]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();showReco(Number(b.dataset.openEquipo));}));
    grid.querySelectorAll('[data-map-equipo]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const id=Number(b.dataset.mapEquipo),r=(state.reconectadores||[]).find(x=>x.id===id);if(!r)return;goView('mapa');setTimeout(()=>{try{recoLeafletMap?.setView([Number(r.lat),Number(r.lon)],16,{animate:true});}catch(_){}},160);}));
    grid.querySelectorAll('[data-route-equipo]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const id=Number(b.dataset.routeEquipo),r=(state.reconectadores||[]).find(x=>x.id===id);if(r&&typeof googleRoute==='function')googleRoute(Number(r.lat),Number(r.lon));}));
    grid.querySelectorAll('[data-equipo-id]').forEach(card=>card.addEventListener('click',()=>showReco(Number(card.dataset.equipoId))));
  }

  window.renderRecos=render;
  window.renderEquiposV54=render;
  ensureStyles();
  setTimeout(()=>{ensureUI();render();},250);
  document.addEventListener('click',e=>{if(e.target.closest('[data-view="catalogo"]'))setTimeout(()=>{ensureUI();render();},40);});
})();