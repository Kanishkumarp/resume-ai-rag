import { useMemo, useState } from 'react';
import { uploadResume } from '../services/ingestion.api';
import { useIngestionStore } from '../stores/ingestion.store';
import { IngestionResultScreen } from './IngestionResultScreen';
import { IngestionStepIndicator } from './IngestionStepIndicator';
import { UploadButton } from './UploadButton';
import { UploadDropzone } from './UploadDropzone';
import { UploadProgress } from './UploadProgress';
import { FileUp } from 'lucide-react';

interface ResumeUploadCardProps {
  onUpload?: (file: File, fileName?: string) => Promise<void> | void;
  variant?: 'default' | 'compact';
}

export function ResumeUploadCard({
  onUpload,
  variant = 'default',
}: ResumeUploadCardProps) {
  const compact = variant === 'compact';
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
  const setIsSuccess = useIngestionStore((state) => state.setIsSuccess);
  const reset = useIngestionStore((state) => state.reset);

  const validateFile = (file: File) => {
    const normalizedName = (file.name || '').toLowerCase();
    const looksLikePdf =
      file.type.includes('pdf') || normalizedName.endsWith('.pdf');

    if (!looksLikePdf) {
      return 'Only PDF allowed';
    }

    if (file.size > 5 * 1024 * 1024) {
      return 'Maximum 5MB allowed';
    }

    return null;
  };

  const handleFileSelect = async (file: File) => {
    if (!file) {
      setError('Please select a file');
      setStatus('error');
      setStepIndex(0);
      return;
    }

    setSelectedFile(file);
    const validationError = validateFile(file);
    if (validationError) {
      setFileName(file.name);
      setError(validationError);
      setStatus('error');
      setProgress(0);
      setStepIndex(0);
      setIsSuccess(false);
      return;
    }

    setFileName(file.name);
    setError(null);
    setStatus('uploading');
    setProgress(20);
    setStepIndex(1);
    setIsSuccess(false);

    try {
      if (onUpload) {
        await onUpload(file, file.name);
      } else {
        await uploadResume(file);
      }
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
      setIsSuccess(true);
      setError(null);
    } catch (uploadError) {
      setStatus('error');
      setProgress(0);
      setStepIndex(0);
      setError(
        uploadError instanceof Error ? uploadError.message : 'Network error',
      );
    }
  };

  const helperText = useMemo(() => {
    if (status === 'success') return 'Resume uploaded successfully';
    if (status === 'uploading') return 'Uploading resume...';
    if (status === 'processing') return 'Processing resume...';
    if (status === 'error') return error ?? 'Network error';
    return 'Ready to upload your resume';
  }, [error, status]);

  return (
    <div
      className={`w-full rounded-2xl border border-white/[0.07] bg-white/[0.025] shadow-lg shadow-black/20 ${compact ? 'p-3.5' : 'max-w-xl p-6'}`}
    >
      <div className={compact ? 'mb-3' : 'mb-5'}>
        {compact ? (
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-400/15 bg-red-500/[0.07] text-red-300">
              <FileUp size={15} />
            </span>
            <div>
              <h2 className="text-xs font-semibold text-white">Add resumes</h2>
              <p className="mt-0.5 text-[10px] text-slate-500">
                PDF format · up to 5 MB
              </p>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-text-primary">
              Resume Ingestion
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Upload a PDF resume and begin ingestion.
            </p>
          </>
        )}
      </div>

      <UploadDropzone
        onFileSelect={handleFileSelect}
        isUploading={status === 'uploading'}
        error={error}
        status={status}
        compact={compact}
      />

      <div className={compact ? 'mt-2' : 'mt-4'}>
        <UploadButton
          onClick={() => {
            if (selectedFile) {
              void handleFileSelect(selectedFile);
            }
          }}
          disabled={!selectedFile || status === 'uploading'}
          label={
            status === 'uploading'
              ? 'Uploading...'
              : status === 'error'
                ? 'Retry Upload'
                : 'Upload Resume'
          }
        />
      </div>

      <div className={compact ? 'mt-3' : 'mt-4'}>
        <UploadProgress
          progress={progress}
          status={status}
          message={helperText}
          compact={compact}
        />
      </div>

      {!compact ? (
        <div className="mt-4">
          <IngestionStepIndicator currentStep={stepIndex} />
        </div>
      ) : null}

      <div className={`${compact ? 'mt-2' : 'mt-4'} flex gap-2`}>
        <button
          type="button"
          onClick={() => {
            setSelectedFile(null);
            reset();
          }}
          className="rounded-lg border border-white/[0.07] bg-bg-surface px-3 py-2 text-xs text-text-muted transition hover:border-red-400/20 hover:text-white"
        >
          Reset
        </button>
      </div>

      {status === 'success' && (
        <div className={compact ? 'mt-3' : 'mt-4'}>
          <IngestionResultScreen fileName={fileName} />
        </div>
      )}
    </div>
  );
}
