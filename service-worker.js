const CACHE="reco-mt-v61-brand";
const CORE=["./","./index.html?v=61","./styles.css?v=61","./app.js?v=61","./status-percent.js?v=61","./admin-login.js?v=61","./cuadrante.js?v=61","./map-stable.js?v=61","./route-planner.js?v=61","./gestion-interactiva.js?v=61","./gestor-cuadrante.js?v=61","./comunicacion-remota.js?v=61","./ficha-reconectador.js?v=61","./respaldo-gestion.js?v=61","./gestion-pdf.js?v=61","./manuales.js?v=61","./visual-v43.js?v=61","./inicio-profesional.js?v=61","./equipos-profesional.js?v=61","./gestion-industrial.js?v=61","./manifest.webmanifest?v=61","./icons/reco-app.svg?v=61"];
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
    for(const client of clients){try{await client.navigate(new URL("./?v=61",self.registration.scope).href)}catch(_){}}
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
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html?v=61")||caches.match("./"))));
  }
});