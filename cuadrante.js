// Soporte de cuadrantes para Reconectadores MT
(function(){
  function addQuadrantUI(){
    const formGrid=document.querySelector('#recoForm .formGrid');
    if(formGrid && !document.querySelector('#recoForm [name="cuadrante"]')){
      const estado=document.querySelector('#recoForm [name="estado"]')?.closest('label');
      const label=document.createElement('label');
      label.innerHTML='CUADRANTE<input name="cuadrante" inputmode="numeric" placeholder="Ej: 4">';
      if(estado) estado.after(label); else formGrid.appendChild(label);
    }

    const filters=document.querySelector('#catalogo .filters');
    if(filters && !document.getElementById('filterQuadrant')){
      const select=document.createElement('select');
      select.id='filterQuadrant';
      select.innerHTML='<option value="">Todos los cuadrantes</option>';
      filters.appendChild(select);
      select.addEventListener('change',()=>renderRecos());
    }

    const search=document.getElementById('searchReco');
    if(search) search.placeholder='Buscar alimentador, equipo, ubicación, cuadrante...';
  }

  function populateQuadrants(){
    const select=document.getElementById('filterQuadrant');
    if(!select)return;
    const current=select.value;
    const qs=[...new Set((state.reconectadores||[]).map(r=>String(r.cuadrante||'').trim()).filter(Boolean))]
      .sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
    select.innerHTML='<option value="">Todos los cuadrantes</option>'+qs.map(q=>`<option value="${escMap(q)}">Cuadrante ${escMap(q)}</option>`).join('');
    if(qs.includes(current))select.value=current;
  }

  addQuadrantUI();

  const baseRenderRecos=window.renderRecos;
  window.renderRecos=function(){
    let q=(searchReco.value||'').toLowerCase(),f=filterStatus.value,b=filterBrand.value;
    const fq=document.getElementById('filterQuadrant')?.value||'';
    let arr=state.reconectadores.filter(r=>(!f||r.estado===f)&&(!b||r.marca===b)&&(!fq||String(r.cuadrante||'')===fq)&&Object.values(r).join(' ').toLowerCase().includes(q));
    recoGrid.innerHTML=arr.map(r=>{let cls=r.estado==='Con observaciones'?'warnCard':r.estado==='Fuera de servicio'?'dangerCard':'';return `<div class="recoCard ${cls}" onclick="showReco(${r.id})"><span class="eyebrow">${r.alimentador||'-'}</span><div class="recoCode">${r.codigo}</div>${badge(r.estado)}<div class="metaGrid"><div class="metaBox"><span>Equipo</span><strong>${r.marca||'-'}</strong></div><div class="metaBox"><span>Cuadrante</span><strong>${r.cuadrante||'-'}</strong></div><div class="metaBox"><span>Ubicación</span><strong>${r.ubicacion||'-'}</strong></div><div class="metaBox"><span>Sobrecorriente fase</span><strong>${r.sobrecorriente_fase||'-'}</strong></div><div class="metaBox"><span>Sobrecorriente residual</span><strong>${r.sobrecorriente_residual||'-'}</strong></div></div><button class="btn primary">Abrir ficha técnica</button></div>`}).join('')||`<p class="muted">No hay equipos que coincidan con la búsqueda.</p>`;
  };

  const baseShowReco=window.showReco;
  window.showReco=function(id){
    baseShowReco(id);
    const r=state.reconectadores.find(x=>x.id===id);
    if(!r)return;
    setTimeout(()=>{
      const stats=document.querySelector('#detailContent .detailStats');
      if(stats && ![...stats.querySelectorAll('.stat span')].some(s=>s.textContent.trim().toLowerCase()==='cuadrante')){
        const div=document.createElement('div');
        div.className='stat';
        div.innerHTML=`<span>Cuadrante</span><strong>${escMap(r.cuadrante||'-')}</strong>`;
        stats.appendChild(div);
      }
    },0);
  };

  const baseRenderMap=window.renderMap;
  window.renderMap=function(){
    baseRenderMap();
    setTimeout(()=>{
      document.querySelectorAll('#mapList .listRow').forEach(row=>{
        const strong=row.querySelector('strong');
        if(!strong)return;
        const codes=strong.textContent.replace(/^\d+ equipos · /,'').split(',').map(x=>x.trim());
        const rs=(state.reconectadores||[]).filter(r=>codes.includes(r.codigo));
        const qs=[...new Set(rs.map(r=>r.cuadrante).filter(Boolean))];
        const tiny=row.querySelector('.tiny');
        if(tiny&&qs.length&&!tiny.textContent.includes('Cuadrante'))tiny.textContent+=` · Cuadrante ${qs.join('/')}`;
      });
    },20);
  };

  if(typeof renderAll==='function'){
    const baseRenderAll=window.renderAll;
    window.renderAll=function(){baseRenderAll();addQuadrantUI();populateQuadrants();};
  }

  setTimeout(()=>{addQuadrantUI();populateQuadrants();try{renderRecos()}catch(_){}},400);
})();
