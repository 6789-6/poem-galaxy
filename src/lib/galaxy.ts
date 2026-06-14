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

const coolDynastyPalette = ['#55f6ff', '#8d7cff', '#bdefff', '#72ffcc', '#dd83ff', '#a8c7ff'];
const cloudPalette = ['#45eaff', '#6c8cff', '#a57dff', '#67ffd5', '#d8f7ff', '#ffffff'];

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

function coldStarColor(dynastySlot: number, random: () => number) {
  const base = new Color(coolDynastyPalette[dynastySlot % coolDynastyPalette.length]);
  const pearl = new Color(random() > 0.72 ? '#f4fbff' : '#9ff5ff');
  base.lerp(pearl, 0.08 + random() * 0.2);
  return base;
}

function cloudColor(random: () => number) {
  const base = new Color(cloudPalette[Math.floor(random() * cloudPalette.length)]);
  const deep = new Color(random() > 0.5 ? '#050b2f' : '#021d33');
  base.lerp(deep, 0.08 + random() * 0.18);
  return base;
}

export function generateGalaxyBuffers(count = 150000): GalaxyBuffers {
  const random = mulberry32(20260614);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const dynastyIndex = new Uint8Array(count);

  for (let i = 0; i < count; i += 1) {
    const dynastySlot = Math.floor(random() * dynastyOrder.length);
    dynastyIndex[i] = dynastySlot;

    const poet = poets[Math.floor(random() * poets.length)];
    const dynastyCenter = -52 + dynastySlot * 22;
    const arm = Math.floor(random() * 6);
    const radius = 8 + Math.pow(random(), 0.62) * (42 + dynastySlot * 3.5);
    const angle = random() * Math.PI * 2 + radius * 0.062 + arm * ((Math.PI * 2) / 6) + dynastySlot * 0.28;
    const diskNoise = gaussian(random) * (2.2 + radius * 0.04);
    const verticalNoise = gaussian(random) * (1.8 + radius * 0.07);

    let x = dynastyCenter + Math.cos(angle) * radius * 1.08 + diskNoise;
    let y = Math.sin(angle * 2.2 + dynastySlot) * 2.2 + verticalNoise;
    let z = Math.sin(angle) * radius * 0.88 + gaussian(random) * (3.2 + radius * 0.05);

    const isPoetHalo = random() < 0.42;
    if (isPoetHalo) {
      const t = 0.32 + random() * 0.48;
      const cluster = 2.6 + (1.8 - poet.brightness) * 3.2 + random() * 4.2;
      x = lerp(x, poet.position[0], t) + gaussian(random) * cluster;
      y = lerp(y, poet.position[1], t) + gaussian(random) * cluster * 0.72;
      z = lerp(z, poet.position[2], t) + gaussian(random) * cluster;
    }

    const isCoreDust = random() < 0.12;
    if (isCoreDust) {
      const coreT = random() * 0.36;
      x = lerp(x, dynastyCenter, coreT) + gaussian(random) * 5.4;
      y = lerp(y, 0, coreT) + gaussian(random) * 2.8;
      z = lerp(z, 0, coreT) + gaussian(random) * 5.4;
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const c = coldStarColor(dynastySlot, random);
    const hotCore = isPoetHalo ? 0.08 + random() * 0.14 : 0.02 + random() * 0.06;
    const brightness = 0.38 + Math.pow(random(), 0.45) * 0.62;
    colors[i * 3] = clamp01(c.r * brightness + hotCore * 0.55 + random() * 0.02);
    colors[i * 3 + 1] = clamp01(c.g * brightness + hotCore * 0.72 + random() * 0.025);
    colors[i * 3 + 2] = clamp01(c.b * brightness + hotCore * 1.1 + random() * 0.035);

    sizes[i] = 0.036 + Math.pow(random(), 7.0) * 1.08 + (isPoetHalo ? 0.025 : 0);
  }

  return { positions, colors, sizes, dynastyIndex, total: count };
}

export function generateNebulaBuffers(count = 82000): GalaxyBuffers {
  const random = mulberry32(9477);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const dynastyIndex = new Uint8Array(count);

  for (let i = 0; i < count; i += 1) {
    const dynastySlot = Math.floor(random() * dynastyOrder.length);
    dynastyIndex[i] = dynastySlot;

    const arm = Math.floor(random() * 7);
    const radius = 18 + Math.pow(random(), 0.64) * 122;
    const angle = random() * Math.PI * 2 + radius * 0.026 + arm * ((Math.PI * 2) / 7);
    const sheet = random() > 0.55 ? 1 : -1;
    const x = Math.cos(angle) * radius * (1.16 + random() * 0.18) + gaussian(random) * (11 + radius * 0.05);
    const y = sheet * Math.sin(angle * 1.7) * 8 + gaussian(random) * (7 + radius * 0.035);
    const z = Math.sin(angle) * radius * (0.72 + random() * 0.18) + gaussian(random) * (13 + radius * 0.07);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const c = cloudColor(random);
    const haze = 0.22 + random() * 0.38;
    colors[i * 3] = clamp01(c.r * haze * 0.78);
    colors[i * 3 + 1] = clamp01(c.g * haze * 0.92);
    colors[i * 3 + 2] = clamp01(c.b * (haze + 0.12));
    sizes[i] = 0.16 + Math.pow(random(), 2.8) * 1.25;
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
    const boost = highlight ? 1.12 : 0.62;
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
