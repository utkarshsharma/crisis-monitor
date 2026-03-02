"use client";

import { useEffect, useRef } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

interface FlyingObject {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  type: "jet" | "missile";
  scale: number;
  trail: { x: number; y: number; age: number }[];
  willCrash: boolean;
  crashCountdown: number;
  alive: boolean;
}

interface Explosion {
  x: number;
  y: number;
  age: number;
  maxAge: number;
  size: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

function getZone(w: number, h: number) {
  return {
    cx: w / 2,
    cy: h / 2,
    radius: Math.min(w, h) * 0.4,
  };
}

function spawnObject(w: number, h: number): FlyingObject {
  const type = Math.random() < 0.55 ? "jet" : "missile";
  const zone = getZone(w, h);

  const spawnAngle = rand(0, Math.PI * 2);
  const x = zone.cx + Math.cos(spawnAngle) * (zone.radius + 20);
  const y = zone.cy + Math.sin(spawnAngle) * (zone.radius + 20);

  const targetX = zone.cx + rand(-zone.radius * 0.5, zone.radius * 0.5);
  const targetY = zone.cy + rand(-zone.radius * 0.5, zone.radius * 0.5);
  const angle = Math.atan2(targetY - y, targetX - x);

  const speed = type === "jet" ? rand(1.5, 2.5) : rand(0.8, 1.6);

  return {
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    angle,
    type,
    scale: type === "jet" ? rand(0.9, 1.3) : rand(0.7, 1.1),
    trail: [],
    willCrash: Math.random() < 0.60,
    crashCountdown: rand(80, 250),
    alive: true,
  };
}

function createExplosion(x: number, y: number): Explosion {
  return {
    x, y,
    age: 0,
    maxAge: 180,
    size: rand(0.5, 0.9),
  };
}

// ── Drawing: Jets & Missiles ─────────────────────────────────────────────────

function drawJet(ctx: CanvasRenderingContext2D, obj: FlyingObject) {
  ctx.save();
  ctx.translate(obj.x, obj.y);
  ctx.rotate(obj.angle + Math.PI / 2);
  const s = obj.scale * 12;

  ctx.fillStyle = "rgba(255, 140, 0, 0.3)";
  ctx.beginPath();
  ctx.ellipse(0, s * 1.1, s * 0.15, s * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#4a5568";
  ctx.strokeStyle = "#2d3748";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, -s * 1.3);
  ctx.lineTo(s * 0.12, -s * 0.7);
  ctx.lineTo(s * 0.15, s * 0.6);
  ctx.lineTo(0, s * 0.9);
  ctx.lineTo(-s * 0.15, s * 0.6);
  ctx.lineTo(-s * 0.12, -s * 0.7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#3d4a5c";
  ctx.beginPath();
  ctx.moveTo(s * 0.12, -s * 0.15);
  ctx.lineTo(s * 0.85, s * 0.35);
  ctx.lineTo(s * 0.75, s * 0.45);
  ctx.lineTo(s * 0.14, s * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-s * 0.12, -s * 0.15);
  ctx.lineTo(-s * 0.85, s * 0.35);
  ctx.lineTo(-s * 0.75, s * 0.45);
  ctx.lineTo(-s * 0.14, s * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#374151";
  ctx.beginPath();
  ctx.moveTo(s * 0.1, s * 0.5);
  ctx.lineTo(s * 0.35, s * 0.85);
  ctx.lineTo(s * 0.25, s * 0.9);
  ctx.lineTo(s * 0.1, s * 0.7);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-s * 0.1, s * 0.5);
  ctx.lineTo(-s * 0.35, s * 0.85);
  ctx.lineTo(-s * 0.25, s * 0.9);
  ctx.lineTo(-s * 0.1, s * 0.7);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(100, 200, 255, 0.4)";
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.6, s * 0.07, s * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
  ctx.beginPath();
  ctx.arc(-s * 0.8, s * 0.38, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(0, 255, 0, 0.8)";
  ctx.beginPath();
  ctx.arc(s * 0.8, s * 0.38, 1, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawMissile(ctx: CanvasRenderingContext2D, obj: FlyingObject) {
  ctx.save();
  ctx.translate(obj.x, obj.y);
  ctx.rotate(obj.angle + Math.PI / 2);
  const s = obj.scale * 10;

  const flameLen = rand(s * 0.8, s * 1.4);
  const grad = ctx.createLinearGradient(0, s * 0.9, 0, s * 0.9 + flameLen);
  grad.addColorStop(0, "rgba(255, 255, 200, 0.7)");
  grad.addColorStop(0.3, "rgba(255, 160, 0, 0.5)");
  grad.addColorStop(0.7, "rgba(255, 60, 0, 0.3)");
  grad.addColorStop(1, "rgba(255, 30, 0, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-s * 0.08, s * 0.9);
  ctx.lineTo(0, s * 0.9 + flameLen);
  ctx.lineTo(s * 0.08, s * 0.9);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#6b7280";
  ctx.strokeStyle = "#4b5563";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, -s * 1.2);
  ctx.quadraticCurveTo(s * 0.1, -s * 0.8, s * 0.1, -s * 0.3);
  ctx.lineTo(s * 0.1, s * 0.8);
  ctx.lineTo(-s * 0.1, s * 0.8);
  ctx.lineTo(-s * 0.1, -s * 0.3);
  ctx.quadraticCurveTo(-s * 0.1, -s * 0.8, 0, -s * 1.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#374151";
  ctx.beginPath();
  ctx.moveTo(0, -s * 1.2);
  ctx.quadraticCurveTo(s * 0.08, -s * 0.9, s * 0.1, -s * 0.6);
  ctx.lineTo(-s * 0.1, -s * 0.6);
  ctx.quadraticCurveTo(-s * 0.08, -s * 0.9, 0, -s * 1.2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#4b5563";
  ctx.beginPath();
  ctx.moveTo(s * 0.1, s * 0.5);
  ctx.lineTo(s * 0.3, s * 0.9);
  ctx.lineTo(s * 0.1, s * 0.85);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-s * 0.1, s * 0.5);
  ctx.lineTo(-s * 0.3, s * 0.9);
  ctx.lineTo(-s * 0.1, s * 0.85);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(200, 50, 50, 0.6)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-s * 0.1, -s * 0.1);
  ctx.lineTo(s * 0.1, -s * 0.1);
  ctx.stroke();

  ctx.restore();
}

function drawTrail(ctx: CanvasRenderingContext2D, obj: FlyingObject) {
  if (obj.trail.length < 2) return;
  for (let i = 1; i < obj.trail.length; i++) {
    const t = obj.trail[i];
    const alpha = (1 - t.age / 60) * 0.4;
    if (alpha <= 0) continue;
    ctx.globalAlpha = alpha;
    if (obj.type === "missile") {
      const size = rand(1.5, 3.5) * (1 + t.age * 0.03);
      ctx.fillStyle = `rgba(120, 120, 120, ${alpha})`;
      ctx.beginPath();
      ctx.arc(t.x + rand(-1, 1), t.y + rand(-1, 1), size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const size = 0.8 * (1 + t.age * 0.02);
      ctx.fillStyle = `rgba(180, 200, 220, ${alpha * 0.6})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

// ── Drawing: Explosion ──────────────────────────────────────────────────────

function drawExplosion(ctx: CanvasRenderingContext2D, exp: Explosion) {
  const p = exp.age / exp.maxAge;
  const s = exp.size;
  const x = exp.x;
  const y = exp.y;

  ctx.save();

  if (p < 0.08) {
    const t = p / 0.08;
    const alpha = (1 - t) * 1.0;
    const r = (10 + t * 150) * s;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255,255,255,${alpha})`);
    g.addColorStop(0.3, `rgba(255,255,220,${alpha * 0.8})`);
    g.addColorStop(0.6, `rgba(255,200,100,${alpha * 0.4})`);
    g.addColorStop(1, `rgba(255,150,50,0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  if (p > 0.03 && p < 0.25) {
    const t = (p - 0.03) / 0.22;
    const ringR = (30 + t * 180) * s;
    const alpha = (1 - t) * 0.7;
    ctx.strokeStyle = `rgba(255, 220, 180, ${alpha})`;
    ctx.lineWidth = (3 - t * 2.5) * s;
    ctx.beginPath();
    ctx.arc(x, y, ringR, 0, Math.PI * 2);
    ctx.stroke();

    if (t < 0.6) {
      const innerR = ringR * 0.6;
      ctx.strokeStyle = `rgba(255, 180, 100, ${alpha * 0.4})`;
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.arc(x, y, innerR, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  if (p > 0.02 && p < 0.40) {
    const t = (p - 0.02) / 0.38;
    const alpha = t < 0.3 ? 1.0 : (1 - (t - 0.3) / 0.7) * 0.9;
    const r = (15 + t * 50) * s;

    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255,240,200,${alpha * 0.9})`);
    g.addColorStop(0.25, `rgba(255,160,30,${alpha * 0.85})`);
    g.addColorStop(0.5, `rgba(230,80,0,${alpha * 0.7})`);
    g.addColorStop(0.75, `rgba(180,30,0,${alpha * 0.4})`);
    g.addColorStop(1, `rgba(80,10,0,0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  if (p > 0.10 && p < 0.75) {
    const t = (p - 0.10) / 0.65;
    const stemH = (20 + t * 90) * s;
    const stemW = (8 + t * 4) * s;
    const alpha = t < 0.5 ? 0.8 : (1 - (t - 0.5) / 0.5) * 0.8;

    const stemGrad = ctx.createLinearGradient(x, y, x, y - stemH);
    stemGrad.addColorStop(0, `rgba(60,40,20,${alpha * 0.7})`);
    stemGrad.addColorStop(0.3, `rgba(80,50,25,${alpha * 0.6})`);
    stemGrad.addColorStop(0.6, `rgba(120,70,30,${alpha * 0.4})`);
    stemGrad.addColorStop(1, `rgba(100,60,30,${alpha * 0.2})`);
    ctx.fillStyle = stemGrad;

    const topW = stemW * 0.7;
    ctx.beginPath();
    ctx.moveTo(x - stemW, y);
    ctx.lineTo(x - topW, y - stemH);
    ctx.lineTo(x + topW, y - stemH);
    ctx.lineTo(x + stemW, y);
    ctx.closePath();
    ctx.fill();

    if (t < 0.4) {
      const glowAlpha = (1 - t / 0.4) * 0.3;
      const glowGrad = ctx.createLinearGradient(x, y, x, y - stemH * 0.6);
      glowGrad.addColorStop(0, `rgba(255,120,20,${glowAlpha})`);
      glowGrad.addColorStop(1, `rgba(255,80,0,0)`);
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.moveTo(x - stemW * 0.5, y);
      ctx.lineTo(x - topW * 0.3, y - stemH * 0.6);
      ctx.lineTo(x + topW * 0.3, y - stemH * 0.6);
      ctx.lineTo(x + stemW * 0.5, y);
      ctx.closePath();
      ctx.fill();
    }
  }

  if (p > 0.15 && p < 0.85) {
    const t = (p - 0.15) / 0.70;
    const stemH = (20 + Math.min(t * 1.5, 1) * 90) * s;
    const capY = y - stemH;
    const capR = (12 + t * 45) * s;
    const alpha = t < 0.4 ? 0.85 : (1 - (t - 0.4) / 0.6) * 0.85;

    const capGrad = ctx.createRadialGradient(x, capY, capR * 0.15, x, capY, capR);
    capGrad.addColorStop(0, `rgba(90,60,35,${alpha * 0.8})`);
    capGrad.addColorStop(0.3, `rgba(70,45,25,${alpha * 0.7})`);
    capGrad.addColorStop(0.6, `rgba(50,35,20,${alpha * 0.5})`);
    capGrad.addColorStop(1, `rgba(35,25,15,0)`);
    ctx.fillStyle = capGrad;
    ctx.beginPath();
    ctx.arc(x, capY, capR, 0, Math.PI * 2);
    ctx.fill();

    if (t < 0.5) {
      const fireAlpha = (1 - t / 0.5) * 0.5;
      const fireR = capR * 0.5;
      const fireGrad = ctx.createRadialGradient(x, capY, 0, x, capY, fireR);
      fireGrad.addColorStop(0, `rgba(255,180,50,${fireAlpha})`);
      fireGrad.addColorStop(0.5, `rgba(255,100,20,${fireAlpha * 0.5})`);
      fireGrad.addColorStop(1, `rgba(200,50,0,0)`);
      ctx.fillStyle = fireGrad;
      ctx.beginPath();
      ctx.arc(x, capY, fireR, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < 5; i++) {
      const bAngle = (i / 5) * Math.PI * 2 + t * 0.5;
      const bx = x + Math.cos(bAngle) * capR * 0.7;
      const by = capY + Math.sin(bAngle) * capR * 0.5;
      const br = capR * rand(0.25, 0.4);
      ctx.fillStyle = `rgba(65,45,30,${alpha * 0.4})`;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (p > 0.05 && p < 0.60) {
    const t = (p - 0.05) / 0.55;
    const alpha = (1 - t) * 0.35;
    const r = (20 + t * 60) * s;
    const g = ctx.createRadialGradient(x, y + 5, 0, x, y + 5, r);
    g.addColorStop(0, `rgba(40,20,5,${alpha})`);
    g.addColorStop(0.5, `rgba(30,15,5,${alpha * 0.5})`);
    g.addColorStop(1, `rgba(20,10,5,0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y + 5, r, r * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function WarOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    objects: FlyingObject[];
    explosions: Explosion[];
    frameId: number;
  }>({ objects: [], explosions: [], frameId: 0 });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Find the conflict map panel and track its bounds
    function getMapBounds() {
      const panel = document.querySelector(".conflict-map-panel");
      if (!panel) return null;
      return panel.getBoundingClientRect();
    }

    function resize() {
      const bounds = getMapBounds();
      if (!bounds || !canvas || !container) return;
      canvas.width = bounds.width;
      canvas.height = bounds.height;
      container.style.left = `${bounds.left}px`;
      container.style.top = `${bounds.top}px`;
      container.style.width = `${bounds.width}px`;
      container.style.height = `${bounds.height}px`;
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", resize);

    const state = stateRef.current;

    // Initial spawn — fewer objects
    for (let i = 0; i < 2; i++) {
      state.objects.push(spawnObject(canvas.width, canvas.height));
    }

    let spawnTimer = 0;

    function tick() {
      if (!canvas || !ctx) return;
      const w = canvas.width;
      const h = canvas.height;

      // Re-sync position on each frame (handles scroll)
      const bounds = getMapBounds();
      if (bounds && container) {
        container.style.left = `${bounds.left}px`;
        container.style.top = `${bounds.top}px`;
        if (Math.abs(canvas.width - bounds.width) > 1 || Math.abs(canvas.height - bounds.height) > 1) {
          canvas.width = bounds.width;
          canvas.height = bounds.height;
          container.style.width = `${bounds.width}px`;
          container.style.height = `${bounds.height}px`;
        }
      }

      const zone = getZone(w, h);

      ctx.clearRect(0, 0, w, h);

      // Spawn new objects — much less frequently (every 200-500 frames)
      spawnTimer++;
      if (spawnTimer > rand(200, 500) && state.objects.length < 4) {
        state.objects.push(spawnObject(w, h));
        spawnTimer = 0;
      }

      // Update & draw objects
      for (let i = state.objects.length - 1; i >= 0; i--) {
        const obj = state.objects[i];

        obj.x += obj.vx;
        obj.y += obj.vy;

        if (obj.type === "jet") {
          const drift = rand(-0.004, 0.004);
          obj.angle += drift;
          const speed = Math.sqrt(obj.vx ** 2 + obj.vy ** 2);
          obj.vx = Math.cos(obj.angle) * speed;
          obj.vy = Math.sin(obj.angle) * speed;
        }

        if (Math.random() < (obj.type === "missile" ? 0.8 : 0.5)) {
          obj.trail.push({ x: obj.x, y: obj.y, age: 0 });
        }
        for (let t = obj.trail.length - 1; t >= 0; t--) {
          obj.trail[t].age++;
          if (obj.trail[t].age > 60) obj.trail.splice(t, 1);
        }

        if (obj.willCrash && obj.alive) {
          const dx = obj.x - zone.cx;
          const dy = obj.y - zone.cy;
          const inZone = Math.sqrt(dx * dx + dy * dy) < zone.radius;

          if (inZone) {
            obj.crashCountdown--;
            if (obj.crashCountdown <= 0) {
              obj.alive = false;
              state.explosions.push(createExplosion(obj.x, obj.y));
            }
          }
        }

        const dx = obj.x - zone.cx;
        const dy = obj.y - zone.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > zone.radius * 2.5) {
          state.objects.splice(i, 1);
          continue;
        }

        if (!obj.alive) {
          if (obj.trail.length === 0) state.objects.splice(i, 1);
          continue;
        }

        drawTrail(ctx, obj);
        if (obj.type === "jet") drawJet(ctx, obj);
        else drawMissile(ctx, obj);
      }

      for (let i = state.explosions.length - 1; i >= 0; i--) {
        const exp = state.explosions[i];
        exp.age++;
        if (exp.age > exp.maxAge) {
          state.explosions.splice(i, 1);
          continue;
        }
        drawExplosion(ctx, exp);
      }

      state.frameId = requestAnimationFrame(tick);
    }

    state.frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(state.frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", resize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        pointerEvents: "none",
        zIndex: 10,
        overflow: "hidden",
        borderRadius: 8,
      }}
    >
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
}
