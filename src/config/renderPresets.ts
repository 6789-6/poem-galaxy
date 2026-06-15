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
    starCount: 105000,
    starPointScale: 30,
    starPointMax: 3.6,
    starPixelRatioCap: 1,
    twinkleAmplitude: 0.004,
    deepFieldCount: 2600,
    deepFieldOpacity: 0.06,
    nebulaCount: 50000,
    nebula: { opacity: 0.02, baseSize: 0.18, maxSize: 1.25, pixelRatioCap: 1 },
    bloom: null,
    dof: null,
    vignette: false
  },
  balanced: {
    dpr: [1, 1.3],
    multisampling: 0,
    searchDebounceMs: 180,
    starCount: 190000,
    starPointScale: 34,
    starPointMax: 4.2,
    starPixelRatioCap: 1.15,
    twinkleAmplitude: 0.005,
    deepFieldCount: 6200,
    deepFieldOpacity: 0.075,
    nebulaCount: 120000,
    nebula: { opacity: 0.022, baseSize: 0.2, maxSize: 1.45, pixelRatioCap: 1.1 },
    bloom: { intensity: 0.16, intensityReading: 0.24, threshold: 1.28, smoothing: 0.12, radius: 0.18 },
    dof: null,
    vignette: true
  },
  cinematic: {
    dpr: [1, 1.45],
    multisampling: 0,
    searchDebounceMs: 180,
    starCount: 260000,
    starPointScale: 36,
    starPointMax: 4.8,
    starPixelRatioCap: 1.2,
    twinkleAmplitude: 0.006,
    deepFieldCount: 9000,
    deepFieldOpacity: 0.085,
    nebulaCount: 190000,
    nebula: { opacity: 0.024, baseSize: 0.21, maxSize: 1.65, pixelRatioCap: 1.15 },
    bloom: { intensity: 0.18, intensityReading: 0.28, threshold: 1.25, smoothing: 0.13, radius: 0.2 },
    dof: { focusDistance: 0.018, focalLength: 0.018, bokehScale: 0.55, height: 720 },
    vignette: true
  }
};
