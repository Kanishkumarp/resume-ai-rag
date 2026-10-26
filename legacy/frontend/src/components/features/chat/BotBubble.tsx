import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function BotBubble({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="bot-bubble"
    >
      {children}
    </motion.div>
  );
}
