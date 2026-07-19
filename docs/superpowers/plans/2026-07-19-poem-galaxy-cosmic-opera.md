# 诗云「黑金宇宙歌剧」实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `poem-galaxy` 重构为单一生产入口的黑金宇宙歌剧视觉作品，保留完整诗词探索功能，接入 15,000—20,000 首可追溯古典诗词，并继续通过原 GitHub Pages 工作流发布。

**Architecture:** React reducer 维护总览、诗人、诗作、关系与巡游的唯一状态；React Three Fiber 场景被拆成独立图层，由相机导演消费状态。构建期导入并分片 MIT 诗词数据，运行时由同源数据客户端和 Web Worker 按需加载，WebGL 失败时复用同一状态与内容组件进入 DOM/CSS 静态星图。

**Tech Stack:** React 18、TypeScript 5.6、Vite 5、Three.js 0.167、React Three Fiber 8、Drei 9、Postprocessing、Vitest、Testing Library、Playwright、Web Worker、GitHub Actions、GitHub Pages

## Global Constraints

- 实施目录固定为 `D:/onely things/workflow/纯前端项目/poem-galaxy`，分支固定为 `aho/poem-galaxy-cosmic-opera`。
- 视觉固定为「黑金宇宙歌剧」：极深黑、熔金、紫色能量、巨大吸积盘、电影化标题、克制 HUD。
- 保留搜索、朝代筛选、诗人星域、诗作阅读、关系网络、巡游模式、`Escape` 层级返回和 `H` 隐藏界面。
- 桌面提供 `cinematic`、`balanced`、`performance` 三档；移动默认 `performance`，但功能完整。
- 古典诗词固定使用 `chinese-poetry/chinese-poetry` MIT 数据，提交为 `b8594f81a89752241442f2ce267d6f66f96704ee`。
- 标准化语料不少于 15,000 首、不多于 20,000 首，且至少包含 1,000 位有作品关联的作者。
- 近现代诗只保留题名、作者与主题索引，不导入未经明确授权的全文。
- 关系必须包含 `type` 与 `sourceLabel`；没有来源的旧关系不得迁移为历史关系。
- 运行时资源路径必须通过 `import.meta.env.BASE_URL` 生成，Vite `base` 保持 `/poem-galaxy/`。
- 首次加载压缩 JavaScript 不超过 700 KiB；精选数据压缩后不超过 250 KiB。
- 1440p `cinematic` 目标稳定 50 FPS 以上；移动端 `performance` 目标稳定 30 FPS 以上。
- `prefers-reduced-motion: reduce` 下跳过电影开场、持续镜头和高成本后期。
- Canvas 外保留语义导航、搜索和内容面板；移动触控目标不小于 44 CSS 像素。
- 数据和统计来自生成的 `manifest.json`，不得硬编码夸大数字。
- 实施前使用 `frontend-design`；修复缺陷时使用 `superpowers:test-driven-development`；完成前使用 `web-design-guidelines`、`vercel-react-best-practices` 和 `superpowers:verification-before-completion`。
- 只提交本项目文件；`.superpowers/`、`node_modules/`、`dist/`、Playwright 截图和上游缓存不得提交。

---

## File Structure

**Create**

- `vitest.config.ts`、`playwright.config.ts`、`src/test/setup.ts` — 自动化测试基线。
- `src/app/PoemGalaxyApp.tsx`、`src/state/galaxy-reducer.ts` — 唯一应用入口和状态机。
- `src/data/schema.ts`、`src/data/featured-seed.ts`、`src/data/import/normalize.ts` — 数据合同与构建期规范化。
- `scripts/import-poetry-data.ts`、`scripts/verify-data-artifacts.ts` — 固定数据源导入与验证。
- `public/data/manifest.json`、`featured.json`、`authors.json`、`search-index.json`、`poems/*.json` — 静态分片。
- `THIRD_PARTY_NOTICES.md` — 上游来源、提交和 MIT License。
- `src/data/base-url.ts`、`src/data/client.ts` — Pages 安全 URL 与缓存客户端。
- `src/workers/search-protocol.ts`、`search.worker.ts`、`search-core.ts` — Worker 搜索。
- `src/performance/quality.ts`、`use-adaptive-quality.ts` — 初始档位与单向降档。
- `src/scene/CosmicOperaScene.tsx`、`CosmicOperaStage.tsx`、`scene-contract.ts`、`geometry/poetry-layout.ts` — 懒加载 Canvas、场景组合与确定性坐标。
- `src/scene/layers/AccretionDisk.tsx`、`DynastyBands.tsx`、`PoetStars.tsx`、`PoemDust.tsx`、`RelationArcs.tsx` — 视觉图层。
- `src/scene/CameraDirector.tsx`、`ScenePostProcessing.tsx` — 镜头和按档位后期。
- `src/ui/CinematicIntro.tsx`、`DynastyNavigator.tsx`、`GlobalSearch.tsx`、`FocusPanel.tsx`、`ModeDock.tsx`、`MobileSheet.tsx`、`SceneBoundary.tsx`、`StaticGalaxy.tsx` — 语义 UI 与回退。
- `src/styles/tokens.css`、`cosmic-opera.css`、`motion.css` — 唯一视觉系统。
- `tests/e2e/poem-galaxy.spec.ts`、`production-fallback.spec.ts` — 桌面、移动和失败验收。
- `scripts/check-bundle-budget.mjs` — gzip 包体预算。

**Modify**

- `index.html`、`src/main.tsx` — 唯一 `PoemGalaxyApp` 入口与 metadata。
- `package.json`、`package-lock.json`、`tsconfig.app.json`、`vite.config.ts` — 工具、Worker 和构建。
- `.github/workflows/deploy.yml` — Pages 上传前的测试、数据和预算门禁。
- `README.md`、`.gitignore` — 架构、数据来源、命令、部署和缓存忽略。

**Delete after parity tests pass**

- 入口与 App：`src/app-entry.tsx`、`globe-entry.tsx`、`v2-entry.tsx`、`research-entry.tsx`、`App.tsx`、`AppEnhanced.tsx`、`AppResearch.tsx`。
- 旧应用/场景：`PoemGalaxyVideoClone.tsx`、`PoetryGlobeApp.tsx`、`PoetryGlobeAppFloating.tsx`、`PoetryGlobeScene.tsx`、`PoetryGlobeSceneFull.tsx`。
- 旧 `src/components` 下的 Burst、GalaxyScene、GpuStarfield、Hud、Nebula、PoetryPanel、SceneEffects 文件。
- `src/config/renderPresets.ts`、`src/lib/galaxy.ts`、`src/runtime/preloadRecover.ts`。
- `src/data/poetry.ts`、`expandedPoetry.ts`、`massPoetryData.ts`、`canonicalPoemDetails.ts`、`installExpandedPoetry.ts`。
- 旧 `observatory.css`、`poetry-globe*.css`、`quality.css`、`reference-video.css`、`styles.css`、`video.css`。

---

### Task 1: Install the verification harness and establish one production entry

**Files:**

- Modify: `package.json`、`package-lock.json`、`index.html`、`src/main.tsx`
- Create: `vitest.config.ts`、`src/test/setup.ts`、`src/app/app-entry.test.tsx`、`src/app/PoemGalaxyApp.tsx`

**Interfaces:**

- Consumes: existing `PoetryGlobeAppFloating` as a temporary compatibility child.
- Produces: `PoemGalaxyApp(): JSX.Element`, a single `/src/main.tsx` entry, and `npm test`.

- [ ] **Step 1: Install locked dependencies and record the baseline**

Run:

~~~powershell
npm ci --legacy-peer-deps --no-audit --no-fund
npm run check
~~~

Expected: dependency installation succeeds; pre-change typecheck and build exit 0. If the installed baseline fails, capture the exact error and repair only that baseline defect before continuing.

- [ ] **Step 2: Add test dependencies and scripts**

Run:

~~~powershell
npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test @axe-core/playwright tsx
~~~

Set these scripts in `package.json`:

~~~json
{
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "vite build",
    "typecheck": "tsc -b --noEmit",
    "preview": "vite preview --host 0.0.0.0",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "data:import": "tsx scripts/import-poetry-data.ts",
    "data:verify": "tsx scripts/verify-data-artifacts.ts",
    "budget": "node scripts/check-bundle-budget.mjs",
    "check": "npm run test && npm run typecheck && npm run data:verify && npm run build && npm run budget"
  }
}
~~~

- [ ] **Step 3: Create the Vitest baseline**

Create `vitest.config.ts`:

~~~ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: true
  }
});
~~~

Create `src/test/setup.ts`:

~~~ts
import '@testing-library/jest-dom/vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false
  })
});
~~~

- [ ] **Step 4: Write the failing single-entry contract**

Create `src/app/app-entry.test.tsx`:

~~~tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import html from '../../index.html?raw';
import mainSource from '../main.tsx?raw';

vi.mock('../PoetryGlobeAppFloating', () => ({
  PoetryGlobeAppFloating: () => <div data-testid="legacy-globe" />
}));

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
~~~

- [ ] **Step 5: Verify RED**

Run:

~~~powershell
npm test -- src/app/app-entry.test.tsx
~~~

Expected: FAIL because `index.html` still loads `globe-entry.tsx` and `PoemGalaxyApp.tsx` does not exist.

- [ ] **Step 6: Add the compatibility shell and switch the entry**

Create `src/app/PoemGalaxyApp.tsx`:

~~~tsx
import { PoetryGlobeAppFloating } from '../PoetryGlobeAppFloating';

export function PoemGalaxyApp() {
  return (
    <div data-testid="poem-galaxy-app">
      <PoetryGlobeAppFloating />
    </div>
  );
}
~~~

Replace `src/main.tsx`:

~~~tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { PoemGalaxyApp } from './app/PoemGalaxyApp';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root mount point');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <PoemGalaxyApp />
  </React.StrictMode>
);
~~~

Change `index.html`:

~~~html
<script type="module" src="/src/main.tsx"></script>
~~~

- [ ] **Step 7: Verify GREEN and commit**

Run:

~~~powershell
npm test -- src/app/app-entry.test.tsx
npm run typecheck
npm run build
git add -- package.json package-lock.json vitest.config.ts src/test/setup.ts src/app/app-entry.test.tsx src/app/PoemGalaxyApp.tsx src/main.tsx index.html
git commit -m "test: establish poem galaxy application shell"
~~~

Expected: focused tests, typecheck, and build exit 0; `dist/` is not staged.

---

### Task 2: Lock the runtime data schema

**Files:**

- Create: `src/data/schema.ts`
- Create: `src/data/schema.test.ts`

**Interfaces:**

- Produces: `DynastyId`, `AuthorRecord`, `PoemRecord`, `RelationRecord`, `DataManifest`, `FeaturedCorpus`, and `parseManifest(value): DataManifest`.
- Consumes: no application code; every later data, state, scene, and UI task uses these names.

- [ ] **Step 1: Write the failing schema tests**

Create `src/data/schema.test.ts`:

~~~ts
import { describe, expect, it } from 'vitest';
import { parseManifest } from './schema';

const valid = {
  version: 1,
  source: {
    repository: 'chinese-poetry/chinese-poetry',
    commit: 'b8594f81a89752241442f2ce267d6f66f96704ee',
    license: 'MIT'
  },
  counts: { authors: 1200, poems: 18006, classicalPoems: 18000, relations: 24 },
  featuredPath: 'featured.json',
  authorsPath: 'authors.json',
  searchIndexPath: 'search-index.json',
  poemShards: [
    { id: 'tang-000', dynasty: 'tang', path: 'poems/tang-000.json', count: 500, checksum: 'abc123' }
  ]
};

describe('parseManifest', () => {
  it('accepts the pinned licensed corpus', () => {
    expect(parseManifest(valid)).toEqual(valid);
  });

  it.each([
    [{ ...valid, counts: { ...valid.counts, classicalPoems: 14999 } }, 'classical poem count'],
    [{ ...valid, counts: { ...valid.counts, classicalPoems: 20001 } }, 'classical poem count'],
    [{ ...valid, counts: { ...valid.counts, authors: 999 } }, 'author count'],
    [{ ...valid, source: { ...valid.source, license: 'NONE' } }, 'MIT']
  ])('rejects an invalid manifest', (input, message) => {
    expect(() => parseManifest(input)).toThrow(message);
  });
});
~~~

- [ ] **Step 2: Verify RED**

Run:

~~~powershell
npm test -- src/data/schema.test.ts
~~~

Expected: FAIL because `schema.ts` does not exist.

- [ ] **Step 3: Implement the schema and validator**

Create `src/data/schema.ts`:

~~~ts
export type DynastyId = 'pre-qin' | 'han-wei' | 'tang' | 'song' | 'yuan-ming-qing' | 'modern';

export interface AuthorRecord {
  id: string;
  name: string;
  dynasty: DynastyId;
  years?: string;
  summary?: string;
  themes: string[];
  poemShardIds: string[];
}

export interface PoemRecord {
  id: string;
  title: string;
  authorId: string;
  dynasty: DynastyId;
  form?: string;
  lines: string[];
  themes: string[];
  textAvailability?: 'full' | 'metadata-only';
}

export type RelationType = 'historical' | 'family' | 'literary' | 'theme-similarity';

export interface RelationRecord {
  fromId: string;
  toId: string;
  type: RelationType;
  sourceLabel: string;
  sourceUrl?: string;
}

export interface DataManifest {
  version: 1;
  source: {
    repository: 'chinese-poetry/chinese-poetry';
    commit: 'b8594f81a89752241442f2ce267d6f66f96704ee';
    license: 'MIT';
  };
  counts: { authors: number; poems: number; classicalPoems: number; relations: number };
  featuredPath: string;
  authorsPath: string;
  searchIndexPath: string;
  poemShards: Array<{
    id: string;
    dynasty: DynastyId;
    path: string;
    count: number;
    checksum: string;
  }>;
}

export interface FeaturedCorpus {
  authors: AuthorRecord[];
  poems: PoemRecord[];
  relations: RelationRecord[];
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function parseManifest(value: unknown): DataManifest {
  if (!record(value) || !record(value.source) || !record(value.counts) || !Array.isArray(value.poemShards)) {
    throw new Error('Invalid data manifest shape');
  }
  const poems = Number(value.counts.classicalPoems);
  const authors = Number(value.counts.authors);
  if (poems < 15000 || poems > 20000) throw new Error('Invalid classical poem count; expected 15000—20000');
  if (Number(value.counts.poems) < poems || Number(value.counts.poems) > 20000) throw new Error('Invalid total poem count');
  if (authors < 1000) throw new Error('Invalid author count; expected at least 1000');
  if (value.source.repository !== 'chinese-poetry/chinese-poetry') throw new Error('Unexpected source repository');
  if (value.source.commit !== 'b8594f81a89752241442f2ce267d6f66f96704ee') throw new Error('Unexpected source commit');
  if (value.source.license !== 'MIT') throw new Error('Source license must be MIT');
  return value as unknown as DataManifest;
}
~~~

- [ ] **Step 4: Verify GREEN and commit**

Run:

~~~powershell
npm test -- src/data/schema.test.ts
npm run typecheck
git add -- src/data/schema.ts src/data/schema.test.ts
git commit -m "feat: define poem galaxy data contracts"
~~~

Expected: test and typecheck exit 0.

---

### Task 3: Build the deterministic licensed poetry corpus

**Files:**

- Create: `src/data/featured-seed.ts`
- Create: `src/data/import/normalize.ts`
- Create: `src/data/import/normalize.test.ts`
- Create: `scripts/import-poetry-data.ts`
- Create: `scripts/verify-data-artifacts.ts`
- Create: `public/data/manifest.json`、`featured.json`、`authors.json`、`search-index.json`、`poems/*.json`
- Create: `THIRD_PARTY_NOTICES.md`
- Modify: `.gitignore`

**Interfaces:**

- Consumes: Task 2 schema and external sparse checkout `.cache/chinese-poetry`.
- Produces: `normalizeSourcePoem`, `selectCorpus`, `shardPoems`, committed artifacts, and `npm run data:verify`.

- [ ] **Step 1: Create the featured and sourced relation seed**

Create `src/data/featured-seed.ts`:

~~~ts
export interface SeedRelation {
  fromName: string;
  toName: string;
  type: 'historical' | 'family' | 'literary' | 'theme-similarity';
  sourceLabel: string;
}

export const FEATURED_AUTHOR_NAMES = [
  '屈原', '曹操', '陶渊明', '王勃', '孟浩然', '王维', '李白', '杜甫', '白居易', '元稹',
  '李商隐', '杜牧', '刘禹锡', '苏轼', '苏辙', '黄庭坚', '李清照', '辛弃疾', '陆游',
  '欧阳修', '王安石', '马致远', '纳兰性德', '龚自珍'
] as const;

export const CURATED_RELATIONS: SeedRelation[] = [
  { fromName: '李白', toName: '杜甫', type: 'literary', sourceLabel: '杜甫《春日忆李白》《赠李白》等唱和作品' },
  { fromName: '元稹', toName: '白居易', type: 'literary', sourceLabel: '元白诗派及两人唱和作品' },
  { fromName: '苏轼', toName: '苏辙', type: 'family', sourceLabel: '苏轼与苏辙为兄弟' }
];

export const CURATED_THEMES: Record<string, string[]> = {
  '李白': ['月', '酒', '山河', '豪放'],
  '杜甫': ['家国', '现实', '秋', '长安'],
  '苏轼': ['月', '江河', '人生', '豪放'],
  '李清照': ['离愁', '秋', '女性书写', '婉约'],
  '辛弃疾': ['家国', '豪放', '灯火', '军旅']
};

export const MODERN_WORKS_METADATA = [
  { author: '徐志摩', title: '再别康桥', themes: ['离别', '康桥', '新月派'] },
  { author: '闻一多', title: '死水', themes: ['现实', '象征', '新格律诗'] },
  { author: '戴望舒', title: '雨巷', themes: ['江南', '雨', '象征'] },
  { author: '艾青', title: '大堰河——我的保姆', themes: ['土地', '母性', '现实'] },
  { author: '穆旦', title: '赞美', themes: ['土地', '战争', '现代主义'] },
  { author: '海子', title: '面朝大海，春暖花开', themes: ['大海', '生活', '祝福'] }
] as const;
~~~

During implementation, resolve `fromName` and `toName` through the generated author-name map and emit hashed `fromId` / `toId` values. Drop a relation if either endpoint is absent; never invent a replacement endpoint. Convert `MODERN_WORKS_METADATA` to `PoemRecord` values with `dynasty: 'modern'`, `lines: []`, and `textAvailability: 'metadata-only'`; titles and themes may enter the search index, but no modern poem text may enter any artifact.

- [ ] **Step 2: Write failing normalization tests**

Create `src/data/import/normalize.test.ts`:

~~~ts
import { describe, expect, it } from 'vitest';
import { inferThemes, normalizeSourcePoem, resolveRelations, selectCorpus, shardPoems } from './normalize';

describe('poetry normalization', () => {
  it('normalizes source rows and blocks modern full text', () => {
    expect(normalizeSourcePoem({
      author: '李白',
      title: '静夜思',
      paragraphs: ['床前明月光，', '疑是地上霜。']
    }, 'tang')).toMatchObject({
      title: '静夜思',
      dynasty: 'tang',
      lines: ['床前明月光，', '疑是地上霜。']
    });
    expect(normalizeSourcePoem({ author: '李白', title: '', paragraphs: ['句'] }, 'tang')).toBeNull();
    expect(normalizeSourcePoem({ author: '徐志摩', title: '再别康桥', paragraphs: ['全文'] }, 'modern')).toBeNull();
  });

  it('deduplicates with stable order', () => {
    const repeated = Array.from({ length: 2 }, () => ({
      id: 'same', title: '静夜思', authorId: 'li-bai', dynasty: 'tang' as const,
      lines: ['床前明月光'], themes: []
    }));
    expect(selectCorpus(repeated, { tang: 10 })).toHaveLength(1);
  });

  it('creates shards no larger than 500', () => {
    const poems = Array.from({ length: 1001 }, (_, index) => ({
      id: 'p-' + index, title: '诗 ' + index, authorId: 'author', dynasty: 'tang' as const,
      lines: ['句'], themes: []
    }));
    expect(shardPoems(poems, 500).map((shard) => shard.length)).toEqual([500, 500, 1]);
  });

  it('resolves only sourced relations whose endpoints exist', () => {
    const authors = [
      { id: 'li-bai', name: '李白', dynasty: 'tang' as const, themes: [], poemShardIds: [] },
      { id: 'du-fu', name: '杜甫', dynasty: 'tang' as const, themes: [], poemShardIds: [] }
    ];
    const relations = resolveRelations([
      { fromName: '李白', toName: '杜甫', type: 'literary', sourceLabel: '杜甫《春日忆李白》' },
      { fromName: '李白', toName: '不存在', type: 'literary', sourceLabel: '不得输出' }
    ], authors);
    expect(relations).toEqual([{ fromId: 'li-bai', toId: 'du-fu', type: 'literary', sourceLabel: '杜甫《春日忆李白》' }]);
  });

  it('derives restrained themes from explicit text terms', () => {
    expect(inferThemes(['举头望明月', '低头思故乡'])).toEqual(['月', '思乡']);
  });
});
~~~

- [ ] **Step 3: Verify RED**

Run:

~~~powershell
npm test -- src/data/import/normalize.test.ts
~~~

Expected: FAIL because `normalize.ts` does not exist.

- [ ] **Step 4: Implement normalization and stable selection**

Create `src/data/import/normalize.ts`:

~~~ts
import type { SeedRelation } from '../featured-seed';
import type { AuthorRecord, DynastyId, PoemRecord, RelationRecord } from '../schema';

export interface SourcePoem {
  author?: unknown;
  title?: unknown;
  rhythmic?: unknown;
  paragraphs?: unknown;
  content?: unknown;
}

export function stableId(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function clean(value: unknown) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

export function normalizeAuthorName(value: unknown) {
  return clean(value) || '佚名';
}

export function normalizeSourcePoem(source: SourcePoem, dynasty: DynastyId): PoemRecord | null {
  if (dynasty === 'modern') return null;
  const author = normalizeAuthorName(source.author);
  const title = clean(source.title) || clean(source.rhythmic);
  const values = Array.isArray(source.paragraphs) ? source.paragraphs : Array.isArray(source.content) ? source.content : [];
  const lines = values.map(clean).filter(Boolean);
  if (!title || !lines.length) return null;
  const authorId = stableId(dynasty + ':' + author);
  const id = stableId(dynasty + ':' + author + ':' + title + ':' + lines.join(''));
  return { id, title, authorId, dynasty, lines, themes: inferThemes(lines), textAvailability: 'full' };
}

const THEME_RULES = [
  ['月', /月|婵娟/], ['酒', /酒|醉|樽/], ['思乡', /故乡|乡关|归乡|故园/],
  ['山河', /山|江|河|湖|海/], ['家国', /国|社稷|长安|边关/], ['离别', /别|送|孤帆/],
  ['田园', /田|园|柴门|桑麻/], ['秋', /秋|霜|落叶/], ['春', /春|花|东风/]
] as const;

export function inferThemes(lines: string[]) {
  const text = lines.join('');
  return THEME_RULES.filter(([, pattern]) => pattern.test(text)).map(([theme]) => theme).slice(0, 4);
}

export function selectCorpus(poems: PoemRecord[], quotas: Partial<Record<DynastyId, number>>) {
  const unique = new Map<string, PoemRecord>();
  for (const poem of poems) {
    const key = poem.authorId + '\u0000' + poem.title + '\u0000' + poem.lines.join('');
    if (!unique.has(key)) unique.set(key, poem);
  }
  const used = new Map<DynastyId, number>();
  return [...unique.values()]
    .sort((left, right) => stableId(left.id).localeCompare(stableId(right.id)))
    .filter((poem) => {
      const count = used.get(poem.dynasty) ?? 0;
      if (count >= (quotas[poem.dynasty] ?? 0)) return false;
      used.set(poem.dynasty, count + 1);
      return true;
    });
}

export function shardPoems(poems: PoemRecord[], size: number) {
  return Array.from({ length: Math.ceil(poems.length / size) }, (_, index) =>
    poems.slice(index * size, (index + 1) * size)
  );
}

export function resolveRelations(seeds: SeedRelation[], authors: AuthorRecord[]): RelationRecord[] {
  const byName = new Map(authors.map((author) => [author.name, author.id]));
  return seeds.flatMap((seed) => {
    const fromId = byName.get(seed.fromName);
    const toId = byName.get(seed.toName);
    if (!fromId || !toId || !seed.sourceLabel.trim()) return [];
    return [{ fromId, toId, type: seed.type, sourceLabel: seed.sourceLabel }];
  });
}
~~~

- [ ] **Step 5: Implement the importer and verifier**

Use these constants in `scripts/import-poetry-data.ts`:

~~~ts
const SOURCE_COMMIT = 'b8594f81a89752241442f2ce267d6f66f96704ee';
const QUOTAS = {
  'pre-qin': 400,
  'han-wei': 800,
  tang: 8000,
  song: 6500,
  'yuan-ming-qing': 2500
} as const;
const SHARD_SIZE = 500;
~~~

The importer must recursively read JSON only from `诗经`、`楚辞`、`曹操诗集`、`全唐诗`、`宋词`、`元曲`、`纳兰性德`. Infer `song` for `poet.song.*.json`, `tang` for `poet.tang.*.json`, and use directory mapping for other files. Every output file must be deterministic JSON with two-space indentation and a trailing newline.

Implement the file walk, dynasty inference, row extraction, and deterministic writer with this core:

~~~ts
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import type { DynastyId } from '../src/data/schema';

async function walkJson(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries
    .sort((left, right) => left.name.localeCompare(right.name, 'zh-CN'))
    .map((entry) => entry.isDirectory()
      ? walkJson(join(directory, entry.name))
      : Promise.resolve(extname(entry.name) === '.json' ? [join(directory, entry.name)] : [])));
  return nested.flat();
}

function inferDynasty(path: string): DynastyId {
  const file = basename(path);
  if (file.startsWith('poet.tang.')) return 'tang';
  if (file.startsWith('poet.song.')) return 'song';
  if (path.includes('诗经') || path.includes('楚辞')) return 'pre-qin';
  if (path.includes('曹操诗集')) return 'han-wei';
  if (path.includes('全唐诗')) return 'tang';
  if (path.includes('宋词')) return 'song';
  if (path.includes('元曲') || path.includes('纳兰性德')) return 'yuan-ming-qing';
  throw new Error('Unsupported poetry source path: ' + path);
}

function sourceRows(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    const candidate = value as Record<string, unknown>;
    for (const key of ['poems', 'content', 'items']) {
      if (Array.isArray(candidate[key])) return candidate[key] as unknown[];
    }
  }
  return [];
}

async function readRows(path: string) {
  const dynasty = inferDynasty(path);
  const rows = sourceRows(JSON.parse(await readFile(path, 'utf8')));
  return rows.map((row) => ({ dynasty, row }));
}

async function writeJson(path: string, value: unknown) {
  await writeFile(path, JSON.stringify(value, null, 2) + '\n', 'utf8');
}
~~~

While normalizing each row, retain `normalizeAuthorName(row.author)` in an importer-only map keyed by the generated `authorId`. Build authors from the selected poems and that map; aggregate each author's four most frequent inferred themes, let `CURATED_THEMES` override featured authors, and attach sorted shard IDs after sharding. Resolve `CURATED_RELATIONS` through the resulting name map. Generate the compact search index from author names, poem titles, themes, and at most one selected public-domain classical line per poem; never duplicate a complete poem, and index modern records by title/theme only. Each poem search entry includes its `authorId` and generated `shardPath` so a result can be opened without scanning every shard.

Use this checksum:

~~~ts
import { createHash } from 'node:crypto';

export function checksum(value: string) {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}
~~~

Create `scripts/verify-data-artifacts.ts`:

~~~ts
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import type { AuthorRecord, FeaturedCorpus, PoemRecord } from '../src/data/schema';
import { parseManifest } from '../src/data/schema';

const root = new URL('../public/data/', import.meta.url);
const readJson = async <T>(path: string) => JSON.parse(await readFile(new URL(path, root), 'utf8')) as T;
const manifest = parseManifest(await readJson<unknown>('manifest.json'));
if (manifest.poemShards.some((shard) => shard.count < 1 || shard.count > 500)) process.exit(1);

const poems: PoemRecord[] = [];
for (const shard of manifest.poemShards) {
  const raw = await readFile(new URL(shard.path, root), 'utf8');
  const records = JSON.parse(raw) as PoemRecord[];
  const actualChecksum = createHash('sha256').update(raw).digest('hex').slice(0, 16);
  if (records.length !== shard.count || actualChecksum !== shard.checksum) throw new Error('Invalid shard: ' + shard.path);
  poems.push(...records);
}

const authors = await readJson<AuthorRecord[]>('authors.json');
const featured = await readJson<FeaturedCorpus>('featured.json');
const authorIds = new Set(authors.map((author) => author.id));
const classicalPoems = poems.filter((poem) => poem.dynasty !== 'modern');
const modernPoems = poems.filter((poem) => poem.dynasty === 'modern');
if (authors.length !== manifest.counts.authors || poems.length !== manifest.counts.poems) throw new Error('Manifest counts do not match artifacts');
if (classicalPoems.length !== manifest.counts.classicalPoems || classicalPoems.some((poem) => poem.lines.length === 0)) throw new Error('Invalid classical poem count or text');
if (modernPoems.some((poem) => poem.lines.length > 0 || poem.textAvailability !== 'metadata-only')) throw new Error('Modern records must be metadata only');
if (featured.relations.some((relation) => !relation.sourceLabel.trim() || !authorIds.has(relation.fromId) || !authorIds.has(relation.toId))) throw new Error('Invalid sourced relation');
console.log('Verified ' + manifest.counts.poems + ' poems, ' + manifest.counts.authors + ' authors');
~~~

- [ ] **Step 6: Acquire the pinned sparse source outside history**

Run:

~~~powershell
New-Item -ItemType Directory -Force '.cache' | Out-Null
git clone --filter=blob:none --no-checkout https://github.com/chinese-poetry/chinese-poetry.git .cache/chinese-poetry
git -C .cache/chinese-poetry sparse-checkout init --cone
git -C .cache/chinese-poetry sparse-checkout set 诗经 楚辞 曹操诗集 全唐诗 宋词 元曲 纳兰性德
git -C .cache/chinese-poetry checkout b8594f81a89752241442f2ce267d6f66f96704ee
git -C .cache/chinese-poetry rev-parse HEAD
~~~

Expected: final command prints the pinned commit. Add `.cache/` to `.gitignore`.

- [ ] **Step 7: Generate, verify, and attribute the corpus**

Run:

~~~powershell
npm run data:import -- --source .cache/chinese-poetry
npm run data:verify
npm test -- src/data/import/normalize.test.ts src/data/schema.test.ts
~~~

Expected: 15,000—20,000 classical poems, no more than 20,000 total work records, at least 1,000 authors, modern records containing zero lines, and shards no larger than 500.

Create `THIRD_PARTY_NOTICES.md` with the source URL, pinned commit, MIT license name, transformation description, and the exact upstream `LICENSE` text.

- [ ] **Step 8: Verify staged scope and commit**

Run:

~~~powershell
git diff --check
git add -- .gitignore src/data/featured-seed.ts src/data/import scripts/import-poetry-data.ts scripts/verify-data-artifacts.ts public/data THIRD_PARTY_NOTICES.md
git diff --cached --stat
git commit -m "feat: add licensed sharded poetry corpus"
~~~

Expected: `.cache/` is absent from the staged diff and verifier remains green.

---

### Task 4: Add the Pages-safe data client and Worker search

**Files:**

- Create: `src/data/base-url.ts`、`src/data/client.ts`、`src/data/client.test.ts`
- Create: `src/workers/search-protocol.ts`、`src/workers/search-core.ts`、`src/workers/search-core.test.ts`、`src/workers/search.worker.ts`

**Interfaces:**

- Produces: `dataUrl(path)`, `PoetryDataClient`, `SearchEntry`, `SearchHit`, `SearchRequest`, `SearchResponse`, `searchEntries(...)`, and `searchEntriesInBatches(...)`.
- Consumes: Task 2 schema and Task 3 artifact paths.

- [ ] **Step 1: Write failing URL, cache, and search tests**

Create `src/data/client.test.ts`:

~~~ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dataUrl } from './base-url';
import { PoetryDataClient } from './client';

describe('PoetryDataClient', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('keeps data under the GitHub Pages base', () => {
    expect(dataUrl('manifest.json', 'https://example.test', '/poem-galaxy/'))
      .toBe('https://example.test/poem-galaxy/data/manifest.json');
  });

  it('deduplicates in-flight shard requests', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify([])));
    const client = new PoetryDataClient(fetcher);
    await Promise.all([client.loadPoemShard('poems/tang-000.json'), client.loadPoemShard('poems/tang-000.json')]);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
~~~

Create `src/workers/search-core.test.ts`:

~~~ts
import { describe, expect, it } from 'vitest';
import { searchEntries, searchEntriesInBatches } from './search-core';

const entries = [
  { id: 'li-bai', kind: 'author' as const, title: '李白', subtitle: '唐', text: '月 酒 豪放' },
  { id: 'jing-ye-si', kind: 'poem' as const, authorId: 'li-bai', title: '静夜思', subtitle: '李白', text: '月 思乡' }
];

describe('searchEntries', () => {
  it('ranks exact titles before body matches', () => {
    expect(searchEntries(entries, '李白', 10).map((item) => item.id)).toEqual(['li-bai', 'jing-ye-si']);
  });
  it('returns an empty list for blank queries', () => {
    expect(searchEntries(entries, '   ', 10)).toEqual([]);
  });
  it('matches the yielding fallback result', async () => {
    expect(await searchEntriesInBatches(entries, '明月', 10, 1)).toEqual(searchEntries(entries, '明月', 10));
  });
});
~~~

- [ ] **Step 2: Verify RED**

Run:

~~~powershell
npm test -- src/data/client.test.ts src/workers/search-core.test.ts
~~~

Expected: FAIL because the client and search modules do not exist.

- [ ] **Step 3: Implement base URL and cached client**

Create `src/data/base-url.ts`:

~~~ts
export function dataUrl(path: string, origin = window.location.origin, base = import.meta.env.BASE_URL) {
  const normalized = path.replace(/^\/+/, '');
  return new URL(base.replace(/\/?$/, '/') + 'data/' + normalized, origin).toString();
}
~~~

Create `src/data/client.ts`:

~~~ts
import type { SearchEntry } from '../workers/search-protocol';
import type { AuthorRecord, DataManifest, FeaturedCorpus, PoemRecord } from './schema';
import { parseManifest } from './schema';
import { dataUrl } from './base-url';

export class DataLoadError extends Error {
  constructor(public path: string, public status?: number) {
    super('Unable to load poetry data: ' + path);
  }
}

export class PoetryDataClient {
  private cache = new Map<string, Promise<unknown>>();
  constructor(private fetcher: typeof fetch = fetch) {}

  private load<T>(path: string): Promise<T> {
    const existing = this.cache.get(path);
    if (existing) return existing as Promise<T>;
    const request = this.fetcher(dataUrl(path)).then(async (response) => {
      if (!response.ok) throw new DataLoadError(path, response.status);
      return response.json() as Promise<T>;
    });
    this.cache.set(path, request);
    request.catch(() => this.cache.delete(path));
    return request;
  }

  async loadManifest(): Promise<DataManifest> {
    return parseManifest(await this.load<unknown>('manifest.json'));
  }
  loadFeatured() { return this.load<FeaturedCorpus>('featured.json'); }
  loadAuthors() { return this.load<AuthorRecord[]>('authors.json'); }
  loadSearchIndex() { return this.load<SearchEntry[]>('search-index.json'); }
  loadPoemShard(path: string) { return this.load<PoemRecord[]>(path); }
}
~~~

- [ ] **Step 4: Implement the typed search core and Worker**

Create `src/workers/search-protocol.ts`:

~~~ts
export interface SearchEntry {
  id: string;
  kind: 'author' | 'poem';
  authorId?: string;
  shardPath?: string;
  title: string;
  subtitle: string;
  text: string;
}
export interface SearchHit {
  id: string;
  score: number;
}
export type SearchRequest = { type: 'init'; entries: SearchEntry[] } | { type: 'search'; requestId: number; query: string; limit: number };
export type SearchResponse = { type: 'ready' } | { type: 'results'; requestId: number; results: SearchHit[] };
~~~

Create `src/workers/search-core.ts`:

~~~ts
import type { SearchEntry, SearchHit } from './search-protocol';

const normalize = (value: string) => value.normalize('NFKC').toLowerCase().replace(/\s+/g, '');

function scoreEntry(entry: SearchEntry, needle: string): SearchHit | null {
  const title = normalize(entry.title);
  const subtitle = normalize(entry.subtitle);
  const text = normalize(entry.text);
  const score = title === needle ? 0 : title.includes(needle) ? 1 : subtitle.includes(needle) ? 2 : text.includes(needle) ? 3 : 99;
  return score < 99 ? { id: entry.id, score } : null;
}

function sortHits(hits: SearchHit[], limit: number) {
  return hits.sort((left, right) => left.score - right.score || left.id.localeCompare(right.id, 'zh-CN')).slice(0, limit);
}

export function searchEntries(entries: SearchEntry[], query: string, limit: number): SearchHit[] {
  const needle = normalize(query);
  if (!needle) return [];
  return sortHits(entries.map((entry) => scoreEntry(entry, needle)).filter((hit): hit is SearchHit => hit !== null), limit);
}

export async function searchEntriesInBatches(entries: SearchEntry[], query: string, limit: number, batchSize = 1000) {
  const needle = normalize(query);
  if (!needle) return [];
  const hits: SearchHit[] = [];
  for (let index = 0; index < entries.length; index += batchSize) {
    for (const entry of entries.slice(index, index + batchSize)) {
      const hit = scoreEntry(entry, needle);
      if (hit) hits.push(hit);
    }
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
  return sortHits(hits, limit);
}
~~~

Create `src/workers/search.worker.ts`:

~~~ts
import { searchEntries } from './search-core';
import type { SearchEntry, SearchRequest, SearchResponse } from './search-protocol';

let entries: SearchEntry[] = [];
self.onmessage = (event: MessageEvent<SearchRequest>) => {
  const message = event.data;
  if (message.type === 'init') {
    entries = message.entries;
    self.postMessage({ type: 'ready' } satisfies SearchResponse);
    return;
  }
  self.postMessage({
    type: 'results',
    requestId: message.requestId,
    results: searchEntries(entries, message.query, message.limit)
  } satisfies SearchResponse);
};
~~~

- [ ] **Step 5: Verify GREEN and commit**

Run:

~~~powershell
npm test -- src/data/client.test.ts src/workers/search-core.test.ts
npm run typecheck
git add -- src/data/base-url.ts src/data/client.ts src/data/client.test.ts src/workers
git commit -m "feat: add lazy poetry data and worker search"
~~~

Expected: tests and typecheck exit 0.

---

### Task 5: Implement the single state machine and adaptive quality policy

**Files:**

- Create: `src/state/galaxy-reducer.ts`
- Create: `src/state/galaxy-reducer.test.ts`
- Create: `src/performance/quality.ts`
- Create: `src/performance/quality.test.ts`
- Create: `src/performance/use-adaptive-quality.ts`

**Interfaces:**

- Produces: `GalaxyState`, `GalaxyAction`, `galaxyReducer`, `VisualQuality`, `chooseInitialQuality`, `demoteQuality`, and `useAdaptiveQuality`.
- Consumes: `DynastyId` from Task 2.

- [ ] **Step 1: Write failing reducer and quality tests**

Create `src/state/galaxy-reducer.test.ts`:

~~~ts
import { describe, expect, it } from 'vitest';
import { galaxyReducer, initialGalaxyState } from './galaxy-reducer';

describe('galaxyReducer', () => {
  it('follows overview to poet to poem and back by level', () => {
    const poet = galaxyReducer(initialGalaxyState, { type: 'SELECT_AUTHOR', authorId: 'li-bai' });
    const poem = galaxyReducer(poet, { type: 'SELECT_POEM', poemId: 'jing-ye-si', authorId: 'li-bai' });
    expect(poem.mode).toBe('poem');
    expect(galaxyReducer(poem, { type: 'BACK' })).toMatchObject({ mode: 'poet', selectedAuthorId: 'li-bai', selectedPoemId: null });
    expect(galaxyReducer(poet, { type: 'BACK' })).toMatchObject({ mode: 'overview', selectedAuthorId: null });
  });

  it('keeps the selected author for network and exits tour cleanly', () => {
    const poet = galaxyReducer(initialGalaxyState, { type: 'SELECT_AUTHOR', authorId: 'du-fu' });
    expect(galaxyReducer(poet, { type: 'ENTER_NETWORK' }).mode).toBe('network');
    const tour = galaxyReducer(initialGalaxyState, { type: 'START_TOUR' });
    expect(galaxyReducer(tour, { type: 'BACK' }).mode).toBe('overview');
  });
});
~~~

Create `src/performance/quality.test.ts`:

~~~ts
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
~~~

- [ ] **Step 2: Verify RED**

Run:

~~~powershell
npm test -- src/state/galaxy-reducer.test.ts src/performance/quality.test.ts
~~~

Expected: FAIL because reducer and quality modules do not exist.

- [ ] **Step 3: Implement the reducer**

Create `src/state/galaxy-reducer.ts`:

~~~ts
import type { DynastyId } from '../data/schema';

export type GalaxyMode = 'overview' | 'poet' | 'poem' | 'network' | 'tour';

export interface GalaxyState {
  mode: GalaxyMode;
  selectedAuthorId: string | null;
  selectedPoemId: string | null;
  activeDynasties: DynastyId[];
  hudVisible: boolean;
  tourIndex: number;
}

export type GalaxyAction =
  | { type: 'SELECT_AUTHOR'; authorId: string }
  | { type: 'SELECT_POEM'; poemId: string; authorId: string }
  | { type: 'SET_DYNASTIES'; dynasties: DynastyId[] }
  | { type: 'ENTER_NETWORK' }
  | { type: 'START_TOUR' }
  | { type: 'ADVANCE_TOUR'; index: number; authorId: string }
  | { type: 'TOGGLE_HUD' }
  | { type: 'BACK' }
  | { type: 'RESET' };

export const ALL_DYNASTIES: DynastyId[] = ['pre-qin', 'han-wei', 'tang', 'song', 'yuan-ming-qing', 'modern'];

export const initialGalaxyState: GalaxyState = {
  mode: 'overview',
  selectedAuthorId: null,
  selectedPoemId: null,
  activeDynasties: ALL_DYNASTIES,
  hudVisible: true,
  tourIndex: 0
};

export function galaxyReducer(state: GalaxyState, action: GalaxyAction): GalaxyState {
  switch (action.type) {
    case 'SELECT_AUTHOR':
      return { ...state, mode: 'poet', selectedAuthorId: action.authorId, selectedPoemId: null };
    case 'SELECT_POEM':
      return { ...state, mode: 'poem', selectedAuthorId: action.authorId, selectedPoemId: action.poemId };
    case 'SET_DYNASTIES':
      return action.dynasties.length ? { ...state, activeDynasties: action.dynasties } : state;
    case 'ENTER_NETWORK':
      return state.selectedAuthorId ? { ...state, mode: 'network' } : state;
    case 'START_TOUR':
      return { ...state, mode: 'tour', selectedPoemId: null, tourIndex: 0 };
    case 'ADVANCE_TOUR':
      return { ...state, mode: 'tour', tourIndex: action.index, selectedAuthorId: action.authorId, selectedPoemId: null };
    case 'TOGGLE_HUD':
      return { ...state, hudVisible: !state.hudVisible };
    case 'BACK':
      if (state.mode === 'poem') return { ...state, mode: 'poet', selectedPoemId: null };
      if (state.mode === 'poet' || state.mode === 'network') return { ...state, mode: 'overview', selectedAuthorId: null, selectedPoemId: null };
      return { ...initialGalaxyState, activeDynasties: state.activeDynasties, hudVisible: state.hudVisible };
    case 'RESET':
      return initialGalaxyState;
  }
}
~~~

- [ ] **Step 4: Implement the quality policy and one-way runtime demotion**

Create `src/performance/quality.ts`:

~~~ts
export type VisualQuality = 'performance' | 'balanced' | 'cinematic';
export interface QualitySignals {
  reducedMotion: boolean;
  mobile: boolean;
  hardwareConcurrency: number;
  devicePixelRatio: number;
}

export function chooseInitialQuality(signals: QualitySignals): VisualQuality {
  if (signals.reducedMotion || signals.mobile || signals.hardwareConcurrency <= 4) return 'performance';
  if (signals.hardwareConcurrency >= 8 && signals.devicePixelRatio <= 2) return 'cinematic';
  return 'balanced';
}

export function demoteQuality(quality: VisualQuality): VisualQuality {
  return quality === 'cinematic' ? 'balanced' : quality === 'balanced' ? 'performance' : 'performance';
}

export const QUALITY_PRESETS = {
  performance: { dpr: 1, poemParticles: 18000, backdropParticles: 1800, bloom: false, depthOfField: false, targetFps: 30 },
  balanced: { dpr: 1.25, poemParticles: 42000, backdropParticles: 3200, bloom: true, depthOfField: false, targetFps: 45 },
  cinematic: { dpr: 1.6, poemParticles: 72000, backdropParticles: 5200, bloom: true, depthOfField: true, targetFps: 50 }
} as const;
~~~

Create `src/performance/use-adaptive-quality.ts`:

~~~ts
import { useCallback, useRef, useState } from 'react';
import { chooseInitialQuality, demoteQuality, QUALITY_PRESETS } from './quality';

function initialQuality() {
  return chooseInitialQuality({
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    mobile: window.innerWidth <= 760,
    hardwareConcurrency: navigator.hardwareConcurrency || 4,
    devicePixelRatio: window.devicePixelRatio || 1
  });
}

export function useAdaptiveQuality() {
  const [quality, setQuality] = useState(initialQuality);
  const consecutiveLowSamples = useRef(0);

  const reportFps = useCallback((fps: number) => {
    setQuality((current) => {
      const belowTarget = fps < QUALITY_PRESETS[current].targetFps * 0.8;
      consecutiveLowSamples.current = belowTarget ? consecutiveLowSamples.current + 1 : 0;
      if (consecutiveLowSamples.current < 3) return current;
      consecutiveLowSamples.current = 0;
      return demoteQuality(current);
    });
  }, []);

  return { quality, reportFps };
}
~~~

This hook demotes only after three consecutive samples below 80% of the active target and never promotes automatically.

- [ ] **Step 5: Verify GREEN and commit**

Run:

~~~powershell
npm test -- src/state/galaxy-reducer.test.ts src/performance/quality.test.ts
npm run typecheck
git add -- src/state src/performance
git commit -m "feat: add unified galaxy state and quality policy"
~~~

Expected: tests and typecheck exit 0.

---

### Task 6: Build the black-gold scene geometry and independent layers

**Files:**

- Create: `src/scene/scene-contract.ts`
- Create: `src/scene/geometry/poetry-layout.ts`
- Create: `src/scene/geometry/poetry-layout.test.ts`
- Create: `src/scene/layers/AccretionDisk.tsx`、`DynastyBands.tsx`、`PoetStars.tsx`、`PoemDust.tsx`、`RelationArcs.tsx`
- Create: `src/scene/CameraDirector.tsx`、`src/scene/ScenePostProcessing.tsx`、`src/scene/CosmicOperaScene.tsx`、`src/scene/CosmicOperaStage.tsx`

**Interfaces:**

- Consumes: `GalaxyState`, `VisualQuality`, `AuthorRecord`, `PoemRecord`, and `RelationRecord`.
- Produces: `CosmicOperaScene(props: CosmicOperaSceneProps)`, a default-exported `CosmicOperaStage`, and deterministic `authorPosition(author)` / `poemPosition(poem, index)`.

- [ ] **Step 1: Invoke frontend-design and lock the bold direction**

Read `frontend-design/SKILL.md` completely. Record in the execution log:

~~~text
Direction: black-gold cosmic opera.
Memorable element: a huge tilted accretion disk whose molten core becomes the camera and navigation anchor.
Typography: Songti/Kaiti display and reading faces with a compact monospace HUD.
Avoid: generic cyan glass cards, full-screen dashboard chrome, uniform purple gradients, random mouse trails.
~~~

- [ ] **Step 2: Write failing deterministic layout tests**

Create `src/scene/geometry/poetry-layout.test.ts`:

~~~ts
import { describe, expect, it } from 'vitest';
import { authorPosition, poemPosition } from './poetry-layout';

const author = { id: 'li-bai', name: '李白', dynasty: 'tang' as const, themes: [], poemShardIds: [] };
const poem = { id: 'jing-ye-si', title: '静夜思', authorId: 'li-bai', dynasty: 'tang' as const, lines: ['床前明月光'], themes: [] };

describe('poetry spatial layout', () => {
  it('is deterministic and finite', () => {
    expect(authorPosition(author)).toEqual(authorPosition(author));
    expect(authorPosition(author).every(Number.isFinite)).toBe(true);
  });
  it('places a poem near but not on its author orbit', () => {
    expect(poemPosition(poem, 0)).not.toEqual(authorPosition(author));
    expect(poemPosition(poem, 0).every(Number.isFinite)).toBe(true);
  });
});
~~~

- [ ] **Step 3: Verify RED**

Run:

~~~powershell
npm test -- src/scene/geometry/poetry-layout.test.ts
~~~

Expected: FAIL because layout module does not exist.

- [ ] **Step 4: Implement deterministic dynasty bands**

Create `src/scene/geometry/poetry-layout.ts` with a fixed band table:

~~~ts
import type { AuthorRecord, DynastyId, PoemRecord } from '../../data/schema';

const BANDS: Record<DynastyId, { latitude: number; radius: number; phase: number }> = {
  'pre-qin': { latitude: 0.72, radius: 30, phase: -0.8 },
  'han-wei': { latitude: 0.44, radius: 34, phase: 0.4 },
  tang: { latitude: 0.12, radius: 40, phase: 1.05 },
  song: { latitude: -0.17, radius: 39, phase: -0.2 },
  'yuan-ming-qing': { latitude: -0.49, radius: 34, phase: 0.9 },
  modern: { latitude: -0.72, radius: 30, phase: -1.2 }
};

function hash01(value: string) {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

export function authorPosition(author: AuthorRecord): [number, number, number] {
  const band = BANDS[author.dynasty];
  const angle = band.phase + hash01(author.id + ':angle') * Math.PI * 2;
  const latitude = band.latitude + (hash01(author.id + ':latitude') - 0.5) * 0.18;
  const flat = Math.cos(latitude);
  return [Math.cos(angle) * flat * band.radius, Math.sin(latitude) * 24, Math.sin(angle) * flat * band.radius];
}

export function poemPosition(poem: PoemRecord, index: number): [number, number, number] {
  const band = BANDS[poem.dynasty];
  const angle = band.phase + hash01(poem.id) * Math.PI * 2 + index * 0.0007;
  const radius = band.radius * (0.62 + hash01(poem.id + ':radius') * 0.42);
  return [Math.cos(angle) * radius, (hash01(poem.id + ':height') - 0.5) * 19, Math.sin(angle) * radius * 0.72];
}
~~~

- [ ] **Step 5: Define the stable scene contract**

Create `src/scene/scene-contract.ts`:

~~~ts
import type { AuthorRecord, PoemRecord, RelationRecord } from '../data/schema';
import type { VisualQuality } from '../performance/quality';
import type { GalaxyState } from '../state/galaxy-reducer';

export interface CosmicOperaSceneProps {
  state: GalaxyState;
  quality: VisualQuality;
  authors: AuthorRecord[];
  loadedPoems: PoemRecord[];
  relations: RelationRecord[];
  onSelectAuthor: (authorId: string) => void;
  onSelectPoem: (poemId: string, authorId: string) => void;
  onFpsSample: (fps: number) => void;
}
~~~

- [ ] **Step 6: Implement the accretion disk and data layers**

Implement `AccretionDisk` with a `ringGeometry` using inner radius 8, outer radius 34, 256 segments, a custom shader that combines a molten gold core, violet outer energy, azimuth streaks, and time-based slow rotation. Render a black sphere at the core and two low-opacity tilted rings; no texture request is allowed.

Use this fragment color formula inside the shader:

~~~glsl
float radius = length(vUv - vec2(0.5)) * 2.0;
float streak = pow(max(0.0, sin(atan(vUv.y - 0.5, vUv.x - 0.5) * 34.0 - uTime * 0.18)), 8.0);
vec3 molten = mix(vec3(1.0, 0.35, 0.09), vec3(1.0, 0.88, 0.48), 1.0 - radius);
vec3 violet = vec3(0.38, 0.10, 0.95);
vec3 color = mix(molten, violet, smoothstep(0.45, 1.0, radius)) + streak * 0.22;
float alpha = (1.0 - smoothstep(0.76, 1.0, radius)) * smoothstep(0.02, 0.18, radius);
gl_FragColor = vec4(color, alpha);
~~~

Implement `DynastyBands` as six low-opacity orbital guides, `PoetStars` as clickable instanced spheres for featured authors, `PoemDust` as one `points` geometry capped by `QUALITY_PRESETS[quality].poemParticles`, and `RelationArcs` as line segments created only from supplied `RelationRecord[]`.

- [ ] **Step 7: Add camera and quality-gated postprocessing**

`CameraDirector` must interpolate from the current camera position to:

~~~ts
const CAMERA_TARGETS = {
  overview: { position: [0, 5, 92], lookAt: [0, 0, 0] },
  poet: { distance: 15 },
  poem: { distance: 10 },
  network: { distance: 24 },
  tour: { distance: 13 }
} as const;
~~~

Use `EffectComposer` and `Bloom` only when `QUALITY_PRESETS[quality].bloom` is true; add depth of field only for `cinematic` and only in poem focus mode. `performance` must render without a composer.

- [ ] **Step 8: Assemble the scene and verify**

`CosmicOperaScene` must render `AccretionDisk`, `DynastyBands`, `PoemDust`, `PoetStars`, `RelationArcs`, `CameraDirector`, `ScenePostProcessing`, ambient light, and a warm point light. It must report a rolling FPS sample every two seconds and pause nonessential time uniforms while `document.hidden` is true.

`CosmicOperaStage` owns `Canvas`, passes through the exact `CosmicOperaSceneProps`, and is a default export. In `PoemGalaxyApp`, load it at module scope with `lazy(() => import('../scene/CosmicOperaStage'))` and render it inside `Suspense` so Three.js, R3F, shaders, and postprocessing are excluded from the initial entry graph while the cinematic chunk loads.

Run:

~~~powershell
npm test -- src/scene/geometry/poetry-layout.test.ts
npm run typecheck
npm run build
git add -- src/scene
git commit -m "feat: build black gold cosmic opera scene"
~~~

Expected: layout test, typecheck, and build exit 0.

---

### Task 7: Compose the full search, dynasty, reading, network, and tour flow

**Files:**

- Modify: `src/app/PoemGalaxyApp.tsx`、`src/scene/CosmicOperaStage.tsx`
- Create: `src/ui/DynastyNavigator.tsx`、`GlobalSearch.tsx`、`FocusPanel.tsx`、`ModeDock.tsx`、`MobileSheet.tsx`
- Create: `src/ui/ui-flow.test.tsx`

**Interfaces:**

- Consumes: Tasks 3—6 data, reducer, quality, Worker, and scene contract.
- Produces: one complete `PoemGalaxyApp` with all approved modes and accessible DOM controls.

- [ ] **Step 1: Write failing UI flow tests with the Canvas mocked**

Create `src/ui/ui-flow.test.tsx`:

~~~tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PoemGalaxyApp } from '../app/PoemGalaxyApp';
import { PoetryDataClient } from '../data/client';

vi.mock('@react-three/fiber', () => ({ Canvas: ({ children }: { children: ReactNode }) => <div data-testid="canvas">{children}</div> }));
vi.mock('../scene/CosmicOperaScene', () => ({ CosmicOperaScene: () => <div data-testid="cosmic-scene" /> }));

function createTestClient() {
  const manifest = {
    version: 1,
    source: { repository: 'chinese-poetry/chinese-poetry', commit: 'b8594f81a89752241442f2ce267d6f66f96704ee', license: 'MIT' },
    counts: { authors: 1000, poems: 15000, classicalPoems: 15000, relations: 0 },
    featuredPath: 'featured.json', authorsPath: 'authors.json', searchIndexPath: 'search-index.json', poemShards: []
  };
  const featured = {
    authors: [{ id: 'li-bai', name: '李白', dynasty: 'tang', themes: ['月'], poemShardIds: [] }],
    poems: [{ id: 'jing-ye-si', title: '静夜思', authorId: 'li-bai', dynasty: 'tang', lines: ['床前明月光'], themes: ['月'] }],
    relations: []
  };
  const searchIndex = [
    { id: 'jing-ye-si', kind: 'poem', authorId: 'li-bai', title: '静夜思', subtitle: '李白', text: '月 思乡' },
    { id: 'chun-wang', kind: 'poem', authorId: 'du-fu', shardPath: 'poems/tang-001.json', title: '春望', subtitle: '杜甫', text: '家国 长安' }
  ];
  const payloads: Record<string, unknown> = {
    'manifest.json': manifest,
    'featured.json': featured,
    'search-index.json': searchIndex,
    'authors.json': [...featured.authors, { id: 'du-fu', name: '杜甫', dynasty: 'tang', themes: ['家国'], poemShardIds: ['tang-001'] }],
    'tang-001.json': [{ id: 'chun-wang', title: '春望', authorId: 'du-fu', dynasty: 'tang', lines: ['国破山河在'], themes: ['家国'] }]
  };
  const fetcher = (async (input: RequestInfo | URL) => {
    const file = new URL(String(input)).pathname.split('/').at(-1) ?? '';
    return new Response(JSON.stringify(payloads[file]), { status: file in payloads ? 200 : 404 });
  }) as typeof fetch;
  return new PoetryDataClient(fetcher);
}

describe('PoemGalaxyApp flow', () => {
  it('searches a poem, opens reading, and returns by Escape', async () => {
    const user = userEvent.setup();
    render(<PoemGalaxyApp client={createTestClient()} />);
    await user.type(await screen.findByRole('searchbox'), '静夜思');
    await user.click(await screen.findByRole('option', { name: /静夜思/ }));
    expect(await screen.findByRole('heading', { name: '静夜思' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(await screen.findByRole('heading', { name: /李白/ })).toBeInTheDocument();
  });

  it('keeps all six dynasty controls keyboard accessible', async () => {
    render(<PoemGalaxyApp client={createTestClient()} />);
    expect(await screen.findAllByRole('checkbox', { name: /先秦|汉魏六朝|唐|宋|元明清|近现代/ })).toHaveLength(6);
  });

  it('opens a non-featured poem through its indexed shard', async () => {
    const user = userEvent.setup();
    render(<PoemGalaxyApp client={createTestClient()} />);
    await user.type(await screen.findByRole('searchbox'), '春望');
    await user.click(await screen.findByRole('option', { name: /春望/ }));
    expect(await screen.findByRole('heading', { name: '春望' })).toBeInTheDocument();
    expect(screen.getByText('国破山河在')).toBeInTheDocument();
  });

  it('exposes network, tour, and HUD controls', async () => {
    render(<PoemGalaxyApp client={createTestClient()} />);
    expect(await screen.findByRole('button', { name: '关系网络' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '开始巡游' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '隐藏界面' })).toBeInTheDocument();
  });
});
~~~

- [ ] **Step 2: Verify RED**

Run:

~~~powershell
npm test -- src/ui/ui-flow.test.tsx
~~~

Expected: FAIL because the compatibility shell has no new semantic controls.

- [ ] **Step 3: Implement data boot and reducer composition**

Define `PoemGalaxyAppProps` as `{ client?: PoetryDataClient; forceStatic?: boolean }`, then replace the compatibility child in `PoemGalaxyApp` with this data boot. Injecting a client keeps tests deterministic while production creates one client for the application lifetime.

~~~tsx
export interface PoemGalaxyAppProps {
  client?: PoetryDataClient;
  forceStatic?: boolean;
}

// Inside PoemGalaxyApp({ client: providedClient, forceStatic = false }: PoemGalaxyAppProps):
const [state, dispatch] = useReducer(galaxyReducer, initialGalaxyState);
const [manifest, setManifest] = useState<DataManifest | null>(null);
const [featured, setFeatured] = useState<FeaturedCorpus | null>(null);
const [loadError, setLoadError] = useState<DataLoadError | null>(null);
const client = useMemo(() => providedClient ?? new PoetryDataClient(), [providedClient]);
const { quality, reportFps } = useAdaptiveQuality();

const boot = useCallback(() => {
  setLoadError(null);
  return Promise.all([client.loadManifest(), client.loadFeatured()])
    .then(([nextManifest, nextFeatured]) => {
      setManifest(nextManifest);
      setFeatured(nextFeatured);
    })
    .catch((error: DataLoadError) => setLoadError(error));
}, [client]);

useEffect(() => { void boot(); }, [boot]);
~~~

Render one live region for load/search/mode status. The retry button calls `void boot()`.

- [ ] **Step 4: Implement search and dynasty controls**

`GlobalSearch` must lazily fetch `search-index.json`, create the Worker with:

~~~ts
new Worker(new URL('../workers/search.worker.ts', import.meta.url), { type: 'module' });
~~~

If Worker creation or initialization fails, import `searchEntriesInBatches` and search the loaded compact index on the main thread in yielding batches. The Worker returns only `SearchHit` IDs and scores; `GlobalSearch` maps those hits back to its already-loaded compact entries for kind, author ID, labels, and `shardPath`. Search results use `role="listbox"` and `role="option"` and invoke the same app-level author/poem selection handlers as scene clicks.

The app-level selection handlers must follow this exact loading order:

1. For an author absent from `featured.authors`, call the cached `client.loadAuthors()` once and resolve the author by ID.
2. For a poem absent from the loaded poem map, require the selected search entry's `shardPath`, call `client.loadPoemShard(shardPath)`, and resolve the poem by ID.
3. Append resolved records to the existing maps, then dispatch `SELECT_AUTHOR` or `SELECT_POEM`.
4. On failure, keep the current reducer state, announce the `DataLoadError` in the live region, and expose a retry that reruns the same selection handler.

`DynastyNavigator` renders six labeled checkboxes and dispatches `SET_DYNASTIES` without allowing an empty selection.

- [ ] **Step 5: Implement focus, network, tour, and keyboard controls**

`FocusPanel` renders:

- author heading, years, summary, themes, representative poems, and sourced relations in poet/network modes;
- poem title, author, form, all loaded lines, themes, and a back button in poem mode; for `textAvailability: 'metadata-only'`, render the title/themes plus `仅提供题名与主题索引，不提供未经授权全文` and never synthesize lines;
- a retry control when a poem shard fails.

`ModeDock` renders buttons named `关系网络`, `开始巡游`, `隐藏界面`, and the current quality label. Add one window keydown listener: `Escape` dispatches `BACK` and `H` dispatches `TOGGLE_HUD` unless focus is inside an input or textarea.

Tour mode advances through featured authors every eight seconds, pauses while `document.hidden`, and stops immediately on `BACK`, direct search, or scene selection.

- [ ] **Step 6: Wire scene clicks and mobile sheet**

Render the lazy `CosmicOperaStage` with the exact Task 6 props inside a lightweight `Suspense` loading field. Desktop uses `FocusPanel`; a shared `useMediaQuery('(max-width: 760px)')` switches the same content model into `MobileSheet`. Do not duplicate reducer or fetch state.

- [ ] **Step 7: Verify GREEN and commit**

Run:

~~~powershell
npm test -- src/ui/ui-flow.test.tsx src/state/galaxy-reducer.test.ts
npm run typecheck
npm run build
git add -- src/app/PoemGalaxyApp.tsx src/ui
git commit -m "feat: connect complete poetry exploration flow"
~~~

Expected: UI flow, reducer, typecheck, and build exit 0.

---

### Task 8: Apply the production visual system, cinematic intro, mobile layout, and WebGL fallback

**Files:**

- Create: `src/ui/CinematicIntro.tsx`、`src/ui/SceneBoundary.tsx`、`src/ui/StaticGalaxy.tsx`
- Create: `src/styles/tokens.css`、`src/styles/cosmic-opera.css`、`src/styles/motion.css`
- Create: `src/styles/styles-contract.test.ts`
- Modify: `src/app/PoemGalaxyApp.tsx`

**Interfaces:**

- Consumes: Task 7 complete application state and content components.
- Produces: approved black-gold styling, one-session intro, reduced-motion behavior, mobile Sheet layout, and DOM/CSS fallback.

- [ ] **Step 1: Write failing style and fallback contracts**

Create `src/styles/styles-contract.test.ts`:

~~~ts
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
});
~~~

Add to `ui-flow.test.tsx`:

~~~tsx
it('keeps search and reading available in static fallback', async () => {
  render(<PoemGalaxyApp forceStatic client={createTestClient()} />);
  expect(await screen.findByTestId('static-galaxy')).toBeInTheDocument();
  expect(screen.getByRole('searchbox')).toBeInTheDocument();
});
~~~

- [ ] **Step 2: Verify RED**

Run:

~~~powershell
npm test -- src/styles/styles-contract.test.ts src/ui/ui-flow.test.tsx
~~~

Expected: FAIL because styles, intro, fallback, and `forceStatic` do not exist.

- [ ] **Step 3: Define exact visual tokens**

Create `src/styles/tokens.css`:

~~~css
:root {
  color-scheme: dark;
  --void: #020204;
  --void-raised: #09070d;
  --ink-panel: rgb(10 5 17 / 82%);
  --ivory: #fff5dc;
  --text: #eee8dc;
  --text-muted: #968e9e;
  --molten-gold: #f2bd60;
  --molten-white: #fff0bf;
  --flare-orange: #ff6f3c;
  --energy-violet: #7d32ef;
  --energy-soft: #b88aff;
  --line: rgb(255 232 190 / 16%);
  --focus: #ffd77c;
  --radius-panel: 1.5rem;
  --font-display: "Songti SC", "STSong", Georgia, serif;
  --font-reading: "KaiTi", "STKaiti", serif;
  --font-ui: "Microsoft YaHei", "PingFang SC", sans-serif;
  --font-hud: "IBM Plex Mono", "SFMono-Regular", monospace;
}
~~~

- [ ] **Step 4: Implement the stage and responsive layout**

`cosmic-opera.css` must make `.poem-galaxy-app` fixed to the viewport, `.cosmic-stage` fill the screen, title/metrics/era/search occupy the approved edges, and `.focus-panel` appear only after selection. At `max-width: 760px` hide the left era rail, show `.mobile-sheet`, lower blur, and keep all buttons at `min-height: 44px`.

Use this body atmosphere exactly:

~~~css
body {
  margin: 0;
  min-width: 320px;
  overflow: hidden;
  color: var(--text);
  background:
    radial-gradient(circle at 52% 46%, rgb(70 28 126 / 24%), transparent 36%),
    radial-gradient(circle at 44% 54%, rgb(255 102 52 / 10%), transparent 22%),
    var(--void);
  font-family: var(--font-ui);
}
~~~

- [ ] **Step 5: Add one-session intro and reduced motion**

`CinematicIntro` reads `sessionStorage.getItem('poem-galaxy:intro-seen')`. On desktop it runs for 3.6 seconds, offers a `跳过开场` button, and writes `'1'` when complete or skipped. On mobile it uses a 1-second fade. With reduced motion it writes the session value and renders nothing.

`motion.css` must disable intro, continuous transforms, smooth scrolling, and long transitions inside `prefers-reduced-motion: reduce`.

- [ ] **Step 6: Add static fallback without a second state tree**

`StaticGalaxy` accepts the same `state`, `authors`, and `relations` used by the 3D scene, renders six CSS orbital rings and featured author buttons, and uses the same `onSelectAuthor` callback. Add a `forceStatic?: boolean` test-only/app prop.

Implement `SceneBoundary` as a React error boundary with `onFail: () => void`; its `componentDidCatch` calls `onFail` and its fallback render returns `null` while the parent switches to `StaticGalaxy`. Also export a `WebglContextGuard` Canvas child that obtains `gl.domElement` through `useThree`, attaches `webglcontextlost` and `webglcontextrestored` listeners inside `useEffect`, prevents the lost event's default behavior, starts a 1.5-second timer, cancels it on restore, and calls the same `onFail` only if the timer expires. Its effect cleanup removes both listeners and the timer. This produces one fallback path for Canvas creation errors and non-restored context loss without a second reducer or content tree.

- [ ] **Step 7: Verify GREEN and commit**

Run:

~~~powershell
npm test -- src/styles/styles-contract.test.ts src/ui/ui-flow.test.tsx
npm run typecheck
npm run build
git add -- src/ui/CinematicIntro.tsx src/ui/SceneBoundary.tsx src/ui/StaticGalaxy.tsx src/styles src/app/PoemGalaxyApp.tsx src/scene/CosmicOperaStage.tsx
git commit -m "feat: apply cosmic opera experience and fallbacks"
~~~

Expected: style/fallback tests, typecheck, and build exit 0.

---

### Task 9: Remove obsolete generations and align metadata and documentation

**Files:**

- Create: `src/app/deprecated-files.test.ts`
- Create: `src/app/metadata.test.ts`
- Modify: `index.html`、`README.md`、`.gitignore`
- Delete: all files listed in “Delete after parity tests pass”

**Interfaces:**

- Consumes: Tasks 1—8 passing app shell and parity tests.
- Produces: one production entry, one scene system, one style system, and accurate project documentation.

- [ ] **Step 1: Write failing cleanup and metadata tests**

Create `src/app/deprecated-files.test.ts`:

~~~ts
import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

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
    expect(existsSync(new URL(relativePath, import.meta.url))).toBe(false);
  });
});
~~~

Create `src/app/metadata.test.ts`:

~~~ts
import { describe, expect, it } from 'vitest';
import html from '../../index.html?raw';

describe('document metadata', () => {
  it('describes the black-gold poetry galaxy', () => {
    expect(html).toContain('<title>诗云 · 黑金宇宙歌剧</title>');
    expect(html).toContain('沉浸式中国古典诗歌三维宇宙');
    expect(html).toContain('name="theme-color" content="#020204"');
    expect(html).toContain('src="/src/main.tsx"');
  });
});
~~~

- [ ] **Step 2: Verify RED**

Run:

~~~powershell
npm test -- src/app/deprecated-files.test.ts src/app/metadata.test.ts
~~~

Expected: FAIL because old files remain and metadata is still the old globe copy.

- [ ] **Step 3: Update metadata**

Set these exact tags in `index.html`:

~~~html
<meta name="description" content="诗云：可搜索、可漫游、可阅读的沉浸式中国古典诗歌三维宇宙。" />
<meta name="theme-color" content="#020204" />
<meta property="og:title" content="诗云 · 黑金宇宙歌剧" />
<meta property="og:description" content="在黑金星河中探索朝代、诗人、诗作与文学关系。" />
<title>诗云 · 黑金宇宙歌剧</title>
~~~

Keep the viewport, `#root`, and sole `/src/main.tsx` script.

- [ ] **Step 4: Delete obsolete files explicitly**

Validate and remove only these explicit paths:

~~~powershell
$obsolete = @(
  'src/app-entry.tsx', 'src/globe-entry.tsx', 'src/v2-entry.tsx', 'src/research-entry.tsx',
  'src/App.tsx', 'src/AppEnhanced.tsx', 'src/AppResearch.tsx', 'src/PoemGalaxyVideoClone.tsx',
  'src/PoetryGlobeApp.tsx', 'src/PoetryGlobeAppFloating.tsx', 'src/PoetryGlobeScene.tsx', 'src/PoetryGlobeSceneFull.tsx',
  'src/components/CenterBurstOverlay.tsx', 'src/components/FocusedPoetBurst.tsx', 'src/components/FocusedPoetBurstOverlay.tsx',
  'src/components/GalaxyScene.tsx', 'src/components/GalaxySceneClean.tsx', 'src/components/GalaxySceneResearchLite.tsx',
  'src/components/GpuStarfield.tsx', 'src/components/Hud.tsx', 'src/components/NebulaClouds.tsx', 'src/components/NebulaShells.tsx',
  'src/components/PoetBurstCloud.tsx', 'src/components/PoetryPanel.tsx', 'src/components/SceneEffects.tsx',
  'src/config/renderPresets.ts', 'src/lib/galaxy.ts', 'src/runtime/preloadRecover.ts',
  'src/data/poetry.ts', 'src/data/expandedPoetry.ts', 'src/data/massPoetryData.ts',
  'src/data/canonicalPoemDetails.ts', 'src/data/installExpandedPoetry.ts',
  'src/observatory.css', 'src/poetry-globe-floating.css', 'src/poetry-globe-pro.css', 'src/poetry-globe.css',
  'src/quality.css', 'src/reference-video.css', 'src/styles.css', 'src/video.css'
)
$obsolete | ForEach-Object { if (-not (Test-Path -LiteralPath $_)) { throw "Missing expected obsolete file: $_" } }
git rm -- $obsolete
~~~

Do not use recursive deletion or globs, and do not delete the new `src/app`、`src/data`、`src/scene`、`src/ui`、`src/styles` trees.

After deletion, run:

~~~powershell
rg -n "globe-entry|PoetryGlobeAppFloating|PoetryGlobeSceneFull|reference-video|poetry-globe" src index.html
~~~

Expected: no matches; `rg` exits 1.

- [ ] **Step 5: Rewrite README and ignore runtime artifacts**

README must document:

~~~md
# 诗云 · 黑金宇宙歌剧

一个可搜索、可漫游、可阅读、可展示关系网络的中国古典诗歌三维宇宙。

## Commands

- npm ci --legacy-peer-deps
- npm run dev
- npm test
- npm run typecheck
- npm run data:verify
- npm run build
- npm run budget
- npm run test:e2e

## Data

古典诗词来自 chinese-poetry/chinese-poetry 的固定 MIT 提交；详见 THIRD_PARTY_NOTICES.md。

## Deploy

合并到 main 后，由 .github/workflows/deploy.yml 自动发布到 https://6789-6.github.io/poem-galaxy/。
~~~

Add `.cache/`, `output/`, `playwright-report/`, and `test-results/` to `.gitignore`.

- [ ] **Step 6: Verify GREEN and commit**

Run:

~~~powershell
npm test
npm run typecheck
npm run build
git add -- index.html README.md .gitignore src/app/deprecated-files.test.ts src/app/metadata.test.ts
git add -u
git commit -m "refactor: retire obsolete poem galaxy generations"
~~~

Expected: all tests, typecheck, and build exit 0; the diff has only one production generation.

---

### Task 10: Add browser QA, fallback coverage, and bundle budgets

**Files:**

- Create: `playwright.config.ts`
- Create: `tests/e2e/poem-galaxy.spec.ts`
- Create: `tests/e2e/production-fallback.spec.ts`
- Create: `scripts/check-bundle-budget.mjs`
- Modify: `src/main.tsx`、`vite.config.ts`

**Interfaces:**

- Consumes: Task 9 single production build.
- Produces: `npm run test:e2e`, deterministic `?static=1` fallback QA, and `npm run budget`.

- [ ] **Step 1: Expose a deterministic static fallback query only**

In `src/main.tsx` compute:

~~~ts
const forceStatic = new URLSearchParams(window.location.search).get('static') === '1';
~~~

Pass `forceStatic` to `PoemGalaxyApp`. The query must not alter content, reducer, search, or data loading.

- [ ] **Step 2: Create Playwright configuration**

Create `playwright.config.ts`:

~~~ts
import { defineConfig, devices } from '@playwright/test';

const liveBaseUrl = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './output/playwright',
  use: {
    baseURL: liveBaseUrl ?? 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { ...devices['iPhone 13'], viewport: { width: 390, height: 844 } } }
  ],
  webServer: liveBaseUrl ? undefined : {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173/poem-galaxy/',
    reuseExistingServer: true
  }
});
~~~

- [ ] **Step 3: Write the production behavior test**

Create `tests/e2e/poem-galaxy.spec.ts`:

~~~ts
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('loads the cinematic shell and completes a search flow', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/poem-galaxy/');
  await expect(page.getByRole('heading', { name: '诗云' })).toBeVisible();
  await page.getByRole('button', { name: '跳过开场' }).click().catch(() => undefined);
  await page.getByRole('searchbox').fill('静夜思');
  await page.getByRole('option', { name: /静夜思/ }).click();
  await expect(page.getByRole('heading', { name: '静夜思' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: /李白/ })).toBeVisible();
  expect(errors).toEqual([]);
});

test('has no horizontal overflow and exposes six dynasties', async ({ page }) => {
  await page.goto('/poem-galaxy/?static=1');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await expect(page.getByRole('checkbox')).toHaveCount(6);
  const serious = (await new AxeBuilder({ page }).analyze()).violations
    .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical');
  expect(serious).toEqual([]);
});
~~~

- [ ] **Step 4: Write fallback and reduced-motion tests**

Create `tests/e2e/production-fallback.spec.ts`:

~~~ts
import { expect, test } from '@playwright/test';

test('static fallback retains search and reading', async ({ page }) => {
  await page.goto('/poem-galaxy/?static=1');
  await page.getByRole('button', { name: '跳过开场' }).click().catch(() => undefined);
  await expect(page.getByTestId('static-galaxy')).toBeVisible();
  await page.getByRole('searchbox').fill('将进酒');
  await page.getByRole('option', { name: /将进酒/ }).click();
  await expect(page.getByRole('heading', { name: '将进酒' })).toBeVisible();
});

test('reduced motion skips the cinematic intro', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/poem-galaxy/');
  await expect(page.getByRole('button', { name: '跳过开场' })).toHaveCount(0);
  await expect(page.getByRole('searchbox')).toBeVisible();
});
~~~

- [ ] **Step 5: Create the gzip budget script**

Set `build.manifest: true` in `vite.config.ts`; keep `base: '/poem-galaxy/'` unchanged. The initial-JavaScript budget follows only each entry's static `imports` in Vite's manifest, deliberately excluding `dynamicImports` such as `CosmicOperaStage`.

Create `scripts/check-bundle-budget.mjs`:

~~~js
import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const dist = new URL('../dist/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('.vite/manifest.json', dist), 'utf8'));
const initialFiles = new Set();

function visit(key) {
  const chunk = manifest[key];
  if (!chunk || initialFiles.has(chunk.file)) return;
  if (chunk.file.endsWith('.js')) initialFiles.add(chunk.file);
  for (const dependency of chunk.imports ?? []) visit(dependency);
}

for (const [key, chunk] of Object.entries(manifest)) {
  if (chunk.isEntry) visit(key);
}

let total = 0;
for (const file of initialFiles) total += gzipSync(await readFile(new URL(file, dist))).byteLength;
const featured = gzipSync(await readFile(new URL('../dist/data/featured.json', import.meta.url))).byteLength;
if (total > 700 * 1024) throw new Error('Compressed JavaScript exceeds 700 KiB: ' + total);
if (featured > 250 * 1024) throw new Error('Compressed featured data exceeds 250 KiB: ' + featured);
console.log('Budget OK: initial JS ' + total + ' bytes; featured ' + featured + ' bytes');
~~~

- [ ] **Step 6: Run desktop and mobile QA**

Run:

~~~powershell
npx playwright install chromium
npm run build
npm run budget
npm run test:e2e
~~~

Expected: both Playwright projects pass, no console errors are captured, static fallback works, and budgets are below limits.

- [ ] **Step 7: Commit**

Run:

~~~powershell
git add -- playwright.config.ts tests/e2e scripts/check-bundle-budget.mjs src/main.tsx vite.config.ts
git commit -m "test: add production browser and budget gates"
~~~

---

### Task 11: Run required design and React reviews and fix validated findings

**Files:**

- Review: all production files under `src` and `index.html`
- Modify: only owning files plus focused regression tests for validated findings

**Interfaces:**

- Consumes: green unit, type, build, budget, and browser gates.
- Produces: zero unresolved actionable findings from both required reviews.

- [ ] **Step 1: Run the web-design-guidelines review**

Read `web-design-guidelines/SKILL.md` completely and review landmarks, heading order, search/listbox semantics, focus, keyboard flow, 44px targets, contrast, safe areas, motion, mobile overflow, loading announcements, Canvas fallback, and readable poem typography.

For every actionable finding:

1. Add a focused assertion to `ui-flow.test.tsx`, `styles-contract.test.ts`, or the relevant E2E test.
2. Run the focused test and see it fail.
3. Apply the smallest owning-file fix.
4. Rerun the focused test to green.

- [ ] **Step 2: Run the Vercel React best-practices review**

Read `vercel-react-best-practices/SKILL.md` completely and confirm:

- manifest and featured fetch run in parallel;
- search index is lazy and Worker creation happens only once;
- no runtime fetch waterfall from author to manifest to shard;
- stable module-level dynasty, tour, and quality constants;
- no duplicate mobile state tree;
- scene frame loop does not set React state every frame;
- hidden-tab updates pause;
- old app generations are absent from the bundle;
- large data and postprocessing are not in the initial path when avoidable.

Use the same failing-test-first correction loop for each validated defect.

- [ ] **Step 3: Run the complete local quality gate**

Run:

~~~powershell
npm test
npm run typecheck
npm run data:verify
npm run build
npm run budget
npm run test:e2e
~~~

Expected: every command exits 0.

- [ ] **Step 4: Commit review fixes only if files changed**

Run:

~~~powershell
git status --short
$reviewFixes = @(git diff --name-only)
if ($reviewFixes.Count -gt 0) {
  $reviewFixes | ForEach-Object { if (-not (Test-Path -LiteralPath $_)) { throw "Unexpected missing review file: $_" } }
  git add -- $reviewFixes
  git diff --cached --check
  git commit -m "fix: address poem galaxy design and React reviews"
}
~~~

If both reviews have zero actionable findings, do not create an empty commit; record the zero-finding result in the execution log.

---

### Task 12: Harden GitHub Pages, publish, merge, and verify production

**Files:**

- Modify: `.github/workflows/deploy.yml`
- Modify: `README.md` only if final commands or deployed behavior changed

**Interfaces:**

- Consumes: fully verified feature branch.
- Produces: merged `main`, successful Pages Actions run, and live verified site at `https://6789-6.github.io/poem-galaxy/`.

- [ ] **Step 1: Write the failing workflow contract**

Create `src/app/deployment-workflow.test.ts`:

~~~ts
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
~~~

- [ ] **Step 2: Verify RED**

Run:

~~~powershell
npm test -- src/app/deployment-workflow.test.ts
~~~

Expected: FAIL because the current workflow installs with `npm install` and runs only `npm run build`.

- [ ] **Step 3: Add the Pages build gates**

Replace the install/build portion of `.github/workflows/deploy.yml` with:

~~~yaml
      - name: Install dependencies
        run: npm ci --legacy-peer-deps --no-audit --no-fund

      - name: Unit tests
        run: npm run test

      - name: Typecheck
        run: npm run typecheck

      - name: Verify poetry data
        run: npm run data:verify

      - name: Build
        run: npm run build

      - name: Verify bundle budgets
        run: npm run budget
~~~

Keep `actions/checkout@v4`, `actions/setup-node@v4` with Node 20, `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`, existing permissions, concurrency, and `main` trigger.

- [ ] **Step 4: Run the fresh pre-publish verification**

Run:

~~~powershell
npm test
npm run typecheck
npm run data:verify
npm run build
npm run budget
npm run test:e2e
git diff --check
git status --short --branch
~~~

Expected: every command exits 0; status contains only the workflow contract and workflow changes intended for this task.

- [ ] **Step 5: Commit and publish the branch**

Run:

~~~powershell
git add -- .github/workflows/deploy.yml src/app/deployment-workflow.test.ts README.md
git commit -m "ci: verify and deploy cosmic poem galaxy"
git push -u origin aho/poem-galaxy-cosmic-opera
~~~

Expected: push succeeds and the branch tracks origin.

- [ ] **Step 6: Open a ready pull request and merge after checks**

Use the GitHub publishing workflow. Create a PR titled `Redesign Poem Galaxy as a cosmic opera` with a body containing:

~~~md
## What changed
- rebuilt the site as a single black-gold cosmic opera experience
- preserved search, dynasty, poet, poem, relation, tour, keyboard, and mobile flows
- added a licensed 15k—20k sharded classical poetry corpus
- added unit, browser, fallback, data, and bundle gates

## Validation
- npm test
- npm run typecheck
- npm run data:verify
- npm run build
- npm run budget
- npm run test:e2e
~~~

Wait for PR checks to succeed, then merge with squash:

~~~powershell
gh pr merge --squash --delete-branch
~~~

Expected: PR merges into `main` and triggers `Deploy to GitHub Pages`.

- [ ] **Step 7: Monitor the Pages run to completion**

Run:

~~~powershell
$latestRun = gh run list --repo 6789-6/poem-galaxy --workflow deploy.yml --branch main --limit 1 --json databaseId,status,conclusion,url,headSha | ConvertFrom-Json
if (-not $latestRun -or -not $latestRun.databaseId) { throw 'No main Pages deployment run found' }
gh run watch $latestRun.databaseId --repo 6789-6/poem-galaxy --exit-status
if ($LASTEXITCODE -ne 0) {
  gh run view $latestRun.databaseId --repo 6789-6/poem-galaxy --log-failed
  throw "Pages deployment failed: $($latestRun.url)"
}
~~~

Expected: the newest main run concludes `success`. On failure, the command prints the failed log and stops; fix on the feature branch with a regression test, then repeat the PR/merge flow.

- [ ] **Step 8: Verify the live Pages deployment**

Run:

~~~powershell
curl.exe -I https://6789-6.github.io/poem-galaxy/
curl.exe -I https://6789-6.github.io/poem-galaxy/data/manifest.json
curl.exe -I https://6789-6.github.io/poem-galaxy/data/featured.json
$manifest = Invoke-RestMethod https://6789-6.github.io/poem-galaxy/data/manifest.json
curl.exe -I ("https://6789-6.github.io/poem-galaxy/data/" + $manifest.searchIndexPath)
curl.exe -I ("https://6789-6.github.io/poem-galaxy/data/" + $manifest.poemShards[0].path)
$index = (Invoke-WebRequest https://6789-6.github.io/poem-galaxy/).Content
$assets = [regex]::Matches($index, '(?:src|href)="([^"]+\.(?:js|css))"') | ForEach-Object { $_.Groups[1].Value }
if (-not $assets) { throw 'No production JS/CSS assets found in deployed HTML' }
$assets | ForEach-Object { curl.exe -f -s -o NUL ("https://6789-6.github.io" + $_) }
gh api repos/6789-6/poem-galaxy/pages --jq .build_type
~~~

Expected: HTML, manifest, featured data, search index, first poem shard, and every emitted JS/CSS asset return HTTP 200; Pages `build_type` prints `workflow`.

Run Playwright against the live base URL:

~~~powershell
$env:PLAYWRIGHT_BASE_URL = 'https://6789-6.github.io'
npx playwright test tests/e2e/poem-galaxy.spec.ts --project=desktop
npx playwright test tests/e2e/production-fallback.spec.ts --project=mobile
Remove-Item Env:PLAYWRIGHT_BASE_URL
~~~

Expected: one desktop search/read flow and one 390px static-fallback flow pass with zero `pageerror` events, zero console errors, and zero serious/critical accessibility violations.

- [ ] **Step 9: Record the rollback**

If production is broken after deployment, revert the squash merge on `main` using a new revert commit and let the same Pages workflow redeploy. Do not modify Pages Source, delete the repository, or force-push `main`.

---

## Final Verification Checklist

- [ ] Only `src/main.tsx` is loaded by `index.html`.
- [ ] Old App, scene, entry, data, and style generations are deleted.
- [ ] `manifest.json` reports 15,000—20,000 classical poems and at least 1,000 authors from the pinned MIT source; modern records are metadata-only.
- [ ] No modern copyrighted full text is included.
- [ ] Every relation has `type` and `sourceLabel`.
- [ ] Search, dynasty, poet, poem, network, tour, `Escape`, and `H` work in desktop and mobile flows.
- [ ] WebGL failure and reduced motion keep search and reading usable.
- [ ] JavaScript and featured-data gzip budgets pass.
- [ ] `npm test`, `npm run typecheck`, `npm run data:verify`, `npm run build`, `npm run budget`, and `npm run test:e2e` all exit 0 on the final tree.
- [ ] Web design and React reviews have no unresolved actionable findings.
- [ ] The Pages workflow succeeds on `main`.
- [ ] Live HTML, manifest, featured data, search index, and at least one poem shard return HTTP 200.
- [ ] Live desktop and mobile console checks report zero unhandled errors.
