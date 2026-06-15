import { useEffect, useMemo, useRef, useState } from 'react';
import './reference-video.css';

type Particle = {
  x: number;
  y: number;
  z: number;
  size: number;
  alpha: number;
  color: string;
  seed: number;
  layer: number;
};

type Projected = {
  x: number;
  y: number;
  scale: number;
  depth: number;
};

const TAU = Math.PI * 2;
const palette = ['110,255,220', '255,120,210', '180,210,255', '245,255,255', '120,245,255'];

function rand(seed: number) {
  let t = seed + 0x6D2B79F5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getParticleBudget() {
  if (typeof window === 'undefined') return 7000;
  const cores = navigator.hardwareConcurrency || 4;
  const area = window.innerWidth * window.innerHeight;
  if (cores <= 4 || area > 2_400_000) return 5200;
  if (area > 1_700_000) return 7600;
  return 9200;
}

function buildParticles(count: number): Particle[] {
  const r = rand(20260615);
  const particles: Particle[] = [];

  for (let i = 0; i < count; i += 1) {
    const u = r();
    const arm = Math.floor(r() * 5);
    const armAngle = (arm / 5) * TAU;
    const radiusBias = u < 0.2 ? Math.pow(r(), 2.3) : u < 0.78 ? Math.pow(r(), 0.72) : 0.68 + Math.pow(r(), 1.8) * 0.42;
    const spiral = radiusBias * 4.1 + Math.sin(radiusBias * 6.6 + arm) * 0.2;
    const angle = armAngle + spiral + (r() - 0.5) * (0.36 + radiusBias * 0.5);
    const bandNoise = (r() - 0.5) * (u < 0.2 ? 7 : 18 + radiusBias * 18);
    const ringNoise = (r() - 0.5) * (u < 0.2 ? 5 : 12 + radiusBias * 16);

    const long = 165 * radiusBias;
    const short = 75 * radiusBias;
    const x = Math.cos(angle) * long + bandNoise;
    const z = Math.sin(angle) * short + ringNoise;
    const y = (r() - 0.5) * (8 + radiusBias * 28) + Math.sin(angle * 2.0) * 4;
    const colorIndex = u < 0.19 ? 3 : (arm + (radiusBias > 0.52 ? 1 : 0)) % palette.length;
    const coreBoost = Math.max(0, 1 - radiusBias);

    particles.push({
      x,
      y,
      z,
      size: 0.55 + r() * 1.05 + coreBoost * 0.9,
      alpha: 0.18 + r() * 0.34 + coreBoost * 0.32,
      color: palette[colorIndex],
      seed: r() * 1000,
      layer: radiusBias
    });
  }

  const backgroundCount = Math.floor(count * 0.12);
  for (let i = 0; i < backgroundCount; i += 1) {
    const angle = r() * TAU;
    const radius = 210 + r() * 250;
    particles.push({
      x: Math.cos(angle) * radius,
      y: (r() - 0.5) * 170,
      z: Math.sin(angle) * radius * 0.62 - 120 - r() * 160,
      size: 0.42 + r() * 0.8,
      alpha: 0.08 + r() * 0.16,
      color: palette[Math.floor(r() * palette.length)],
      seed: r() * 1000,
      layer: 1.5
    });
  }

  return particles;
}

function project(p: Particle, width: number, height: number, yaw: number, pitch: number, zoom: number): Projected | null {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);

  const x1 = p.x * cy - p.z * sy;
  const z1 = p.x * sy + p.z * cy;
  const y1 = p.y * cp - z1 * sp;
  const z2 = p.y * sp + z1 * cp + 320 + zoom;
  if (z2 < 26) return null;

  const fov = Math.min(width, height) * 0.9;
  const scale = fov / z2;
  return {
    x: width * 0.5 + x1 * scale,
    y: height * 0.52 + y1 * scale,
    scale,
    depth: z2
  };
}

function makeSprites() {
  if (typeof document === 'undefined') return new Map<string, HTMLCanvasElement>();
  const sprites = new Map<string, HTMLCanvasElement>();

  for (const color of palette) {
    const canvas = document.createElement('canvas');
    canvas.width = 22;
    canvas.height = 22;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    const gradient = ctx.createRadialGradient(11, 11, 0, 11, 11, 11);
    gradient.addColorStop(0, `rgba(${color},0.95)`);
    gradient.addColorStop(0.34, `rgba(${color},0.36)`);
    gradient.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 22, 22);
    sprites.set(color, canvas);
  }

  return sprites;
}

export default function PoemGalaxyVideoClone() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [hudVisible, setHudVisible] = useState(false);
  const [query, setQuery] = useState('');
  const particleBudget = useMemo(() => getParticleBudget(), []);
  const particles = useMemo(() => buildParticles(particleBudget), [particleBudget]);
  const sprites = useMemo(() => makeSprites(), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'h') setHudVisible((value) => !value);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.targetX = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.targetY = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let raf = 0;
    let frame = 0;
    let last = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.05);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const render = (now: number) => {
      raf = requestAnimationFrame(render);
      if (now - last < 33) return;
      last = now;
      frame += 1;

      const width = window.innerWidth;
      const height = window.innerHeight;
      const time = now * 0.001;
      pointer.current.x += (pointer.current.targetX - pointer.current.x) * 0.06;
      pointer.current.y += (pointer.current.targetY - pointer.current.y) * 0.06;

      const yaw = time * 0.018 + pointer.current.x * 0.28;
      const pitch = -0.12 + pointer.current.y * 0.13;
      const zoom = Math.sin(time * 0.13) * 10;

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#00020a';
      ctx.fillRect(0, 0, width, height);

      const sky = ctx.createRadialGradient(width * 0.5, height * 0.53, 0, width * 0.5, height * 0.53, Math.max(width, height) * 0.8);
      sky.addColorStop(0, 'rgba(18,37,48,0.24)');
      sky.addColorStop(0.5, 'rgba(4,10,22,0.88)');
      sky.addColorStop(1, 'rgba(0,0,5,1)');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < 90; i += 1) {
        const t = (i * 97.37 + frame * 5.5) % (width + height);
        const x = (t * 1.35 + i * 29) % (width + 220) - 110;
        const y = (i * 53.7 + time * 20 + pointer.current.y * 24) % (height + 160) - 80;
        const len = 36 + (i % 13) * 3.4;
        const alpha = 0.018 + (i % 7) * 0.006;
        ctx.strokeStyle = `rgba(150,240,255,${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + len, y - len * 0.22);
        ctx.stroke();
      }

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        const q = project(p, width, height, yaw + p.layer * 0.014, pitch, zoom);
        if (!q) continue;
        if (q.x < -32 || q.x > width + 32 || q.y < -32 || q.y > height + 32) continue;
        const twinkle = 0.78 + Math.sin(time * 1.2 + p.seed) * 0.22;
        const r = Math.max(0.55, Math.min(3.4, p.size * q.scale * 1.35));
        const alpha = Math.min(0.72, p.alpha * twinkle * (q.scale * 1.9));
        const sprite = sprites.get(p.color);
        if (sprite && r > 1.05) {
          ctx.globalAlpha = alpha;
          ctx.drawImage(sprite, q.x - r * 2.2, q.y - r * 2.2, r * 4.4, r * 4.4);
          ctx.globalAlpha = 1;
        } else {
          ctx.fillStyle = `rgba(${p.color},${alpha})`;
          ctx.fillRect(q.x, q.y, 1, 1);
        }
      }

      const core = project({ x: 0, y: 0, z: 0, size: 1, alpha: 1, color: '245,255,255', seed: 0, layer: 0 }, width, height, yaw, pitch, zoom);
      if (core) {
        const coreRadius = Math.min(60, 95 * core.scale);
        const glow = ctx.createRadialGradient(core.x, core.y, 0, core.x, core.y, coreRadius);
        glow.addColorStop(0, 'rgba(245,255,255,0.52)');
        glow.addColorStop(0.22, 'rgba(170,255,245,0.2)');
        glow.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(core.x, core.y, coreRadius, 0, TAU);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      const vignette = ctx.createRadialGradient(width * 0.5, height * 0.5, Math.min(width, height) * 0.2, width * 0.5, height * 0.5, Math.max(width, height) * 0.72);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.66)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    };

    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [particles, sprites]);

  return (
    <main className={`reference-video-app ${hudVisible ? 'hud-on' : ''}`}>
      <canvas ref={canvasRef} className="reference-galaxy-canvas" />
      <div className="reference-title">
        <span>POEM CLOUD · FULL HISTORY OBSERVATORY</span>
        <strong>诗云 Poetry Cloud</strong>
      </div>
      <div className="reference-metrics">
        <b>32,657</b><span>诗人</span><b>933,857</b><span>诗作</span><em>H 控制台</em>
      </div>
      <div className="reference-verse">
        <span>我在中国历史上</span>
        <span>所有的诗歌轨迹里</span>
        <span>看见了一片星云</span>
      </div>
      {hudVisible && (
        <section className="reference-console">
          <label>SEARCH</label>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="李白 / 月 / 赤壁" />
          <div className="reference-tabs">
            <button>诗人</button><button>寻诗</button><button>探诗</button><button>朝代</button>
          </div>
          <p>当前为低负载参考版：先保证不卡和第一眼星云形态，再逐步接回真实 3D 数据交互。</p>
        </section>
      )}
      <div className="reference-bottom">H 控制台 · 鼠标移动观察视差 · 低负载 30FPS 模式</div>
    </main>
  );
}
