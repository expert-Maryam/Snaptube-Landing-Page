/* ============ FEATURE SECTION — PREMIUM 3D / 4D RUNTIME ============ */
(function(){
  const section=document.getElementById('features');
  if(!section) return;
  const box=section.querySelector('.services-box');
  const rows=[...section.querySelectorAll('.services-box .row')];
  const field=document.getElementById('featureParticleField');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine=matchMedia('(pointer:fine)').matches;

  rows.forEach((row,index)=>row.dataset.depth=String(index+1).padStart(2,'0')+' / 04');

  if(field && !field.children.length){
    const frag=document.createDocumentFragment();
    for(let i=0;i<34;i++){
      const p=document.createElement('i');
      p.className='feature-particle';
      const x=(6+Math.random()*88).toFixed(2)+'%';
      const y=(5+Math.random()*90).toFixed(2)+'%';
      const s=(2+Math.random()*4).toFixed(1)+'px';
      p.style.cssText=[
        '--px:'+x,'--py:'+y,'--ps:'+s,'--po:'+(0.25+Math.random()*0.55).toFixed(2),
        '--pd:'+(4+Math.random()*7).toFixed(2)+'s','--pdelay:'+(-Math.random()*8).toFixed(2)+'s',
        '--pdx:'+(-20+Math.random()*40).toFixed(1)+'px','--pdy:'+(-30+Math.random()*60).toFixed(1)+'px',
        '--pz:'+(-160+Math.random()*320).toFixed(1)+'px'
      ].join(';');
      frag.appendChild(p);
    }
    field.appendChild(frag);
  }

  let raf=0,lastY=scrollY,lastT=performance.now(),velocity=0;
  function updateScroll(){
    const r=section.getBoundingClientRect();
    const p=Math.max(0,Math.min(1,(innerHeight-r.top)/(innerHeight+r.height)));
    const now=performance.now();
    const dt=Math.max(16,now-lastT);
    velocity+=(Math.min(2.2,Math.abs(scrollY-lastY)/dt*18)-velocity)*.2;
    section.style.setProperty('--feature-progress',p.toFixed(4));
    section.style.setProperty('--feature-velocity',velocity.toFixed(3));
    lastY=scrollY;lastT=now;raf=0;
  }
  function requestScroll(){if(!raf) raf=requestAnimationFrame(updateScroll)}
  addEventListener('scroll',requestScroll,{passive:true});
  addEventListener('resize',requestScroll,{passive:true});
  updateScroll();

  if(!reduced && fine){
    let tx=0,ty=0,cx=0,cy=0,moveRaf=0;
    const render=()=>{
      cx+=(tx-cx)*.09;cy+=(ty-cy)*.09;
      section.style.setProperty('--feature-tilt-y',(cx*8).toFixed(2)+'deg');
      section.style.setProperty('--feature-tilt-x',(-cy*6).toFixed(2)+'deg');
      if(Math.abs(tx-cx)>.002||Math.abs(ty-cy)>.002) moveRaf=requestAnimationFrame(render);else moveRaf=0;
    };
    section.addEventListener('pointermove',e=>{
      const r=section.getBoundingClientRect();
      tx=(e.clientX-r.left)/Math.max(1,r.width)-.5;
      ty=(e.clientY-r.top)/Math.max(1,r.height)-.5;
      section.style.setProperty('--feature-light-x',((tx+.5)*100).toFixed(1)+'%');
      section.style.setProperty('--feature-light-y',((ty+.5)*100).toFixed(1)+'%');
      if(!moveRaf) moveRaf=requestAnimationFrame(render);
    });
    section.addEventListener('pointerleave',()=>{
      tx=0;ty=0;
      section.style.setProperty('--feature-light-x','50%');
      section.style.setProperty('--feature-light-y','50%');
      if(!moveRaf) moveRaf=requestAnimationFrame(render);
    });
  }

  rows.forEach(row=>{
    row.addEventListener('pointerdown',e=>{
      const r=row.getBoundingClientRect();
      const ripple=document.createElement('span');
      ripple.className='feature-ripple';
      const size=Math.max(r.width,r.height)*1.5;
      ripple.style.width=size+'px';ripple.style.height=size+'px';
      ripple.style.left=(e.clientX-r.left)+'px';ripple.style.top=(e.clientY-r.top)+'px';
      row.appendChild(ripple);
      ripple.addEventListener('animationend',()=>ripple.remove());
    });
    row.addEventListener('mouseenter',()=>{
      rows.forEach(r=>r.classList.remove('active'));
      row.classList.add('active');
    });
  });
})();