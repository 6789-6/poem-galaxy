import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useState, type CSSProperties } from 'react';
import './data/installExpandedPoetry';
import { dynastyColors, dynastyOrder, poets, poems, type Poet, type Poem } from './data/expandedPoetry';
import { PoetryGlobeScene } from './PoetryGlobeSceneFull';

type ViewMode = 'overview' | 'poet' | 'poem';

function findPoetById(id?: string | null) {
  return poets.find((poet) => poet.id === id) ?? null;
}

function findPoemById(id?: string | null) {
  return poems.find((poem) => poem.id === id) ?? null;
}

function getLayerTitle(viewMode: ViewMode, selectedPoet: Poet | null, selectedPoem: Poem | null) {
  if (viewMode === 'poem') return selectedPoem?.title ?? '诗歌阅读层';
  if (viewMode === 'poet') return selectedPoet?.name ?? '诗人星域';
  return '朝代星带总览';
}

function getLayerMeta(viewMode: ViewMode, selectedPoet: Poet | null, selectedPoem: Poem | null) {
  if (viewMode === 'poem') return selectedPoem?.form ?? 'Poem Layer';
  if (viewMode === 'poet' && selectedPoet) return `${selectedPoet.dynasty} · ${selectedPoet.years}`;
  return 'Overview · Dynasty Bands';
}

export function PoetryGlobeAppFloating() {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedPoetId, setSelectedPoetId] = useState<string | null>(null);
  const [selectedPoemId, setSelectedPoemId] = useState<string | null>(null);
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [hudVisible, setHudVisible] = useState(true);

  const selectedPoet = useMemo(() => findPoetById(selectedPoetId), [selectedPoetId]);
  const selectedPoem = useMemo(() => findPoemById(selectedPoemId), [selectedPoemId]);
  const selectedPoetPoems = useMemo(
    () => poems.filter((poem) => poem.poetId === selectedPoetId),
    [selectedPoetId]
  );
  const dynastyCount = useMemo(() => new Set(poets.map((poet) => poet.dynasty)).size, []);
  const dynastyStats = useMemo(
    () => dynastyOrder.map((dynasty) => ({
      dynasty,
      color: dynastyColors[dynasty],
      count: poets.filter((poet) => poet.dynasty === dynasty).length
    })),
    []
  );
  const topDynasties = useMemo(
    () => [...dynastyStats].sort((a, b) => b.count - a.count).slice(0, 4),
    [dynastyStats]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'h') setHudVisible((value) => !value);
      if (event.key === 'Escape') {
        if (viewMode === 'poem') {
          setSelectedPoemId(null);
          setViewMode('poet');
        } else if (viewMode === 'poet') {
          setSelectedPoetId(null);
          setViewMode('overview');
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [viewMode]);

  const selectPoet = (poet: Poet) => {
    setSelectedPoetId(poet.id);
    setSelectedPoemId(null);
    setViewMode('poet');
  };

  const selectPoem = (poem: Poem) => {
    setSelectedPoemId(poem.id);
    setSelectedPoetId(poem.poetId);
    setViewMode('poem');
  };

  const handleSearch = () => {
    const text = query.trim().toLowerCase();
    if (!text) return;
    const poet = poets.find(
      (item) => item.name.toLowerCase().includes(text) || item.themes.some((theme) => theme.toLowerCase().includes(text))
    );
    if (poet) {
      selectPoet(poet);
      return;
    }
    const poem = poems.find(
      (item) =>
        item.title.toLowerCase().includes(text) ||
        item.excerpt.toLowerCase().includes(text) ||
        item.themes.some((theme) => theme.toLowerCase().includes(text))
    );
    if (poem) selectPoem(poem);
  };

  const backLabel = viewMode === 'poem' ? '返回诗人星域' : viewMode === 'poet' ? '返回总览' : '';
  const handleBack = () => {
    if (viewMode === 'poem') {
      setSelectedPoemId(null);
      setViewMode('poet');
      return;
    }
    setSelectedPoetId(null);
    setSelectedPoemId(null);
    setViewMode('overview');
  };

  const layerTitle = getLayerTitle(viewMode, selectedPoet, selectedPoem);
  const layerMeta = getLayerMeta(viewMode, selectedPoet, selectedPoem);

  return (
    <main className={`globe-app floating-globe view-${viewMode}`}>
      <Canvas
        className="globe-canvas"
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 106], fov: 40, near: 0.1, far: 560 }}
        dpr={[1, 1.55]}
      >
        <Suspense fallback={null}>
          <PoetryGlobeScene
            viewMode={viewMode}
            selectedPoetId={selectedPoetId}
            selectedPoemId={selectedPoemId}
            onSelectPoet={selectPoet}
            onSelectPoem={selectPoem}
            onHoverName={setHoveredName}
          />
        </Suspense>
      </Canvas>

      {hudVisible && <div className="stage-frame floating-frame" />}

      {hudVisible && (
        <section className="float-title">
          <span className="float-orb" />
          <div>
            <p className="eyebrow">POETRY ATLAS</p>
            <h1>诗云</h1>
          </div>
        </section>
      )}

      {hudVisible && (
        <section className="float-search" aria-label="搜索诗人或诗作">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
            placeholder="搜索：李白 / 陆游 / 曹操 / 月"
          />
          <button onClick={handleSearch}>定位</button>
        </section>
      )}

      {hudVisible && (
        <section className="float-stats" aria-label="诗云统计">
          <article><b>{poets.length.toLocaleString()}</b><span>诗人</span></article>
          <article><b>{poems.length.toLocaleString()}</b><span>诗作</span></article>
          <article><b>{dynastyCount}</b><span>星带</span></article>
        </section>
      )}

      {hudVisible && viewMode === 'overview' && (
        <section className="float-dynasties" aria-label="朝代星带">
          {dynastyStats.map((item) => (
            <button key={item.dynasty} style={{ '--accent': item.color } as CSSProperties} title={`${item.dynasty} · ${item.count} 位诗人`}>
              <i />
              <span>{item.dynasty}</span>
              <b>{item.count}</b>
            </button>
          ))}
        </section>
      )}

      {hudVisible && (
        <aside className="float-context">
          <header>
            <div>
              <p className="eyebrow">CURRENT FOCUS</p>
              <h2>{layerTitle}</h2>
              <span>{layerMeta}</span>
            </div>
            <em>{viewMode.toUpperCase()}</em>
          </header>

          {viewMode === 'overview' && (
            <div className="float-content compact-overview">
              <p>拖动旋转，滚轮缩放，点击光点进入诗人星域。诗人按朝代分布为悬浮星带。</p>
              <div className="mini-metrics">
                {topDynasties.map((item) => (
                  <span key={item.dynasty} style={{ '--accent': item.color } as CSSProperties}>{item.dynasty}<b>{item.count}</b></span>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'poet' && selectedPoet && (
            <div className="float-content poet-float-card">
              <p>{selectedPoet.summary}</p>
              <div className="floating-tags">
                {selectedPoet.themes.map((theme) => <span key={theme}>{theme}</span>)}
              </div>
              <div className="floating-poems">
                {selectedPoetPoems.slice(0, 6).map((poem) => (
                  <button key={poem.id} onClick={() => selectPoem(poem)}>
                    <b>{poem.title}</b>
                    <small>{poem.excerpt}</small>
                  </button>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'poem' && selectedPoem && (
            <div className="float-content poem-float-card">
              <p>{selectedPoem.fullText}</p>
              <div className="floating-tags">
                {selectedPoem.themes.map((theme) => <span key={theme}>{theme}</span>)}
              </div>
            </div>
          )}
        </aside>
      )}

      {hudVisible && (
        <section className="float-actions">
          {backLabel && <button onClick={handleBack}>{backLabel}</button>}
          <span>拖动旋转</span>
          <span>滚轮缩放</span>
          <span>Esc 返回</span>
          <span>H 隐藏</span>
        </section>
      )}

      {hudVisible && hoveredName && <div className="float-hover">{hoveredName}</div>}
    </main>
  );
}
