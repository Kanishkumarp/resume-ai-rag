import { motion } from 'framer-motion';
import { Blend, Brain, Search } from 'lucide-react';

export function WelcomeMessage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="welcome-message"
    >
      <p className="welcome-title">Tell us who you’re looking for.</p>
      <p className="welcome-copy">Describe the role, skills, or experience you need. Search through your indexed resumes and review candidates ranked by relevance.</p>
      <div className="welcome-tags" aria-label="Available search methods">
        <span className="welcome-tag"><Brain size={12} /> Vector · semantic</span>
        <span className="welcome-tag"><Search size={12} /> BM25 · keywords</span>
        <span className="welcome-tag"><Blend size={12} /> Hybrid · combined</span>
      </div>
    </motion.div>
  );
}
