import { apiService, PaginatedResult } from './api.service';
import { Brand } from '../types';
import { API_CONFIG } from '../config/api.config';

const MOCK_BRANDS: Brand[] = [
  { id: '1', name: 'Century', slug: 'century', is_active: true },
  { id: '2', name: 'Greenply', slug: 'greenply', is_active: true },
  { id: '3', name: 'ACC', slug: 'acc', is_active: true },
  { id: '4', name: 'UltraTech', slug: 'ultratech', is_active: true },
];

export const brandService = {
  async getAll(): Promise<Brand[]> {
    return API_CONFIG.USE_REAL_API ? apiService.getAll<Brand>('/brands') : Promise.resolve(MOCK_BRANDS);
  },
  async getPaginated(page = 1, pageSize = 20): Promise<PaginatedResult<Brand>> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.getPaginated<Brand>('/brands', { page, pageSize });
    }
    return { data: MOCK_BRANDS, pagination: { page: 1, pageSize: 20, total: MOCK_BRANDS.length, totalPages: 1 } };
  },
  async create(data: Partial<Brand>): Promise<Brand> {
    return API_CONFIG.USE_REAL_API ? apiService.create<Brand>('/brands', data) : Promise.resolve({ ...data, id: String(Date.now()), is_active: true } as Brand);
  },
  async update(id: string, data: Partial<Brand>): Promise<Brand> {
    return API_CONFIG.USE_REAL_API ? apiService.update<Brand>('/brands', id, data) : Promise.resolve({ ...data, id } as Brand);
  },
  async delete(id: string): Promise<void> {
    return API_CONFIG.USE_REAL_API ? apiService.delete('/brands', id) : Promise.resolve();
  },
};
