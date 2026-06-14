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
    starPointScale: 48,
    starPointMax: 11,
    starPixelRatioCap: 1,
    twinkleAmplitude: 0.015,
    deepFieldCount: 1800,
    deepFieldOpacity: 0.12,
    nebulaCount: 18000,
    nebula: { opacity: 0.024, baseSize: 0.34, maxSize: 2.8, pixelRatioCap: 1 },
    bloom: null,
    dof: null,
    vignette: false
  },
  balanced: {
    dpr: [1, 1.35],
    multisampling: 0,
    searchDebounceMs: 180,
    starCount: 120000,
    starPointScale: 54,
    starPointMax: 13,
    starPixelRatioCap: 1.35,
    twinkleAmplitude: 0.02,
    deepFieldCount: 3600,
    deepFieldOpacity: 0.16,
    nebulaCount: 42000,
    nebula: { opacity: 0.03, baseSize: 0.38, maxSize: 3.4, pixelRatioCap: 1.25 },
    bloom: { intensity: 0.28, intensityReading: 0.34, threshold: 1.18, smoothing: 0.18, radius: 0.22 },
    dof: null,
    vignette: true
  },
  cinematic: {
    dpr: [1, 1.65],
    multisampling: 2,
    searchDebounceMs: 180,
    starCount: 150000,
    starPointScale: 58,
    starPointMax: 15,
    starPixelRatioCap: 1.55,
    twinkleAmplitude: 0.025,
    deepFieldCount: 5600,
    deepFieldOpacity: 0.18,
    nebulaCount: 82000,
    nebula: { opacity: 0.034, baseSize: 0.42, maxSize: 3.8, pixelRatioCap: 1.45 },
    bloom: { intensity: 0.34, intensityReading: 0.42, threshold: 1.2, smoothing: 0.2, radius: 0.26 },
    dof: { focusDistance: 0.016, focalLength: 0.024, bokehScale: 1.25, height: 720 },
    vignette: true
  }
};
