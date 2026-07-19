import { describe, expect, it } from 'vitest';
import html from '../../index.html?raw';
import app from './PoemGalaxyApp.tsx?raw';

describe('document metadata', () => {
  it('describes the black-gold poetry galaxy', () => {
    expect(html).toContain('<title>诗云 · 黑金宇宙歌剧</title>');
    expect(html).toContain('沉浸式中国古典诗歌三维宇宙');
    expect(html).toContain('name="theme-color" content="#020204"');
    expect(html).toContain('src="/src/main.tsx"');
  });

  it('uses a typographic ellipsis for loading copy', () => {
    expect(app).toContain('正在载入诗词星河…');
    expect(app).toContain('星图构建中…');
    expect(app).not.toContain('正在载入诗词星河\'');
  });
});
