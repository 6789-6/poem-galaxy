import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PoetryDataClient } from '../data/client';
import type { SearchEntry, SearchHit, SearchRequest, SearchResponse } from '../workers/search-protocol';
import { GlobalSearch } from './GlobalSearch';

const entries: SearchEntry[] = [
  { id: 'jing-ye-si', kind: 'poem', authorId: 'li-bai', title: '静夜思', subtitle: '李白', text: '月 思乡' }
];

function searchClient(loads: string[]) {
  const fetcher = (async (input: RequestInfo | URL) => {
    loads.push(String(input));
    return new Response(JSON.stringify(entries), { status: 200 });
  }) as typeof fetch;
  return new PoetryDataClient(fetcher);
}

class SearchWorkerDouble {
  static instances: SearchWorkerDouble[] = [];
  onmessage: ((event: MessageEvent<SearchResponse>) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  terminated = false;

  constructor(public url: URL, public options: WorkerOptions) {
    SearchWorkerDouble.instances.push(this);
  }

  postMessage(message: SearchRequest) {
    if (message.type === 'init') {
      queueMicrotask(() => this.onmessage?.({ data: { type: 'ready' } } as MessageEvent<SearchResponse>));
      return;
    }
    queueMicrotask(() => this.onmessage?.({
      data: { type: 'results', requestId: message.requestId, results: [{ id: 'jing-ye-si', score: 0 }] }
    } as MessageEvent<SearchResponse>));
  }

  terminate() {
    this.terminated = true;
  }
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  SearchWorkerDouble.instances = [];
});

describe('GlobalSearch', () => {
  it('does not expose unsupported or dangling ARIA state on an empty searchbox', () => {
    render(
      <GlobalSearch client={searchClient([])} onSelectEntry={vi.fn()} onSearchInteraction={vi.fn()} onStatus={vi.fn()} />
    );
    expect(screen.getByRole('searchbox')).not.toHaveAttribute('aria-expanded');
    expect(screen.getByRole('searchbox')).not.toHaveAttribute('aria-controls');
  });

  it('loads the index only after a nonempty query and owns one module Worker for its lifetime', async () => {
    vi.stubGlobal('Worker', SearchWorkerDouble);
    const loads: string[] = [];
    const user = userEvent.setup();
    const view = render(
      <GlobalSearch client={searchClient(loads)} onSelectEntry={vi.fn()} onSearchInteraction={vi.fn()} onStatus={vi.fn()} />
    );

    expect(loads).toHaveLength(0);
    await user.type(screen.getByRole('searchbox'), '静');
    expect(await screen.findByRole('option', { name: /静夜思/ })).toBeInTheDocument();
    await user.type(screen.getByRole('searchbox'), '夜');
    expect(SearchWorkerDouble.instances).toHaveLength(1);
    expect(SearchWorkerDouble.instances[0]?.options).toEqual({ type: 'module' });

    view.unmount();
    expect(SearchWorkerDouble.instances[0]?.terminated).toBe(true);
  });

  it('falls back to yielding batch search when Worker construction fails', async () => {
    vi.stubGlobal('Worker', class { constructor() { throw new Error('worker unavailable'); } });
    const user = userEvent.setup();
    render(
      <GlobalSearch client={searchClient([])} onSelectEntry={vi.fn()} onSearchInteraction={vi.fn()} onStatus={vi.fn()} />
    );

    await user.type(screen.getByRole('searchbox'), '静夜思');
    await waitFor(() => expect(screen.getByRole('option', { name: /静夜思/ })).toBeInTheDocument());
  });

  it('falls back when Worker initialization messaging fails', async () => {
    class InitializationFailureWorker extends SearchWorkerDouble {
      override postMessage(message: SearchRequest) {
        if (message.type === 'init') throw new Error('init postMessage failed');
        super.postMessage(message);
      }
    }
    vi.stubGlobal('Worker', InitializationFailureWorker);
    const user = userEvent.setup();
    render(
      <GlobalSearch client={searchClient([])} onSelectEntry={vi.fn()} onSearchInteraction={vi.fn()} onStatus={vi.fn()} />
    );

    await user.type(screen.getByRole('searchbox'), '静夜思');
    expect(await screen.findByRole('option', { name: /静夜思/ })).toBeInTheDocument();
  });

  it('falls back when an initialized Worker raises an error event', async () => {
    class RuntimeFailureWorker extends SearchWorkerDouble {
      override postMessage(message: SearchRequest) {
        if (message.type === 'search') {
          queueMicrotask(() => this.onerror?.(new ErrorEvent('error', { message: 'worker crashed' })));
          return;
        }
        super.postMessage(message);
      }
    }
    vi.stubGlobal('Worker', RuntimeFailureWorker);
    const user = userEvent.setup();
    render(
      <GlobalSearch client={searchClient([])} onSelectEntry={vi.fn()} onSearchInteraction={vi.fn()} onStatus={vi.fn()} />
    );

    await user.type(screen.getByRole('searchbox'), '静夜思');
    expect(await screen.findByRole('option', { name: /静夜思/ })).toBeInTheDocument();
  });

  it('ignores results from stale Worker request IDs', async () => {
    class ControlledWorker extends SearchWorkerDouble {
      searches: Extract<SearchRequest, { type: 'search' }>[] = [];

      override postMessage(message: SearchRequest) {
        if (message.type === 'init') {
          queueMicrotask(() => this.onmessage?.({ data: { type: 'ready' } } as MessageEvent<SearchResponse>));
          return;
        }
        this.searches.push(message);
      }

      respond(requestId: number, results: SearchHit[]) {
        this.onmessage?.({ data: { type: 'results', requestId, results } } as MessageEvent<SearchResponse>);
      }
    }
    vi.stubGlobal('Worker', ControlledWorker);
    const user = userEvent.setup();
    render(
      <GlobalSearch client={searchClient([])} onSelectEntry={vi.fn()} onSearchInteraction={vi.fn()} onStatus={vi.fn()} />
    );

    const searchbox = screen.getByRole('searchbox');
    await user.type(searchbox, '静');
    const worker = SearchWorkerDouble.instances[0] as ControlledWorker;
    await waitFor(() => expect(worker.searches).toHaveLength(1));
    await user.type(searchbox, '夜');
    await waitFor(() => expect(worker.searches).toHaveLength(2));

    worker.respond(worker.searches[1].requestId, [{ id: 'jing-ye-si', score: 0 }]);
    expect(await screen.findByRole('option', { name: /静夜思/ })).toBeInTheDocument();
    worker.respond(worker.searches[0].requestId, []);
    expect(screen.getByRole('option', { name: /静夜思/ })).toBeInTheDocument();
  });

  it('does not construct a Worker or write status after a pending index load unmounts', async () => {
    vi.stubGlobal('Worker', SearchWorkerDouble);
    let resolveIndex!: (response: Response) => void;
    const fetcher = vi.fn(() => new Promise<Response>((resolve) => { resolveIndex = resolve; })) as unknown as typeof fetch;
    const onStatus = vi.fn();
    const user = userEvent.setup();
    const view = render(
      <GlobalSearch
        client={new PoetryDataClient(fetcher)}
        onSelectEntry={vi.fn()}
        onSearchInteraction={vi.fn()}
        onStatus={onStatus}
      />
    );

    await user.type(screen.getByRole('searchbox'), '静');
    await waitFor(() => expect(fetcher).toHaveBeenCalledOnce());
    view.unmount();
    await act(async () => {
      resolveIndex(new Response(JSON.stringify(entries), { status: 200 }));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(SearchWorkerDouble.instances).toHaveLength(0);
    expect(onStatus).not.toHaveBeenCalled();
  });
});
