// v63 · Datos complementarios del catastro 2024–2026.
// Fuente: Catastro_MT_APP_2024_2026_CON_SAIDI.
// Los eventos de escenario se mantienen separados del historial técnico confirmado.
(function(){
  let cache=null;
  const files=Array.from({length:7},(_,i)=>`data-v63/chunk-${i}.txt?v=63`);

  async function load(){
    if(cache)return cache;
    if(typeof DecompressionStream!=="function"){
      throw new Error("Navegador sin soporte para cargar la actualización 2024–2026.");
    }
    const parts=await Promise.all(files.map(async url=>{
      const r=await fetch(url,{cache:"no-store"});
      if(!r.ok)throw new Error("No se pudo cargar "+url);
      return (await r.text()).trim();
    }));
    const bin=atob(parts.join("").replace(/\s+/g,""));
    const bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    cache=JSON.parse(await new Response(stream).text());
    return cache;
  }

  window.loadUpdateDataV63=load;
  window.RECO_DATA_VERSION="2026-11-14";
})();