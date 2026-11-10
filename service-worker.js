const CACHE="reco-mt-v52-ficha";
const CORE=["./","./index.html?v=52","./styles.css?v=52","./app.js?v=52","./status-percent.js?v=52","./admin-login.js?v=52","./cuadrante.js?v=52","./map-stable.js?v=52","./route-planner.js?v=52","./gestion-interactiva.js?v=52","./gestor-cuadrante.js?v=52","./comunicacion-remota.js?v=52","./ficha-reconectador.js?v=52","./respaldo-gestion.js?v=52","./gestion-pdf.js?v=52","./manuales.js?v=52","./visual-v43.js?v=52","./manifest.webmanifest?v=52"];
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
    for(const client of clients){try{await client.navigate(new URL("./?v=52",self.registration.scope).href)}catch(_){}}
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
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html?v=52")||caches.match("./"))));
  }
});