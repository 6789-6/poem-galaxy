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

const coolDynastyPalette = ['#4ff7ff', '#7e8dff', '#c98aff', '#62ffd5', '#dffcff', '#9db7ff'];
const cloudPalette = ['#25f0ff', '#55ffd2', '#7d91ff', '#b77cff', '#f0feff', '#7edfff'];

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

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function coldStarColor(dynastySlot: number, random: () => number) {
  const base = new Color(coolDynastyPalette[dynastySlot % coolDynastyPalette.length]);
  const pearl = new Color(random() > 0.76 ? '#f7fdff' : '#9ef8ff');
  base.lerp(pearl, 0.08 + random() * 0.2);
  return base;
}

function cloudColor(random: () => number) {
  const base = new Color(cloudPalette[Math.floor(random() * cloudPalette.length)]);
  const deep = new Color(random() > 0.52 ? '#06102f' : '#011e31');
  base.lerp(deep, 0.07 + random() * 0.16);
  return base;
}

function poetColor(poet: Poet) {
  const dynastySlot = dynastyOrder.indexOf(poet.dynasty);
  return new Color(coolDynastyPalette[Math.max(0, dynastySlot) % coolDynastyPalette.length]);
}

function poetryCloudPosition(random: () => number, dynastySlot: number) {
  const armCount = 5;
  const arm = Math.floor(random() * armCount);
  const lane = dynastySlot - (dynastyOrder.length - 1) / 2;
  const normalizedLane = lane / Math.max(1, dynastyOrder.length / 2);
  const bandShift = normalizedLane * 16.5;
  const isCore = random() < 0.28;
  const isOuterHalo = random() > 0.83;
  const isFrontField = random() > 0.9;
  const isBackField = random() < 0.16;

  const radius = isCore
    ? Math.pow(random(), 1.65) * 34
    : isOuterHalo
      ? 72 + Math.pow(random(), 0.58) * 88
      : 20 + Math.pow(random(), 0.72) * 94;

  const armPhase = arm * ((Math.PI * 2) / armCount);
  const twist = radius * 0.043 + dynastySlot * 0.2;
  const angle = random() * 0.55 + armPhase + twist + gaussian(random) * (isCore ? 0.38 : 0.16);
  const armTightness = isCore ? 0.52 : isOuterHalo ? 0.82 : 0.66;
  const armWidth = isCore ? 11 : 3.2 + radius * 0.04;
  const armNoise = gaussian(random) * armWidth;
  const verticalThickness = isCore ? 8.8 : isOuterHalo ? 10.5 : 4.8 + radius * 0.036;
  const depthThickness = isCore ? 14 : isOuterHalo ? 21 : 8 + radius * 0.062;
  const ringLift = Math.sin(angle * 2.2 + dynastySlot) * (isOuterHalo ? 6.5 : 2.4);

  let x = Math.cos(angle) * radius * 1.62 + bandShift + Math.cos(angle + Math.PI * 0.5) * armNoise;
  let y = ringLift + gaussian(random) * verticalThickness + normalizedLane * 3.8;
  let z = Math.sin(angle) * radius * armTightness + gaussian(random) * depthThickness;

  if (isCore) {
    const pull = 0.48 + random() * 0.4;
    x = lerp(x, bandShift * 0.28, pull) + gaussian(random) * 5.8;
    y = lerp(y, 0, pull) + gaussian(random) * 3.2;
    z = lerp(z, 0, pull) + gaussian(random) * 7.5;
  }

  if (isFrontField) {
    z += 72 + random() * 96;
    x += gaussian(random) * 15;
    y += gaussian(random) * 10;
  } else if (isBackField) {
    z -= 110 + random() * 130;
    x += gaussian(random) * 22;
    y += gaussian(random) * 12;
  }

  const coreIntensity = 1 - smoothstep(18, 92, radius);
  const armIntensity = isCore ? 1 : 0.44 + (1 - Math.min(1, Math.abs(armNoise) / Math.max(1, armWidth * 2.2))) * 0.46;
  return { x, y, z, radius, isCore, isOuterHalo, isFrontField, isBackField, coreIntensity, armIntensity };
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
    const p = poetryCloudPosition(random, dynastySlot);
    let { x, y, z } = p;

    const isPoetHalo = random() < (p.isCore ? 0.5 : 0.34);
    if (isPoetHalo) {
      const t = p.isCore ? 0.32 + random() * 0.5 : 0.2 + random() * 0.46;
      const cluster = 2.4 + (1.9 - poet.brightness) * 3.4 + random() * 4.2;
      x = lerp(x, poet.position[0], t) + gaussian(random) * cluster;
      y = lerp(y, poet.position[1], t) + gaussian(random) * cluster * 0.88;
      z = lerp(z, poet.position[2], t) + gaussian(random) * cluster * 1.45 + (p.isFrontField ? random() * 18 : p.isBackField ? -random() * 28 : 0);
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const c = coldStarColor(dynastySlot, random);
    const coreGlow = p.coreIntensity * (0.08 + random() * 0.16);
    const armGlow = p.armIntensity * (0.18 + random() * 0.18);
    const depthBrightness = p.isFrontField ? 1.12 : p.isBackField ? 0.54 : p.isOuterHalo ? 0.68 : 0.92;
    const brightness = (0.28 + Math.pow(random(), 0.42) * 0.68 + armGlow) * depthBrightness;
    colors[i * 3] = clamp01(c.r * brightness + coreGlow * 0.34 + random() * 0.018);
    colors[i * 3 + 1] = clamp01(c.g * brightness + coreGlow * 0.56 + random() * 0.024);
    colors[i * 3 + 2] = clamp01(c.b * brightness + coreGlow * 0.92 + random() * 0.034);

    sizes[i] = 0.028
      + Math.pow(random(), 7.0) * 1.0
      + (isPoetHalo ? 0.03 : 0)
      + (p.isCore ? 0.035 + random() * 0.08 : 0)
      + (p.isFrontField ? 0.1 + random() * 0.18 : 0)
      + (p.isOuterHalo ? random() * 0.035 : 0);
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
    const p = poetryCloudPosition(random, dynastySlot);

    positions[i * 3] = p.x * 1.05 + gaussian(random) * (p.isCore ? 8 : 14);
    positions[i * 3 + 1] = p.y * 1.18 + gaussian(random) * (p.isCore ? 5 : 8);
    positions[i * 3 + 2] = p.z * 0.96 + gaussian(random) * (p.isCore ? 12 : 18);

    const c = cloudColor(random);
    const coreLift = p.coreIntensity * 0.34;
    const haze = (0.16 + random() * 0.34 + coreLift) * (p.isOuterHalo ? 0.68 : 1);
    colors[i * 3] = clamp01(c.r * haze * 0.78);
    colors[i * 3 + 1] = clamp01(c.g * haze * 0.95);
    colors[i * 3 + 2] = clamp01(c.b * (haze + 0.16));
    sizes[i] = 0.12 + Math.pow(random(), 2.6) * (p.isCore ? 1.55 : p.isOuterHalo ? 1.05 : 1.28);
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
