import { apiService, PaginatedResult } from './api.service';
import { Buyer } from '../types';

export const buyerService = {
  async getAll(): Promise<Buyer[]> {
    return apiService.getAll<Buyer>('/buyers');
  },

  async getPaginated(page = 1, pageSize = 20): Promise<PaginatedResult<Buyer>> {
    return apiService.getPaginated<Buyer>('/buyers', { page, pageSize });
  },

  async create(data: any): Promise<Buyer> {
    return apiService.create<Buyer>('/buyers', data);
  },

  async update(id: string, data: any): Promise<Buyer> {
    return apiService.update<Buyer>('/buyers', id, data);
  },

  async delete(id: string): Promise<void> {
    return apiService.delete('/buyers', id);
  },
};
