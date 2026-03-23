import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

const getAuthHeaders = () => {
  const token = localStorage.getItem('mk_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Backend serves uploads from http://localhost:5000/uploads/
const UPLOAD_BASE = API_CONFIG.API_BASE_URL.replace('/api', '');

export const uploadService = {
  async uploadImage(file: File, folder: string = 'products'): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    const response = await axios.post(
      `${API_CONFIG.API_BASE_URL}/upload/image/${folder}`,
      formData,
      { headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } }
    );
    // response.data.url is like "/uploads/products/filename.jpg"
    return `${UPLOAD_BASE}${response.data.url}`;
  },

  async uploadImages(files: File[], folder: string = 'products'): Promise<string[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    const response = await axios.post(
      `${API_CONFIG.API_BASE_URL}/upload/images/${folder}`,
      formData,
      { headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.files.map((f: { url: string }) => `${UPLOAD_BASE}${f.url}`);
  },
};
