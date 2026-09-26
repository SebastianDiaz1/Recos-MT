const SUPABASE_URL="https://aoskcafxlvwsjntnmqtb.supabase.co";
const SUPABASE_KEY="sb_publishable_yraJ23uSvq02pf2X46Foyg_QvnSg62T";
const ADMIN_EMAIL="sebastian.diaz93.sd@gmail.com";
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const today=()=>new Date().toISOString().slice(0,10);
let state={session:{name:"Consulta",role:"viewer"},reconectadores:[],inspecciones:[]};

async function refreshSession(){
 const {data:{session}}=await sb.auth.getSession();
 const email=session?.user?.email||"";
 state.session=email.toLowerCase()===ADMIN_EMAIL.toLowerCase()?{name:"Sebastián Díaz",role:"admin",email}:{name:"Consulta",role:"viewer"};
}
async function loadData(showToast=false){
 const [{data:r,error:er},{data:i,error:ei}]=await Promise.all([
   sb.from('reconectadores').select('*').order('codigo'),
   sb.from('inspecciones').select('*').order('fecha',{ascending:false})
 ]);
 if(er||ei){console.error(er||ei); if(showToast) toast("No se pudo actualizar la base online"); return;}
 state.reconectadores=r||[]; state.inspecciones=i||[]; renderAll(); if(showToast) toast("Información actualizada");
}
function isAdmin(){return state.session.role==="admin"}
function toast(m){let t=document.getElementById("toast");t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
function openModal(id){document.getElementById(id).showModal()}
function closeModal(id){document.getElementById(id).close()}
function fmtDate(s){if(!s)return"-";let a=s.split("-");return `${a[2]}-${a[1]}-${a[0]}`}
function badge(t){let x=(t||"").toLowerCase(),c="info";if(x.includes("operativo")||x.includes("conforme")||x.includes("normal"))c="ok";if(x.includes("observ")||x.includes("intermitente"))c="warn";if(x.includes("fuera")||x.includes("intervención")||x.includes("sin comunicación"))c="danger";return `<span class="badge ${c}">${t}</span>`}
function daysUntil(s){if(!s)return 99999;let a=new Date();a.setHours(0,0,0,0);let b=new Date(s+"T00:00:00");return Math.ceil((b-a)/86400000)}

function renderAccess(){
 modePill.textContent=isAdmin()?`${state.session.name} · Administrador online`:`Solo consulta · En línea`;
 document.querySelectorAll(".adminOnly").forEach(e=>e.style.display=isAdmin()?"":"none")
}
function renderDashboard(){
 let total=state.reconectadores.length,op=state.reconectadores.filter(r=>r.estado==="Operativo").length,obs=state.reconectadores.filter(r=>r.estado==="Con observaciones").length,off=state.reconectadores.filter(r=>r.estado==="Fuera de servicio").length,ins=state.inspecciones.length;
 let data=[["⚡","Reconectadores",total],["✅","Operativos",op],["⚠️","Con observaciones",obs],["⛔","Fuera de servicio",off],["📝","Inspecciones",ins]];
 kpis.innerHTML=data.map(x=>`<div class="card"><div class="icon">${x[0]}</div><div class="label">${x[1]}</div><div class="value">${x[2]}</div></div>`).join("");
 let pct=v=>total?Math.round(v/total*100):0;
 fleetHealth.innerHTML=`<div class="healthRow"><strong>Operativos</strong><div class="healthTrack"><div class="healthFill fillGreen" style="width:${pct(op)}%"></div></div><strong>${pct(op)}%</strong></div><div class="healthRow"><strong>Observación</strong><div class="healthTrack"><div class="healthFill fillAmber" style="width:${pct(obs)}%"></div></div><strong>${pct(obs)}%</strong></div><div class="healthRow"><strong>Fuera servicio</strong><div class="healthTrack"><div class="healthFill fillRed" style="width:${pct(off)}%"></div></div><strong>${pct(off)}%</strong></div>`;
 recentActivity.innerHTML=state.inspecciones.slice().sort((a,b)=>b.fecha.localeCompare(a.fecha)).slice(0,6).map(i=>`<div class="listRow"><div><strong>${i.equipo} · ${i.inspector}</strong><span class="tiny">${fmtDate(i.fecha)} · ${i.observaciones}</span></div>${badge(i.resultado)}</div>`).join("");
 attentionStrip.innerHTML=state.reconectadores.filter(r=>r.estado!=="Operativo"||daysUntil(r.proxima)<=30).map(r=>`<div class="attentionCard ${r.estado==="Fuera de servicio"?"dangerBox":""}"><strong>${r.codigo} · ${r.ubicacion}</strong><div class="tiny">${r.alimentador}</div><div style="margin-top:8px">${badge(r.estado)}</div></div>`).join("")||`<span class="muted">Sin equipos que requieran atención inmediata.</span>`;
}
function renderFilters(){let brands=[...new Set(state.reconectadores.map(r=>r.marca))].sort();filterBrand.innerHTML=`<option value="">Todas las marcas</option>`+brands.map(b=>`<option>${b}</option>`).join("")}
function renderRecos(){let q=(searchReco.value||"").toLowerCase(),f=filterStatus.value,b=filterBrand.value;let arr=state.reconectadores.filter(r=>(!f||r.estado===f)&&(!b||r.marca===b)&&Object.values(r).join(" ").toLowerCase().includes(q));recoGrid.innerHTML=arr.map(r=>{let cls=r.estado==="Con observaciones"?"warnCard":r.estado==="Fuera de servicio"?"dangerCard":"";let last=state.inspecciones.filter(i=>i.equipo===r.codigo).sort((a,b)=>b.fecha.localeCompare(a.fecha))[0];return `<div class="recoCard ${cls}" onclick="showReco(${r.id})"><span class="eyebrow">${r.alimentador}</span><div class="recoCode">${r.codigo}</div>${badge(r.estado)}<div class="metaGrid"><div class="metaBox"><span>Marca / modelo</span><strong>${r.marca} ${r.modelo||""}</strong></div><div class="metaBox"><span>Ubicación</span><strong>${r.ubicacion}</strong></div><div class="metaBox"><span>Última inspección</span><strong>${last?fmtDate(last.fecha):"Sin registro"}</strong></div><div class="metaBox"><span>Próxima mantención</span><strong>${fmtDate(r.proxima)}</strong></div></div><button class="btn primary">Abrir ficha técnica</button></div>`}).join("")||`<p class="muted">No hay equipos que coincidan con la búsqueda.</p>`}
function renderMap(){let lats=state.reconectadores.map(r=>Number(r.lat)).filter(Number.isFinite),lons=state.reconectadores.map(r=>Number(r.lon)).filter(Number.isFinite);let minLat=Math.min(...lats),maxLat=Math.max(...lats),minLon=Math.min(...lons),maxLon=Math.max(...lons);mapSurface.innerHTML=`<div class="map-label">Vista esquemática · posiciones relativas</div>`+state.reconectadores.map(r=>{let lat=Number(r.lat),lon=Number(r.lon);if(!Number.isFinite(lat)||!Number.isFinite(lon))return"";let x=((lon-minLon)/(maxLon-minLon||1))*75+12.5;let y=(1-(lat-minLat)/(maxLat-minLat||1))*72+14;return `<div class="mapMarker" style="left:${x}%;top:${y}%" onclick="showReco(${r.id})"><div class="markerDot"></div><span>${r.codigo}</span></div>`}).join("");mapList.innerHTML=state.reconectadores.map(r=>`<div class="listRow"><div><strong>${r.codigo} · ${r.ubicacion}</strong><span class="tiny">${r.lat}, ${r.lon} · ${r.alimentador}</span></div><div><button class="btn ghost" onclick="showReco(${r.id})">Ficha</button> <button class="btn ghost" onclick="window.open('https://www.google.com/maps?q=${r.lat},${r.lon}','_blank')">Mapa</button></div></div>`).join("")}
function showReco(id){let r=state.reconectadores.find(x=>x.id===id);if(!r)return;let ins=state.inspecciones.filter(i=>i.equipo===r.codigo).sort((a,b)=>b.fecha.localeCompare(a.fecha));let last=ins[0];detailTitle.textContent=`${r.codigo} · ${r.ubicacion}`;detailContent.innerHTML=`<div class="detailHero"><div class="detailMain"><span class="eyebrow">${r.alimentador}</span><h2>${r.codigo}</h2>${badge(r.estado)}<p>${r.observaciones||"Sin observaciones técnicas."}</p>${isAdmin()?`<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn secondary" onclick="editReco(${r.id})">Editar equipo</button><button class="btn secondary" onclick="closeModal('detailModal');openInspection('${r.codigo}')">+ Nueva inspección</button></div>`:""}</div><div class="detailAside"><h3>Estado actual</h3><div class="inspectionCard">${last?`<div class="inspectionTop"><strong>Última inspección</strong>${badge(last.resultado)}</div><p>${fmtDate(last.fecha)} · ${last.inspector}</p><p class="muted">${last.observaciones}</p>`:"<p class='muted'>Sin inspecciones registradas.</p>"}</div><button class="btn primary" onclick="window.open('https://www.google.com/maps?q=${r.lat},${r.lon}','_blank')">📍 Ver ubicación</button></div></div><div class="detailStats"><div class="stat"><span>Marca / modelo</span><strong>${r.marca} ${r.modelo||""}</strong></div><div class="stat"><span>N° serie</span><strong>${r.serie||"-"}</strong></div><div class="stat"><span>Control</span><strong>${r.control||"-"}</strong></div><div class="stat"><span>Firmware</span><strong>${r.firmware||"-"}</strong></div><div class="stat"><span>Alimentador</span><strong>${r.alimentador||"-"}</strong></div><div class="stat"><span>Instalación</span><strong>${fmtDate(r.instalacion)}</strong></div><div class="stat"><span>Últ. mantención</span><strong>${fmtDate(r.ultima)}</strong></div><div class="stat"><span>Próx. mantención</span><strong>${fmtDate(r.proxima)}</strong></div></div><h3>Historial de inspecciones</h3><div class="history">${ins.map(i=>`<div class="historyItem"><h4>${fmtDate(i.fecha)} · ${i.inspector}</h4><p>${badge(i.resultado)} · Batería ${i.tension||"-"} V · Comunicación ${i.comunicaciones}</p><p>${i.observaciones||"Sin observaciones."}</p></div>`).join("")||`<p class="muted">Sin inspecciones registradas.</p>`}</div>`;openModal("detailModal")}
function newReco(){if(!isAdmin())return toast("Acceso administrador requerido");recoForm.reset();recoForm.id.value="";recoFormTitle.textContent="Nuevo reconectador";openModal("recoModal")}
function editReco(id){if(!isAdmin())return;let r=state.reconectadores.find(x=>x.id===id);if(!r)return;for(let k in r){if(recoForm.elements[k])recoForm.elements[k].value=r[k]??""}recoFormTitle.textContent=`Editar ${r.codigo}`;closeModal("detailModal");openModal("recoModal")}
recoForm.addEventListener("submit",async e=>{e.preventDefault();if(!isAdmin())return;let o=Object.fromEntries(new FormData(e.target));delete o.id;["lat","lon"].forEach(k=>{if(o[k]==="")o[k]=null;else if(o[k]!=null)o[k]=Number(o[k])});["instalacion","ultima","proxima"].forEach(k=>{if(o[k]==="")o[k]=null});const {error}=await sb.from('reconectadores').upsert(o,{onConflict:'codigo'});if(error){console.error(error);return toast("No se pudo guardar")};closeModal("recoModal");await loadData();toast("Reconectador guardado en línea")});
function openInspection(code){if(!isAdmin())return;inspectionForm.reset();inspectionForm.equipo.value=code;inspectionForm.fecha.value=today();inspectionForm.inspector.value=state.session.name;document.querySelectorAll(".checkGrid input").forEach(x=>x.checked=true);inspectionTitle.textContent=code;openModal("inspectionModal")}
inspectionForm.addEventListener("submit",async e=>{e.preventDefault();if(!isAdmin())return;let f=new FormData(e.target),check={};document.querySelectorAll(".checkGrid input").forEach(x=>check[x.name]=x.checked);const row={equipo:f.get("equipo"),fecha:f.get("fecha"),inspector:f.get("inspector"),resultado:f.get("resultado"),operaciones:Number(f.get("operaciones")||0),tension:f.get("tension")?Number(f.get("tension")):null,comunicaciones:f.get("comunicaciones"),observaciones:f.get("observaciones"),checklist:check};const {error}=await sb.from('inspecciones').insert(row);if(error){console.error(error);return toast("No se pudo guardar la inspección")};closeModal("inspectionModal");await loadData();toast("Inspección guardada en línea")});

function buildAdminPasswordModal(){
 const modal=document.getElementById('accessModal');
 if(!modal)return;
 modal.innerHTML=`<div class="modalBox"><div class="modalHead"><div><span class="eyebrow">ADMINISTRADOR</span><h3>Acceso de edición</h3></div><button class="x" onclick="closeModal('accessModal')">✕</button></div><p class="muted">Ingresa la contraseña de administrador.</p><label>Contraseña<input id="accessPassword" type="password" autocomplete="current-password" placeholder="Contraseña"></label><button class="btn primary full" onclick="loginAdminPassword()">Ingresar como administrador</button><button class="btn ghost full" style="margin-top:8px" onclick="logoutAdmin()">Salir de administrador</button></div>`;
}
function openAccess(){
 buildAdminPasswordModal();
 const p=document.getElementById('accessPassword');
 if(p)p.value='';
 openModal("accessModal");
 setTimeout(()=>document.getElementById('accessPassword')?.focus(),100);
}
async function loginAdminPassword(){
 const password=document.getElementById('accessPassword')?.value||'';
 if(!password)return toast("Ingresa la contraseña");
 const {error}=await sb.auth.signInWithPassword({email:ADMIN_EMAIL,password});
 if(error){console.error(error);const p=document.getElementById('accessPassword');if(p)p.value='';return toast("Contraseña incorrecta");}
 await refreshSession();renderAll();closeModal("accessModal");toast("Modo administrador activado");
}
async function logoutAdmin(){await sb.auth.signOut();await refreshSession();renderAll();closeModal("accessModal");toast("Modo consulta activado")}
function goView(id){document.querySelector(`[data-view="${id}"]`).click()}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{if(b.dataset.view==="administrar"&&!isAdmin())return;document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.querySelectorAll(".view").forEach(x=>x.classList.remove("active-view"));document.getElementById(b.dataset.view).classList.add("active-view");if(b.dataset.view==="mapa")renderMap()}));
searchReco.addEventListener("input",renderRecos);filterStatus.addEventListener("change",renderRecos);filterBrand.addEventListener("change",renderRecos);
function downloadBackup(){let b=new Blob([JSON.stringify({reconectadores:state.reconectadores,inspecciones:state.inspecciones},null,2)],{type:"application/json"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=`reconectadores_mt_${today()}.json`;a.click();URL.revokeObjectURL(u)}
function renderAll(){renderAccess();renderDashboard();renderFilters();renderRecos();renderMap()}
buildAdminPasswordModal();
(async()=>{await refreshSession();await loadData();sb.auth.onAuthStateChange(async()=>{await refreshSession();renderAll()});setInterval(()=>loadData(false),20000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)loadData(false)});})();