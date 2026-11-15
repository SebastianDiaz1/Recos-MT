// v66 · Inspección técnica avanzada de reconectadores MT.
(function(){
  const SECTIONS=[
    ['estado_general','02 · Estado general',[
      ['visual','Estado visual general'],['estructura','Estructura y fijaciones'],['aisladores','Aisladores'],
      ['bornes','Bornes y conexiones'],['conductores','Conductores entrada / salida'],['calentamiento','Señales de calentamiento'],
      ['corrosion','Corrosión'],['danos','Daños mecánicos'],['humedad','Humedad'],['limpieza','Limpieza general'],
      ['vegetacion','Vegetación / interferencias'],['poste','Poste / estructura soporte']
    ]],
    ['gabinete_control','03 · Gabinete y control',[
      ['gabinete','Estado del gabinete'],['cierre_gabinete','Cierre y seguridad'],['sellos','Sellos'],
      ['interior','Interior limpio'],['condensacion','Condensación'],['cableado','Cableado interno'],
      ['borneras','Borneras'],['fusibles','Fusibles'],['fuente','Fuente de alimentación'],['alarmas','Alarmas activas'],
      ['indicadores','Indicadores luminosos'],['hmi','Display / HMI']
    ]],
    ['bateria_cargador','04 · Batería y cargador',[
      ['bateria_estado','Estado físico batería'],['terminales','Terminales'],['sulfatacion','Sulfatación'],
      ['cargador','Cargador operativo'],['alimentacion_ac','Alimentación AC'],['respaldo','Prueba de respaldo']
    ]],
    ['comunicaciones_detalle','05 · Comunicaciones',[
      ['coz','Comunicación con COZ'],['modem','Módem / router'],['moxa','Switch Moxa'],['antena','Antena'],
      ['senal','Nivel de señal'],['alim_com','Alimentación comunicaciones']
    ]],
    ['protecciones_detalle','06 · Protecciones y ajustes',[
      ['ajuste_verificado','Ajuste verificado'],['proteccion_habilitada','Protecciones habilitadas'],['grupo_ajustes','Grupo de ajustes activo']
    ]],
    ['operacion_funcional','07 · Operación y pruebas funcionales',[
      ['apertura_local','Apertura local'],['cierre_local','Cierre local'],['apertura_remota','Apertura remota'],
      ['cierre_remoto','Cierre remoto'],['selector','Selector Local / Remoto'],['bloqueo','Bloqueo operativo'],
      ['indicacion','Indicación abierto / cerrado']
    ]],
    ['puesta_tierra','08 · Puesta a tierra',[
      ['conductor_tierra','Conductor de tierra'],['conexion_tierra','Conexiones'],['estado_tierra','Estado físico'],
      ['corrosion_tierra','Corrosión'],['continuidad_visual','Continuidad visual'],['union_gabinete','Unión gabinete / estructura']
    ]]
  ];
  const LABELS={conforme:'Conforme',observacion:'Observación',no_conforme:'No conforme',na:'N/A'};
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  let files=[];

  function style(){
    if(document.getElementById('inspectionV66Style'))return;
    const s=document.createElement('style');s.id='inspectionV66Style';s.textContent=`
      #inspectionModal .modalBox{max-width:1080px;width:min(1080px,96vw);max-height:94vh;overflow:auto;padding:0}
      .it66Head{position:sticky;top:0;z-index:4;background:linear-gradient(135deg,#102e4a,#1559c9);color:#fff;padding:18px 20px;display:flex;justify-content:space-between;gap:15px;align-items:flex-start}.it66Head .eyebrow{color:#b9dcff}.it66Head h3{margin:3px 0 0;font-size:20px}.it66Head p{margin:5px 0 0;font-size:10px;color:#d8e9fa}.it66Head .x{color:#fff;background:rgba(255,255,255,.12)}
      .it66Progress{padding:12px 20px;border-bottom:1px solid #e6edf4;background:#fff;position:sticky;top:82px;z-index:3}.it66ProgressTop{display:flex;justify-content:space-between;font-size:9px;color:#66788b;margin-bottom:6px}.it66Track{height:7px;background:#e8eef5;border-radius:999px;overflow:hidden}.it66Fill{height:100%;background:linear-gradient(90deg,#1688d4,#1559c9);width:0;transition:.25s}
      .it66Body{padding:14px 18px 20px}.it66Ident{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px}.it66Fact{padding:10px;border-radius:11px;border:1px solid #e2e9f0;background:#f8fafc}.it66Fact span{display:block;font-size:7px;text-transform:uppercase;color:#8291a1;font-weight:900}.it66Fact strong{display:block;margin-top:4px;font-size:10px;color:#29445e}
      .it66Section{border:1px solid #e0e7ef;border-radius:14px;margin:9px 0;background:#fff;overflow:hidden}.it66Section>summary{cursor:pointer;list-style:none;padding:12px 14px;background:#f7f9fc;display:flex;justify-content:space-between;align-items:center;font-size:11px;font-weight:900;color:#29445d}.it66Section>summary::-webkit-details-marker{display:none}.it66Section>summary small{font-size:8px;color:#8090a0}.it66SectionBody{padding:12px}
      .it66Fields{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.it66Fields label{font-size:8px;color:#64788c}.it66Fields input,.it66Fields select,.it66Fields textarea{width:100%;margin-top:4px;border:1px solid #dbe4ec;border-radius:8px;padding:8px;font-size:9px;background:#fff;color:#31475d}.it66Fields textarea{min-height:70px;resize:vertical}
      .it66Checks{display:grid;grid-template-columns:1fr 1fr;gap:7px}.it66Check{padding:9px 10px;border:1px solid #e5ebf1;border-radius:10px;background:#fbfcfe}.it66CheckTop{display:flex;justify-content:space-between;gap:8px;align-items:center}.it66CheckTop strong{font-size:9px;color:#334b62}.it66Status{display:flex;gap:4px;flex-wrap:wrap;margin-top:7px}.it66Status button{border:1px solid #dce5ed;background:#fff;color:#637589;border-radius:999px;padding:5px 7px;font-size:7px;font-weight:900;cursor:pointer}.it66Status button.sel[data-v="conforme"]{background:#e5f6ec;border-color:#92d0ad;color:#146744}.it66Status button.sel[data-v="observacion"]{background:#fff3d8;border-color:#e8c774;color:#865900}.it66Status button.sel[data-v="no_conforme"]{background:#fde7e5;border-color:#e7a39d;color:#9b3028}.it66Status button.sel[data-v="na"]{background:#edf1f5;border-color:#ccd6df;color:#5f6e7c}
      .it66Result{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.it66PhotoGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.it66PhotoBox{border:1px dashed #bdcad7;border-radius:11px;padding:10px;background:#fafcff}.it66PhotoBox input{font-size:8px}.it66Preview{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}.it66Preview img{width:64px;height:64px;object-fit:cover;border-radius:8px;border:1px solid #d7e0e8}
      .it66Actions{display:flex;justify-content:flex-end;gap:8px;margin-top:14px;position:sticky;bottom:0;background:linear-gradient(to top,#fff 75%,rgba(255,255,255,0));padding-top:18px}.it66Save{min-width:180px}
      .it66History{margin-top:12px;border-top:1px solid #e4eaf0;padding-top:12px}.it66HistoryCard{border:1px solid #e1e8ef;border-radius:12px;margin-top:8px;padding:10px;background:#f9fbfd}.it66HistoryGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:8px}.it66HistoryGrid div{background:#fff;border:1px solid #e8edf2;border-radius:8px;padding:7px}.it66HistoryGrid span{font-size:7px;color:#8492a2;text-transform:uppercase}.it66HistoryGrid strong{display:block;font-size:9px;margin-top:3px;color:#304860}.it66Thumb{width:70px;height:70px;object-fit:cover;border-radius:8px;margin:5px 5px 0 0;border:1px solid #d7e0e8}
      @media(max-width:850px){.it66Ident{grid-template-columns:1fr 1fr}.it66Fields{grid-template-columns:1fr 1fr}.it66Checks{grid-template-columns:1fr}.it66Result{grid-template-columns:1fr 1fr}.it66PhotoGrid{grid-template-columns:1fr 1fr}}@media(max-width:520px){#inspectionModal .modalBox{width:100vw;max-height:100vh;border-radius:0}.it66Head{padding:14px}.it66Progress{top:75px}.it66Body{padding:10px}.it66Ident,.it66Fields,.it66Result,.it66PhotoGrid{grid-template-columns:1fr}.it66Status button{flex:1;min-width:72px}.it66HistoryGrid{grid-template-columns:1fr 1fr}}
    `;document.head.appendChild(s);
  }
  function checkHTML(section,key,label){
    return `<div class="it66Check" data-check="${section}.${key}"><div class="it66CheckTop"><strong>${esc(label)}</strong><span class="it66Chosen">Pendiente</span></div><div class="it66Status">
      ${Object.entries(LABELS).map(([v,l])=>`<button type="button" data-v="${v}">${l}</button>`).join('')}
    </div><input type="hidden" name="chk_${section}_${key}" value=""></div>`;
  }
  function sectionHTML(sec,title,items){
    return `<details class="it66Section" open><summary><span>${title}</span><small data-section-progress="${sec}">0/${items.length}</small></summary><div class="it66SectionBody"><div class="it66Checks">${items.map(x=>checkHTML(sec,x[0],x[1])).join('')}</div></div></details>`;
  }
  function build(){
    style();
    const old=document.getElementById('inspectionForm');if(!old||old.dataset.v66)return;
    const form=document.createElement('form');form.id='inspectionForm';form.className='modalBox';form.dataset.v66='1';
    form.innerHTML=`
      <div class="it66Head"><div><span class="eyebrow">INSPECCIÓN TÉCNICA AVANZADA</span><h3 id="inspectionTitle">Reconectador MT</h3><p id="it66Subtitle">Registro preventivo y condición del activo</p></div><button type="button" class="x" onclick="closeModal('inspectionModal')">✕</button></div>
      <div class="it66Progress"><div class="it66ProgressTop"><strong>Avance de inspección</strong><span id="it66ProgressText">0%</span></div><div class="it66Track"><div id="it66ProgressFill" class="it66Fill"></div></div></div>
      <div class="it66Body">
        <input type="hidden" name="equipo">
        <div id="it66Ident" class="it66Ident"></div>
        <details class="it66Section" open><summary><span>01 · Identificación</span><small>Datos de terreno</small></summary><div class="it66SectionBody"><div class="it66Fields">
          <label>Fecha<input name="fecha" type="date" required></label>
          <label>Inspector<input name="inspector" required></label>
          <label>Contador de operaciones<input name="operaciones" type="number" min="0"></label>
          <label>Tensión batería (V)<input name="tension" type="number" step="0.01"></label>
          <label>Estado comunicación<select name="comunicaciones"><option>Normal</option><option>Intermitente</option><option>Sin comunicación</option></select></label>
          <label>Fecha estimada batería<input name="fecha_bateria" type="date"></label>
          <label>Última comunicación comprobada<input name="ultima_comunicacion" type="datetime-local"></label>
          <label>Nivel de señal<input name="nivel_senal" placeholder="Ej: -67 dBm / Buena"></label>
          <label>Grupo de ajustes activo<input name="grupo_ajustes" placeholder="Ej: Grupo 1"></label>
        </div></div></details>
        ${SECTIONS.map(s=>sectionHTML(...s)).join('')}
        <details class="it66Section" open><summary><span>09 · Hallazgos</span><small>Clasificación y acción</small></summary><div class="it66SectionBody"><div class="it66Fields">
          <label>Tipo de hallazgo<select name="tipo_hallazgo"><option>Sin hallazgos</option><option>Menor</option><option>Moderado</option><option>Crítico</option></select></label>
          <label>Categoría<select name="categoria_hallazgo"><option>Sin hallazgos</option><option>Mecánico</option><option>Eléctrico</option><option>Control</option><option>Comunicaciones</option><option>Protecciones</option><option>Batería</option><option>Estructura</option><option>Seguridad</option><option>Otro</option></select></label>
          <label>Acción recomendada<select name="accion_recomendada"><option>Sin acción</option><option>Seguimiento</option><option>Mantenimiento preventivo</option><option>Mantenimiento correctivo</option><option>Reemplazo</option><option>Revisión especializada</option></select></label>
          <label>Plazo recomendado<select name="plazo_recomendado"><option>Sin plazo</option><option>Inmediato</option><option>≤ 7 días</option><option>≤ 30 días</option><option>Próximo mantenimiento</option></select></label>
          <label style="grid-column:1/-1">Descripción del hallazgo<textarea name="descripcion_hallazgo" placeholder="Describe condición encontrada, ubicación y detalle técnico..."></textarea></label>
        </div></div></details>
        <details class="it66Section" open><summary><span>10 · Resultado final</span><small>Cierre de inspección</small></summary><div class="it66SectionBody">
          <div class="it66Result">
            <label>Condición final<select name="resultado" required><option>Conforme</option><option>Con observaciones</option><option>Requiere intervención</option></select></label>
            <label>Prioridad<select name="prioridad"><option>Baja</option><option>Media</option><option>Alta</option><option>Crítica</option></select></label>
            <label>Requiere OT<select name="requiere_ot"><option>No</option><option>Sí</option></select></label>
            <label>Requiere nueva visita<select name="nueva_visita"><option>No</option><option>Sí</option></select></label>
            <label>Próxima inspección recomendada<input name="proxima_inspeccion" type="date"></label>
            <label>Resultado prueba funcional<select name="prueba_funcional"><option>Conforme</option><option>Con observaciones</option><option>No ejecutada</option><option>Requiere intervención</option></select></label>
          </div>
          <label style="display:block;margin-top:8px">Comentario final<textarea name="observaciones" rows="4" placeholder="Conclusión de la inspección, acciones pendientes y antecedentes relevantes..."></textarea></label>
        </div></details>
        <details class="it66Section"><summary><span>11 · Evidencia fotográfica</span><small>Opcional</small></summary><div class="it66SectionBody"><div class="it66PhotoGrid">
          ${['Vista general','Gabinete / control','Batería','Conexiones','Hallazgo','Otro'].map((x,i)=>`<div class="it66PhotoBox"><strong style="font-size:9px">${x}</strong><input type="file" accept="image/*" capture="environment" data-photo-cat="${x}" multiple><div class="it66Preview" data-preview="${i}"></div></div>`).join('')}
        </div><p style="font-size:8px;color:#7d8c9c;margin:10px 0 0">Las imágenes se comprimen antes de guardarse para facilitar el uso desde celular.</p></div></details>
        <div class="it66Actions"><button type="button" class="btn ghost" onclick="closeModal('inspectionModal')">Cancelar</button><button class="btn primary it66Save">Guardar inspección técnica</button></div>
      </div>`;
    old.replaceWith(form);
    bind(form);
  }
  function setStatus(box,val){
    box.querySelector('input[type="hidden"]').value=val;
    box.querySelectorAll('.it66Status button').forEach(b=>b.classList.toggle('sel',b.dataset.v===val));
    const chosen=box.querySelector('.it66Chosen');chosen.textContent=LABELS[val]||'Pendiente';
    updateProgress();
  }
  function updateProgress(){
    const form=document.getElementById('inspectionForm');if(!form)return;
    const all=[...form.querySelectorAll('[data-check]')],done=all.filter(x=>x.querySelector('input[type="hidden"]').value).length;
    const p=all.length?Math.round(done/all.length*100):0;
    const fill=document.getElementById('it66ProgressFill'),txt=document.getElementById('it66ProgressText');if(fill)fill.style.width=p+'%';if(txt)txt.textContent=p+'%';
    SECTIONS.forEach(([sec,,items])=>{const d=items.filter(x=>form.querySelector(`[name="chk_${sec}_${x[0]}"]`)?.value).length;const el=form.querySelector(`[data-section-progress="${sec}"]`);if(el)el.textContent=d+'/'+items.length;});
  }
  async function compress(file){
    const data=await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.onerror=rej;fr.readAsDataURL(file);});
    const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=data;});
    const max=1280,scale=Math.min(1,max/Math.max(img.width,img.height)),w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale));
    const cv=document.createElement('canvas');cv.width=w;cv.height=h;cv.getContext('2d').drawImage(img,0,0,w,h);
    return cv.toDataURL('image/jpeg',.72);
  }
  function bind(form){
    form.addEventListener('click',e=>{const b=e.target.closest('.it66Status button');if(!b)return;setStatus(b.closest('[data-check]'),b.dataset.v);});
    form.querySelectorAll('[data-photo-cat]').forEach((inp,i)=>inp.addEventListener('change',async()=>{
      const prev=form.querySelector(`[data-preview="${i}"]`);prev.innerHTML='';
      const selected=[...inp.files].slice(0,4);
      for(const f of selected){const url=URL.createObjectURL(f),im=document.createElement('img');im.src=url;prev.appendChild(im);}
    }));
    form.addEventListener('submit',save);
  }
  function values(section){
    const out={};const form=document.getElementById('inspectionForm');
    const sec=SECTIONS.find(x=>x[0]===section);if(!sec)return out;
    sec[2].forEach(([key])=>out[key]=form.querySelector(`[name="chk_${section}_${key}"]`)?.value||'');
    return out;
  }
  window.openInspection=function(code){
    if(!isAdmin()){toast('Activa modo administrador para cargar una inspección');return openAccess();}
    build();
    const form=document.getElementById('inspectionForm');form.reset();files=[];form.querySelectorAll('[data-check]').forEach(x=>setStatus(x,''));
    form.querySelectorAll('.it66Preview').forEach(x=>x.innerHTML='');
    const r=(state.reconectadores||[]).find(x=>x.codigo===code)||{};
    form.equipo.value=code;form.fecha.value=today();form.inspector.value=state.session.name;
    form.comunicaciones.value=String(r.comunicacion_remota||'').toUpperCase()==='NO'?'Sin comunicación':'Normal';
    document.getElementById('inspectionTitle').textContent='Inspección · '+code;
    document.getElementById('it66Subtitle').textContent=(r.alimentador||'Sin alimentador')+' · '+(r.ubicacion||'Sin ubicación');
    document.getElementById('it66Ident').innerHTML=[
      ['Equipo',r.codigo],['Alimentador',r.alimentador],['Subestación',r.subestacion],['Ubicación',r.ubicacion],
      ['Cuadrante',r.cuadrante],['Gestor',r.gestor_cuadrante],['Marca / tecnología',r.tecnologia||r.marca],['Estado actual',r.estado],
      ['Sobrecorriente fase',r.sobrecorriente_fase],['Sobrecorriente residual',r.sobrecorriente_residual],['Últ. verificación',r.fecha_verificacion],['Comunicación remota',r.comunicacion_remota]
    ].map(x=>`<div class="it66Fact"><span>${esc(x[0])}</span><strong>${esc(x[1]||'-')}</strong></div>`).join('');
    updateProgress();openModal('inspectionModal');
  };
  async function save(e){
    e.preventDefault();if(!isAdmin())return;
    const form=e.currentTarget,f=new FormData(form);
    const checklist={version:2,sections:{}};
    SECTIONS.forEach(([sec])=>checklist.sections[sec]=values(sec));
    checklist.mediciones={fecha_bateria:f.get('fecha_bateria')||null,ultima_comunicacion:f.get('ultima_comunicacion')||null,nivel_senal:f.get('nivel_senal')||'',grupo_ajustes:f.get('grupo_ajustes')||''};
    checklist.hallazgo={tipo:f.get('tipo_hallazgo'),categoria:f.get('categoria_hallazgo'),descripcion:f.get('descripcion_hallazgo')||'',accion:f.get('accion_recomendada'),plazo:f.get('plazo_recomendado')};
    checklist.cierre={prioridad:f.get('prioridad'),requiere_ot:f.get('requiere_ot'),nueva_visita:f.get('nueva_visita'),proxima_inspeccion:f.get('proxima_inspeccion')||null,prueba_funcional:f.get('prueba_funcional')};
    checklist.legacy={
      visual:checklist.sections.estado_general.visual==='conforme',gabinete:checklist.sections.gabinete_control.gabinete==='conforme',
      bateria:checklist.sections.bateria_cargador.bateria_estado==='conforme',apertura:checklist.sections.operacion_funcional.apertura_local==='conforme',
      cierre:checklist.sections.operacion_funcional.cierre_local==='conforme',protecciones:checklist.sections.protecciones_detalle.ajuste_verificado==='conforme',
      tierra:checklist.sections.puesta_tierra.conductor_tierra==='conforme',limpieza:checklist.sections.estado_general.limpieza==='conforme'
    };
    const row={equipo:f.get('equipo'),fecha:f.get('fecha'),inspector:f.get('inspector'),resultado:f.get('resultado'),operaciones:Number(f.get('operaciones')||0),tension:f.get('tension')?Number(f.get('tension')):null,comunicaciones:f.get('comunicaciones'),observaciones:f.get('observaciones')||'',checklist};
    const btn=form.querySelector('.it66Save');btn.disabled=true;btn.textContent='Guardando...';
    const {data,error}=await sb.from('inspecciones').insert(row).select('id').single();
    if(error){console.error(error);btn.disabled=false;btn.textContent='Guardar inspección técnica';return toast('No se pudo guardar la inspección');}
    const photos=[];
    for(const inp of form.querySelectorAll('[data-photo-cat]')){
      for(const file of [...inp.files].slice(0,4)){
        try{photos.push({inspeccion_id:data.id,equipo:row.equipo,categoria:inp.dataset.photoCat,nombre_archivo:file.name,mime_type:'image/jpeg',imagen_data:await compress(file)});}catch(err){console.warn('Foto omitida',err);}
      }
    }
    if(photos.length){
      const {error:pe}=await sb.from('inspeccion_fotos').insert(photos);
      if(pe)console.error('No se guardaron algunas fotografías',pe);
    }
    closeModal('inspectionModal');await loadData();toast('Inspección técnica guardada');
  }
  function countIssues(chk){
    if(!chk?.sections)return {obs:0,nc:0};
    let obs=0,nc=0;Object.values(chk.sections).forEach(sec=>Object.values(sec||{}).forEach(v=>{if(v==='observacion')obs++;if(v==='no_conforme')nc++;}));
    return {obs,nc};
  }
  async function decorateFicha(id){
    const r=(state.reconectadores||[]).find(x=>x.id===id),body=document.querySelector('#detailModal .fichaBodyV52');if(!r||!body)return;
    document.getElementById('it66HistoryPanel')?.remove();
    const ins=(state.inspecciones||[]).filter(i=>i.equipo===r.codigo&&i.checklist?.version>=2).sort((a,b)=>String(b.fecha||'').localeCompare(String(a.fecha||''))).slice(0,5);
    if(!ins.length)return;
    const ids=ins.map(x=>x.id).filter(Boolean);let photos=[];
    if(ids.length){const q=await sb.from('inspeccion_fotos').select('*').in('inspeccion_id',ids);if(!q.error)photos=q.data||[];}
    const sec=document.createElement('section');sec.id='it66HistoryPanel';sec.className='fichaSectionV52 it66History';
    sec.innerHTML=`<div class="fichaSectionHeadV52"><h4>Detalle de inspecciones técnicas</h4><span>Últimos ${ins.length}</span></div>`+ins.map(i=>{
      const issue=countIssues(i.checklist),h=i.checklist?.hallazgo||{},cl=i.checklist?.cierre||{},pics=photos.filter(p=>p.inspeccion_id===i.id);
      return `<details class="it66HistoryCard"><summary><strong>${esc(i.fecha)} · ${esc(i.resultado)}</strong> · ${issue.nc} no conformidades · ${issue.obs} observaciones</summary>
        <div class="it66HistoryGrid"><div><span>Inspector</span><strong>${esc(i.inspector||'-')}</strong></div><div><span>Prioridad</span><strong>${esc(cl.prioridad||'-')}</strong></div><div><span>Hallazgo</span><strong>${esc(h.tipo||'-')}</strong></div><div><span>Acción</span><strong>${esc(h.accion||'-')}</strong></div><div><span>Batería</span><strong>${esc(i.tension??'-')} V</strong></div><div><span>Comunicación</span><strong>${esc(i.comunicaciones||'-')}</strong></div><div><span>Requiere OT</span><strong>${esc(cl.requiere_ot||'-')}</strong></div><div><span>Nueva visita</span><strong>${esc(cl.nueva_visita||'-')}</strong></div></div>
        ${h.descripcion?`<p style="font-size:9px;margin:9px 0"><strong>Hallazgo:</strong> ${esc(h.descripcion)}</p>`:''}
        ${i.observaciones?`<p style="font-size:9px"><strong>Conclusión:</strong> ${esc(i.observaciones)}</p>`:''}
        ${pics.length?`<div>${pics.map(p=>`<img class="it66Thumb" src="${p.imagen_data}" alt="${esc(p.categoria||'Evidencia')}">`).join('')}</div>`:''}
      </details>`;
    }).join('');
    body.appendChild(sec);
  }
  const prevShow=window.showReco;
  if(typeof prevShow==='function')window.showReco=function(id){prevShow(id);setTimeout(()=>decorateFicha(id),80);};
  build();
})();