import { useSearchStore } from '../lib/stores/search.store';

export function resolvePresetMode(preset: 'balanced' | 'bm25' | 'vector', currentMode: 'vector' | 'bm25' | 'hybrid') {
  if (preset === 'bm25') {
    return 'bm25' as const;
  }

  if (preset === 'vector') {
    return 'vector' as const;
  }

  return currentMode;
}

export function useHybridWeights() {
  const weights = useSearchStore((state) => state.weights);
  const setWeights = useSearchStore((state) => state.setWeights);
  const setMode = useSearchStore((state) => state.setMode);

  const updateWeight = (key: 'bm25' | 'vector', value: number) => {
    const clamped = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
    const next = { ...weights, [key]: clamped };

    if (key === 'bm25') {
      next.vector = 100 - clamped;
    } else {
      next.bm25 = 100 - clamped;
    }

    setWeights(next);
  };

  const applyPreset = (preset: 'balanced' | 'bm25' | 'vector') => {
    if (preset === 'bm25') {
      setWeights({ bm25: 100, vector: 0 });
      setMode('bm25');
      return;
    }

    if (preset === 'vector') {
      setWeights({ bm25: 0, vector: 100 });
      setMode('vector');
      return;
    }

    setWeights({ bm25: 50, vector: 50 });
    setMode('hybrid');
  };

  return { weights, updateWeight, applyPreset };
}
