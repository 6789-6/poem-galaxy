import { useCallback, useEffect, useRef, useState } from 'react';
import type { PoetryDataClient } from '../data/client';
import { searchEntriesInBatches } from '../workers/search-core';
import type { SearchEntry, SearchHit, SearchRequest, SearchResponse } from '../workers/search-protocol';

export interface GlobalSearchProps {
  client: PoetryDataClient;
  onSelectEntry: (entry: SearchEntry) => void;
  onSearchInteraction: () => void;
  onStatus: (message: string) => void;
}

interface PendingSearch {
  resolve: (hits: SearchHit[]) => void;
  reject: (error: Error) => void;
}

const SEARCH_LIMIT = 12;
const WORKER_READY_TIMEOUT = 4000;

export function GlobalSearch({ client, onSelectEntry, onSearchInteraction, onStatus }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const entriesRef = useRef<SearchEntry[] | null>(null);
  const indexPromiseRef = useRef<Promise<SearchEntry[]> | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const workerAttemptedRef = useRef(false);
  const workerFailedRef = useRef(false);
  const workerInitializationRef = useRef<Promise<void> | null>(null);
  const workerReadyResolveRef = useRef<(() => void) | null>(null);
  const workerReadyRejectRef = useRef<((error: Error) => void) | null>(null);
  const workerReadyTimerRef = useRef<number | null>(null);
  const pendingSearchesRef = useRef(new Map<number, PendingSearch>());
  const latestRequestIdRef = useRef(0);
  const activeRef = useRef(true);

  const clearWorkerTimer = useCallback(() => {
    if (workerReadyTimerRef.current !== null) window.clearTimeout(workerReadyTimerRef.current);
    workerReadyTimerRef.current = null;
  }, []);

  const failWorker = useCallback((error: Error) => {
    workerFailedRef.current = true;
    clearWorkerTimer();
    workerRef.current?.terminate();
    workerRef.current = null;
    workerReadyRejectRef.current?.(error);
    workerReadyResolveRef.current = null;
    workerReadyRejectRef.current = null;
    for (const pending of pendingSearchesRef.current.values()) pending.reject(error);
    pendingSearchesRef.current.clear();
    if (activeRef.current) onStatus('搜索线程不可用，已切换兼容搜索');
  }, [clearWorkerTimer, onStatus]);

  const ensureIndex = useCallback(() => {
    if (entriesRef.current) return Promise.resolve(entriesRef.current);
    if (indexPromiseRef.current) return indexPromiseRef.current;
    const request = client.loadSearchIndex().then((entries) => {
      entriesRef.current = entries;
      return entries;
    }).catch((error: unknown) => {
      indexPromiseRef.current = null;
      throw error;
    });
    indexPromiseRef.current = request;
    return request;
  }, [client]);

  const ensureWorker = useCallback((entries: SearchEntry[]) => {
    if (!activeRef.current) return Promise.reject(new Error('Global search inactive'));
    if (workerFailedRef.current) return Promise.reject(new Error('Worker unavailable'));
    if (workerInitializationRef.current) return workerInitializationRef.current;
    if (workerAttemptedRef.current) return Promise.reject(new Error('Worker initialization unavailable'));
    workerAttemptedRef.current = true;

    const initialization = new Promise<void>((resolve, reject) => {
      workerReadyResolveRef.current = resolve;
      workerReadyRejectRef.current = reject;
    });
    workerInitializationRef.current = initialization;

    try {
      const worker = new Worker(new URL('../workers/search.worker.ts', import.meta.url), { type: 'module' });
      workerRef.current = worker;
      worker.onmessage = (event: MessageEvent<SearchResponse>) => {
        const message = event.data;
        if (message.type === 'ready') {
          clearWorkerTimer();
          workerReadyResolveRef.current?.();
          workerReadyResolveRef.current = null;
          workerReadyRejectRef.current = null;
          return;
        }
        const pending = pendingSearchesRef.current.get(message.requestId);
        if (!pending) return;
        pendingSearchesRef.current.delete(message.requestId);
        pending.resolve(message.results);
      };
      worker.onerror = (event) => {
        event.preventDefault();
        failWorker(new Error(event.message || 'Search Worker error'));
      };
      worker.postMessage({ type: 'init', entries } satisfies SearchRequest);
      workerReadyTimerRef.current = window.setTimeout(
        () => failWorker(new Error('Search Worker initialization timed out')),
        WORKER_READY_TIMEOUT
      );
    } catch (error) {
      failWorker(error instanceof Error ? error : new Error('Search Worker initialization failed'));
    }

    return initialization;
  }, [clearWorkerTimer, failWorker]);

  const searchWithWorker = useCallback((queryValue: string, requestId: number) => {
    return new Promise<SearchHit[]>((resolve, reject) => {
      pendingSearchesRef.current.set(requestId, { resolve, reject });
      try {
        workerRef.current?.postMessage({ type: 'search', requestId, query: queryValue, limit: SEARCH_LIMIT } satisfies SearchRequest);
        if (!workerRef.current) throw new Error('Search Worker unavailable');
      } catch (error) {
        pendingSearchesRef.current.delete(requestId);
        const failure = error instanceof Error ? error : new Error('Search Worker messaging failed');
        failWorker(failure);
        reject(failure);
      }
    });
  }, [failWorker]);

  const runSearch = useCallback(async (queryValue: string, requestId: number) => {
    const isCurrent = () => activeRef.current && requestId === latestRequestIdRef.current;
    try {
      const entries = await ensureIndex();
      if (!isCurrent()) return;
      onStatus('诗词索引已就绪');
      if (!isCurrent()) return;
      let hits: SearchHit[];
      try {
        if (!isCurrent()) return;
        await ensureWorker(entries);
        if (!isCurrent()) return;
        hits = await searchWithWorker(queryValue, requestId);
        if (!isCurrent()) return;
      } catch {
        if (!isCurrent()) return;
        hits = await searchEntriesInBatches(entries, queryValue, SEARCH_LIMIT);
        if (!isCurrent()) return;
      }
      if (!isCurrent()) return;
      const entryById = new Map(entries.map((entry) => [entry.id, entry]));
      const nextResults = hits.flatMap((hit) => {
        const entry = entryById.get(hit.id);
        return entry ? [entry] : [];
      });
      if (!isCurrent()) return;
      setResults(nextResults);
      setBusy(false);
      onStatus(nextResults.length ? `找到 ${nextResults.length} 条结果` : '没有找到匹配诗词');
    } catch (error) {
      if (!isCurrent()) return;
      setResults([]);
      setBusy(false);
      onStatus(error instanceof Error ? error.message : '搜索索引加载失败');
    }
  }, [ensureIndex, ensureWorker, onStatus, searchWithWorker]);

  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
      latestRequestIdRef.current += 1;
      clearWorkerTimer();
      workerRef.current?.terminate();
      workerRef.current = null;
      const unmounted = new Error('Global search unmounted');
      workerReadyRejectRef.current?.(unmounted);
      for (const pending of pendingSearchesRef.current.values()) pending.reject(unmounted);
      pendingSearchesRef.current.clear();
    };
  }, [clearWorkerTimer]);

  const updateQuery = (value: string) => {
    setQuery(value);
    const requestId = ++latestRequestIdRef.current;
    if (!value.trim()) {
      setBusy(false);
      setResults([]);
      return;
    }
    setBusy(true);
    onSearchInteraction();
    void runSearch(value, requestId);
  };

  const selectResult = (entry: SearchEntry) => {
    setResults([]);
    onSelectEntry(entry);
  };

  return (
    <div className="global-search">
      <label htmlFor="poem-galaxy-search">搜索诗人或诗词</label>
      <input
        id="poem-galaxy-search"
        name="poetry-search"
        type="search"
        role="searchbox"
        value={query}
        autoComplete="off"
        aria-controls={results.length > 0 ? 'poem-search-results' : undefined}
        aria-busy={busy}
        onChange={(event) => updateQuery(event.currentTarget.value)}
      />
      {results.length > 0 ? (
        <ul id="poem-search-results" className="search-results" role="listbox" aria-label="搜索结果">
          {results.map((entry) => (
            <li key={`${entry.kind}-${entry.id}`}>
              <button
                type="button"
                role="option"
                aria-selected="false"
                aria-label={`${entry.title} ${entry.subtitle}`}
                onClick={() => selectResult(entry)}
              >
                <strong>{entry.title}</strong>
                <span>{entry.subtitle}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
