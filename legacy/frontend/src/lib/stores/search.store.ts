import { create } from 'zustand';
import type { SearchMode } from '../../types/search.types';

interface SearchState {
  mode: SearchMode;
  weights: { bm25: number; vector: number };
  limit: number;
  setMode: (mode: SearchMode) => void;
  setWeights: (weights: { bm25: number; vector: number }) => void;
  setLimit: (limit: number) => void;
  reset: () => void;
}

const initialWeights = { bm25: 50, vector: 50 };

export const useSearchStore = create<SearchState>((set) => ({
  mode: 'hybrid',
  weights: initialWeights,
  limit: 5,
  setMode: (mode) => set({ mode }),
  setWeights: (weights) => set({ weights }),
  setLimit: (limit) => set({ limit }),
  reset: () => set({ mode: 'hybrid', weights: initialWeights, limit: 5 }),
}));

export const searchStore = {
  getState: () => useSearchStore.getState(),
  setMode: (mode: SearchMode) => useSearchStore.getState().setMode(mode),
  setWeights: (weights: { bm25: number; vector: number }) => useSearchStore.getState().setWeights(weights),
  setLimit: (limit: number) => useSearchStore.getState().setLimit(limit),
};
