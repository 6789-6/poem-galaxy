import { describe, expect, it } from 'vitest';
import workflow from '../../.github/workflows/deploy.yml?raw';
import vite from '../../vite.config.ts?raw';

describe('GitHub Pages deployment', () => {
  it('runs the complete non-browser gate before upload', () => {
    expect(workflow).toContain('npm ci --legacy-peer-deps --no-audit --no-fund');
    expect(workflow).toContain('npm run test');
    expect(workflow).toContain('npm run typecheck');
    expect(workflow).toContain('npm run data:verify');
    expect(workflow).toContain('npm run build');
    expect(workflow).toContain('npm run budget');
    expect(workflow.indexOf('npm run budget')).toBeLessThan(workflow.indexOf('actions/upload-pages-artifact'));
  });

  it('keeps the repository Pages base', () => {
    expect(vite).toContain("base: '/poem-galaxy/'");
  });
});
