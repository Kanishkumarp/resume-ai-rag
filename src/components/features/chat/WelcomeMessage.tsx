import { motion } from 'framer-motion';

export function WelcomeMessage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-4 text-sm text-slate-200 shadow-lg shadow-black/10"
    >
      <p className="font-semibold text-white">Welcome to RecruitBot</p>
      <p className="mt-2 text-slate-300">Search resumes by mode, review ranked matches, and use the chat to summarize or compare candidates.</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
        <span className="rounded-full bg-white/10 px-2.5 py-1">Vector • semantic similarity</span>
        <span className="rounded-full bg-white/10 px-2.5 py-1">BM25 • keyword matching</span>
        <span className="rounded-full bg-white/10 px-2.5 py-1">Hybrid • balanced ranking</span>
      </div>
    </motion.div>
  );
}
