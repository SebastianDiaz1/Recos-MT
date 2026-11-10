const CACHE="reco-mt-v59-pdf-direct";
const CORE=["./","./index.html?v=59","./styles.css?v=59","./app.js?v=59","./status-percent.js?v=59","./admin-login.js?v=59","./cuadrante.js?v=59","./map-stable.js?v=59","./route-planner.js?v=59","./gestion-interactiva.js?v=59","./gestor-cuadrante.js?v=59","./comunicacion-remota.js?v=59","./ficha-reconectador.js?v=59","./respaldo-gestion.js?v=59","./gestion-pdf.js?v=59","./manuales.js?v=59","./visual-v43.js?v=59","./inicio-profesional.js?v=59","./equipos-profesional.js?v=59","./gestion-industrial.js?v=59","./manifest.webmanifest?v=59"];
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
    for(const client of clients){try{await client.navigate(new URL("./?v=59",self.registration.scope).href)}catch(_){}}
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
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html?v=59")||caches.match("./"))));
  }
});