// Informe PDF detallado de Gestión con gráficos, tablas y opción de compartir.
(function(){
  function esc(v){return String(v??'');}
  function pct(n,d){return d?Math.round(n*100/d):0;}
  function fmtDate(v){if(!v)return '-';const d=new Date(v+'T00:00:00');return Number.isNaN(d.getTime())?String(v):d.toLocaleDateString('es-CL');}
  function nowText(){const d=new Date();return {date:d.toLocaleDateString('es-CL',{day:'2-digit',month:'2-digit',year:'numeric'}),time:d.toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'}),stamp:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}-${String(d.getMinutes()).padStart(2,'0')}`};}
  function allRows(){return window.state?.reconectadores||[];}
  function inspections(){return window.state?.inspecciones||[];}
  function currentRows(){
    const q=document.getElementById('gQuadrant')?.value||'';
    const st=document.getElementById('gStatus')?.value||'';
    const gs=document.getElementById('gGestor')?.value||'';
    return allRows().filter(r=>(!q||String(r.cuadrante||'')===q)&&(!st||r.estado===st)&&(!gs||String(r.gestor_cuadrante||'')===gs));
  }
  function currentFilterLabel(){
    const parts=[];
    const q=document.getElementById('gQuadrant')?.value||'';
    const st=document.getElementById('gStatus')?.value||'';
    const gs=document.getElementById('gGestor')?.value||'';
    if(q)parts.push('Cuadrante '+q);if(st)parts.push(st);if(gs)parts.push(gs);
    return parts.length?parts.join(' / '):'Vista general';
  }
  function stats(rows){
    const total=rows.length;
    const oper=rows.filter(r=>r.estado==='Operativo').length;
    const obs=rows.filter(r=>r.estado==='Con observaciones').length;
    const fuera=rows.filter(r=>r.estado==='Fuera de servicio').length;
    const conFecha=rows.filter(r=>r.fecha_verificacion).length;
    const conCuadrante=rows.filter(r=>String(r.cuadrante||'').trim()).length;
    const conGestor=rows.filter(r=>String(r.gestor_cuadrante||'').trim()).length;
    const geo=rows.filter(r=>Number.isFinite(Number(r.lat))&&Number.isFinite(Number(r.lon))).length;
    const now=new Date();
    const monthIns=inspections().filter(i=>{if(!i.fecha)return false;const d=new Date(i.fecha+'T00:00:00');return d.getFullYear()===now.getFullYear()&&d.getMonth()===now.getMonth()&&rows.some(r=>r.codigo===i.equipo);}).length;
    return {total,oper,obs,fuera,conFecha,conCuadrante,conGestor,geo,monthIns};
  }
  function quadrantSummary(rows){
    const qs=[...new Set(rows.map(r=>String(r.cuadrante||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
    const out=qs.map(q=>{
      const arr=rows.filter(r=>String(r.cuadrante||'').trim()===q);
      const gestores=[...new Set(arr.map(r=>String(r.gestor_cuadrante||'').trim()).filter(Boolean))];
      const oper=arr.filter(r=>r.estado==='Operativo').length;
      return [q,gestores.join(' / ')||'Sin gestor',arr.length,oper,arr.filter(r=>r.estado==='Con observaciones').length,arr.filter(r=>r.estado==='Fuera de servicio').length,pct(oper,arr.length)+'%'];
    });
    const noQ=rows.filter(r=>!String(r.cuadrante||'').trim());
    if(noQ.length){const oper=noQ.filter(r=>r.estado==='Operativo').length;out.push(['Sin asignar','Sin gestor',noQ.length,oper,noQ.filter(r=>r.estado==='Con observaciones').length,noQ.filter(r=>r.estado==='Fuera de servicio').length,pct(oper,noQ.length)+'%']);}
    return out;
  }
  function pendingRows(rows){
    return rows.filter(r=>r.estado!=='Operativo'||!r.fecha_verificacion||!String(r.cuadrante||'').trim()||!String(r.gestor_cuadrante||'').trim()).sort((a,b)=>{
      const rank=x=>x.estado==='Fuera de servicio'?0:x.estado==='Con observaciones'?1:!x.fecha_verificacion?2:!x.gestor_cuadrante?3:4;
      return rank(a)-rank(b)||String(a.codigo).localeCompare(String(b.codigo),'es',{numeric:true});
    });
  }
  function causes(r){const a=[];if(r.estado!=='Operativo')a.push(r.estado);if(!r.fecha_verificacion)a.push('Sin fecha de verificación');if(!String(r.cuadrante||'').trim())a.push('Sin cuadrante');if(!String(r.gestor_cuadrante||'').trim())a.push('Sin gestor');return a.join(' · ')||'-';}
  function addHeader(doc,title,subtitle){
    const w=doc.internal.pageSize.getWidth();
    doc.setFillColor(15,39,69);doc.rect(0,0,w,28,'F');
    doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(15);doc.text(title,14,12);
    doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.text(subtitle,14,19);
    doc.setTextColor(30,42,58);
  }
  function addFooter(doc){
    const pages=doc.getNumberOfPages();
    for(let i=1;i<=pages;i++){
      doc.setPage(i);const w=doc.internal.pageSize.getWidth(),h=doc.internal.pageSize.getHeight();
      doc.setDrawColor(225,230,236);doc.line(14,h-12,w-14,h-12);
      doc.setFontSize(7.5);doc.setTextColor(110,120,135);doc.text('Reconectadores MT · Delegación Iquique',14,h-7);doc.text(`Página ${i} de ${pages}`,w-14,h-7,{align:'right'});
    }
  }
  function chartImage(id){const c=document.getElementById(id);try{return c?.toDataURL('image/png',1)||null}catch(_){return null}}
  function addChart(doc,id,title,x,y,w,h){
    const img=chartImage(id);doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(35,50,70);doc.text(title,x,y);
    doc.setDrawColor(225,230,236);doc.roundedRect(x,y+3,w,h,2,2,'S');
    if(img)doc.addImage(img,'PNG',x+3,y+6,w-6,h-9,'','FAST');else{doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(120);doc.text('Gráfico no disponible en esta vista.',x+6,y+16);}
  }
  async function buildPdf(){
    if(!window.jspdf?.jsPDF)throw new Error('No se pudo cargar el generador PDF.');
    const {jsPDF}=window.jspdf;const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
    if(typeof doc.autoTable!=='function')throw new Error('No se pudo cargar el módulo de tablas PDF.');
    const rows=currentRows(),s=stats(rows),t=nowText(),filter=currentFilterLabel();
    addHeader(doc,'Informe de Gestión - Reconectadores MT',`Delegación Iquique · Emitido ${t.date} ${t.time} · ${filter}`);
    doc.setFont('helvetica','bold');doc.setFontSize(16);doc.setTextColor(24,36,56);doc.text('Resumen ejecutivo',14,42);
    doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(80,92,108);
    const summary=`La vista contiene ${s.total} equipos. ${s.oper} se encuentran operativos (${pct(s.oper,s.total)}%), ${s.obs} con observaciones y ${s.fuera} fuera de servicio. ${s.conFecha} equipos tienen fecha de verificación registrada y ${s.monthIns} inspecciones corresponden al mes actual.`;
    doc.text(doc.splitTextToSize(summary,180),14,50);
    const cards=[['Equipos',s.total],['Disponibilidad',pct(s.oper,s.total)+'%'],['Atención',s.obs+s.fuera],['Georreferenciados',pct(s.geo,s.total)+'%'],['Con fecha',pct(s.conFecha,s.total)+'%'],['Con gestor',pct(s.conGestor,s.total)+'%']];
    cards.forEach((c,i)=>{const col=i%3,row=Math.floor(i/3),x=14+col*61,y=68+row*25;doc.setFillColor(247,249,252);doc.setDrawColor(226,231,237);doc.roundedRect(x,y,56,20,2,2,'FD');doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(115,125,140);doc.text(String(c[0]).toUpperCase(),x+4,y+6);doc.setFont('helvetica','bold');doc.setFontSize(15);doc.setTextColor(25,38,58);doc.text(String(c[1]),x+4,y+15);});
    doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(35,50,70);doc.text('Cobertura de información',14,125);
    doc.autoTable({startY:130,head:[['Indicador','Cantidad','Cobertura']],body:[['Fecha de verificación',s.conFecha,pct(s.conFecha,s.total)+'%'],['Cuadrante asignado',s.conCuadrante,pct(s.conCuadrante,s.total)+'%'],['Gestor asignado',s.conGestor,pct(s.conGestor,s.total)+'%'],['Coordenadas',s.geo,pct(s.geo,s.total)+'%'],['Inspecciones del mes',s.monthIns,'-']],theme:'grid',styles:{fontSize:8,cellPadding:2.5,textColor:[55,68,85]},headStyles:{fillColor:[23,76,128],textColor:255},margin:{left:14,right:14}});

    doc.addPage();addHeader(doc,'Gráficos de Gestión','Estado operacional, distribución y actividad');
    addChart(doc,'gStatusChart','Estado de la flota',14,38,86,62);
    addChart(doc,'gQuadrantChart','Equipos por cuadrante',110,38,86,62);
    addChart(doc,'gInspectionChart','Actividad de inspecciones',14,112,182,62);
    addChart(doc,'gBrandChart','Equipos por referencia',14,186,86,62);
    addChart(doc,'gDataChart','Calidad de información',110,186,86,62);

    doc.addPage();addHeader(doc,'Resumen por cuadrante y gestor','Responsables, condición y disponibilidad');
    doc.autoTable({startY:36,head:[['Cuadrante','Gestor','Total','Oper.','Obs.','Fuera','Disp.']],body:quadrantSummary(rows),theme:'striped',styles:{fontSize:7.5,cellPadding:2.4,textColor:[50,62,78]},headStyles:{fillColor:[15,39,69],textColor:255},columnStyles:{0:{cellWidth:22},1:{cellWidth:50},2:{halign:'center'},3:{halign:'center'},4:{halign:'center'},5:{halign:'center'},6:{halign:'center'}},margin:{left:14,right:14}});

    const pending=pendingRows(rows);
    doc.addPage();addHeader(doc,'Pendientes de Gestión','Equipos que requieren revisión o completitud de información');
    const pbody=pending.length?pending.map(r=>[r.codigo||'-',r.alimentador||'-',r.estado||'-',r.cuadrante||'Sin asignar',r.gestor_cuadrante||'Sin gestor',fmtDate(r.fecha_verificacion),causes(r),r.observaciones||'-']):[['-','-','-','-','-','-','Sin pendientes detectados','-']];
    doc.autoTable({startY:36,head:[['Equipo','Alimentador','Estado','Cuad.','Gestor','Verificación','Motivo','Observaciones']],body:pbody,theme:'grid',styles:{fontSize:6.5,cellPadding:1.8,valign:'top',overflow:'linebreak',textColor:[48,60,76]},headStyles:{fillColor:[23,76,128],textColor:255,fontSize:6.5},columnStyles:{0:{cellWidth:20},1:{cellWidth:24},2:{cellWidth:22},3:{cellWidth:14},4:{cellWidth:27},5:{cellWidth:20},6:{cellWidth:31},7:{cellWidth:32}},margin:{left:8,right:8,bottom:18}});

    addFooter(doc);
    return {doc,filename:`Gestion_Reconectadores_MT_${t.stamp}.pdf`,rows:s.total};
  }
  async function generateOrShare(preferShare){
    const btn=document.getElementById('enviarGestionCorreoPDF');if(btn){btn.disabled=true;btn.textContent='Generando PDF...';}
    try{
      const {doc,filename}=await buildPdf();const blob=doc.output('blob');const file=new File([blob],filename,{type:'application/pdf'});
      if(preferShare&&navigator.share&&navigator.canShare?.({files:[file]})){
        await navigator.share({title:'Informe de Gestión Reconectadores MT',text:'Adjunto respaldo de Gestión de Reconectadores MT.',files:[file]});
      }else{
        doc.save(filename);
        const subject=`Informe de Gestión Reconectadores MT - ${new Date().toLocaleDateString('es-CL')}`;
        const body='Se adjunta informe PDF de Gestión de Reconectadores MT generado desde la aplicación.\n\nEl PDF fue descargado en este equipo para ser adjuntado al correo.';
        setTimeout(()=>{window.location.href=`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;},500);
        if(typeof toast==='function')toast('PDF generado. Adjunta el archivo descargado al correo.');
      }
    }catch(err){console.error(err);if(typeof toast==='function')toast(err.message||'No fue posible generar el PDF');else alert(err.message||'No fue posible generar el PDF');}
    finally{if(btn){btn.disabled=false;btn.textContent='📄 Generar / compartir PDF';}}
  }
  function installButton(){
    const old=document.getElementById('enviarGestionCorreo');if(!old)return;
    if(document.getElementById('enviarGestionCorreoPDF'))return;
    const btn=old.cloneNode(true);btn.id='enviarGestionCorreoPDF';btn.textContent='📄 Generar / compartir PDF';old.replaceWith(btn);
    btn.addEventListener('click',()=>generateOrShare(true));
    const bar=document.getElementById('gestionRespaldoBar');const sm=bar?.querySelector('small');if(sm)sm.textContent='Genera un informe PDF detallado con KPI, gráficos, cuadrantes, gestores y pendientes.';
  }
  document.addEventListener('click',e=>{if(e.target.closest('[data-view="gestion"]'))setTimeout(installButton,180);});
  const host=document.getElementById('gestionContent');if(host)new MutationObserver(()=>setTimeout(installButton,0)).observe(host,{childList:true,subtree:true});
  setTimeout(installButton,1200);
  window.generarInformeGestionPDF=()=>generateOrShare(false);
})();