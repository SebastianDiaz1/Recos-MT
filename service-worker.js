const CACHE="reco-mt-v56-equipos-stable";
const CORE=["./","./index.html?v=56","./styles.css?v=56","./app.js?v=56","./status-percent.js?v=56","./admin-login.js?v=56","./cuadrante.js?v=56","./map-stable.js?v=56","./route-planner.js?v=56","./gestion-interactiva.js?v=56","./gestor-cuadrante.js?v=56","./comunicacion-remota.js?v=56","./ficha-reconectador.js?v=56","./respaldo-gestion.js?v=56","./gestion-pdf.js?v=56","./manuales.js?v=56","./visual-v43.js?v=56","./inicio-profesional.js?v=56","./equipos-profesional.js?v=56","./manifest.webmanifest?v=56"];
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
    for(const client of clients){try{await client.navigate(new URL("./?v=56",self.registration.scope).href)}catch(_){}}
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
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html?v=56")||caches.match("./"))));
  }
});