import { apiService } from './api.service';
import { AdminUser } from '../types';
import { API_CONFIG } from '../config/api.config';

const MOCK_ADMIN_USERS: AdminUser[] = [
  { id: '1', first_name: 'Platform', last_name: 'Admin', email: 'admin@platform.com', phone: '9999999999', is_active: true, is_verified: true, roles: ['super_admin'], created_at: '2026-01-22', last_login_at: '2026-03-21' },
];

export const adminUserService = {
  async getAll(): Promise<AdminUser[]> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.getAll<AdminUser>('/admin-users');
    }
    return Promise.resolve(MOCK_ADMIN_USERS);
  },

  async create(data: Record<string, any>): Promise<AdminUser> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.create<AdminUser>('/admin-users', data);
    }
    return Promise.resolve({ ...data, id: String(Date.now()) } as AdminUser);
  },

  async update(id: string, data: Record<string, any>): Promise<AdminUser> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.update<AdminUser>('/admin-users', id, data);
    }
    return Promise.resolve({ ...data, id } as AdminUser);
  },

  async delete(id: string): Promise<void> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.delete('/admin-users', id);
    }
    return Promise.resolve();
  },
};
