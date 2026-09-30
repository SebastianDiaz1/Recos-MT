// Respaldo de Gestión por correo + fecha y hora en Inicio.
(function(){
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function pct(n,d){return d?Math.round(n*100/d):0;}
  function fechaHora(d=new Date()){
    return {
      fecha:d.toLocaleDateString('es-CL',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}),
      hora:d.toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit',second:'2-digit'})
    };
  }

  function ensureStyles(){
    if(document.getElementById('respaldoGestionStyles'))return;
    const s=document.createElement('style');s.id='respaldoGestionStyles';s.textContent=`
      .inicioClock{display:inline-flex;align-items:center;gap:12px;margin:14px 0 2px;padding:10px 13px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);border-radius:12px;backdrop-filter:blur(6px)}
      .inicioClockIcon{font-size:20px}.inicioClock strong{display:block;font-size:14px}.inicioClock small{display:block;opacity:.8;margin-top:2px;text-transform:capitalize}
      .gestionRespaldoBar{display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:14px;padding:12px 14px;background:#fff;border:1px solid #e1e6ec;border-radius:13px;box-shadow:0 2px 8px rgba(16,34,58,.04)}
      .gestionRespaldoBar strong{display:block;color:#182438}.gestionRespaldoBar small{display:block;color:#708094;margin-top:3px}.gestionRespaldoActions{display:flex;gap:8px;flex-wrap:wrap}.gestionMailBtn{white-space:nowrap}
      @media(max-width:600px){.gestionRespaldoActions,.gestionMailBtn{width:100%}.gestionMailBtn{justify-content:center}.inicioClock{display:flex;width:100%;box-sizing:border-box}}
    `;document.head.appendChild(s);
  }

  function ensureClock(){
    ensureStyles();
    const heroText=document.querySelector('#inicio .hero > div:first-child');
    if(!heroText)return;
    let clock=document.getElementById('inicioClock');
    if(!clock){
      clock=document.createElement('div');clock.id='inicioClock';clock.className='inicioClock';
      const buttons=heroText.querySelector('.hero-buttons');
      if(buttons)heroText.insertBefore(clock,buttons);else heroText.appendChild(clock);
    }
    const f=fechaHora();
    clock.innerHTML=`<div class="inicioClockIcon">🕒</div><div><strong id="inicioHora">${esc(f.hora)}</strong><small id="inicioFecha">${esc(f.fecha)}</small></div>`;
  }

  function updateClock(){
    const f=fechaHora();
    const h=document.getElementById('inicioHora'),d=document.getElementById('inicioFecha');
    if(h)h.textContent=f.hora;if(d)d.textContent=f.fecha;
  }

  function gestionRows(){
    const all=(window.state?.reconectadores||state?.reconectadores||[]);
    const q=document.getElementById('gQuadrant')?.value||'';
    const st=document.getElementById('gStatus')?.value||'';
    const gestorSel=document.getElementById('gGestor')?.value||'';
    return all.filter(r=>(!q||String(r.cuadrante||'')===q)&&(!st||r.estado===st)&&(!gestorSel||String(r.gestor_cuadrante||'')===gestorSel));
  }

  function buildResumen(){
    const rows=gestionRows();
    const all=(window.state?.reconectadores||state?.reconectadores||[]);
    const ins=(window.state?.inspecciones||state?.inspecciones||[]);
    const oper=rows.filter(r=>r.estado==='Operativo').length;
    const obs=rows.filter(r=>r.estado==='Con observaciones').length;
    const fuera=rows.filter(r=>r.estado==='Fuera de servicio').length;
    const conGestor=rows.filter(r=>String(r.gestor_cuadrante||'').trim()).length;
    const conCuadrante=rows.filter(r=>String(r.cuadrante||'').trim()).length;
    const conFecha=rows.filter(r=>r.fecha_verificacion).length;
    const now=new Date(),f=fechaHora(now);
    const mesIns=ins.filter(i=>{if(!i.fecha)return false;const d=new Date(i.fecha+'T00:00:00');return d.getFullYear()===now.getFullYear()&&d.getMonth()===now.getMonth()&&rows.some(r=>r.codigo===i.equipo);}).length;
    const q=document.getElementById('gQuadrant')?.value||'';
    const st=document.getElementById('gStatus')?.value||'';
    const filtros=[];if(q)filtros.push('Cuadrante '+q);if(st)filtros.push(st);
    const gestores=[...new Set(rows.map(r=>String(r.gestor_cuadrante||'').trim()).filter(Boolean))];
    const pendientes=rows.filter(r=>r.estado!=='Operativo'||!r.fecha_verificacion||!String(r.cuadrante||'').trim()||!String(r.gestor_cuadrante||'').trim()).sort((a,b)=>{
      const rank=x=>x.estado==='Fuera de servicio'?0:x.estado==='Con observaciones'?1:!x.fecha_verificacion?2:!x.gestor_cuadrante?3:4;
      return rank(a)-rank(b)||String(a.codigo).localeCompare(String(b.codigo),'es',{numeric:true});
    });
    const lines=[];
    lines.push('RESPALDO DE GESTIÓN - RECONECTADORES MT');
    lines.push('Delegación Iquique');
    lines.push('Fecha: '+f.fecha);
    lines.push('Hora: '+f.hora);
    lines.push('Vista: '+(filtros.length?filtros.join(' / '):'General'));
    lines.push('');
    lines.push('RESUMEN');
    lines.push('Equipos en vista: '+rows.length+' de '+all.length);
    lines.push('Operativos: '+oper+' ('+pct(oper,rows.length)+'%)');
    lines.push('Con observaciones: '+obs);
    lines.push('Fuera de servicio: '+fuera);
    lines.push('Con fecha de verificación: '+conFecha+' ('+pct(conFecha,rows.length)+'%)');
    lines.push('Con cuadrante: '+conCuadrante+' ('+pct(conCuadrante,rows.length)+'%)');
    lines.push('Con gestor: '+conGestor+' ('+pct(conGestor,rows.length)+'%)');
    lines.push('Inspecciones del mes: '+mesIns);
    if(gestores.length)lines.push('Gestores asociados: '+gestores.join(', '));
    lines.push('');
    lines.push('PENDIENTES / ATENCIÓN');
    if(!pendientes.length)lines.push('Sin pendientes detectados en la vista actual.');
    else pendientes.slice(0,25).forEach((r,i)=>{
      const causas=[];
      if(r.estado!=='Operativo')causas.push(r.estado);
      if(!r.fecha_verificacion)causas.push('sin fecha de verificación');
      if(!String(r.cuadrante||'').trim())causas.push('sin cuadrante');
      if(!String(r.gestor_cuadrante||'').trim())causas.push('sin gestor');
      lines.push(`${i+1}. ${r.codigo} | ${r.alimentador||'-'} | ${causas.join(', ')}`);
    });
    if(pendientes.length>25)lines.push(`... y ${pendientes.length-25} pendientes adicionales.`);
    lines.push('');
    lines.push('Respaldo generado desde la aplicación Reconectadores MT.');
    return {texto:lines.join('\n'),fecha:f.fecha,rows:rows.length};
  }

  function sendMail(){
    const r=buildResumen();
    const subject=`Respaldo Gestión Reconectadores MT - ${new Date().toLocaleDateString('es-CL')}`;
    const url=`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(r.texto)}`;
    window.location.href=url;
  }

  async function copyResumen(){
    const r=buildResumen();
    try{
      await navigator.clipboard.writeText(r.texto);
      if(typeof toast==='function')toast('Resumen de gestión copiado');
      else alert('Resumen de gestión copiado.');
    }catch(_){
      const ta=document.createElement('textarea');ta.value=r.texto;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();
      if(typeof toast==='function')toast('Resumen de gestión copiado');
    }
  }

  function ensureGestionBar(){
    ensureStyles();
    const host=document.getElementById('gestionContent');if(!host)return;
    let bar=document.getElementById('gestionRespaldoBar');
    if(bar)return;
    bar=document.createElement('div');bar.id='gestionRespaldoBar';bar.className='gestionRespaldoBar';
    const f=fechaHora();
    bar.innerHTML=`<div><strong>Respaldo de Gestión</strong><small>Genera un resumen de la vista actual · ${esc(f.fecha)} · ${esc(f.hora)}</small></div><div class="gestionRespaldoActions"><button id="copiarGestion" class="btn secondary" type="button">Copiar resumen</button><button id="enviarGestionCorreo" class="btn primary gestionMailBtn" type="button">✉ Enviar gestión por correo</button></div>`;
    host.prepend(bar);
    document.getElementById('enviarGestionCorreo')?.addEventListener('click',sendMail);
    document.getElementById('copiarGestion')?.addEventListener('click',copyResumen);
  }

  ensureClock();updateClock();setInterval(updateClock,1000);
  ensureGestionBar();
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-view="inicio"]'))setTimeout(()=>{ensureClock();updateClock();},40);
    if(e.target.closest('[data-view="gestion"]'))setTimeout(ensureGestionBar,120);
  });
  const g=document.getElementById('gestionContent');
  if(g)new MutationObserver(()=>setTimeout(ensureGestionBar,0)).observe(g,{childList:true});
  setTimeout(()=>{ensureClock();ensureGestionBar();},1000);
})();

// Carga diferida del generador de informe PDF para no afectar el arranque de la app.
(function(){
  function load(src,id){return new Promise((resolve,reject)=>{if(id&&document.getElementById(id)){resolve();return;}const s=document.createElement('script');if(id)s.id=id;s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});}
  async function boot(){
    try{
      await load('https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js','jspdfLib');
      await load('https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.4/dist/jspdf.plugin.autotable.min.js','jspdfAutoTableLib');
      await load('gestion-pdf.js?v=38','gestionPdfModule');
    }catch(err){console.error('No se pudo cargar el módulo PDF de Gestión',err);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();