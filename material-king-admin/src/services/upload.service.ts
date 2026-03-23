import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

// Dedicated upload client — no default Content-Type so axios auto-detects FormData boundary
const uploadClient = axios.create({
  baseURL: API_CONFIG.API_BASE_URL,
  timeout: 60000,
});

uploadClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('mk_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Backend serves uploads from http://localhost:5000/uploads/
const UPLOAD_BASE = API_CONFIG.API_BASE_URL.replace('/api', '');

export const uploadService = {
  async uploadImage(file: File, folder: string = 'products'): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    const response = await uploadClient.post(`/upload/image/${folder}`, formData);
    return `${UPLOAD_BASE}${response.data.url}`;
  },

  async uploadImages(files: File[], folder: string = 'products'): Promise<string[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    const response = await uploadClient.post(`/upload/images/${folder}`, formData);
    return response.data.files.map((f: { url: string }) => `${UPLOAD_BASE}${f.url}`);
  },
};
