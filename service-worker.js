const CACHE="reco-mt-v48-revert-feeders";
const CORE=["./","./index.html?v=48","./styles.css?v=48","./app.js?v=48","./status-percent.js?v=48","./admin-login.js?v=48","./cuadrante.js?v=48","./map-stable.js?v=48","./route-planner.js?v=48","./gestion-interactiva.js?v=48","./gestor-cuadrante.js?v=48","./comunicacion-remota.js?v=48","./respaldo-gestion.js?v=48","./gestion-pdf.js?v=48","./manuales.js?v=48","./visual-v43.js?v=48","./manifest.webmanifest?v=48"];
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
    for(const client of clients){try{await client.navigate(new URL("./?v=48",self.registration.scope).href)}catch(_){}}
  })());
});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const url=new URL(e.request.url);
  if(url.origin===self.location.origin){
    e.respondWith(fetch(e.request,{cache:"no-store"}).then(resp=>{
      const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});return resp;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html?v=48")||caches.match("./"))));
  }
});