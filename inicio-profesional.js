// v53 · Inicio ejecutivo-operacional para Reconectadores MT.
(function(){
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function pct(n,d){return d?Math.round(n*100/d):0;}
  function norm(v){return String(v||'').trim();}
  function hasCoords(r){return Number.isFinite(Number(r?.lat))&&Number.isFinite(Number(r?.lon));}
  function comm(v){const s=norm(v).toUpperCase();return s==='SI'?'SI':s==='NO'?'NO':'-';}
  function fdate(v){try{return typeof fmtDate==='function'?fmtDate(v):(v||'-')}catch(_){return v||'-'}}
  function statusClass(s){return s==='Fuera de servicio'?'danger':s==='Con observaciones'?'warn':'ok';}

  function ensureStyles(){
    if(document.getElementById('inicioV53Styles'))return;
    const s=document.createElement('style');s.id='inicioV53Styles';s.textContent=`
      #inicio.inicioV53{display:none}
      #inicio.inicioV53.active-view{display:block}
      .homeHeroV53{position:relative;overflow:hidden;border-radius:24px;background:linear-gradient(125deg,#071827 0%,#0b3456 56%,#08769a 100%);color:#fff;padding:27px 30px;box-shadow:0 18px 48px rgba(9,38,65,.14);border:1px solid rgba(255,255,255,.07)}
      .homeHeroV53:after{content:"";position:absolute;width:430px;height:430px;border-radius:50%;right:-155px;top:-250px;background:radial-gradient(circle,rgba(255,255,255,.12),rgba(255,255,255,0) 68%)}
      .homeHeroGridV53{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1.35fr) minmax(350px,.65fr);gap:25px;align-items:center}
      .homeEyebrowV53{font-size:9px;letter-spacing:.16em;font-weight:900;color:#91cbed;text-transform:uppercase}.homeHeroV53 h2{font-size:37px;line-height:1.06;letter-spacing:-.045em;margin:8px 0 10px;max-width:700px;color:#fff}
      .homeHeroV53 p{font-size:12px;line-height:1.6;max-width:650px;color:#d0e1ed;margin:0}.homeHeroAccentV53{color:#82d8ff}
      .homeHeroActionsV53{display:flex;gap:8px;flex-wrap:wrap;margin-top:17px}.homeHeroActionsV53 .btn{min-height:38px;font-size:10px;border-radius:10px;padding:9px 13px}
      .homeHeroActionsV53 .primary{background:#fff;color:#134e7a;box-shadow:none}.homeHeroActionsV53 .secondary{background:rgba(255,255,255,.10);color:#fff;border:1px solid rgba(255,255,255,.14)}
      .homeAvailabilityV53{background:rgba(6,21,34,.28);border:1px solid rgba(255,255,255,.10);border-radius:19px;padding:16px}
      .homeAvailTopV53{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.homeAvailTopV53 span{font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:#a8c7dc}.homeAvailTopV53 strong{display:block;font-size:37px;line-height:1;margin-top:5px;color:#fff;letter-spacing:-.04em}
      .homeAvailBadgeV53{padding:6px 8px;border-radius:999px;background:rgba(51,205,143,.15);border:1px solid rgba(83,224,164,.20);color:#bdf6dc;font-size:9px;font-weight:900}
      .homeAvailBarV53{height:8px;border-radius:999px;background:rgba(255,255,255,.09);overflow:hidden;margin:14px 0 11px}.homeAvailBarV53 i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#32c88e,#6be0b1)}
      .homeAvailFootV53{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.homeAvailMiniV53{padding:8px;border-radius:10px;background:rgba(255,255,255,.065)}.homeAvailMiniV53 small{display:block;color:#a9c2d5;font-size:8px}.homeAvailMiniV53 b{display:block;color:#fff;font-size:14px;margin-top:2px}
      .homeQuickV53{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin:12px 0}.homeQuickCardV53{border:1px solid #e1e7ee;background:#fff;border-radius:15px;padding:13px;display:flex;gap:10px;align-items:center;cursor:pointer;text-align:left;box-shadow:0 6px 20px rgba(15,35,60,.045);transition:.16s}
      .homeQuickCardV53:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(15,35,60,.08)}.homeQuickIconV53{width:35px;height:35px;flex:0 0 auto;border-radius:10px;display:grid;place-items:center;background:#edf5ff;color:#1559c9;font-size:16px}.homeQuickCardV53 strong{display:block;color:#223852;font-size:11px}.homeQuickCardV53 small{display:block;color:#7d8999;font-size:9px;margin-top:2px}
      .homeKpisV53{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:9px;margin-bottom:12px}.homeKpiV53{position:relative;overflow:hidden;background:#fff;border:1px solid #e1e7ee;border-radius:16px;padding:14px;box-shadow:0 6px 20px rgba(15,35,60,.04)}
      .homeKpiV53:after{content:"";position:absolute;width:70px;height:70px;border-radius:50%;right:-30px;top:-30px;background:#f2f6fa}.homeKpiV53 .label{position:relative;z-index:1;color:#7f8c9d;font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:.06em}.homeKpiV53 .value{position:relative;z-index:1;color:#1d334d;font-size:28px;font-weight:900;letter-spacing:-.04em;margin-top:5px}.homeKpiV53 .foot{position:relative;z-index:1;color:#7b899a;font-size:9px;margin-top:3px}.homeKpiV53.good{border-top:3px solid #20a870}.homeKpiV53.warn{border-top:3px solid #d18a10}.homeKpiV53.danger{border-top:3px solid #ce483e}.homeKpiV53.info{border-top:3px solid #3479cb}
      .homeMainGridV53{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(310px,.75fr);gap:12px}.homePanelV53{background:#fff;border:1px solid #e1e7ee;border-radius:17px;padding:15px;box-shadow:0 6px 20px rgba(15,35,60,.04)}
      .homePanelHeadV53{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:12px}.homePanelHeadV53 h3{font-size:13px;margin:0;color:#20364f}.homePanelHeadV53 p{font-size:9px;color:#8390a1;margin:3px 0 0}.homePanelHeadV53 button{border:0;background:none;color:#1559c9;font-size:9px;font-weight:900;cursor:pointer;padding:4px}
      .homeHealthGridV53{display:grid;grid-template-columns:160px 1fr;gap:17px;align-items:center}.homeDonutV53{width:145px;height:145px;border-radius:50%;display:grid;place-items:center;margin:auto;position:relative}.homeDonutV53:after{content:"";position:absolute;inset:17px;background:#fff;border-radius:50%}.homeDonutCenterV53{position:relative;z-index:1;text-align:center}.homeDonutCenterV53 strong{display:block;font-size:28px;color:#20364f;letter-spacing:-.04em}.homeDonutCenterV53 span{font-size:8px;color:#8491a1;text-transform:uppercase}
      .homeHealthRowsV53{display:flex;flex-direction:column;gap:10px}.homeHealthRowV53{display:grid;grid-template-columns:12px 1fr auto;gap:8px;align-items:center}.homeHealthDotV53{width:9px;height:9px;border-radius:50%}.homeHealthRowV53 strong{font-size:10px;color:#34495f}.homeHealthRowV53 span{font-size:10px;color:#6f7e90}.homeHealthTrackV53{grid-column:2/4;height:6px;border-radius:999px;background:#edf1f5;overflow:hidden;margin-top:-5px}.homeHealthTrackV53 i{display:block;height:100%;border-radius:999px}
      .homeAlertsV53{display:flex;flex-direction:column;gap:7px;max-height:292px;overflow:auto;padding-right:2px}.homeAlertV53{display:flex;justify-content:space-between;gap:9px;align-items:center;padding:9px 10px;border:1px solid #e6ebf0;border-radius:11px;background:#fbfcfd;cursor:pointer}.homeAlertV53:hover{background:#f7faff;border-color:#cad9e9}.homeAlertV53 strong{font-size:10px;color:#263c55}.homeAlertV53 small{display:block;font-size:8px;color:#7b8898;margin-top:2px}.homeAlertBadgeV53{font-size:8px;font-weight:900;padding:4px 6px;border-radius:999px;white-space:nowrap}.homeAlertBadgeV53.danger{background:#fdecea;color:#a13931}.homeAlertBadgeV53.warn{background:#fff2dc;color:#855800}
      .homeSecondaryGridV53{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}.homeCommV53{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.homeCommCardV53{padding:12px;border-radius:12px;background:#f8fafc;border:1px solid #edf1f5}.homeCommCardV53 span{font-size:8px;color:#8290a1;text-transform:uppercase}.homeCommCardV53 strong{display:block;margin-top:4px;font-size:21px;color:#233a53}.homeCommCardV53 small{font-size:8px;color:#7b899a}
      .homeQuadrantsV53{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.homeQuadrantV53{padding:9px;border:1px solid #e8edf2;background:#fafbfd;border-radius:10px;cursor:pointer}.homeQuadrantV53:hover{border-color:#c8d9ea;background:#f6faff}.homeQuadrantV53 strong{font-size:10px;color:#253b53}.homeQuadrantV53 span{display:block;font-size:16px;font-weight:900;color:#1559c9;margin:3px 0}.homeQuadrantV53 small{font-size:8px;color:#7d8998}
      .homeActivityV53{display:flex;flex-direction:column}.homeActivityItemV53{display:grid;grid-template-columns:32px 1fr auto;gap:9px;align-items:center;padding:9px 0;border-bottom:1px solid #edf1f4}.homeActivityItemV53:last-child{border-bottom:0}.homeActivityIconV53{width:31px;height:31px;border-radius:9px;background:#eef5ff;color:#1559c9;display:grid;place-items:center;font-size:13px}.homeActivityItemV53 strong{display:block;font-size:10px;color:#273c54}.homeActivityItemV53 small{display:block;font-size:8px;color:#7e8a99;margin-top:2px}.homeActivityStatusV53{font-size:8px;font-weight:900;color:#5f7084}
      .homeDataQualityV53{display:flex;flex-direction:column;gap:10px}.homeDataRowV53{display:grid;grid-template-columns:110px 1fr 38px;gap:8px;align-items:center}.homeDataRowV53 span{font-size:9px;color:#647487}.homeDataRowV53 strong{font-size:9px;color:#334960;text-align:right}.homeDataTrackV53{height:7px;border-radius:999px;background:#edf1f5;overflow:hidden}.homeDataTrackV53 i{height:100%;display:block;border-radius:999px;background:#397dc9}
      body[data-theme="dark"] .homeQuickCardV53,body[data-theme="dark"] .homeKpiV53,body[data-theme="dark"] .homePanelV53{background:#101d2b;border-color:#293c4f}
      body[data-theme="dark"] .homeQuickCardV53 strong,body[data-theme="dark"] .homeKpiV53 .value,body[data-theme="dark"] .homePanelHeadV53 h3,body[data-theme="dark"] .homeHealthRowV53 strong,body[data-theme="dark"] .homeAlertV53 strong,body[data-theme="dark"] .homeQuadrantV53 strong,body[data-theme="dark"] .homeActivityItemV53 strong{color:#eef5fb}
      body[data-theme="dark"] .homeDonutV53:after{background:#101d2b}body[data-theme="dark"] .homeDonutCenterV53 strong{color:#eef5fb}
      body[data-theme="dark"] .homeAlertV53,body[data-theme="dark"] .homeCommCardV53,body[data-theme="dark"] .homeQuadrantV53{background:#142334;border-color:#293c4f}
      @media(max-width:1050px){.homeHeroGridV53{grid-template-columns:1fr}.homeKpisV53{grid-template-columns:repeat(3,1fr)}.homeMainGridV53{grid-template-columns:1fr}.homeQuadrantsV53{grid-template-columns:repeat(4,1fr)}}
      @media(max-width:760px){
        .homeHeroV53{padding:20px 17px;border-radius:19px}.homeHeroGridV53{gap:16px}.homeHeroV53 h2{font-size:28px}.homeHeroV53 p{font-size:11px}.homeHeroActionsV53 .btn{flex:1 1 calc(50% - 5px)}
        .homeAvailabilityV53{padding:13px;border-radius:15px}.homeAvailTopV53 strong{font-size:31px}.homeQuickV53{grid-template-columns:1fr 1fr;gap:7px}.homeQuickCardV53{padding:10px}.homeQuickIconV53{width:31px;height:31px}.homeQuickCardV53 strong{font-size:10px}.homeQuickCardV53 small{font-size:8px}
        .homeKpisV53{grid-template-columns:1fr 1fr;gap:7px}.homeKpiV53{padding:11px;border-radius:13px}.homeKpiV53 .value{font-size:24px}
        .homeMainGridV53,.homeSecondaryGridV53{grid-template-columns:1fr;gap:9px}.homePanelV53{padding:12px;border-radius:14px}.homeHealthGridV53{grid-template-columns:120px 1fr;gap:10px}.homeDonutV53{width:112px;height:112px}.homeDonutV53:after{inset:14px}.homeDonutCenterV53 strong{font-size:23px}
        .homeQuadrantsV53{grid-template-columns:repeat(2,1fr)}.homeDataRowV53{grid-template-columns:95px 1fr 34px}.homeActivityItemV53{grid-template-columns:30px 1fr}
        .homeActivityStatusV53{display:none}
      }
      @media(max-width:420px){.homeHeroActionsV53 .btn{flex-basis:100%}.homeAvailFootV53{grid-template-columns:1fr 1fr}.homeAvailMiniV53:last-child{grid-column:1/-1}.homeHealthGridV53{grid-template-columns:1fr}.homeQuickV53{grid-template-columns:1fr 1fr}}
    `;document.head.appendChild(s);
  }

  function goCatalogStatus(status){
    try{goView('catalogo');setTimeout(()=>{const s=document.getElementById('filterStatus');if(s){s.value=status||'';s.dispatchEvent(new Event('change'));}},50);}catch(_){}
  }
  window.homeGoCatalogV53=goCatalogStatus;

  function render(){
    ensureStyles();
    const host=document.getElementById('inicio');if(!host)return;
    host.classList.add('inicioV53');
    const recos=state.reconectadores||[],ins=state.inspecciones||[];
    const total=recos.length,op=recos.filter(r=>r.estado==='Operativo').length,obs=recos.filter(r=>r.estado==='Con observaciones').length,off=recos.filter(r=>r.estado==='Fuera de servicio').length;
    const availability=pct(op,total),yes=recos.filter(r=>comm(r.comunicacion_remota)==='SI').length,no=recos.filter(r=>comm(r.comunicacion_remota)==='NO').length;
    const geo=recos.filter(hasCoords).length,verified=recos.filter(r=>r.fecha_verificacion).length,withQ=recos.filter(r=>norm(r.cuadrante)).length;
    const attention=recos.filter(r=>r.estado!=='Operativo').sort((a,b)=>(a.estado==='Fuera de servicio'?0:1)-(b.estado==='Fuera de servicio'?0:1)||String(a.codigo).localeCompare(String(b.codigo)));
    const qs=[...new Set(recos.map(r=>norm(r.cuadrante)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
    const recent=ins.slice().sort((a,b)=>String(b.fecha||'').localeCompare(String(a.fecha||''))).slice(0,5);
    const statusDegrees={op:total?op/total*360:0,obs:total?obs/total*360:0,off:total?off/total*360:0};
    const d1=statusDegrees.op,d2=d1+statusDegrees.obs;

    host.innerHTML=`
      <section class="homeHeroV53">
        <div class="homeHeroGridV53">
          <div>
            <span class="homeEyebrowV53">CENTRO OPERACIONAL · RED MT IQUIQUE</span>
            <h2>Control claro de tus <span class="homeHeroAccentV53">reconectadores MT.</span></h2>
            <p>Estado operacional, alertas, comunicación remota, ubicación e inspecciones en una sola vista para tomar decisiones rápidas.</p>
            <div class="homeHeroActionsV53">
              <button class="btn primary" type="button" onclick="goView('catalogo')">⚡ Explorar equipos</button>
              <button class="btn secondary" type="button" onclick="goView('mapa')">⌖ Abrir mapa</button>
              <button class="btn secondary" type="button" onclick="goView('gestion')">▥ Ver gestión</button>
            </div>
          </div>
          <div class="homeAvailabilityV53">
            <div class="homeAvailTopV53"><div><span>Disponibilidad operativa</span><strong>${availability}%</strong></div><span class="homeAvailBadgeV53">${op} de ${total} operativos</span></div>
            <div class="homeAvailBarV53"><i style="width:${availability}%"></i></div>
            <div class="homeAvailFootV53">
              <div class="homeAvailMiniV53"><small>Operativos</small><b>${op}</b></div>
              <div class="homeAvailMiniV53"><small>Observación</small><b>${obs}</b></div>
              <div class="homeAvailMiniV53"><small>Fuera de servicio</small><b>${off}</b></div>
            </div>
          </div>
        </div>
      </section>

      <div class="homeQuickV53">
        <button class="homeQuickCardV53" type="button" onclick="goView('catalogo')"><span class="homeQuickIconV53">⚡</span><span><strong>Buscar equipo</strong><small>Abre fichas y antecedentes</small></span></button>
        <button class="homeQuickCardV53" type="button" onclick="goView('mapa')"><span class="homeQuickIconV53">⌖</span><span><strong>Mapa operacional</strong><small>Ubicación, filtros y rutas</small></span></button>
        <button class="homeQuickCardV53" type="button" onclick="goView('gestion')"><span class="homeQuickIconV53">▥</span><span><strong>Control de gestión</strong><small>Indicadores y análisis</small></span></button>
        <button class="homeQuickCardV53" type="button" onclick="goView('manuales')"><span class="homeQuickIconV53">▤</span><span><strong>Manuales técnicos</strong><small>Biblioteca de apoyo</small></span></button>
      </div>

      <div id="kpis" class="homeKpisV53">
        <div class="homeKpiV53 info"><div class="label">Base maestra</div><div class="value">${total}</div><div class="foot">Reconectadores registrados</div></div>
        <div class="homeKpiV53 good"><div class="label">Operativos</div><div class="value">${op}</div><div class="foot">${availability}% de disponibilidad</div></div>
        <div class="homeKpiV53 warn"><div class="label">Con observaciones</div><div class="value">${obs}</div><div class="foot">Requieren seguimiento</div></div>
        <div class="homeKpiV53 danger"><div class="label">Fuera de servicio</div><div class="value">${off}</div><div class="foot">Prioridad operacional</div></div>
        <div class="homeKpiV53 info"><div class="label">Comunicación remota</div><div class="value">${pct(yes,total)}%</div><div class="foot">${yes} con comunicación</div></div>
      </div>

      <div class="homeMainGridV53">
        <section class="homePanelV53">
          <div class="homePanelHeadV53"><div><h3>Salud de la flota</h3><p>Distribución del estado operacional actual</p></div><button type="button" onclick="goView('gestion')">Ver análisis →</button></div>
          <div class="homeHealthGridV53">
            <div class="homeDonutV53" style="background:conic-gradient(#1da772 0deg ${d1}deg,#d58d12 ${d1}deg ${d2}deg,#cc493f ${d2}deg 360deg)"><div class="homeDonutCenterV53"><strong>${availability}%</strong><span>disponible</span></div></div>
            <div class="homeHealthRowsV53">
              <div class="homeHealthRowV53"><i class="homeHealthDotV53" style="background:#1da772"></i><strong>Operativos</strong><span>${op} · ${pct(op,total)}%</span><div class="homeHealthTrackV53"><i style="width:${pct(op,total)}%;background:#1da772"></i></div></div>
              <div class="homeHealthRowV53"><i class="homeHealthDotV53" style="background:#d58d12"></i><strong>Con observaciones</strong><span>${obs} · ${pct(obs,total)}%</span><div class="homeHealthTrackV53"><i style="width:${pct(obs,total)}%;background:#d58d12"></i></div></div>
              <div class="homeHealthRowV53"><i class="homeHealthDotV53" style="background:#cc493f"></i><strong>Fuera de servicio</strong><span>${off} · ${pct(off,total)}%</span><div class="homeHealthTrackV53"><i style="width:${pct(off,total)}%;background:#cc493f"></i></div></div>
            </div>
          </div>
        </section>

        <section class="homePanelV53">
          <div class="homePanelHeadV53"><div><h3>Atención operacional</h3><p>${attention.length} equipos requieren revisión</p></div><button type="button" onclick="homeGoCatalogV53('Fuera de servicio')">Abrir catálogo →</button></div>
          <div class="homeAlertsV53">
            ${attention.length?attention.slice(0,8).map(r=>`<div class="homeAlertV53" onclick="showReco(${r.id})"><div><strong>${esc(r.codigo)} · ${esc(r.alimentador||'-')}</strong><small>${esc(r.ubicacion||'-')}${r.cuadrante?' · Q'+esc(r.cuadrante):''}</small></div><span class="homeAlertBadgeV53 ${statusClass(r.estado)}">${esc(r.estado)}</span></div>`).join(''):'<div class="homeAlertV53"><div><strong>Sin alertas operacionales</strong><small>Todos los equipos están operativos.</small></div></div>'}
          </div>
        </section>
      </div>

      <div class="homeSecondaryGridV53">
        <section class="homePanelV53">
          <div class="homePanelHeadV53"><div><h3>Comunicación y calidad de datos</h3><p>Condición de información disponible</p></div></div>
          <div class="homeCommV53">
            <div class="homeCommCardV53"><span>Con comunicación remota</span><strong>${yes}</strong><small>${pct(yes,total)}% de la flota</small></div>
            <div class="homeCommCardV53"><span>Sin comunicación remota</span><strong>${no}</strong><small>${pct(no,total)}% de la flota</small></div>
          </div>
          <div class="homeDataQualityV53" style="margin-top:13px">
            <div class="homeDataRowV53"><span>Georreferenciación</span><div class="homeDataTrackV53"><i style="width:${pct(geo,total)}%"></i></div><strong>${pct(geo,total)}%</strong></div>
            <div class="homeDataRowV53"><span>Fecha verificación</span><div class="homeDataTrackV53"><i style="width:${pct(verified,total)}%"></i></div><strong>${pct(verified,total)}%</strong></div>
            <div class="homeDataRowV53"><span>Cuadrante informado</span><div class="homeDataTrackV53"><i style="width:${pct(withQ,total)}%"></i></div><strong>${pct(withQ,total)}%</strong></div>
          </div>
        </section>

        <section class="homePanelV53">
          <div class="homePanelHeadV53"><div><h3>Distribución por cuadrante</h3><p>Acceso rápido a responsables y equipos</p></div><button type="button" onclick="goView('gestion')">Ver detalle →</button></div>
          <div class="homeQuadrantsV53">
            ${qs.map(q=>{const arr=recos.filter(r=>norm(r.cuadrante)===q),qop=arr.filter(r=>r.estado==='Operativo').length;return `<div class="homeQuadrantV53" onclick="goView('gestion')"><strong>Cuadrante ${esc(q)}</strong><span>${arr.length}</span><small>${pct(qop,arr.length)}% operativos</small></div>`;}).join('')}
          </div>
        </section>
      </div>

      <div class="homeSecondaryGridV53">
        <section class="homePanelV53">
          <div class="homePanelHeadV53"><div><h3>Actividad reciente</h3><p>Últimas inspecciones registradas</p></div><button type="button" onclick="goView('gestion')">Ver gestión →</button></div>
          <div class="homeActivityV53">
            ${recent.length?recent.map(i=>`<div class="homeActivityItemV53"><div class="homeActivityIconV53">✓</div><div><strong>${esc(i.equipo)} · ${esc(i.inspector||'Sin inspector')}</strong><small>${esc(fdate(i.fecha))} · ${esc(i.observaciones||'Sin observaciones')}</small></div><span class="homeActivityStatusV53">${esc(i.resultado||'-')}</span></div>`).join(''):'<div class="homeActivityItemV53"><div class="homeActivityIconV53">–</div><div><strong>Sin inspecciones registradas</strong><small>La actividad aparecerá aquí cuando existan registros.</small></div></div>'}
          </div>
        </section>
        <section class="homePanelV53">
          <div class="homePanelHeadV53"><div><h3>Resumen de gestión</h3><p>Indicadores para lectura rápida</p></div></div>
          <div class="homeCommV53">
            <div class="homeCommCardV53"><span>Equipos georreferenciados</span><strong>${geo}</strong><small>${total-geo} pendientes</small></div>
            <div class="homeCommCardV53"><span>Con fecha de verificación</span><strong>${verified}</strong><small>${total-verified} sin fecha</small></div>
            <div class="homeCommCardV53"><span>Cuadrantes activos</span><strong>${qs.length}</strong><small>${withQ} equipos clasificados</small></div>
            <div class="homeCommCardV53"><span>Inspecciones registradas</span><strong>${ins.length}</strong><small>Historial disponible</small></div>
          </div>
        </section>
      </div>`;
  }

  window.renderDashboard=render;
  window.renderInicioV53=render;
  ensureStyles();
  setTimeout(render,150);
  document.addEventListener('click',e=>{if(e.target.closest('[data-view="inicio"]'))setTimeout(render,30);});
})();