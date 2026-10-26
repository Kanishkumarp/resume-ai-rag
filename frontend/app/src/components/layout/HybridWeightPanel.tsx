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
        className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3"
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold text-white">Ranking balance</p>
          <div className="flex gap-2">
            {['balanced', 'bm25', 'vector'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() =>
                  applyPreset(preset as 'balanced' | 'bm25' | 'vector')
                }
                className="rounded-full border border-white/[0.08] px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-slate-500 transition hover:border-red-400/20 hover:text-white"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <label className="mb-3 block text-xs text-slate-400">
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
            onChange={(event) =>
              updateWeight('bm25', Number(event.target.value))
            }
            className="w-full accent-red-400"
          />
        </label>

        <label className="block text-xs text-slate-400">
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
            onChange={(event) =>
              updateWeight('vector', Number(event.target.value))
            }
            className="w-full accent-orange-400"
          />
        </label>
      </motion.div>
    </AnimatePresence>
  );
}
