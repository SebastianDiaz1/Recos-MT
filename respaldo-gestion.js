// v59 · Fecha y hora en Inicio. Sin respaldo por correo ni cargadores PDF antiguos.
(function(){
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
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
      @media(max-width:600px){.inicioClock{display:flex;width:100%;box-sizing:border-box}}
    `;document.head.appendChild(s);
  }
  function ensureClock(){
    ensureStyles();
    const heroText=document.querySelector('#inicio .homeHeroV53>div:first-child, #inicio .hero > div:first-child');
    if(!heroText)return;
    let clock=document.getElementById('inicioClock');
    if(!clock){
      clock=document.createElement('div');clock.id='inicioClock';clock.className='inicioClock';
      const buttons=heroText.querySelector('.homeHeroActionsV53,.hero-buttons');
      if(buttons)heroText.insertBefore(clock,buttons);else heroText.appendChild(clock);
    }
    const f=fechaHora();
    clock.innerHTML='<div class="inicioClockIcon">🕒</div><div><strong id="inicioHora">'+esc(f.hora)+'</strong><small id="inicioFecha">'+esc(f.fecha)+'</small></div>';
  }
  function updateClock(){
    const f=fechaHora(),h=document.getElementById('inicioHora'),d=document.getElementById('inicioFecha');
    if(h)h.textContent=f.hora;if(d)d.textContent=f.fecha;
  }
  ensureClock();updateClock();setInterval(updateClock,1000);
  document.addEventListener('click',e=>{if(e.target.closest('[data-view="inicio"]'))setTimeout(()=>{ensureClock();updateClock();},40);});
  setTimeout(ensureClock,900);
})();