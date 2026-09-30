// Filtro geográfico por cuadrante y planificador de ruta de inspección.
(function(){
  const selected=new Set();
  let activeQuadrant='';
  const baseRenderMap=window.renderMap;

  function validCoords(r){return Number.isFinite(Number(r?.lat))&&Number.isFinite(Number(r?.lon));}
  function allGeocoded(){return (state.reconectadores||[]).filter(validCoords);}
  function rows(){return allGeocoded().filter(r=>!activeQuadrant||String(r.cuadrante||'')===activeQuadrant);}
  function esc(v){return typeof escMap==='function'?escMap(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function hav(a,b){
    const R=6371,toRad=x=>x*Math.PI/180;
    const dLat=toRad(Number(b.lat)-Number(a.lat)),dLon=toRad(Number(b.lon)-Number(a.lon));
    const la1=toRad(Number(a.lat)),la2=toRad(Number(b.lat));
    const x=Math.sin(dLat/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
    return 2*R*Math.asin(Math.sqrt(x));
  }
  function pathLength(arr){let d=0;for(let i=1;i<arr.length;i++)d+=hav(arr[i-1],arr[i]);return d;}
  function nearestNeighbor(start,arr){
    const left=arr.filter(x=>x.id!==start.id),out=[start];let cur=start;
    while(left.length){let bi=0,bd=Infinity;for(let i=0;i<left.length;i++){const d=hav(cur,left[i]);if(d<bd){bd=d;bi=i;}}cur=left.splice(bi,1)[0];out.push(cur);}
    return out;
  }
  function optimizedRoute(arr){
    if(arr.length<3)return arr.slice();
    let best=null,bestD=Infinity;
    arr.forEach(s=>{const p=nearestNeighbor(s,arr),d=pathLength(p);if(d<bestD){bestD=d;best=p;}});
    return best||arr.slice();
  }
  function getQuadrants(){return [...new Set((state.reconectadores||[]).map(r=>String(r.cuadrante||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));}

  function ensureStyles(){
    if(document.getElementById('routePlannerStyles'))return;
    const s=document.createElement('style');s.id='routePlannerStyles';s.textContent=`
      .routeTools{margin-bottom:14px;padding:14px;background:#fff;border:1px solid #e1e6ec;border-radius:12px}
      .routeToolsTop{display:flex;gap:10px;align-items:end;flex-wrap:wrap}.routeTools label{display:flex;flex-direction:column;gap:5px;font-size:11px;font-weight:800;color:#566276}.routeTools select{min-width:180px;padding:10px;border:1px solid #d9e0e8;border-radius:9px;background:#fff}
      .routeSummary{display:flex;gap:10px;flex-wrap:wrap;margin:10px 0;font-size:12px;font-weight:800;color:#48566a}.routeSummary span{padding:7px 9px;background:#f4f7fa;border-radius:8px}
      .routeList{max-height:230px;overflow:auto;border-top:1px solid #eef1f4;margin-top:8px}.routeItem{display:flex;gap:9px;align-items:flex-start;padding:9px 2px;border-bottom:1px solid #eef1f4}.routeItem input{margin-top:3px}.routeItem strong{font-size:12px}.routeItem small{display:block;color:#6b7687;margin-top:2px}
      .routeActions,.routeSelectActions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.routeActions button:disabled,.routeSelectActions button:disabled{opacity:.45;cursor:not-allowed}
      @media(max-width:760px){.routeTools select{min-width:100%;width:100%}.routeToolsTop{display:block}.routeToolsTop label{margin-bottom:9px}.routeSelectActions .btn{flex:1 1 100%}}
    `;document.head.appendChild(s);
  }

  function ensureUI(){
    ensureStyles();
    const view=document.getElementById('mapa'); if(!view)return;
    if(document.getElementById('routeTools'))return;
    const layout=view.querySelector('.map-layout'); if(!layout)return;
    const box=document.createElement('div');box.id='routeTools';box.className='routeTools';
    box.innerHTML=`<div class="routeToolsTop"><label>Filtrar mapa por cuadrante<select id="mapQuadrantFilter"><option value="">Todos los cuadrantes</option></select></label></div><div class="routeSelectActions"><button id="routeSelectAllNetwork" class="btn secondary" type="button">Seleccionar todos los cuadrantes</button><button id="routeSelectQuadrant" class="btn secondary" type="button" disabled>Seleccionar todos del cuadrante</button></div><div class="routeSummary"><span id="routeVisibleCount">0 equipos visibles</span><span id="routeSelectedCount">0 seleccionados</span><span id="routeDistance">0 km aprox.</span></div><div id="routeList" class="routeList"></div><div class="routeActions"><button id="routeClear" class="btn ghost" type="button">Limpiar selección</button><button id="routeOpen" class="btn primary" type="button" disabled>Abrir ruta en Google Maps</button></div>`;
    layout.parentNode.insertBefore(box,layout);
    const q=document.getElementById('mapQuadrantFilter');
    getQuadrants().forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=`Cuadrante ${v}`;q.appendChild(o);});
    q.addEventListener('change',()=>{activeQuadrant=q.value;renderFilteredMap();renderPlanner();});
    document.getElementById('routeSelectAllNetwork').addEventListener('click',()=>{allGeocoded().forEach(r=>selected.add(r.id));renderPlanner();});
    document.getElementById('routeSelectQuadrant').addEventListener('click',()=>{if(!activeQuadrant)return;rows().forEach(r=>selected.add(r.id));renderPlanner();});
    document.getElementById('routeClear').addEventListener('click',()=>{selected.clear();renderPlanner();});
    document.getElementById('routeOpen').addEventListener('click',openRoute);
  }

  function renderFilteredMap(){
    if(typeof baseRenderMap!=='function')return;
    const original=state.reconectadores;
    state.reconectadores=rows();
    try{baseRenderMap();}finally{state.reconectadores=original;}
  }
  window.renderMap=renderFilteredMap;

  function renderPlanner(){
    ensureUI();
    const arr=rows();
    const validIds=new Set(allGeocoded().map(r=>r.id));
    [...selected].forEach(id=>{if(!validIds.has(id))selected.delete(id);});
    const list=document.getElementById('routeList'); if(!list)return;
    list.innerHTML=arr.map(r=>`<label class="routeItem"><input type="checkbox" data-route-id="${r.id}" ${selected.has(r.id)?'checked':''}><span><strong>${esc(r.codigo)}</strong><small>${esc(r.alimentador||'-')}${r.cuadrante?` · Cuadrante ${esc(r.cuadrante)}`:''}</small></span></label>`).join('')||'<p class="muted">No hay equipos georreferenciados para este cuadrante.</p>';
    list.querySelectorAll('[data-route-id]').forEach(c=>c.addEventListener('change',()=>{const id=Number(c.dataset.routeId);c.checked?selected.add(id):selected.delete(id);updateSummary();updateSelectButtons();}));
    document.getElementById('routeVisibleCount').textContent=`${arr.length} ${arr.length===1?'equipo visible':'equipos visibles'}`;
    updateSelectButtons();
    updateSummary();
  }

  function updateSelectButtons(){
    const all=allGeocoded();
    const current=rows();
    const allBtn=document.getElementById('routeSelectAllNetwork');
    const qBtn=document.getElementById('routeSelectQuadrant');
    if(allBtn){const done=all.length>0&&all.every(r=>selected.has(r.id));allBtn.textContent=done?'Todos los cuadrantes seleccionados':'Seleccionar todos los cuadrantes';allBtn.disabled=all.length===0||done;}
    if(qBtn){
      if(!activeQuadrant){qBtn.textContent='Seleccionar todos del cuadrante';qBtn.disabled=true;}
      else{const done=current.length>0&&current.every(r=>selected.has(r.id));qBtn.textContent=done?`Cuadrante ${activeQuadrant} seleccionado`:`Seleccionar todos del cuadrante ${activeQuadrant}`;qBtn.disabled=current.length===0||done;}
    }
  }

  function selectedRows(){const all=state.reconectadores||[];return [...selected].map(id=>all.find(r=>r.id===id)).filter(validCoords);}
  function updateSummary(){
    const arr=optimizedRoute(selectedRows());
    const d=pathLength(arr);
    const c=document.getElementById('routeSelectedCount'),dist=document.getElementById('routeDistance'),btn=document.getElementById('routeOpen');
    if(c)c.textContent=`${arr.length} seleccionados`;if(dist)dist.textContent=`${d.toFixed(1)} km aprox.`;if(btn)btn.disabled=arr.length<2;
  }

  function openRoute(){
    const arr=optimizedRoute(selectedRows());
    if(arr.length<2)return;
    const origin=`${arr[0].lat},${arr[0].lon}`;
    const destination=`${arr[arr.length-1].lat},${arr[arr.length-1].lon}`;
    const waypoints=arr.slice(1,-1).map(r=>`${r.lat},${r.lon}`).join('|');
    let url=`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
    if(waypoints)url+=`&waypoints=${encodeURIComponent(waypoints)}`;
    window.open(url,'_blank');
  }

  document.addEventListener('click',e=>{if(e.target.closest('[data-view="mapa"]'))setTimeout(()=>{ensureUI();renderPlanner();renderFilteredMap();},80);});
  setTimeout(()=>{ensureUI();renderPlanner();},500);
})();

// Panel de Gestión con KPI y control operacional.
(function(){
  function escG(v){return typeof escMap==='function'?escMap(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function hasCoords(r){return Number.isFinite(Number(r?.lat))&&Number.isFinite(Number(r?.lon));}
  function pct(n,d){return d?Math.round(n*100/d):0;}

  function ensureGestionStyles(){
    if(document.getElementById('gestionStyles'))return;
    const s=document.createElement('style');s.id='gestionStyles';s.textContent=`
      .gestionKpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:16px}
      .gestionKpi{background:#fff;border:1px solid #e1e6ec;border-radius:14px;padding:16px;box-shadow:0 2px 8px rgba(16,34,58,.04)}
      .gestionKpi span{display:block;font-size:11px;font-weight:800;color:#728095;text-transform:uppercase;letter-spacing:.04em}
      .gestionKpi strong{display:block;font-size:29px;color:#182438;margin:6px 0 2px}.gestionKpi small{color:#687588;font-size:11px}
      .gestionGrid{display:grid;grid-template-columns:1.15fr .85fr;gap:16px}.gestionTable{width:100%;border-collapse:collapse;font-size:12px}.gestionTable th,.gestionTable td{padding:10px 8px;border-bottom:1px solid #edf0f4;text-align:left}.gestionTable th{font-size:10px;color:#748094;text-transform:uppercase}.gestionTable td.num,.gestionTable th.num{text-align:right}
      .gestionBar{height:9px;background:#edf1f5;border-radius:20px;overflow:hidden;margin-top:6px}.gestionBar>i{display:block;height:100%;background:#1559c9;border-radius:20px}
      .gestionPending{display:flex;flex-direction:column;gap:8px}.gestionPendingItem{padding:10px 11px;background:#f8fafc;border:1px solid #e7ebf0;border-radius:10px;display:flex;justify-content:space-between;gap:10px;align-items:center}.gestionPendingItem button{border:0;background:none;color:#1559c9;font-weight:800;cursor:pointer}.gestionPendingItem small{display:block;color:#707c8d;margin-top:2px}
      .gestionTags{display:flex;gap:7px;flex-wrap:wrap}.gestionTag{padding:7px 9px;border-radius:9px;background:#f2f5f8;font-size:11px;font-weight:800;color:#536175}
      @media(max-width:900px){.gestionKpis{grid-template-columns:repeat(2,minmax(0,1fr))}.gestionGrid{grid-template-columns:1fr}}
      @media(max-width:520px){.gestionKpis{grid-template-columns:1fr 1fr}.gestionKpi{padding:12px}.gestionKpi strong{font-size:24px}}
    `;document.head.appendChild(s);
  }

  function ensureGestionUI(){
    ensureGestionStyles();
    const nav=document.querySelector('nav.tabs');
    if(nav&&!document.querySelector('[data-view="gestion"]')){
      const btn=document.createElement('button');btn.className='tab';btn.dataset.view='gestion';btn.textContent='Gestión';
      const admin=nav.querySelector('[data-view="administrar"]');
      if(admin)nav.insertBefore(btn,admin);else nav.appendChild(btn);
    }
    if(!document.getElementById('gestion')){
      const main=document.querySelector('main');if(!main)return;
      const section=document.createElement('section');section.id='gestion';section.className='view';
      section.innerHTML=`<div class="sectionTitle"><div><span class="eyebrow">CONTROL DE GESTIÓN</span><h2>Gestión de activos MT</h2></div></div><div id="gestionContent"></div>`;
      const admin=document.getElementById('administrar');
      if(admin)main.insertBefore(section,admin);else main.appendChild(section);
    }
  }

  function renderGestion(){
    ensureGestionUI();
    const host=document.getElementById('gestionContent');if(!host)return;
    const recos=state.reconectadores||[],ins=state.inspecciones||[];
    const total=recos.length;
    const oper=recos.filter(r=>r.estado==='Operativo').length;
    const obs=recos.filter(r=>r.estado==='Con observaciones').length;
    const fuera=recos.filter(r=>r.estado==='Fuera de servicio').length;
    const geo=recos.filter(hasCoords).length;
    const verif=recos.filter(r=>r.fecha_verificacion).length;
    const attention=recos.filter(r=>r.estado!=='Operativo').length;
    const now=new Date();
    const monthIns=ins.filter(i=>{if(!i.fecha)return false;const d=new Date(i.fecha+'T00:00:00');return d.getFullYear()===now.getFullYear()&&d.getMonth()===now.getMonth();}).length;

    const quadrantNames=[...new Set(recos.map(r=>String(r.cuadrante||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
    const quadrantRows=[...quadrantNames,'Sin cuadrante'].map(q=>{
      const arr=q==='Sin cuadrante'?recos.filter(r=>!String(r.cuadrante||'').trim()):recos.filter(r=>String(r.cuadrante||'')===q);
      return {q,total:arr.length,oper:arr.filter(r=>r.estado==='Operativo').length,obs:arr.filter(r=>r.estado==='Con observaciones').length,fuera:arr.filter(r=>r.estado==='Fuera de servicio').length,geo:arr.filter(hasCoords).length};
    }).filter(x=>x.total);

    const pending=[];
    recos.filter(r=>r.estado==='Fuera de servicio').forEach(r=>pending.push({r,why:'Fuera de servicio'}));
    recos.filter(r=>r.estado==='Con observaciones').forEach(r=>pending.push({r,why:'Con observaciones'}));
    recos.filter(r=>!r.fecha_verificacion).slice(0,12).forEach(r=>{if(!pending.some(x=>x.r.id===r.id))pending.push({r,why:'Sin fecha de verificación'});});
    recos.filter(r=>!hasCoords(r)).slice(0,12).forEach(r=>{if(!pending.some(x=>x.r.id===r.id))pending.push({r,why:'Sin coordenadas'});});

    const brands=[...new Map(recos.map(r=>[String(r.marca||'Por registrar').trim()||'Por registrar',0])).keys()];
    const brandCounts=brands.map(b=>({b,n:recos.filter(r=>(String(r.marca||'Por registrar').trim()||'Por registrar')===b).length})).sort((a,b)=>b.n-a.n).slice(0,8);

    host.innerHTML=`
      <div class="gestionKpis">
        <div class="gestionKpi"><span>Total de equipos</span><strong>${total}</strong><small>Base maestra actual</small></div>
        <div class="gestionKpi"><span>Disponibilidad operativa</span><strong>${pct(oper,total)}%</strong><small>${oper} operativos de ${total}</small></div>
        <div class="gestionKpi"><span>Requieren atención</span><strong>${attention}</strong><small>${obs} observados · ${fuera} fuera de servicio</small></div>
        <div class="gestionKpi"><span>Georreferenciados</span><strong>${pct(geo,total)}%</strong><small>${geo} de ${total} con coordenadas</small></div>
      </div>
      <div class="gestionKpis">
        <div class="gestionKpi"><span>Con fecha de verificación</span><strong>${pct(verif,total)}%</strong><small>${verif} equipos registrados</small></div>
        <div class="gestionKpi"><span>Inspecciones este mes</span><strong>${monthIns}</strong><small>Registros del mes actual</small></div>
        <div class="gestionKpi"><span>Cuadrantes informados</span><strong>${quadrantNames.length}</strong><small>${recos.filter(r=>r.cuadrante).length} equipos clasificados</small></div>
        <div class="gestionKpi"><span>Sin coordenadas</span><strong>${total-geo}</strong><small>Equipos pendientes de georreferencia</small></div>
      </div>
      <div class="gestionGrid">
        <div class="panel"><div class="panel-head"><h3>Resumen por cuadrante</h3><span class="muted">Estado operacional</span></div>
          <div style="overflow:auto"><table class="gestionTable"><thead><tr><th>Cuadrante</th><th class="num">Total</th><th class="num">Operativos</th><th class="num">Obs.</th><th class="num">Fuera</th><th class="num">Geo.</th></tr></thead><tbody>${quadrantRows.map(x=>`<tr><td><strong>${x.q==='Sin cuadrante'?x.q:'Cuadrante '+escG(x.q)}</strong></td><td class="num">${x.total}</td><td class="num">${x.oper}</td><td class="num">${x.obs}</td><td class="num">${x.fuera}</td><td class="num">${x.geo}</td></tr>`).join('')}</tbody></table></div>
        </div>
        <div class="panel"><div class="panel-head"><h3>Estado de la flota</h3><span class="muted">Distribución actual</span></div>
          <p><strong>Operativos: ${oper}</strong><span class="muted"> · ${pct(oper,total)}%</span></p><div class="gestionBar"><i style="width:${pct(oper,total)}%"></i></div>
          <p style="margin-top:14px"><strong>Con observaciones: ${obs}</strong><span class="muted"> · ${pct(obs,total)}%</span></p><div class="gestionBar"><i style="width:${pct(obs,total)}%"></i></div>
          <p style="margin-top:14px"><strong>Fuera de servicio: ${fuera}</strong><span class="muted"> · ${pct(fuera,total)}%</span></p><div class="gestionBar"><i style="width:${pct(fuera,total)}%"></i></div>
          <h3 style="margin-top:22px">Equipos por referencia</h3><div class="gestionTags">${brandCounts.map(x=>`<span class="gestionTag">${escG(x.b)} · ${x.n}</span>`).join('')}</div>
        </div>
      </div>
      <div class="panel" style="margin-top:16px"><div class="panel-head"><h3>Pendientes de gestión</h3><span class="muted">Situaciones que requieren revisión</span></div>
        <div class="gestionPending">${pending.length?pending.slice(0,25).map(x=>`<div class="gestionPendingItem"><div><strong>${escG(x.r.codigo)}</strong><small>${escG(x.r.alimentador||'-')} · ${escG(x.why)}</small></div><button type="button" onclick="showReco(${x.r.id})">Abrir ficha</button></div>`).join(''):'<p class="muted">No hay pendientes detectados.</p>'}</div>
      </div>`;
  }

  ensureGestionUI();
  document.addEventListener('click',e=>{if(e.target.closest('[data-view="gestion"]'))setTimeout(renderGestion,30);});
  setTimeout(renderGestion,650);
  window.renderGestion=renderGestion;
})();
