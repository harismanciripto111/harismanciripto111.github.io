/* Rising crimson embers around the centerpiece. Pauses off-Home / hidden tab. */
(() => {
  const cv = document.getElementById("embers");
  if (!cv || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ctx = cv.getContext("2d");
  let W = 0, H = 0, dpr = 1, parts = [];

  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  addEventListener("resize", resize); resize();

  const COLORS = ["255,40,50", "255,90,60", "255,160,120", "255,255,255", "200,10,25"];
  const spawn = (initial) => {
    const spread = Math.max(W * 0.28, 220);
    return {
      x: W / 2 + (Math.random() - 0.5) * spread * 2,
      y: initial ? Math.random() * H : H + 10,
      r: 0.6 + Math.random() * 1.6,
      vy: 0.5 + Math.random() * 1.8,
      sway: Math.random() * Math.PI * 2,
      sv: 0.01 + Math.random() * 0.03,
      amp: 0.3 + Math.random() * 1.1,
      c: COLORS[(Math.random() * COLORS.length) | 0],
      life: 0.4 + Math.random() * 0.6,
    };
  };
  const N = W < 700 ? 60 : 130;
  for (let i = 0; i < N; i++) parts.push(spawn(true));

  const frame = () => {
    requestAnimationFrame(frame);
    if (document.hidden || document.body.dataset.screen !== "home") return;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      p.y -= p.vy; p.sway += p.sv; p.x += Math.sin(p.sway) * p.amp;
      const fade = Math.max(0, Math.min(1, p.y / H)) * p.life;
      if (p.y < -10) { parts[i] = spawn(false); continue; }
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      g.addColorStop(0, `rgba(${p.c},${fade})`);
      g.addColorStop(1, `rgba(${p.c},0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 6.2832); ctx.fill();
    }
  };
  frame();
})();
