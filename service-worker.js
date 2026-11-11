const CACHE="reco-mt-v62-native-icons";
const CORE=["./","./index.html?v=62","./styles.css?v=62","./app.js?v=62","./status-percent.js?v=62","./admin-login.js?v=62","./cuadrante.js?v=62","./map-stable.js?v=62","./route-planner.js?v=62","./gestion-interactiva.js?v=62","./gestor-cuadrante.js?v=62","./comunicacion-remota.js?v=62","./ficha-reconectador.js?v=62","./respaldo-gestion.js?v=62","./gestion-pdf.js?v=62","./manuales.js?v=62","./visual-v43.js?v=62","./inicio-profesional.js?v=62","./equipos-profesional.js?v=62","./gestion-industrial.js?v=62","./manifest.webmanifest?v=62","./icons/reco-app.svg?v=62","./icons/icon-192.png?v=62","./icons/icon-512.png?v=62","./icons/apple-touch-icon.png?v=62"];
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
    for(const client of clients){try{await client.navigate(new URL("./?v=62",self.registration.scope).href)}catch(_){}}
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
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html?v=62")||caches.match("./"))));
  }
});