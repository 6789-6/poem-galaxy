import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PoemGalaxyApp } from '../app/PoemGalaxyApp';
import { PoetryDataClient } from '../data/client';

vi.mock('@react-three/fiber', () => ({ Canvas: ({ children }: { children: ReactNode }) => <div data-testid="canvas">{children}</div> }));
vi.mock('../scene/CosmicOperaScene', () => ({ CosmicOperaScene: () => <div data-testid="cosmic-scene" /> }));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
});

function createTestClient({
  failFirstShard = false,
  includeTourAuthor = false,
  requestLog
}: { failFirstShard?: boolean; includeTourAuthor?: boolean; requestLog?: string[] } = {}) {
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
  if (includeTourAuthor) {
    featured.authors.push({ id: 'wang-wei', name: '王维', dynasty: 'tang', themes: ['山水'], poemShardIds: [] });
  }
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
  let shardAttempts = 0;
  const fetcher = (async (input: RequestInfo | URL) => {
    const file = new URL(String(input)).pathname.split('/').at(-1) ?? '';
    requestLog?.push(file);
    if (file === 'tang-001.json' && failFirstShard && shardAttempts++ === 0) {
      return new Response(null, { status: 503 });
    }
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
    const requests: string[] = [];
    render(<PoemGalaxyApp client={createTestClient({ requestLog: requests })} />);
    await screen.findByRole('searchbox');
    expect(requests).not.toContain('search-index.json');
    await user.type(await screen.findByRole('searchbox'), '春望');
    await user.click(await screen.findByRole('option', { name: /春望/ }));
    expect(await screen.findByRole('heading', { name: '春望' })).toBeInTheDocument();
    expect(screen.getByText('国破山河在')).toBeInTheDocument();
    expect(requests.filter((path) => path === 'authors.json')).toHaveLength(1);
    expect(requests.indexOf('authors.json')).toBeLessThan(requests.indexOf('tang-001.json'));
  });

  it('exposes network, tour, and HUD controls', async () => {
    render(<PoemGalaxyApp client={createTestClient()} />);
    expect(await screen.findByRole('button', { name: '关系网络' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '开始巡游' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '隐藏界面' })).toBeInTheDocument();
  });

  it('keeps one dynasty selected when every control is toggled', async () => {
    const user = userEvent.setup();
    render(<PoemGalaxyApp client={createTestClient()} />);
    const controls = await screen.findAllByRole('checkbox');
    for (const control of controls.slice(0, 5)) await user.click(control);
    await user.click(controls[5]);
    expect(controls[5]).toBeChecked();
  });

  it('retries the same failed shard selection without changing mode first', async () => {
    const user = userEvent.setup();
    render(<PoemGalaxyApp client={createTestClient({ failFirstShard: true })} />);
    await user.type(await screen.findByRole('searchbox'), '春望');
    await user.click(await screen.findByRole('option', { name: /春望/ }));
    expect(await screen.findByRole('heading', { name: '中华诗词星河' })).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: '重试载入' }));
    expect(await screen.findByRole('heading', { name: '春望' })).toBeInTheDocument();
  });

  it('keeps a single live region and ignores H while typing in the search field', async () => {
    const user = userEvent.setup();
    render(<PoemGalaxyApp client={createTestClient()} />);
    const search = await screen.findByRole('searchbox');
    expect(screen.getAllByRole('status')).toHaveLength(1);
    await user.type(search, 'h');
    expect(screen.getByRole('button', { name: '隐藏界面' })).toBeInTheDocument();
    search.blur();
    await user.keyboard('h');
    expect(screen.getByRole('button', { name: '显示界面' })).toBeInTheDocument();
  });

  it('advances the tour every eight visible seconds and pauses while hidden', async () => {
    render(<PoemGalaxyApp client={createTestClient({ includeTourAuthor: true })} />);
    const tourButton = await screen.findByRole('button', { name: '开始巡游' });
    vi.useFakeTimers();
    fireEvent.click(tourButton);
    expect(screen.getByRole('heading', { name: '李白' })).toBeInTheDocument();

    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    act(() => vi.advanceTimersByTime(16_000));
    expect(screen.getByRole('heading', { name: '李白' })).toBeInTheDocument();

    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    act(() => vi.advanceTimersByTime(8_000));
    expect(screen.getByRole('heading', { name: '王维' })).toBeInTheDocument();
  });
});
