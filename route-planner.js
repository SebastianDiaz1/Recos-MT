// Filtro geográfico por cuadrante y planificador de ruta de inspección.
(function(){
  const selected=new Set();
  let activeQuadrant='';
  const baseRenderMap=window.renderMap;

  function validCoords(r){return Number.isFinite(Number(r?.lat))&&Number.isFinite(Number(r?.lon));}
  function rows(){return (state.reconectadores||[]).filter(validCoords).filter(r=>!activeQuadrant||String(r.cuadrante||'')===activeQuadrant);}
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
      .routeActions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.routeActions button:disabled{opacity:.45;cursor:not-allowed}
      @media(max-width:760px){.routeTools select{min-width:100%;width:100%}.routeToolsTop{display:block}.routeToolsTop label{margin-bottom:9px}}
    `;document.head.appendChild(s);
  }

  function ensureUI(){
    ensureStyles();
    const view=document.getElementById('mapa'); if(!view)return;
    if(document.getElementById('routeTools'))return;
    const layout=view.querySelector('.map-layout'); if(!layout)return;
    const box=document.createElement('div');box.id='routeTools';box.className='routeTools';
    box.innerHTML=`<div class="routeToolsTop"><label>Filtrar mapa por cuadrante<select id="mapQuadrantFilter"><option value="">Todos los cuadrantes</option></select></label></div><div class="routeSummary"><span id="routeVisibleCount">0 equipos visibles</span><span id="routeSelectedCount">0 seleccionados</span><span id="routeDistance">0 km aprox.</span></div><div id="routeList" class="routeList"></div><div class="routeActions"><button id="routeClear" class="btn ghost" type="button">Limpiar selección</button><button id="routeOpen" class="btn primary" type="button" disabled>Abrir ruta en Google Maps</button></div>`;
    layout.parentNode.insertBefore(box,layout);
    const q=document.getElementById('mapQuadrantFilter');
    getQuadrants().forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=`Cuadrante ${v}`;q.appendChild(o);});
    q.addEventListener('change',()=>{activeQuadrant=q.value;selected.clear();renderFilteredMap();renderPlanner();});
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
    [...selected].forEach(id=>{if(!arr.some(r=>r.id===id))selected.delete(id);});
    const list=document.getElementById('routeList'); if(!list)return;
    list.innerHTML=arr.map(r=>`<label class="routeItem"><input type="checkbox" data-route-id="${r.id}" ${selected.has(r.id)?'checked':''}><span><strong>${esc(r.codigo)}</strong><small>${esc(r.alimentador||'-')}${r.cuadrante?` · Cuadrante ${esc(r.cuadrante)}`:''}</small></span></label>`).join('')||'<p class="muted">No hay equipos georreferenciados para este cuadrante.</p>';
    list.querySelectorAll('[data-route-id]').forEach(c=>c.addEventListener('change',()=>{const id=Number(c.dataset.routeId);c.checked?selected.add(id):selected.delete(id);updateSummary();}));
    document.getElementById('routeVisibleCount').textContent=`${arr.length} ${arr.length===1?'equipo visible':'equipos visibles'}`;
    updateSummary();
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
