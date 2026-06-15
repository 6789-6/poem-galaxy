import { Color, Vector3 } from 'three';
import type { Poet } from '../data/poetry';
import { dynastyOrder, poets } from '../data/poetry';

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

function poetColor(poet: Poet) {
  const dynastySlot = dynastyOrder.indexOf(poet.dynasty);
  return new Color(coolDynastyPalette[Math.max(0, dynastySlot) % coolDynastyPalette.length]);
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
    const dynastyCenter = -54 + dynastySlot * 21.5;
    const depthBand = random();
    const isForeground = depthBand > 0.86;
    const isFarBackground = depthBand < 0.22;
    const arm = Math.floor(random() * 7);
    const radius = 7 + Math.pow(random(), 0.55) * (46 + dynastySlot * 4.8);
    const angle = random() * Math.PI * 2 + radius * 0.074 + arm * ((Math.PI * 2) / 7) + dynastySlot * 0.34;
    const diskNoise = gaussian(random) * (2.6 + radius * 0.062);
    const verticalNoise = gaussian(random) * (2.6 + radius * 0.092);
    const depthThrow = isForeground ? 78 + random() * 86 : isFarBackground ? -118 - random() * 98 : gaussian(random) * 26;

    let x = dynastyCenter + Math.cos(angle) * radius * 1.18 + diskNoise;
    let y = Math.sin(angle * 2.16 + dynastySlot) * 3.2 + verticalNoise;
    let z = Math.sin(angle) * radius * 1.18 + gaussian(random) * (4.8 + radius * 0.12) + depthThrow;

    const isPoetHalo = random() < 0.42;
    if (isPoetHalo) {
      const t = 0.24 + random() * 0.56;
      const cluster = 2.5 + (1.8 - poet.brightness) * 3.2 + random() * 4.8;
      x = lerp(x, poet.position[0], t) + gaussian(random) * cluster;
      y = lerp(y, poet.position[1], t) + gaussian(random) * cluster * 0.92;
      z = lerp(z, poet.position[2], t) + gaussian(random) * cluster * 1.35 + (isForeground ? random() * 22 : isFarBackground ? -random() * 34 : 0);
    }

    const isCoreDust = random() < 0.1;
    if (isCoreDust) {
      const coreT = random() * 0.3;
      x = lerp(x, dynastyCenter, coreT) + gaussian(random) * 6.4;
      y = lerp(y, 0, coreT) + gaussian(random) * 3.6;
      z = lerp(z, 0, coreT) + gaussian(random) * 10.5;
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const c = coldStarColor(dynastySlot, random);
    const hotCore = isPoetHalo ? 0.09 + random() * 0.15 : 0.02 + random() * 0.06;
    const depthBrightness = isForeground ? 1.16 : isFarBackground ? 0.64 : 0.88;
    const brightness = (0.34 + Math.pow(random(), 0.45) * 0.64) * depthBrightness;
    colors[i * 3] = clamp01(c.r * brightness + hotCore * 0.46 + random() * 0.018);
    colors[i * 3 + 1] = clamp01(c.g * brightness + hotCore * 0.68 + random() * 0.025);
    colors[i * 3 + 2] = clamp01(c.b * brightness + hotCore * 1.05 + random() * 0.035);

    sizes[i] = 0.035 + Math.pow(random(), 7.0) * 1.06 + (isPoetHalo ? 0.026 : 0) + (isForeground ? 0.08 + random() * 0.16 : 0);
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

function pushBurstArc(source: Poet, target: Poet, segments: number[], colors: number[], strength = 1, seed = 0) {
  const start = new Vector3(...source.position);
  const end = new Vector3(...target.position);
  const distance = start.distanceTo(end);
  const direction = end.clone().sub(start).normalize();
  const sideways = new Vector3(-direction.z, 0.25 + Math.sin(seed) * 0.18, direction.x).normalize();
  const upward = new Vector3(0, 1, 0);

  const mid = start.clone().lerp(end, 0.5)
    .addScaledVector(upward, 12 + distance * (0.14 + strength * 0.08))
    .addScaledVector(sideways, Math.sin(seed * 1.73) * (8 + distance * 0.07))
    .add(new Vector3(0, Math.sin(seed * 0.9) * 3, Math.cos(seed * 1.17) * 11));

  const sourceColor = poetColor(source).lerp(new Color('#f5fdff'), 0.18 + strength * 0.12);
  const targetColor = poetColor(target).lerp(new Color('#bff7ff'), 0.16);
  const steps = Math.round(14 + strength * 14);

  let previous = start;
  for (let i = 1; i <= steps; i += 1) {
    const raw = i / steps;
    const t = raw * raw * (3 - 2 * raw);
    const a = start.clone().lerp(mid, t);
    const b = mid.clone().lerp(end, t);
    const point = a.lerp(b, t);
    const breathing = Math.sin((raw + seed * 0.13) * Math.PI * 2) * 0.55 + 0.45;
    const lineBoost = 0.18 + strength * (0.78 + breathing * 0.24);

    segments.push(previous.x, previous.y, previous.z, point.x, point.y, point.z);

    const c1 = sourceColor.clone().lerp(targetColor, Math.max(0, raw - 0.1));
    const c2 = sourceColor.clone().lerp(targetColor, raw);
    colors.push(
      clamp01(c1.r * lineBoost), clamp01(c1.g * lineBoost), clamp01(c1.b * lineBoost + strength * 0.05),
      clamp01(c2.r * lineBoost * 1.08), clamp01(c2.g * lineBoost * 1.08), clamp01(c2.b * lineBoost * 1.12)
    );
    previous = point;
  }
}

const poetMap = new Map(poets.map((poet) => [poet.id, poet]));
const relationshipSegmentCache = new Map<string, { positions: Float32Array; colors: Float32Array }>();

function addFocusedNetwork(source: Poet, segments: number[], colors: number[], seedBase: number, strength = 1) {
  const visited = new Set<string>();

  source.relations.forEach((targetId, index) => {
    const target = poetMap.get(targetId);
    if (!target) return;
    visited.add(target.id);
    pushBurstArc(source, target, segments, colors, strength, seedBase + index * 1.87);

    target.relations.slice(0, 3).forEach((secondId, secondIndex) => {
      const second = poetMap.get(secondId);
      if (!second || second.id === source.id || visited.has(`${target.id}:${second.id}`)) return;
      visited.add(`${target.id}:${second.id}`);
      pushBurstArc(target, second, segments, colors, strength * 0.36, seedBase + index * 2.31 + secondIndex * 0.77);
    });
  });
}

export function buildRelationshipSegments(activePoetId?: string) {
  const primaryId = activePoetId ?? 'li-bai';
  const cacheKey = activePoetId ? `focus:${activePoetId}` : 'burst:li-bai:with-background';
  const cached = relationshipSegmentCache.get(cacheKey);
  if (cached) return cached;

  const segments: number[] = [];
  const colors: number[] = [];
  const seen = new Set<string>();
  const primary = poetMap.get(primaryId) ?? poets[0];

  addFocusedNetwork(primary, segments, colors, 5.21, activePoetId ? 1.08 : 1.18);

  if (!activePoetId) {
    [...poets]
      .sort((a, b) => b.brightness - a.brightness)
      .slice(0, 8)
      .forEach((poet, poetIndex) => {
        if (poet.id === primary.id) return;
        poet.relations.slice(0, 2).forEach((targetId, targetIndex) => {
          const target = poetMap.get(targetId);
          if (!target) return;
          const key = [poet.id, target.id].sort().join('::');
          if (seen.has(key)) return;
          seen.add(key);
          pushBurstArc(poet, target, segments, colors, 0.22, 17.3 + poetIndex * 1.41 + targetIndex * 0.5);
        });
      });
  }

  const result = {
    positions: new Float32Array(segments),
    colors: new Float32Array(colors)
  };
  relationshipSegmentCache.set(cacheKey, result);
  return result;
}
