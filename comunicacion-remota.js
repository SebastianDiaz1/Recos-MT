// v44 · Visualización y edición de Comunicación Remota.
(function(){
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function comm(v){const s=String(v||'').trim().toUpperCase();return s==='SI'?'SI':s==='NO'?'NO':'-';}
  function commBadge(v){
    const s=comm(v);
    const cls=s==='SI'?'ok':s==='NO'?'info':'info';
    return '<span class="badge '+cls+'">'+esc(s)+'</span>';
  }

  function ensureForm(){
    const grid=document.querySelector('#recoForm .formGrid');
    if(!grid||grid.querySelector('[name="comunicacion_remota"]'))return;
    const label=document.createElement('label');
    label.innerHTML='COMUNICACIÓN REMOTA<select name="comunicacion_remota"><option value="">Sin registro</option><option value="SI">SI</option><option value="NO">NO</option></select>';
    const estado=grid.querySelector('[name="estado"]')?.closest('label');
    if(estado)estado.after(label);else grid.appendChild(label);
  }

  function ensureFilter(){
    const filters=document.querySelector('#catalogo .filters');
    if(!filters||document.getElementById('filterComunicacion'))return;
    const s=document.createElement('select');s.id='filterComunicacion';
    s.innerHTML='<option value="">Toda comunicación remota</option><option value="SI">Con comunicación remota</option><option value="NO">Sin comunicación remota</option>';
    filters.appendChild(s);
    s.addEventListener('change',()=>window.renderRecos?.());
  }

  function decorateCards(){
    const selected=document.getElementById('filterComunicacion')?.value||'';
    document.querySelectorAll('#recoGrid .recoCard').forEach(card=>{
      const code=card.querySelector('.recoCode')?.textContent.trim();
      const r=(state.reconectadores||[]).find(x=>String(x.codigo).trim()===code);
      if(!r)return;
      card.style.display=(!selected||comm(r.comunicacion_remota)===selected)?'':'none';
      const grid=card.querySelector('.metaGrid');
      if(grid&&!grid.querySelector('[data-remote-comm]')){
        const box=document.createElement('div');box.className='metaBox';box.dataset.remoteComm='1';
        box.innerHTML='<span>Comunicación remota</span><strong>'+commBadge(r.comunicacion_remota)+'</strong>';
        grid.appendChild(box);
      }
    });
  }

  function enrichDetail(id){
    const r=(state.reconectadores||[]).find(x=>x.id===id);if(!r)return;
    setTimeout(()=>{
      const stats=document.querySelector('#detailContent .detailStats');if(!stats)return;
      if(!stats.querySelector('[data-remote-comm]')){
        const d=document.createElement('div');d.className='stat';d.dataset.remoteComm='1';
        d.innerHTML='<span>Comunicación remota</span><strong>'+commBadge(r.comunicacion_remota)+'</strong>';
        stats.appendChild(d);
      }
    },0);
  }

  function gestionRows(){
    const q=document.getElementById('gQuadrant')?.value||'';
    const s=document.getElementById('gStatus')?.value||'';
    return (state.reconectadores||[]).filter(r=>(!q||String(r.cuadrante||'')===q)&&(!s||r.estado===s));
  }

  function enrichGestion(){
    setTimeout(()=>{
      const host=document.getElementById('gestionContent');if(!host)return;
      const cards=host.querySelector('.gKpis')||host.querySelector('.gKpi')?.parentElement;
      if(!cards)return;
      let card=document.getElementById('gRemoteCommKpi');
      const rows=gestionRows(),yes=rows.filter(r=>comm(r.comunicacion_remota)==='SI').length,no=rows.filter(r=>comm(r.comunicacion_remota)==='NO').length;
      const pct=rows.length?Math.round(yes*100/rows.length):0;
      if(!card){card=document.createElement('div');card.id='gRemoteCommKpi';card.className='gKpi';cards.appendChild(card);}
      card.innerHTML='<span>Comunicación remota</span><strong>'+pct+'%</strong><small>'+yes+' con comunicación · '+no+' sin comunicación</small>';
    },80);
  }

  ensureForm();ensureFilter();

  const prevRender=window.renderRecos;
  if(typeof prevRender==='function')window.renderRecos=function(){prevRender();ensureFilter();decorateCards();};

  const prevShow=window.showReco;
  if(typeof prevShow==='function')window.showReco=function(id){prevShow(id);enrichDetail(id);};

  const prevAll=window.renderAll;
  if(typeof prevAll==='function')window.renderAll=function(){prevAll();ensureForm();ensureFilter();decorateCards();enrichGestion();};

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-view="catalogo"]'))setTimeout(()=>{ensureFilter();decorateCards();},80);
    if(e.target.closest('[data-view="gestion"]'))enrichGestion();
  });
  const obs=new MutationObserver(()=>{ensureForm();if(document.getElementById('gestion')?.classList.contains('active-view'))enrichGestion();});
  obs.observe(document.body,{childList:true,subtree:true});
  setTimeout(()=>{ensureForm();ensureFilter();decorateCards();enrichGestion();},900);
})();