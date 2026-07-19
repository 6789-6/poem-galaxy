export type VisualQuality = 'performance' | 'balanced' | 'cinematic';

export interface QualitySignals {
  reducedMotion: boolean;
  mobile: boolean;
  hardwareConcurrency: number;
  devicePixelRatio: number;
}

export function chooseInitialQuality(signals: QualitySignals): VisualQuality {
  if (signals.reducedMotion || signals.mobile || signals.hardwareConcurrency <= 4) return 'performance';
  if (signals.hardwareConcurrency >= 8 && signals.devicePixelRatio <= 2) return 'cinematic';
  return 'balanced';
}

export function demoteQuality(quality: VisualQuality): VisualQuality {
  return quality === 'cinematic' ? 'balanced' : quality === 'balanced' ? 'performance' : 'performance';
}

export const QUALITY_PRESETS = {
  performance: { dpr: 1, poemParticles: 18000, backdropParticles: 1800, bloom: false, depthOfField: false, targetFps: 30 },
  balanced: { dpr: 1.25, poemParticles: 42000, backdropParticles: 3200, bloom: true, depthOfField: false, targetFps: 45 },
  cinematic: { dpr: 1.6, poemParticles: 72000, backdropParticles: 5200, bloom: true, depthOfField: true, targetFps: 50 }
} as const;
