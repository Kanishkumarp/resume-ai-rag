import { create } from 'zustand';
import { uploadResume } from './ingestion.api';

interface IngestionState {
  isUploading: boolean;
  error: string | null;
  lastUpload: unknown;
  uploadResume: (file: File) => Promise<void>;
}

export const useIngestionStore = create<IngestionState>((set) => ({
  isUploading: false,
  error: null,
  lastUpload: null,
  uploadResume: async (file) => {
    set({ isUploading: true, error: null });
    try {
      const result = await uploadResume(file);
      set({ lastUpload: result, isUploading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      set({ error: message, isUploading: false });
    }
  },
}));
