import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

export const uploadResume = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/v1/resume/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
