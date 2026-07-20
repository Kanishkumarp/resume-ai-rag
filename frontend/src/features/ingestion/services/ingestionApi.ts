export async function uploadResume(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/v1/resume/inject', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Resume upload failed');
  }

  return response.json();
}
