import { describe, expect, it } from 'vitest';
import {
  consumeVisibleFrameDelta,
  createVisibilityFrameTiming,
  setFrameVisibility
} from './scene-timing';

describe('visibility-aware frame timing', () => {
  it('discards hidden frames and the first frame after resume', () => {
    const timing = createVisibilityFrameTiming(false);
    expect(consumeVisibleFrameDelta(timing, 0.016)).toBe(0.016);

    setFrameVisibility(timing, true);
    expect(consumeVisibleFrameDelta(timing, 12)).toBeNull();

    setFrameVisibility(timing, false);
    expect(consumeVisibleFrameDelta(timing, 12)).toBeNull();
    expect(consumeVisibleFrameDelta(timing, 0.017)).toBe(0.017);
  });

  it('also discards the first visible frame when mounted hidden', () => {
    const timing = createVisibilityFrameTiming(true);

    setFrameVisibility(timing, false);

    expect(consumeVisibleFrameDelta(timing, 8)).toBeNull();
    expect(consumeVisibleFrameDelta(timing, 0.02)).toBe(0.02);
  });
});
