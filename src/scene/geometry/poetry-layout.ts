import type { AuthorRecord, DynastyId, PoemRecord } from '../../data/schema';

export const DYNASTY_BANDS: Record<DynastyId, { latitude: number; radius: number; phase: number }> = {
  'pre-qin': { latitude: 0.72, radius: 30, phase: -0.8 },
  'han-wei': { latitude: 0.44, radius: 34, phase: 0.4 },
  tang: { latitude: 0.12, radius: 40, phase: 1.05 },
  song: { latitude: -0.17, radius: 39, phase: -0.2 },
  'yuan-ming-qing': { latitude: -0.49, radius: 34, phase: 0.9 },
  modern: { latitude: -0.72, radius: 30, phase: -1.2 }
};

function hash01(value: string) {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

export function authorPosition(author: AuthorRecord): [number, number, number] {
  const band = DYNASTY_BANDS[author.dynasty];
  const angle = band.phase + hash01(`${author.id}:angle`) * Math.PI * 2;
  const latitude = band.latitude + (hash01(`${author.id}:latitude`) - 0.5) * 0.18;
  const flat = Math.cos(latitude);
  return [
    Math.cos(angle) * flat * band.radius,
    Math.sin(latitude) * 24,
    Math.sin(angle) * flat * band.radius
  ];
}

export function poemPosition(poem: PoemRecord, _index: number): [number, number, number] {
  const band = DYNASTY_BANDS[poem.dynasty];
  const angle = band.phase + hash01(poem.id) * Math.PI * 2;
  const radius = band.radius * (0.62 + hash01(`${poem.id}:radius`) * 0.42);
  return [
    Math.cos(angle) * radius,
    (hash01(`${poem.id}:height`) - 0.5) * 19,
    Math.sin(angle) * radius * 0.72
  ];
}
