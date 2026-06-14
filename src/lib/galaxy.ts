import { Color, Vector3 } from 'three';
import type { Poet } from '../data/poetry';
import { dynastyColors, dynastyOrder, poets } from '../data/poetry';

export type GalaxyBuffers = {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  dynastyIndex: Uint8Array;
  total: number;
};

export type HotPoemStar = {
  id: string;
  title: string;
  poetId: string;
  position: [number, number, number];
  color: string;
};

function mulberry32(seed: number) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(random: () => number) {
  const u = 1 - random();
  const v = random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function colorToRgb(hex: string) {
  const color = new Color(hex);
  return [color.r, color.g, color.b] as const;
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function generateGalaxyBuffers(count = 150000): GalaxyBuffers {
  const random = mulberry32(20260614);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const dynastyIndex = new Uint8Array(count);

  for (let i = 0; i < count; i += 1) {
    const dynastySlot = Math.floor(random() * dynastyOrder.length);
    const dynasty = dynastyOrder[dynastySlot];
    dynastyIndex[i] = dynastySlot;

    const poet = poets[Math.floor(random() * poets.length)];
    const dynastyCenter = -52 + dynastySlot * 22;
    const arm = Math.floor(random() * 5);
    const radius = 7 + Math.pow(random(), 0.58) * (36 + dynastySlot * 3);
    const angle = random() * Math.PI * 2 + radius * 0.075 + arm * ((Math.PI * 2) / 5) + dynastySlot * 0.3;
    const armTightness = 0.9 + dynastySlot * 0.025;
    const diskNoise = gaussian(random) * (1.9 + radius * 0.035);
    const verticalNoise = gaussian(random) * (1.3 + radius * 0.055);

    let x = dynastyCenter + Math.cos(angle) * radius * armTightness + diskNoise;
    let y = Math.sin(angle * 2.8 + dynastySlot) * 2.4 + verticalNoise;
    let z = Math.sin(angle) * radius * 0.84 + gaussian(random) * (2.8 + radius * 0.045);

    const isPoetHalo = random() < 0.48;
    if (isPoetHalo) {
      const t = 0.38 + random() * 0.52;
      const cluster = 2.2 + (1.8 - poet.brightness) * 3.5 + random() * 3.5;
      x = lerp(x, poet.position[0], t) + gaussian(random) * cluster;
      y = lerp(y, poet.position[1], t) + gaussian(random) * cluster * 0.72;
      z = lerp(z, poet.position[2], t) + gaussian(random) * cluster;
    }

    const isCoreDust = random() < 0.18;
    if (isCoreDust) {
      const coreT = random() * 0.45;
      x = lerp(x, dynastyCenter, coreT) + gaussian(random) * 4.6;
      y = lerp(y, 0, coreT) + gaussian(random) * 2.4;
      z = lerp(z, 0, coreT) + gaussian(random) * 4.6;
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const [r, g, b] = colorToRgb(dynastyColors[dynasty]);
    const hotCore = isPoetHalo ? 0.12 + random() * 0.18 : 0.03 + random() * 0.08;
    const brightness = 0.42 + Math.pow(random(), 0.35) * 0.72;
    colors[i * 3] = clamp01(r * brightness + hotCore + random() * 0.03);
    colors[i * 3 + 1] = clamp01(g * brightness + hotCore * 0.82 + random() * 0.035);
    colors[i * 3 + 2] = clamp01(b * brightness + hotCore * 1.2 + random() * 0.05);

    sizes[i] = 0.045 + Math.pow(random(), 6.5) * 1.35 + (isPoetHalo ? 0.035 : 0);
  }

  return { positions, colors, sizes, dynastyIndex, total: count };
}

export function generateNebulaBuffers(count = 36000): GalaxyBuffers {
  const random = mulberry32(9477);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const dynastyIndex = new Uint8Array(count);

  for (let i = 0; i < count; i += 1) {
    const dynastySlot = Math.floor(random() * dynastyOrder.length);
    const dynasty = dynastyOrder[dynastySlot];
    dynastyIndex[i] = dynastySlot;

    const radius = 16 + random() * 60;
    const angle = random() * Math.PI * 2 + dynastySlot * 0.42;
    const wave = Math.sin(angle * 3.2 + dynastySlot) * 7;
    const x = -52 + dynastySlot * 22 + Math.cos(angle) * radius * (0.62 + random() * 0.55) + gaussian(random) * 8;
    const y = wave + gaussian(random) * 11;
    const z = Math.sin(angle) * radius * 0.82 + gaussian(random) * 18;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const [r, g, b] = colorToRgb(dynastyColors[dynasty]);
    const haze = 0.18 + random() * 0.22;
    colors[i * 3] = r * haze;
    colors[i * 3 + 1] = g * haze;
    colors[i * 3 + 2] = b * (haze + 0.06);
    sizes[i] = 0.35 + random() * 2.8;
  }

  return { positions, colors, sizes, dynastyIndex, total: count };
}

export function poetWorldPosition(poet: Poet) {
  return new Vector3(poet.position[0], poet.position[1], poet.position[2]);
}

function pushArc(source: Poet, target: Poet, segments: number[], colors: number[], highlight = false) {
  const start = new Vector3(...source.position);
  const end = new Vector3(...target.position);
  const mid = start.clone().lerp(end, 0.5);
  const distance = start.distanceTo(end);
  mid.y += 7 + distance * 0.18;
  mid.z += Math.sin(distance) * 3;

  const sourceColor = new Color(dynastyColors[source.dynasty]);
  const targetColor = new Color(dynastyColors[target.dynasty]);
  const steps = highlight ? 20 : 14;

  let previous = start;
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const a = start.clone().lerp(mid, t);
    const b = mid.clone().lerp(end, t);
    const point = a.lerp(b, t);
    segments.push(previous.x, previous.y, previous.z, point.x, point.y, point.z);
    const c1 = sourceColor.clone().lerp(targetColor, Math.max(0, t - 0.08));
    const c2 = sourceColor.clone().lerp(targetColor, t);
    const boost = highlight ? 1.45 : 0.82;
    colors.push(
      clamp01(c1.r * boost), clamp01(c1.g * boost), clamp01(c1.b * boost),
      clamp01(c2.r * boost), clamp01(c2.g * boost), clamp01(c2.b * boost)
    );
    previous = point;
  }
}

const poetMap = new Map(poets.map((poet) => [poet.id, poet]));
const relationshipSegmentCache = new Map<string, { positions: Float32Array; colors: Float32Array }>();

export function buildRelationshipSegments(activePoetId?: string) {
  const cacheKey = activePoetId ?? '__all__';
  const cached = relationshipSegmentCache.get(cacheKey);
  if (cached) return cached;

  const segments: number[] = [];
  const colors: number[] = [];
  const seen = new Set<string>();

  poets.forEach((poet) => {
    poet.relations.forEach((targetId) => {
      const target = poetMap.get(targetId);
      if (!target) return;
      const key = [poet.id, target.id].sort().join('::');
      if (seen.has(key)) return;
      seen.add(key);
      const highlight = !activePoetId || poet.id === activePoetId || target.id === activePoetId;
      if (activePoetId && !highlight) return;
      pushArc(poet, target, segments, colors, highlight);
    });
  });

  const result = {
    positions: new Float32Array(segments),
    colors: new Float32Array(colors)
  };
  relationshipSegmentCache.set(cacheKey, result);
  return result;
}
