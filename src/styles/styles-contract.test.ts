import { describe, expect, it } from 'vitest';
import tokens from './tokens.css?raw';
import layout from './cosmic-opera.css?raw';
import motion from './motion.css?raw';

describe('cosmic opera visual contract', () => {
  it('defines black, molten gold, and violet tokens', () => {
    expect(tokens).toContain('--void:');
    expect(tokens).toContain('--molten-gold:');
    expect(tokens).toContain('--energy-violet:');
    expect(tokens).not.toMatch(/cyan.*glass|purple-gradient/i);
  });

  it('contains desktop stage, mobile sheet, safe areas, and 44px targets', () => {
    expect(layout).toContain('.cosmic-stage');
    expect(layout).toContain('.mobile-sheet');
    expect(layout).toContain('env(safe-area-inset-bottom)');
    expect(layout).toMatch(/min-height:\s*44px/);
  });

  it('disables cinematic motion for reduced motion', () => {
    expect(motion).toContain('@media (prefers-reduced-motion: reduce)');
    expect(motion).toContain('.cinematic-intro');
  });

  it('keeps motion compositor-friendly and mobile surfaces contained', () => {
    expect(motion).not.toContain('letter-spacing');
    expect(layout).toContain('touch-action: manipulation');
    expect(layout).toContain('overscroll-behavior: contain');
    expect(layout).toContain('text-wrap: balance');
    expect(layout).toContain('env(safe-area-inset-left)');
    expect(layout).toContain('env(safe-area-inset-right)');
    expect(layout).toContain('@media (hover: hover)');
    expect(layout).toContain('.static-author:hover');
    expect(layout).toContain('overflow-wrap: anywhere');
  });
});
