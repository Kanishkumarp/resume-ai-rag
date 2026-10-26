export type IngestionStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

export interface IngestionState {
  status: IngestionStatus;
  progress: number;
  error: string | null;
  fileName: string | null;
  isSuccess: boolean;
  stepIndex: number;
}
