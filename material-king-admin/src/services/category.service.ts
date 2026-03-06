import { apiService } from './api.service';
import { Category } from '../types';
import { API_CONFIG } from '../config/api.config';

const MOCK_CATEGORIES: Category[] = [
  { id: '1', category_name: 'Plywood', category_code: 'plywood', is_active: true },
  { id: '2', category_name: 'Cement', category_code: 'cement', is_active: true },
  { id: '3', category_name: 'Tiles', category_code: 'tiles', is_active: true },
];

export const categoryService = {
  async getAll(): Promise<Category[]> {
    return API_CONFIG.USE_REAL_API 
      ? apiService.getAll<Category>('/categories') 
      : Promise.resolve(MOCK_CATEGORIES);
  },

  async create(data: Partial<Category>): Promise<Category> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.create<Category>('/categories', data);
    }
    return Promise.resolve({ ...data, id: String(Date.now()), is_active: true } as Category);
  },

  async update(id: string, data: Partial<Category>): Promise<Category> {
    return API_CONFIG.USE_REAL_API 
      ? apiService.update<Category>('/categories', id, data) 
      : Promise.resolve({ ...data, id } as Category);
  },

  async delete(id: string): Promise<void> {
    return API_CONFIG.USE_REAL_API 
      ? apiService.delete('/categories', id) 
      : Promise.resolve();
  },
};
