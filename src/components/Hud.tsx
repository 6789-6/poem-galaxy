import type { CSSProperties, Dispatch, SetStateAction } from 'react';
import type { GalaxyMode, VisualQuality } from '../App';
import type { Dynasty, Poem, Poet } from '../data/poetry';
import { dynastyColors, dynastyOrder, poetById } from '../data/poetry';

type HudProps = {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  mode: GalaxyMode;
  setMode: Dispatch<SetStateAction<GalaxyMode>>;
  visualQuality: VisualQuality;
  setVisualQuality: Dispatch<SetStateAction<VisualQuality>>;
  filteredPoets: Poet[];
  filteredPoems: Poem[];
  activeDynasties: Dynasty[];
  toggleDynasty: (dynasty: Dynasty) => void;
  onSelectPoet: (poet: Poet) => void;
  onSelectPoem: (poem: Poem) => void;
};

const modeLabel: Record<GalaxyMode, string> = {
  explore: '全史星云',
  network: '关系航线',
  reading: '沉浸读诗',
  tour: '自动巡航'
};

const modeHint: Record<GalaxyMode, string> = {
  explore: '自由漫游三千年诗歌宇宙',
  network: '显示诗人影响与风格传承',
  reading: '靠近诗人星域并展开诗歌',
  tour: '镜头自动穿越高亮恒星'
};

const qualityLabel: Record<VisualQuality, string> = {
  performance: '性能',
  balanced: '均衡',
  high: '电影'
};

const qualityHint: Record<VisualQuality, string> = {
  performance: '关闭 Bloom/DOF，降低 DPR 和动态标签，适合低配设备。',
  balanced: '保留 Bloom，关闭 DOF，兼顾流畅与视频质感。',
  high: '启用 Bloom、读诗 DOF 和完整星空质感，适合桌面端。'
};

export default function Hud({
  query,
  setQuery,
  mode,
  setMode,
  visualQuality,
  setVisualQuality,
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
        <span className="panel-kicker">NAVIGATION CONSOLE</span>
        <h2>诗云观测台</h2>
        <p className="panel-subtitle">从《诗经》到近现代，把诗人、诗作、意象和关系投影到同一片三维星系。</p>
      </div>

      <div className="search-box">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索诗人、诗名、意象：李白 / 月 / 赤壁"
        />
        <button onClick={() => setQuery('')}>重置</button>
      </div>

      <div className="mode-grid">
        {(['explore', 'network', 'reading', 'tour'] as GalaxyMode[]).map((item) => (
          <button key={item} className={mode === item ? 'active' : ''} onClick={() => setMode(item)} title={modeHint[item]}>
            <span>{modeLabel[item]}</span>
            <small>{item.toUpperCase()}</small>
          </button>
        ))}
      </div>

      <section className="control-section quality-section">
        <div className="section-title">画质模式</div>
        <div className="quality-switcher">
          {(['performance', 'balanced', 'high'] as VisualQuality[]).map((quality) => (
            <button
              key={quality}
              className={visualQuality === quality ? 'active' : ''}
              onClick={() => setVisualQuality(quality)}
              title={qualityHint[quality]}
            >
              <span>{qualityLabel[quality]}</span>
              <small>{quality.toUpperCase()}</small>
            </button>
          ))}
        </div>
        <p className="quality-note">电影模式会启用选择性 Bloom 和读诗景深；系统开启“减少动态效果”时会自动降为性能模式。</p>
      </section>

      <section className="control-section data-section">
        <div className="section-title">实时观测</div>
        <div className="data-grid">
          <div><b>{filteredPoets.length}</b><span>高亮诗人</span></div>
          <div><b>{filteredPoems.length}</b><span>样例诗作</span></div>
          <div><b>{activeDynasties.length}/6</b><span>时代星云</span></div>
        </div>
      </section>

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
        <div className="section-title">高亮主星</div>
        <div className="result-list poet-list">
          {filteredPoets.slice(0, visualQuality === 'performance' ? 5 : 8).map((poet) => (
            <button key={poet.id} onClick={() => onSelectPoet(poet)}>
              <span>{poet.name}</span>
              <small>{poet.dynasty} · 亮度 {Math.round(poet.brightness * 100)} · {poet.works.length} 代表作</small>
            </button>
          ))}
        </div>
      </section>

      <section className="control-section poem-results">
        <div className="section-title">诗歌坐标</div>
        <div className="result-list">
          {filteredPoems.slice(0, visualQuality === 'performance' ? 4 : 7).map((poem) => (
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
