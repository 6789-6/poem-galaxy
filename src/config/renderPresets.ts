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
    starCount: 100000,
    starPointScale: 42,
    starPointMax: 8,
    starPixelRatioCap: 1,
    twinkleAmplitude: 0.006,
    deepFieldCount: 3200,
    deepFieldOpacity: 0.1,
    nebulaCount: 36000,
    nebula: { opacity: 0.018, baseSize: 0.22, maxSize: 1.65, pixelRatioCap: 1 },
    bloom: null,
    dof: null,
    vignette: false
  },
  balanced: {
    dpr: [1, 1.35],
    multisampling: 0,
    searchDebounceMs: 180,
    starCount: 170000,
    starPointScale: 46,
    starPointMax: 9,
    starPixelRatioCap: 1.25,
    twinkleAmplitude: 0.008,
    deepFieldCount: 6200,
    deepFieldOpacity: 0.13,
    nebulaCount: 90000,
    nebula: { opacity: 0.021, baseSize: 0.24, maxSize: 1.9, pixelRatioCap: 1.15 },
    bloom: { intensity: 0.16, intensityReading: 0.2, threshold: 1.28, smoothing: 0.12, radius: 0.16 },
    dof: null,
    vignette: true
  },
  cinematic: {
    dpr: [1, 1.55],
    multisampling: 0,
    searchDebounceMs: 180,
    starCount: 240000,
    starPointScale: 48,
    starPointMax: 10,
    starPixelRatioCap: 1.35,
    twinkleAmplitude: 0.01,
    deepFieldCount: 9000,
    deepFieldOpacity: 0.15,
    nebulaCount: 160000,
    nebula: { opacity: 0.022, baseSize: 0.25, maxSize: 2.05, pixelRatioCap: 1.25 },
    bloom: { intensity: 0.18, intensityReading: 0.24, threshold: 1.3, smoothing: 0.13, radius: 0.18 },
    dof: { focusDistance: 0.018, focalLength: 0.02, bokehScale: 0.7, height: 720 },
    vignette: true
  }
};
