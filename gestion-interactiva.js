// Gestión interactiva: gráficos, filtros y exploración de datos.
(function(){
  let charts=[];
  const filters={quadrant:'',status:''};

  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function hasCoords(r){return Number.isFinite(Number(r?.lat))&&Number.isFinite(Number(r?.lon));}
  function pct(n,d){return d?Math.round(n*100/d):0;}
  function destroyCharts(){charts.forEach(c=>{try{c.destroy()}catch(_){}});charts=[];}
  function baseRows(){return state.reconectadores||[];}
  function filteredRows(){return baseRows().filter(r=>(!filters.quadrant||String(r.cuadrante||'')===filters.quadrant)&&(!filters.status||r.estado===filters.status));}
  function quadrants(){return [...new Set(baseRows().map(r=>String(r.cuadrante||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));}
  function monthKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;}
  function monthLabel(d){return d.toLocaleDateString('es-CL',{month:'short',year:'2-digit'}).replace('.','');}

  function ensureStyles(){
    if(document.getElementById('gestionInteractiveStyles'))return;
    const s=document.createElement('style');s.id='gestionInteractiveStyles';s.textContent=`
      .gToolbar{display:flex;gap:10px;align-items:end;flex-wrap:wrap;margin-bottom:16px;padding:14px;background:linear-gradient(135deg,#0f2745,#173a64);border-radius:14px;color:#fff;box-shadow:0 8px 22px rgba(15,39,69,.16)}
      .gToolbar label{display:flex;flex-direction:column;gap:5px;font-size:11px;font-weight:800}.gToolbar select{min-width:190px;padding:10px 12px;border:0;border-radius:9px;background:#fff;color:#1c2b3e}.gToolbar .gClear{margin-left:auto}
      .gActiveFilter{font-size:11px;font-weight:800;padding:8px 10px;background:rgba(255,255,255,.12);border-radius:9px}
      .gKpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:16px}.gKpi{position:relative;overflow:hidden;background:#fff;border:1px solid #e1e6ec;border-radius:14px;padding:16px;box-shadow:0 3px 11px rgba(16,34,58,.05)}.gKpi:after{content:'';position:absolute;right:-28px;top:-28px;width:82px;height:82px;border-radius:50%;background:#eef4fb}.gKpi span{display:block;font-size:10px;font-weight:900;color:#778397;text-transform:uppercase;letter-spacing:.05em}.gKpi strong{display:block;font-size:30px;color:#17253a;margin:6px 0}.gKpi small{color:#6f7b8d;font-size:11px}
      .gChartGrid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}.gChartCard{background:#fff;border:1px solid #e1e6ec;border-radius:14px;padding:15px;box-shadow:0 3px 11px rgba(16,34,58,.05);min-height:330px}.gChartCard.wide{grid-column:1/-1;min-height:350px}.gChartHead{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:8px}.gChartHead h3{margin:0}.gChartHead small{color:#788598}.gCanvasWrap{position:relative;height:270px}.gChartCard.wide .gCanvasWrap{height:285px}
      .gBottomGrid{display:grid;grid-template-columns:1.05fr .95fr;gap:16px}.gTable{width:100%;border-collapse:collapse;font-size:12px}.gTable th,.gTable td{padding:9px 8px;border-bottom:1px solid #edf1f5;text-align:left}.gTable th{font-size:10px;color:#798597;text-transform:uppercase}.gTable tr.clickable{cursor:pointer}.gTable tr.clickable:hover{background:#f7f9fc}.gPending{display:flex;flex-direction:column;gap:8px;max-height:420px;overflow:auto}.gPendingItem{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px;background:#f8fafc;border:1px solid #e8edf2;border-radius:10px}.gPendingItem small{display:block;color:#728095;margin-top:2px}.gPendingItem button{border:0;background:none;color:#1559c9;font-weight:800;cursor:pointer}
      .gHint{font-size:11px;color:#788598;margin:0 0 8px}
      @media(max-width:900px){.gKpis{grid-template-columns:repeat(2,minmax(0,1fr))}.gChartGrid,.gBottomGrid{grid-template-columns:1fr}.gChartCard.wide{grid-column:auto}.gToolbar .gClear{margin-left:0}}
      @media(max-width:520px){.gKpis{grid-template-columns:1fr 1fr}.gKpi{padding:12px}.gKpi strong{font-size:24px}.gToolbar select{min-width:100%;width:100%}.gToolbar label{width:100%}.gCanvasWrap{height:245px}}
    `;document.head.appendChild(s);
  }

  function ensureUI(){
    ensureStyles();
    const host=document.getElementById('gestionContent');
    if(!host)return null;
    return host;
  }

  function renderGestionInteractiva(){
    const host=ensureUI();if(!host)return;
    const all=baseRows(),rows=filteredRows(),ins=state.inspecciones||[];
    const total=rows.length,oper=rows.filter(r=>r.estado==='Operativo').length,obs=rows.filter(r=>r.estado==='Con observaciones').length,fuera=rows.filter(r=>r.estado==='Fuera de servicio').length;
    const geo=rows.filter(hasCoords).length,verif=rows.filter(r=>r.fecha_verificacion).length;
    const qs=quadrants();
    const now=new Date();
    const monthIns=ins.filter(i=>{if(!i.fecha)return false;const d=new Date(i.fecha+'T00:00:00');return d.getFullYear()===now.getFullYear()&&d.getMonth()===now.getMonth()&&rows.some(r=>r.codigo===i.equipo);}).length;

    const qSummary=qs.map(q=>{const arr=all.filter(r=>String(r.cuadrante||'')===q);return {q,total:arr.length,oper:arr.filter(r=>r.estado==='Operativo').length,attention:arr.filter(r=>r.estado!=='Operativo').length};});
    const pending=rows.filter(r=>r.estado!=='Operativo'||!r.fecha_verificacion||!hasCoords(r)).sort((a,b)=>{
      const rank=x=>x.estado==='Fuera de servicio'?0:x.estado==='Con observaciones'?1:!x.fecha_verificacion?2:3;
      return rank(a)-rank(b)||String(a.codigo).localeCompare(String(b.codigo));
    });

    const brandMap=new Map();rows.forEach(r=>{const b=String(r.marca||'Por registrar').trim()||'Por registrar';brandMap.set(b,(brandMap.get(b)||0)+1);});
    const brandData=[...brandMap.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10);

    const months=[];for(let i=5;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);months.push({key:monthKey(d),label:monthLabel(d)});}
    const inspectedCodes=new Set(rows.map(r=>r.codigo));
    const monthly=months.map(m=>ins.filter(i=>i.fecha&&i.fecha.startsWith(m.key)&&inspectedCodes.has(i.equipo)).length);

    const active=[];if(filters.quadrant)active.push(`Cuadrante ${filters.quadrant}`);if(filters.status)active.push(filters.status);
    destroyCharts();
    host.innerHTML=`
      <div class="gToolbar">
        <label>Cuadrante<select id="gQuadrant"><option value="">Todos los cuadrantes</option>${qs.map(q=>`<option value="${esc(q)}" ${filters.quadrant===q?'selected':''}>Cuadrante ${esc(q)}</option>`).join('')}</select></label>
        <label>Estado<select id="gStatus"><option value="">Todos los estados</option>${['Operativo','Con observaciones','Fuera de servicio'].map(s=>`<option ${filters.status===s?'selected':''}>${s}</option>`).join('')}</select></label>
        <div class="gActiveFilter">${active.length?'Filtro activo: '+active.join(' · '):'Vista general de la flota'}</div>
        <button id="gClear" class="btn ghost-light gClear" type="button">Limpiar filtros</button>
      </div>
      <div class="gKpis">
        <div class="gKpi"><span>Equipos en vista</span><strong>${total}</strong><small>${filters.quadrant||filters.status?'Resultado filtrado':'Base completa'}</small></div>
        <div class="gKpi"><span>Disponibilidad operativa</span><strong>${pct(oper,total)}%</strong><small>${oper} operativos</small></div>
        <div class="gKpi"><span>Requieren atención</span><strong>${obs+fuera}</strong><small>${obs} observados · ${fuera} fuera</small></div>
        <div class="gKpi"><span>Georreferenciación</span><strong>${pct(geo,total)}%</strong><small>${geo} con coordenadas</small></div>
        <div class="gKpi"><span>Fecha verificación</span><strong>${pct(verif,total)}%</strong><small>${verif} con fecha registrada</small></div>
        <div class="gKpi"><span>Inspecciones del mes</span><strong>${monthIns}</strong><small>Sobre los equipos visibles</small></div>
        <div class="gKpi"><span>Observaciones</span><strong>${obs}</strong><small>Estado actual</small></div>
        <div class="gKpi"><span>Fuera de servicio</span><strong>${fuera}</strong><small>Atención prioritaria</small></div>
      </div>
      <div class="gChartGrid">
        <div class="gChartCard"><div class="gChartHead"><div><h3>Estado de la flota</h3><small>Toca un segmento para filtrar</small></div></div><div class="gCanvasWrap"><canvas id="gStatusChart"></canvas></div></div>
        <div class="gChartCard"><div class="gChartHead"><div><h3>Equipos por cuadrante</h3><small>Toca una barra para abrir ese cuadrante</small></div></div><div class="gCanvasWrap"><canvas id="gQuadrantChart"></canvas></div></div>
        <div class="gChartCard wide"><div class="gChartHead"><div><h3>Actividad de inspecciones</h3><small>Últimos 6 meses · según equipos visibles</small></div></div><div class="gCanvasWrap"><canvas id="gInspectionChart"></canvas></div></div>
        <div class="gChartCard"><div class="gChartHead"><div><h3>Equipos por referencia</h3><small>Distribución del filtro actual</small></div></div><div class="gCanvasWrap"><canvas id="gBrandChart"></canvas></div></div>
        <div class="gChartCard"><div class="gChartHead"><div><h3>Calidad de información</h3><small>Completitud de datos principales</small></div></div><div class="gCanvasWrap"><canvas id="gDataChart"></canvas></div></div>
      </div>
      <div class="gBottomGrid">
        <div class="panel"><div class="panel-head"><h3>Resumen por cuadrante</h3><span class="muted">Haz clic en una fila para filtrar</span></div><div style="overflow:auto"><table class="gTable"><thead><tr><th>Cuadrante</th><th>Total</th><th>Operativos</th><th>Atención</th><th>Disp.</th></tr></thead><tbody>${qSummary.map(x=>`<tr class="clickable" data-gq="${esc(x.q)}"><td><strong>Cuadrante ${esc(x.q)}</strong></td><td>${x.total}</td><td>${x.oper}</td><td>${x.attention}</td><td>${pct(x.oper,x.total)}%</td></tr>`).join('')}</tbody></table></div></div>
        <div class="panel"><div class="panel-head"><h3>Pendientes de gestión</h3><span class="muted">${pending.length} detectados en la vista</span></div><p class="gHint">Prioriza fuera de servicio, observaciones y registros incompletos.</p><div class="gPending">${pending.length?pending.slice(0,30).map(r=>{const why=r.estado!=='Operativo'?r.estado:!r.fecha_verificacion?'Sin fecha de verificación':'Sin coordenadas';return `<div class="gPendingItem"><div><strong>${esc(r.codigo)}</strong><small>${esc(r.alimentador||'-')} · ${esc(why)}</small></div><button type="button" data-open-reco="${r.id}">Abrir ficha</button></div>`;}).join(''):'<p class="muted">No hay pendientes para este filtro.</p>'}</div></div>
      </div>`;

    document.getElementById('gQuadrant').addEventListener('change',e=>{filters.quadrant=e.target.value;renderGestionInteractiva();});
    document.getElementById('gStatus').addEventListener('change',e=>{filters.status=e.target.value;renderGestionInteractiva();});
    document.getElementById('gClear').addEventListener('click',()=>{filters.quadrant='';filters.status='';renderGestionInteractiva();});
    host.querySelectorAll('[data-gq]').forEach(tr=>tr.addEventListener('click',()=>{filters.quadrant=tr.dataset.gq;renderGestionInteractiva();}));
    host.querySelectorAll('[data-open-reco]').forEach(b=>b.addEventListener('click',()=>showReco(Number(b.dataset.openReco))));

    if(typeof Chart==='undefined'){
      host.querySelectorAll('.gCanvasWrap').forEach(x=>x.innerHTML='<p class="muted">No se pudo cargar el gráfico. Vuelve a abrir la app.</p>');
      return;
    }
    Chart.defaults.font.family='Inter, Segoe UI, Arial, sans-serif';
    Chart.defaults.color='#657286';

    const statusChart=new Chart(document.getElementById('gStatusChart'),{type:'doughnut',data:{labels:['Operativo','Con observaciones','Fuera de servicio'],datasets:[{data:[oper,obs,fuera],backgroundColor:['#15966a','#d99012','#d4483e'],borderWidth:0,hoverOffset:8}]},options:{responsive:true,maintainAspectRatio:false,cutout:'66%',plugins:{legend:{position:'bottom'}},onClick:(evt,elements)=>{if(!elements.length)return;filters.status=['Operativo','Con observaciones','Fuera de servicio'][elements[0].index];renderGestionInteractiva();}}});charts.push(statusChart);

    const qLabels=qSummary.map(x=>'Q'+x.q),qTotals=qSummary.map(x=>x.total);
    const quadrantChart=new Chart(document.getElementById('gQuadrantChart'),{type:'bar',data:{labels:qLabels,datasets:[{label:'Equipos',data:qTotals,backgroundColor:'#2c73c9',borderRadius:7}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{precision:0},grid:{color:'#eef1f5'}},x:{grid:{display:false}}},onClick:(evt,elements)=>{if(!elements.length)return;filters.quadrant=qSummary[elements[0].index].q;renderGestionInteractiva();}}});charts.push(quadrantChart);

    const inspectionChart=new Chart(document.getElementById('gInspectionChart'),{type:'line',data:{labels:months.map(m=>m.label),datasets:[{label:'Inspecciones',data:monthly,borderColor:'#1767b3',backgroundColor:'rgba(23,103,179,.12)',fill:true,tension:.35,pointRadius:5,pointHoverRadius:7}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{precision:0},grid:{color:'#eef1f5'}},x:{grid:{display:false}}}}});charts.push(inspectionChart);

    const brandChart=new Chart(document.getElementById('gBrandChart'),{type:'bar',data:{labels:brandData.map(x=>x[0]),datasets:[{label:'Equipos',data:brandData.map(x=>x[1]),backgroundColor:'#6557c9',borderRadius:7}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,ticks:{precision:0},grid:{color:'#eef1f5'}},y:{grid:{display:false}}}}});charts.push(brandChart);

    const withQuadrant=rows.filter(r=>String(r.cuadrante||'').trim()).length;
    const dataChart=new Chart(document.getElementById('gDataChart'),{type:'radar',data:{labels:['Coordenadas','Fecha verificación','Cuadrante','Estado','Equipo'],datasets:[{label:'Completitud %',data:[pct(geo,total),pct(verif,total),pct(withQuadrant,total),pct(rows.filter(r=>r.estado).length,total),pct(rows.filter(r=>r.marca).length,total)],backgroundColor:'rgba(21,89,201,.12)',borderColor:'#1559c9',pointBackgroundColor:'#1559c9'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{r:{beginAtZero:true,max:100,ticks:{display:false},grid:{color:'#e8edf3'},angleLines:{color:'#e8edf3'}}}}});charts.push(dataChart);
  }

  window.renderGestion=renderGestionInteractiva;
  document.addEventListener('click',e=>{if(e.target.closest('[data-view="gestion"]'))setTimeout(renderGestionInteractiva,80);});
  setTimeout(()=>{if(document.getElementById('gestionContent'))renderGestionInteractiva();},900);
})();