// v67 · Lenguaje visual de Gestión inspirado en la diapositiva 11 de la presentación final.
(function(){
  const P={
    navy:'#071a2d',panel:'#0b2742',panel2:'#103453',cyan:'#20d8ff',blue:'#2d8cff',
    teal:'#18d6b0',green:'#2bd58a',amber:'#ffb628',red:'#ff5a5f',text:'#eef8ff',muted:'#9ebbd1',
    grid:'rgba(121,181,223,.16)',border:'rgba(67,198,255,.22)'
  };
  let extraCharts=[];

  const n=v=>Number(v)||0;
  const pct=(a,b)=>b?Math.round((a/b)*100):0;
  const fmt=v=>new Intl.NumberFormat('es-CL',{maximumFractionDigits:1}).format(n(v));
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const norm=v=>String(v||'').trim();

  function ensureStyle(){
    if(document.getElementById('gestionVisual67Style'))return;
    const s=document.createElement('style');s.id='gestionVisual67Style';s.textContent=`
      #gestion{--gv-bg:${P.navy};--gv-panel:${P.panel};--gv-panel2:${P.panel2};--gv-cyan:${P.cyan};--gv-text:${P.text};--gv-muted:${P.muted}}
      #gestion .sectionTitle{margin-bottom:12px}
      #gestion .sectionTitle h2{font-weight:900;letter-spacing:-.03em}
      #gestion .giPanel57,#gestion .updPanel63,#gestion .gd65,#gestion .gv67Panel{
        background:linear-gradient(145deg,#081d32 0%,#0b2947 54%,#0b3154 100%)!important;
        border:1px solid rgba(58,199,255,.20)!important;border-radius:20px!important;
        box-shadow:0 16px 42px rgba(4,22,39,.18),inset 0 1px 0 rgba(255,255,255,.035)!important;
        color:${P.text}!important;overflow:hidden;
      }
      #gestion .giPanel57,#gestion .updPanel63,#gestion .gd65{padding:16px!important}
      #gestion .giPanelHead57 h3,#gestion .updHead63 h3,#gestion .updHead63 h4,#gestion .gd65Head h3,#gestion .gv67Head h3{color:#f4fbff!important;font-weight:900!important;letter-spacing:-.015em}
      #gestion .giPanelHead57 p,#gestion .updHead63 p,#gestion .gd65Head p,#gestion .gv67Head p{color:${P.muted}!important}
      #gestion .giPanel57 .tag,#gestion .updTag63,#gestion .gd65Head .tag,#gestion .gv67Tag{
        background:rgba(29,203,255,.10)!important;color:#8eeaff!important;border:1px solid rgba(53,213,255,.25)!important;
        border-radius:999px!important;font-weight:900!important;letter-spacing:.02em
      }
      #gestion .giCanvas57,#gestion .updChart63,#gestion .gv67Chart{
        background:linear-gradient(180deg,rgba(7,25,43,.72),rgba(10,39,66,.58))!important;
        border:1px solid rgba(65,191,255,.14)!important;border-radius:16px!important;padding:12px!important;
        box-shadow:inset 0 1px 10px rgba(0,0,0,.10)
      }
      #gestion .updChart63 h4{color:#dff6ff!important;font-weight:800}
      #gestion .giKpi57,#gestion .updKpi63,#gestion .gd65Kpi,#gestion .gv67Kpi{
        background:linear-gradient(145deg,rgba(13,49,82,.94),rgba(10,37,64,.94))!important;
        border:1px solid rgba(54,196,255,.17)!important;border-radius:15px!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.025)!important;
      }
      #gestion .giKpi57 span,#gestion .updKpi63 span,#gestion .gd65Kpi span,#gestion .gv67Kpi span{color:#9dbbd1!important}
      #gestion .giKpi57 strong,#gestion .updKpi63 strong,#gestion .gd65Kpi strong,#gestion .gv67Kpi strong{color:#fff!important;font-weight:900!important}
      #gestion .giKpi57 small,#gestion .updKpi63 small,#gestion .gd65Kpi small,#gestion .gv67Kpi small{color:#87a8c2!important}
      #gestion .giPriorityItem57,#gestion .giInsightCard57,#gestion .giAction57{
        background:rgba(13,46,76,.72)!important;border-color:rgba(75,194,255,.14)!important;color:#dceeff!important
      }
      #gestion .giPriorityItem57 strong,#gestion .giInsightCard57 strong,#gestion .giAction57 strong{color:#f3fbff!important}
      #gestion .giPriorityItem57 small,#gestion .giInsightCard57 small,#gestion .giAction57 p{color:#91aec5!important}
      #gestion .giQualityRow57 span{color:#b7cfe0!important} #gestion .giQualityRow57 strong{color:#fff!important}
      #gestion .giQualityTrack57,#gestion .giBar57{background:rgba(255,255,255,.08)!important}
      #gestion .giQualityTrack57 i,#gestion .giBar57 i{background:linear-gradient(90deg,#18cfae,#21d4ff)!important;box-shadow:0 0 12px rgba(32,216,255,.35)}
      #gestion .giTableWrap57,#gestion .updTableWrap63,#gestion .gd65TableWrap{border-color:rgba(80,185,235,.16)!important}
      #gestion .giTable57 th,#gestion .updTable63 th,#gestion .gd65Table th{background:#0c2a46!important;color:#9fc4dc!important}
      #gestion .giTable57 td,#gestion .updTable63 td,#gestion .gd65Table td{background:rgba(7,28,48,.38)!important;color:#c1d6e5!important;border-color:rgba(117,182,221,.09)!important}
      #gestion .giTable57 strong,#gestion .updTable63 strong,#gestion .gd65Table strong{color:#f0f9ff!important}
      #gestion .gd65Filters input,#gestion .gd65Filters select{background:#0a2946!important;color:#dceefa!important;border-color:rgba(71,184,239,.20)!important}
      #gestion .gd65Tab{background:#0a2946!important;color:#a9c6d9!important;border-color:rgba(71,184,239,.18)!important}
      #gestion .gd65Tab.active{background:linear-gradient(90deg,#1379d2,#18bfe7)!important;color:white!important;border-color:transparent!important;box-shadow:0 7px 22px rgba(26,176,234,.24)}
      #gestion .updNote63{background:rgba(255,182,40,.09)!important;border-color:rgba(255,182,40,.25)!important;color:#ffe1a2!important}
      .gv67Panel{padding:17px;margin-top:12px}.gv67Head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:13px}.gv67Head h3{margin:0;font-size:14px}.gv67Head p{margin:4px 0 0;font-size:9px}.gv67Tag{font-size:8px;padding:6px 9px;white-space:nowrap}
      .gv67Kpis{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:12px}.gv67Kpi{padding:11px}.gv67Kpi span{display:block;font-size:7px;text-transform:uppercase;font-weight:900}.gv67Kpi strong{display:block;font-size:21px;margin-top:4px}.gv67Kpi small{display:block;font-size:8px;margin-top:2px}
      .gv67Grid{display:grid;grid-template-columns:1fr 1fr;gap:11px}.gv67Chart{height:300px;position:relative}.gv67ChartHead{display:flex;justify-content:space-between;align-items:flex-start;margin:0 0 5px}.gv67ChartHead h4{color:#eefaff;margin:0;font-size:11px}.gv67ChartHead small{color:#86a9c3;font-size:8px}.gv67Chart canvas{max-height:248px}
      .gv67Legend{display:flex;gap:10px;flex-wrap:wrap;margin-top:7px;font-size:8px;color:#a9c5d8}.gv67Legend i{display:inline-block;width:8px;height:8px;border-radius:3px;margin-right:4px}
      @media(max-width:850px){.gv67Kpis{grid-template-columns:repeat(2,1fr)}.gv67Grid{grid-template-columns:1fr}.gv67Chart{height:280px}}
    `;document.head.appendChild(s);
  }

  const centerPlugin={
    id:'gv67Center',
    afterDraw(chart,args,opts){
      if(chart.config.type!=='doughnut'||!opts?.display)return;
      const {ctx,chartArea}=chart;if(!chartArea)return;
      const x=(chartArea.left+chartArea.right)/2,y=(chartArea.top+chartArea.bottom)/2;
      const data=chart.data.datasets?.[0]?.data||[],total=data.reduce((a,b)=>a+n(b),0);
      const val=opts.value!=null?opts.value:(total?Math.round(n(data[0])*100/total):0);
      ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillStyle=P.text;ctx.font='900 27px Inter,Segoe UI,Arial';ctx.fillText(String(val)+(opts.suffix??'%'),x,y-5);
      ctx.fillStyle=P.muted;ctx.font='700 9px Inter,Segoe UI,Arial';ctx.fillText(opts.label||'',x,y+17);ctx.restore();
    }
  };
  function register(){
    if(typeof Chart==='undefined')return;
    try{Chart.register(centerPlugin);}catch(_){}
    Chart.defaults.font.family='Inter, Segoe UI, Arial, sans-serif';
    Chart.defaults.color=P.muted;
    Chart.defaults.borderColor=P.grid;
    Chart.defaults.plugins.tooltip.backgroundColor='rgba(5,22,38,.96)';
    Chart.defaults.plugins.tooltip.titleColor='#fff';
    Chart.defaults.plugins.tooltip.bodyColor='#d5ebfa';
    Chart.defaults.plugins.tooltip.borderColor='rgba(60,201,255,.24)';
    Chart.defaults.plugins.tooltip.borderWidth=1;
    Chart.defaults.plugins.tooltip.cornerRadius=10;
    Chart.defaults.plugins.tooltip.padding=10;
  }
  function commonScales(horizontal=false){
    const axis={ticks:{color:P.muted,font:{size:9}},grid:{color:P.grid},border:{display:false}};
    const clean={ticks:{color:P.muted,font:{size:9}},grid:{display:false},border:{display:false}};
    return horizontal?{x:{...axis,beginAtZero:true},y:clean}:{x:clean,y:{...axis,beginAtZero:true}};
  }
  function gradient(ctx,a=P.cyan,b=P.blue){
    const g=ctx.createLinearGradient(0,0,0,250);g.addColorStop(0,a);g.addColorStop(1,b);return g;
  }

  function restyleExisting(){
    register();
    if(typeof Chart==='undefined'||typeof Chart.getChart!=='function')return;
    const st=Chart.getChart('giStatusChart57');
    if(st){
      st.data.datasets[0].backgroundColor=[P.green,P.amber,P.red];st.data.datasets[0].borderWidth=0;st.data.datasets[0].hoverOffset=9;
      st.options.cutout='73%';st.options.plugins.legend={position:'bottom',labels:{color:P.muted,usePointStyle:true,pointStyle:'circle',boxWidth:8,padding:16,font:{size:9,weight:'700'}}};
      st.options.plugins.gv67Center={display:true,label:'Disponibilidad'};st.update();
    }
    const pr=Chart.getChart('giPriorityChart57');
    if(pr){
      pr.data.datasets[0].backgroundColor=[P.red,P.amber,P.green];pr.data.datasets[0].borderRadius=12;pr.data.datasets[0].borderSkipped=false;pr.data.datasets[0].maxBarThickness=52;
      pr.options.scales=commonScales(false);pr.options.plugins.legend={display:false};pr.update();
    }
    const ins=Chart.getChart('giInspectionChart57');
    if(ins){
      const ctx=ins.ctx;ins.data.datasets[0].borderColor=P.cyan;ins.data.datasets[0].backgroundColor=gradient(ctx,'rgba(32,216,255,.34)','rgba(45,140,255,.02)');
      ins.data.datasets[0].fill=true;ins.data.datasets[0].tension=.38;ins.data.datasets[0].pointRadius=4;ins.data.datasets[0].pointBackgroundColor='#fff';ins.data.datasets[0].pointBorderColor=P.cyan;ins.data.datasets[0].pointBorderWidth=3;
      ins.options.scales=commonScales(false);ins.update();
    }
    const ev=Chart.getChart('histEventsChart63');
    if(ev){
      ev.data.datasets[0].backgroundColor=[P.blue,P.cyan,P.amber];ev.data.datasets[0].borderRadius=12;ev.data.datasets[0].borderSkipped=false;ev.data.datasets[0].maxBarThickness=70;
      ev.options.scales=commonScales(false);ev.update();
    }
    const ca=Chart.getChart('histCausesChart63');
    if(ca){
      ca.data.datasets[0].backgroundColor=ca.data.labels.map((_,i)=>i===0?P.amber:i===1?P.blue:P.cyan);ca.data.datasets[0].borderRadius=9;ca.data.datasets[0].borderSkipped=false;
      ca.options.scales=commonScales(true);ca.update();
    }
  }

  function destroyExtra(){extraCharts.forEach(c=>{try{c.destroy()}catch(_){}});extraCharts=[];}
  function countMap(rows,fn){
    const m=new Map();rows.forEach(r=>{const k=fn(r)||'Sin registro';m.set(k,(m.get(k)||0)+1)});return [...m.entries()].sort((a,b)=>b[1]-a[1]);
  }
  function latestInspection(){
    const m=new Map();(state.inspecciones||[]).forEach(i=>{if(!i.equipo)return;const p=m.get(i.equipo);if(!p||String(i.fecha||'')>String(p.fecha||''))m.set(i.equipo,i)});return m;
  }
  function renderExtra(){
    ensureStyle();register();destroyExtra();
    const host=document.getElementById('gestionContent');if(!host||typeof Chart==='undefined')return;
    document.getElementById('gestionVisual67')?.remove();
    const rows=state.reconectadores||[];if(!rows.length)return;
    const sub=countMap(rows,r=>norm(r.subestacion));
    const tech=countMap(rows,r=>norm(r.tecnologia||r.marca));
    const remote=rows.filter(r=>norm(r.comunicacion_remota).toUpperCase()==='SI').length;
    const noRemote=rows.length-remote;
    const last=latestInspection();
    const now=Date.now(),recent=rows.filter(r=>{const i=last.get(r.codigo);if(!i?.fecha)return false;const d=new Date(String(i.fecha).slice(0,10)+'T00:00:00');return !isNaN(d)&&((now-d.getTime())/86400000)<=365}).length;
    const old=rows.filter(r=>{const i=last.get(r.codigo);if(!i?.fecha)return false;const d=new Date(String(i.fecha).slice(0,10)+'T00:00:00');return !isNaN(d)&&((now-d.getTime())/86400000)>365}).length;
    const none=rows.length-recent-old;
    const ev=state.eventos||[],hours=ev.reduce((s,x)=>s+n(x.duracion_h),0);

    const sec=document.createElement('section');sec.id='gestionVisual67';sec.className='gv67Panel';
    sec.innerHTML=`
      <div class="gv67Head"><div><h3>Visión ejecutiva de la gestión MT</h3><p>Lectura visual del parque, cobertura preventiva y capacidad de supervisión.</p></div><span class="gv67Tag">68 activos · Delegación Iquique</span></div>
      <div class="gv67Kpis">
        <div class="gv67Kpi"><span>Parque total</span><strong>${rows.length}</strong><small>reconectadores</small></div>
        <div class="gv67Kpi"><span>Comunicación remota</span><strong>${pct(remote,rows.length)}%</strong><small>${remote} equipos conectados</small></div>
        <div class="gv67Kpi"><span>Inspección vigente</span><strong>${pct(recent,rows.length)}%</strong><small>${recent} ≤ 1 año</small></div>
        <div class="gv67Kpi"><span>Eventos 2024–2026</span><strong>${ev.length}</strong><small>${fmt(hours)} h acumuladas</small></div>
        <div class="gv67Kpi"><span>Subestaciones</span><strong>${sub.length}</strong><small>distribución territorial</small></div>
      </div>
      <div class="gv67Grid">
        <div class="gv67Chart"><div class="gv67ChartHead"><div><h4>Distribución por subestación</h4><small>Concentración del parque por instalación</small></div></div><canvas id="gvSub67"></canvas></div>
        <div class="gv67Chart"><div class="gv67ChartHead"><div><h4>Comunicación remota</h4><small>Capacidad actual de supervisión a distancia</small></div></div><canvas id="gvComm67"></canvas></div>
        <div class="gv67Chart"><div class="gv67ChartHead"><div><h4>Tecnologías instaladas</h4><small>Diversidad tecnológica del parque</small></div></div><canvas id="gvTech67"></canvas></div>
        <div class="gv67Chart"><div class="gv67ChartHead"><div><h4>Cobertura de inspecciones</h4><small>Vigencia del control preventivo registrado</small></div></div><canvas id="gvInspect67"></canvas></div>
      </div>`;
    const detailed=document.getElementById('gestionDetallada65');
    if(detailed)host.insertBefore(sec,detailed);else host.appendChild(sec);

    const subCtx=document.getElementById('gvSub67');
    extraCharts.push(new Chart(subCtx,{type:'bar',data:{labels:sub.map(x=>x[0]),datasets:[{data:sub.map(x=>x[1]),backgroundColor:sub.map((_,i)=>i===0?P.cyan:i===1?P.blue:P.teal),borderRadius:10,borderSkipped:false}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:commonScales(true)}}));
    const commCtx=document.getElementById('gvComm67');
    extraCharts.push(new Chart(commCtx,{type:'doughnut',data:{labels:['Con comunicación','Sin comunicación'],datasets:[{data:[remote,noRemote],backgroundColor:[P.green,P.amber],borderWidth:0,hoverOffset:9}]},options:{responsive:true,maintainAspectRatio:false,cutout:'73%',plugins:{legend:{position:'bottom',labels:{color:P.muted,usePointStyle:true,pointStyle:'circle',boxWidth:8,padding:16,font:{size:9,weight:'700'}}},gv67Center:{display:true,label:'Cobertura'}}}}));
    const techCtx=document.getElementById('gvTech67');
    extraCharts.push(new Chart(techCtx,{type:'bar',data:{labels:tech.map(x=>x[0]),datasets:[{data:tech.map(x=>x[1]),backgroundColor:tech.map((_,i)=>i===0?P.cyan:i===1?P.blue:i===2?P.teal:P.amber),borderRadius:9,borderSkipped:false}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:commonScales(true)}}));
    const insCtx=document.getElementById('gvInspect67');
    extraCharts.push(new Chart(insCtx,{type:'doughnut',data:{labels:['≤ 1 año','> 1 año','Sin inspección'],datasets:[{data:[recent,old,none],backgroundColor:[P.green,P.amber,P.red],borderWidth:0,hoverOffset:9}]},options:{responsive:true,maintainAspectRatio:false,cutout:'73%',plugins:{legend:{position:'bottom',labels:{color:P.muted,usePointStyle:true,pointStyle:'circle',boxWidth:8,padding:16,font:{size:9,weight:'700'}}},gv67Center:{display:true,value:pct(recent,rows.length),label:'Vigente'}}}}));
  }

  function applyAll(){ensureStyle();setTimeout(()=>{restyleExisting();renderExtra();setTimeout(restyleExisting,100)},90)}
  const prev=window.renderGestion;
  if(typeof prev==='function'){
    const wrapped=function(){prev();applyAll();};
    window.renderGestion=wrapped;
    window.renderGestionIndustrialV57=wrapped;
  }
  window.renderGestionVisualV67=applyAll;
  document.addEventListener('click',e=>{if(e.target.closest('[data-view="gestion"]'))setTimeout(applyAll,180)});
  setTimeout(()=>{if(document.getElementById('gestionContent'))applyAll()},1300);
})();