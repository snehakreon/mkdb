import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

const apiClient = axios.create({
  baseURL: API_CONFIG.API_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const apiService = {
  async getAll<T>(endpoint: string): Promise<T[]> {
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  async getById<T>(endpoint: string, id: string): Promise<T> {
    const response = await apiClient.get(`${endpoint}/${id}`);
    return response.data;
  },

  async create<T>(endpoint: string, data: any): Promise<T> {
    const response = await apiClient.post(endpoint, data);
    return response.data;
  },

  async update<T>(endpoint: string, id: string, data: any): Promise<T> {
    const response = await apiClient.put(`${endpoint}/${id}`, data);
    return response.data;
  },

  async delete(endpoint: string, id: string): Promise<void> {
    await apiClient.delete(`${endpoint}/${id}`);
  },
};

export default apiService;
