import { useMemo, useState } from 'react';
import { uiStore } from '../lib/stores/ui.store';
import { getCandidateProfile } from '../lib/api/candidate.api';
import type { CandidateProfile } from '../types/candidate.types';
import type { SearchResult } from '../types/search.types';

export function useCandidateModal() {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const openModal = async (candidateId: string, result?: Partial<SearchResult> | null) => {
    uiStore.selectCandidate(candidateId);
    setSelectedCandidateId(candidateId);
    setCandidate(null);
    setLoading(true);
    setOpen(true);

    try {
      const nextCandidate = await getCandidateProfile(candidateId, result);
      setCandidate(nextCandidate);
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    uiStore.selectCandidate(null);
    setSelectedCandidateId(null);
    setCandidate(null);
    setOpen(false);
  };

  return useMemo(() => ({ selectedCandidateId, candidate, open, loading, openModal, close }), [selectedCandidateId, candidate, open, loading]);
}
