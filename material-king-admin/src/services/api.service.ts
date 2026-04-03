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

// Token refresh state to prevent multiple simultaneous refresh calls
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  failedQueue = [];
};

// Response interceptor with automatic token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401 errors, and not on the refresh endpoint itself
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('mk_refresh_token');
      if (!refreshToken) {
        isRefreshing = false;
        processQueue(error, null);
        // No refresh token — force logout
        localStorage.removeItem('mk_auth_token');
        localStorage.removeItem('mk_refresh_token');
        localStorage.removeItem('mk_user');
        window.location.reload();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_CONFIG.API_BASE_URL}/auth/refresh`, { refreshToken });
        const newAccessToken = data.accessToken;

        localStorage.setItem('mk_auth_token', newAccessToken);
        if (data.refreshToken) {
          localStorage.setItem('mk_refresh_token', data.refreshToken);
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
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

export { apiClient };

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const apiService = {
  async getPaginated<T>(endpoint: string, params?: Record<string, any>): Promise<PaginatedResult<T>> {
    const response = await apiClient.get(endpoint, { params });
    const body = response.data;
    if (body.data && body.pagination) {
      return body;
    }
    return { data: Array.isArray(body) ? body : [], pagination: { page: 1, pageSize: 25, total: 0, totalPages: 1 } };
  },

  async getAll<T>(endpoint: string, params?: Record<string, any>): Promise<T[]> {
    const response = await apiClient.get(endpoint, { params });
    const body = response.data;
    // Support paginated responses: { data: [...], pagination: {...} }
    return Array.isArray(body) ? body : body.data;
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
