import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function UserBubble({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="user-bubble"
    >
      {children}
    </motion.div>
  );
}
