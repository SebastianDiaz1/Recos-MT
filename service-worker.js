const CACHE="reco-mt-v53-home";
const CORE=["./","./index.html?v=53","./styles.css?v=53","./app.js?v=53","./status-percent.js?v=53","./admin-login.js?v=53","./cuadrante.js?v=53","./map-stable.js?v=53","./route-planner.js?v=53","./gestion-interactiva.js?v=53","./gestor-cuadrante.js?v=53","./comunicacion-remota.js?v=53","./ficha-reconectador.js?v=53","./respaldo-gestion.js?v=53","./gestion-pdf.js?v=53","./manuales.js?v=53","./visual-v43.js?v=53","./inicio-profesional.js?v=53","./manifest.webmanifest?v=53"];
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
    for(const client of clients){try{await client.navigate(new URL("./?v=53",self.registration.scope).href)}catch(_){}}
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
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html?v=53")||caches.match("./"))));
  }
});