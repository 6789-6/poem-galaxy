import type { CSSProperties } from 'react';
import type { AuthorRecord, RelationRecord } from '../data/schema';
import type { GalaxyState } from '../state/galaxy-reducer';

export interface StaticGalaxyProps {
  state: GalaxyState;
  authors: AuthorRecord[];
  relations: RelationRecord[];
  onSelectAuthor: (authorId: string) => void;
}

export function StaticGalaxy({ state, authors, relations, onSelectAuthor }: StaticGalaxyProps) {
  const visibleAuthors = authors.filter((author) => state.activeDynasties.includes(author.dynasty));

  return (
    <section className="static-galaxy" data-testid="static-galaxy" aria-label="静态诗人星图">
      {Array.from({ length: 6 }, (_, index) => (
        <span
          className="static-orbit"
          key={index}
          style={{ '--orbit-index': index } as CSSProperties}
          aria-hidden="true"
        />
      ))}
      <div className="static-author-stars">
        {visibleAuthors.map((author, index) => (
          <button
            className="static-author"
            type="button"
            key={author.id}
            aria-pressed={state.selectedAuthorId === author.id}
            style={{
              '--star-x': index % 5,
              '--star-y': Math.floor(index / 5) % 5
            } as CSSProperties}
            onClick={() => onSelectAuthor(author.id)}
          >
            {author.name}
          </button>
        ))}
      </div>
      <p className="static-relations">已载入 {relations.length} 条关系轨迹</p>
    </section>
  );
}
