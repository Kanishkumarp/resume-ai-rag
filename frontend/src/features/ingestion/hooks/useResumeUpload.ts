import { useCallback } from 'react';
import { uploadResume } from '../services/ingestion.api';
import { useIngestionStore } from '../stores/ingestion.store';

export function useResumeUpload() {
  const status = useIngestionStore((state) => state.status);
  const progress = useIngestionStore((state) => state.progress);
  const error = useIngestionStore((state) => state.error);
  const fileName = useIngestionStore((state) => state.fileName);
  const stepIndex = useIngestionStore((state) => state.stepIndex);
  const setStatus = useIngestionStore((state) => state.setStatus);
  const setProgress = useIngestionStore((state) => state.setProgress);
  const setError = useIngestionStore((state) => state.setError);
  const setFileName = useIngestionStore((state) => state.setFileName);
  const setStepIndex = useIngestionStore((state) => state.setStepIndex);
  const reset = useIngestionStore((state) => state.reset);

  const startUpload = useCallback(async (file: File) => {
    setError(null);
    setFileName(file.name);
    setStatus('uploading');
    setProgress(20);
    setStepIndex(1);

    try {
      await uploadResume(file);
      setProgress(55);
      setStatus('processing');
      setStepIndex(3);
      await new Promise((resolve) => window.setTimeout(resolve, 400));
      setProgress(80);
      setStepIndex(4);
      await new Promise((resolve) => window.setTimeout(resolve, 400));
      setProgress(100);
      setStatus('success');
      setStepIndex(5);
    } catch (uploadError) {
      setStatus('error');
      setProgress(0);
      setStepIndex(0);
      setError(uploadError instanceof Error ? uploadError.message : 'Network error');
      throw uploadError;
    }
  }, [setError, setFileName, setProgress, setStatus, setStepIndex]);

  return {
    status,
    progress,
    error,
    fileName,
    stepIndex,
    startUpload,
    reset,
    setError,
    setFileName,
  };
}
