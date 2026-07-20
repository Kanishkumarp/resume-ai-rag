import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function BotBubble({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="mr-auto max-w-[85%] rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm leading-6 text-slate-200 shadow-lg shadow-black/20"
    >
      {children}
    </motion.div>
  );
}
