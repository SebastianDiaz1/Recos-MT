// Visualización de gestor asociado a cada equipo/cuadrante.
(function(){
  function escG(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function gestor(r){return String(r?.gestor_cuadrante||'').trim()||'Sin gestor asignado';}
  function cuadrante(r){return String(r?.cuadrante||'').trim()||'-';}

  function addGestorForm(){
    const grid=document.querySelector('#recoForm .formGrid');
    if(!grid||document.querySelector('#recoForm [name="gestor_cuadrante"]'))return;
    const q=document.querySelector('#recoForm [name="cuadrante"]')?.closest('label');
    const label=document.createElement('label');
    label.innerHTML='GESTOR DEL CUADRANTE<input name="gestor_cuadrante" placeholder="Nombre del gestor">';
    if(q)q.after(label);else grid.appendChild(label);
  }

  function addGestorFilter(){
    const filters=document.querySelector('#catalogo .filters');
    if(!filters||document.getElementById('filterGestor'))return;
    const s=document.createElement('select');s.id='filterGestor';
    filters.appendChild(s);
    s.addEventListener('change',()=>renderRecos());
  }
  function populateGestores(){
    const s=document.getElementById('filterGestor');if(!s)return;
    const current=s.value;
    const gs=[...new Set((state.reconectadores||[]).map(r=>String(r.gestor_cuadrante||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
    s.innerHTML='<option value="">Todos los gestores</option>'+gs.map(g=>`<option value="${escG(g)}">${escG(g)}</option>`).join('');
    if(gs.includes(current))s.value=current;
  }

  function renderCatalogWithGestor(){
    const q=(searchReco.value||'').toLowerCase(),f=filterStatus.value,b=filterBrand.value;
    const fq=document.getElementById('filterQuadrant')?.value||'';
    const fg=document.getElementById('filterGestor')?.value||'';
    const arr=(state.reconectadores||[]).filter(r=>(!f||r.estado===f)&&(!b||r.marca===b)&&(!fq||String(r.cuadrante||'')===fq)&&(!fg||String(r.gestor_cuadrante||'')===fg)&&Object.values(r).join(' ').toLowerCase().includes(q));
    recoGrid.innerHTML=arr.map(r=>{const cls=r.estado==='Con observaciones'?'warnCard':r.estado==='Fuera de servicio'?'dangerCard':'';return `<div class="recoCard ${cls}" onclick="showReco(${r.id})"><span class="eyebrow">${escG(r.alimentador||'-')}</span><div class="recoCode">${escG(r.codigo)}</div>${badge(r.estado)}<div class="metaGrid"><div class="metaBox"><span>Equipo</span><strong>${escG(r.marca||'-')}</strong></div><div class="metaBox"><span>Cuadrante</span><strong>${escG(cuadrante(r))}</strong></div><div class="metaBox"><span>Gestor</span><strong>${escG(gestor(r))}</strong></div><div class="metaBox"><span>Ubicación</span><strong>${escG(r.ubicacion||'-')}</strong></div><div class="metaBox"><span>Sobrecorriente fase</span><strong>${escG(r.sobrecorriente_fase||'-')}</strong></div><div class="metaBox"><span>Sobrecorriente residual</span><strong>${escG(r.sobrecorriente_residual||'-')}</strong></div></div><button class="btn primary">Abrir ficha técnica</button></div>`}).join('')||'<p class="muted">No hay equipos que coincidan con la búsqueda.</p>';
  }

  function enrichDetail(id){
    const r=(state.reconectadores||[]).find(x=>x.id===id);if(!r)return;
    setTimeout(()=>{
      const stats=document.querySelector('#detailContent .detailStats');if(!stats)return;
      const spans=[...stats.querySelectorAll('.stat span')].map(s=>s.textContent.trim().toLowerCase());
      if(!spans.includes('gestor')){
        const d=document.createElement('div');d.className='stat';d.innerHTML=`<span>Gestor</span><strong>${escG(gestor(r))}</strong>`;stats.appendChild(d);
      }
    },0);
  }

  function enrichMap(){
    setTimeout(()=>{
      document.querySelectorAll('#mapList .listRow').forEach(row=>{
        const strong=row.querySelector('strong'),tiny=row.querySelector('.tiny');if(!strong||!tiny)return;
        const codes=strong.textContent.replace(/^\d+ equipos · /,'').split(',').map(x=>x.trim());
        const rs=(state.reconectadores||[]).filter(r=>codes.includes(r.codigo));
        const gs=[...new Set(rs.map(r=>String(r.gestor_cuadrante||'').trim()).filter(Boolean))];
        if(gs.length&&!tiny.textContent.includes('Gestor:'))tiny.textContent+=` · Gestor: ${gs.join(' / ')}`;
      });
      try{
        if(typeof recoMarkerLayer!=='undefined'&&recoMarkerLayer?.eachLayer){
          recoMarkerLayer.eachLayer(layer=>{
            const popup=layer.getPopup?.();if(!popup)return;
            let html=String(popup.getContent?.()||'');if(html.includes('Gestor:'))return;
            const rs=(state.reconectadores||[]).filter(r=>html.includes(r.codigo));
            const gs=[...new Set(rs.map(r=>String(r.gestor_cuadrante||'').trim()).filter(Boolean))];
            if(gs.length){html=html.replace(/(<div[^>]*class=["']mapPopupActions["'][^>]*>)/i,`<div style="margin:6px 0;font-size:12px"><strong>Gestor:</strong> ${escG(gs.join(' / '))}</div>$1`);popup.setContent(html);}
          });
        }
      }catch(_){ }
    },40);
  }

  function enrichGestion(){
    setTimeout(()=>{
      const host=document.getElementById('gestionContent');if(!host)return;
      host.querySelectorAll('tr[data-gq]').forEach(tr=>{
        const q=tr.dataset.gq;const td=tr.querySelector('td');if(!td||td.querySelector('.gestorQ'))return;
        const rs=(state.reconectadores||[]).filter(r=>String(r.cuadrante||'')===q);
        const gs=[...new Set(rs.map(r=>String(r.gestor_cuadrante||'').trim()).filter(Boolean))];
        const sm=document.createElement('small');sm.className='gestorQ';sm.style.cssText='display:block;color:#718096;margin-top:3px;font-weight:600';sm.textContent='Gestor: '+(gs.join(' / ')||'Sin gestor asignado');td.appendChild(sm);
      });
      if(!document.getElementById('gestoresResumen')){
        const qs=[...new Set((state.reconectadores||[]).map(r=>String(r.cuadrante||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
        const panel=document.createElement('div');panel.id='gestoresResumen';panel.className='panel';panel.style.marginTop='16px';
        panel.innerHTML=`<div class="panel-head"><h3>Gestores por cuadrante</h3><span class="muted">Responsables asociados</span></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px">${qs.map(q=>{const rs=(state.reconectadores||[]).filter(r=>String(r.cuadrante||'')===q);const gs=[...new Set(rs.map(r=>String(r.gestor_cuadrante||'').trim()).filter(Boolean))];return `<div style="padding:12px;border:1px solid #e7ebf0;border-radius:10px;background:#f8fafc"><strong>Cuadrante ${escG(q)}</strong><div style="margin-top:4px;color:#526174;font-size:12px">${escG(gs.join(' / ')||'Sin gestor asignado')}</div><small style="color:#788598">${rs.length} equipos</small></div>`;}).join('')}</div>`;
        host.appendChild(panel);
      }
    },80);
  }

  addGestorForm();addGestorFilter();populateGestores();
  window.renderRecos=renderCatalogWithGestor;

  const prevShow=window.showReco;
  window.showReco=function(id){prevShow(id);enrichDetail(id);};

  const prevMap=window.renderMap;
  window.renderMap=function(){prevMap();enrichMap();};

  const prevAll=window.renderAll;
  if(typeof prevAll==='function')window.renderAll=function(){prevAll();addGestorForm();addGestorFilter();populateGestores();try{renderCatalogWithGestor()}catch(_){};if(document.getElementById('gestion')?.classList.contains('active-view'))enrichGestion();};

  document.addEventListener('click',e=>{if(e.target.closest('[data-view="gestion"]'))enrichGestion();});
  const obs=new MutationObserver(()=>{if(document.getElementById('gestion')?.classList.contains('active-view'))enrichGestion();});
  const g=document.getElementById('gestionContent');if(g)obs.observe(g,{childList:true,subtree:true});
  setTimeout(()=>{addGestorForm();addGestorFilter();populateGestores();try{renderCatalogWithGestor()}catch(_){};enrichGestion();},600);
})();

// Carga la biblioteca técnica de Manuales sin alterar la navegación existente.
(function(){
  if(document.querySelector('script[data-manuales-loader]'))return;
  const s=document.createElement('script');s.src='manuales.js?v=41';s.async=false;s.dataset.manualesLoader='1';document.body.appendChild(s);
})();
