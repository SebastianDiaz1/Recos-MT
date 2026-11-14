const CACHE="reco-mt-v63-catastro-2024-2026";
const CORE=["./","./index.html?v=63","./styles.css?v=63","./data-update-v63.js?v=63","./data-v63/chunk-0.txt?v=63","./data-v63/chunk-1.txt?v=63","./data-v63/chunk-2.txt?v=63","./data-v63/chunk-3.txt?v=63","./data-v63/chunk-4.txt?v=63","./data-v63/chunk-5.txt?v=63","./data-v63/chunk-6.txt?v=63","./app.js?v=63","./status-percent.js?v=63","./admin-login.js?v=63","./cuadrante.js?v=63","./map-stable.js?v=63","./route-planner.js?v=63","./gestion-interactiva.js?v=63","./gestor-cuadrante.js?v=63","./comunicacion-remota.js?v=63","./ficha-reconectador.js?v=63","./respaldo-gestion.js?v=63","./gestion-pdf.js?v=63","./manuales.js?v=63","./visual-v43.js?v=63","./inicio-profesional.js?v=63","./equipos-profesional.js?v=63","./gestion-industrial.js?v=63","./actualizacion-2024-2026.js?v=63","./manifest.webmanifest?v=63","./icons/reco-app.svg?v=63","./icons/icon-192.png?v=63","./icons/icon-512.png?v=63","./icons/apple-touch-icon.png?v=63"];
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
    for(const client of clients){try{await client.navigate(new URL("./?v=63",self.registration.scope).href)}catch(_){}}
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
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html?v=63")||caches.match("./"))));
  }
});