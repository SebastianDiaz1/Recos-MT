// Informe PDF compacto y efectivo de Gestión.
(function(){
  const pct=(n,d)=>d?Math.round(n*100/d):0;
  const rowsAll=()=>window.state?.reconectadores||[];
  const inspections=()=>window.state?.inspecciones||[];
  const fmtDate=v=>{if(!v)return '-';const d=new Date(v+'T00:00:00');return Number.isNaN(d.getTime())?String(v):d.toLocaleDateString('es-CL');};
  function stamp(){const d=new Date();return {date:d.toLocaleDateString('es-CL'),time:d.toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'}),file:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}-${String(d.getMinutes()).padStart(2,'0')}`};}
  function filteredRows(){
    const q=document.getElementById('gQuadrant')?.value||'';
    const st=document.getElementById('gStatus')?.value||'';
    const gs=document.getElementById('gGestor')?.value||'';
    return rowsAll().filter(r=>(!q||String(r.cuadrante||'')===q)&&(!st||r.estado===st)&&(!gs||String(r.gestor_cuadrante||'')===gs));
  }
  function filterLabel(){const a=[];const q=document.getElementById('gQuadrant')?.value||'',s=document.getElementById('gStatus')?.value||'',g=document.getElementById('gGestor')?.value||'';if(q)a.push('Cuadrante '+q);if(s)a.push(s);if(g)a.push(g);return a.join(' / ')||'Vista general';}
  function stats(rows){
    const total=rows.length,oper=rows.filter(r=>r.estado==='Operativo').length,obs=rows.filter(r=>r.estado==='Con observaciones').length,fuera=rows.filter(r=>r.estado==='Fuera de servicio').length;
    const conFecha=rows.filter(r=>r.fecha_verificacion).length,geo=rows.filter(r=>Number.isFinite(Number(r.lat))&&Number.isFinite(Number(r.lon))).length;
    const now=new Date(),codes=new Set(rows.map(r=>r.codigo));
    const monthIns=inspections().filter(i=>{if(!i.fecha||!codes.has(i.equipo))return false;const d=new Date(i.fecha+'T00:00:00');return d.getFullYear()===now.getFullYear()&&d.getMonth()===now.getMonth();}).length;
    return {total,oper,obs,fuera,conFecha,geo,monthIns};
  }
  function qSummary(rows){
    const keys=[...new Set(rows.map(r=>String(r.cuadrante||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
    const out=keys.map(q=>{const a=rows.filter(r=>String(r.cuadrante||'').trim()===q),op=a.filter(r=>r.estado==='Operativo').length,gs=[...new Set(a.map(r=>String(r.gestor_cuadrante||'').trim()).filter(Boolean))];return [q,gs.join(' / ')||'-',a.length,op,a.filter(r=>r.estado==='Con observaciones').length,a.filter(r=>r.estado==='Fuera de servicio').length,pct(op,a.length)+'%'];});
    const none=rows.filter(r=>!String(r.cuadrante||'').trim());if(none.length){const op=none.filter(r=>r.estado==='Operativo').length;out.push(['Sin asignar','-',none.length,op,none.filter(r=>r.estado==='Con observaciones').length,none.filter(r=>r.estado==='Fuera de servicio').length,pct(op,none.length)+'%']);}
    return out;
  }
  // Pendiente real: condición operacional o falta de fecha. No se considera falta de gestor/cuadrante porque puede ser intencional.
  function pending(rows){return rows.filter(r=>r.estado!=='Operativo'||!r.fecha_verificacion).sort((a,b)=>{const rank=x=>x.estado==='Fuera de servicio'?0:x.estado==='Con observaciones'?1:2;return rank(a)-rank(b)||String(a.codigo).localeCompare(String(b.codigo),'es',{numeric:true});});}
  function reason(r){const a=[];if(r.estado!=='Operativo')a.push(r.estado);if(!r.fecha_verificacion)a.push('Sin fecha de verificación');return a.join(' · ')||'-';}
  function addHeader(doc,title,sub){const w=doc.internal.pageSize.getWidth();doc.setFillColor(15,39,69);doc.rect(0,0,w,25,'F');doc.setTextColor(255);doc.setFont('helvetica','bold');doc.setFontSize(14);doc.text(title,14,11);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.text(sub,14,18);doc.setTextColor(32,43,58);}
  function footer(doc){const n=doc.getNumberOfPages();for(let i=1;i<=n;i++){doc.setPage(i);const w=doc.internal.pageSize.getWidth(),h=doc.internal.pageSize.getHeight();doc.setDrawColor(225);doc.line(14,h-11,w-14,h-11);doc.setFontSize(7);doc.setTextColor(115);doc.text('Reconectadores MT · Delegación Iquique',14,h-6);doc.text(`Página ${i} de ${n}`,w-14,h-6,{align:'right'});}}
  function chart(doc,id,title,x,y,w,h){const c=document.getElementById(id);if(!c||!c.width||!c.height)return false;let img;try{img=c.toDataURL('image/png',1);}catch(_){return false;}if(!img)return false;doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(35,50,70);doc.text(title,x,y);doc.setDrawColor(228);doc.roundedRect(x,y+3,w,h,2,2,'S');doc.addImage(img,'PNG',x+3,y+6,w-6,h-9,'','FAST');return true;}
  function recentInspections(rows){const codes=new Set(rows.map(r=>r.codigo));return inspections().filter(i=>codes.has(i.equipo)&&i.fecha).sort((a,b)=>String(b.fecha).localeCompare(String(a.fecha))).slice(0,15);}
  async function buildPdf(){
    if(!window.jspdf?.jsPDF)throw new Error('No se pudo cargar el generador PDF.');
    const {jsPDF}=window.jspdf,doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
    if(typeof doc.autoTable!=='function')throw new Error('No se pudo cargar el módulo de tablas PDF.');
    const rows=filteredRows(),s=stats(rows),t=stamp(),filter=filterLabel(),pend=pending(rows),qrows=qSummary(rows),recent=recentInspections(rows);
    addHeader(doc,'Informe de Gestión - Reconectadores MT',`Delegación Iquique · ${t.date} ${t.time} · ${filter}`);
    doc.setFont('helvetica','bold');doc.setFontSize(15);doc.text('Resumen ejecutivo',14,37);
    doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(75,88,105);
    const text=`Se consideran ${s.total} equipos en la vista seleccionada. ${s.oper} están operativos (${pct(s.oper,s.total)}%), ${s.obs} presentan observaciones y ${s.fuera} se encuentran fuera de servicio. La cobertura de fecha de verificación es ${pct(s.conFecha,s.total)}% y la georreferenciación alcanza ${pct(s.geo,s.total)}%.`;
    doc.text(doc.splitTextToSize(text,180),14,45);
    const cards=[['Equipos',s.total],['Operativos',s.oper],['Disponibilidad',pct(s.oper,s.total)+'%'],['Observaciones',s.obs],['Fuera servicio',s.fuera],['Verificados',pct(s.conFecha,s.total)+'%']];
    cards.forEach((c,i)=>{const col=i%3,row=Math.floor(i/3),x=14+col*61,y=64+row*23;doc.setFillColor(247,249,252);doc.setDrawColor(226,231,237);doc.roundedRect(x,y,56,18,2,2,'FD');doc.setFont('helvetica','normal');doc.setFontSize(7);doc.setTextColor(112);doc.text(String(c[0]).toUpperCase(),x+4,y+5);doc.setFont('helvetica','bold');doc.setFontSize(13);doc.setTextColor(25,38,58);doc.text(String(c[1]),x+4,y+13);});
    let y=116;
    const chart1=chart(doc,'gStatusChart','Estado de la flota',14,y,86,58);
    const chart2=chart(doc,'gQuadrantChart','Equipos por cuadrante',110,y,86,58);
    if(chart1||chart2)y+=68;
    doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(35,50,70);doc.text('Resumen por cuadrante / gestor',14,y);
    doc.autoTable({startY:y+4,head:[['Cuad.','Gestor','Total','Oper.','Obs.','Fuera','Disp.']],body:qrows,theme:'striped',styles:{fontSize:7,cellPadding:2,textColor:[50,62,78]},headStyles:{fillColor:[23,76,128],textColor:255},columnStyles:{0:{cellWidth:20},1:{cellWidth:50},2:{halign:'center'},3:{halign:'center'},4:{halign:'center'},5:{halign:'center'},6:{halign:'center'}},margin:{left:14,right:14,bottom:16}});

    if(pend.length){
      doc.addPage();addHeader(doc,'Equipos que requieren atención',`${pend.length} equipos detectados en la vista actual`);
      doc.autoTable({startY:34,head:[['Equipo','Alimentador','Estado','Cuad.','Gestor','Verificación','Motivo','Observaciones']],body:pend.map(r=>[r.codigo||'-',r.alimentador||'-',r.estado||'-',r.cuadrante||'-',r.gestor_cuadrante||'-',fmtDate(r.fecha_verificacion),reason(r),r.observaciones||'-']),theme:'grid',styles:{fontSize:6.6,cellPadding:1.7,valign:'top',overflow:'linebreak',textColor:[48,60,76]},headStyles:{fillColor:[15,39,69],textColor:255},columnStyles:{0:{cellWidth:20},1:{cellWidth:24},2:{cellWidth:22},3:{cellWidth:13},4:{cellWidth:26},5:{cellWidth:20},6:{cellWidth:25},7:{cellWidth:38}},margin:{left:8,right:8,bottom:16}});
    }

    // Detalle operativo: solo columnas útiles y con datos reales.
    doc.addPage();addHeader(doc,'Detalle operativo de equipos',`${rows.length} equipos · datos efectivos de la base maestra`);
    doc.autoTable({startY:34,head:[['Equipo','Alimentador','Estado','Cuad.','Gestor','Verificación','Fase','Residual']],body:rows.map(r=>[r.codigo||'-',r.alimentador||'-',r.estado||'-',r.cuadrante||'-',r.gestor_cuadrante||'-',fmtDate(r.fecha_verificacion),r.sobrecorriente_fase||'-',r.sobrecorriente_residual||'-']),theme:'striped',styles:{fontSize:6.8,cellPadding:1.8,textColor:[48,60,76]},headStyles:{fillColor:[23,76,128],textColor:255},columnStyles:{0:{cellWidth:25},1:{cellWidth:30},2:{cellWidth:25},3:{cellWidth:14},4:{cellWidth:31},5:{cellWidth:23},6:{cellWidth:18},7:{cellWidth:18}},margin:{left:8,right:8,bottom:16}});

    if(recent.length){
      const start=(doc.lastAutoTable?.finalY||34)+10;
      if(start>220){doc.addPage();addHeader(doc,'Inspecciones recientes','Últimos registros disponibles');}
      const iy=start>220?34:start;
      doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(35,50,70);doc.text('Inspecciones recientes',14,iy);
      doc.autoTable({startY:iy+4,head:[['Fecha','Equipo','Inspector','Resultado','Comunicación','Observaciones']],body:recent.map(i=>[fmtDate(i.fecha),i.equipo||'-',i.inspector||'-',i.resultado||'-',i.comunicaciones||'-',i.observaciones||'-']),theme:'grid',styles:{fontSize:6.8,cellPadding:1.8,valign:'top'},headStyles:{fillColor:[23,76,128],textColor:255},margin:{left:14,right:14,bottom:16}});
    }
    footer(doc);
    return {doc,filename:`Gestion_Reconectadores_MT_${t.file}.pdf`};
  }
  async function generate(preferShare){
    const btn=document.getElementById('enviarGestionCorreoPDF');if(btn){btn.disabled=true;btn.textContent='Generando PDF...';}
    try{const {doc,filename}=await buildPdf(),blob=doc.output('blob'),file=new File([blob],filename,{type:'application/pdf'});if(preferShare&&navigator.share&&navigator.canShare?.({files:[file]})){await navigator.share({title:'Informe de Gestión Reconectadores MT',text:'Adjunto informe de gestión de Reconectadores MT.',files:[file]});}else{doc.save(filename);if(typeof toast==='function')toast('PDF generado correctamente.');}}
    catch(err){console.error(err);if(typeof toast==='function')toast(err.message||'No fue posible generar el PDF');else alert(err.message||'No fue posible generar el PDF');}
    finally{if(btn){btn.disabled=false;btn.textContent='📄 Generar / compartir PDF';}}
  }
  function install(){const old=document.getElementById('enviarGestionCorreo')||document.getElementById('enviarGestionCorreoPDF');if(!old)return;if(old.id!=='enviarGestionCorreoPDF'){const b=old.cloneNode(true);b.id='enviarGestionCorreoPDF';old.replaceWith(b);}const btn=document.getElementById('enviarGestionCorreoPDF');btn.textContent='📄 Generar / compartir PDF';btn.onclick=()=>generate(true);const sm=document.querySelector('#gestionRespaldoBar small');if(sm)sm.textContent='Informe compacto con datos efectivos, gráficos, cuadrantes, pendientes reales y detalle operativo.';}
  document.addEventListener('click',e=>{if(e.target.closest('[data-view="gestion"]'))setTimeout(install,180);});
  const host=document.getElementById('gestionContent');if(host)new MutationObserver(()=>setTimeout(install,0)).observe(host,{childList:true,subtree:true});
  setTimeout(install,1200);window.generarInformeGestionPDF=()=>generate(false);
})();