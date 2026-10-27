// v46 · Capa de Alimentadores MT sobre el mapa Leaflet.
(function(){
  let feederLayer=null;
  let feederPointLayer=null;
  let feederData={type:'FeatureCollection',features:[]};
  let visible=true;
  let selectedFeeder='';

  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function norm(v){return String(v||'').trim().toUpperCase();}
  function allFeeders(){
    return [...new Set((state.reconectadores||[]).map(r=>String(r.alimentador||'').trim()).filter(Boolean))]
      .sort((a,b)=>a.localeCompare(b,'es',{numeric:true}));
  }
  function featureName(f){
    const p=f?.properties||{};
    return String(p.alimentador||p.nombre||p.name||p.feeder||'').trim();
  }

  function ensureStyles(){
    if(document.getElementById('feederMapStyles'))return;
    const s=document.createElement('style');s.id='feederMapStyles';s.textContent=`
      .feederTools{margin-bottom:14px;padding:14px;background:#fff;border:1px solid #e1e6ec;border-radius:12px;box-shadow:0 2px 8px rgba(16,34,58,.04)}
      .feederToolsTop{display:flex;gap:10px;align-items:end;flex-wrap:wrap}
      .feederTools label{display:flex;flex-direction:column;gap:5px;font-size:11px;font-weight:800;color:#566276}
      .feederTools select{min-width:220px;padding:10px;border:1px solid #d9e0e8;border-radius:9px;background:#fff}
      .feederStatus{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
      .feederStatus span{padding:7px 9px;background:#f4f7fa;border-radius:8px;font-size:11px;font-weight:800;color:#536175}
      .feederNotice{margin-top:10px;padding:10px 12px;border-radius:9px;background:#f8fafc;border:1px solid #e7ebf0;color:#667487;font-size:11px;line-height:1.4}
      .feederToggle.active{background:#1559c9;color:#fff}
      body[data-theme="dark"] .feederTools{background:#101d2c;border-color:#26384d}
      body[data-theme="dark"] .feederTools select{background:#0b1624;color:#eef4ff;border-color:#2b4058}
      body[data-theme="dark"] .feederStatus span,body[data-theme="dark"] .feederNotice{background:#142337;border-color:#26384d;color:#c7d4e4}
      @media(max-width:760px){.feederToolsTop{display:block}.feederTools label{margin-bottom:9px}.feederTools select,.feederTools .btn{width:100%;min-width:0}}
    `;document.head.appendChild(s);
  }

  function ensureUI(){
    ensureStyles();
    const view=document.getElementById('mapa');if(!view)return;
    let box=document.getElementById('feederTools');
    if(!box){
      const layout=view.querySelector('.map-layout');if(!layout)return;
      box=document.createElement('div');box.id='feederTools';box.className='feederTools feederToolsVisible';
      box.innerHTML='<div class="feederToolsTop"><label>Alimentador MT<select id="feederSelect"><option value="">Todos los alimentadores</option></select></label><button id="feederToggle" class="btn primary feederToggle active" type="button">⚡ Capa activa</button><button id="feederFit" class="btn ghost" type="button">◎ Centrar selección</button></div><div class="feederStatus"><span id="feederCount">0 alimentadores</span><span id="feederRecoCount">0 reconectadores asociados</span><span id="feederGeometryCount">0 trazados georreferenciados</span></div><div id="feederNotice" class="feederNotice feederNoticeStrong"></div>';
      layout.parentNode.insertBefore(box,layout);
    }
    if(box.dataset.bound==='1'){populateSelect();return;}
    box.dataset.bound='1';
    populateSelect();
    document.getElementById('feederSelect')?.addEventListener('change',e=>{selectedFeeder=e.target.value;renderFeederLayer();});
    document.getElementById('feederToggle')?.addEventListener('click',()=>{
      visible=!visible;
      const b=document.getElementById('feederToggle');
      b.classList.toggle('active',visible);
      b.textContent=visible?'⚡ Capa activa':'⚡ Capa oculta';
      renderFeederLayer();
    });
    document.getElementById('feederFit')?.addEventListener('click',fitSelected);
  }

  function populateSelect(){
    const s=document.getElementById('feederSelect');if(!s)return;
    const cur=s.value;
    const feeders=allFeeders();
    s.innerHTML='<option value="">Todos los alimentadores</option>'+feeders.map(f=>'<option value="'+esc(f)+'">'+esc(f)+'</option>').join('');
    if(feeders.includes(cur))s.value=cur;
    const c=document.getElementById('feederCount');if(c)c.textContent=feeders.length+' alimentadores';
  }

  async function loadGeoJSON(){
    try{
      const r=await fetch('alimentadores.geojson?v=47',{cache:'no-store'});
      if(!r.ok)throw new Error('No se pudo cargar alimentadores.geojson');
      const j=await r.json();
      feederData=(j&&j.type==='FeatureCollection')?j:{type:'FeatureCollection',features:[]};
    }catch(e){
      console.warn('Capa de alimentadores no disponible:',e);
      feederData={type:'FeatureCollection',features:[]};
    }
    updateCounts();
    renderFeederLayer();
  }

  function mapReady(){return typeof recoLeafletMap!=='undefined'&&recoLeafletMap&&typeof L!=='undefined';}

  function clearLayers(){
    if(!mapReady())return;
    if(feederLayer){recoLeafletMap.removeLayer(feederLayer);feederLayer=null;}
    if(feederPointLayer){recoLeafletMap.removeLayer(feederPointLayer);feederPointLayer=null;}
  }

  function feederFeatures(){
    const all=feederData.features||[];
    if(!selectedFeeder)return all;
    return all.filter(f=>norm(featureName(f))===norm(selectedFeeder));
  }

  function feederRows(){
    const all=(state.reconectadores||[]).filter(r=>Number.isFinite(Number(r.lat))&&Number.isFinite(Number(r.lon)));
    if(!selectedFeeder)return [];
    return all.filter(r=>norm(r.alimentador)===norm(selectedFeeder));
  }

  function lineStyle(feature){
    const name=featureName(feature);
    const selected=selectedFeeder&&norm(name)===norm(selectedFeeder);
    return {color:selected?'#ff8a00':'#2c73c9',weight:selected?6:4,opacity:selected?0.95:0.7};
  }

  function renderFeederLayer(){
    ensureUI();populateSelect();updateCounts();
    if(!mapReady())return;
    clearLayers();
    if(!visible)return;

    const features=feederFeatures();
    feederLayer=L.geoJSON({type:'FeatureCollection',features},{
      style:lineStyle,
      onEachFeature:(f,l)=>{
        const n=featureName(f)||'Alimentador MT';
        const p=f.properties||{};
        l.bindPopup('<div class="reco-map-popup"><h4>⚡ '+esc(n)+'</h4><p>Trazado MT georreferenciado</p>'+(p.cuadrante?'<p>Cuadrante '+esc(p.cuadrante)+'</p>':'')+'</div>');
        l.bindTooltip(esc(n),{sticky:true,opacity:.95});
      }
    }).addTo(recoLeafletMap);

    const rows=feederRows();
    feederPointLayer=L.layerGroup();
    rows.forEach(r=>{
      const m=L.circleMarker([Number(r.lat),Number(r.lon)],{radius:14,color:'#ff8a00',weight:3,fillColor:'#ffb347',fillOpacity:.18});
      m.bindTooltip(esc(r.codigo)+' · '+esc(r.alimentador||'-'),{direction:'top',opacity:.95});
      feederPointLayer.addLayer(m);
    });
    feederPointLayer.addTo(recoLeafletMap);
  }

  function fitSelected(){
    if(!mapReady())return;
    const bounds=[];
    const rows=feederRows();rows.forEach(r=>bounds.push([Number(r.lat),Number(r.lon)]));
    if(feederLayer){
      try{const b=feederLayer.getBounds();if(b.isValid()){bounds.push(b.getSouthWest(),b.getNorthEast());}}catch(_){}
    }
    if(bounds.length)recoLeafletMap.fitBounds(bounds,{padding:[35,35],maxZoom:15,animate:false});
    else if(typeof toast==='function')toast(selectedFeeder?'Sin geometría o puntos para este alimentador':'Selecciona un alimentador');
  }

  function updateCounts(){
    const features=feederFeatures();
    const rows=feederRows();
    const g=document.getElementById('feederGeometryCount');if(g)g.textContent=(feederData.features||[]).length+' trazados georreferenciados';
    const r=document.getElementById('feederRecoCount');if(r)r.textContent=(selectedFeeder?rows.length:(state.reconectadores||[]).length)+' reconectadores '+(selectedFeeder?'asociados':'en la base');
    const notice=document.getElementById('feederNotice');
    if(notice){
      if((feederData.features||[]).length)notice.textContent='Capa de alimentadores activa. Selecciona un alimentador para resaltar su trazado y sus reconectadores asociados.';
      else notice.textContent='La capa está preparada para recibir los trazados reales en formato GeoJSON. Mientras tanto, al seleccionar un alimentador se resaltan sus reconectadores conocidos sin inventar el recorrido de la línea MT.';
    }
  }

  const priorRender=window.renderMap;
  if(typeof priorRender==='function'){
    window.renderMap=function(){
      priorRender();
      setTimeout(()=>{ensureUI();renderFeederLayer();},120);
    };
  }

  document.addEventListener('click',e=>{if(e.target.closest('[data-view="mapa"]'))setTimeout(()=>{ensureUI();populateSelect();renderFeederLayer();},180);});
  setTimeout(()=>{ensureUI();loadGeoJSON();},900);
  window.renderFeederLayer=renderFeederLayer;
})();