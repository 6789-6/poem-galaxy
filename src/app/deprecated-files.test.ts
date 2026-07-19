import { describe, expect, it } from 'vitest';

const sourceFiles = import.meta.glob('../**/*', { query: '?raw', import: 'default' });

const removed = [
  '../app-entry.tsx',
  '../globe-entry.tsx',
  '../v2-entry.tsx',
  '../research-entry.tsx',
  '../App.tsx',
  '../AppEnhanced.tsx',
  '../AppResearch.tsx',
  '../PoemGalaxyVideoClone.tsx',
  '../PoetryGlobeApp.tsx',
  '../PoetryGlobeAppFloating.tsx',
  '../PoetryGlobeScene.tsx',
  '../PoetryGlobeSceneFull.tsx',
  '../components/CenterBurstOverlay.tsx',
  '../components/FocusedPoetBurst.tsx',
  '../components/FocusedPoetBurstOverlay.tsx',
  '../components/GalaxyScene.tsx',
  '../components/GalaxySceneClean.tsx',
  '../components/GalaxySceneResearchLite.tsx',
  '../components/GpuStarfield.tsx',
  '../components/Hud.tsx',
  '../components/NebulaClouds.tsx',
  '../components/NebulaShells.tsx',
  '../components/PoetBurstCloud.tsx',
  '../components/PoetryPanel.tsx',
  '../components/SceneEffects.tsx',
  '../config/renderPresets.ts',
  '../lib/galaxy.ts',
  '../runtime/preloadRecover.ts',
  '../data/poetry.ts',
  '../data/expandedPoetry.ts',
  '../data/massPoetryData.ts',
  '../data/canonicalPoemDetails.ts',
  '../data/installExpandedPoetry.ts',
  '../observatory.css',
  '../poetry-globe-floating.css',
  '../poetry-globe-pro.css',
  '../poetry-globe.css',
  '../quality.css',
  '../reference-video.css',
  '../styles.css',
  '../video.css'
];

describe('single production generation', () => {
  it.each(removed)('removes %s', (relativePath) => {
    expect(relativePath in sourceFiles).toBe(false);
  });
});
