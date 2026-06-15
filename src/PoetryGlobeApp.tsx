import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useState, type CSSProperties } from 'react';
import './data/installExpandedPoetry';
import { dynastyColors, dynastyOrder, poets, poems, type Poet, type Poem } from './data/expandedPoetry';
import { PoetryGlobeScene } from './PoetryGlobeScene';

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

export function PoetryGlobeApp() {
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
    () => [...dynastyStats].sort((a, b) => b.count - a.count).slice(0, 3),
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
    <main className="globe-app">
      <Canvas
        className="globe-canvas"
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 92], fov: 42, near: 0.1, far: 500 }}
        dpr={[1, 1.6]}
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

      {hudVisible && (
        <section className="top-command">
          <div className="brand-block">
            <span className="brand-orb" />
            <div>
              <p className="eyebrow">POETRY CLOUD · 3D OBSERVATORY</p>
              <h1>诗云</h1>
            </div>
          </div>
          <div className="top-stats">
            <article>
              <b>{poets.length.toLocaleString()}</b>
              <span>诗人节点</span>
            </article>
            <article>
              <b>{poems.length.toLocaleString()}</b>
              <span>诗作入口</span>
            </article>
            <article>
              <b>{dynastyCount}</b>
              <span>朝代星带</span>
            </article>
          </div>
        </section>
      )}

      {hudVisible && (
        <aside className="layer-panel">
          <div className="panel-orbit" />
          <header className="panel-header">
            <div>
              <p className="eyebrow">CURRENT LAYER</p>
              <h2>{layerTitle}</h2>
              <span className="layer-meta">{layerMeta}</span>
            </div>
            <span className={`mode-chip mode-${viewMode}`}>{viewMode.toUpperCase()}</span>
          </header>

          {viewMode === 'overview' && (
            <div className="panel-section">
              <p className="lead-text">拖动旋转诗云球，滚轮缩放，点击光点进入诗人星域。诗人按朝代分布在不同纬度星带，唐宋为高密度主星带。</p>
              <div className="focus-metrics">
                {topDynasties.map((item) => (
                  <div key={item.dynasty} style={{ '--accent': item.color } as CSSProperties}>
                    <span>{item.dynasty}</span>
                    <b>{item.count}</b>
                  </div>
                ))}
              </div>
              <div className="tag-row dynasty-tags">
                {dynastyStats.map((item) => (
                  <span key={item.dynasty} style={{ borderColor: item.color, color: item.color }}>
                    {item.dynasty} · {item.count}
                  </span>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'poet' && selectedPoet && (
            <div className="panel-section">
              <p className="lead-text">{selectedPoet.summary}</p>
              <div className="tag-row">
                {selectedPoet.themes.map((theme) => <span key={theme}>{theme}</span>)}
              </div>
              <div className="poem-list">
                {selectedPoetPoems.map((poem) => (
                  <button key={poem.id} onClick={() => selectPoem(poem)}>
                    <span className="poem-index">POEM</span>
                    <b>{poem.title}</b>
                    <small>{poem.excerpt}</small>
                  </button>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'poem' && selectedPoem && (
            <div className="panel-section poem-reader-card">
              <p className="poem-text">{selectedPoem.fullText}</p>
              <div className="tag-row">
                {selectedPoem.themes.map((theme) => <span key={theme}>{theme}</span>)}
              </div>
            </div>
          )}

          <div className="search-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
              placeholder="搜索：李白 / 陆游 / 曹操 / 月"
            />
            <button onClick={handleSearch}>定位</button>
          </div>
          {backLabel && <button className="back-btn" onClick={handleBack}>{backLabel}</button>}
        </aside>
      )}

      {hudVisible && (
        <section className="control-dock">
          <span>拖动旋转</span>
          <span>滚轮缩放</span>
          <span>点击进入</span>
          <span>Esc 返回</span>
          <span>H 隐藏界面</span>
        </section>
      )}

      {hudVisible && hoveredName && <div className="hover-badge">{hoveredName}</div>}
    </main>
  );
}
