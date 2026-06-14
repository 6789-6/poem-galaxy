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
    starCount: 85000,
    starPointScale: 54,
    starPointMax: 16,
    starPixelRatioCap: 1,
    twinkleAmplitude: 0.06,
    deepFieldCount: 1200,
    deepFieldOpacity: 0.18,
    nebulaCount: 9000,
    nebula: { opacity: 0.018, baseSize: 0.52, maxSize: 4.2, pixelRatioCap: 1 },
    bloom: null,
    dof: null,
    vignette: false
  },
  balanced: {
    dpr: [1, 1.35],
    multisampling: 0,
    searchDebounceMs: 180,
    starCount: 120000,
    starPointScale: 62,
    starPointMax: 20,
    starPixelRatioCap: 1.35,
    twinkleAmplitude: 0.08,
    deepFieldCount: 2200,
    deepFieldOpacity: 0.24,
    nebulaCount: 14000,
    nebula: { opacity: 0.028, baseSize: 0.58, maxSize: 5.0, pixelRatioCap: 1.35 },
    bloom: { intensity: 0.42, intensityReading: 0.52, threshold: 1.04, smoothing: 0.14, radius: 0.34 },
    dof: null,
    vignette: true
  },
  cinematic: {
    dpr: [1, 1.75],
    multisampling: 4,
    searchDebounceMs: 180,
    starCount: 150000,
    starPointScale: 70,
    starPointMax: 22,
    starPixelRatioCap: 1.75,
    twinkleAmplitude: 0.1,
    deepFieldCount: 3200,
    deepFieldOpacity: 0.28,
    nebulaCount: 20000,
    nebula: { opacity: 0.038, baseSize: 0.62, maxSize: 5.8, pixelRatioCap: 1.55 },
    bloom: { intensity: 0.56, intensityReading: 0.72, threshold: 1.06, smoothing: 0.18, radius: 0.46 },
    dof: { focusDistance: 0.016, focalLength: 0.026, bokehScale: 1.8, height: 720 },
    vignette: true
  }
};
