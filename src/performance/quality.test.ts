import { describe, expect, it } from 'vitest';
import { chooseInitialQuality, demoteQuality } from './quality';

describe('quality policy', () => {
  it('uses performance for reduced motion or mobile', () => {
    expect(chooseInitialQuality({ reducedMotion: true, mobile: false, hardwareConcurrency: 16, devicePixelRatio: 1 })).toBe('performance');
    expect(chooseInitialQuality({ reducedMotion: false, mobile: true, hardwareConcurrency: 8, devicePixelRatio: 2 })).toBe('performance');
  });

  it('uses cinematic only for capable desktop devices', () => {
    expect(chooseInitialQuality({ reducedMotion: false, mobile: false, hardwareConcurrency: 12, devicePixelRatio: 1.5 })).toBe('cinematic');
  });

  it('demotes but never promotes', () => {
    expect(demoteQuality('cinematic')).toBe('balanced');
    expect(demoteQuality('balanced')).toBe('performance');
    expect(demoteQuality('performance')).toBe('performance');
  });
});
