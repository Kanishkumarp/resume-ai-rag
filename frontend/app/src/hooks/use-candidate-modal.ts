import { useMemo, useState } from 'react';
import { uiStore } from '../lib/stores/ui.store';
import { getCandidateProfile } from '../lib/api/candidate.api';
import type { CandidateProfile } from '../../../../src/types/candidate.types';
import type { SearchResult } from '../../../../src/types/search.types';

export function useCandidateModal() {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openModal = async (candidateId: string, result?: Partial<SearchResult> | null) => {
    uiStore.selectCandidate(candidateId);
    setSelectedCandidateId(candidateId);
    setCandidate(null);
    setError(null);
    setLoading(true);
    setOpen(true);

    try {
      const nextCandidate = await getCandidateProfile(candidateId, result);
      setCandidate(nextCandidate);
    } catch (profileError) {
      setError(profileError instanceof Error ? profileError.message : 'Candidate profile could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    uiStore.selectCandidate(null);
    setSelectedCandidateId(null);
    setCandidate(null);
    setError(null);
    setOpen(false);
  };

  return useMemo(() => ({ selectedCandidateId, candidate, open, loading, error, openModal, close }), [selectedCandidateId, candidate, open, loading, error]);
}
