import { create } from 'zustand';
import type { SearchFilters, SearchMode } from '../../../../../src/types/search.types';

interface SearchState {
  mode: SearchMode;
  weights: { bm25: number; vector: number };
  limit: number;
  filters: SearchFilters;
  generateAnswer: boolean;
  setMode: (mode: SearchMode) => void;
  setWeights: (weights: { bm25: number; vector: number }) => void;
  setLimit: (limit: number) => void;
  setFilters: (filters: SearchFilters) => void;
  setGenerateAnswer: (enabled: boolean) => void;
  reset: () => void;
}

const initialWeights = { bm25: 50, vector: 50 };
const initialFilters: SearchFilters = {};

export const useSearchStore = create<SearchState>((set) => ({
  mode: 'hybrid',
  weights: initialWeights,
  limit: 5,
  filters: initialFilters,
  generateAnswer: false,
  setMode: (mode) => set({ mode }),
  setWeights: (weights) => set({ weights }),
  setLimit: (limit) => set({ limit }),
  setFilters: (filters) => set({ filters }),
  setGenerateAnswer: (generateAnswer) => set({ generateAnswer }),
  reset: () => set({ mode: 'hybrid', weights: initialWeights, limit: 5, filters: initialFilters, generateAnswer: false }),
}));

export const searchStore = {
  getState: () => useSearchStore.getState(),
  setMode: (mode: SearchMode) => useSearchStore.getState().setMode(mode),
  setWeights: (weights: { bm25: number; vector: number }) => useSearchStore.getState().setWeights(weights),
  setLimit: (limit: number) => useSearchStore.getState().setLimit(limit),
};
