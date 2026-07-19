import type { AuthorRecord, PoemRecord, RelationRecord } from '../data/schema';
import type { GalaxyMode } from '../state/galaxy-reducer';

export interface FocusPanelProps {
  mode: GalaxyMode;
  selectedAuthor: AuthorRecord | null;
  selectedPoem: PoemRecord | null;
  authors: AuthorRecord[];
  loadedPoems: PoemRecord[];
  relations: RelationRecord[];
  selectionError: Error | null;
  onSelectPoem: (poemId: string, authorId: string) => void;
  onBack: () => void;
  onRetrySelection: (() => void) | null;
}

function ThemeList({ themes }: { themes: string[] }) {
  return themes.length ? (
    <ul className="theme-list" aria-label="主题">
      {themes.map((theme) => <li key={theme}>{theme}</li>)}
    </ul>
  ) : null;
}

function SelectionFailure({ error, onRetry }: { error: Error | null; onRetry: (() => void) | null }) {
  if (!error || !onRetry) return null;
  return (
    <div className="selection-error">
      <p>{error.message}</p>
      <button type="button" onClick={onRetry}>重试载入</button>
    </div>
  );
}

function AuthorContent({
  author,
  authors,
  loadedPoems,
  relations,
  mode,
  onSelectPoem
}: {
  author: AuthorRecord;
  authors: AuthorRecord[];
  loadedPoems: PoemRecord[];
  relations: RelationRecord[];
  mode: GalaxyMode;
  onSelectPoem: FocusPanelProps['onSelectPoem'];
}) {
  const poems = loadedPoems.filter((poem) => poem.authorId === author.id);
  const related = relations.filter((relation) => relation.fromId === author.id || relation.toId === author.id);
  const authorById = new Map(authors.map((candidate) => [candidate.id, candidate]));

  return (
    <article className={`author-focus mode-${mode}`}>
      <header>
        <p>{mode === 'network' ? '关系网络' : '诗人星位'}</p>
        <h2>{author.name}</h2>
        <p>{author.years ?? '生卒未详'}</p>
      </header>
      <p>{author.summary ?? '暂无生平简介'}</p>
      <ThemeList themes={author.themes} />
      <section aria-labelledby="representative-poems-heading">
        <h3 id="representative-poems-heading">代表诗作</h3>
        {poems.length ? (
          <ul>
            {poems.map((poem) => (
              <li key={poem.id}>
                <button type="button" onClick={() => onSelectPoem(poem.id, poem.authorId)}>{poem.title}</button>
              </li>
            ))}
          </ul>
        ) : <p>诗作载入后将在此呈现</p>}
      </section>
      <section aria-labelledby="relations-heading">
        <h3 id="relations-heading">人物关系</h3>
        {related.length ? (
          <ul>
            {related.map((relation) => {
              const otherId = relation.fromId === author.id ? relation.toId : relation.fromId;
              const source = relation.sourceUrl
                ? <a href={relation.sourceUrl} target="_blank" rel="noreferrer">{relation.sourceLabel}</a>
                : <span>{relation.sourceLabel}</span>;
              return (
                <li key={`${relation.fromId}-${relation.toId}-${relation.type}`}>
                  <span>{authorById.get(otherId)?.name ?? otherId}</span>
                  <span>{relation.type}</span>
                  {source}
                </li>
              );
            })}
          </ul>
        ) : <p>暂无已核验关系</p>}
      </section>
    </article>
  );
}

export function FocusPanel({
  mode,
  selectedAuthor,
  selectedPoem,
  authors,
  loadedPoems,
  relations,
  selectionError,
  onSelectPoem,
  onBack,
  onRetrySelection
}: FocusPanelProps) {
  if (mode === 'poem' && selectedPoem) {
    const author = authors.find((candidate) => candidate.id === selectedPoem.authorId);
    const metadataOnly = selectedPoem.textAvailability === 'metadata-only';
    return (
      <>
        <SelectionFailure error={selectionError} onRetry={onRetrySelection} />
        <article className="poem-focus">
        <button type="button" onClick={onBack}>返回诗人</button>
        <header>
          <h2>{selectedPoem.title}</h2>
          <p>{author?.name ?? selectedPoem.authorId}</p>
          {selectedPoem.form ? <p>{selectedPoem.form}</p> : null}
        </header>
        {metadataOnly ? (
          <p>仅提供题名与主题索引，不提供未经授权全文</p>
        ) : (
          <div className="poem-lines">
            {selectedPoem.lines.map((line, index) => <p key={`${selectedPoem.id}-${index}`}>{line}</p>)}
          </div>
        )}
        <ThemeList themes={selectedPoem.themes} />
        </article>
      </>
    );
  }

  if (selectedAuthor && (mode === 'poet' || mode === 'network' || mode === 'tour')) {
    return (
      <>
        <SelectionFailure error={selectionError} onRetry={onRetrySelection} />
        <AuthorContent
          author={selectedAuthor}
          authors={authors}
          loadedPoems={loadedPoems}
          relations={relations}
          mode={mode}
          onSelectPoem={onSelectPoem}
        />
      </>
    );
  }

  return (
    <section className="overview-focus" aria-labelledby="overview-heading">
      <h2 id="overview-heading">{selectionError ? '载入未完成' : '中华诗词星河'}</h2>
      <p>搜索诗人或诗作，或从星图中选择一颗诗人星。</p>
      <SelectionFailure error={selectionError} onRetry={onRetrySelection} />
    </section>
  );
}
