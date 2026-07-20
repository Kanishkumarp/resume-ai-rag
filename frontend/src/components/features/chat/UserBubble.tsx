import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function UserBubble({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="ml-auto max-w-[85%] rounded-2xl bg-gradient-to-r from-indigo-500 to-pink-500 px-4 py-3 text-sm leading-6 text-white shadow-lg shadow-black/20"
    >
      {children}
    </motion.div>
  );
}
