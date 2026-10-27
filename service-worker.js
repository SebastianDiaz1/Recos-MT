const CACHE="reco-mt-v47-feeder-ui";
const CORE=["./","./index.html?v=47","./styles.css?v=47","./app.js?v=47","./status-percent.js?v=47","./admin-login.js?v=47","./cuadrante.js?v=47","./map-stable.js?v=47","./route-planner.js?v=47","./alimentadores-map.js?v=47","./alimentadores.geojson?v=47","./gestion-interactiva.js?v=47","./gestor-cuadrante.js?v=47","./comunicacion-remota.js?v=47","./respaldo-gestion.js?v=47","./gestion-pdf.js?v=47","./manuales.js?v=47","./visual-v43.js?v=47","./manifest.webmanifest?v=47"];
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
    for(const client of clients){try{await client.navigate(new URL("./?v=47",self.registration.scope).href)}catch(_){}}
  })());
});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const url=new URL(e.request.url);
  if(url.origin===self.location.origin){
    e.respondWith(fetch(e.request,{cache:"no-store"}).then(resp=>{
      const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});return resp;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html?v=47")||caches.match("./"))));
  }
});