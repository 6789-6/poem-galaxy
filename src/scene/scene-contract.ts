import type { AuthorRecord, PoemRecord, RelationRecord } from '../data/schema';
import type { VisualQuality } from '../performance/quality';
import type { GalaxyState } from '../state/galaxy-reducer';

export interface CosmicOperaSceneProps {
  state: GalaxyState;
  quality: VisualQuality;
  authors: AuthorRecord[];
  loadedPoems: PoemRecord[];
  relations: RelationRecord[];
  onSelectAuthor: (authorId: string) => void;
  onSelectPoem: (poemId: string, authorId: string) => void;
  onFpsSample: (fps: number) => void;
}
