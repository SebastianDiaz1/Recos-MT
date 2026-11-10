const CACHE="reco-mt-v58-pdf-report";
const CORE=["./","./index.html?v=58","./styles.css?v=58","./app.js?v=58","./status-percent.js?v=58","./admin-login.js?v=58","./cuadrante.js?v=58","./map-stable.js?v=58","./route-planner.js?v=58","./gestion-interactiva.js?v=58","./gestor-cuadrante.js?v=58","./comunicacion-remota.js?v=58","./ficha-reconectador.js?v=58","./respaldo-gestion.js?v=58","./gestion-pdf.js?v=58","./manuales.js?v=58","./visual-v43.js?v=58","./inicio-profesional.js?v=58","./equipos-profesional.js?v=58","./gestion-industrial.js?v=58","./manifest.webmanifest?v=58"];
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
    for(const client of clients){try{await client.navigate(new URL("./?v=58",self.registration.scope).href)}catch(_){}}
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
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html?v=58")||caches.match("./"))));
  }
});