const CACHE="reco-mt-v66-inspeccion-tecnica";
const CORE=["./","./index.html?v=66","./styles.css?v=66","./data-update-v63.js?v=66","./data-v63/chunk-0.txt?v=66","./data-v63/chunk-1.txt?v=66","./data-v63/chunk-2.txt?v=66","./data-v63/chunk-3.txt?v=66","./data-v63/chunk-4.txt?v=66","./data-v63/chunk-5.txt?v=66","./data-v63/chunk-6.txt?v=66","./app.js?v=66","./status-percent.js?v=66","./admin-login.js?v=66","./cuadrante.js?v=66","./map-stable.js?v=66","./route-planner.js?v=66","./gestion-interactiva.js?v=66","./gestor-cuadrante.js?v=66","./comunicacion-remota.js?v=66","./ficha-reconectador.js?v=66","./respaldo-gestion.js?v=66","./gestion-pdf.js?v=66","./manuales.js?v=66","./visual-v43.js?v=66","./inicio-profesional.js?v=66","./equipos-profesional.js?v=66","./gestion-industrial.js?v=66","./actualizacion-2024-2026.js?v=66","./gestion-detallada-v65.js?v=66","./inspeccion-tecnica-v66.js?v=66","./manifest.webmanifest?v=66","./icons/reco-app.svg?v=66","./icons/icon-192.png?v=66","./icons/icon-512.png?v=66","./icons/apple-touch-icon.png?v=66"];
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
    for(const client of clients){try{await client.navigate(new URL("./?v=66",self.registration.scope).href)}catch(_){}}
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
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html?v=66")||caches.match("./"))));
  }
});