import { create } from 'zustand';
import type { UploadState } from '../types';

interface IngestionStore extends UploadState {
  setUploading: (value: boolean) => void;
  setProgress: (value: number) => void;
  setError: (value: string | null) => void;
  setSuccess: (value: boolean) => void;
  setUploadedFileName: (value: string | null) => void;
  reset: () => void;
}

const initialState: UploadState = {
  isUploading: false,
  progress: 0,
  uploadedFileName: null,
  error: null,
  success: false,
};

export const useIngestionStore = create<IngestionStore>((set) => ({
  ...initialState,
  setUploading: (value) => set({ isUploading: value }),
  setProgress: (value) => set({ progress: value }),
  setError: (value) => set({ error: value }),
  setSuccess: (value) => set({ success: value }),
  setUploadedFileName: (value) => set({ uploadedFileName: value }),
  reset: () => set(initialState),
}));
