// Etiquetas porcentuales sobre el gráfico Estado de la flota.
(function(){
  if(typeof Chart==='undefined')return;

  const statusPercentageLabels={
    id:'statusPercentageLabels',
    afterDatasetsDraw(chart){
      if(chart.canvas?.id!=='gStatusChart')return;
      const dataset=chart.data?.datasets?.[0];
      const meta=chart.getDatasetMeta(0);
      if(!dataset||!meta||meta.hidden)return;
      const values=(dataset.data||[]).map(v=>Number(v)||0);
      const total=values.reduce((a,b)=>a+b,0);
      if(!total)return;

      const ctx=chart.ctx;
      ctx.save();
      ctx.textAlign='center';
      ctx.textBaseline='middle';
      ctx.font='700 13px Inter, Segoe UI, Arial, sans-serif';
      ctx.fillStyle='#ffffff';
      ctx.shadowColor='rgba(0,0,0,.35)';
      ctx.shadowBlur=3;

      meta.data.forEach((arc,i)=>{
        const value=values[i];
        if(!value)return;
        const percent=value*100/total;
        const angle=Math.abs((arc.endAngle||0)-(arc.startAngle||0));
        if(angle<0.16)return;
        const pos=arc.tooltipPosition();
        const label=percent<10?percent.toFixed(1)+'%':Math.round(percent)+'%';
        ctx.fillText(label,pos.x,pos.y);
      });
      ctx.restore();
    }
  };

  Chart.register(statusPercentageLabels);
})();
