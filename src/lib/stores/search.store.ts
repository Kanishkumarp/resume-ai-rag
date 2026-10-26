import { create } from 'zustand';
import type { SearchFilters, SearchMode } from '../../types/search.types';

interface SearchState {
  mode: SearchMode;
  weights: { bm25: number; vector: number };
  limit: number;
  filters: SearchFilters;
  setMode: (mode: SearchMode) => void;
  setWeights: (weights: { bm25: number; vector: number }) => void;
  setLimit: (limit: number) => void;
  setFilters: (filters: SearchFilters) => void;
  reset: () => void;
}

const initialWeights = { bm25: 50, vector: 50 };
const initialFilters: SearchFilters = {};

export const useSearchStore = create<SearchState>((set) => ({
  mode: 'hybrid',
  weights: initialWeights,
  limit: 5,
  filters: initialFilters,
  setMode: (mode) => set({ mode }),
  setWeights: (weights) => set({ weights }),
  setLimit: (limit) => set({ limit }),
  setFilters: (filters) => set({ filters }),
  reset: () => set({ mode: 'hybrid', weights: initialWeights, limit: 5, filters: initialFilters }),
}));

export const searchStore = {
  getState: () => useSearchStore.getState(),
  setMode: (mode: SearchMode) => useSearchStore.getState().setMode(mode),
  setWeights: (weights: { bm25: number; vector: number }) => useSearchStore.getState().setWeights(weights),
  setLimit: (limit: number) => useSearchStore.getState().setLimit(limit),
};
