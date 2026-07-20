import apiClient from '../../../lib/api/client';

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Network error';
}

export async function uploadResume(file: File): Promise<{ success: boolean }> {
  const formData = new FormData();
  formData.append('file', file, file.name);

  try {
    const response = await apiClient.post('/v1/resume/inject', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status >= 400) {
      throw new Error('Network error');
    }

    return { success: true };
  } catch (error) {
    const message = normalizeErrorMessage(error);
    if (message.includes('extract')) {
      throw new Error('PDF extraction failed');
    }
    if (message.includes('parse')) {
      throw new Error('Resume parsing failed');
    }
    if (message.includes('embed') || message.includes('embedding')) {
      throw new Error('Embedding generation failed');
    }
    if (message.includes('mongo') || message.includes('atlas')) {
      throw new Error('MongoDB ingestion failed');
    }
    if (message.includes('Network')) {
      throw new Error('Network error');
    }
    throw new Error(message || 'Network error');
  }
}
