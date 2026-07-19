import { lazy, Suspense, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { DataLoadError, PoetryDataClient } from '../data/client';
import type { AuthorRecord, DataManifest, FeaturedCorpus, PoemRecord } from '../data/schema';
import { useAdaptiveQuality } from '../performance/use-adaptive-quality';
import { galaxyReducer, initialGalaxyState } from '../state/galaxy-reducer';
import type { SearchEntry } from '../workers/search-protocol';
import { DynastyNavigator } from '../ui/DynastyNavigator';
import { FocusPanel, type FocusPanelProps } from '../ui/FocusPanel';
import { GlobalSearch } from '../ui/GlobalSearch';
import { MobileSheet } from '../ui/MobileSheet';
import { ModeDock } from '../ui/ModeDock';

const CosmicOperaStage = lazy(() => import('../scene/CosmicOperaStage'));

export interface PoemGalaxyAppProps {
  client?: PoetryDataClient;
  forceStatic?: boolean;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);

  return matches;
}

function errorMessage(error: unknown) {
  if (error instanceof DataLoadError) {
    return error.status ? `载入失败：${error.path}（${error.status}）` : `载入失败：${error.path}`;
  }
  return error instanceof Error ? error.message : '诗词数据载入失败';
}

export function PoemGalaxyApp({ client: providedClient, forceStatic = false }: PoemGalaxyAppProps) {
  const [state, dispatch] = useReducer(galaxyReducer, initialGalaxyState);
  const [manifest, setManifest] = useState<DataManifest | null>(null);
  const [featured, setFeatured] = useState<FeaturedCorpus | null>(null);
  const [authorsById, setAuthorsById] = useState(new Map<string, AuthorRecord>());
  const [poemsById, setPoemsById] = useState(new Map<string, PoemRecord>());
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [selectionError, setSelectionError] = useState<Error | null>(null);
  const [retrySelection, setRetrySelection] = useState<(() => void) | null>(null);
  const [status, setStatus] = useState('正在载入诗词星河');
  const authorsRef = useRef(authorsById);
  const poemsRef = useRef(poemsById);
  const client = useMemo(() => providedClient ?? new PoetryDataClient(), [providedClient]);
  const { quality, reportFps } = useAdaptiveQuality();
  const isMobile = useMediaQuery('(max-width: 760px)');

  const replaceAuthors = useCallback((records: AuthorRecord[]) => {
    const next = new Map(records.map((record) => [record.id, record]));
    authorsRef.current = next;
    setAuthorsById(next);
  }, []);

  const replacePoems = useCallback((records: PoemRecord[]) => {
    const next = new Map(records.map((record) => [record.id, record]));
    poemsRef.current = next;
    setPoemsById(next);
  }, []);

  const appendAuthor = useCallback((author: AuthorRecord) => {
    if (authorsRef.current.has(author.id)) return;
    const next = new Map(authorsRef.current).set(author.id, author);
    authorsRef.current = next;
    setAuthorsById(next);
  }, []);

  const appendPoems = useCallback((poems: PoemRecord[]) => {
    const next = new Map(poemsRef.current);
    for (const poem of poems) next.set(poem.id, poem);
    poemsRef.current = next;
    setPoemsById(next);
  }, []);

  const boot = useCallback(() => {
    setLoadError(null);
    setStatus('正在载入诗词星河');
    return Promise.all([client.loadManifest(), client.loadFeatured()])
      .then(([nextManifest, nextFeatured]) => {
        setManifest(nextManifest);
        setFeatured(nextFeatured);
        replaceAuthors(nextFeatured.authors);
        replacePoems(nextFeatured.poems);
        setStatus(`已载入 ${nextFeatured.authors.length} 位精选诗人`);
      })
      .catch((error: unknown) => {
        const failure = error instanceof Error ? error : new Error('诗词数据载入失败');
        setLoadError(failure);
        setStatus(errorMessage(failure));
      });
  }, [client, replaceAuthors, replacePoems]);

  useEffect(() => {
    void boot();
  }, [boot]);

  const clearSelectionFailure = useCallback(() => {
    setSelectionError(null);
    setRetrySelection(null);
  }, []);

  const rememberSelectionFailure = useCallback((error: unknown, retry: () => void) => {
    const failure = error instanceof Error ? error : new Error('所选诗词载入失败');
    setSelectionError(failure);
    setRetrySelection(() => retry);
    setStatus(errorMessage(failure));
  }, []);

  const resolveAuthor = useCallback(async (authorId: string) => {
    const existing = authorsRef.current.get(authorId);
    if (existing) return existing;
    const authors = await client.loadAuthors();
    const author = authors.find((candidate) => candidate.id === authorId);
    if (!author) throw new DataLoadError('authors.json');
    appendAuthor(author);
    return author;
  }, [appendAuthor, client]);

  const selectAuthor = useCallback(async (authorId: string) => {
    clearSelectionFailure();
    try {
      const author = await resolveAuthor(authorId);
      dispatch({ type: 'SELECT_AUTHOR', authorId: author.id });
      setStatus(`已选择诗人 ${author.name}`);
    } catch (error) {
      rememberSelectionFailure(error, () => { void selectAuthor(authorId); });
    }
  }, [clearSelectionFailure, rememberSelectionFailure, resolveAuthor]);

  const selectPoem = useCallback(async (poemId: string, authorId: string, shardPath?: string) => {
    clearSelectionFailure();
    try {
      const author = await resolveAuthor(authorId);
      let poem = poemsRef.current.get(poemId);
      if (!poem) {
        if (!shardPath) throw new DataLoadError(`poem:${poemId}`);
        const shard = await client.loadPoemShard(shardPath);
        poem = shard.find((candidate) => candidate.id === poemId);
        if (!poem) throw new DataLoadError(shardPath);
        appendPoems(shard);
      }
      dispatch({ type: 'SELECT_POEM', poemId: poem.id, authorId: author.id });
      setStatus(`正在阅读 ${poem.title}`);
    } catch (error) {
      rememberSelectionFailure(error, () => { void selectPoem(poemId, authorId, shardPath); });
    }
  }, [appendPoems, clearSelectionFailure, client, rememberSelectionFailure, resolveAuthor]);

  const selectSearchEntry = useCallback((entry: SearchEntry) => {
    if (entry.kind === 'author') {
      void selectAuthor(entry.id);
      return;
    }
    if (!entry.authorId) {
      rememberSelectionFailure(new DataLoadError(`search:${entry.id}`), () => selectSearchEntry(entry));
      return;
    }
    void selectPoem(entry.id, entry.authorId, entry.shardPath);
  }, [rememberSelectionFailure, selectAuthor, selectPoem]);

  const back = useCallback(() => {
    clearSelectionFailure();
    dispatch({ type: 'BACK' });
    setStatus('已返回上一层');
  }, [clearSelectionFailure]);

  const startTour = useCallback(() => {
    if (!featured?.authors.length) return;
    clearSelectionFailure();
    dispatch({ type: 'START_TOUR' });
    dispatch({ type: 'ADVANCE_TOUR', index: 0, authorId: featured.authors[0].id });
    setStatus(`巡游至 ${featured.authors[0].name}`);
  }, [clearSelectionFailure, featured]);

  useEffect(() => {
    if (state.mode !== 'tour' || !featured?.authors.length) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      const index = (state.tourIndex + 1) % featured.authors.length;
      const author = featured.authors[index];
      dispatch({ type: 'ADVANCE_TOUR', index, authorId: author.id });
      setStatus(`巡游至 ${author.name}`);
    }, 8000);
    return () => window.clearInterval(timer);
  }, [featured, state.mode, state.tourIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        back();
        return;
      }
      const target = event.target;
      if (
        target instanceof HTMLInputElement
        || target instanceof HTMLTextAreaElement
        || (target instanceof HTMLElement && target.isContentEditable)
      ) return;
      if (event.key.toLowerCase() === 'h') dispatch({ type: 'TOGGLE_HUD' });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [back]);

  const authors = useMemo(() => [...authorsById.values()], [authorsById]);
  const loadedPoems = useMemo(() => [...poemsById.values()], [poemsById]);
  const selectedAuthor = state.selectedAuthorId ? authorsById.get(state.selectedAuthorId) ?? null : null;
  const selectedPoem = state.selectedPoemId ? poemsById.get(state.selectedPoemId) ?? null : null;
  const relations = featured?.relations ?? [];

  const focusPanelProps: FocusPanelProps = {
    mode: state.mode,
    selectedAuthor,
    selectedPoem,
    authors,
    loadedPoems,
    relations,
    selectionError,
    onSelectPoem: (poemId, authorId) => { void selectPoem(poemId, authorId); },
    onBack: back,
    onRetrySelection: retrySelection
  };

  const searchInteraction = useCallback(() => {
    if (state.mode === 'tour') back();
  }, [back, state.mode]);

  return (
    <main
      className={`poem-galaxy-app mode-${state.mode}${state.hudVisible ? '' : ' hud-hidden'}`}
      data-testid="poem-galaxy-app"
      data-force-static={forceStatic || undefined}
    >
      <div className="cosmic-stage" aria-hidden="true">
        {featured ? (
          <Suspense fallback={<div className="scene-loading">星图构建中</div>}>
            <CosmicOperaStage
              state={state}
              quality={quality}
              authors={authors}
              loadedPoems={loadedPoems}
              relations={relations}
              onSelectAuthor={(authorId) => { void selectAuthor(authorId); }}
              onSelectPoem={(poemId, authorId) => { void selectPoem(poemId, authorId); }}
              onFpsSample={reportFps}
            />
          </Suspense>
        ) : <div className="scene-loading">星图构建中</div>}
      </div>

      {state.hudVisible ? (
        <div className="hud-layer">
          <header className="exploration-header">
            <h1>诗词星河</h1>
            {manifest ? <p>{manifest.counts.classicalPoems.toLocaleString('zh-CN')} 首古典诗词</p> : null}
            {featured ? (
              <GlobalSearch
                client={client}
                onSelectEntry={selectSearchEntry}
                onSearchInteraction={searchInteraction}
                onStatus={setStatus}
              />
            ) : null}
          </header>
          <DynastyNavigator
            activeDynasties={state.activeDynasties}
            onChange={(dynasties) => dispatch({ type: 'SET_DYNASTIES', dynasties })}
          />
          {isMobile ? <MobileSheet><FocusPanel {...focusPanelProps} /></MobileSheet> : (
            <aside className="focus-panel" aria-label="诗词详情"><FocusPanel {...focusPanelProps} /></aside>
          )}
        </div>
      ) : null}

      {loadError ? (
        <div className="load-error">
          <p>{errorMessage(loadError)}</p>
          <button type="button" onClick={() => { void boot(); }}>重试载入</button>
        </div>
      ) : null}

      <ModeDock
        quality={quality}
        hudVisible={state.hudVisible}
        networkActive={state.mode === 'network'}
        tourActive={state.mode === 'tour'}
        onEnterNetwork={() => {
          dispatch({ type: 'ENTER_NETWORK' });
          setStatus(state.selectedAuthorId ? '已进入关系网络' : '请先选择一位诗人');
        }}
        onStartTour={startTour}
        onToggleHud={() => dispatch({ type: 'TOGGLE_HUD' })}
      />

      <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">{status}</p>
    </main>
  );
}
