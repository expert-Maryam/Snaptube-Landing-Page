(function(){
  const wrap=document.querySelector('#how .phone-wrap');
  if(!wrap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let targetX=0,targetY=0,currentX=0,currentY=0,scrollLift=0,raf=0;
  const render=()=>{
    currentX+=(targetX-currentX)*.085;
    currentY+=(targetY-currentY)*.085;
    wrap.style.setProperty('--orbit-x',currentY.toFixed(2)+'deg');
    wrap.style.setProperty('--orbit-y',currentX.toFixed(2)+'deg');
    wrap.style.setProperty('--orbit-scroll',scrollLift.toFixed(2)+'px');
    if(Math.abs(targetX-currentX)>.02 || Math.abs(targetY-currentY)>.02) raf=requestAnimationFrame(render);
    else raf=0;
  };
  const request=()=>{if(!raf) raf=requestAnimationFrame(render)};
  wrap.addEventListener('pointermove',e=>{
    const r=wrap.getBoundingClientRect();
    const nx=(e.clientX-r.left)/r.width-.5;
    const ny=(e.clientY-r.top)/r.height-.5;
    targetX=nx*14;
    targetY=-ny*12;
    wrap.classList.add('is-ring-active');
    request();
  });
  wrap.addEventListener('pointerleave',()=>{
    targetX=0;targetY=0;
    wrap.classList.remove('is-ring-active');
    request();
  });
  const onScroll=()=>{
    const r=wrap.getBoundingClientRect();
    const center=r.top+r.height/2;
    scrollLift=Math.max(-14,Math.min(14,(innerHeight/2-center)*.035));
    request();
  };
  addEventListener('scroll',onScroll,{passive:true});
  onScroll();
})();