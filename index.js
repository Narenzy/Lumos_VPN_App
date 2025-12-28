const OFFER_URL = "{offer}";

const answers = { wifi: null, bank: null, travel: null };

function setCTAUrls(){
  const ctaMain = document.getElementById("ctaMain");
  const ctaQuiz = document.getElementById("ctaQuiz");
  if (ctaMain) ctaMain.href = OFFER_URL;
  if (ctaQuiz) ctaQuiz.href = OFFER_URL;
}

function enableCTAEffects(){
  const cta = document.getElementById("ctaMain");
  if (!cta) return;
  cta.classList.add("pulse");
  cta.addEventListener("click", (e) => {
    const rect = cta.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = Math.max(rect.width, rect.height) + "px";
    ripple.style.left = (e.clientX - rect.left - rect.width/2) + "px";
    ripple.style.top = (e.clientY - rect.top - rect.height/2) + "px";
    cta.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  });
}

function initQuiz(){
  const steps = Array.from(document.querySelectorAll(".quiz-step"));
  const bar = document.getElementById("quizBar");
  const resultBox = document.getElementById("quizResult");
  const qrTitle = document.getElementById("qrTitle");
  const qrText = document.getElementById("qrText");

  function setActive(stepIndex){
    steps.forEach((s, i) => {
      s.classList.toggle("active", i === stepIndex);
    });
  }

  function updateProgress(){
    const total = steps.length;
    const done = Object.values(answers).filter(v => v !== null).length;
    const pct = Math.round((done / total) * 100);
    if (bar) bar.style.width = `${pct}%`;
  }

  function buildRecommendation(){
    let score = 0;
    if (answers.wifi === "yes") score++;
    if (answers.bank === "yes") score++;
    if (answers.travel === "yes") score++;
    if (score >= 2){
      return {
        title: "Empfehlung: VPN sinnvoll",
        text: "Du nutzt Situationen, in denen ein VPN hilft (öffentliche Netzwerke, sensible Daten). Starte den One-Tap-Schutz." 
      };
    }
    return {
      title: "Empfehlung: Optional",
      text: "VPN bleibt praktisch für mehr Privatsphäre – besonders unterwegs oder bei WLAN in Cafés/Hotels." 
    };
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".qs-btn");
    if (!btn) return;
    const q = btn.dataset.q;
    const a = btn.dataset.a;
    if (!q || !a) return;
    answers[q] = a;
    const idx = steps.findIndex(s => s.contains(btn));
    if (idx >= 0 && idx + 1 < steps.length) setActive(idx + 1);
    updateProgress();
    const done = Object.values(answers).every(v => v !== null);
    if (done){
      const rec = buildRecommendation();
      if (qrTitle) qrTitle.textContent = rec.title;
      if (qrText) qrText.textContent = rec.text;
      if (resultBox) resultBox.hidden = false;
    }
  });

  setActive(0);
  updateProgress();
}

function initParticles(reduceMotion){
  if (reduceMotion) return;
  const canvas = document.getElementById("bgParticles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;
  const particles = [];
  const count = Math.min(40, Math.floor(w / 40));

  for (let i=0;i<count;i++){
    particles.push({
      x: Math.random()*w,
      y: Math.random()*h,
      vx: (Math.random()-0.5)*0.2,
      vy: (Math.random()-0.5)*0.2,
      r: Math.random()*1.6 + 0.6
    });
  }

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);

  function draw(){
    ctx.clearRect(0,0,w,h);
    for (let i=0;i<particles.length;i++){
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x<0||p.x>w) p.vx*=-1;
      if (p.y<0||p.y>h) p.vy*=-1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fill();
      for (let j=i+1;j<particles.length;j++){
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120){
          ctx.strokeStyle = `rgba(180,200,255,${1 - dist/120})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

function initFloatingWords(reduceMotion){
  const container = document.querySelector(".floating-words");
  if (!container) return;
  const words = ["Online-Sicherheit","Datenschutz","Stabile Verbindung","Schnell","Privatsphäre","VPN"];
  const wordEls = words.map((word) => {
    const el = document.createElement("span");
    el.className = "float-word";
    el.textContent = word;
    container.appendChild(el);
    return el;
  });

  const positions = wordEls.map(() => ({
    x: Math.random()*100,
    y: Math.random()*100,
    speedX: (Math.random()-0.5)*0.02,
    speedY: (Math.random()-0.5)*0.02,
    opacity: Math.random()*0.4 + 0.4
  }));

  const state = { px:0.5, py:0.5 };

  function tick(){
    wordEls.forEach((el, i) => {
      const p = positions[i];
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.x < -5) p.x = 105;
      if (p.x > 105) p.x = -5;
      if (p.y < -5) p.y = 105;
      if (p.y > 105) p.y = -5;
      const parallaxX = (state.px - 0.5) * 8;
      const parallaxY = (state.py - 0.5) * 8;
      el.style.transform = `translate(${p.x + parallaxX}vw, ${p.y + parallaxY}vh)`;
      el.style.opacity = p.opacity;
    });
    if (reduceMotion) return;
    requestAnimationFrame(tick);
  }

  window.addEventListener("mousemove", (e) => {
    state.px = e.clientX / window.innerWidth;
    state.py = e.clientY / window.innerHeight;
  }, { passive:true });
  tick();
}

function initHeroMotion(reduceMotion){
  const cards = Array.from(document.querySelectorAll(".device-card"));
  if (!cards.length || reduceMotion) return;

  window.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth) - 0.5;
    const y = (e.clientY / window.innerHeight) - 0.5;
    cards.forEach((card, idx) => {
      const depth = idx === 0 ? 1 : 0.8;
      card.style.setProperty("--tiltY", `${x*1.8*depth}deg`);
      card.style.setProperty("--tiltX", `${-y*1.4*depth}deg`);
      const img = card.querySelector(".device-img");
      if (img) img.style.transform = `translateZ(0) scale(${1 + 0.0025*depth})`;
    });
  }, { passive:true });

  window.addEventListener("scroll", () => {
    const sy = window.scrollY;
    const offset = Math.min(5, sy * 0.01);
    cards.forEach((card, idx) => {
      const depth = idx === 0 ? 1 : 0.8;
      card.style.marginTop = `${offset * depth}px`;
    });
  }, { passive:true });
}

function applyReducedMotionClass(reduceMotion){
  if (reduceMotion) document.body.classList.add("no-motion");
}

function initParallaxBackground(reduceMotion){
  if (reduceMotion) return;
  const aurora = document.querySelector(".bg-aurora");
  const stars = document.querySelector(".bg-stars");
  const rays = document.querySelector(".bg-rays");
  const mesh = document.querySelector(".bg-mesh");
  const applyParallax = (xNorm, yNorm) => {
    const x = (xNorm - 0.5);
    const y = (yNorm - 0.5);
    if (aurora) aurora.style.transform = `translate3d(${x * 14}px, ${y * 12}px, 0) scale(1.02)`;
    if (stars) stars.style.transform = `translate3d(${x * 10}px, ${y * 8}px, 0)`;
    if (rays) rays.style.transform = `translate3d(${x * 16}px, ${y * 12}px, 0)`;
    if (mesh) mesh.style.transform = `translate3d(${x * 12}px, ${y * 10}px, 0)`;
  };
  window.addEventListener("mousemove", (e) => {
    applyParallax(e.clientX / window.innerWidth, e.clientY / window.innerHeight);
  }, { passive:true });
  window.addEventListener("mouseleave", () => applyParallax(0.5, 0.5), { passive:true });

  const startTilt = async () => {
    try {
      if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
        const res = await DeviceOrientationEvent.requestPermission();
        if (res !== "granted") return;
      }
      window.addEventListener("deviceorientation", (ev) => {
        const xNorm = Math.max(-45, Math.min(45, ev.gamma || 0)) / 90 + 0.5;
        const yNorm = Math.max(-45, Math.min(45, ev.beta || 0)) / 90 + 0.5;
        applyParallax(xNorm, yNorm);
      }, { passive:true });
    } catch(err){ /* ignore */ }
  };
  startTilt();
}

function init(){
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  applyReducedMotionClass(reduceMotion);
  setCTAUrls();
  enableCTAEffects();
  initQuiz();
  initParticles(reduceMotion);
  initFloatingWords(reduceMotion);
  initHeroMotion(reduceMotion);
  initParallaxBackground(reduceMotion);
}

document.addEventListener("DOMContentLoaded", init);

