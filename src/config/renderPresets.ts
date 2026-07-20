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
    searchDebounceMs: 260,
    starCount: 112000,
    starPointScale: 26,
    starPointMax: 2.8,
    starPixelRatioCap: 1,
    twinkleAmplitude: 0.003,
    deepFieldCount: 2200,
    deepFieldOpacity: 0.045,
    nebulaCount: 68000,
    nebula: { opacity: 0.018, baseSize: 0.13, maxSize: 0.82, pixelRatioCap: 1 },
    bloom: null,
    dof: null,
    vignette: false
  },
  balanced: {
    dpr: [1, 1.15],
    multisampling: 0,
    searchDebounceMs: 180,
    starCount: 150000,
    starPointScale: 28,
    starPointMax: 3.2,
    starPixelRatioCap: 1.08,
    twinkleAmplitude: 0.0035,
    deepFieldCount: 4200,
    deepFieldOpacity: 0.055,
    nebulaCount: 102000,
    nebula: { opacity: 0.02, baseSize: 0.145, maxSize: 0.96, pixelRatioCap: 1.05 },
    bloom: { intensity: 0.1, intensityReading: 0.14, threshold: 1.34, smoothing: 0.1, radius: 0.11 },
    dof: null,
    vignette: true
  },
  cinematic: {
    dpr: [1, 1.25],
    multisampling: 0,
    searchDebounceMs: 180,
    starCount: 178000,
    starPointScale: 30,
    starPointMax: 3.6,
    starPixelRatioCap: 1.12,
    twinkleAmplitude: 0.004,
    deepFieldCount: 6200,
    deepFieldOpacity: 0.065,
    nebulaCount: 136000,
    nebula: { opacity: 0.022, baseSize: 0.155, maxSize: 1.08, pixelRatioCap: 1.08 },
    bloom: { intensity: 0.13, intensityReading: 0.18, threshold: 1.31, smoothing: 0.11, radius: 0.13 },
    dof: null,
    vignette: true
  }
};
