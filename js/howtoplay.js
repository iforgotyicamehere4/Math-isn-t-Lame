// Canvas fire particle simulation + dynamic chair placement + back button behavior
if (window.__HowToPlayCleanup) window.__HowToPlayCleanup();
window.__HowToPlayCleanup = null;

(function () {
  // --- Chairs: dynamically place N chairs evenly around center ---
  function createChairElement() {
    const el = document.createElement('div');
    el.className = 'chair';
    el.innerHTML = `
      <div class="back"></div>
      <div class="seat"></div>
      <div class="leg-left"></div>
      <div class="leg-right"></div>
      <div class="desk"></div>
    `;
    return el;
  }

  function placeChairs(count = 12) {
    const ring = document.getElementById('chairRing');
    if (!ring) return;
    // Clear any existing
    ring.innerHTML = '';
    const rect = document.body.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = (rect.height / 2) + 40; // slightly lower visually
    const radius = Math.min(rect.width, rect.height) * 0.28;

    for (let i = 0; i < count; i++) {
      const chair = createChairElement();
      // compute angle and position
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      // position element with transform that also keeps it upright
      const deg = (angle * 180 / Math.PI);
      chair.style.left = (x - 42) + 'px'; // 42 is half chair width (84/2)
      chair.style.top = (y - 42) + 'px';
      // rotate desk and whole chair to face center a bit (rotate toward center then counter-rotate so chair appears upright)
      chair.style.transform = `rotate(${deg + 90}deg) translateY(0px)`;
      // counter-rotate inner parts so visual remains stable
      chair.querySelector('.back').style.transform = `rotate(${-(deg + 90)}deg)`;
      ring.appendChild(chair);
    }
  }

  // place chairs initially and reposition on resize
  function recomputeChairs() {
    placeChairs(12);
  }
  const resizeHandler = () => recomputeChairs();
  window.addEventListener('resize', resizeHandler);
  recomputeChairs();

  // --- Back link behavior like your other pages ---
  (function () {
    const back = document.getElementById('backLink');
    if (!back) return;
    back.addEventListener('click', function (e) {
      e.preventDefault();
      try {
        if (history.length > 1) history.back();
        else window.location.href = 'index.html';
      } catch (err) {
        window.location.href = 'index.html';
      }
    });
  })();

  // --- Canvas fire simulation ---
  const canvas = document.getElementById('fireCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  function fitCanvasToDisplaySize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(300, Math.floor(rect.width));
    const h = Math.max(200, Math.floor(rect.height));
    if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  // Particle system
  class Flame {
    constructor(x, y) {
      this.reset(x, y);
    }
    reset(x, y) {
      this.x = x + (Math.random() * 40 - 20);
      this.y = y + (Math.random() * 18 - 8);
      this.vx = (Math.random() * 0.6 - 0.3);
      this.vy = -(Math.random() * 1.8 + 1.2);
      this.life = Math.random() * 1.4 + 0.6;
      this.age = 0;
      this.size = Math.random() * 22 + 6;
      this.h = Math.random() * 40 + 20; // hue bias for color variation
    }
    update(dt) {
      this.age += dt;
      this.x += this.vx * dt * 60;
      this.y += this.vy * dt * 60 - (0.02 * dt * 60);
      this.vx *= 0.995;
      this.vy *= 0.995;
    }
    draw(ctx) {
      const t = this.age / this.life;
      if (t > 1) return;
      // size fades and rises
      const radius = this.size * (1 + t * 0.8);
      const alpha = Math.max(0, 1 - t * 1.2);
      // gradient: yellow -> orange -> transparent
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, radius);
      // center bright
      g.addColorStop(0, `rgba(${255},${200 - this.h * 0.2},${40},${alpha})`);
      g.addColorStop(0.35, `rgba(${255},${120 - this.h * 0.25},${30},${alpha * 0.9})`);
      g.addColorStop(0.6, `rgba(${200 - this.h * 0.6},${40},${10},${alpha * 0.6})`);
      g.addColorStop(1, `rgba(40,12,8,0)`);
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }
    isDead() { return this.age >= this.life; }
  }

  let particles = [];
  let last = performance.now();

  function spawnFlames(count, areaX, areaY) {
    for (let i = 0; i < count; i++) {
      const p = new Flame(
        areaX + (Math.random() * 40 - 20),
        areaY + (Math.random() * 20 - 8)
      );
      particles.push(p);
    }
  }

  function drawBaseGlow(ctx, cx, cy) {
    // soft warm glow under the fire (like embers)
    const glow = ctx.createRadialGradient(cx, cy + 40, 10, cx, cy + 40, 220);
    glow.addColorStop(0, 'rgba(255,160,60,0.35)');
    glow.addColorStop(0.4, 'rgba(255,90,30,0.16)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 40, 220, 110, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  function loop(now) {
    fitCanvasToDisplaySize();
    const dt = Math.min(0.06, (now - last) / 1000);
    last = now;

    // clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // compute center
    const cw = canvas.width / (window.devicePixelRatio || 1);
    const ch = canvas.height / (window.devicePixelRatio || 1);
    const cx = cw / 2;
    const cy = ch / 2 + 18;

    // base glow and embers
    drawBaseGlow(ctx, cx, cy);

    // spawn more particles; spawn rate scales with canvas size
    const spawnCount = Math.round(6 + (Math.min(cw, ch) / 120));
    spawnFlames(spawnCount, cx, cy + 30);

    // update & draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update(dt);
      p.draw(ctx);
      if (p.isDead()) {
        particles.splice(i, 1);
      }
    }

    // add subtle rising smoke using globalAlpha and composite
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = 'rgba(40,40,50,0.6)';
    ctx.beginPath();
    ctx.ellipse(cx - 30, cy - 60, 80, 30, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    requestAnimationFrame(loop);
  }

  // Start animation
  requestAnimationFrame(loop);

  // Reposition chairs after fonts/layout settle
  setTimeout(recomputeChairs, 300);

  window.__HowToPlayCleanup = () => {
    window.removeEventListener('resize', resizeHandler);
    running = false;
  };
})();
(function(){
  const toggle = document.getElementById('contrast-toggle');
  if(!toggle) return;
  const apply = (on)=>{
    document.body.classList.toggle('high-contrast', on);
    toggle.setAttribute('aria-pressed', String(!!on));
  };
}());
