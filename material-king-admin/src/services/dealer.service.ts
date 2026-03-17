import { apiService, PaginatedResult } from './api.service';
import { Dealer } from '../types';
import { API_CONFIG } from '../config/api.config';

const MOCK_DEALERS: Dealer[] = [
  {
    id: '1', company_name: 'Sharma Trading Co',
    contact_name: 'Rajesh Sharma', email: 'sharma@trading.com', phone: '9876543210',
    gstin: '27AABCS1234D1Z5', city: 'Mumbai', state: 'Maharashtra',
    is_active: true
  },
];

export const dealerService = {
  async getAll(): Promise<Dealer[]> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.getAll<Dealer>('/dealers');
    }
    return Promise.resolve(MOCK_DEALERS);
  },

  async getPaginated(page = 1, pageSize = 20, search = ''): Promise<PaginatedResult<Dealer>> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.getPaginated<Dealer>('/dealers', { page, pageSize, ...(search && { search }) });
    }
    return { data: MOCK_DEALERS, pagination: { page: 1, pageSize: 20, total: MOCK_DEALERS.length, totalPages: 1 } };
  },

  async getById(id: string): Promise<Dealer> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.getById<Dealer>('/dealers', id);
    }
    return Promise.resolve(MOCK_DEALERS[0]);
  },

  async create(data: Partial<Dealer>): Promise<Dealer> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.create<Dealer>('/dealers', data);
    }
    return Promise.resolve({ ...data, id: String(Date.now()), is_active: true } as Dealer);
  },

  async update(id: string, data: Partial<Dealer>): Promise<Dealer> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.update<Dealer>('/dealers', id, data);
    }
    return Promise.resolve({ ...data, id } as Dealer);
  },

  async delete(id: string): Promise<void> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.delete('/dealers', id);
    }
    return Promise.resolve();
  },
};
