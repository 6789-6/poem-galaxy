import type { CSSProperties, Dispatch, SetStateAction } from 'react';
import type { GalaxyMode } from '../App';
import type { Dynasty, Poem, Poet } from '../data/poetry';
import { dynastyColors, dynastyOrder, poetById } from '../data/poetry';

type HudProps = {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  mode: GalaxyMode;
  setMode: Dispatch<SetStateAction<GalaxyMode>>;
  filteredPoets: Poet[];
  filteredPoems: Poem[];
  activeDynasties: Dynasty[];
  toggleDynasty: (dynasty: Dynasty) => void;
  onSelectPoet: (poet: Poet) => void;
  onSelectPoem: (poem: Poem) => void;
};

const modeLabel: Record<GalaxyMode, string> = {
  explore: '漫游',
  network: '关系网',
  reading: '读诗',
  tour: '巡航'
};

export default function Hud({
  query,
  setQuery,
  mode,
  setMode,
  filteredPoets,
  filteredPoems,
  activeDynasties,
  toggleDynasty,
  onSelectPoet,
  onSelectPoem
}: HudProps) {
  return (
    <aside className="hud-panel left-panel">
      <div className="panel-header">
        <span className="panel-kicker">SEARCH / FILTER</span>
        <h2>寻诗</h2>
      </div>

      <div className="search-box">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索诗人、诗名、意象：李白 / 月 / 赤壁"
        />
        <button onClick={() => setQuery('')}>清空</button>
      </div>

      <div className="mode-grid">
        {(['explore', 'network', 'reading', 'tour'] as GalaxyMode[]).map((item) => (
          <button key={item} className={mode === item ? 'active' : ''} onClick={() => setMode(item)}>
            {modeLabel[item]}
          </button>
        ))}
      </div>

      <section className="control-section">
        <div className="section-title">朝代星云</div>
        <div className="dynasty-list">
          {dynastyOrder.map((dynasty) => (
            <button
              key={dynasty}
              className={activeDynasties.includes(dynasty) ? 'active' : ''}
              onClick={() => toggleDynasty(dynasty)}
              style={{ '--dynasty': dynastyColors[dynasty] } as CSSProperties}
            >
              <i />
              {dynasty}
            </button>
          ))}
        </div>
      </section>

      <section className="control-section">
        <div className="section-title">高亮诗人</div>
        <div className="result-list poet-list">
          {filteredPoets.slice(0, 8).map((poet) => (
            <button key={poet.id} onClick={() => onSelectPoet(poet)}>
              <span>{poet.name}</span>
              <small>{poet.dynasty} · {poet.works.length} 代表作</small>
            </button>
          ))}
        </div>
      </section>

      <section className="control-section poem-results">
        <div className="section-title">诗歌坐标</div>
        <div className="result-list">
          {filteredPoems.slice(0, 7).map((poem) => (
            <button key={poem.id} onClick={() => onSelectPoem(poem)}>
              <span>《{poem.title}》</span>
              <small>{poetById[poem.poetId].name} · {poem.form}</small>
              <em>{poem.excerpt}</em>
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}
