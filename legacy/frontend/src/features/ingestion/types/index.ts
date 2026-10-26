export interface UploadState {
  isUploading: boolean;
  progress: number;
  uploadedFileName: string | null;
  error: string | null;
  success: boolean;
}
