// Mapa real y geocodificación automática para Reconectadores MT.
let recoLeafletMap=null;
let recoMarkerLayer=null;
const IQQ_CENTER=[-20.2307,-70.1357];
const MAP_ZOOM=12;

(function addMapStyles(){
  if(document.getElementById('recoMapStyles'))return;
  const style=document.createElement('style');
  style.id='recoMapStyles';
  style.textContent=`
    #mapSurface{min-height:540px;height:62vh;max-height:720px;background:#edf1f5!important;overflow:hidden;position:relative}
    #mapSurface:before{display:none!important}
    #mapSurface .leaflet-control-attribution{font-size:9px}
    .reco-map-popup{min-width:240px;font-family:Inter,Segoe UI,Arial,sans-serif}
    .reco-map-popup h4{margin:0 0 5px;font-size:17px;color:#172033}
    .reco-map-popup p{margin:3px 0;color:#606b7b;font-size:12px;line-height:1.35}
    .reco-map-actions{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap}
    .reco-map-actions button{border:0;border-radius:8px;padding:8px 10px;font-weight:800;font-size:11px;cursor:pointer}
    .reco-map-actions .open{background:#1559c9;color:#fff}
    .reco-map-actions .route{background:#eef3f8;color:#24374d}
    .reco-group-marker{width:30px;height:30px;border:3px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:12px;box-shadow:0 2px 8px rgba(0,0,0,.3)}
    .reco-group-list{margin-top:8px;border-top:1px solid #e6eaf0}
    .reco-group-item{padding:8px 0;border-bottom:1px solid #eef1f4}
    .reco-group-item:last-child{border-bottom:0}
    .reco-group-item strong{font-size:13px;color:#172033}
    .reco-group-item span{display:block;font-size:11px;color:#606b7b;margin-top:2px}
    .reco-group-item button{margin-top:5px;border:0;border-radius:7px;padding:6px 9px;background:#1559c9;color:#fff;font-size:10px;font-weight:800;cursor:pointer}
    .mapLegend{display:flex;gap:10px;flex-wrap:wrap;padding:9px 12px;background:#fff;border:1px solid #e1e6ec;border-radius:8px;font-size:11px;font-weight:800;color:#596579}
    .mapLegend span{display:inline-flex;align-items:center;gap:5px}
    .mapLegend i{width:10px;height:10px;border-radius:50%;display:inline-block}
    .geoHint{font-size:11px;color:#6b7687;margin-top:5px;display:block}
    @media(max-width:760px){#mapSurface{height:55vh;min-height:380px}.map-layout{display:block}.map-layout>.panel:last-child{margin-top:12px}}
  `;
  document.head.appendChild(style);
})();

function escMap(v){return String(v??'').replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));}
function markerColor(estado){if(estado==='Fuera de servicio')return '#c64238';if(estado==='Con observaciones')return '#d18400';return '#0f8a5f';}
function groupMarkerColor(items){if(items.some(r=>r.estado==='Fuera de servicio'))return '#c64238';if(items.some(r=>r.estado==='Con observaciones'))return '#d18400';return '#0f8a5f';}
function googleRoute(lat,lon){window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(lat+','+lon)}`,'_blank');}
function coordinateGroups(rows){
  const groups=new Map();
  rows.forEach(r=>{
    const lat=Number(r.lat),lon=Number(r.lon);
    const key=`${lat.toFixed(7)},${lon.toFixed(7)}`;
    if(!groups.has(key))groups.set(key,{lat,lon,items:[]});
    groups.get(key).items.push(r);
  });
  return [...groups.values()];
}

window.renderMap=function(){
  const target=document.getElementById('mapSurface');
  const list=document.getElementById('mapList');
  if(!target||!list)return;

  const geocoded=(state.reconectadores||[]).filter(r=>Number.isFinite(Number(r.lat))&&Number.isFinite(Number(r.lon)));
  const groups=coordinateGroups(geocoded);
  list.innerHTML=groups.map(g=>{
    const codes=g.items.map(r=>escMap(r.codigo)).join(', ');
    const location=escMap(g.items[0]?.ubicacion||'-');
    const feeders=[...new Set(g.items.map(r=>r.alimentador).filter(Boolean))].map(escMap).join(' · ');
    return `<div class="listRow"><div><strong>${g.items.length>1?`${g.items.length} equipos · `:''}${codes}</strong><span class="tiny">${location}${feeders?` · ${feeders}`:''}</span></div><div><button class="btn ghost" onclick="googleRoute(${g.lat},${g.lon})">Cómo llegar</button></div></div>`;
  }).join('')||'<p class="muted">Aún no hay equipos con una dirección reconocida por el mapa.</p>';

  if(typeof L==='undefined'){
    target.innerHTML='<div class="map-label">No se pudo iniciar el mapa. Cierra y vuelve a abrir la app.</div>';
    return;
  }

  if(!recoLeafletMap){
    target.innerHTML='';
    recoLeafletMap=L.map(target,{zoomControl:true,preferCanvas:true,fadeAnimation:false,zoomAnimation:false}).setView(IQQ_CENTER,MAP_ZOOM);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
      maxZoom:19,
      updateWhenIdle:true,
      keepBuffer:3,
      attribution:'&copy; OpenStreetMap contributors'
    }).addTo(recoLeafletMap);
    const legend=L.control({position:'topright'});
    legend.onAdd=()=>{
      const div=L.DomUtil.create('div','mapLegend');
      div.innerHTML='<span><i style="background:#0f8a5f"></i>Operativo</span><span><i style="background:#d18400"></i>Observación</span><span><i style="background:#c64238"></i>Fuera de servicio</span>';
      L.DomEvent.disableClickPropagation(div);
      return div;
    };
    legend.addTo(recoLeafletMap);
    recoMarkerLayer=L.layerGroup().addTo(recoLeafletMap);
  }else{
    recoMarkerLayer.clearLayers();
  }

  const bounds=[];
  groups.forEach(g=>{
    const {lat,lon,items}=g;
    const color=groupMarkerColor(items);
    let marker;
    if(items.length>1){
      marker=L.marker([lat,lon],{
        icon:L.divIcon({className:'',html:`<div class="reco-group-marker" style="background:${color}">${items.length}</div>`,iconSize:[30,30],iconAnchor:[15,15]})
      });
      marker.bindTooltip(`${items.length} equipos`,{direction:'top',offset:[0,-13],opacity:.95});
    }else{
      const r=items[0];
      marker=L.circleMarker([lat,lon],{radius:10,color:'#fff',weight:3,fillColor:color,fillOpacity:1});
      marker.bindTooltip(escMap(r.codigo),{direction:'top',offset:[0,-8],opacity:.95});
    }

    const popupItems=items.map(r=>`<div class="reco-group-item"><strong>${escMap(r.codigo)}</strong><span>${escMap(r.alimentador||'-')} · ${escMap(r.estado||'-')}</span><button onclick="showReco(${r.id})">Abrir ficha</button></div>`).join('');
    const title=items.length>1?`${items.length} equipos en esta ubicación`:escMap(items[0].codigo);
    const location=escMap(items[0]?.ubicacion||'-');
    marker.bindPopup(`<div class="reco-map-popup"><h4>${title}</h4><p>${location}</p><div class="reco-group-list">${popupItems}</div><div class="reco-map-actions"><button class="route" onclick="googleRoute(${lat},${lon})">Cómo llegar</button></div></div>`,{maxWidth:320});
    marker.addTo(recoMarkerLayer);
    bounds.push([lat,lon]);
  });

  if(bounds.length===1)recoLeafletMap.setView(bounds[0],15,{animate:false});
  else if(bounds.length>1)recoLeafletMap.fitBounds(bounds,{padding:[25,25],maxZoom:15,animate:false});
  else recoLeafletMap.setView(IQQ_CENTER,MAP_ZOOM,{animate:false});
  setTimeout(()=>recoLeafletMap?.invalidateSize(false),50);
};

function removeLegacyLocationFields(){
  ['lat','lon','pickup'].forEach(name=>{
    const el=document.querySelector(`#recoForm [name="${name}"]`);
    if(el)el.closest('label')?.remove();
  });
  const ubicacion=document.querySelector('#recoForm [name="ubicacion"]');
  if(ubicacion){
    ubicacion.placeholder='Ej: Av. Arturo Prat 1234, Iquique';
    const label=ubicacion.closest('label');
    if(label&& !label.querySelector('.geoHint')){
      const hint=document.createElement('span');
      hint.className='geoHint';
      hint.textContent='La app ubicará automáticamente esta dirección en el mapa.';
      label.appendChild(hint);
    }
  }
  const search=document.getElementById('searchReco');
  if(search)search.placeholder='Buscar alimentador, equipo, ubicación...';
  const mapText=document.querySelector('#mapa .panel:last-child .muted');
  if(mapText)mapText.textContent='Si varios equipos comparten coordenadas, aparecerán agrupados en un solo punto del mapa.';
}
removeLegacyLocationFields();

async function geocodeAddress(address){
  const clean=String(address||'').trim();
  if(!clean||/^por registrar$/i.test(clean))return null;
  const attempts=[];
  if(/iquique|alto hospicio|tarapac[aá]|chile/i.test(clean))attempts.push(clean);
  else attempts.push(`${clean}, Iquique, Tarapacá, Chile`);
  attempts.push(`${clean}, Chile`);
  for(const q of attempts){
    try{
      const url=`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=cl&addressdetails=1&q=${encodeURIComponent(q)}`;
      const resp=await fetch(url,{headers:{'Accept':'application/json'}});
      if(!resp.ok)continue;
      const data=await resp.json();
      if(data?.length){
        const lat=Number(data[0].lat),lon=Number(data[0].lon);
        if(Number.isFinite(lat)&&Number.isFinite(lon))return {lat,lon};
      }
    }catch(err){console.warn('Geocodificación no disponible',err);}
  }
  return null;
}

// Intercepta el guardado para obtener latitud/longitud automáticamente desde Ubicación.
recoForm.addEventListener('submit',async e=>{
  e.preventDefault();
  e.stopImmediatePropagation();
  if(!isAdmin())return;
  const submit=e.submitter;
  if(submit){submit.disabled=true;submit.textContent='Ubicando...';}
  try{
    const o=Object.fromEntries(new FormData(recoForm));
    delete o.id;
    delete o.lat;delete o.lon;delete o.pickup;
    if(o.fecha_verificacion==='')o.fecha_verificacion=null;
    const coords=await geocodeAddress(o.ubicacion);
    o.lat=coords?coords.lat:null;
    o.lon=coords?coords.lon:null;
    const {error}=await sb.from('reconectadores').upsert(o,{onConflict:'codigo'});
    if(error){console.error(error);return toast('No se pudo guardar');}
    closeModal('recoModal');
    await loadData();
    toast(coords?'Equipo guardado y ubicado en el mapa':'Equipo guardado · dirección no localizada');
  }finally{
    if(submit){submit.disabled=false;submit.textContent='Guardar equipo';}
  }
},true);

// Vincula automáticamente al mapa los registros importados desde planillas.
let importedGeoRunning=false;
const importedGeoFailed=new Set();
function hasUsableImportedLocation(r){
  const u=String(r?.ubicacion||'').trim();
  const a=String(r?.alimentador||'').trim();
  if(!u||/^por registrar$/i.test(u))return false;
  // Si solo se usó el nombre del alimentador como relleno, no se inventa una posición.
  if(a&&u.localeCompare(a,undefined,{sensitivity:'accent'})===0)return false;
  return true;
}
async function syncImportedLocations(){
  if(importedGeoRunning||!isAdmin())return;
  const pending=(state.reconectadores||[]).filter(r=>
    (!Number.isFinite(Number(r.lat))||!Number.isFinite(Number(r.lon)))&&
    hasUsableImportedLocation(r)&&
    !importedGeoFailed.has(r.id)
  );
  if(!pending.length)return;
  importedGeoRunning=true;
  let linked=0;
  try{
    for(const r of pending){
      const coords=await geocodeAddress(r.ubicacion);
      if(coords){
        const {error}=await sb.from('reconectadores').update({lat:coords.lat,lon:coords.lon}).eq('id',r.id);
        if(!error){r.lat=coords.lat;r.lon=coords.lon;linked++;}
        else{console.error(error);importedGeoFailed.add(r.id);}
      }else{
        importedGeoFailed.add(r.id);
      }
      // El servicio público de geocodificación se consulta de forma pausada.
      await new Promise(resolve=>setTimeout(resolve,1100));
    }
  }finally{
    importedGeoRunning=false;
  }
  if(linked){
    window.renderMap();
    renderRecos();
    toast(`${linked} ${linked===1?'ubicación enlazada':'ubicaciones enlazadas'} al mapa`);
  }
}

// Se revisan automáticamente nuevas filas importadas cuando el administrador tiene la app abierta.
setTimeout(()=>syncImportedLocations(),2500);
setInterval(()=>syncImportedLocations(),30000);

document.addEventListener('click',e=>{
  const btn=e.target.closest('[data-view="mapa"]');
  if(btn){setTimeout(()=>window.renderMap(),50);setTimeout(()=>syncImportedLocations(),150);}
});
setTimeout(()=>{try{window.renderMap()}catch(e){console.error(e)}},150);

renderRecos=function(){
  let q=(searchReco.value||'').toLowerCase(),f=filterStatus.value,b=filterBrand.value;
  let arr=state.reconectadores.filter(r=>(!f||r.estado===f)&&(!b||r.marca===b)&&Object.values(r).join(' ').toLowerCase().includes(q));
  recoGrid.innerHTML=arr.map(r=>{let cls=r.estado==='Con observaciones'?'warnCard':r.estado==='Fuera de servicio'?'dangerCard':'';return `<div class="recoCard ${cls}" onclick="showReco(${r.id})"><span class="eyebrow">${r.alimentador||'-'}</span><div class="recoCode">${r.codigo}</div>${badge(r.estado)}<div class="metaGrid"><div class="metaBox"><span>Equipo</span><strong>${r.marca||'-'}</strong></div><div class="metaBox"><span>Ubicación</span><strong>${r.ubicacion||'-'}</strong></div><div class="metaBox"><span>Sobrecorriente fase</span><strong>${r.sobrecorriente_fase||'-'}</strong></div><div class="metaBox"><span>Sobrecorriente residual</span><strong>${r.sobrecorriente_residual||'-'}</strong></div></div><button class="btn primary">Abrir ficha técnica</button></div>`}).join('')||`<p class="muted">No hay equipos que coincidan con la búsqueda.</p>`;
};

showReco=function(id){
  let r=state.reconectadores.find(x=>x.id===id);if(!r)return;
  let ins=state.inspecciones.filter(i=>i.equipo===r.codigo).sort((a,b)=>b.fecha.localeCompare(a.fecha));
  let last=ins[0];
  detailTitle.textContent=`${r.codigo} · ${r.ubicacion}`;
  detailContent.innerHTML=`<div class="detailHero"><div class="detailMain"><span class="eyebrow">${r.alimentador||'-'}</span><h2>${r.codigo}</h2>${badge(r.estado)}<p>${r.observaciones||'Sin observaciones técnicas.'}</p>${isAdmin()?`<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn secondary" onclick="editReco(${r.id})">Editar equipo</button><button class="btn secondary" onclick="closeModal('detailModal');openInspection('${r.codigo}')">+ Nueva inspección</button><button class="btn ghost-light" style="border-color:#f0a39d;color:#fff" onclick="deleteReco(${r.id})">Eliminar equipo</button></div>`:''}</div><div class="detailAside"><h3>Estado actual</h3><div class="inspectionCard">${last?`<div class="inspectionTop"><strong>Última inspección</strong>${badge(last.resultado)}</div><p>${fmtDate(last.fecha)} · ${last.inspector}</p><p class="muted">${last.observaciones}</p>`:`<p class='muted'>Sin inspecciones registradas.</p>`}</div>${Number.isFinite(Number(r.lat))&&Number.isFinite(Number(r.lon))?`<button class="btn primary" onclick="googleRoute(${Number(r.lat)},${Number(r.lon)})">📍 Cómo llegar</button>`:''}</div></div><div class="detailStats"><div class="stat"><span>Alimentador</span><strong>${r.alimentador||'-'}</strong></div><div class="stat"><span>Equipo</span><strong>${r.codigo||'-'}</strong></div><div class="stat"><span>Sobrecorriente fase</span><strong>${r.sobrecorriente_fase||'-'}</strong></div><div class="stat"><span>Sobrecorriente residual</span><strong>${r.sobrecorriente_residual||'-'}</strong></div><div class="stat"><span>Equipo / referencia</span><strong>${r.marca||'-'}</strong></div><div class="stat"><span>Fecha verificación</span><strong>${fmtDate(r.fecha_verificacion)}</strong></div><div class="stat"><span>Estado</span><strong>${r.estado||'-'}</strong></div><div class="stat"><span>Ubicación</span><strong>${r.ubicacion||'-'}</strong></div></div><h3>Historial de inspecciones</h3><div class="history">${ins.map(i=>`<div class="historyItem"><h4>${fmtDate(i.fecha)} · ${i.inspector}</h4><p>${badge(i.resultado)} · Batería ${i.tension||'-'} V · Comunicación ${i.comunicaciones}</p><p>${i.observaciones||'Sin observaciones.'}</p></div>`).join('')||`<p class="muted">Sin inspecciones registradas.</p>`}</div>`;
  openModal('detailModal');
};

setTimeout(()=>{try{removeLegacyLocationFields();renderRecos()}catch(e){console.error(e)}},250);
