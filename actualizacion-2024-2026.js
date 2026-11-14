// v63 · Visualización de actualización Catastro MT 2024–2026 + SAIDI.
(function(){
  let histChart=null,causaChart=null;
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const n=v=>Number(v)||0;
  const fmt=v=>new Intl.NumberFormat('es-CL',{maximumFractionDigits:2}).format(n(v));
  const dateTime=v=>{
    if(!v)return '-';
    const d=new Date(String(v).replace(' ','T'));
    if(Number.isNaN(d.getTime()))return String(v);
    return d.toLocaleString('es-CL',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
  };
  function ensureStyles(){
    if(document.getElementById('updateV63Styles'))return;
    const s=document.createElement('style');s.id='updateV63Styles';s.textContent=`
      .updStrip63{margin:12px 0 0;padding:13px 15px;border:1px solid #cfe2f5;border-radius:15px;background:linear-gradient(120deg,#f6fbff,#eef7ff);display:grid;grid-template-columns:minmax(0,1.2fr) repeat(3,minmax(100px,.45fr));gap:10px;align-items:center}
      .updStrip63 .lead strong{display:block;color:#143a60;font-size:12px}.updStrip63 .lead span{display:block;color:#71849a;font-size:9px;margin-top:3px;line-height:1.45}
      .updStripMetric63{padding:9px 10px;background:#fff;border:1px solid #dce9f5;border-radius:11px}.updStripMetric63 span{display:block;font-size:8px;color:#7c8b9c;text-transform:uppercase}.updStripMetric63 strong{display:block;font-size:18px;color:#153e65;margin-top:2px}
      .updPanel63{margin-top:12px;background:#fff;border:1px solid #e1e8ef;border-radius:18px;padding:16px;box-shadow:0 7px 22px rgba(18,40,65,.045)}
      .updHead63{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:13px}.updHead63 h3,.updHead63 h4{margin:0;color:#203a54;font-size:14px}.updHead63 p{margin:4px 0 0;color:#77889b;font-size:9px;line-height:1.45}.updTag63{font-size:8px;font-weight:900;padding:6px 8px;border-radius:999px;background:#fff2d8;color:#835800;border:1px solid #ecd39a;white-space:nowrap}
      .updKpis63{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:12px}.updKpi63{padding:11px;border-radius:12px;background:#f7fafc;border:1px solid #e7edf3}.updKpi63 span{display:block;font-size:8px;color:#8190a1;text-transform:uppercase;letter-spacing:.03em}.updKpi63 strong{display:block;margin-top:5px;color:#1c3b59;font-size:19px}.updKpi63 small{display:block;color:#8997a6;font-size:8px;margin-top:3px}
      .updGrid63{display:grid;grid-template-columns:1fr 1fr;gap:11px}.updChart63{height:255px;position:relative;padding:10px;border:1px solid #e9eef3;border-radius:14px;background:#fbfcfe}.updChart63 h4{font-size:11px;color:#344d65;margin:0 0 7px}
      .updTableWrap63{overflow:auto;border:1px solid #e6ebf0;border-radius:12px}.updTable63{width:100%;border-collapse:collapse;font-size:9px;min-width:680px}.updTable63 th{background:#f3f6f9;text-align:left;padding:8px;color:#52667a;font-size:8px;text-transform:uppercase}.updTable63 td{padding:8px;border-top:1px solid #edf1f4;color:#526174;vertical-align:top}.updTable63 strong{color:#233b53}
      .updNote63{margin-top:11px;padding:10px 12px;border-radius:11px;background:#fff8e8;border:1px solid #efd8a8;color:#72551b;font-size:9px;line-height:1.5}
      .fichaUpdate63{margin-top:12px}.fichaUpdate63 .updKpis63{grid-template-columns:repeat(4,1fr)}.fichaUpdate63 details{border:1px solid #e4eaf0;border-radius:12px;background:#fff;margin-top:8px;overflow:hidden}.fichaUpdate63 summary{cursor:pointer;padding:11px 12px;font-size:10px;font-weight:800;color:#29455f;background:#f8fafc}.fichaUpdate63 .updTableWrap63{border:0;border-radius:0}
      .updAssetMeta63{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:11px}.updAssetMeta63 div{padding:10px;background:#f8fafc;border:1px solid #edf1f5;border-radius:11px}.updAssetMeta63 span{display:block;font-size:8px;color:#8290a0;text-transform:uppercase}.updAssetMeta63 strong{display:block;font-size:11px;color:#233d56;margin-top:4px}
      body[data-theme="dark"] .updStrip63,body[data-theme="dark"] .updPanel63,body[data-theme="dark"] .fichaUpdate63 details{background:#101d2b;border-color:#293c50}body[data-theme="dark"] .updStripMetric63,body[data-theme="dark"] .updKpi63,body[data-theme="dark"] .updChart63,body[data-theme="dark"] .updAssetMeta63 div{background:#142334;border-color:#293c50}
      body[data-theme="dark"] .updHead63 h3,body[data-theme="dark"] .updHead63 h4,body[data-theme="dark"] .updKpi63 strong,body[data-theme="dark"] .updStripMetric63 strong,body[data-theme="dark"] .updAssetMeta63 strong{color:#eef5fb}
      @media(max-width:900px){.updKpis63{grid-template-columns:repeat(3,1fr)}.updGrid63{grid-template-columns:1fr}.updStrip63{grid-template-columns:1fr 1fr}.updStrip63 .lead{grid-column:1/-1}}
      @media(max-width:560px){.updKpis63,.fichaUpdate63 .updKpis63{grid-template-columns:1fr 1fr}.updAssetMeta63{grid-template-columns:1fr}.updStrip63{grid-template-columns:1fr 1fr}.updStripMetric63 strong{font-size:15px}}
    `;document.head.appendChild(s);
  }
  function eventsFor(code){return (state.eventos||[]).filter(x=>x.reconectador===code).sort((a,b)=>String(b.inicio||'').localeCompare(String(a.inicio||'')));}
  function saidiFor(code){return (state.saidi_fuente||[]).filter(x=>x.equipo_catastro===code).sort((a,b)=>n(b.anio)-n(a.anio)||String(b.fecha_texto||'').localeCompare(String(a.fecha_texto||'')));}
  function homeStrip(){
    const hero=document.querySelector('#inicio .homeHeroV53');if(!hero||document.getElementById('updateStrip63'))return;
    const ev=state.eventos||[],sf=state.saidi_fuente||[],eq=new Set(ev.map(x=>x.reconectador)).size;
    const el=document.createElement('section');el.id='updateStrip63';el.className='updStrip63';
    el.innerHTML=`<div class="lead"><strong>Actualización Catastro MT 2024–2026 cargada</strong><span>Antecedentes complementarios para análisis. Los eventos de escenario se mantienen separados del historial técnico confirmado.</span></div>
      <div class="updStripMetric63"><span>Eventos escenario</span><strong>${ev.length}</strong></div>
      <div class="updStripMetric63"><span>Equipos con eventos</span><strong>${eq}</strong></div>
      <div class="updStripMetric63"><span>Registros SAIDI fuente</span><strong>${sf.length}</strong></div>`;
    hero.insertAdjacentElement('afterend',el);
  }
  function appendFicha(id){
    ensureStyles();
    const r=(state.reconectadores||[]).find(x=>x.id===id),body=document.querySelector('#detailModal .fichaBodyV52');if(!r||!body)return;
    document.getElementById('fichaUpdate63')?.remove();
    const ev=eventsFor(r.codigo),sf=saidiFor(r.codigo);
    const hours=ev.reduce((s,x)=>s+n(x.duracion_h),0),saidiSum=sf.reduce((s,x)=>s+n(x.saidi_reportado??x.saidi_reporte),0);
    const byY=y=>ev.filter(x=>n(x.anio)===y).length;
    const latest=ev.slice(0,15),saidis=sf.slice(0,12);
    const sec=document.createElement('section');sec.id='fichaUpdate63';sec.className='updPanel63 fichaUpdate63';
    sec.innerHTML=`
      <div class="updHead63"><div><h3>Antecedentes 2024–2026 y SAIDI</h3><p>Información complementaria vinculada al código del equipo.</p></div><span class="updTag63">Escenario no verificado</span></div>
      <div class="updAssetMeta63">
        <div><span>Subestación</span><strong>${esc(r.subestacion||'-')}</strong></div>
        <div><span>Grupo</span><strong>${esc(r.grupo||'-')}</strong></div>
        <div><span>Tecnología</span><strong>${esc(r.tecnologia||r.marca||'-')}</strong></div>
      </div>
      <div class="updKpis63">
        <div class="updKpi63"><span>Eventos escenario</span><strong>${ev.length}</strong><small>${fmt(hours)} h acumuladas</small></div>
        <div class="updKpi63"><span>2024</span><strong>${byY(2024)}</strong><small>eventos</small></div>
        <div class="updKpi63"><span>2025</span><strong>${byY(2025)}</strong><small>eventos</small></div>
        <div class="updKpi63"><span>2026</span><strong>${byY(2026)}</strong><small>eventos</small></div>
        <div class="updKpi63"><span>Registros SAIDI</span><strong>${sf.length}</strong><small>vinculados por código</small></div>
        <div class="updKpi63"><span>SAIDI reportado</span><strong>${fmt(saidiSum)}</strong><small>h/cliente · suma fuente</small></div>
      </div>
      <details ${ev.length?'open':''}><summary>Historial referencial 2024–2026 · ${ev.length} eventos</summary>
        <div class="updTableWrap63"><table class="updTable63"><thead><tr><th>Inicio</th><th>Causa</th><th>Duración</th><th>Intervención</th><th>Estado posterior</th></tr></thead><tbody>
        ${latest.length?latest.map(x=>`<tr><td><strong>${esc(dateTime(x.inicio))}</strong></td><td>${esc(x.causa_cge||'-')}</td><td>${fmt(x.duracion_h)} h</td><td>${esc(x.intervencion_tecnica||'-')}</td><td>${esc(x.estado_posterior||'-')}</td></tr>`).join(''):'<tr><td colspan="5">Sin eventos de escenario vinculados.</td></tr>'}
        </tbody></table></div>${ev.length>15?'<div style="padding:8px 12px;font-size:8px;color:#7d8b9a">Se muestran los 15 eventos más recientes de '+ev.length+'.</div>':''}
      </details>
      <details><summary>Registros SAIDI fuente · ${sf.length}</summary>
        <div class="updTableWrap63"><table class="updTable63"><thead><tr><th>Incidencia</th><th>Año / fecha fuente</th><th>Causa</th><th>Horas</th><th>Clientes</th><th>SAIDI</th></tr></thead><tbody>
        ${saidis.length?saidis.map(x=>`<tr><td><strong>${esc(x.incidencia_id||'-')}</strong></td><td>${esc(x.anio||'-')}<br>${esc(x.fecha_texto||'-')}</td><td>${esc(x.causa_cge||'-')}</td><td>${fmt(x.horas_interrupcion)} h</td><td>${esc(x.clientes_interrumpidos??'-')}</td><td>${fmt(x.saidi_reportado??x.saidi_reporte)}</td></tr>`).join(''):'<tr><td colspan="6">Sin registros SAIDI vinculados. Esto no significa cero fallas; solo ausencia de registros vinculados en la fuente cargada.</td></tr>'}
        </tbody></table></div>
      </details>
      <div class="updNote63"><strong>Uso metodológico:</strong> los eventos de escenario del archivo están identificados como “NO VERIFICADO - ESCENARIO DE PRUEBA” y requieren respaldo SCADA/COZ, SAP o Centrality antes de utilizarse como historial real. La vinculación SAIDI se realiza por código y no acredita por sí sola una falla o indisponibilidad propia del reconectador.</div>`;
    body.appendChild(sec);
  }
  function renderGestionUpdate(){
    ensureStyles();
    const host=document.getElementById('gestionContent');if(!host)return;
    document.getElementById('gestionUpdate63')?.remove();
    const ev=state.eventos||[],sf=state.saidi_fuente||[];if(!ev.length&&!sf.length)return;
    const hours=ev.reduce((s,x)=>s+n(x.duracion_h),0),eq=new Set(ev.map(x=>x.reconectador)).size;
    const nonzero=sf.filter(x=>n(x.saidi_reportado??x.saidi_reporte)>0).length;
    const saidiSum=sf.reduce((s,x)=>s+n(x.saidi_reportado??x.saidi_reporte),0);
    const years=[2024,2025,2026],counts=years.map(y=>ev.filter(x=>n(x.anio)===y).length);
    const causeMap={};ev.forEach(x=>{const k=x.causa_cge||'Sin causa';causeMap[k]=(causeMap[k]||0)+1;});
    const causes=Object.entries(causeMap).sort((a,b)=>b[1]-a[1]).slice(0,8);
    const equipMap={};ev.forEach(x=>{const k=x.reconectador||'-';const a=equipMap[k]||(equipMap[k]={count:0,hours:0});a.count++;a.hours+=n(x.duracion_h);});
    const top=Object.entries(equipMap).sort((a,b)=>b[1].count-a[1].count||b[1].hours-a[1].hours).slice(0,12);
    const sec=document.createElement('section');sec.id='gestionUpdate63';sec.className='updPanel63';
    sec.innerHTML=`
      <div class="updHead63"><div><h3>Análisis histórico referencial 2024–2026</h3><p>Escenario de eventos y registros SAIDI incorporados desde la actualización del catastro.</p></div><span class="updTag63">No modifica la prioridad operacional</span></div>
      <div class="updKpis63">
        <div class="updKpi63"><span>Eventos escenario</span><strong>${ev.length}</strong><small>2024–2026</small></div>
        <div class="updKpi63"><span>Horas escenario</span><strong>${fmt(hours)}</strong><small>h acumuladas</small></div>
        <div class="updKpi63"><span>Equipos con eventos</span><strong>${eq}</strong><small>de ${(state.reconectadores||[]).length}</small></div>
        <div class="updKpi63"><span>Registros SAIDI fuente</span><strong>${sf.length}</strong><small>vinculación por código</small></div>
        <div class="updKpi63"><span>SAIDI > 0</span><strong>${nonzero}</strong><small>registros fuente</small></div>
        <div class="updKpi63"><span>SAIDI reportado</span><strong>${fmt(saidiSum)}</strong><small>h/cliente · suma fuente</small></div>
      </div>
      <div class="updGrid63">
        <div class="updChart63"><h4>Eventos de escenario por año</h4><canvas id="histEventsChart63"></canvas></div>
        <div class="updChart63"><h4>Principales causas del escenario</h4><canvas id="histCausesChart63"></canvas></div>
      </div>
      <div style="margin-top:11px"><div class="updHead63"><div><h4>Equipos con mayor actividad en el escenario</h4><p>Ordenados por cantidad de eventos; uso referencial para análisis.</p></div></div>
        <div class="updTableWrap63"><table class="updTable63"><thead><tr><th>Equipo</th><th>Subestación</th><th>Alimentador</th><th>Eventos</th><th>Horas</th><th>Estado actual</th></tr></thead><tbody>
        ${top.map(([code,a])=>{const r=(state.reconectadores||[]).find(z=>z.codigo===code)||{};return `<tr style="cursor:pointer" onclick="showReco(${Number(r.id)||0})"><td><strong>${esc(code)}</strong></td><td>${esc(r.subestacion||'-')}</td><td>${esc(r.alimentador||'-')}</td><td>${a.count}</td><td>${fmt(a.hours)}</td><td>${esc(r.estado||'-')}</td></tr>`;}).join('')}
        </tbody></table></div>
      </div>
      <div class="updNote63"><strong>Interpretación:</strong> estos 650 registros corresponden al escenario de prueba incluido en el archivo entregado, no a 650 fallas históricas CGE confirmadas. Deben utilizarse para modelamiento, demostración y priorización exploratoria hasta contar con validación documental. Los registros SAIDI provienen de la fuente Power BI vinculada y tampoco acreditan automáticamente falla física del equipo.</div>`;
    host.appendChild(sec);
    try{histChart?.destroy();causaChart?.destroy();}catch(_){}
    if(typeof Chart==='function'){
      const e=document.getElementById('histEventsChart63'),c=document.getElementById('histCausesChart63');
      if(e)histChart=new Chart(e,{type:'bar',data:{labels:years.map(String),datasets:[{label:'Eventos',data:counts}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{precision:0}}}}});
      if(c)causaChart=new Chart(c,{type:'bar',data:{labels:causes.map(x=>x[0]),datasets:[{label:'Eventos',data:causes.map(x=>x[1])}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,ticks:{precision:0}}}}});
    }
  }
  const baseShow=window.showReco;
  if(typeof baseShow==='function')window.showReco=function(id){baseShow(id);setTimeout(()=>appendFicha(id),0);};
  const baseDashboard=window.renderDashboard;
  if(typeof baseDashboard==='function')window.renderDashboard=function(){baseDashboard();setTimeout(homeStrip,0);};
  const baseGestion=window.renderGestionIndustrialV57||window.renderGestion;
  if(typeof baseGestion==='function'){
    const wrapped=function(){baseGestion();setTimeout(renderGestionUpdate,30);};
    window.renderGestionIndustrialV57=wrapped;window.renderGestion=wrapped;
  }
  window.renderActualizacion2024_2026=renderGestionUpdate;
  setTimeout(()=>{homeStrip();if(document.getElementById('gestion')?.classList.contains('active-view'))renderGestionUpdate();},700);
})();