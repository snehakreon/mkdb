import { apiService } from './api.service';
import { Buyer } from '../types';

export const buyerService = {
  async getAll(): Promise<Buyer[]> {
    return apiService.getAll<Buyer>('/buyers');
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
