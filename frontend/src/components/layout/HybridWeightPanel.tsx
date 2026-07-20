import { AnimatePresence, motion } from 'framer-motion';
import { useHybridWeights } from '../../hooks/use-hybrid-weights';

export function HybridWeightPanel() {
  const { weights, updateWeight, applyPreset } = useHybridWeights();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="weights"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="rounded-2xl border border-white/10 bg-slate-950/70 p-3"
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Hybrid tuning</p>
          <div className="flex gap-2">
            {['balanced', 'bm25', 'vector'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => applyPreset(preset as 'balanced' | 'bm25' | 'vector')}
                className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-400 transition hover:border-indigo-400/20 hover:text-white"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <label className="mb-3 block text-sm text-slate-300">
          <div className="mb-1 flex items-center justify-between">
            <span>BM25</span>
            <span>{weights.bm25}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={weights.bm25}
            onChange={(event) => updateWeight('bm25', Number(event.target.value))}
            className="w-full accent-indigo-400"
          />
        </label>

        <label className="block text-sm text-slate-300">
          <div className="mb-1 flex items-center justify-between">
            <span>Vector</span>
            <span>{weights.vector}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={weights.vector}
            onChange={(event) => updateWeight('vector', Number(event.target.value))}
            className="w-full accent-pink-400"
          />
        </label>
      </motion.div>
    </AnimatePresence>
  );
}
