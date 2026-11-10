// v58 · Centro de Reportes PDF funcional para Gestión.
(function(){
  const pct=(n,d)=>d?Math.round(n*100/d):0;
  const norm=v=>String(v||'').trim();
  const allRows=()=>window.state?.reconectadores||[];
  const inspections=()=>window.state?.inspecciones||[];
  const hasCoords=r=>Number.isFinite(Number(r?.lat))&&Number.isFinite(Number(r?.lon));
  const comm=v=>{const s=norm(v).toUpperCase();return s==='SI'?'SI':s==='NO'?'NO':'-';};
  const fmt=v=>{if(!v)return '-';const d=new Date(v+'T00:00:00');return Number.isNaN(d.getTime())?String(v):d.toLocaleDateString('es-CL');};
  const daysSince=v=>{if(!v)return Infinity;const d=new Date(v+'T00:00:00');return Number.isNaN(d.getTime())?Infinity:Math.floor((Date.now()-d.getTime())/86400000);};

  function stamp(){
    const d=new Date();
    return {
      date:d.toLocaleDateString('es-CL'),
      time:d.toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'}),
      file:d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')+'_'+String(d.getHours()).padStart(2,'0')+'-'+String(d.getMinutes()).padStart(2,'0')
    };
  }

  function filters(){
    return {
      q:document.getElementById('giQ57')?.value||'',
      status:document.getElementById('giStatus57')?.value||'',
      manager:document.getElementById('giManager57')?.value||'',
      remote:document.getElementById('giComm57')?.value||''
    };
  }

  function rows(){
    const f=filters();
    return allRows().filter(r=>
      (!f.q||norm(r.cuadrante)===f.q)&&
      (!f.status||norm(r.estado)===f.status)&&
      (!f.manager||norm(r.gestor_cuadrante)===f.manager)&&
      (!f.remote||comm(r.comunicacion_remota)===f.remote)
    );
  }

  function filterLabel(){
    const f=filters(),a=[];
    if(f.q)a.push('Cuadrante '+f.q);
    if(f.status)a.push(f.status);
    if(f.manager)a.push(f.manager);
    if(f.remote)a.push('Comunicación remota '+f.remote);
    return a.join(' · ')||'Vista general de la flota';
  }

  function lastInspectionMap(){
    const m=new Map();
    inspections().forEach(i=>{
      if(!i.equipo)return;
      const p=m.get(i.equipo);
      if(!p||String(i.fecha||'')>String(p.fecha||''))m.set(i.equipo,i);
    });
    return m;
  }

  function priority(r,last){
    let score=0,reasons=[];
    if(r.estado==='Fuera de servicio'){score+=50;reasons.push('Fuera de servicio');}
    else if(r.estado==='Con observaciones'){score+=30;reasons.push('Con observaciones');}
    if(/bypass/i.test(norm(r.observaciones))){score+=20;reasons.push('BYPASS');}
    if(comm(r.comunicacion_remota)==='NO'){score+=12;reasons.push('Sin comunicación remota');}
    if(!r.fecha_verificacion){score+=15;reasons.push('Sin fecha verificación');}
    else if(daysSince(r.fecha_verificacion)>1095){score+=8;reasons.push('Verificación > 3 años');}
    if(!hasCoords(r)){score+=5;reasons.push('Sin georreferencia');}
    if(!last){score+=10;reasons.push('Sin inspecciones');}
    else if(daysSince(last.fecha)>365){score+=6;reasons.push('Inspección > 1 año');}
    return {score,level:score>=45?'Alta':score>=20?'Media':'Baja',reasons};
  }

  function completeness(r){
    const f=[r.codigo,r.alimentador,r.marca,r.estado,r.ubicacion,r.cuadrante,r.gestor_cuadrante,r.fecha_verificacion,r.sobrecorriente_fase,r.sobrecorriente_residual,r.comunicacion_remota];
    const ok=f.filter(v=>norm(v)).length+(hasCoords(r)?1:0);
    return Math.round(ok/12*100);
  }

  function stats(rs){
    const last=lastInspectionMap();
    const total=rs.length,oper=rs.filter(r=>r.estado==='Operativo').length,obs=rs.filter(r=>r.estado==='Con observaciones').length,off=rs.filter(r=>r.estado==='Fuera de servicio').length;
    const remote=rs.filter(r=>comm(r.comunicacion_remota)==='SI').length,geo=rs.filter(hasCoords).length,verif=rs.filter(r=>r.fecha_verificacion).length,inspected=rs.filter(r=>last.has(r.codigo)).length;
    const prioritized=rs.map(r=>({r,p:priority(r,last.get(r.codigo))})).sort((a,b)=>b.p.score-a.p.score||norm(a.r.codigo).localeCompare(norm(b.r.codigo),'es',{numeric:true}));
    const complete=total?Math.round(rs.reduce((s,r)=>s+completeness(r),0)/total):0;
    return {last,total,oper,obs,off,remote,geo,verif,inspected,prioritized,complete,availability:pct(oper,total)};
  }

  function qSummary(rs){
    const qs=[...new Set(rs.map(r=>norm(r.cuadrante)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
    const last=lastInspectionMap();
    return qs.map(q=>{
      const a=rs.filter(r=>norm(r.cuadrante)===q),op=a.filter(r=>r.estado==='Operativo').length;
      const gs=[...new Set(a.map(r=>norm(r.gestor_cuadrante)).filter(Boolean))];
      const high=a.filter(r=>priority(r,last.get(r.codigo)).level==='Alta').length;
      return [q,gs.join(' / ')||'Sin gestor',a.length,op,a.length-op,high,pct(op,a.length)+'%'];
    });
  }

  function chartImg(id){
    const c=document.getElementById(id);
    if(!c||!c.width||!c.height)return null;
    try{return c.toDataURL('image/png',1)}catch(_){return null}
  }

  function header(doc,title,sub){
    const w=doc.internal.pageSize.getWidth();
    doc.setFillColor(10,39,67);doc.rect(0,0,w,28,'F');
    doc.setTextColor(255);doc.setFont('helvetica','bold');doc.setFontSize(15);doc.text(title,14,11);
    doc.setFont('helvetica','normal');doc.setFontSize(8);doc.text(sub,14,19);
    doc.setTextColor(35,48,66);
  }

  function footer(doc){
    const n=doc.getNumberOfPages();
    for(let i=1;i<=n;i++){
      doc.setPage(i);
      const w=doc.internal.pageSize.getWidth(),h=doc.internal.pageSize.getHeight();
      doc.setDrawColor(225);doc.line(14,h-11,w-14,h-11);
      doc.setFontSize(7);doc.setTextColor(115);
      doc.text('Reconectadores MT · Delegación Iquique · Gestión de activos',14,h-6);
      doc.text('Página '+i+' de '+n,w-14,h-6,{align:'right'});
    }
  }

  function kpi(doc,label,value,sub,x,y,w=43,h=21){
    doc.setFillColor(255);doc.setDrawColor(224,230,237);doc.roundedRect(x,y,w,h,3,3,'FD');
    doc.setFont('helvetica','normal');doc.setFontSize(6.2);doc.setTextColor(115,125,140);doc.text(label.toUpperCase(),x+4,y+5);
    doc.setFont('helvetica','bold');doc.setFontSize(13);doc.setTextColor(25,40,58);doc.text(String(value),x+4,y+13);
    doc.setFont('helvetica','normal');doc.setFontSize(5.8);doc.setTextColor(115,125,140);
    doc.text(doc.splitTextToSize(String(sub||''),w-8),x+4,y+18);
  }

  function chartBox(doc,id,title,x,y,w,h){
    const img=chartImg(id);if(!img)return false;
    doc.setFillColor(255);doc.setDrawColor(225,230,236);doc.roundedRect(x,y,w,h,3,3,'FD');
    doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.setTextColor(35,50,70);doc.text(title,x+5,y+7);
    doc.addImage(img,'PNG',x+4,y+11,w-8,h-15,'','FAST');
    return true;
  }

  async function build(){
    if(!window.jspdf?.jsPDF)throw new Error('No se pudo cargar jsPDF.');
    const {jsPDF}=window.jspdf;
    const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
    if(typeof doc.autoTable!=='function')throw new Error('No se pudo cargar AutoTable.');

    const rs=rows(),s=stats(rs),t=stamp(),filter=filterLabel(),qs=qSummary(rs);
    const high=s.prioritized.filter(x=>x.p.level==='Alta').length,medium=s.prioritized.filter(x=>x.p.level==='Media').length;
    const backlog=s.prioritized.filter(x=>x.p.score>=20).length;

    header(doc,'Informe de Gestión de Activos MT','Reconectadores MT · '+t.date+' '+t.time+' · '+filter);
    doc.setFont('helvetica','bold');doc.setFontSize(10);doc.text('Resumen ejecutivo',14,39);

    const cards=[
      ['Equipos',s.total,filter],
      ['Disponibilidad',s.availability+'%',s.oper+' operativos'],
      ['Backlog',backlog,high+' alta · '+medium+' media'],
      ['Comunicación remota',pct(s.remote,s.total)+'%',s.remote+' equipos'],
      ['Cobertura inspección',pct(s.inspected,s.total)+'%',s.inspected+' con historial'],
      ['Completitud datos',s.complete+'%',s.geo+' georreferenciados'],
      ['Observaciones',s.obs,'Seguimiento requerido'],
      ['Fuera de servicio',s.off,'Prioridad operacional']
    ];
    cards.forEach((c,i)=>{const col=i%4,row=Math.floor(i/4);kpi(doc,c[0],c[1],c[2],14+col*46,45+row*25);});

    chartBox(doc,'giStatusChart57','Estado operacional',14,102,86,70);
    chartBox(doc,'giPriorityChart57','Prioridad operacional',110,102,86,70);

    doc.setFont('helvetica','bold');doc.setFontSize(9);doc.text('Desempeño por cuadrante',14,183);
    doc.autoTable({
      startY:187,
      head:[['Cuadrante','Gestor','Total','Oper.','Atención','Alta','Disp.']],
      body:qs,
      theme:'striped',
      styles:{fontSize:6.6,cellPadding:2,textColor:[48,60,76]},
      headStyles:{fillColor:[20,78,126],textColor:255},
      columnStyles:{0:{cellWidth:20},1:{cellWidth:48},2:{halign:'center'},3:{halign:'center'},4:{halign:'center'},5:{halign:'center'},6:{halign:'center'}},
      margin:{left:14,right:14,bottom:16}
    });

    doc.addPage();
    header(doc,'Planificación y Prioridades','Apoyo a la gestión del mantenimiento preventivo · '+filter);
    chartBox(doc,'giInspectionChart57','Actividad de inspecciones · últimos 6 meses',14,38,182,68);

    doc.setFont('helvetica','bold');doc.setFontSize(9);doc.text('Ranking de prioridad operacional',14,119);
    const top=s.prioritized.slice(0,20);
    doc.autoTable({
      startY:123,
      head:[['Equipo','Alimentador','Estado','Cuadrante','Gestor','Puntaje','Nivel','Principales brechas']],
      body:top.map(x=>[x.r.codigo||'-',x.r.alimentador||'-',x.r.estado||'-',x.r.cuadrante||'-',x.r.gestor_cuadrante||'-',x.p.score,x.p.level,x.p.reasons.slice(0,4).join(' · ')||'-']),
      theme:'grid',
      styles:{fontSize:6.4,cellPadding:1.8,valign:'top',overflow:'linebreak',textColor:[48,60,76]},
      headStyles:{fillColor:[15,39,69],textColor:255},
      columnStyles:{0:{cellWidth:20},1:{cellWidth:25},2:{cellWidth:24},3:{cellWidth:16},4:{cellWidth:28},5:{cellWidth:14,halign:'center'},6:{cellWidth:16,halign:'center'},7:{cellWidth:39}},
      margin:{left:8,right:8,bottom:18}
    });

    doc.addPage();
    header(doc,'Brechas de Gestión y Calidad de Información','Trazabilidad para planificación y control');

    const noVerif=rs.filter(r=>!r.fecha_verificacion).length;
    const oldVerif=rs.filter(r=>r.fecha_verificacion&&daysSince(r.fecha_verificacion)>1095).length;
    const noGeo=rs.filter(r=>!hasCoords(r)).length;
    const noRemote=rs.filter(r=>comm(r.comunicacion_remota)!=='SI').length;
    const noIns=rs.filter(r=>!s.last.has(r.codigo)).length;

    const gaps=[
      ['Sin fecha de verificación',noVerif,'Completar antecedentes de verificación.'],
      ['Verificación > 3 años',oldVerif,'Revisar vigencia documental y necesidad de actualización.'],
      ['Sin georreferencia',noGeo,'Completar coordenadas para gestión territorial y rutas.'],
      ['Sin comunicación remota',noRemote,'Revisar capacidad de supervisión/operación remota.'],
      ['Sin historial de inspección',noIns,'Incorporar al programa preventivo y registrar evidencia.']
    ];

    gaps.forEach((g,i)=>kpi(doc,g[0],g[1],g[2],14+(i%2)*91,40+Math.floor(i/2)*27,87,23));

    doc.setFont('helvetica','bold');doc.setFontSize(9);doc.text('Líneas de acción de la propuesta de mejora',14,127);
    doc.autoTable({
      startY:132,
      head:[['N°','Línea de acción','Propósito de gestión']],
      body:[
        ['1','Catastro actualizado','Mantener información maestra, condición, ubicación y responsables trazables.'],
        ['2','Matriz de criticidad','Priorizar recursos según condición, impacto operacional y necesidades de intervención.'],
        ['3','Programa de inspecciones','Definir frecuencia, responsables, rutas y seguimiento del cumplimiento preventivo.'],
        ['4','Herramienta digital PC / celular','Centralizar consulta, registro y control de información en terreno.'],
        ['5','Fortalecimiento de competencias internas','Desarrollar capacidades locales y reducir dependencia externa.']
      ],
      theme:'grid',
      styles:{fontSize:7,cellPadding:2.5,valign:'top',textColor:[48,60,76]},
      headStyles:{fillColor:[20,78,126],textColor:255},
      columnStyles:{0:{cellWidth:14,halign:'center'},1:{cellWidth:55},2:{cellWidth:107}},
      margin:{left:14,right:14}
    });

    const y=(doc.lastAutoTable?.finalY||205)+10;
    doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(35,50,70);doc.text('Nota metodológica',14,y);
    doc.setFont('helvetica','normal');doc.setFontSize(6.7);doc.setTextColor(90,102,118);
    const note='El Índice de Prioridad Operacional es un indicador referencial generado automáticamente con los datos disponibles en la aplicación. Considera estado del equipo, BYPASS informado, comunicación remota, fecha de verificación, georreferencia e historial de inspecciones. No reemplaza la matriz formal de criticidad del Proyecto de Título.';
    doc.text(doc.splitTextToSize(note,182),14,y+5);

    footer(doc);
    return {doc,filename:'Gestion_Activos_MT_'+t.file+'.pdf'};
  }

  async function generate(share=false){
    const btn=document.getElementById('pdfGenerate58');
    const shareBtn=null;
    if(btn){btn.disabled=true;btn.textContent='Generando PDF...';}
    try{
      const {doc,filename}=await build();
      doc.save(filename);
      if(typeof toast==='function')toast('Archivo PDF generado correctamente.');
    }catch(e){
      console.error(e);
      if(typeof toast==='function')toast(e.message||'No fue posible generar el PDF.');
      else alert(e.message||'No fue posible generar el PDF.');
    }finally{
      if(btn){btn.disabled=false;btn.textContent='Descargar informe PDF';}
    }
  }

  function install(){
    const host=document.getElementById('gestionContent');
    if(!host||document.getElementById('pdfCenter58'))return;
    const panel=document.createElement('section');
    panel.id='pdfCenter58';
    panel.className='giPanel57';
    panel.style.marginTop='12px';
    panel.innerHTML=`
      <div class="giPanelHead57">
        <div><h3>Centro de Reportes PDF</h3><p>Genera un informe profesional con los filtros y datos actuales de Gestión.</p></div>
        <span class="tag">Reporte ejecutivo</span>
      </div>
      <div style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center">
        <div>
          <div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:9px">
            <span class="giMethod57" style="margin:0;padding:7px 9px">KPIs ejecutivos</span>
            <span class="giMethod57" style="margin:0;padding:7px 9px">Prioridad operacional</span>
            <span class="giMethod57" style="margin:0;padding:7px 9px">Cuadrantes y gestores</span>
            <span class="giMethod57" style="margin:0;padding:7px 9px">Brechas preventivas</span>
            <span class="giMethod57" style="margin:0;padding:7px 9px">Plan de mejora</span>
          </div>
          <p style="margin:0;font-size:9px;color:#748396;line-height:1.5">El PDF utiliza los filtros activos de esta pantalla. Si filtras por cuadrante, estado, gestor o comunicación remota, el informe se genera con esa misma selección.</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end">
          <button id="pdfGenerate58" class="btn primary" type="button">Descargar informe PDF</button>
        </div>
      </div>`;
    host.appendChild(panel);
    document.getElementById('pdfGenerate58')?.addEventListener('click',()=>generate(false));
  }

  window.generarInformeGestionPDF=()=>generate(false);
  document.addEventListener('click',e=>{if(e.target.closest('[data-view="gestion"]'))setTimeout(install,160);});
  const host=document.getElementById('gestionContent');
  if(host)new MutationObserver(()=>setTimeout(install,20)).observe(host,{childList:true});
  setTimeout(install,1300);
})();