const CACHE="reco-mt-v60-pdf-data";
const CORE=["./","./index.html?v=60","./styles.css?v=60","./app.js?v=60","./status-percent.js?v=60","./admin-login.js?v=60","./cuadrante.js?v=60","./map-stable.js?v=60","./route-planner.js?v=60","./gestion-interactiva.js?v=60","./gestor-cuadrante.js?v=60","./comunicacion-remota.js?v=60","./ficha-reconectador.js?v=60","./respaldo-gestion.js?v=60","./gestion-pdf.js?v=60","./manuales.js?v=60","./visual-v43.js?v=60","./inicio-profesional.js?v=60","./equipos-profesional.js?v=60","./gestion-industrial.js?v=60","./manifest.webmanifest?v=60"];
self.addEventListener("install",e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(CACHE);
    await Promise.allSettled(CORE.map(u=>c.add(u)));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate",e=>{
  e.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
    const clients=await self.clients.matchAll({type:"window",includeUncontrolled:true});
    for(const client of clients){try{await client.navigate(new URL("./?v=60",self.registration.scope).href)}catch(_){}}
  })());
});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const url=new URL(e.request.url);
  if(url.origin===self.location.origin){
    e.respondWith(fetch(e.request,{cache:"no-store"}).then(resp=>{
      const copy=resp.clone();
      caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
      return resp;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html?v=60")||caches.match("./"))));
  }
});