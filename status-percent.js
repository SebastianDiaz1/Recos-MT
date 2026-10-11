// Etiquetas porcentuales para el gráfico Estado de la flota.
(function(){
  if(typeof Chart==='undefined') return;
  const plugin={
    id:'statusPercentageLabels',
    afterDatasetsDraw(chart){
      if(chart.canvas?.id!=='gStatusChart') return;
      const ds=chart.data?.datasets?.[0];
      if(!ds) return;
      const vals=(ds.data||[]).map(Number);
      const total=vals.reduce((a,b)=>a+(Number.isFinite(b)?b:0),0);
      if(!total) return;
      const meta=chart.getDatasetMeta(0);
      const ctx=chart.ctx;
      ctx.save();
      ctx.textAlign='center';
      ctx.textBaseline='middle';
      ctx.font='700 13px Inter, Segoe UI, Arial, sans-serif';
      meta.data.forEach((arc,i)=>{
        const v=vals[i]||0;
        if(v<=0) return;
        const p=v/total*100;
        const pos=arc.tooltipPosition();
        ctx.fillStyle='#ffffff';
        ctx.shadowColor='rgba(0,0,0,.35)';
        ctx.shadowBlur=3;
        ctx.fillText((p<10?p.toFixed(1):Math.round(p))+'%',pos.x,pos.y);
        ctx.shadowBlur=0;
      });
      ctx.restore();
    }
  };
  Chart.register(plugin);
})();