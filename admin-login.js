function buildAdminPasswordModal(){
  const modal=document.getElementById('accessModal');
  if(!modal)return;
  modal.innerHTML=`<div class="modalBox"><div class="modalHead"><div><span class="eyebrow">ADMINISTRADOR</span><h3>Acceso de edición</h3></div><button class="x" onclick="closeModal('accessModal')">✕</button></div><p class="muted">Ingresa la contraseña de administrador para habilitar la edición.</p><label>Contraseña<input id="accessPassword" type="password" autocomplete="current-password" placeholder="Contraseña"></label><button class="btn primary full" onclick="loginAdminPassword()">Ingresar como administrador</button><button class="btn ghost full" style="margin-top:8px" onclick="logoutAdmin()">Salir de administrador</button></div>`;
  modal.addEventListener('keydown',e=>{if(e.key==='Enter'&&document.activeElement?.id==='accessPassword'){e.preventDefault();loginAdminPassword();}});
}

function openAccess(){
  const p=document.getElementById('accessPassword');
  if(p)p.value='';
  openModal('accessModal');
  setTimeout(()=>document.getElementById('accessPassword')?.focus(),100);
}

async function loginAdminPassword(){
  const input=document.getElementById('accessPassword');
  const password=input?.value||'';
  if(!password)return toast('Ingresa la contraseña');
  const {error}=await sb.auth.signInWithPassword({email:ADMIN_EMAIL,password});
  if(error){console.error(error);if(input)input.value='';return toast('Contraseña incorrecta');}
  await refreshSession();
  renderAll();
  closeModal('accessModal');
  toast('Modo administrador activado');
}

buildAdminPasswordModal();