// v52 · Ficha técnica operacional unificada.
(function(){
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function txt(v,f='-'){const s=String(v??'').trim();return s||f;}
  function comm(v){const s=String(v||'').trim().toUpperCase();return s==='SI'?'SI':s==='NO'?'NO':'Sin registro';}
  function statusClass(s){return s==='Fuera de servicio'?'danger':s==='Con observaciones'?'warn':'ok';}
  function statusIcon(s){return s==='Fuera de servicio'?'⛔':s==='Con observaciones'?'⚠':'✓';}
  function hasCoords(r){return Number.isFinite(Number(r?.lat))&&Number.isFinite(Number(r?.lon));}
  function fdate(v){try{return typeof fmtDate==='function'?fmtDate(v):(v||'-')}catch(_){return v||'-'}}

  function ensureStyles(){
    if(document.getElementById('recoFichaV52Styles'))return;
    const s=document.createElement('style');s.id='recoFichaV52Styles';s.textContent=`
      #detailModal.recoFichaModalV52{width:min(97vw,1180px);max-width:1180px;border-radius:22px;overflow:hidden}
      #detailModal.recoFichaModalV52 .modalBox{padding:0;max-height:92vh}
      .fichaTopV52{position:sticky;top:0;z-index:5;display:flex;justify-content:space-between;gap:15px;align-items:center;padding:15px 18px;background:rgba(255,255,255,.96);backdrop-filter:blur(14px);border-bottom:1px solid #e5eaf0}
      .fichaTopV52 .eyebrow{font-size:9px}.fichaTopV52 h3{font-size:15px;margin:3px 0 0}.fichaCloseV52{width:36px;height:36px;border-radius:10px;background:#f3f6f9!important}
      .fichaBodyV52{padding:18px;background:#f5f7fa}
      .fichaHeroV52{position:relative;overflow:hidden;border-radius:21px;background:linear-gradient(125deg,#081827,#0e3a60 58%,#0b719d);color:#fff;padding:23px;box-shadow:0 16px 40px rgba(10,38,65,.16)}
      .fichaHeroV52:after{content:"";position:absolute;width:260px;height:260px;border-radius:50%;right:-80px;top:-120px;background:rgba(255,255,255,.055)}
      .fichaHeroGridV52{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1.35fr) minmax(280px,.65fr);gap:18px;align-items:center}
      .fichaHeroV52 h2{font-size:34px;letter-spacing:-.04em;margin:5px 0 6px;color:#fff}.fichaHeroV52 p{margin:4px 0;color:#d8e5f1;font-size:12px;line-height:1.5}
      .fichaSublineV52{display:flex;gap:7px;flex-wrap:wrap;align-items:center;margin-top:11px}.fichaPillV52{display:inline-flex;align-items:center;gap:6px;padding:6px 9px;border-radius:999px;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.11);font-size:10px;font-weight:800}
      .fichaStatusV52{display:inline-flex;align-items:center;gap:7px;padding:8px 11px;border-radius:999px;font-size:10px;font-weight:900}.fichaStatusV52.ok{background:#dff7eb;color:#08724c}.fichaStatusV52.warn{background:#fff0cf;color:#845500}.fichaStatusV52.danger{background:#ffe4e1;color:#a2362e}
      .fichaHeroActionsV52{display:flex;gap:7px;flex-wrap:wrap;margin-top:15px}.fichaHeroActionsV52 .btn{font-size:10px;min-height:36px;border-radius:9px}
      .fichaHeroAsideV52{display:grid;grid-template-columns:1fr 1fr;gap:8px}.fichaHeroMetricV52{padding:12px;border-radius:14px;background:rgba(5,19,32,.26);border:1px solid rgba(255,255,255,.1)}.fichaHeroMetricV52 span{display:block;font-size:8px;text-transform:uppercase;letter-spacing:.07em;color:#adc8df}.fichaHeroMetricV52 strong{display:block;margin-top:5px;font-size:12px;color:#fff;line-height:1.3}
      .fichaAlertsV52{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0}.fichaAlertV52{display:inline-flex;gap:6px;align-items:center;border-radius:10px;padding:8px 10px;font-size:10px;font-weight:800;border:1px solid}.fichaAlertV52.danger{background:#fff0ee;border-color:#efc2bd;color:#9f352d}.fichaAlertV52.warn{background:#fff7e7;border-color:#edd7a6;color:#805700}.fichaAlertV52.info{background:#eef5ff;border-color:#cbdcf5;color:#24558f}
      .fichaGridV52{display:grid;grid-template-columns:1.05fr .95fr;gap:12px;margin-top:12px}.fichaSectionV52{background:#fff;border:1px solid #e2e8ef;border-radius:17px;padding:15px;box-shadow:0 7px 22px rgba(18,40,65,.045)}
      .fichaSectionHeadV52{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:11px}.fichaSectionHeadV52 h4{margin:0;font-size:13px;color:#223852}.fichaSectionHeadV52 span{font-size:9px;color:#8190a3}
      .fichaFactsV52{display:grid;grid-template-columns:1fr 1fr;gap:8px}.fichaFactV52{min-height:67px;padding:10px 11px;background:#f8fafc;border:1px solid #edf1f5;border-radius:11px}.fichaFactV52 span{display:block;color:#8390a1;font-size:8px;text-transform:uppercase;letter-spacing:.05em}.fichaFactV52 strong{display:block;color:#223852;font-size:11px;margin-top:5px;line-height:1.35;overflow-wrap:anywhere}
      .fichaObsV52{padding:12px;border-radius:12px;background:#f8fafc;border:1px solid #edf1f5;color:#526174;font-size:11px;line-height:1.55;white-space:pre-wrap}
      .fichaLocationV52{display:flex;gap:9px;align-items:flex-start;padding:12px;background:#f8fafc;border-radius:12px;border:1px solid #edf1f5}.fichaLocationIconV52{width:36px;height:36px;flex:0 0 auto;border-radius:10px;background:#e8f1ff;color:#1559c9;display:grid;place-items:center;font-size:17px}.fichaLocationV52 strong{display:block;color:#223852;font-size:11px}.fichaLocationV52 small{display:block;color:#7c899a;font-size:9px;margin-top:3px}
      .fichaHistoryV52{margin-top:12px}.fichaTimelineV52{position:relative;padding-left:21px}.fichaTimelineV52:before{content:"";position:absolute;left:7px;top:8px;bottom:8px;width:2px;background:#e1e7ee}.fichaHistoryItemV52{position:relative;padding:0 0 13px}.fichaHistoryItemV52:before{content:"";position:absolute;left:-18px;top:5px;width:9px;height:9px;border-radius:50%;background:#4c91e4;border:2px solid #fff;box-shadow:0 0 0 1px #c8d8ea}.fichaHistoryCardV52{background:#fff;border:1px solid #e4e9ef;border-radius:13px;padding:11px 12px}.fichaHistoryTopV52{display:flex;justify-content:space-between;gap:9px;align-items:flex-start}.fichaHistoryTopV52 strong{font-size:11px;color:#233a53}.fichaHistoryTopV52 small{display:block;color:#7d8a9b;font-size:9px;margin-top:2px}.fichaHistoryCardV52 p{margin:8px 0 0;color:#667487;font-size:10px;line-height:1.45}
      .fichaEmptyV52{padding:15px;text-align:center;border:1px dashed #d7dfe8;border-radius:12px;color:#8190a1;font-size:10px;background:#fafbfd}
      body[data-theme="dark"] #detailModal.recoFichaModalV52 .fichaTopV52{background:rgba(14,27,42,.96);border-color:#2a3c4f}
      body[data-theme="dark"] .fichaBodyV52{background:#08121e}body[data-theme="dark"] .fichaSectionV52,body[data-theme="dark"] .fichaHistoryCardV52{background:#101d2b;border-color:#293c50}
      body[data-theme="dark"] .fichaFactV52,body[data-theme="dark"] .fichaObsV52,body[data-theme="dark"] .fichaLocationV52{background:#142334;border-color:#293c50}
      body[data-theme="dark"] .fichaSectionHeadV52 h4,body[data-theme="dark"] .fichaFactV52 strong,body[data-theme="dark"] .fichaLocationV52 strong,body[data-theme="dark"] .fichaHistoryTopV52 strong{color:#eef5fb}
      body[data-theme="dark"] .fichaObsV52,body[data-theme="dark"] .fichaHistoryCardV52 p{color:#b6c4d5}
      @media(max-width:760px){
        #detailModal.recoFichaModalV52{width:100vw;max-width:none;height:100dvh;max-height:100dvh;border-radius:0;margin:0}
        #detailModal.recoFichaModalV52 .modalBox{max-height:100dvh;height:100dvh}.fichaTopV52{padding:12px 13px}.fichaBodyV52{padding:10px 10px 90px}
        .fichaHeroV52{padding:17px;border-radius:17px}.fichaHeroGridV52{grid-template-columns:1fr}.fichaHeroV52 h2{font-size:28px}.fichaHeroAsideV52{grid-template-columns:1fr 1fr}
        .fichaHeroActionsV52 .btn{flex:1 1 calc(50% - 5px)}.fichaGridV52{grid-template-columns:1fr;gap:9px}.fichaSectionV52{padding:12px;border-radius:14px}
        .fichaFactsV52{grid-template-columns:1fr 1fr;gap:7px}.fichaFactV52{min-height:62px;padding:9px}.fichaAlertV52{font-size:9px}
      }
      @media(max-width:420px){.fichaFactsV52{grid-template-columns:1fr}.fichaHeroActionsV52 .btn{flex-basis:100%}}
    `;document.head.appendChild(s);
  }

  function alerts(r){
    const out=[];
    if(r.estado==='Fuera de servicio')out.push(['danger','⛔','Equipo fuera de servicio']);
    if(r.estado==='Con observaciones')out.push(['warn','⚠','Equipo con observaciones']);
    if(comm(r.comunicacion_remota)==='NO')out.push(['warn','◉','Sin comunicación remota']);
    if(!r.fecha_verificacion)out.push(['info','◷','Sin fecha de verificación']);
    if(/bypass/i.test(String(r.observaciones||'')))out.push(['danger','↯','BYPASS informado']);
    return out;
  }

  function metric(label,value){return '<div class="fichaHeroMetricV52"><span>'+esc(label)+'</span><strong>'+esc(txt(value))+'</strong></div>';}
  function fact(label,value){return '<div class="fichaFactV52"><span>'+esc(label)+'</span><strong>'+esc(txt(value))+'</strong></div>';}

  window.showReco=function(id){
    ensureStyles();
    const r=(state.reconectadores||[]).find(x=>x.id===id);if(!r)return;
    const ins=(state.inspecciones||[]).filter(i=>i.equipo===r.codigo).sort((a,b)=>String(b.fecha||'').localeCompare(String(a.fecha||'')));
    const a=alerts(r),modal=document.getElementById('detailModal');if(!modal)return;
    modal.classList.add('recoFichaModalV52');
    const box=modal.querySelector('.modalBox');if(!box)return;
    box.innerHTML=`
      <div class="fichaTopV52"><div><span class="eyebrow">FICHA TÉCNICA · RECONECTADOR MT</span><h3>${esc(r.codigo)} · ${esc(txt(r.alimentador))}</h3></div><button class="x fichaCloseV52" type="button" onclick="closeModal('detailModal')">✕</button></div>
      <div class="fichaBodyV52">
        <section class="fichaHeroV52"><div class="fichaHeroGridV52"><div>
          <span class="fichaStatusV52 ${statusClass(r.estado)}">${statusIcon(r.estado)} ${esc(txt(r.estado))}</span>
          <h2>${esc(r.codigo)}</h2><p>${esc(txt(r.alimentador,'Alimentador sin registro'))} · ${esc(txt(r.ubicacion,'Ubicación sin registro'))}</p>
          <div class="fichaSublineV52"><span class="fichaPillV52">▦ Cuadrante ${esc(txt(r.cuadrante))}</span><span class="fichaPillV52">👤 ${esc(txt(r.gestor_cuadrante,'Sin gestor asignado'))}</span><span class="fichaPillV52">◉ Remota: ${esc(comm(r.comunicacion_remota))}</span></div>
          <div class="fichaHeroActionsV52">
            ${hasCoords(r)?`<button class="btn secondary" type="button" onclick="googleRoute(${Number(r.lat)},${Number(r.lon)})">⌖ Cómo llegar</button><button class="btn secondary" type="button" onclick="closeModal('detailModal');goView('mapa');setTimeout(()=>{if(typeof recoLeafletMap!=='undefined'&&recoLeafletMap)recoLeafletMap.setView([${Number(r.lat)},${Number(r.lon)}],16)},150)">◎ Ver en mapa</button>`:''}
            ${isAdmin()?`<button class="btn secondary" type="button" onclick="editReco(${r.id})">✎ Editar</button><button class="btn secondary" type="button" onclick="closeModal('detailModal');openInspection('${esc(r.codigo)}')">＋ Inspección</button>`:''}
          </div>
        </div><div class="fichaHeroAsideV52">${metric('Equipo / referencia',r.marca)}${metric('Comunicación remota',comm(r.comunicacion_remota))}${metric('Última verificación',fdate(r.fecha_verificacion))}${metric('Inspecciones',String(ins.length))}</div></div></section>
        ${a.length?'<div class="fichaAlertsV52">'+a.map(x=>'<span class="fichaAlertV52 '+x[0]+'">'+x[1]+' '+esc(x[2])+'</span>').join('')+'</div>':''}
        <div class="fichaGridV52">
          <section class="fichaSectionV52"><div class="fichaSectionHeadV52"><h4>Identificación y responsabilidad</h4><span>Datos principales</span></div><div class="fichaFactsV52">${fact('Código',r.codigo)}${fact('Alimentador',r.alimentador)}${fact('Equipo / referencia',r.marca)}${fact('Cuadrante',r.cuadrante)}${fact('Gestor del cuadrante',r.gestor_cuadrante||'Sin gestor asignado')}${fact('Estado',r.estado)}</div></section>
          <section class="fichaSectionV52"><div class="fichaSectionHeadV52"><h4>Protecciones y condición</h4><span>Configuración registrada</span></div><div class="fichaFactsV52">${fact('Sobrecorriente fase',r.sobrecorriente_fase)}${fact('Sobrecorriente residual',r.sobrecorriente_residual)}${fact('Comunicación remota',comm(r.comunicacion_remota))}${fact('Fecha verificación',fdate(r.fecha_verificacion))}</div></section>
          <section class="fichaSectionV52"><div class="fichaSectionHeadV52"><h4>Ubicación</h4><span>Referencia de terreno</span></div><div class="fichaLocationV52"><div class="fichaLocationIconV52">⌖</div><div><strong>${esc(txt(r.ubicacion,'Ubicación no registrada'))}</strong><small>${hasCoords(r)?esc(Number(r.lat).toFixed(6)+', '+Number(r.lon).toFixed(6)):'Sin coordenadas registradas'}</small></div></div>${hasCoords(r)?'<div class="fichaHeroActionsV52" style="margin-top:10px"><button class="btn primary" type="button" onclick="googleRoute('+Number(r.lat)+','+Number(r.lon)+')">Abrir ruta en Google Maps</button></div>':''}</section>
          <section class="fichaSectionV52"><div class="fichaSectionHeadV52"><h4>Observaciones técnicas</h4><span>Antecedentes del equipo</span></div><div class="fichaObsV52">${esc(txt(r.observaciones,'Sin observaciones técnicas registradas.'))}</div></section>
        </div>
        <section class="fichaSectionV52 fichaHistoryV52"><div class="fichaSectionHeadV52"><h4>Historial de inspecciones</h4><span>${ins.length} ${ins.length===1?'registro':'registros'}</span></div>
          ${ins.length?`<div class="fichaTimelineV52">${ins.map((i,index)=>`<div class="fichaHistoryItemV52"><div class="fichaHistoryCardV52"><div class="fichaHistoryTopV52"><div><strong>${index===0?'Última inspección':'Inspección'} · ${esc(fdate(i.fecha))}</strong><small>${esc(txt(i.inspector,'Inspector sin registro'))}</small></div>${typeof badge==='function'?badge(i.resultado):''}</div><p><strong>Comunicación:</strong> ${esc(txt(i.comunicaciones))} · <strong>Batería:</strong> ${esc(txt(i.tension))} V · <strong>Operaciones:</strong> ${esc(txt(i.operaciones))}</p><p>${esc(txt(i.observaciones,'Sin observaciones.'))}</p></div></div>`).join('')}</div>`:'<div class="fichaEmptyV52">Todavía no existen inspecciones registradas para este reconectador.</div>'}
        </section>
        ${isAdmin()?`<div style="display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn ghost" type="button" onclick="deleteReco(${r.id})">Eliminar equipo</button><button class="btn primary" type="button" onclick="editReco(${r.id})">Editar información</button></div>`:''}
      </div>`;
    openModal('detailModal');
  };
  ensureStyles();
})();