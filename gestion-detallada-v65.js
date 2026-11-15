// v65 · Centro de análisis detallado para Gestión MT.
(function(){
  const F={q:'',sub:'',quad:'',manager:'',tech:'',status:'',comm:'',inspection:''};
  let activeTab='equipos';

  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const norm=v=>String(v||'').trim();
  const num=v=>Number(v)||0;
  const pct=(n,d)=>d?Math.round(n*100/d):0;
  const fmt=n=>new Intl.NumberFormat('es-CL',{maximumFractionDigits:2}).format(num(n));
  const comm=v=>{const x=norm(v).toUpperCase();return x==='SI'?'SI':x==='NO'?'NO':'-';};
  const days=date=>{
    if(!date)return Infinity;
    const d=new Date(String(date).slice(0,10)+'T00:00:00');
    return Number.isNaN(d.getTime())?Infinity:Math.floor((Date.now()-d.getTime())/86400000);
  };
  const lastInspections=()=>{
    const m=new Map();
    (state.inspecciones||[]).forEach(i=>{
      if(!i.equipo)return;
      const p=m.get(i.equipo);
      if(!p||String(i.fecha||'')>String(p.fecha||''))m.set(i.equipo,i);
    });
    return m;
  };
  const uniq=(field)=>[...new Set((state.reconectadores||[]).map(r=>norm(r[field])).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es',{numeric:true}));
  const eventsFor=code=>(state.eventos||[]).filter(x=>x.reconectador===code);
  const saidiFor=code=>(state.saidi_fuente||[]).filter(x=>x.equipo_catastro===code);

  function inspectionClass(r,last){
    const i=last.get(r.codigo);
    if(!i)return 'none';
    return days(i.fecha)<=365?'recent':'old';
  }
  function rows(){
    const last=lastInspections();
    return (state.reconectadores||[]).filter(r=>{
      const hay=[r.codigo,r.alimentador,r.ubicacion,r.subestacion,r.cuadrante,r.gestor_cuadrante,r.tecnologia,r.marca].join(' ').toLowerCase();
      return (!F.q||hay.includes(F.q.toLowerCase())) &&
        (!F.sub||norm(r.subestacion)===F.sub) &&
        (!F.quad||norm(r.cuadrante)===F.quad) &&
        (!F.manager||norm(r.gestor_cuadrante)===F.manager) &&
        (!F.tech||norm(r.tecnologia||r.marca)===F.tech) &&
        (!F.status||norm(r.estado)===F.status) &&
        (!F.comm||comm(r.comunicacion_remota)===F.comm) &&
        (!F.inspection||inspectionClass(r,last)===F.inspection);
    });
  }
  function ensureStyles(){
    if(document.getElementById('gestionDetallada65Styles'))return;
    const s=document.createElement('style');s.id='gestionDetallada65Styles';s.textContent=`
      .gd65{margin-top:12px;background:#fff;border:1px solid #dde6ef;border-radius:18px;padding:15px;box-shadow:0 7px 22px rgba(18,40,65,.045)}
      .gd65Head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:11px}.gd65Head h3{font-size:14px;color:#203a54;margin:0}.gd65Head p{font-size:9px;color:#7c8b9d;margin:4px 0 0}.gd65Head .tag{font-size:8px;font-weight:900;padding:6px 9px;border-radius:999px;background:#eaf3ff;color:#225e9b;white-space:nowrap}
      .gd65Filters{display:grid;grid-template-columns:1.5fr repeat(4,1fr);gap:7px;margin-bottom:8px}.gd65Filters.secondary{grid-template-columns:repeat(4,1fr) auto;margin-bottom:11px}.gd65Filters input,.gd65Filters select{height:40px;margin:0;font-size:9px;background:#fbfcfe;border:1px solid #dce4ec;border-radius:9px;padding:0 9px;color:#334a61}.gd65Filters button{height:40px}
      .gd65Kpis{display:grid;grid-template-columns:repeat(6,1fr);gap:7px;margin-bottom:11px}.gd65Kpi{padding:10px;border:1px solid #e4eaf0;border-radius:11px;background:#f9fbfd}.gd65Kpi span{display:block;color:#8492a2;font-size:7px;text-transform:uppercase;font-weight:900}.gd65Kpi strong{display:block;font-size:20px;color:#1e3a55;margin-top:4px}.gd65Kpi small{display:block;font-size:7.5px;color:#8090a0;margin-top:2px}
      .gd65Tabs{display:flex;gap:6px;overflow:auto;padding-bottom:7px}.gd65Tab{border:1px solid #dbe4ed;background:#fff;color:#52677c;border-radius:999px;padding:7px 10px;font-size:8px;font-weight:900;white-space:nowrap;cursor:pointer}.gd65Tab.active{background:#123f69;border-color:#123f69;color:#fff}
      .gd65TableWrap{overflow:auto;border:1px solid #e6ebf0;border-radius:12px}.gd65Table{width:100%;border-collapse:collapse;font-size:8.5px;min-width:880px}.gd65Table th{background:#f3f6f9;color:#687a8d;text-transform:uppercase;font-size:7px;letter-spacing:.04em;padding:8px;text-align:left;position:sticky;top:0}.gd65Table td{padding:8px;border-top:1px solid #edf1f4;color:#526174;vertical-align:middle}.gd65Table tr:hover td{background:#f9fbfd}.gd65Table strong{color:#263f58}.gd65Badge{display:inline-block;padding:4px 6px;border-radius:999px;font-size:7px;font-weight:900}.gd65Badge.ok{background:#e8f6ee;color:#16704f}.gd65Badge.warn{background:#fff2d9;color:#825600}.gd65Badge.danger{background:#fde8e6;color:#a23d35}.gd65Actions{display:flex;gap:5px}.gd65Actions button{border:0;border-radius:7px;padding:6px 8px;font-size:7.5px;font-weight:900;cursor:pointer;white-space:nowrap}.gd65Actions .open{background:#eaf2fb;color:#285f95}.gd65Actions .inspect{background:#1559c9;color:#fff}.gd65Actions .inspect.locked{background:#e8edf2;color:#758292}
      .gd65Foot{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-top:8px;font-size:8px;color:#7a899a}.gd65Foot strong{color:#3b536b}
      body[data-theme="dark"] .gd65{background:#101d2b;border-color:#293c50}body[data-theme="dark"] .gd65Filters input,body[data-theme="dark"] .gd65Filters select,body[data-theme="dark"] .gd65Kpi,body[data-theme="dark"] .gd65Tab{background:#142334;border-color:#2a3e53;color:#dbe8f4}body[data-theme="dark"] .gd65Kpi strong,body[data-theme="dark"] .gd65Head h3,body[data-theme="dark"] .gd65Table strong{color:#eef5fb}body[data-theme="dark"] .gd65Table th{background:#132235;color:#9db0c3}body[data-theme="dark"] .gd65Table td{color:#b9c7d6;border-color:#24394e}
      @media(max-width:1050px){.gd65Filters{grid-template-columns:1fr 1fr 1fr}.gd65Filters.secondary{grid-template-columns:1fr 1fr 1fr}.gd65Kpis{grid-template-columns:repeat(3,1fr)}}@media(max-width:650px){.gd65{padding:11px}.gd65Head{display:block}.gd65Head .tag{display:inline-block;margin-top:7px}.gd65Filters,.gd65Filters.secondary{grid-template-columns:1fr 1fr}.gd65Filters input:first-child{grid-column:1/-1}.gd65Kpis{grid-template-columns:1fr 1fr}.gd65Table{min-width:760px}.gd65Foot{display:block}.gd65Foot span{display:block;margin-top:4px}}
    `;document.head.appendChild(s);
  }
  function statusBadge(s){
    const cls=s==='Operativo'?'ok':s==='Con observaciones'?'warn':'danger';
    return '<span class="gd65Badge '+cls+'">'+esc(s||'-')+'</span>';
  }
  function group(field,rs){
    const m=new Map();
    rs.forEach(r=>{
      const key=norm(r[field]||(field==='tecnologia'?r.marca:'-'))||'Sin registro';
      const a=m.get(key)||{name:key,total:0,oper:0,attention:0,remote:0,inspected:0,events:0,hours:0,saidi:0};
      a.total++;if(r.estado==='Operativo')a.oper++;else a.attention++;
      if(comm(r.comunicacion_remota)==='SI')a.remote++;
      const li=lastInspections().get(r.codigo);if(li&&days(li.fecha)<=365)a.inspected++;
      const ev=eventsFor(r.codigo);a.events+=ev.length;a.hours+=ev.reduce((s,x)=>s+num(x.duracion_h),0);
      a.saidi+=saidiFor(r.codigo).reduce((s,x)=>s+num(x.saidi_reportado??x.saidi_reporte),0);
      m.set(key,a);
    });
    return [...m.values()].sort((a,b)=>b.total-a.total||a.name.localeCompare(b.name,'es',{numeric:true}));
  }
  function equipmentTable(rs){
    const last=lastInspections();
    return '<table class="gd65Table"><thead><tr><th>Equipo</th><th>Subestación</th><th>Alimentador</th><th>Estado</th><th>Gestor</th><th>Últ. inspección</th><th>Eventos</th><th>Horas</th><th>SAIDI</th><th>Acciones</th></tr></thead><tbody>'+
      rs.map(r=>{
        const li=last.get(r.codigo),ev=eventsFor(r.codigo),sf=saidiFor(r.codigo),hours=ev.reduce((s,x)=>s+num(x.duracion_h),0),sa=sf.reduce((s,x)=>s+num(x.saidi_reportado??x.saidi_reporte),0);
        return '<tr><td><strong>'+esc(r.codigo)+'</strong><br><span>'+esc(r.tecnologia||r.marca||'-')+'</span></td><td>'+esc(r.subestacion||'-')+'</td><td>'+esc(r.alimentador||'-')+'</td><td>'+statusBadge(r.estado)+'</td><td>'+esc(r.gestor_cuadrante||'Sin gestor')+'</td><td>'+(li?esc(String(li.fecha).slice(0,10)):'Sin registro')+'</td><td>'+ev.length+'</td><td>'+fmt(hours)+'</td><td>'+fmt(sa)+'</td><td><div class="gd65Actions"><button class="open" data-gd-open="'+r.id+'">Ficha</button><button class="inspect '+(isAdmin()?'':'locked')+'" data-gd-inspect="'+esc(r.codigo)+'">＋ Inspección</button></div></td></tr>';
      }).join('')+'</tbody></table>';
  }
  function groupedTable(rs,field,label){
    const arr=group(field,rs);
    return '<table class="gd65Table"><thead><tr><th>'+label+'</th><th>Equipos</th><th>Operativos</th><th>Atención</th><th>Disponibilidad</th><th>Remota</th><th>Inspección ≤1 año</th><th>Eventos</th><th>Horas</th><th>SAIDI</th></tr></thead><tbody>'+
      arr.map(x=>'<tr><td><strong>'+esc(x.name)+'</strong></td><td>'+x.total+'</td><td>'+x.oper+'</td><td>'+x.attention+'</td><td>'+pct(x.oper,x.total)+'%</td><td>'+pct(x.remote,x.total)+'%</td><td>'+pct(x.inspected,x.total)+'%</td><td>'+x.events+'</td><td>'+fmt(x.hours)+'</td><td>'+fmt(x.saidi)+'</td></tr>').join('')+'</tbody></table>';
  }
  function inspectionsTable(rs){
    const codes=new Set(rs.map(r=>r.codigo));
    const ins=(state.inspecciones||[]).filter(i=>codes.has(i.equipo)).slice().sort((a,b)=>String(b.fecha||'').localeCompare(String(a.fecha||'')));
    const rowMap=new Map(rs.map(r=>[r.codigo,r]));
    return '<table class="gd65Table"><thead><tr><th>Fecha</th><th>Equipo</th><th>Inspector</th><th>Resultado</th><th>Operaciones</th><th>Batería</th><th>Comunicación</th><th>Observaciones</th><th>Acción</th></tr></thead><tbody>'+
      (ins.length?ins.map(i=>{const r=rowMap.get(i.equipo)||{};return '<tr><td><strong>'+esc(i.fecha||'-')+'</strong></td><td>'+esc(i.equipo||'-')+'</td><td>'+esc(i.inspector||'-')+'</td><td>'+esc(i.resultado||'-')+'</td><td>'+esc(i.operaciones??'-')+'</td><td>'+esc(i.tension??'-')+'</td><td>'+esc(i.comunicaciones||'-')+'</td><td>'+esc(i.observaciones||'-')+'</td><td><div class="gd65Actions"><button class="open" data-gd-open="'+(r.id||'')+'">Ficha</button><button class="inspect '+(isAdmin()?'':'locked')+'" data-gd-inspect="'+esc(i.equipo||'')+'">＋ Inspección</button></div></td></tr>';}).join(''):'<tr><td colspan="9">No hay inspecciones para la selección actual.</td></tr>')+'</tbody></table>';
  }
  function table(rs){
    if(activeTab==='subestaciones')return groupedTable(rs,'subestacion','Subestación');
    if(activeTab==='gestores')return groupedTable(rs,'gestor_cuadrante','Gestor');
    if(activeTab==='tecnologia')return groupedTable(rs,'tecnologia','Tecnología');
    if(activeTab==='inspecciones')return inspectionsTable(rs);
    return equipmentTable(rs);
  }
  function bind(panel){
    panel.querySelectorAll('[data-gd-filter]').forEach(el=>el.addEventListener(el.tagName==='INPUT'?'input':'change',()=>{
      F[el.dataset.gdFilter]=el.value;renderBody();
    }));
    panel.querySelectorAll('[data-gd-tab]').forEach(b=>b.addEventListener('click',()=>{activeTab=b.dataset.gdTab;renderBody();}));
    panel.querySelector('#gdClear65')?.addEventListener('click',()=>{Object.keys(F).forEach(k=>F[k]='');render();});
  }
  function bindRows(){
    document.querySelectorAll('[data-gd-open]').forEach(b=>b.addEventListener('click',()=>{const id=Number(b.dataset.gdOpen);if(id)showReco(id);}));
    document.querySelectorAll('[data-gd-inspect]').forEach(b=>b.addEventListener('click',()=>{
      const code=b.dataset.gdInspect;if(!code)return;
      if(!isAdmin()){toast('Activa modo administrador para cargar una inspección');return openAccess();}
      openInspection(code);
    }));
  }
  function renderBody(){
    const panel=document.getElementById('gestionDetallada65');if(!panel)return;
    const rs=rows(),last=lastInspections();
    const oper=rs.filter(r=>r.estado==='Operativo').length;
    const recent=rs.filter(r=>inspectionClass(r,last)==='recent').length;
    const none=rs.filter(r=>inspectionClass(r,last)==='none').length;
    const ev=rs.reduce((s,r)=>s+eventsFor(r.codigo).length,0);
    const hours=rs.reduce((s,r)=>s+eventsFor(r.codigo).reduce((a,x)=>a+num(x.duracion_h),0),0);
    const saidi=rs.reduce((s,r)=>s+saidiFor(r.codigo).reduce((a,x)=>a+num(x.saidi_reportado??x.saidi_reporte),0),0);
    panel.querySelector('#gdKpis65').innerHTML=`
      <div class="gd65Kpi"><span>Equipos visibles</span><strong>${rs.length}</strong><small>según filtros</small></div>
      <div class="gd65Kpi"><span>Disponibilidad</span><strong>${pct(oper,rs.length)}%</strong><small>${oper} operativos</small></div>
      <div class="gd65Kpi"><span>Inspección ≤1 año</span><strong>${pct(recent,rs.length)}%</strong><small>${recent} equipos</small></div>
      <div class="gd65Kpi"><span>Sin inspección</span><strong>${none}</strong><small>equipos pendientes</small></div>
      <div class="gd65Kpi"><span>Eventos / horas</span><strong>${ev}</strong><small>${fmt(hours)} h acumuladas</small></div>
      <div class="gd65Kpi"><span>SAIDI acumulado</span><strong>${fmt(saidi)}</strong><small>h/cliente</small></div>`;
    panel.querySelectorAll('[data-gd-tab]').forEach(b=>b.classList.toggle('active',b.dataset.gdTab===activeTab));
    panel.querySelector('#gdTable65').innerHTML=table(rs);
    panel.querySelector('#gdCount65').textContent=rs.length+' equipos en la selección actual';
    bindRows();
  }
  function render(){
    ensureStyles();
    const host=document.getElementById('gestionContent');if(!host)return;
    document.getElementById('gestionDetallada65')?.remove();
    const panel=document.createElement('section');panel.id='gestionDetallada65';panel.className='gd65';
    panel.innerHTML=`
      <div class="gd65Head"><div><h3>Centro de Análisis Detallado</h3><p>Desglosa la gestión por equipo, responsable, ubicación, tecnología e historial de inspecciones.</p></div><span class="tag">Análisis dinámico</span></div>
      <div class="gd65Filters">
        <input data-gd-filter="q" value="${esc(F.q)}" placeholder="Buscar equipo, alimentador, ubicación...">
        <select data-gd-filter="sub"><option value="">Todas las subestaciones</option>${uniq('subestacion').map(x=>'<option '+(F.sub===x?'selected':'')+'>'+esc(x)+'</option>').join('')}</select>
        <select data-gd-filter="quad"><option value="">Todos los cuadrantes</option>${uniq('cuadrante').map(x=>'<option '+(F.quad===x?'selected':'')+'>'+esc(x)+'</option>').join('')}</select>
        <select data-gd-filter="manager"><option value="">Todos los gestores</option>${uniq('gestor_cuadrante').map(x=>'<option '+(F.manager===x?'selected':'')+'>'+esc(x)+'</option>').join('')}</select>
        <select data-gd-filter="tech"><option value="">Todas las tecnologías</option>${[...new Set((state.reconectadores||[]).map(r=>norm(r.tecnologia||r.marca)).filter(Boolean))].sort().map(x=>'<option '+(F.tech===x?'selected':'')+'>'+esc(x)+'</option>').join('')}</select>
      </div>
      <div class="gd65Filters secondary">
        <select data-gd-filter="status"><option value="">Todos los estados</option><option ${F.status==='Operativo'?'selected':''}>Operativo</option><option ${F.status==='Con observaciones'?'selected':''}>Con observaciones</option><option ${F.status==='Fuera de servicio'?'selected':''}>Fuera de servicio</option></select>
        <select data-gd-filter="comm"><option value="">Toda comunicación</option><option value="SI" ${F.comm==='SI'?'selected':''}>Con comunicación remota</option><option value="NO" ${F.comm==='NO'?'selected':''}>Sin comunicación remota</option></select>
        <select data-gd-filter="inspection"><option value="">Toda condición de inspección</option><option value="recent" ${F.inspection==='recent'?'selected':''}>Inspeccionado ≤ 1 año</option><option value="old" ${F.inspection==='old'?'selected':''}>Inspección > 1 año</option><option value="none" ${F.inspection==='none'?'selected':''}>Sin inspecciones</option></select>
        <span></span><button id="gdClear65" class="btn ghost" type="button">Limpiar filtros</button>
      </div>
      <div id="gdKpis65" class="gd65Kpis"></div>
      <div class="gd65Tabs">
        <button class="gd65Tab" data-gd-tab="equipos">Equipos</button>
        <button class="gd65Tab" data-gd-tab="subestaciones">Subestaciones</button>
        <button class="gd65Tab" data-gd-tab="gestores">Gestores</button>
        <button class="gd65Tab" data-gd-tab="tecnologia">Tecnología</button>
        <button class="gd65Tab" data-gd-tab="inspecciones">Inspecciones</button>
      </div>
      <div id="gdTable65" class="gd65TableWrap"></div>
      <div class="gd65Foot"><strong id="gdCount65"></strong><span>La opción ＋ Inspección abre el formulario con el reconectador seleccionado.</span></div>`;
    host.appendChild(panel);bind(panel);renderBody();
  }

  const prev=window.renderGestionIndustrialV57||window.renderGestion;
  if(typeof prev==='function'){
    const wrapped=function(){prev();setTimeout(render,70);};
    window.renderGestionIndustrialV57=wrapped;window.renderGestion=wrapped;
  }
  window.renderGestionDetalladaV65=render;
  document.addEventListener('click',e=>{if(e.target.closest('[data-view="gestion"]'))setTimeout(render,120);});
  setTimeout(()=>{if(document.getElementById('gestion')?.classList.contains('active-view'))render();},1100);
})();