import type { CSSProperties, Dispatch, SetStateAction } from 'react';
import type { GalaxyMode, Selection } from '../App';
import type { Poem } from '../data/poetry';
import { dynastyColors, poemsByPoet } from '../data/poetry';

type PoetryPanelProps = {
  selection: Selection;
  mode: GalaxyMode;
  setMode: Dispatch<SetStateAction<GalaxyMode>>;
  onSelectPoem: (poem: Poem) => void;
};

export default function PoetryPanel({ selection, mode, setMode, onSelectPoem }: PoetryPanelProps) {
  const poet = selection.poet;
  const works = poemsByPoet[poet.id] ?? [];
  const color = dynastyColors[poet.dynasty];

  return (
    <aside className="hud-panel right-panel" style={{ '--accent': color } as CSSProperties}>
      <div className="panel-header detail-header">
        <span className="panel-kicker">SELECTED STAR</span>
        <h2>{selection.kind === 'poem' ? `《${selection.poem.title}》` : poet.name}</h2>
        <p>{poet.dynasty} · {poet.years}</p>
      </div>

      <div className="orbit-card">
        <div className="big-star" />
        <div>
          <span>恒星亮度</span>
          <b>{Math.round(poet.brightness * 1000).toLocaleString()} cd</b>
        </div>
        <div>
          <span>诗歌轨道</span>
          <b>{selection.kind === 'poem' ? '已锁定' : `${works.length || poet.works.length} 首精选`}</b>
        </div>
      </div>

      {selection.kind === 'poet' ? (
        <>
          <section className="detail-section">
            <div className="section-title">诗人星域</div>
            <p className="summary-text">{poet.summary}</p>
            <div className="tag-row">
              {poet.themes.map((theme) => <span key={theme}>{theme}</span>)}
            </div>
          </section>

          <section className="detail-section">
            <div className="section-title">代表作轨道</div>
            <div className="work-list">
              {works.map((poem) => (
                <button key={poem.id} onClick={() => onSelectPoem(poem)}>
                  <strong>《{poem.title}》</strong>
                  <span>{poem.excerpt}</span>
                </button>
              ))}
              {!works.length && poet.works.map((title) => (
                <button key={title}>
                  <strong>《{title}》</strong>
                  <span>待接入全文数据</span>
                </button>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="reader-card">
          <div className="poem-meta">
            <span>{selection.poem.form}</span>
            <span>{poet.name}</span>
            <span>{selection.poem.dynasty}</span>
          </div>
          <p className="poem-text">{selection.poem.fullText}</p>
          <div className="tag-row">
            {selection.poem.themes.map((theme) => <span key={theme}>{theme}</span>)}
          </div>
        </section>
      )}

      <section className="detail-section">
        <div className="section-title">关系航线</div>
        <div className="relation-row">
          {poet.relations.map((relation) => (
            <span key={relation}>{relation}</span>
          ))}
        </div>
      </section>

      <div className="panel-actions">
        <button className={mode === 'network' ? 'active' : ''} onClick={() => setMode('network')}>查看关系网络</button>
        <button className={mode === 'reading' ? 'active' : ''} onClick={() => setMode('reading')}>沉浸读诗</button>
      </div>
    </aside>
  );
}
