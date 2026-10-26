import { create } from 'zustand';
import type { IngestionState, IngestionStatus } from '../types/ingestion.types';

const initialState: IngestionState = {
  status: 'idle',
  progress: 0,
  error: null,
  fileName: null,
  isSuccess: false,
  stepIndex: 0,
};

interface IngestionStore extends IngestionState {
  setStatus: (status: IngestionStatus) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  setFileName: (fileName: string | null) => void;
  setIsSuccess: (isSuccess: boolean) => void;
  setStepIndex: (stepIndex: number) => void;
  setUploadState: (partial: Partial<IngestionState>) => void;
  reset: () => void;
}

export const useIngestionStore = create<IngestionStore>((set) => ({
  ...initialState,
  setStatus: (status) => set({ status }),
  setProgress: (progress) => set({ progress }),
  setError: (error) => set({ error }),
  setFileName: (fileName) => set({ fileName }),
  setIsSuccess: (isSuccess) => set({ isSuccess }),
  setStepIndex: (stepIndex) => set({ stepIndex }),
  setUploadState: (partial) => set((state) => ({ ...state, ...partial })),
  reset: () => set(initialState),
}));
