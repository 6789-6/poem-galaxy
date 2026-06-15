import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useState } from 'react';
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
        <section className="globe-hud globe-hud-top">
          <div>
            <p className="eyebrow">POETRY CLOUD · 3D OBSERVATORY</p>
            <h1>诗云</h1>
          </div>
          <div className="stats">
            <span>{poets.length.toLocaleString()} 位诗人节点</span>
            <span>{poems.length.toLocaleString()} 个诗作入口</span>
            <span>{dynastyCount} 条朝代星带</span>
            <span>H 隐藏界面</span>
          </div>
        </section>
      )}

      {hudVisible && (
        <section className="globe-hud globe-panel">
          <p className="eyebrow">LAYER</p>
          <h2>
            {viewMode === 'overview' && '总览：朝代星带'}
            {viewMode === 'poet' && selectedPoet?.name}
            {viewMode === 'poem' && selectedPoem?.title}
          </h2>
          {viewMode === 'overview' && (
            <>
              <p>拖动旋转，滚轮缩放，点击光点进入诗人星域。诗人现在按时代分布在不同纬度星带上，唐宋星带密度最高。</p>
              <div className="tag-row">
                {dynastyStats.map((item) => (
                  <span key={item.dynasty} style={{ borderColor: item.color, color: item.color }}>
                    {item.dynasty} · {item.count}
                  </span>
                ))}
              </div>
            </>
          )}
          {viewMode === 'poet' && selectedPoet && (
            <>
              <p>{selectedPoet.dynasty} · {selectedPoet.years}</p>
              <p>{selectedPoet.summary}</p>
              <div className="tag-row">
                {selectedPoet.themes.map((theme) => <span key={theme}>{theme}</span>)}
              </div>
              <div className="poem-list">
                {selectedPoetPoems.map((poem) => (
                  <button key={poem.id} onClick={() => selectPoem(poem)}>
                    <b>{poem.title}</b>
                    <small>{poem.excerpt}</small>
                  </button>
                ))}
              </div>
            </>
          )}
          {viewMode === 'poem' && selectedPoem && (
            <>
              <p>{selectedPoem.form}</p>
              <p className="poem-text">{selectedPoem.fullText}</p>
              <div className="tag-row">
                {selectedPoem.themes.map((theme) => <span key={theme}>{theme}</span>)}
              </div>
            </>
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
        </section>
      )}

      {hudVisible && hoveredName && <div className="hover-badge">{hoveredName}</div>}
    </main>
  );
}
