(function(){
    var items = document.querySelectorAll('.why-card, .reveal, .reveal-stagger');
    if(!('IntersectionObserver' in window) || items.length === 0){
      items.forEach(function(el){ el.classList.add('in-view'); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(function(el){ io.observe(el); });
  })();

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasFinePointer = window.matchMedia('(pointer: fine)').matches;

  // Magnetic pull on buttons
  if(!prefersReducedMotion && hasFinePointer){
    document.querySelectorAll('.btn').forEach(function(btn){
      var raf = null;
      btn.addEventListener('mousemove', function(e){
        if(raf) return;
        raf = requestAnimationFrame(function(){
          var rect = btn.getBoundingClientRect();
          var x = e.clientX - rect.left - rect.width / 2;
          var y = e.clientY - rect.top - rect.height / 2;
          btn.style.transform = 'translate(' + (x * 0.25) + 'px,' + (y * 0.3) + 'px)';
          raf = null;
        });
      });
      btn.addEventListener('mouseleave', function(){
        if(raf){ cancelAnimationFrame(raf); raf = null; }
        btn.style.transform = '';
      });
    });
  }

  // Premium depth tilt + physically inspired glare on feature cards.
  if(!prefersReducedMotion && hasFinePointer){
    document.querySelectorAll('.why-card').forEach(function(card){
      var raf = null;
      card.addEventListener('mousemove', function(e){
        if(raf) return;
        raf = requestAnimationFrame(function(){
          var rect = card.getBoundingClientRect();
          var px = (e.clientX - rect.left) / rect.width;
          var py = (e.clientY - rect.top) / rect.height;
          card.style.setProperty('--card-rx', ((.5 - py) * 15).toFixed(2) + 'deg');
          card.style.setProperty('--card-ry', ((px - .5) * 18).toFixed(2) + 'deg');
          card.style.setProperty('--glare-x', (px * 100).toFixed(1) + '%');
          card.style.setProperty('--glare-y', (py * 100).toFixed(1) + '%');
          card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
          card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
          raf = null;
        });
      });
      card.addEventListener('mouseleave', function(){
        if(raf){ cancelAnimationFrame(raf); raf = null; }
        card.style.setProperty('--card-rx','0deg');
        card.style.setProperty('--card-ry','0deg');
        card.style.setProperty('--glare-x','50%');
        card.style.setProperty('--glare-y','50%');
      });
    });
  }

  // Premium hero camera: phone, portal and lighting respond together.
  if(!prefersReducedMotion){
    var heroDark = document.querySelector('.hero-dark');
    var phone = document.querySelector('.phone2-frame');
    var visual3D = document.querySelector('.hero-dark-visual');
    if(heroDark && phone && visual3D){
      var heroRaf = null;
      function applyHeroCamera(px,py){
        var sx = (px - .5) * 2;
        var sy = (py - .5) * 2;
        document.documentElement.style.setProperty('--scene-x', sx.toFixed(3));
        document.documentElement.style.setProperty('--scene-y', sy.toFixed(3));
        document.documentElement.style.setProperty('--phone-ry', (-22 + sx * 14).toFixed(2) + 'deg');
        document.documentElement.style.setProperty('--phone-rx', (8 - sy * 11).toFixed(2) + 'deg');
        document.documentElement.style.setProperty('--phone-rz', (sx * 1.4).toFixed(2) + 'deg');
        visual3D.style.setProperty('--visual-ry',(sx * 9).toFixed(2) + 'deg');
        visual3D.style.setProperty('--visual-rx',(-sy * 7).toFixed(2) + 'deg');
      }
      if(hasFinePointer){
        heroDark.addEventListener('mousemove', function(e){
          if(heroRaf) return;
          heroRaf = requestAnimationFrame(function(){
            var rect = heroDark.getBoundingClientRect();
            applyHeroCamera((e.clientX - rect.left) / rect.width,(e.clientY - rect.top) / rect.height);
            heroRaf = null;
          });
        });
        heroDark.addEventListener('mouseleave', function(){
          if(heroRaf){cancelAnimationFrame(heroRaf);heroRaf=null;}
          applyHeroCamera(.5,.5);
        });
      }
    }
  }

  // Custom FAQ accordion (smoothly animated, one open at a time)
  document.querySelectorAll('.faq-item').forEach(function(item){
    var btn = item.querySelector('.faq-summary');
    btn.addEventListener('click', function(){
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(openItem){
        if(openItem !== item){
          openItem.classList.remove('open');
          openItem.querySelector('.faq-summary').setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  // Multi-layer parallax scrolling. Movement is intentionally subtle.
  if(!prefersReducedMotion){
    var parallaxConfig = [
      ['.hero-blob', .18, 96],
      ['.hero-dark-copy', .035, 22],
      ['.hero-dark-visual', -.055, 38],
      ['.phone2-badge', -.10, 34],
      ['.feature .amb-blob', .10, 58],
      ['.phone-wrap', -.035, 24],
      ['.services-bg-logo', .045, 34],
      ['.services .amb-blob', -.08, 48],
      ['.teaser-art', -.035, 24]
    ];
    var parallaxLayers = parallaxConfig.map(function(item){
      return { el:document.querySelector(item[0]), speed:item[1], max:item[2] };
    }).filter(function(item){ return !!item.el; });
    var parallaxRaf = null;

    function updateParallax(){
      var viewportH = window.innerHeight || document.documentElement.clientHeight;
      parallaxLayers.forEach(function(layer){
        var rect = layer.el.getBoundingClientRect();
        if(rect.bottom < -180 || rect.top > viewportH + 180) return;
        var centre = rect.top + rect.height / 2;
        var distance = centre - viewportH / 2;
        var amount = Math.max(-layer.max, Math.min(layer.max, -distance * layer.speed));
        layer.el.style.setProperty('--parallax-y', amount.toFixed(2) + 'px');
      });
      parallaxRaf = null;
    }

    function requestParallax(){
      if(parallaxRaf) return;
      parallaxRaf = requestAnimationFrame(updateParallax);
    }

    updateParallax();
    window.addEventListener('scroll', requestParallax, { passive:true });
    window.addEventListener('resize', requestParallax, { passive:true });
  }


  // Click ripple for CTA buttons.
  if(!prefersReducedMotion){
    document.querySelectorAll('.btn').forEach(function(btn){
      btn.addEventListener('pointerdown', function(e){
        var rect = btn.getBoundingClientRect();
        var ripple = document.createElement('span');
        var size = Math.max(rect.width, rect.height) * 1.9;
        ripple.className = 'micro-ripple';
        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left) + 'px';
        ripple.style.top = (e.clientY - rect.top) + 'px';
        btn.appendChild(ripple);
        ripple.addEventListener('animationend', function(){ ripple.remove(); }, { once:true });
      });
    });
  }

  // Sticky nav: appears once you scroll past the hero, plus scrollspy for active link
  (function(){
    var stickyNav = document.querySelector('.sticky-nav');
    var heroSection = document.getElementById('top');
    if(!stickyNav || !heroSection) return;
    var sections = document.querySelectorAll('#how, #why, #faq');
    var navLinks = document.querySelectorAll('.sticky-nav-links a, .nav-links a');
    var raf = null;
    window.addEventListener('scroll', function(){
      if(raf) return;
      raf = requestAnimationFrame(function(){
        var heroBottom = heroSection.getBoundingClientRect().bottom;
        stickyNav.classList.toggle('visible', heroBottom < 0);

        var current = '';
        sections.forEach(function(sec){
          var rect = sec.getBoundingClientRect();
          if(rect.top < 140 && rect.bottom > 140){ current = sec.id; }
        });
        navLinks.forEach(function(link){
          var isMatch = link.getAttribute('href') === '#' + current;
          link.classList.toggle('active', isMatch && current !== '');
        });
        raf = null;
      });
    }, { passive: true });
  })();

  // Custom cursor glow, grows over interactive elements
  if(!prefersReducedMotion && hasFinePointer){
    var glow = document.querySelector('.cursor-glow');
    if(glow){
      var gx = 0, gy = 0, shown = false;
      document.addEventListener('mousemove', function(e){
        gx = e.clientX; gy = e.clientY;
        glow.style.transform = 'translate(' + gx + 'px,' + gy + 'px) translate(-50%,-50%)';
        if(!shown){ glow.classList.add('active'); shown = true; }
        var target = e.target.closest('a, button, .why-card, .faq-item');
        glow.classList.toggle('big', !!target);
      });
      document.addEventListener('mouseleave', function(){ glow.classList.remove('active'); });
    }
  }

  /* ============ FULL MOTION EXPERIENCE ============ */
  (function(){
    var body = document.body;
    var preloader = document.getElementById('sitePreloader');
    var percentEl = document.getElementById('preloaderPercent');
    var ring = document.getElementById('preloaderRing');
    var circumference = 327;
    var progress = 0;
    var loaded = document.readyState === 'complete';
    var started = performance.now();
    var minDuration = 1050;

    function setProgress(value){
      progress = Math.max(progress, Math.min(100, value));
      if(percentEl) percentEl.textContent = Math.round(progress) + '%';
      if(ring) ring.style.strokeDashoffset = String(circumference * (1 - progress / 100));
    }
    function tick(){
      var elapsed = performance.now() - started;
      var target = loaded ? 100 : Math.min(88, 10 + elapsed / 18);
      setProgress(progress + (target - progress) * .12);
      if((loaded && elapsed >= minDuration && progress > 98.5) || !preloader){
        setProgress(100);
        body.classList.remove('is-loading');
        body.classList.add('page-ready');
        if(preloader) preloader.classList.add('is-complete');
        return;
      }
      requestAnimationFrame(tick);
    }
    window.addEventListener('load', function(){ loaded = true; });
    setTimeout(function(){ loaded = true; }, 2600); // network/font fallback
    requestAnimationFrame(tick);
  })();

  // Split words while retaining inline highlight markup and accessible text.
  (function(){
    var wordIndex = 0;
    function splitNode(node){
      Array.from(node.childNodes).forEach(function(child){
        if(child.nodeType === Node.TEXT_NODE){
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function(part){
            if(!part) return;
            if(/^\s+$/.test(part)){ frag.appendChild(document.createTextNode(part)); return; }
            var span = document.createElement('span');
            span.className = 'split-word';
            span.textContent = part;
            span.setAttribute('aria-hidden','true');
            span.style.setProperty('--word-index', wordIndex++);
            frag.appendChild(span);
          });
          child.replaceWith(frag);
        }else if(child.nodeType === Node.ELEMENT_NODE){ splitNode(child); }
      });
    }
    document.querySelectorAll('[data-split], [data-split-scroll]').forEach(function(el){
      wordIndex = 0;
      el.setAttribute('aria-label', el.textContent.trim());
      splitNode(el);
      el.classList.add('split-ready');
    });
    var scrollSplits = document.querySelectorAll('[data-split-scroll]');
    if(!('IntersectionObserver' in window)){
      scrollSplits.forEach(function(el){el.classList.add('split-in')});
    }else{
      var splitObserver = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){ entry.target.classList.add('split-in'); splitObserver.unobserve(entry.target); }
        });
      },{threshold:.45});
      scrollSplits.forEach(function(el){splitObserver.observe(el)});
    }
  })();

  // Resolution dropdown reveal and selection.
  (function(){
    var picker = document.querySelector('.resolution-picker');
    if(!picker) return;
    var toggle = picker.querySelector('.resolution-toggle');
    var value = picker.querySelector('.resolution-value');
    var options = picker.querySelectorAll('[data-resolution]');
    toggle.addEventListener('click', function(){
      var open = picker.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    options.forEach(function(option){
      option.addEventListener('click', function(){
        options.forEach(function(item){item.removeAttribute('aria-selected')});
        option.setAttribute('aria-selected','true');
        value.textContent = option.dataset.resolution;
        picker.classList.remove('open');
        toggle.setAttribute('aria-expanded','false');
      });
    });
    document.addEventListener('click', function(e){
      if(!picker.contains(e.target)){picker.classList.remove('open');toggle.setAttribute('aria-expanded','false')}
    });
  })();

  // Repeating download progress simulation.
  (function(){
    if(prefersReducedMotion) return;
    var bar = document.getElementById('downloadProgressBar');
    var label = document.getElementById('downloadPercent');
    var state = document.getElementById('downloadState');
    if(!bar || !label || !state) return;
    var start = performance.now();
    var duration = 5400;
    function animate(now){
      var cycle = (now - start) % (duration + 1200);
      var p = cycle > duration ? 100 : Math.min(100, Math.pow(cycle / duration, .78) * 100);
      bar.style.width = p.toFixed(1) + '%';
      label.textContent = Math.round(p) + '%';
      state.textContent = p < 10 ? 'Preparing download…' : p < 96 ? 'Downloading in background…' : 'Saved for offline playback';
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  })();

  // Manual horizontal story: vertical wheel keeps scrolling the page.
  // Panels move only through true horizontal input, Shift+wheel, drag, buttons,
  // touch swipe, or the keyboard arrow keys.
  (function(){
    var section = document.querySelector('.horizontal-story');
    var viewport = document.querySelector('.horizontal-viewport');
    var track = document.querySelector('.horizontal-track');
    var head = document.querySelector('.horizontal-head');
    if(!section || !viewport || !track) return;

    track.style.removeProperty('--horizontal-x');
    viewport.setAttribute('tabindex','0');
    viewport.setAttribute('role','region');
    viewport.setAttribute('aria-label','SnapTube process cards. Drag or scroll horizontally to explore.');

    var controls = document.createElement('div');
    controls.className = 'horizontal-controls';
    controls.setAttribute('aria-label','Horizontal card controls');
    controls.innerHTML = '<button type="button" class="horizontal-arrow horizontal-prev" aria-label="Show previous card">&#8592;</button><span>Drag or swipe</span><button type="button" class="horizontal-arrow horizontal-next" aria-label="Show next card">&#8594;</button>';
    if(head) head.appendChild(controls);

    var prev = controls.querySelector('.horizontal-prev');
    var next = controls.querySelector('.horizontal-next');
    var raf = 0;
    var dragging = false;
    var dragStartX = 0;
    var dragStartScroll = 0;

    function maxScroll(){
      return Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    }

    function updateVisuals(){
      var max = maxScroll();
      var progress = max ? viewport.scrollLeft / max : 0;
      progress = Math.max(0, Math.min(1, progress));
      section.style.setProperty('--horizontal-progress', progress.toFixed(4));
      track.querySelectorAll('.format-stack span').forEach(function(el){
        el.style.setProperty('--panel-progress', progress.toFixed(3));
      });

      prev.disabled = viewport.scrollLeft <= 2;
      next.disabled = viewport.scrollLeft >= max - 2;

      var centre = viewport.getBoundingClientRect().left + viewport.clientWidth / 2;
      track.querySelectorAll('.scroll-panel').forEach(function(panel){
        var r = panel.getBoundingClientRect();
        var pc = (r.left + r.width / 2 - centre) / Math.max(1, viewport.clientWidth);
        var abs = Math.min(1, Math.abs(pc));
        panel.style.setProperty('--panel-ry', (-pc * 18).toFixed(2) + 'deg');
        panel.style.setProperty('--panel-rx', (abs * 2.5).toFixed(2) + 'deg');
        panel.style.setProperty('--panel-z', ((1 - abs) * 54 - 18).toFixed(1) + 'px');
        panel.style.setProperty('--panel-scale', (1 - abs * .075).toFixed(3));
        panel.style.setProperty('--panel-light', ((1 - pc) * 65).toFixed(1) + '%');
        panel.style.opacity = (1 - abs * .24).toFixed(3);
        panel.style.filter = 'saturate(' + (1 - abs * .16).toFixed(3) + ') blur(' + (abs * 1.25).toFixed(2) + 'px)';
      });
      raf = 0;
    }

    function requestUpdate(){
      if(!raf) raf = requestAnimationFrame(updateVisuals);
    }

    function cardStep(){
      var panel = track.querySelector('.scroll-panel');
      if(!panel) return Math.max(280, viewport.clientWidth * .72);
      var gap = parseFloat(getComputedStyle(track).gap) || 22;
      return Math.min(panel.getBoundingClientRect().width + gap, viewport.clientWidth * .88);
    }

    function move(direction){
      viewport.scrollBy({left: direction * cardStep(), behavior: prefersReducedMotion ? 'auto' : 'smooth'});
    }

    prev.addEventListener('click', function(){ move(-1); });
    next.addEventListener('click', function(){ move(1); });

    // Keep ordinary vertical wheel scrolling completely untouched.
    viewport.addEventListener('wheel', function(e){
      var horizontalIntent = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      var shiftedVertical = e.shiftKey && Math.abs(e.deltaY) > 0;
      if(!horizontalIntent && !shiftedVertical) return;
      e.preventDefault();
      viewport.scrollLeft += horizontalIntent ? e.deltaX : e.deltaY;
    }, {passive:false});

    viewport.addEventListener('keydown', function(e){
      if(e.key === 'ArrowLeft'){
        e.preventDefault();
        move(-1);
      }else if(e.key === 'ArrowRight'){
        e.preventDefault();
        move(1);
      }else if(e.key === 'Home'){
        e.preventDefault();
        viewport.scrollTo({left:0, behavior:prefersReducedMotion ? 'auto' : 'smooth'});
      }else if(e.key === 'End'){
        e.preventDefault();
        viewport.scrollTo({left:maxScroll(), behavior:prefersReducedMotion ? 'auto' : 'smooth'});
      }
    });

    // Mouse drag behaves like a native horizontal carousel. Touch keeps native swipe.
    viewport.addEventListener('pointerdown', function(e){
      if(e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true;
      dragStartX = e.clientX;
      dragStartScroll = viewport.scrollLeft;
      viewport.classList.add('is-dragging');
      viewport.setPointerCapture(e.pointerId);
    });
    viewport.addEventListener('pointermove', function(e){
      if(!dragging) return;
      viewport.scrollLeft = dragStartScroll - (e.clientX - dragStartX);
    });
    function stopDrag(e){
      if(!dragging) return;
      dragging = false;
      viewport.classList.remove('is-dragging');
      if(e && viewport.hasPointerCapture && viewport.hasPointerCapture(e.pointerId)) viewport.releasePointerCapture(e.pointerId);
    }
    viewport.addEventListener('pointerup', stopDrag);
    viewport.addEventListener('pointercancel', stopDrag);
    viewport.addEventListener('lostpointercapture', function(){
      dragging = false;
      viewport.classList.remove('is-dragging');
    });

    viewport.addEventListener('scroll', requestUpdate, {passive:true});
    window.addEventListener('resize', requestUpdate, {passive:true});
    if('ResizeObserver' in window) new ResizeObserver(requestUpdate).observe(viewport);
    requestUpdate();
  })();

  // Trigger SVG drawings as they enter the viewport.
  (function(){
    var drawings = document.querySelectorAll('.svg-draw:not(.hero-line-art)');
    if(!('IntersectionObserver' in window)){drawings.forEach(function(el){el.classList.add('draw-in')});return}
    var drawObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('draw-in');drawObserver.unobserve(entry.target)}});
    },{threshold:.55});
    drawings.forEach(function(el){drawObserver.observe(el)});
  })();

  // Floating platform icons respond subtly to pointer and scroll depth.
  if(!prefersReducedMotion){
    (function(){
      var visual = document.querySelector('.hero-dark-visual');
      var icons = document.querySelectorAll('.floating-platform');
      if(!visual || !icons.length) return;
      var raf = null;
      function reset(){icons.forEach(function(icon){icon.style.setProperty('--float-x','0px');icon.style.setProperty('--float-y','0px')})}
      if(hasFinePointer){
        visual.addEventListener('mousemove',function(e){
          if(raf)return;
          raf=requestAnimationFrame(function(){
            var r=visual.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
            icons.forEach(function(icon){var d=parseFloat(icon.dataset.floatDepth||1);icon.style.setProperty('--float-x',(x*22*d).toFixed(1)+'px');icon.style.setProperty('--float-y',(y*18*d).toFixed(1)+'px')});
            raf=null;
          });
        });
        visual.addEventListener('mouseleave',reset);
      }
    })();
  }

  // Precise cursor dot follows the existing custom ring.
  if(!prefersReducedMotion && hasFinePointer){
    var cursorDot = document.querySelector('.cursor-dot');
    if(cursorDot){
      document.addEventListener('mousemove',function(e){cursorDot.style.left=e.clientX+'px';cursorDot.style.top=e.clientY+'px';cursorDot.classList.add('active')});
      document.addEventListener('mouseleave',function(){cursorDot.classList.remove('active')});
    }
  }


  /* ============ PREMIUM 3D / 4D-STYLE RUNTIME ============ */
  (function(){
    if(prefersReducedMotion) return;

    var root = document.documentElement;
    var body = document.body;
    var canvas = document.getElementById('cinemaField');
    var ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
    var pointer = {x:.5,y:.45};
    var particles = [];
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var width = 0, height = 0;
    var lastY = window.scrollY;
    var scrollVelocity = 0;
    var scrollEnergy = 0;
    var pageProgress = 0;
    var warpTimer = 0;
    var lastFrame = performance.now();
    var lastActive = performance.now();
    var fieldRunning = false;

    function resizeField(){
      if(!canvas || !ctx) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.max(1,Math.floor(width*dpr));
      canvas.height = Math.max(1,Math.floor(height*dpr));
      canvas.style.width = width+'px';
      canvas.style.height = height+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
      var count = width < 760 ? 16 : Math.min(42,Math.floor(width/26));
      particles = Array.from({length:count},function(_,i){
        return {
          x:(Math.random()-.5)*width*1.5,
          y:(Math.random()-.5)*height*1.5,
          z:Math.random()*900+80,
          pz:0,
          size:Math.random()*1.7+.35,
          hue:i%5===0 ? 4 : 44,
          speed:Math.random()*.5+.45
        };
      });
    }

    function resetParticle(p,front){
      p.x=(Math.random()-.5)*width*1.65;
      p.y=(Math.random()-.5)*height*1.65;
      p.z=front ? 930 : 860+Math.random()*160;
      p.pz=p.z;
    }

    function drawField(now){
      if(!ctx || !canvas) return;
      var dt=Math.min(32,now-lastFrame); lastFrame=now;
      ctx.clearRect(0,0,width,height);
      var cx=width*(.5+(pointer.x-.5)*.055);
      var cy=height*(.47+(pointer.y-.5)*.045);
      var speed=(.7+scrollEnergy*5.2)*dt*.07;
      ctx.globalCompositeOperation='lighter';
      particles.forEach(function(p){
        p.pz=p.z;
        p.z-=speed*p.speed;
        if(p.z<22) resetParticle(p,true);
        var scale=360/p.z;
        var pscale=360/p.pz;
        var x=cx+p.x*scale;
        var y=cy+p.y*scale;
        var px=cx+p.x*pscale;
        var py=cy+p.y*pscale;
        if(x<-80||x>width+80||y<-80||y>height+80){resetParticle(p,false);return;}
        var alpha=Math.min(.72,(1-p.z/980)*.72+.04);
        var radius=Math.max(.35,p.size*scale*1.7);
        ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(x,y);
        ctx.strokeStyle='hsla('+p.hue+',92%,65%,'+(alpha*(.3+scrollEnergy*.7))+')';
        ctx.lineWidth=Math.max(.35,radius*.42);ctx.stroke();
        ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);
        ctx.fillStyle='hsla('+p.hue+',96%,70%,'+alpha+')';ctx.fill();
      });
      ctx.globalCompositeOperation='source-over';
      if(now-lastActive<1200){
        requestAnimationFrame(drawField);
      }else{
        fieldRunning=false;
      }
    }

    function wakeField(){
      lastActive=performance.now();
      if(!fieldRunning && ctx){
        fieldRunning=true;
        lastFrame=performance.now();
        requestAnimationFrame(drawField);
      }
    }

    function updateScrollDimensions(){
      var y=window.scrollY;
      scrollVelocity=scrollVelocity*.76+(y-lastY)*.24;
      lastY=y;
      scrollEnergy=Math.min(1,Math.abs(scrollVelocity)/44);
      var max=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
      pageProgress=Math.max(0,Math.min(1,y/max));
      root.style.setProperty('--scroll-energy',scrollEnergy.toFixed(3));
      root.style.setProperty('--page-progress',pageProgress.toFixed(4));
      root.style.setProperty('--scene-hue',(pageProgress*28).toFixed(2)+'deg');
      root.style.setProperty('--phone-scroll-y',(Math.max(-38,Math.min(38,-scrollVelocity*.34))).toFixed(2)+'px');
      root.style.setProperty('--phone-depth',(scrollEnergy*48).toFixed(2)+'px');

      if(Math.abs(scrollVelocity)>18){
        body.classList.add('time-warp');
        clearTimeout(warpTimer);
        warpTimer=setTimeout(function(){body.classList.remove('time-warp')},150);
      }
    }

    document.addEventListener('pointermove',function(e){
      pointer.x=e.clientX/Math.max(1,window.innerWidth);
      pointer.y=e.clientY/Math.max(1,window.innerHeight);
      wakeField();
    },{passive:true});
    window.addEventListener('scroll',function(){
      updateScrollDimensions();
      wakeField();
    },{passive:true});
    window.addEventListener('resize',resizeField,{passive:true});
    resizeField();updateScrollDimensions();
    wakeField();

    // Give every horizontal panel camera depth based on viewport position.
    var panels=Array.from(document.querySelectorAll('.scroll-panel'));
    var panelRaf=null;
    function updatePanelDepth(){
      var centre=window.innerWidth/2;
      panels.forEach(function(panel){
        var r=panel.getBoundingClientRect();
        var pc=(r.left+r.width/2-centre)/Math.max(1,window.innerWidth);
        var abs=Math.min(1,Math.abs(pc));
        panel.style.setProperty('--panel-ry',(-pc*18).toFixed(2)+'deg');
        panel.style.setProperty('--panel-rx',(abs*2.5).toFixed(2)+'deg');
        panel.style.setProperty('--panel-z',((1-abs)*54-18).toFixed(1)+'px');
        panel.style.setProperty('--panel-scale',(1-abs*.075).toFixed(3));
        panel.style.setProperty('--panel-light',((1-pc)*65).toFixed(1)+'%');
        panel.style.opacity=(1-abs*.24).toFixed(3);
        panel.style.filter='saturate('+(1-abs*.16).toFixed(3)+') blur('+(abs*1.25).toFixed(2)+'px)';
      });
      panelRaf=null;
    }
    function requestPanelDepth(){if(!panelRaf)panelRaf=requestAnimationFrame(updatePanelDepth)}
    window.addEventListener('scroll',requestPanelDepth,{passive:true});
    window.addEventListener('resize',requestPanelDepth,{passive:true});
    requestPanelDepth();
  })();



  /* ============ LIQUID GLASS / AWWWARDS-STYLE RUNTIME ============ */
  (function(){
    var section = document.querySelector('.glass-experience');
    var world = document.querySelector('.glass-world');
    var lens = document.querySelector('.glass-lens');
    var glassSurfaces = document.querySelectorAll('.liquid-glass-surface, .sticky-nav, .hero-stats-bar, .services-box');
    if(!section || !world) return;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fine = window.matchMedia('(pointer:fine)').matches;
    var root = document.documentElement;
    var raf = null;

    function updateGlassScroll(){
      var rect = section.getBoundingClientRect();
      var travel = Math.max(1, section.offsetHeight - window.innerHeight);
      var p = window.innerWidth <= 900 ? .5 : Math.max(0, Math.min(1, -rect.top / travel));
      section.style.setProperty('--glass-scroll', p.toFixed(4));

      var cards = section.querySelectorAll('.glass-card-3d');
      var c1 = cards[0], c2 = cards[1], c3 = cards[2];
      if(c1){
        c1.style.setProperty('--g1x',(-42 + p*88).toFixed(1)+'px');
        c1.style.setProperty('--g1y',(48 - p*92).toFixed(1)+'px');
        c1.style.setProperty('--g1z',(55 + Math.sin(p*Math.PI)*145).toFixed(1)+'px');
        c1.style.setProperty('--g1rx',(12-p*24).toFixed(1)+'deg');
        c1.style.setProperty('--g1ry',(-18+p*32).toFixed(1)+'deg');
      }
      if(c2){
        c2.style.setProperty('--g2x',(55 - p*108).toFixed(1)+'px');
        c2.style.setProperty('--g2y',(-30 + p*72).toFixed(1)+'px');
        c2.style.setProperty('--g2z',(85 + Math.sin((p+.22)*Math.PI)*125).toFixed(1)+'px');
        c2.style.setProperty('--g2rx',(-10+p*20).toFixed(1)+'deg');
        c2.style.setProperty('--g2ry',(22-p*38).toFixed(1)+'deg');
      }
      if(c3){
        c3.style.setProperty('--g3x',(-12 + p*76).toFixed(1)+'px');
        c3.style.setProperty('--g3y',(40 - p*76).toFixed(1)+'px');
        c3.style.setProperty('--g3z',(105 + Math.sin((p+.5)*Math.PI)*105).toFixed(1)+'px');
        c3.style.setProperty('--g3rx',(8-p*17).toFixed(1)+'deg');
        c3.style.setProperty('--g3ry',(-8+p*24).toFixed(1)+'deg');
      }
      raf = null;
    }
    function requestGlassScroll(){ if(!raf) raf = requestAnimationFrame(updateGlassScroll); }
    updateGlassScroll();
    window.addEventListener('scroll', requestGlassScroll, {passive:true});
    window.addEventListener('resize', requestGlassScroll, {passive:true});

    if(!reduced && fine){
      var tx = window.innerWidth/2, ty = window.innerHeight/2, lx = tx, ly = ty, lensRaf = null;
      function animateLens(){
        lx += (tx-lx)*.16; ly += (ty-ly)*.16;
        if(lens){ lens.style.left=lx+'px'; lens.style.top=ly+'px'; }
        lensRaf = requestAnimationFrame(animateLens);
      }
      document.addEventListener('pointermove', function(e){
        tx=e.clientX;ty=e.clientY;
        if(lens) lens.classList.add('visible');
      }, {passive:true});
      document.addEventListener('pointerleave', function(){ if(lens) lens.classList.remove('visible'); });
      if(lens) animateLens();

      world.addEventListener('pointermove', function(e){
        var r=world.getBoundingClientRect();
        var x=(e.clientX-r.left)/Math.max(1,r.width)-.5;
        var y=(e.clientY-r.top)/Math.max(1,r.height)-.5;
        root.style.setProperty('--glass-scene-ry',(x*13).toFixed(2)+'deg');
        root.style.setProperty('--glass-scene-rx',(-y*10).toFixed(2)+'deg');
      });
      world.addEventListener('pointerleave', function(){
        root.style.setProperty('--glass-scene-ry','0deg');
        root.style.setProperty('--glass-scene-rx','0deg');
      });

      glassSurfaces.forEach(function(surface){
        surface.addEventListener('pointermove', function(e){
          var r=surface.getBoundingClientRect();
          var x=((e.clientX-r.left)/Math.max(1,r.width)*100).toFixed(1)+'%';
          var y=((e.clientY-r.top)/Math.max(1,r.height)*100).toFixed(1)+'%';
          surface.style.setProperty('--hot-x',x);
          surface.style.setProperty('--hot-y',y);
        });
        surface.addEventListener('pointerenter', function(){ if(lens) lens.classList.add('focused'); });
        surface.addEventListener('pointerleave', function(){ if(lens) lens.classList.remove('focused'); });
      });

      document.addEventListener('pointerdown', function(e){
        if(!e.target.closest('a,button,.glass-card-3d,.faq-item,.resolution-picker')) return;
        var wave=document.createElement('span');
        wave.className='glass-shockwave';wave.style.left=e.clientX+'px';wave.style.top=e.clientY+'px';
        document.body.appendChild(wave);
        wave.addEventListener('animationend',function(){wave.remove()});
      });
    }
  })();


  /* ============ PREMIUM FOOTER RUNTIME ============ */
  (function(){
    var footer = document.getElementById('siteFooter');
    if(!footer) return;
    var card = document.getElementById('footerDownloadCard');
    var topBtn = document.getElementById('footerTopBtn');
    var year = document.getElementById('footerYear');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fine = window.matchMedia('(pointer:fine)').matches;

    if(year) year.textContent = new Date().getFullYear();
    if(topBtn){
      topBtn.addEventListener('click', function(){
        window.scrollTo({top:0,behavior:reduced?'auto':'smooth'});
      });
    }

    var reveals = footer.querySelectorAll('.footer-reveal');
    if(!('IntersectionObserver' in window) || reduced){
      reveals.forEach(function(el){el.classList.add('in-view')});
    }else{
      var observer = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },{threshold:.12});
      reveals.forEach(function(el,index){
        el.style.transitionDelay = Math.min(index*.09,.36)+'s';
        observer.observe(el);
      });
    }

    var footerRaf = null;
    function updateFooterProgress(){
      var r = footer.getBoundingClientRect();
      var p = Math.max(0,Math.min(1,(window.innerHeight-r.top)/(window.innerHeight+r.height)));
      footer.style.setProperty('--footer-word-progress',p.toFixed(4));
      footerRaf = null;
    }
    function requestFooterProgress(){if(!footerRaf) footerRaf=requestAnimationFrame(updateFooterProgress)}
    updateFooterProgress();
    window.addEventListener('scroll',requestFooterProgress,{passive:true});
    window.addEventListener('resize',requestFooterProgress,{passive:true});

    if(!reduced && fine){
      footer.addEventListener('pointermove',function(e){
        var r=footer.getBoundingClientRect();
        var px=(e.clientX-r.left)/Math.max(1,r.width);
        var py=(e.clientY-r.top)/Math.max(1,r.height);
        footer.style.setProperty('--footer-x',(px*100).toFixed(1)+'%');
        footer.style.setProperty('--footer-y',(py*100).toFixed(1)+'%');
      });
      if(card){
        card.addEventListener('pointermove',function(e){
          var r=card.getBoundingClientRect();
          var x=(e.clientX-r.left)/Math.max(1,r.width)-.5;
          var y=(e.clientY-r.top)/Math.max(1,r.height)-.5;
          card.style.setProperty('--footer-ry',(x*10).toFixed(2)+'deg');
          card.style.setProperty('--footer-rx',(-y*8).toFixed(2)+'deg');
          card.style.setProperty('--hot-x',((x+.5)*100).toFixed(1)+'%');
          card.style.setProperty('--hot-y',((y+.5)*100).toFixed(1)+'%');
        });
        card.addEventListener('pointerleave',function(){
          card.style.setProperty('--footer-ry','0deg');
          card.style.setProperty('--footer-rx','0deg');
        });
      }
    }
  })();