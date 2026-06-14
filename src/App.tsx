import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import GalaxyScene from './components/GalaxyScene';
import Hud from './components/Hud';
import PoetryPanel from './components/PoetryPanel';
import type { Dynasty, Poem, Poet } from './data/poetry';
import { dynastyColors, dynastyOrder, poems, poemsByPoet, poetById, poets } from './data/poetry';

export type Selection =
  | { kind: 'poet'; poet: Poet }
  | { kind: 'poem'; poem: Poem; poet: Poet };

export type GalaxyMode = 'explore' | 'network' | 'reading' | 'tour';
export type VisualQuality = 'performance' | 'balanced' | 'high';

const splitPoemLines = (text: string) =>
  (text.match(/[^，。！？；]+[，。！？；]?/g) ?? [text]).map((line) => line.trim()).filter(Boolean);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function App() {
  const [selection, setSelection] = useState<Selection>({ kind: 'poet', poet: poetById['li-bai'] });
  const [mode, setMode] = useState<GalaxyMode>('explore');
  const [query, setQuery] = useState('');
  const [activeDynasties, setActiveDynasties] = useState<Dynasty[]>(dynastyOrder);
  const [focusId, setFocusId] = useState('li-bai');
  const [visualQuality, setVisualQuality] = useState<VisualQuality>(() => (prefersReducedMotion() ? 'performance' : 'high'));

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => {
      if (media.matches) setVisualQuality('performance');
    };
    media.addEventListener?.('change', handleChange);
    return () => media.removeEventListener?.('change', handleChange);
  }, []);

  const filteredPoets = useMemo(() => {
    const q = query.trim().toLowerCase();
    return poets.filter((poet) => {
      const inDynasty = activeDynasties.includes(poet.dynasty);
      const inQuery = !q || [poet.name, poet.dynasty, poet.summary, ...poet.themes, ...poet.works].some((text) =>
        text.toLowerCase().includes(q)
      );
      return inDynasty && inQuery;
    });
  }, [activeDynasties, query]);

  const filteredPoems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return poems.filter((poem) => {
      const poet = poetById[poem.poetId];
      const inDynasty = activeDynasties.includes(poem.dynasty);
      const inQuery = !q || [poem.title, poem.excerpt, poem.form, poet.name, ...poem.themes].some((text) =>
        text.toLowerCase().includes(q)
      );
      return inDynasty && inQuery;
    });
  }, [activeDynasties, query]);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) return;

    const timer = window.setTimeout(() => {
      const directPoet = filteredPoets.find((poet) => poet.name.toLowerCase().includes(q));
      const directPoem = filteredPoems.find((poem) =>
        [poem.title, poem.excerpt, poem.fullText].some((text) => text.toLowerCase().includes(q))
      );

      if (directPoem) {
        const poet = poetById[directPoem.poetId];
        setSelection({ kind: 'poem', poem: directPoem, poet });
        setFocusId(poet.id);
        setMode('reading');
        return;
      }

      if (directPoet) {
        setSelection({ kind: 'poet', poet: directPoet });
        setFocusId(directPoet.id);
        setMode('explore');
        return;
      }

      if (filteredPoets[0]) {
        setSelection({ kind: 'poet', poet: filteredPoets[0] });
        setFocusId(filteredPoets[0].id);
      }
    }, visualQuality === 'performance' ? 420 : 320);

    return () => window.clearTimeout(timer);
  }, [query, filteredPoems, filteredPoets, visualQuality]);

  const verseFragments = useMemo(() => {
    if (selection.kind === 'poem') {
      return splitPoemLines(selection.poem.fullText).slice(0, visualQuality === 'performance' ? 5 : 9);
    }

    const poetPoems = poemsByPoet[selection.poet.id] ?? [];
    const poemLines = poetPoems.flatMap((poem) => splitPoemLines(poem.excerpt));
    return [...selection.poet.works.map((work) => `《${work}》`), ...poemLines, selection.poet.summary].slice(0, visualQuality === 'performance' ? 5 : 9);
  }, [selection, visualQuality]);

  const activeRelations = useMemo(
    () => selection.poet.relations.map((relation) => poetById[relation]).filter((poet): poet is Poet => Boolean(poet)),
    [selection]
  );

  function handleSelectPoet(poet: Poet) {
    setSelection({ kind: 'poet', poet });
    setFocusId(poet.id);
    if (mode === 'tour') setMode('explore');
  }

  function handleSelectPoem(poem: Poem) {
    const poet = poetById[poem.poetId];
    setSelection({ kind: 'poem', poem, poet });
    setFocusId(poet.id);
    setMode('reading');
  }

  function toggleDynasty(dynasty: Dynasty) {
    setActiveDynasties((current) => {
      if (current.includes(dynasty)) {
        const next = current.filter((item) => item !== dynasty);
        return next.length ? next : current;
      }
      return [...current, dynasty];
    });
  }

  const searchActive = query.trim().length > 0;
  const accent = dynastyColors[selection.poet.dynasty];

  return (
    <div className={`app-shell mode-${mode} quality-${visualQuality} ${searchActive ? 'searching' : ''}`}>
      <GalaxyScene
        mode={mode}
        focusId={focusId}
        activeDynasties={activeDynasties}
        filteredPoets={filteredPoets}
        onSelectPoet={handleSelectPoet}
        selection={selection}
        visualQuality={visualQuality}
      />

      <div className="sky-noise" />
      <div className="vignette" />
      <div className="search-warp" style={{ '--accent': accent } as CSSProperties}>
        <i />
        <span>{searchActive ? `正在解析「${query.trim()}」的诗歌坐标` : '等待诗歌坐标输入'}</span>
      </div>
      <div className="center-reticle">
        <i />
        <span>{selection.kind === 'poem' ? `POEM LOCK · ${selection.poem.title}` : `POET LOCK · ${selection.poet.name}`}</span>
      </div>

      {mode === 'reading' && (
        <div className="poetry-verse-cloud" style={{ '--accent': accent } as CSSProperties}>
          {verseFragments.map((line, index) => (
            <span key={`${line}-${index}`} style={{ '--i': index } as CSSProperties}>{line}</span>
          ))}
        </div>
      )}

      {mode === 'network' && (
        <div className="network-overview" style={{ '--accent': accent } as CSSProperties}>
          <div className="network-title">
            <small>RELATION GRAPH</small>
            <strong>{selection.poet.name} 的诗人关系网络</strong>
          </div>
          <div className="network-web">
            <button className="network-node core" onClick={() => handleSelectPoet(selection.poet)}>{selection.poet.name}</button>
            {activeRelations.map((poet, index) => (
              <button
                key={poet.id}
                className="network-node"
                onClick={() => handleSelectPoet(poet)}
                style={{ '--i': index, '--node': dynastyColors[poet.dynasty] } as CSSProperties}
              >
                {poet.name}
              </button>
            ))}
          </div>
          <p>点击节点可让镜头飞入对应诗人恒星。</p>
        </div>
      )}

      <div className="top-title">
        <div>
          <span className="eyebrow">POEM CLOUD · FULL HISTORY OBSERVATORY</span>
          <h1>诗云</h1>
        </div>
        <div className="metrics-strip">
          <span><b>32,657</b> 位诗人</span>
          <span><b>933,857</b> 首诗</span>
          <span><b>3,000</b> 年时间轴</span>
        </div>
      </div>

      <Hud
        query={query}
        setQuery={setQuery}
        mode={mode}
        setMode={setMode}
        visualQuality={visualQuality}
        setVisualQuality={setVisualQuality}
        filteredPoets={filteredPoets}
        filteredPoems={filteredPoems}
        activeDynasties={activeDynasties}
        toggleDynasty={toggleDynasty}
        onSelectPoet={handleSelectPoet}
        onSelectPoem={handleSelectPoem}
      />

      <PoetryPanel
        selection={selection}
        mode={mode}
        setMode={setMode}
        onSelectPoem={handleSelectPoem}
      />

      <div className="era-ruler">
        {dynastyOrder.map((dynasty) => (
          <button
            key={dynasty}
            className={activeDynasties.includes(dynasty) ? 'active' : ''}
            onClick={() => toggleDynasty(dynasty)}
            style={{ '--era': dynastyColors[dynasty] } as CSSProperties}
          >
            <i />
            <span>{dynasty}</span>
          </button>
        ))}
      </div>

      <div className="bottom-console">
        <div className="scanline" />
        <span>SEARCH 自动飞入</span>
        <span>CLICK 锁定诗人恒星</span>
        <span>READING 诗句悬浮</span>
        <span>QUALITY {visualQuality.toUpperCase()}</span>
      </div>
    </div>
  );
}

export default App;
