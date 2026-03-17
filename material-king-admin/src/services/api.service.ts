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
    const token = localStorage.getItem('mk_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — auto-refresh expired tokens
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('mk_refresh_token');
      if (!refreshToken) {
        localStorage.removeItem('mk_auth_token');
        localStorage.removeItem('mk_refresh_token');
        localStorage.removeItem('mk_user');
        window.location.reload();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_CONFIG.API_BASE_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem('mk_auth_token', data.accessToken);
        localStorage.setItem('mk_refresh_token', data.refreshToken);
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('mk_auth_token');
        localStorage.removeItem('mk_refresh_token');
        localStorage.removeItem('mk_user');
        window.location.reload();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const apiService = {
  async getAll<T>(endpoint: string): Promise<T[]> {
    const response = await apiClient.get(endpoint);
    // Backend returns paginated responses: { data: [...], pagination: {...} }
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
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

  async upload(endpoint: string, formData: FormData): Promise<any> {
    const response = await apiClient.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default apiService;
