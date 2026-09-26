// Integración de mapa real para Reconectadores MT.
// La lógica de acceso administrador está integrada directamente en app.js.

let recoLeafletMap=null;
let recoMarkerLayer=null;
let leafletLoading=null;
const IQQ_CENTER=[-20.2307,-70.1357];
const MAP_ZOOM=12;
const TILE_URL='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

(function warmMapConnections(){
  ['https://unpkg.com','https://a.basemaps.cartocdn.com','https://b.basemaps.cartocdn.com','https://c.basemaps.cartocdn.com','https://d.basemaps.cartocdn.com'].forEach(href=>{
    if(document.querySelector(`link[href="${href}"]`))return;
    const link=document.createElement('link');
    link.rel='preconnect';
    link.href=href;
    link.crossOrigin='anonymous';
    document.head.appendChild(link);
  });
})();

function loadLeaflet(){
  if(window.L)return Promise.resolve();
  if(leafletLoading)return leafletLoading;
  leafletLoading=new Promise((resolve,reject)=>{
    if(!document.querySelector('link[data-reco-leaflet]')){
      const css=document.createElement('link');
      css.rel='stylesheet';
      css.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      css.crossOrigin='';
      css.dataset.recoLeaflet='1';
      document.head.appendChild(css);
    }
    const script=document.createElement('script');
    script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.crossOrigin='';
    script.async=true;
    script.onload=resolve;
    script.onerror=()=>reject(new Error('No se pudo cargar Leaflet'));
    document.head.appendChild(script);
  });
  return leafletLoading;
}

(function addMapStyles(){
  if(document.getElementById('recoMapStyles'))return;
  const style=document.createElement('style');
  style.id='recoMapStyles';
  style.textContent=`
    #mapSurface{min-height:540px;height:62vh;max-height:720px;background:#edf1f5!important;overflow:hidden;position:relative}
    #mapSurface:before{display:none!important}
    #mapSurface .leaflet-control-attribution{font-size:9px}
    .reco-map-popup{min-width:210px;font-family:Inter,Segoe UI,Arial,sans-serif}
    .reco-map-popup h4{margin:0 0 5px;font-size:17px;color:#172033}
    .reco-map-popup p{margin:3px 0;color:#606b7b;font-size:12px;line-height:1.35}
    .reco-map-actions{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap}
    .reco-map-actions button{border:0;border-radius:8px;padding:8px 10px;font-weight:800;font-size:11px;cursor:pointer}
    .reco-map-actions .open{background:#1559c9;color:#fff}
    .reco-map-actions .route{background:#eef3f8;color:#24374d}
    .mapLegend{display:flex;gap:10px;flex-wrap:wrap;padding:9px 12px;background:#fff;border-bottom:1px solid #e1e6ec;font-size:11px;font-weight:800;color:#596579}
    .mapLegend span{display:inline-flex;align-items:center;gap:5px}
    .mapLegend i{width:10px;height:10px;border-radius:50%;display:inline-block}
    @media(max-width:760px){#mapSurface{height:55vh;min-height:380px}.map-layout{display:block}.map-layout>.panel:last-child{margin-top:12px}}
  `;
  document.head.appendChild(style);
})();

function escMap(v){return String(v??'').replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));}
function markerColor(estado){if(estado==='Fuera de servicio')return '#c64238';if(estado==='Con observaciones')return '#d18400';return '#0f8a5f';}
function googleRoute(lat,lon){window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(lat+','+lon)}`,'_blank');}

function latLonToTile(lat,lon,z){
  const n=2**z;
  const x=Math.floor((lon+180)/360*n);
  const latRad=lat*Math.PI/180;
  const y=Math.floor((1-Math.asinh(Math.tan(latRad))/Math.PI)/2*n);
  return {x,y};
}
function warmIquiqueTiles(){
  const {x,y}=latLonToTile(IQQ_CENTER[0],IQQ_CENTER[1],MAP_ZOOM);
  const hosts=['a','b','c','d'];
  let k=0;
  for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){
    const img=new Image();
    const host=hosts[k++%hosts.length];
    img.decoding='async';
    img.src=`https://${host}.basemaps.cartocdn.com/light_all/${MAP_ZOOM}/${x+dx}/${y+dy}.png`;
  }
}

window.renderMap=function(){
  const target=document.getElementById('mapSurface');
  const list=document.getElementById('mapList');
  if(!target||!list)return;

  const geocoded=(state.reconectadores||[]).filter(r=>Number.isFinite(Number(r.lat))&&Number.isFinite(Number(r.lon)));
  list.innerHTML=geocoded.map(r=>`<div class="listRow"><div><strong>${escMap(r.codigo)} · ${escMap(r.ubicacion)}</strong><span class="tiny">${escMap(r.alimentador)} · ${Number(r.lat).toFixed(5)}, ${Number(r.lon).toFixed(5)}</span></div><div><button class="btn ghost" onclick="showReco(${r.id})">Ficha</button> <button class="btn ghost" onclick="googleRoute(${Number(r.lat)},${Number(r.lon)})">Cómo llegar</button></div></div>`).join('')||'<p class="muted">No hay equipos con coordenadas registradas. El mapa se encuentra centrado en Iquique.</p>';

  if(!recoLeafletMap)target.innerHTML='<div class="map-label">Preparando mapa...</div>';
  loadLeaflet().then(()=>{
    if(!document.getElementById('mapSurface'))return;
    if(!recoLeafletMap){
      target.innerHTML='';
      recoLeafletMap=L.map(target,{zoomControl:true,preferCanvas:true,fadeAnimation:false,zoomAnimation:false,markerZoomAnimation:false}).setView(IQQ_CENTER,MAP_ZOOM);
      L.tileLayer(TILE_URL,{
        subdomains:'abcd',
        maxZoom:19,
        updateWhenIdle:true,
        keepBuffer:4,
        attribution:'&copy; OpenStreetMap contributors &copy; CARTO'
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
    geocoded.forEach(r=>{
      const lat=Number(r.lat),lon=Number(r.lon),color=markerColor(r.estado);
      const marker=L.circleMarker([lat,lon],{radius:10,color:'#fff',weight:3,fillColor:color,fillOpacity:1});
      marker.bindTooltip(escMap(r.codigo),{direction:'top',offset:[0,-8],opacity:.95});
      marker.bindPopup(`<div class="reco-map-popup"><h4>${escMap(r.codigo)}</h4><p><strong>${escMap(r.estado)}</strong></p><p>${escMap(r.alimentador)}</p><p>${escMap(r.ubicacion)}</p><div class="reco-map-actions"><button class="open" onclick="showReco(${r.id})">Abrir ficha</button><button class="route" onclick="googleRoute(${lat},${lon})">Cómo llegar</button></div></div>`);
      marker.addTo(recoMarkerLayer);
      bounds.push([lat,lon]);
    });

    if(bounds.length===1)recoLeafletMap.setView(bounds[0],15,{animate:false});
    else if(bounds.length>1)recoLeafletMap.fitBounds(bounds,{padding:[25,25],maxZoom:15,animate:false});
    else recoLeafletMap.setView(IQQ_CENTER,MAP_ZOOM,{animate:false});

    requestAnimationFrame(()=>recoLeafletMap?.invalidateSize(false));
  }).catch(err=>{
    console.error(err);
    target.innerHTML='<div class="map-label">No se pudo cargar el mapa. Revisa la conexión a internet.</div>';
  });
};

// Precarga mapa y teselas de Iquique desde el inicio.
loadLeaflet().catch(()=>{});
warmIquiqueTiles();

document.addEventListener('click',e=>{
  const btn=e.target.closest('[data-view="mapa"]');
  if(btn)setTimeout(()=>window.renderMap(),0);
});
setTimeout(()=>{try{window.renderMap()}catch(e){console.error(e)}},0);
