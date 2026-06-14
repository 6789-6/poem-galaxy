import { Color, Vector3 } from 'three';
import type { Dynasty, Poet } from '../data/poetry';
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

export function generateGalaxyBuffers(count = 80000): GalaxyBuffers {
  const random = mulberry32(20260614);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const dynastyIndex = new Uint8Array(count);

  for (let i = 0; i < count; i += 1) {
    const dynastySlot = Math.floor(random() * dynastyOrder.length);
    const dynasty = dynastyOrder[dynastySlot];
    dynastyIndex[i] = dynastySlot;

    const bandCenter = -44 + dynastySlot * 18;
    const radius = 18 + dynastySlot * 9 + random() * 24;
    const angle = random() * Math.PI * 2 + dynastySlot * 0.65;
    const spiral = radius * 0.018;
    const arm = angle + spiral + gaussian(random) * 0.28;

    const verticalNoise = gaussian(random) * (4.5 + random() * 4);
    const localCluster = poets[Math.floor(random() * poets.length)];
    const towardPoet = random() < 0.32;

    let x = Math.cos(arm) * radius + bandCenter + gaussian(random) * 3.5;
    let y = verticalNoise + Math.sin(angle * 3.0) * 3.5;
    let z = Math.sin(arm) * radius + gaussian(random) * 7.2;

    if (towardPoet) {
      const p = localCluster.position;
      const t = 0.35 + random() * 0.48;
      x = lerp(x, p[0], t) + gaussian(random) * 5.5;
      y = lerp(y, p[1], t) + gaussian(random) * 5.5;
      z = lerp(z, p[2], t) + gaussian(random) * 5.5;
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const [r, g, b] = colorToRgb(dynastyColors[dynasty]);
    const glow = 0.55 + random() * 0.45;
    colors[i * 3] = Math.min(1, r * glow + random() * 0.05);
    colors[i * 3 + 1] = Math.min(1, g * glow + random() * 0.05);
    colors[i * 3 + 2] = Math.min(1, b * glow + random() * 0.09);

    sizes[i] = 0.045 + Math.pow(random(), 5) * 0.75;
  }

  return { positions, colors, sizes, dynastyIndex, total: count };
}

export function generateNebulaBuffers(count = 14000): GalaxyBuffers {
  const random = mulberry32(9477);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const dynastyIndex = new Uint8Array(count);

  for (let i = 0; i < count; i += 1) {
    const dynastySlot = Math.floor(random() * dynastyOrder.length);
    const dynasty = dynastyOrder[dynastySlot];
    dynastyIndex[i] = dynastySlot;

    const radius = 24 + random() * 52;
    const angle = random() * Math.PI * 2;
    const x = -48 + dynastySlot * 18 + Math.cos(angle) * radius * (0.5 + random());
    const y = gaussian(random) * 14;
    const z = Math.sin(angle) * radius * 0.75 + gaussian(random) * 22;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const [r, g, b] = colorToRgb(dynastyColors[dynasty]);
    colors[i * 3] = r * 0.42;
    colors[i * 3 + 1] = g * 0.42;
    colors[i * 3 + 2] = b * 0.42;
    sizes[i] = 0.25 + random() * 2.2;
  }

  return { positions, colors, sizes, dynastyIndex, total: count };
}

export function poetWorldPosition(poet: Poet) {
  return new Vector3(poet.position[0], poet.position[1], poet.position[2]);
}

export function buildRelationshipSegments(activePoetId?: string) {
  const segments: number[] = [];
  const colors: number[] = [];

  poets.forEach((poet) => {
    if (activePoetId && poet.id !== activePoetId && !poet.relations.includes(activePoetId)) return;
    poet.relations.forEach((targetId) => {
      const target = poets.find((item) => item.id === targetId);
      if (!target) return;
      segments.push(...poet.position, ...target.position);
      const sourceColor = new Color(dynastyColors[poet.dynasty]);
      const targetColor = new Color(dynastyColors[target.dynasty]);
      colors.push(sourceColor.r, sourceColor.g, sourceColor.b, targetColor.r, targetColor.g, targetColor.b);
    });
  });

  return {
    positions: new Float32Array(segments),
    colors: new Float32Array(colors)
  };
}
