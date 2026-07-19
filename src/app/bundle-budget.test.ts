import { describe, expect, it } from 'vitest';
import vite from '../../vite.config.ts?raw';
import stage from '../scene/CosmicOperaStage.tsx?raw';
import boundary from '../ui/SceneBoundary.tsx?raw';

const scripts = import.meta.glob('../../scripts/*.mjs', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;

describe('production bundle budget', () => {
  it('emits a Vite manifest and checks only the static entry graph', () => {
    expect(vite).toContain('manifest: true');
    const checker = scripts['../../scripts/check-bundle-budget.mjs'];
    expect(checker).toContain('chunk.imports');
    expect(checker).not.toContain('chunk.dynamicImports');
    expect(checker).toContain('700 * 1024');
    expect(checker).toContain('250 * 1024');
  });

  it('keeps the WebGL runtime behind the lazy scene boundary', () => {
    expect(boundary).not.toContain('@react-three/fiber');
    expect(stage).toContain("from './WebglContextGuard'");
  });
});
