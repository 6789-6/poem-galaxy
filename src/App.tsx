import { useMemo, useState } from 'react';
import GalaxyScene from './components/GalaxyScene';
import Hud from './components/Hud';
import PoetryPanel from './components/PoetryPanel';
import type { Dynasty, Poem, Poet } from './data/poetry';
import { dynastyColors, dynastyOrder, poems, poetById, poets } from './data/poetry';

export type Selection =
  | { kind: 'poet'; poet: Poet }
  | { kind: 'poem'; poem: Poem; poet: Poet };

export type GalaxyMode = 'explore' | 'network' | 'reading' | 'tour';

function App() {
  const [selection, setSelection] = useState<Selection>({ kind: 'poet', poet: poetById['li-bai'] });
  const [mode, setMode] = useState<GalaxyMode>('explore');
  const [query, setQuery] = useState('');
  const [activeDynasties, setActiveDynasties] = useState<Dynasty[]>(dynastyOrder);
  const [focusId, setFocusId] = useState('li-bai');

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

  return (
    <div className={`app-shell mode-${mode}`}>
      <GalaxyScene
        mode={mode}
        focusId={focusId}
        activeDynasties={activeDynasties}
        filteredPoets={filteredPoets}
        onSelectPoet={handleSelectPoet}
        selection={selection}
      />

      <div className="sky-noise" />
      <div className="vignette" />
      <div className="center-reticle">
        <i />
        <span>POEM COORDINATE LOCK</span>
      </div>

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
            style={{ '--era': dynastyColors[dynasty] } as React.CSSProperties}
          >
            <i />
            <span>{dynasty}</span>
          </button>
        ))}
      </div>

      <div className="bottom-console">
        <div className="scanline" />
        <span>DRAG 旋转星云</span>
        <span>WHEEL 缩放</span>
        <span>CLICK 锁定诗人恒星</span>
        <span>NETWORK 关系航线</span>
      </div>
    </div>
  );
}

export default App;
