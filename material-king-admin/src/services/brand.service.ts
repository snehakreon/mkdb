import { apiService } from './api.service';
import { Brand } from '../types';
import { API_CONFIG } from '../config/api.config';

const MOCK_BRANDS: Brand[] = [
  { id: '1', brand_name: 'Century', brand_code: 'century', is_active: true },
  { id: '2', brand_name: 'Greenply', brand_code: 'greenply', is_active: true },
  { id: '3', brand_name: 'ACC', brand_code: 'acc', is_active: true },
  { id: '4', brand_name: 'UltraTech', brand_code: 'ultratech', is_active: true },
];

export const brandService = {
  async getAll(): Promise<Brand[]> {
    return API_CONFIG.USE_REAL_API ? apiService.getAll<Brand>('/brands') : Promise.resolve(MOCK_BRANDS);
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
