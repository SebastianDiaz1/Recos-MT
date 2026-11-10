// v57 · Control de Gestión Industrial para Reconectadores MT.
(function(){
  let charts=[];
  const f={quadrant:'',status:'',manager:'',comm:''};

  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function norm(v){return String(v||'').trim();}
  function pct(n,d){return d?Math.round(n*100/d):0;}
  function hasCoords(r){return Number.isFinite(Number(r?.lat))&&Number.isFinite(Number(r?.lon));}
  function comm(v){const s=norm(v).toUpperCase();return s==='SI'?'SI':s==='NO'?'NO':'-';}
  function destroy(){charts.forEach(c=>{try{c.destroy()}catch(_){}});charts=[];}
  function allRows(){return state.reconectadores||[];}
  function rows(){return allRows().filter(r=>
    (!f.quadrant||norm(r.cuadrante)===f.quadrant)&&
    (!f.status||norm(r.estado)===f.status)&&
    (!f.manager||norm(r.gestor_cuadrante)===f.manager)&&
    (!f.comm||comm(r.comunicacion_remota)===f.comm)
  );}
  function quadrants(){return [...new Set(allRows().map(r=>norm(r.cuadrante)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));}
  function managers(){return [...new Set(allRows().map(r=>norm(r.gestor_cuadrante)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));}

  function daysSince(dateStr){
    if(!dateStr)return Infinity;
    const d=new Date(dateStr+'T00:00:00');
    if(Number.isNaN(d.getTime()))return Infinity;
    return Math.floor((Date.now()-d.getTime())/86400000);
  }
  function inspectionMap(){
    const m=new Map();
    (state.inspecciones||[]).forEach(i=>{
      if(!i.equipo)return;
      const prev=m.get(i.equipo);
      if(!prev||String(i.fecha||'')>String(prev.fecha||''))m.set(i.equipo,i);
    });
    return m;
  }
  function priority(r,lastIns){
    let score=0,reasons=[];
    if(r.estado==='Fuera de servicio'){score+=50;reasons.push('fuera de servicio');}
    else if(r.estado==='Con observaciones'){score+=30;reasons.push('con observaciones');}
    if(/bypass/i.test(norm(r.observaciones))){score+=20;reasons.push('BYPASS');}
    if(comm(r.comunicacion_remota)==='NO'){score+=12;reasons.push('sin comunicación remota');}
    if(!r.fecha_verificacion){score+=15;reasons.push('sin fecha de verificación');}
    else if(daysSince(r.fecha_verificacion)>1095){score+=8;reasons.push('verificación >3 años');}
    if(!hasCoords(r)){score+=5;reasons.push('sin georreferencia');}
    if(!lastIns){score+=10;reasons.push('sin inspecciones');}
    else if(daysSince(lastIns.fecha)>365){score+=6;reasons.push('inspección >1 año');}
    return {score,level:score>=45?'Alta':score>=20?'Media':'Baja',reasons};
  }
  function completeness(r){
    const fields=[r.codigo,r.alimentador,r.marca,r.estado,r.ubicacion,r.cuadrante,r.gestor_cuadrante,r.fecha_verificacion,r.sobrecorriente_fase,r.sobrecorriente_residual,r.comunicacion_remota];
    const ok=fields.filter(v=>norm(v)).length+(hasCoords(r)?1:0);
    return Math.round(ok/12*100);
  }
  function monthKey(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');}
  function monthLabel(d){return d.toLocaleDateString('es-CL',{month:'short',year:'2-digit'}).replace('.','');}

  function ensureStyles(){
    if(document.getElementById('gestionIndustrialV57Styles'))return;
    const s=document.createElement('style');s.id='gestionIndustrialV57Styles';s.textContent=`
      #gestion.gestionV57>.sectionTitle{display:none}
      .giHero57{position:relative;overflow:hidden;border-radius:23px;padding:24px 27px;background:linear-gradient(125deg,#071827 0%,#0b3558 55%,#08759b 100%);color:#fff;box-shadow:0 16px 44px rgba(8,35,62,.14);margin-bottom:12px}
      .giHero57:after{content:"";position:absolute;width:390px;height:390px;border-radius:50%;right:-130px;top:-225px;background:radial-gradient(circle,rgba(255,255,255,.13),rgba(255,255,255,0) 68%)}
      .giHeroGrid57{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1.35fr) minmax(320px,.65fr);gap:24px;align-items:center}.giHero57 .eyebrow{color:#90caeb;font-size:9px}.giHero57 h2{font-size:32px;line-height:1.05;letter-spacing:-.04em;color:#fff;margin:7px 0}.giHero57 p{margin:0;max-width:730px;color:#d0e0ec;font-size:11px;line-height:1.55}
      .giHeroScore57{display:grid;grid-template-columns:1fr 1fr;gap:8px}.giHeroMetric57{padding:12px;border-radius:13px;background:rgba(4,18,30,.27);border:1px solid rgba(255,255,255,.09)}.giHeroMetric57 span{display:block;color:#a8c7da;text-transform:uppercase;font-size:7px;letter-spacing:.07em}.giHeroMetric57 strong{display:block;color:#fff;font-size:22px;margin-top:4px}.giHeroMetric57 small{display:block;color:#bed1df;font-size:8px;margin-top:2px}
      .giToolbar57{display:grid;grid-template-columns:repeat(4,minmax(145px,1fr)) auto;gap:8px;background:#fff;border:1px solid #e1e7ee;border-radius:16px;padding:11px;box-shadow:0 7px 22px rgba(15,35,60,.045);margin-bottom:12px}.giToolbar57 select{height:42px;margin:0;font-size:10px;background:#fbfcfe;border-color:#dae2eb}.giToolbar57 .btn{height:42px;font-size:10px;white-space:nowrap}
      .giKpis57{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin-bottom:12px}.giKpi57{position:relative;overflow:hidden;background:#fff;border:1px solid #e1e7ee;border-radius:15px;padding:13px;box-shadow:0 5px 18px rgba(15,35,60,.04)}.giKpi57:after{content:"";position:absolute;width:66px;height:66px;border-radius:50%;right:-30px;top:-30px;background:#f2f6fa}.giKpi57 span,.giKpi57 strong,.giKpi57 small{position:relative;z-index:1}.giKpi57 span{display:block;font-size:7px;color:#7e8b9c;text-transform:uppercase;font-weight:900;letter-spacing:.055em}.giKpi57 strong{display:block;font-size:25px;letter-spacing:-.04em;color:#20364f;margin:5px 0 2px}.giKpi57 small{display:block;font-size:8px;color:#778597;line-height:1.3}.giKpi57.good{border-top:3px solid #1ca36e}.giKpi57.warn{border-top:3px solid #d58b10}.giKpi57.danger{border-top:3px solid #cb483e}.giKpi57.info{border-top:3px solid #397dca}
      .giGrid2_57{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}.giPanel57{background:#fff;border:1px solid #e1e7ee;border-radius:17px;padding:14px;box-shadow:0 6px 20px rgba(15,35,60,.04)}.giPanelHead57{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:10px}.giPanelHead57 h3{margin:0;font-size:12px;color:#233a53}.giPanelHead57 p{font-size:8px;color:#8190a1;margin:3px 0 0}.giPanelHead57 .tag{padding:5px 7px;border-radius:999px;background:#edf4fb;color:#39658e;font-size:8px;font-weight:900}
      .giCanvas57{position:relative;height:260px}.giCanvas57.tall{height:300px}
      .giPriority57{display:flex;flex-direction:column;gap:7px;max-height:315px;overflow:auto}.giPriorityItem57{display:grid;grid-template-columns:48px 1fr auto;gap:9px;align-items:center;padding:9px 10px;border:1px solid #e6ebf0;border-radius:11px;background:#fbfcfd;cursor:pointer}.giPriorityItem57:hover{background:#f6faff;border-color:#c8d8e8}.giScore57{width:42px;height:42px;border-radius:11px;display:grid;place-items:center;font-size:12px;font-weight:900}.giScore57.high{background:#fde9e7;color:#a43a31}.giScore57.medium{background:#fff2da;color:#865900}.giScore57.low{background:#e9f6ef;color:#11714e}.giPriorityItem57 strong{font-size:10px;color:#273d55}.giPriorityItem57 small{display:block;color:#7b899a;font-size:8px;margin-top:2px}.giPriorityLevel57{font-size:8px;font-weight:900;padding:5px 7px;border-radius:999px}.giPriorityLevel57.high{background:#fde9e7;color:#a43a31}.giPriorityLevel57.medium{background:#fff2da;color:#865900}.giPriorityLevel57.low{background:#e9f6ef;color:#11714e}
      .giTableWrap57{overflow:auto}.giTable57{width:100%;border-collapse:collapse;font-size:9px}.giTable57 th,.giTable57 td{padding:8px 7px;border-bottom:1px solid #edf1f4;text-align:left;white-space:nowrap}.giTable57 th{font-size:7px;text-transform:uppercase;color:#7d8b9b;letter-spacing:.04em}.giTable57 tr[data-q57]{cursor:pointer}.giTable57 tr[data-q57]:hover{background:#f7faff}.giBar57{width:80px;height:6px;background:#edf1f5;border-radius:999px;overflow:hidden}.giBar57 i{display:block;height:100%;border-radius:999px;background:#347cc9}
      .giStrategy57{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.giAction57{position:relative;padding:12px;border-radius:13px;border:1px solid #e4e9ef;background:#fafbfd;min-height:118px}.giAction57 b{display:grid;place-items:center;width:27px;height:27px;border-radius:8px;background:#e9f2ff;color:#1559c9;font-size:11px;margin-bottom:8px}.giAction57 strong{display:block;color:#263d55;font-size:9px;line-height:1.3}.giAction57 p{font-size:8px;color:#778596;line-height:1.45;margin:5px 0 0}.giAction57 .state{position:absolute;right:8px;top:8px;font-size:7px;padding:4px 6px;border-radius:999px;background:#eef3f7;color:#647487;font-weight:900}
      .giQuality57{display:flex;flex-direction:column;gap:9px}.giQualityRow57{display:grid;grid-template-columns:120px 1fr 38px;gap:8px;align-items:center}.giQualityRow57 span{font-size:8px;color:#617185}.giQualityTrack57{height:7px;border-radius:999px;background:#edf1f5;overflow:hidden}.giQualityTrack57 i{display:block;height:100%;border-radius:999px;background:#397dc9}.giQualityRow57 strong{text-align:right;font-size:8px;color:#33495f}
      .giInsight57{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.giInsightCard57{padding:11px;border-radius:12px;border:1px solid #e5eaf0;background:#fbfcfd}.giInsightCard57 span{display:block;font-size:7px;text-transform:uppercase;color:#8190a1}.giInsightCard57 strong{display:block;font-size:14px;color:#20364f;margin:4px 0}.giInsightCard57 small{font-size:8px;color:#758395;line-height:1.35}
      .giMethod57{margin-top:12px;padding:11px 13px;border-radius:12px;background:#f1f6fb;border:1px solid #dbe7f2;color:#49627a;font-size:8px;line-height:1.55}.giMethod57 strong{color:#294b6d}
      body[data-theme="dark"] .giToolbar57,body[data-theme="dark"] .giKpi57,body[data-theme="dark"] .giPanel57{background:#101d2b;border-color:#293c4f}body[data-theme="dark"] .giToolbar57 select{background:#0b1725;color:#eef5fb;border-color:#2c4056}body[data-theme="dark"] .giKpi57 strong,body[data-theme="dark"] .giPanelHead57 h3,body[data-theme="dark"] .giPriorityItem57 strong,body[data-theme="dark"] .giAction57 strong,body[data-theme="dark"] .giInsightCard57 strong{color:#eef5fb}body[data-theme="dark"] .giPriorityItem57,body[data-theme="dark"] .giAction57,body[data-theme="dark"] .giInsightCard57{background:#142334;border-color:#293c4f}body[data-theme="dark"] .giMethod57{background:#13263a;border-color:#2a4560;color:#b8c9d9}
      @media(max-width:1150px){.giKpis57{grid-template-columns:repeat(3,1fr)}.giStrategy57{grid-template-columns:repeat(3,1fr)}}
      @media(max-width:800px){.giHeroGrid57{grid-template-columns:1fr}.giToolbar57{grid-template-columns:1fr 1fr}.giGrid2_57{grid-template-columns:1fr}.giStrategy57{grid-template-columns:1fr 1fr}.giInsight57{grid-template-columns:1fr}.giCanvas57{height:240px}}
      @media(max-width:520px){.giHero57{padding:19px 16px;border-radius:18px}.giHero57 h2{font-size:27px}.giHeroScore57{grid-template-columns:1fr 1fr}.giToolbar57{grid-template-columns:1fr}.giKpis57{grid-template-columns:1fr 1fr}.giKpi57{padding:11px}.giStrategy57{grid-template-columns:1fr}.giQualityRow57{grid-template-columns:100px 1fr 34px}.giPriorityItem57{grid-template-columns:42px 1fr}.giPriorityLevel57{display:none}}
    `;document.head.appendChild(s);
  }

  function render(){
    ensureStyles();
    const section=document.getElementById('gestion'),host=document.getElementById('gestionContent');if(!section||!host)return;
    section.classList.add('gestionV57');
    destroy();

    const all=allRows(),rs=rows(),ins=state.inspecciones||[],lastMap=inspectionMap();
    const total=rs.length,oper=rs.filter(r=>r.estado==='Operativo').length,obs=rs.filter(r=>r.estado==='Con observaciones').length,off=rs.filter(r=>r.estado==='Fuera de servicio').length;
    const availability=pct(oper,total);
    const remote=rs.filter(r=>comm(r.comunicacion_remota)==='SI').length;
    const withVerif=rs.filter(r=>r.fecha_verificacion).length;
    const geo=rs.filter(hasCoords).length;
    const inspected=rs.filter(r=>lastMap.has(r.codigo)).length;
    const inspected365=rs.filter(r=>{const i=lastMap.get(r.codigo);return i&&daysSince(i.fecha)<=365;}).length;
    const oldVerif=rs.filter(r=>r.fecha_verificacion&&daysSince(r.fecha_verificacion)>1095).length;
    const noVerif=rs.filter(r=>!r.fecha_verificacion).length;
    const completenessAvg=total?Math.round(rs.reduce((s,r)=>s+completeness(r),0)/total):0;

    const prioritized=rs.map(r=>({r,p:priority(r,lastMap.get(r.codigo))})).sort((a,b)=>b.p.score-a.p.score||String(a.r.codigo).localeCompare(String(b.r.codigo)));
    const high=prioritized.filter(x=>x.p.level==='Alta').length,medium=prioritized.filter(x=>x.p.level==='Media').length,low=prioritized.filter(x=>x.p.level==='Baja').length;
    const backlog=prioritized.filter(x=>x.p.score>=20).length;

    const qs=quadrants(),qSummary=qs.map(q=>{
      const ar=all.filter(r=>norm(r.cuadrante)===q),qLast=inspectionMap();
      const qOper=ar.filter(r=>r.estado==='Operativo').length;
      const qHigh=ar.filter(r=>priority(r,qLast.get(r.codigo)).level==='Alta').length;
      const gs=[...new Set(ar.map(r=>norm(r.gestor_cuadrante)).filter(Boolean))];
      return {q,total:ar.length,oper:qOper,availability:pct(qOper,ar.length),attention:ar.length-qOper,high:qHigh,manager:gs.join(' / ')||'Sin gestor'};
    });

    const months=[];for(let i=5;i>=0;i--){const d=new Date(new Date().getFullYear(),new Date().getMonth()-i,1);months.push({key:monthKey(d),label:monthLabel(d)});}
    const visibleCodes=new Set(rs.map(r=>r.codigo));
    const monthly=months.map(m=>ins.filter(i=>i.fecha&&i.fecha.startsWith(m.key)&&visibleCodes.has(i.equipo)).length);

    const active=[];if(f.quadrant)active.push('Cuadrante '+f.quadrant);if(f.status)active.push(f.status);if(f.manager)active.push(f.manager);if(f.comm)active.push('Remota '+f.comm);
    const managersList=managers();

    host.innerHTML=`
      <section class="giHero57">
        <div class="giHeroGrid57">
          <div><span class="eyebrow">CONTROL DE GESTIÓN · MANTENIMIENTO PREVENTIVO MT</span><h2>Gestión de activos con enfoque de Ingeniería Industrial.</h2><p>Disponibilidad, priorización operacional, cobertura de inspecciones, calidad de información y responsables en una sola vista para apoyar planificación, seguimiento y toma de decisiones.</p></div>
          <div class="giHeroScore57">
            <div class="giHeroMetric57"><span>Disponibilidad</span><strong>${availability}%</strong><small>${oper} de ${total} operativos</small></div>
            <div class="giHeroMetric57"><span>Prioridad alta</span><strong>${high}</strong><small>requieren atención preferente</small></div>
            <div class="giHeroMetric57"><span>Cobertura inspección</span><strong>${pct(inspected,total)}%</strong><small>${inspected} con historial</small></div>
            <div class="giHeroMetric57"><span>Calidad de datos</span><strong>${completenessAvg}%</strong><small>completitud promedio</small></div>
          </div>
        </div>
      </section>

      <div class="giToolbar57">
        <select id="giQ57"><option value="">Todos los cuadrantes</option>${qs.map(q=>'<option value="'+esc(q)+'" '+(f.quadrant===q?'selected':'')+'>Cuadrante '+esc(q)+'</option>').join('')}</select>
        <select id="giStatus57"><option value="">Todos los estados</option>${['Operativo','Con observaciones','Fuera de servicio'].map(s=>'<option '+(f.status===s?'selected':'')+'>'+s+'</option>').join('')}</select>
        <select id="giManager57"><option value="">Todos los gestores</option>${managersList.map(m=>'<option value="'+esc(m)+'" '+(f.manager===m?'selected':'')+'>'+esc(m)+'</option>').join('')}</select>
        <select id="giComm57"><option value="">Toda comunicación</option><option value="SI" ${f.comm==='SI'?'selected':''}>Con comunicación remota</option><option value="NO" ${f.comm==='NO'?'selected':''}>Sin comunicación remota</option></select>
        <button id="giClear57" class="btn ghost" type="button">Limpiar filtros</button>
      </div>

      <div class="giKpis57">
        <div class="giKpi57 info"><span>Equipos en análisis</span><strong>${total}</strong><small>${active.length?active.join(' · '):'Vista general de la flota'}</small></div>
        <div class="giKpi57 good"><span>Disponibilidad operacional</span><strong>${availability}%</strong><small>${oper} operativos · ${obs+off} con atención</small></div>
        <div class="giKpi57 danger"><span>Backlog priorizado</span><strong>${backlog}</strong><small>${high} alta · ${medium} media</small></div>
        <div class="giKpi57 info"><span>Comunicación remota</span><strong>${pct(remote,total)}%</strong><small>${remote} de ${total} con comunicación</small></div>
        <div class="giKpi57 warn"><span>Cobertura inspección</span><strong>${pct(inspected,total)}%</strong><small>${inspected365} inspeccionados ≤ 1 año</small></div>
        <div class="giKpi57 info"><span>Completitud de información</span><strong>${completenessAvg}%</strong><small>${geo} georreferenciados · ${withVerif} con verificación</small></div>
      </div>

      <div class="giGrid2_57">
        <section class="giPanel57"><div class="giPanelHead57"><div><h3>Estado operacional de la flota</h3><p>Disponibilidad y condición actual</p></div><span class="tag">${availability}% disponible</span></div><div class="giCanvas57"><canvas id="giStatusChart57"></canvas></div></section>
        <section class="giPanel57"><div class="giPanelHead57"><div><h3>Índice de Prioridad Operacional</h3><p>Priorización referencial para orientar mantenimiento y seguimiento</p></div><span class="tag">${backlog} en backlog</span></div><div class="giCanvas57"><canvas id="giPriorityChart57"></canvas></div></section>
      </div>

      <div class="giGrid2_57">
        <section class="giPanel57"><div class="giPanelHead57"><div><h3>Actividad de inspecciones</h3><p>Últimos 6 meses · equipos visibles</p></div><span class="tag">${inspected} con historial</span></div><div class="giCanvas57"><canvas id="giInspectionChart57"></canvas></div></section>
        <section class="giPanel57"><div class="giPanelHead57"><div><h3>Priorización de intervención</h3><p>Ranking automático según condición y brechas de gestión</p></div><span class="tag">Top ${Math.min(10,prioritized.length)}</span></div>
          <div class="giPriority57">${prioritized.slice(0,10).map(x=>`<div class="giPriorityItem57" data-open57="${x.r.id}"><div class="giScore57 ${x.p.level==='Alta'?'high':x.p.level==='Media'?'medium':'low'}">${x.p.score}</div><div><strong>${esc(x.r.codigo)} · ${esc(x.r.alimentador||'-')}</strong><small>${esc(x.p.reasons.slice(0,3).join(' · ')||'Sin brechas relevantes')}</small></div><span class="giPriorityLevel57 ${x.p.level==='Alta'?'high':x.p.level==='Media'?'medium':'low'}">${x.p.level}</span></div>`).join('')}</div>
        </section>
      </div>

      <div class="giGrid2_57">
        <section class="giPanel57"><div class="giPanelHead57"><div><h3>Desempeño por cuadrante</h3><p>Responsable, disponibilidad y carga de atención</p></div><span class="tag">${qs.length} cuadrantes</span></div>
          <div class="giTableWrap57"><table class="giTable57"><thead><tr><th>Cuadrante</th><th>Gestor</th><th>Total</th><th>Oper.</th><th>Atención</th><th>Prioridad alta</th><th>Disponibilidad</th></tr></thead><tbody>${qSummary.map(x=>`<tr data-q57="${esc(x.q)}"><td><strong>Q${esc(x.q)}</strong></td><td>${esc(x.manager)}</td><td>${x.total}</td><td>${x.oper}</td><td>${x.attention}</td><td>${x.high}</td><td><div style="display:flex;align-items:center;gap:6px"><div class="giBar57"><i style="width:${x.availability}%"></i></div><strong>${x.availability}%</strong></div></td></tr>`).join('')}</tbody></table></div>
        </section>
        <section class="giPanel57"><div class="giPanelHead57"><div><h3>Calidad y trazabilidad de información</h3><p>Soporte para control de gestión y planificación preventiva</p></div><span class="tag">${completenessAvg}% promedio</span></div>
          <div class="giQuality57">
            <div class="giQualityRow57"><span>Georreferenciación</span><div class="giQualityTrack57"><i style="width:${pct(geo,total)}%"></i></div><strong>${pct(geo,total)}%</strong></div>
            <div class="giQualityRow57"><span>Fecha verificación</span><div class="giQualityTrack57"><i style="width:${pct(withVerif,total)}%"></i></div><strong>${pct(withVerif,total)}%</strong></div>
            <div class="giQualityRow57"><span>Historial inspección</span><div class="giQualityTrack57"><i style="width:${pct(inspected,total)}%"></i></div><strong>${pct(inspected,total)}%</strong></div>
            <div class="giQualityRow57"><span>Comunicación remota</span><div class="giQualityTrack57"><i style="width:${pct(remote,total)}%"></i></div><strong>${pct(remote,total)}%</strong></div>
            <div class="giQualityRow57"><span>Datos completos</span><div class="giQualityTrack57"><i style="width:${completenessAvg}%"></i></div><strong>${completenessAvg}%</strong></div>
          </div>
          <div class="giInsight57" style="margin-top:13px">
            <div class="giInsightCard57"><span>Sin verificación</span><strong>${noVerif}</strong><small>Registros que requieren completar fecha.</small></div>
            <div class="giInsightCard57"><span>Verificación > 3 años</span><strong>${oldVerif}</strong><small>Antigüedad documental a revisar.</small></div>
            <div class="giInsightCard57"><span>Sin inspección</span><strong>${total-inspected}</strong><small>Sin historial registrado en la app.</small></div>
          </div>
        </section>
      </div>

      <section class="giPanel57" style="margin-bottom:12px"><div class="giPanelHead57"><div><h3>Líneas de acción de la propuesta de mejora</h3><p>Continuidad con el Proyecto de Título · gestión del mantenimiento preventivo de reconectadores MT</p></div><span class="tag">Plan de mejora</span></div>
        <div class="giStrategy57">
          <div class="giAction57"><span class="state">Base</span><b>1</b><strong>Catastro actualizado</strong><p>Mantener la base maestra, estados, ubicación, responsable y parámetros técnicos trazables.</p></div>
          <div class="giAction57"><span class="state">Priorizar</span><b>2</b><strong>Matriz de criticidad</strong><p>Orientar recursos según condición, impacto operacional y necesidades de intervención.</p></div>
          <div class="giAction57"><span class="state">Planificar</span><b>3</b><strong>Programa de inspecciones</strong><p>Definir frecuencia, responsables, rutas y seguimiento de cumplimiento preventivo.</p></div>
          <div class="giAction57"><span class="state">Digitalizar</span><b>4</b><strong>Herramienta PC / celular</strong><p>Centralizar información y facilitar consulta, registro y control en terreno.</p></div>
          <div class="giAction57"><span class="state">Fortalecer</span><b>5</b><strong>Competencias internas</strong><p>Desarrollar capacidades locales y reducir dependencia de apoyo externo.</p></div>
        </div>
      </section>

      <section class="giPanel57"><div class="giPanelHead57"><div><h3>Lectura ejecutiva para toma de decisiones</h3><p>Indicadores sintetizados para seguimiento del mantenimiento</p></div></div>
        <div class="giInsight57">
          <div class="giInsightCard57"><span>Condición operacional</span><strong>${obs+off} equipos</strong><small>Presentan observaciones o están fuera de servicio y requieren seguimiento.</small></div>
          <div class="giInsightCard57"><span>Brecha preventiva</span><strong>${total-inspected} equipos</strong><small>No cuentan con historial de inspección registrado en la plataforma.</small></div>
          <div class="giInsightCard57"><span>Brecha de comunicación</span><strong>${total-remote} equipos</strong><small>No registran comunicación remota disponible.</small></div>
        </div>
        <div class="giMethod57"><strong>Índice de Prioridad Operacional:</strong> indicador referencial calculado automáticamente con los datos disponibles en la aplicación. Considera estado del equipo, BYPASS informado, comunicación remota, existencia/antigüedad de verificación, georreferencia e historial de inspecciones. No reemplaza la matriz formal de criticidad definida en la propuesta del Proyecto de Título; sirve como apoyo visual para priorizar revisión y gestión.</div>
      </section>`;

    document.getElementById('giQ57')?.addEventListener('change',e=>{f.quadrant=e.target.value;render();});
    document.getElementById('giStatus57')?.addEventListener('change',e=>{f.status=e.target.value;render();});
    document.getElementById('giManager57')?.addEventListener('change',e=>{f.manager=e.target.value;render();});
    document.getElementById('giComm57')?.addEventListener('change',e=>{f.comm=e.target.value;render();});
    document.getElementById('giClear57')?.addEventListener('click',()=>{f.quadrant='';f.status='';f.manager='';f.comm='';render();});
    host.querySelectorAll('[data-open57]').forEach(el=>el.addEventListener('click',()=>showReco(Number(el.dataset.open57))));
    host.querySelectorAll('[data-q57]').forEach(el=>el.addEventListener('click',()=>{f.quadrant=el.dataset.q57;render();}));

    if(typeof Chart==='undefined')return;
    Chart.defaults.font.family='Inter, Segoe UI, Arial, sans-serif';Chart.defaults.color='#66758a';

    charts.push(new Chart(document.getElementById('giStatusChart57'),{
      type:'doughnut',data:{labels:['Operativo','Con observaciones','Fuera de servicio'],datasets:[{data:[oper,obs,off],backgroundColor:['#15966a','#d99012','#d4483e'],borderWidth:0,hoverOffset:7}]},
      options:{responsive:true,maintainAspectRatio:false,cutout:'68%',plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:10}}}},onClick:(evt,e)=>{if(!e.length)return;f.status=['Operativo','Con observaciones','Fuera de servicio'][e[0].index];render();}}
    }));
    charts.push(new Chart(document.getElementById('giPriorityChart57'),{
      type:'bar',data:{labels:['Alta','Media','Baja'],datasets:[{data:[high,medium,low],backgroundColor:['#d4483e','#d99012','#15966a'],borderRadius:8}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{precision:0},grid:{color:'#eef1f5'}},x:{grid:{display:false}}}}
    }));
    charts.push(new Chart(document.getElementById('giInspectionChart57'),{
      type:'line',data:{labels:months.map(m=>m.label),datasets:[{label:'Inspecciones',data:monthly,borderColor:'#1767b3',backgroundColor:'rgba(23,103,179,.12)',fill:true,tension:.35,pointRadius:4,pointHoverRadius:6}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{precision:0},grid:{color:'#eef1f5'}},x:{grid:{display:false}}}}
    }));
  }

  window.renderGestionIndustrialV57=render;
  window.renderGestion=render;
  ensureStyles();
  document.addEventListener('click',e=>{if(e.target.closest('[data-view="gestion"]'))setTimeout(render,70);});
  setTimeout(()=>{if(document.getElementById('gestionContent'))render();},1050);
})();