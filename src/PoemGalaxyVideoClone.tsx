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
const palette = ['110,255,220', '255,120,210', '180,210,255', '255,255,245', '120,245,255'];

function rand(seed: number) {
  let t = seed + 0x6D2B79F5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildParticles(count = 42000): Particle[] {
  const r = rand(20260615);
  const particles: Particle[] = [];

  for (let i = 0; i < count; i += 1) {
    const u = r();
    const arm = Math.floor(r() * 5);
    const armAngle = (arm / 5) * TAU;
    const radiusBias = u < 0.18 ? Math.pow(r(), 2.8) : u < 0.72 ? Math.pow(r(), 0.62) : 0.66 + Math.pow(r(), 1.8) * 0.48;
    const spiral = radiusBias * 4.6 + Math.sin(radiusBias * 7.0 + arm) * 0.22;
    const angle = armAngle + spiral + (r() - 0.5) * (0.32 + radiusBias * 0.42);
    const bandNoise = (r() - 0.5) * (u < 0.18 ? 8 : 18 + radiusBias * 22);
    const ringNoise = (r() - 0.5) * (u < 0.18 ? 5 : 13 + radiusBias * 18);

    const long = 168 * radiusBias;
    const short = 78 * radiusBias;
    const x = Math.cos(angle) * long + bandNoise;
    const z = Math.sin(angle) * short + ringNoise;
    const y = (r() - 0.5) * (10 + radiusBias * 32) + Math.sin(angle * 2.0) * 5;

    const colorIndex = u < 0.2 ? 3 : (arm + (radiusBias > 0.5 ? 1 : 0)) % palette.length;
    const coreBoost = Math.max(0, 1 - radiusBias);
    particles.push({
      x,
      y,
      z,
      size: 0.34 + r() * 1.05 + coreBoost * 1.1,
      alpha: 0.12 + r() * 0.34 + coreBoost * 0.38,
      color: palette[colorIndex],
      seed: r() * 1000,
      layer: radiusBias
    });
  }

  for (let i = 0; i < 2600; i += 1) {
    const angle = r() * TAU;
    const radius = 220 + r() * 240;
    particles.push({
      x: Math.cos(angle) * radius,
      y: (r() - 0.5) * 180,
      z: Math.sin(angle) * radius * 0.6 - 120 - r() * 180,
      size: 0.25 + r() * 0.7,
      alpha: 0.06 + r() * 0.16,
      color: palette[Math.floor(r() * palette.length)],
      seed: r() * 1000,
      layer: 1.6
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
  const z2 = p.y * sp + z1 * cp + 310 + zoom;
  if (z2 < 18) return null;

  const fov = Math.min(width, height) * 0.92;
  const scale = fov / z2;
  return {
    x: width * 0.5 + x1 * scale,
    y: height * 0.52 + y1 * scale,
    scale,
    depth: z2
  };
}

function drawSoftDot(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, alpha: number) {
  if (radius < 0.75) {
    ctx.fillStyle = `rgba(${color},${alpha})`;
    ctx.fillRect(x, y, 1, 1);
    return;
  }
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.2);
  gradient.addColorStop(0, `rgba(${color},${Math.min(1, alpha * 1.7)})`);
  gradient.addColorStop(0.38, `rgba(${color},${alpha * 0.42})`);
  gradient.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius * 2.2, 0, TAU);
  ctx.fill();
}

export default function PoemGalaxyVideoClone() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [hudVisible, setHudVisible] = useState(false);
  const [query, setQuery] = useState('');
  const particles = useMemo(() => buildParticles(), []);

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
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let raf = 0;
    let frame = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.45);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      frame += 1;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const time = performance.now() * 0.001;
      pointer.current.x += (pointer.current.targetX - pointer.current.x) * 0.045;
      pointer.current.y += (pointer.current.targetY - pointer.current.y) * 0.045;

      const yaw = time * 0.035 + pointer.current.x * 0.34;
      const pitch = -0.14 + pointer.current.y * 0.16;
      const zoom = Math.sin(time * 0.18) * 18;

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#00020a';
      ctx.fillRect(0, 0, width, height);

      const sky = ctx.createRadialGradient(width * 0.5, height * 0.52, 0, width * 0.5, height * 0.52, Math.max(width, height) * 0.75);
      sky.addColorStop(0, 'rgba(18,35,48,0.28)');
      sky.addColorStop(0.45, 'rgba(6,12,24,0.82)');
      sky.addColorStop(1, 'rgba(0,0,5,1)');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < 460; i += 1) {
        const t = (i * 97.37 + frame * 3.6) % (width + height);
        const x = (t * 1.7 + i * 19) % (width + 220) - 110;
        const y = (i * 31.7 + time * 28 + pointer.current.y * 30) % (height + 160) - 80;
        const len = 42 + (i % 17) * 3.2;
        const alpha = 0.025 + (i % 9) * 0.006;
        ctx.strokeStyle = `rgba(150,240,255,${alpha})`;
        ctx.lineWidth = i % 11 === 0 ? 0.8 : 0.45;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + len, y - len * 0.22);
        ctx.stroke();
      }

      const projected: Array<{ p: Particle; q: Projected }> = [];
      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        const q = project(p, width, height, yaw + p.layer * 0.016, pitch, zoom);
        if (!q) continue;
        if (q.x < -60 || q.x > width + 60 || q.y < -60 || q.y > height + 60) continue;
        projected.push({ p, q });
      }
      projected.sort((a, b) => b.q.depth - a.q.depth);

      for (const { p, q } of projected) {
        const twinkle = 0.72 + Math.sin(time * 1.4 + p.seed) * 0.28;
        const r = Math.max(0.28, p.size * q.scale * 1.8);
        const alpha = Math.min(0.86, p.alpha * twinkle * (q.scale * 2.5));
        drawSoftDot(ctx, q.x, q.y, r, p.color, alpha);
      }

      const core = project({ x: 0, y: 0, z: 0, size: 1, alpha: 1, color: '255,255,248', seed: 0, layer: 0 }, width, height, yaw, pitch, zoom);
      if (core) {
        const glow = ctx.createRadialGradient(core.x, core.y, 0, core.x, core.y, 160 * core.scale);
        glow.addColorStop(0, 'rgba(255,255,250,0.92)');
        glow.addColorStop(0.12, 'rgba(190,255,250,0.38)');
        glow.addColorStop(0.38, 'rgba(88,255,220,0.12)');
        glow.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(core.x, core.y, 160 * core.scale, 0, TAU);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      const vignette = ctx.createRadialGradient(width * 0.5, height * 0.5, Math.min(width, height) * 0.2, width * 0.5, height * 0.5, Math.max(width, height) * 0.72);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.72)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      raf = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [particles]);

  return (
    <main className={`reference-video-app ${hudVisible ? 'hud-on' : ''}`}>
      <canvas ref={canvasRef} className="reference-galaxy-canvas" />
      <div className="reference-title">
        <span>POEM CLOUD · FULL HISTORY OBSERVATORY</span>
        <strong>诗云 Poetry Cloud</strong>
      </div>
      <div className="reference-metrics">
        <b>32,657</b><span>诗人</span><b>933,857</b><span>诗作</span><em>H 显示界面</em>
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
          <p>移动鼠标观察星云视差，滚动页面无须操作。下一步会把搜索结果接回真实诗人坐标。</p>
        </section>
      )}
      <div className="reference-bottom">DRAG 视差观察 · H 控制台 · SEARCH 自动飞入</div>
    </main>
  );
}
