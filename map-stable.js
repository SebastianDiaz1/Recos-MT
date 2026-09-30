// Mantiene la vista elegida por el usuario aunque el mapa se refresque internamente.
(function(){
  const originalRenderMap=window.renderMap;
  if(typeof originalRenderMap!=='function')return;

  let firstAutomaticFit=true;
  let userHasMoved=false;
  let savedCenter=null;
  let savedZoom=null;
  let listenersBound=false;

  function bindMapListeners(){
    if(!recoLeafletMap||listenersBound)return;
    listenersBound=true;
    const saveView=()=>{
      if(!recoLeafletMap)return;
      const c=recoLeafletMap.getCenter();
      savedCenter=[c.lat,c.lng];
      savedZoom=recoLeafletMap.getZoom();
      userHasMoved=true;
    };
    recoLeafletMap.on('zoomend',saveView);
    recoLeafletMap.on('moveend',saveView);
  }

  window.renderMap=function(){
    let centerBefore=null;
    let zoomBefore=null;

    if(recoLeafletMap){
      const c=recoLeafletMap.getCenter();
      centerBefore=[c.lat,c.lng];
      zoomBefore=recoLeafletMap.getZoom();
      if(userHasMoved&&savedCenter&&Number.isFinite(savedZoom)){
        centerBefore=savedCenter;
        zoomBefore=savedZoom;
      }
    }

    originalRenderMap();
    bindMapListeners();

    if(firstAutomaticFit){
      firstAutomaticFit=false;
      setTimeout(()=>bindMapListeners(),80);
      return;
    }

    if(recoLeafletMap&&centerBefore&&Number.isFinite(zoomBefore)){
      recoLeafletMap.setView(centerBefore,zoomBefore,{animate:false});
      savedCenter=centerBefore;
      savedZoom=zoomBefore;
    }
    setTimeout(()=>recoLeafletMap?.invalidateSize(false),50);
  };
})();
