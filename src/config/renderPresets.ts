export type VisualQuality = 'performance' | 'balanced' | 'cinematic';

export type RenderPreset = {
  dpr: [number, number];
  multisampling: number;
  searchDebounceMs: number;
  starCount: number;
  starPointScale: number;
  starPointMax: number;
  starPixelRatioCap: number;
  twinkleAmplitude: number;
  deepFieldCount: number;
  deepFieldOpacity: number;
  nebulaCount: number;
  nebula: {
    opacity: number;
    baseSize: number;
    maxSize: number;
    pixelRatioCap: number;
  };
  bloom: null | {
    intensity: number;
    intensityReading: number;
    threshold: number;
    smoothing: number;
    radius: number;
  };
  dof: null | {
    focusDistance: number;
    focalLength: number;
    bokehScale: number;
    height: number;
  };
  vignette: boolean;
};

export const RENDER_PRESETS: Record<VisualQuality, RenderPreset> = {
  performance: {
    dpr: [1, 1],
    multisampling: 0,
    searchDebounceMs: 280,
    starCount: 110000,
    starPointScale: 44,
    starPointMax: 8,
    starPixelRatioCap: 1,
    twinkleAmplitude: 0.005,
    deepFieldCount: 3200,
    deepFieldOpacity: 0.08,
    nebulaCount: 52000,
    nebula: { opacity: 0.026, baseSize: 0.27, maxSize: 2.0, pixelRatioCap: 1 },
    bloom: null,
    dof: null,
    vignette: false
  },
  balanced: {
    dpr: [1, 1.35],
    multisampling: 0,
    searchDebounceMs: 180,
    starCount: 210000,
    starPointScale: 52,
    starPointMax: 11,
    starPixelRatioCap: 1.25,
    twinkleAmplitude: 0.006,
    deepFieldCount: 7600,
    deepFieldOpacity: 0.11,
    nebulaCount: 130000,
    nebula: { opacity: 0.03, baseSize: 0.3, maxSize: 2.45, pixelRatioCap: 1.15 },
    bloom: { intensity: 0.22, intensityReading: 0.32, threshold: 1.22, smoothing: 0.14, radius: 0.22 },
    dof: null,
    vignette: true
  },
  cinematic: {
    dpr: [1, 1.55],
    multisampling: 0,
    searchDebounceMs: 180,
    starCount: 280000,
    starPointScale: 55,
    starPointMax: 12,
    starPixelRatioCap: 1.35,
    twinkleAmplitude: 0.007,
    deepFieldCount: 11000,
    deepFieldOpacity: 0.12,
    nebulaCount: 220000,
    nebula: { opacity: 0.034, baseSize: 0.33, maxSize: 2.85, pixelRatioCap: 1.25 },
    bloom: { intensity: 0.28, intensityReading: 0.42, threshold: 1.16, smoothing: 0.16, radius: 0.28 },
    dof: { focusDistance: 0.018, focalLength: 0.02, bokehScale: 0.9, height: 720 },
    vignette: true
  }
};
