(function(){
  var section=document.querySelector('.teaser-4d');
  if(!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var fine=window.matchMedia('(pointer:fine)').matches;
  var tx=0,ty=0,cx=0,cy=0,lastY=window.scrollY,lastT=performance.now(),velocity=0,raf=0;

  function render(){
    cx+=(tx-cx)*.085;
    cy+=(ty-cy)*.085;
    section.style.setProperty('--t4-ry',(cx*9).toFixed(2)+'deg');
    section.style.setProperty('--t4-rx',(-cy*7).toFixed(2)+'deg');
    raf=0;
  }
  function request(){if(!raf) raf=requestAnimationFrame(render)}

  if(fine){
    section.addEventListener('pointermove',function(e){
      var r=section.getBoundingClientRect();
      tx=((e.clientX-r.left)/Math.max(1,r.width)-.5)*2;
      ty=((e.clientY-r.top)/Math.max(1,r.height)-.5)*2;
      request();
    });
    section.addEventListener('pointerleave',function(){tx=0;ty=0;request()});
  }

  var scrollRaf=0;
  function updateScroll(){
    var now=performance.now();
    var y=window.scrollY;
    var dt=Math.max(16,now-lastT);
    velocity+=( ((y-lastY)/dt*1000)-velocity )*.18;
    lastY=y;lastT=now;
    var r=section.getBoundingClientRect();
    var progress=Math.max(0,Math.min(1,(innerHeight-r.top)/(innerHeight+r.height)));
    var centered=(progress-.5)*2;
    section.style.setProperty('--t4-progress',progress.toFixed(4));
    section.style.setProperty('--t4-scroll',(centered*32).toFixed(2)+'px');
    section.style.setProperty('--t4-velocity',Math.max(-80,Math.min(80,velocity)).toFixed(2));
    scrollRaf=0;
  }
  function requestScroll(){if(!scrollRaf) scrollRaf=requestAnimationFrame(updateScroll)}
  updateScroll();
  addEventListener('scroll',requestScroll,{passive:true});
  addEventListener('resize',requestScroll,{passive:true});
})();