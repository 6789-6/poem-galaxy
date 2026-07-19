import type { DynastyId } from '../data/schema';

export type GalaxyMode = 'overview' | 'poet' | 'poem' | 'network' | 'tour';

export interface GalaxyState {
  mode: GalaxyMode;
  selectedAuthorId: string | null;
  selectedPoemId: string | null;
  activeDynasties: DynastyId[];
  hudVisible: boolean;
  tourIndex: number;
}

export type GalaxyAction =
  | { type: 'SELECT_AUTHOR'; authorId: string }
  | { type: 'SELECT_POEM'; poemId: string; authorId: string }
  | { type: 'SET_DYNASTIES'; dynasties: DynastyId[] }
  | { type: 'ENTER_NETWORK' }
  | { type: 'START_TOUR' }
  | { type: 'ADVANCE_TOUR'; index: number; authorId: string }
  | { type: 'TOGGLE_HUD' }
  | { type: 'BACK' }
  | { type: 'RESET' };

export const ALL_DYNASTIES: DynastyId[] = ['pre-qin', 'han-wei', 'tang', 'song', 'yuan-ming-qing', 'modern'];

export const initialGalaxyState: GalaxyState = {
  mode: 'overview',
  selectedAuthorId: null,
  selectedPoemId: null,
  activeDynasties: ALL_DYNASTIES,
  hudVisible: true,
  tourIndex: 0
};

export function galaxyReducer(state: GalaxyState, action: GalaxyAction): GalaxyState {
  switch (action.type) {
    case 'SELECT_AUTHOR':
      return { ...state, mode: 'poet', selectedAuthorId: action.authorId, selectedPoemId: null };
    case 'SELECT_POEM':
      return { ...state, mode: 'poem', selectedAuthorId: action.authorId, selectedPoemId: action.poemId };
    case 'SET_DYNASTIES':
      return action.dynasties.length ? { ...state, activeDynasties: action.dynasties } : state;
    case 'ENTER_NETWORK':
      return state.selectedAuthorId ? { ...state, mode: 'network' } : state;
    case 'START_TOUR':
      return { ...state, mode: 'tour', selectedPoemId: null, tourIndex: 0 };
    case 'ADVANCE_TOUR':
      return { ...state, mode: 'tour', tourIndex: action.index, selectedAuthorId: action.authorId, selectedPoemId: null };
    case 'TOGGLE_HUD':
      return { ...state, hudVisible: !state.hudVisible };
    case 'BACK':
      if (state.mode === 'poem') return { ...state, mode: 'poet', selectedPoemId: null };
      if (state.mode === 'poet' || state.mode === 'network') {
        return { ...state, mode: 'overview', selectedAuthorId: null, selectedPoemId: null };
      }
      return { ...initialGalaxyState, activeDynasties: state.activeDynasties, hudVisible: state.hudVisible };
    case 'RESET':
      return initialGalaxyState;
  }
}
