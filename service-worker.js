const CACHE="reco-mt-v54-equipos";
const CORE=["./","./index.html?v=54","./styles.css?v=54","./app.js?v=54","./status-percent.js?v=54","./admin-login.js?v=54","./cuadrante.js?v=54","./map-stable.js?v=54","./route-planner.js?v=54","./gestion-interactiva.js?v=54","./gestor-cuadrante.js?v=54","./comunicacion-remota.js?v=54","./ficha-reconectador.js?v=54","./respaldo-gestion.js?v=54","./gestion-pdf.js?v=54","./manuales.js?v=54","./visual-v43.js?v=54","./inicio-profesional.js?v=54","./equipos-profesional.js?v=54","./manifest.webmanifest?v=54"];
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
    for(const client of clients){try{await client.navigate(new URL("./?v=54",self.registration.scope).href)}catch(_){}}
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
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html?v=54")||caches.match("./"))));
  }
});