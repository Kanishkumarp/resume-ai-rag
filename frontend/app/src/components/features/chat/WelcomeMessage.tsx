import { motion } from 'framer-motion';
import { BriefcaseBusiness, Sparkles } from 'lucide-react';

export function WelcomeMessage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl px-4 py-9 text-center text-sm text-slate-200 sm:py-14"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/[0.08] text-red-300 shadow-lg shadow-red-950/20">
        <BriefcaseBusiness size={24} strokeWidth={1.6} />
      </div>
      <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.28em] text-red-300/80">
        Intelligent talent discovery
      </p>
      <h3 className="mx-auto mt-3 max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Find your next great hire.
      </h3>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">
        Describe the role, skills, and experience you need. RecruitBot searches
        your resume library and surfaces the strongest matches.
      </p>
      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-[11px] text-slate-500">
        <Sparkles size={12} className="text-red-300" /> Semantic, keyword, and
        hybrid matching
      </div>
    </motion.div>
  );
}
