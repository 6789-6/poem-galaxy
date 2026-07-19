/// <reference types="vite/client" />

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import html from '../../index.html?raw';
import mainSource from '../main.tsx?raw';

describe('production entry', () => {
  it('loads only main.tsx', () => {
    expect(html).toContain('src="/src/main.tsx"');
    expect(html).not.toContain('globe-entry.tsx');
  });

  it('mounts PoemGalaxyApp', async () => {
    expect(mainSource).toContain('PoemGalaxyApp');
    const { PoemGalaxyApp } = await import('./PoemGalaxyApp');
    render(<PoemGalaxyApp />);
    expect(screen.getByTestId('poem-galaxy-app')).toBeInTheDocument();
  });
});
