// Pestaña Manuales: biblioteca técnica de documentos asociados a la flota.
(function(){
  const MANUALES=[
    {
      titulo:'MiCOM P145 – Manual técnico',
      fabricante:'Schneider Electric',
      equipo:'MiCOM P141 / P142 / P143 / P144 / P145',
      referencia:'P14x/ES M/C74',
      detalle:'Relés de protección de circuito · Versión software 35 · Sufijo de hardware J',
      paginas:'640 páginas',
      fuente:'Schneider Electric',
      url:'https://www.se.com/cl/es/download/document/P14x_ES_M_C74/'
    },
    {
      titulo:'NOJA Power RC01 – Manual de usuario',
      fabricante:'NOJA Power',
      equipo:'OSM 15/27 kV · Control RC01ES',
      referencia:'NOJA-533-09',
      detalle:'Reconectador automático OSM · Series 079 / 200 · Control RC01ES',
      paginas:'125 páginas',
      fuente:'Copia pública del documento NOJA-533-09',
      url:'https://pdfcoffee.com/noja-533-09-manual-pdf-free.html'
    },
    {
      titulo:'NOJA Power RC10 – Manual de usuario',
      fabricante:'NOJA Power',
      equipo:'OSM 15/27/38 kV · Cubículo de Control RC',
      referencia:'NOJA-5009-11',
      detalle:'Series OSM 300 / 310 / 312 · Manual de usuario del cubículo RC',
      paginas:'243 páginas',
      fuente:'Copia pública del documento NOJA-5009-11',
      url:'https://es.scribd.com/document/489848868/12683-NOJA-Manual-Reconectador-SP'
    }
  ];

  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

  function ensureStyles(){
    if(document.getElementById('manualesStyles'))return;
    const s=document.createElement('style');s.id='manualesStyles';s.textContent=`
      .manualToolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:16px}
      .manualToolbar input{flex:1;min-width:220px;padding:11px 13px;border:1px solid #dfe5ec;border-radius:10px;background:#fff}
      .manualGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px}
      .manualCard{background:#fff;border:1px solid #e1e6ec;border-radius:14px;padding:16px;box-shadow:0 3px 11px rgba(16,34,58,.05);display:flex;flex-direction:column;gap:12px}
      .manualTop{display:flex;gap:12px;align-items:flex-start}.manualIcon{width:46px;height:46px;display:grid;place-items:center;border-radius:12px;background:#edf4fb;font-size:24px;flex:0 0 auto}
      .manualCard h3{margin:0 0 4px;color:#17253a}.manualCard p{margin:0;color:#6f7b8d;font-size:12px;line-height:1.45}
      .manualMeta{display:grid;grid-template-columns:1fr 1fr;gap:8px}.manualMeta div{padding:9px 10px;background:#f8fafc;border:1px solid #edf1f5;border-radius:9px}.manualMeta span{display:block;font-size:9px;font-weight:900;color:#8390a2;text-transform:uppercase}.manualMeta strong{display:block;margin-top:3px;font-size:11px;color:#31445c}
      .manualActions{display:flex;gap:8px;flex-wrap:wrap;margin-top:auto}.manualActions a{text-decoration:none}
      .manualNotice{margin-top:16px;padding:12px 14px;background:#f8fafc;border:1px solid #e5ebf1;border-radius:10px;color:#667487;font-size:12px}
    `;document.head.appendChild(s);
  }

  function render(){
    ensureStyles();
    const host=document.getElementById('manualesContent');if(!host)return;
    const q=(document.getElementById('manualSearch')?.value||'').toLowerCase().trim();
    const arr=MANUALES.filter(m=>Object.values(m).join(' ').toLowerCase().includes(q));
    host.innerHTML=`
      <div class="manualToolbar"><input id="manualSearch" placeholder="Buscar manual, fabricante, modelo o referencia..." value="${esc(q)}"></div>
      <div class="manualGrid">${arr.map(m=>`<article class="manualCard">
        <div class="manualTop"><div class="manualIcon">📘</div><div><h3>${esc(m.titulo)}</h3><p>${esc(m.detalle)}</p></div></div>
        <div class="manualMeta">
          <div><span>Fabricante</span><strong>${esc(m.fabricante)}</strong></div>
          <div><span>Referencia</span><strong>${esc(m.referencia)}</strong></div>
          <div><span>Aplicación</span><strong>${esc(m.equipo)}</strong></div>
          <div><span>Extensión</span><strong>${esc(m.paginas)}</strong></div>
        </div>
        <div class="manualActions"><a class="btn primary" href="${esc(m.url)}" target="_blank" rel="noopener">Abrir manual</a></div>
      </article>`).join('')||'<p class="muted">No hay manuales que coincidan con la búsqueda.</p>'}</div>
      <div class="manualNotice">Biblioteca técnica inicial cargada con los tres documentos entregados: MiCOM P145, NOJA Power RC01 y NOJA Power RC10.</div>`;
    document.getElementById('manualSearch')?.addEventListener('input',render);
  }

  window.renderManuales=render;
  document.addEventListener('click',e=>{if(e.target.closest('[data-view="manuales"]'))setTimeout(render,50);});
  setTimeout(render,900);
})();