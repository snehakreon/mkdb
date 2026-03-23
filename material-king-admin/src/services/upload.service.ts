import { apiClient } from './api.service';
import { API_CONFIG } from '../config/api.config';

// Backend serves uploads from http://localhost:5000/uploads/
const UPLOAD_BASE = API_CONFIG.API_BASE_URL.replace('/api', '');

export const uploadService = {
  async uploadImage(file: File, folder: string = 'products'): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    // Delete default Content-Type so browser sets multipart/form-data with boundary
    const response = await apiClient.post(`/upload/image/${folder}`, formData, {
      headers: { 'Content-Type': undefined },
    } as any);
    return `${UPLOAD_BASE}${response.data.url}`;
  },

  async uploadImages(files: File[], folder: string = 'products'): Promise<string[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    const response = await apiClient.post(`/upload/images/${folder}`, formData, {
      headers: { 'Content-Type': undefined },
    } as any);
    return response.data.files.map((f: { url: string }) => `${UPLOAD_BASE}${f.url}`);
  },
};
