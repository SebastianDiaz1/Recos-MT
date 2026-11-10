// v51 · Mapa operacional simplificado + planificador de rutas.
(function(){
  const selected=new Set();
  let filters={quadrant:'',status:'',comm:'',query:''};
  let routeOpen=false;
  const baseRenderMap=window.renderMap;

  function validCoords(r){return Number.isFinite(Number(r?.lat))&&Number.isFinite(Number(r?.lon));}
  function esc(v){return typeof escMap==='function'?escMap(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function all(){return (state.reconectadores||[]).filter(validCoords);}
  function norm(v){return String(v||'').trim().toLowerCase();}
  function rows(){
    const q=norm(filters.query);
    return all().filter(r=>
      (!filters.quadrant||String(r.cuadrante||'')===filters.quadrant)&&
      (!filters.status||String(r.estado||'')===filters.status)&&
      (!filters.comm||norm(r.comunicacion_remota)===norm(filters.comm))&&
      (!q||[r.codigo,r.alimentador,r.ubicacion,r.cuadrante,r.gestor_cuadrante,r.estado].some(v=>norm(v).includes(q)))
    );
  }
  function getQuadrants(){return [...new Set((state.reconectadores||[]).map(r=>String(r.cuadrante||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));}
  function hav(a,b){const R=6371,toRad=x=>x*Math.PI/180;const dLat=toRad(Number(b.lat)-Number(a.lat)),dLon=toRad(Number(b.lon)-Number(a.lon));const la1=toRad(Number(a.lat)),la2=toRad(Number(b.lat));const x=Math.sin(dLat/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(x));}
  function pathLength(arr){let d=0;for(let i=1;i<arr.length;i++)d+=hav(arr[i-1],arr[i]);return d;}
  function nearestNeighbor(start,arr){const left=arr.filter(x=>x.id!==start.id),out=[start];let cur=start;while(left.length){let bi=0,bd=Infinity;for(let i=0;i<left.length;i++){const d=hav(cur,left[i]);if(d<bd){bd=d;bi=i;}}cur=left.splice(bi,1)[0];out.push(cur);}return out;}
  function optimizedRoute(arr){if(arr.length<3)return arr.slice();let best=null,bestD=Infinity;arr.forEach(s=>{const p=nearestNeighbor(s,arr),d=pathLength(p);if(d<bestD){bestD=d;best=p;}});return best||arr.slice();}

  function ensureStyles(){
    if(document.getElementById('mapUxV51Styles'))return;
    const s=document.createElement('style');s.id='mapUxV51Styles';s.textContent=`
      .mapUxV51{margin-bottom:13px}
      .mapTopV51{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:10px}
      .mapKpisV51{display:flex;gap:7px;flex-wrap:wrap}.mapKpiV51{display:flex;align-items:center;gap:7px;padding:8px 10px;border-radius:11px;background:#fff;border:1px solid #e2e8f0;font-size:10px;color:#65748a;box-shadow:0 4px 15px rgba(15,35,60,.035)}
      .mapKpiV51 strong{font-size:13px;color:#1e3550}.mapKpiDotV51{width:8px;height:8px;border-radius:50%}
      .mapToolbarV51{display:grid;grid-template-columns:minmax(240px,1.35fr) repeat(3,minmax(135px,.55fr)) auto;gap:8px;padding:11px;background:#fff;border:1px solid #e1e7ee;border-radius:15px;box-shadow:0 8px 24px rgba(15,35,60,.055)}
      .mapToolbarV51 input,.mapToolbarV51 select{height:42px;margin:0;font-size:11px;background:#fbfcfe;border-color:#dae2eb}
      .mapToolbarV51 .btn{height:42px;white-space:nowrap;font-size:11px}
      .mapQuickV51{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}.mapChipV51{border:1px solid #dce4ed;background:#fff;color:#52647a;border-radius:999px;padding:7px 10px;font-size:10px;font-weight:800;cursor:pointer}
      .mapChipV51.active{background:#e8f1ff;border-color:#bcd4f7;color:#1255ad}.mapChipV51.danger.active{background:#fdeceb;border-color:#f2c3bf;color:#a53830}.mapChipV51.warn.active{background:#fff3df;border-color:#f0d29b;color:#8c5a00}
      .mapActionsV51{display:flex;gap:7px;margin-left:auto}.mapActionsV51 .btn{font-size:10px;padding:8px 10px;min-height:36px}
      .mapRouteDrawerV51{display:none;margin-top:9px;background:#fff;border:1px solid #dde5ee;border-radius:15px;padding:12px;box-shadow:0 8px 24px rgba(15,35,60,.055)}.mapRouteDrawerV51.open{display:block}
      .mapRouteHeadV51{display:flex;justify-content:space-between;gap:10px;align-items:center}.mapRouteHeadV51 h4{margin:0;font-size:13px}.mapRouteHeadV51 p{margin:3px 0 0;color:#718096;font-size:10px}
      .mapRouteSummaryV51{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0}.mapRouteSummaryV51 span{padding:6px 9px;border-radius:9px;background:#f4f7fa;font-size:10px;font-weight:800;color:#53647a}
      .mapRouteListV51{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;max-height:190px;overflow:auto;padding-right:3px}.mapRouteItemV51{display:flex;gap:7px;align-items:flex-start;border:1px solid #e5eaf0;border-radius:10px;padding:8px;background:#fbfcfe;cursor:pointer}.mapRouteItemV51 input{margin-top:2px}.mapRouteItemV51 strong{display:block;font-size:10px}.mapRouteItemV51 small{display:block;color:#77859a;font-size:9px;margin-top:2px}
      .mapRouteActionsV51{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.mapRouteActionsV51 .btn{font-size:10px}
      #mapa .map-layout{grid-template-columns:minmax(0,1.8fr) minmax(265px,.55fr)!important;gap:12px!important}
      #mapa .map-layout>.panel:last-child{padding:13px!important;max-height:620px;overflow:hidden;display:flex;flex-direction:column}
      #mapa .map-layout>.panel:last-child h3{font-size:13px;margin:0}.mapListHeadV51{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px}.mapListHeadV51 span{font-size:9px;color:#7a8798}
      #mapList{overflow:auto;padding-right:3px}.mapListCardV51{border:1px solid #e5eaf0;border-radius:11px;padding:9px 10px;margin-bottom:7px;background:#fff;cursor:pointer;transition:.15s}.mapListCardV51:hover{border-color:#bfd1e6;background:#f8fbff}
      .mapListCardV51Top{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}.mapListCardV51 strong{font-size:11px;color:#1c324c}.mapListCardV51 small{display:block;color:#758399;font-size:9px;margin-top:3px;line-height:1.3}
      .mapMiniBadgeV51{font-size:8px;font-weight:900;padding:4px 6px;border-radius:999px;white-space:nowrap}.mapMiniBadgeV51.ok{background:#e8f6ef;color:#08744d}.mapMiniBadgeV51.warn{background:#fff3df;color:#8c5a00}.mapMiniBadgeV51.danger{background:#fdecea;color:#a23d34}
      .mapListActionsV51{display:flex;gap:5px;margin-top:7px}.mapListActionsV51 button{border:0;border-radius:7px;padding:6px 8px;font-size:9px;font-weight:800;cursor:pointer}.mapListActionsV51 .open{background:#1559c9;color:#fff}.mapListActionsV51 .route{background:#eef3f8;color:#42546a}
      .leaflet-control.mapActionControlV51{display:flex;flex-direction:column;gap:5px;border:0!important;box-shadow:none!important}.mapActionControlV51 button{width:34px;height:34px;border:1px solid #d8e0e8;background:#fff;border-radius:9px;font-size:16px;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.09)}
      body[data-theme="dark"] .mapToolbarV51,body[data-theme="dark"] .mapKpiV51,body[data-theme="dark"] .mapRouteDrawerV51,body[data-theme="dark"] .mapListCardV51{background:#101d2b;border-color:#283b4e;color:#dfe9f4}
      body[data-theme="dark"] .mapToolbarV51 input,body[data-theme="dark"] .mapToolbarV51 select{background:#0b1725;color:#eef5fb;border-color:#2c4056}
      body[data-theme="dark"] .mapChipV51{background:#101d2b;border-color:#30455a;color:#b7c6d8}
      body[data-theme="dark"] .mapKpiV51 strong,body[data-theme="dark"] .mapListCardV51 strong{color:#eef5fb}
      @media(max-width:900px){.mapToolbarV51{grid-template-columns:1fr 1fr 1fr}.mapToolbarV51 .mapSearchV51{grid-column:1/-1}.mapRouteListV51{grid-template-columns:repeat(2,1fr)}}
      @media(max-width:760px){
        .mapTopV51{display:block}.mapKpisV51{display:grid;grid-template-columns:1fr 1fr;margin-bottom:8px}.mapKpiV51{padding:7px 8px}
        .mapToolbarV51{grid-template-columns:1fr;padding:9px;gap:7px}.mapToolbarV51 .mapSearchV51{grid-column:auto}.mapToolbarV51 input,.mapToolbarV51 select,.mapToolbarV51 .btn{width:100%;height:44px}
        .mapQuickV51{overflow:auto;flex-wrap:nowrap;padding-bottom:2px}.mapChipV51{white-space:nowrap}.mapActionsV51{margin-left:0;width:100%}.mapActionsV51 .btn{flex:1}
        .mapRouteListV51{grid-template-columns:1fr;max-height:220px}
        #mapa .map-layout{grid-template-columns:1fr!important}#mapa .map-layout>.panel:last-child{max-height:300px;margin-top:10px!important}
        #mapSurface{height:58vh!important;min-height:420px!important}
      }
    `;document.head.appendChild(s);
  }

  function ensureUI(){
    ensureStyles();
    const view=document.getElementById('mapa');if(!view)return;
    const layout=view.querySelector('.map-layout');if(!layout)return;
    let host=document.getElementById('mapUxV51');
    if(!host){
      host=document.createElement('div');host.id='mapUxV51';host.className='mapUxV51';
      host.innerHTML=`
        <div class="mapTopV51">
          <div class="mapKpisV51">
            <div class="mapKpiV51"><i class="mapKpiDotV51" style="background:#0f8a5f"></i><span><strong id="mapOpV51">0</strong> operativos</span></div>
            <div class="mapKpiV51"><i class="mapKpiDotV51" style="background:#d18400"></i><span><strong id="mapObsV51">0</strong> observación</span></div>
            <div class="mapKpiV51"><i class="mapKpiDotV51" style="background:#c64238"></i><span><strong id="mapOffV51">0</strong> fuera</span></div>
            <div class="mapKpiV51"><span><strong id="mapGeoV51">0</strong> georreferenciados</span></div>
          </div>
          <div class="mapActionsV51">
            <button id="mapFitAllV51" class="btn ghost" type="button">◎ Ver todos</button>
            <button id="mapLocateV51" class="btn ghost" type="button">⌖ Mi ubicación</button>
            <button id="mapFullscreenV51" class="btn ghost" type="button">⛶ Pantalla completa</button>
            <button id="mapRouteToggleV51" class="btn primary" type="button">↗ Crear ruta</button>
          </div>
        </div>
        <div class="mapToolbarV51">
          <input id="mapSearchV51" class="mapSearchV51" placeholder="Buscar equipo, alimentador, ubicación o gestor…">
          <select id="mapQuadrantFilter"><option value="">Todos los cuadrantes</option></select>
          <select id="mapStatusV51"><option value="">Todos los estados</option><option>Operativo</option><option>Con observaciones</option><option>Fuera de servicio</option></select>
          <select id="mapCommV51"><option value="">Toda comunicación</option><option value="SI">Con comunicación remota</option><option value="NO">Sin comunicación remota</option></select>
          <button id="mapClearV51" class="btn ghost" type="button">Limpiar</button>
        </div>
        <div class="mapQuickV51">
          <button class="mapChipV51" data-map-status="">Todos</button>
          <button class="mapChipV51 warn" data-map-status="Con observaciones">⚠ Observaciones</button>
          <button class="mapChipV51 danger" data-map-status="Fuera de servicio">⛔ Fuera de servicio</button>
          <button class="mapChipV51" data-map-comm="NO">Sin comunicación remota</button>
        </div>
        <div id="mapRouteDrawerV51" class="mapRouteDrawerV51">
          <div class="mapRouteHeadV51"><div><h4>Ruta de inspección</h4><p>Selecciona los equipos que quieres visitar y abre el recorrido en Google Maps.</p></div><button id="mapRouteCloseV51" class="btn ghost" type="button">Cerrar</button></div>
          <div class="mapRouteSummaryV51"><span id="routeVisibleCount">0 visibles</span><span id="routeSelectedCount">0 seleccionados</span><span id="routeDistance">0 km aprox.</span></div>
          <div id="routeList" class="mapRouteListV51"></div>
          <div class="mapRouteActionsV51"><button id="routeSelectVisibleV51" class="btn secondary" type="button">Seleccionar visibles</button><button id="routeClear" class="btn ghost" type="button">Limpiar selección</button><button id="routeOpen" class="btn primary" type="button" disabled>Abrir ruta en Google Maps</button></div>
        </div>`;
      layout.parentNode.insertBefore(host,layout);
    }
    const old=document.getElementById('routeTools');if(old)old.remove();
    bindUI();
    updateSelectOptions();
  }

  function bindUI(){
    const host=document.getElementById('mapUxV51');if(!host||host.dataset.bound==='1')return;host.dataset.bound='1';
    const q=document.getElementById('mapQuadrantFilter'),s=document.getElementById('mapStatusV51'),c=document.getElementById('mapCommV51'),search=document.getElementById('mapSearchV51');
    q?.addEventListener('change',()=>{filters.quadrant=q.value;refresh();});
    s?.addEventListener('change',()=>{filters.status=s.value;syncChips();refresh();});
    c?.addEventListener('change',()=>{filters.comm=c.value;syncChips();refresh();});
    search?.addEventListener('input',()=>{filters.query=search.value;refresh(false);});
    document.getElementById('mapClearV51')?.addEventListener('click',()=>{filters={quadrant:'',status:'',comm:'',query:''};if(q)q.value='';if(s)s.value='';if(c)c.value='';if(search)search.value='';syncChips();refresh();});
    document.querySelectorAll('[data-map-status]').forEach(b=>b.addEventListener('click',()=>{filters.status=b.dataset.mapStatus||'';if(s)s.value=filters.status;syncChips();refresh();}));
    document.querySelectorAll('[data-map-comm]').forEach(b=>b.addEventListener('click',()=>{filters.comm=filters.comm===b.dataset.mapComm?'':b.dataset.mapComm;if(c)c.value=filters.comm;syncChips();refresh();}));
    document.getElementById('mapFitAllV51')?.addEventListener('click',fitVisible);
    document.getElementById('mapLocateV51')?.addEventListener('click',locateMe);
    document.getElementById('mapFullscreenV51')?.addEventListener('click',toggleFullscreen);
    document.getElementById('mapRouteToggleV51')?.addEventListener('click',()=>toggleRoute(true));
    document.getElementById('mapRouteCloseV51')?.addEventListener('click',()=>toggleRoute(false));
    document.getElementById('routeSelectVisibleV51')?.addEventListener('click',()=>{rows().forEach(r=>selected.add(r.id));renderRoute();});
    document.getElementById('routeClear')?.addEventListener('click',()=>{selected.clear();renderRoute();});
    document.getElementById('routeOpen')?.addEventListener('click',openRoute);
  }

  function updateSelectOptions(){
    const q=document.getElementById('mapQuadrantFilter');if(!q)return;
    const cur=filters.quadrant;
    const qs=getQuadrants();
    q.innerHTML='<option value="">Todos los cuadrantes</option>'+qs.map(v=>'<option value="'+esc(v)+'">Cuadrante '+esc(v)+'</option>').join('');
    q.value=qs.includes(cur)?cur:'';
  }

  function syncChips(){
    document.querySelectorAll('[data-map-status]').forEach(b=>b.classList.toggle('active',(b.dataset.mapStatus||'')===filters.status));
    document.querySelectorAll('[data-map-comm]').forEach(b=>b.classList.toggle('active',filters.comm===b.dataset.mapComm));
  }

  function renderFilteredMap(){
    if(typeof baseRenderMap!=='function')return;
    const original=state.reconectadores;
    const filtered=rows();
    window.mapUxRowsV51=filtered;
    state.reconectadores=filtered;
    try{baseRenderMap();}finally{state.reconectadores=original;}
    renderSideList(filtered);
    updateKpis();
    renderRoute();
  }
  window.renderMap=renderFilteredMap;

  function updateKpis(){
    const geo=all(),op=geo.filter(r=>r.estado==='Operativo').length,obs=geo.filter(r=>r.estado==='Con observaciones').length,off=geo.filter(r=>r.estado==='Fuera de servicio').length;
    const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    set('mapOpV51',op);set('mapObsV51',obs);set('mapOffV51',off);set('mapGeoV51',geo.length);
  }

  function statusClass(s){return s==='Fuera de servicio'?'danger':s==='Con observaciones'?'warn':'ok';}
  function renderSideList(arr){
    const panel=document.querySelector('#mapa .map-layout>.panel:last-child');const list=document.getElementById('mapList');if(!panel||!list)return;
    let head=panel.querySelector('.mapListHeadV51');
    if(!head){panel.querySelector('h3')?.remove();panel.querySelector('p.muted')?.remove();head=document.createElement('div');head.className='mapListHeadV51';panel.insertBefore(head,list);}
    head.innerHTML='<div><strong>Equipos visibles</strong><span style="display:block">'+arr.length+' en el mapa</span></div><span>Toca uno para revisar</span>';
    list.innerHTML=arr.map(r=>`<div class="mapListCardV51" data-map-card-id="${r.id}"><div class="mapListCardV51Top"><div><strong>${esc(r.codigo)}</strong><small>${esc(r.alimentador||'-')}${r.cuadrante?' · Cuadrante '+esc(r.cuadrante):''}</small><small>${esc(r.ubicacion||'-')}</small></div><span class="mapMiniBadgeV51 ${statusClass(r.estado)}">${esc(r.estado||'-')}</span></div><div class="mapListActionsV51"><button class="open" type="button" data-open-id="${r.id}">Ver ficha</button><button class="route" type="button" data-route-dest="${r.lat},${r.lon}">Cómo llegar</button></div></div>`).join('')||'<p class="muted">No hay equipos que coincidan con los filtros.</p>';
    list.querySelectorAll('[data-open-id]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();showReco(Number(b.dataset.openId));}));
    list.querySelectorAll('[data-route-dest]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const [lat,lon]=b.dataset.routeDest.split(',');googleRoute(lat,lon);}));
    list.querySelectorAll('[data-map-card-id]').forEach(card=>card.addEventListener('click',()=>focusEquipment(Number(card.dataset.mapCardId))));
  }

  function focusEquipment(id){
    const r=(state.reconectadores||[]).find(x=>x.id===id);if(!r||!recoLeafletMap)return;
    recoLeafletMap.setView([Number(r.lat),Number(r.lon)],16,{animate:true});
  }

  function fitVisible(){
    const arr=rows();if(!recoLeafletMap||!arr.length)return;
    const b=arr.map(r=>[Number(r.lat),Number(r.lon)]);
    if(b.length===1)recoLeafletMap.setView(b[0],16,{animate:false});else recoLeafletMap.fitBounds(b,{padding:[35,35],maxZoom:15,animate:false});
  }

  function toggleFullscreen(){
    const panel=document.querySelector('#mapa .map-panel');
    if(!panel)return;
    if(!document.fullscreenElement){panel.requestFullscreen?.().then(()=>setTimeout(()=>recoLeafletMap?.invalidateSize(false),120)).catch(()=>{});}
    else{document.exitFullscreen?.();}
  }

  function locateMe(){
    if(!navigator.geolocation){if(typeof toast==='function')toast('Ubicación no disponible en este dispositivo');return;}
    navigator.geolocation.getCurrentPosition(pos=>{
      if(!recoLeafletMap)return;
      const lat=pos.coords.latitude,lon=pos.coords.longitude;
      recoLeafletMap.setView([lat,lon],15,{animate:true});
      L.circleMarker([lat,lon],{radius:9,color:'#1559c9',weight:3,fillColor:'#7db7ff',fillOpacity:.9}).addTo(recoLeafletMap).bindTooltip('Tu ubicación',{permanent:false}).openTooltip();
    },()=>{if(typeof toast==='function')toast('No fue posible obtener tu ubicación');},{enableHighAccuracy:true,timeout:8000});
  }

  function toggleRoute(open){routeOpen=open;document.getElementById('mapRouteDrawerV51')?.classList.toggle('open',open);if(open)renderRoute();}
  function selectedRows(){const source=state.reconectadores||[];return [...selected].map(id=>source.find(r=>r.id===id)).filter(validCoords);}
  function renderRoute(){
    const arr=rows();const list=document.getElementById('routeList');if(!list)return;
    const validIds=new Set(all().map(r=>r.id));[...selected].forEach(id=>{if(!validIds.has(id))selected.delete(id);});
    list.innerHTML=arr.map(r=>`<label class="mapRouteItemV51"><input type="checkbox" data-route-id="${r.id}" ${selected.has(r.id)?'checked':''}><span><strong>${esc(r.codigo)}</strong><small>${esc(r.alimentador||'-')}${r.cuadrante?' · C'+esc(r.cuadrante):''}</small></span></label>`).join('')||'<p class="muted">No hay equipos visibles para seleccionar.</p>';
    list.querySelectorAll('[data-route-id]').forEach(c=>c.addEventListener('change',()=>{const id=Number(c.dataset.routeId);c.checked?selected.add(id):selected.delete(id);updateRouteSummary();}));
    const vc=document.getElementById('routeVisibleCount');if(vc)vc.textContent=arr.length+' visibles';
    updateRouteSummary();
  }

  function updateRouteSummary(){
    const arr=optimizedRoute(selectedRows()),d=pathLength(arr);
    const c=document.getElementById('routeSelectedCount'),dist=document.getElementById('routeDistance'),btn=document.getElementById('routeOpen');
    if(c)c.textContent=arr.length+' seleccionados';if(dist)dist.textContent=d.toFixed(1)+' km aprox.';if(btn)btn.disabled=arr.length<2;
  }

  function openRoute(){
    const arr=optimizedRoute(selectedRows());if(arr.length<2)return;
    const origin=`${arr[0].lat},${arr[0].lon}`,destination=`${arr[arr.length-1].lat},${arr[arr.length-1].lon}`,waypoints=arr.slice(1,-1).map(r=>`${r.lat},${r.lon}`).join('|');
    let url=`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;if(waypoints)url+=`&waypoints=${encodeURIComponent(waypoints)}`;window.open(url,'_blank');
  }

  function refresh(fit=false){
    ensureUI();renderFilteredMap();if(fit)setTimeout(fitVisible,30);
  }

  document.addEventListener('click',e=>{if(e.target.closest('[data-view="mapa"]'))setTimeout(()=>{ensureUI();updateSelectOptions();syncChips();refresh();},90);});
  setTimeout(()=>{ensureUI();updateSelectOptions();syncChips();updateKpis();renderRoute();},600);
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
