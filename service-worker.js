const CACHE="reco-mt-v57-gestion-industrial";
const CORE=["./","./index.html?v=57","./styles.css?v=57","./app.js?v=57","./status-percent.js?v=57","./admin-login.js?v=57","./cuadrante.js?v=57","./map-stable.js?v=57","./route-planner.js?v=57","./gestion-interactiva.js?v=57","./gestor-cuadrante.js?v=57","./comunicacion-remota.js?v=57","./ficha-reconectador.js?v=57","./respaldo-gestion.js?v=57","./gestion-pdf.js?v=57","./manuales.js?v=57","./visual-v43.js?v=57","./inicio-profesional.js?v=57","./equipos-profesional.js?v=57","./gestion-industrial.js?v=57","./manifest.webmanifest?v=57"];
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
    for(const client of clients){try{await client.navigate(new URL("./?v=57",self.registration.scope).href)}catch(_){}}
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
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html?v=57")||caches.match("./"))));
  }
});