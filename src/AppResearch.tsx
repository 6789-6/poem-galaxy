import { useEffect, useMemo, useState } from 'react';
import type { GalaxyMode, Selection, VisualQuality } from './App';
import type { Dynasty, Poet } from './data/poetry';
import { dynastyOrder, poems, poetById, poets } from './data/poetry';
import GalaxyScene from './components/GalaxySceneResearchLite';

const panelStyle: React.CSSProperties = {
  position: 'absolute',
  left: 24,
  top: 24,
  zIndex: 10,
  color: '#eaffff',
  textShadow: '0 0 18px rgba(120,240,255,.45)',
  pointerEvents: 'none'
};

const controlsStyle: React.CSSProperties = {
  position: 'absolute',
  right: 24,
  top: 24,
  zIndex: 12,
  display: 'flex',
  gap: 10,
  alignItems: 'center',
  color: '#dffcff',
  pointerEvents: 'auto'
};

function AppResearch() {
  const [selection, setSelection] = useState<Selection>({ kind: 'poet', poet: poetById['li-bai'] });
  const [mode, setMode] = useState<GalaxyMode>('explore');
  const [query, setQuery] = useState('');
  const [uiHidden, setUiHidden] = useState(true);
  const [visualQuality, setVisualQuality] = useState<VisualQuality>('balanced');
  const [activeDynasties] = useState<Dynasty[]>(dynastyOrder);
  const focusId = selection.poet.id;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'h') setUiHidden((v) => !v);
      if (event.key === 'Escape') setMode('explore');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filteredPoets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return poets;
    return poets.filter((poet) => [poet.name, poet.dynasty, poet.summary, ...poet.themes, ...poet.works].some((text) => text.toLowerCase().includes(q)));
  }, [query]);

  function search() {
    const q = query.trim().toLowerCase();
    if (!q) return;
    const poem = poems.find((item) => [item.title, item.excerpt, item.fullText].some((text) => text.toLowerCase().includes(q)));
    if (poem) {
      const poet = poetById[poem.poetId];
      setSelection({ kind: 'poem', poem, poet });
      setMode('reading');
      return;
    }
    const poet = filteredPoets[0];
    if (poet) setSelection({ kind: 'poet', poet });
  }

  function handleSelectPoet(poet: Poet) {
    setSelection({ kind: 'poet', poet });
  }

  return (
    <div className={`app-shell ${uiHidden ? 'ui-hidden' : ''}`}>
      <GalaxyScene
        mode={mode}
        focusId={focusId}
        activeDynasties={activeDynasties}
        filteredPoets={filteredPoets}
        selection={selection}
        visualQuality={visualQuality}
        onSelectPoet={handleSelectPoet}
      />
      <div className="vignette" />
      {!uiHidden && (
        <div style={panelStyle}>
          <div style={{ fontSize: 12, letterSpacing: 4, opacity: 0.55 }}>POEM CLOUD · WEBGL2 OBSERVATORY</div>
          <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: 2 }}>诗云</div>
          <div style={{ marginTop: 18, lineHeight: 1.8, opacity: 0.78 }}>TypeScript · Three.js · GLSL<br />低频云壳 + GPU 点尘 + 电影化相机</div>
        </div>
      )}
      <div style={controlsStyle}>
        <span style={{ padding: '8px 12px', border: '1px solid rgba(180,250,255,.16)', borderRadius: 999, background: 'rgba(3,8,18,.48)' }}>32,657 诗人 · 933,857 诗作</span>
        <button onClick={() => setUiHidden((v) => !v)}>H</button>
        {!uiHidden && (
          <>
            <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') search(); }} placeholder="搜索 李白 / 月 / 赤壁" />
            <button onClick={search}>飞入</button>
            <button onClick={() => setMode('network')}>关系</button>
            <button onClick={() => setMode('reading')}>读诗</button>
            <button onClick={() => setMode('tour')}>巡航</button>
            <select value={visualQuality} onChange={(e) => setVisualQuality(e.target.value as VisualQuality)}>
              <option value="performance">性能</option>
              <option value="balanced">均衡</option>
              <option value="cinematic">电影</option>
            </select>
          </>
        )}
      </div>
    </div>
  );
}

export default AppResearch;
