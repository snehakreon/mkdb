import { apiService, PaginatedResult } from './api.service';
import { Vendor } from '../types';
import { API_CONFIG } from '../config/api.config';

const MOCK_VENDORS: Vendor[] = [
  {
    id: '1', company_name: 'ABC Distributors Pvt Ltd',
    contact_name: 'John Doe', email: 'john@abc.com', phone: '9876543210',
    gstin: '27AAACR5678C1Z9', city: 'Mumbai', state: 'Maharashtra',
    is_active: true, is_verified: true
  },
  {
    id: '2', company_name: 'XYZ Suppliers Ltd',
    contact_name: 'Jane Smith', email: 'jane@xyz.com', phone: '9876543211',
    gstin: '27AAAXS1234D1Z5', city: 'Delhi', state: 'Delhi',
    is_active: true, is_verified: false
  },
];

export const vendorService = {
  async getAll(): Promise<Vendor[]> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.getAll<Vendor>('/vendors');
    }
    return Promise.resolve(MOCK_VENDORS);
  },

  async getPaginated(page = 1, pageSize = 20): Promise<PaginatedResult<Vendor>> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.getPaginated<Vendor>('/vendors', { page, pageSize });
    }
    return { data: MOCK_VENDORS, pagination: { page: 1, pageSize: 20, total: MOCK_VENDORS.length, totalPages: 1 } };
  },

  async create(data: Partial<Vendor>): Promise<Vendor> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.create<Vendor>('/vendors', data);
    }
    return Promise.resolve({ ...data, id: String(Date.now()), is_active: true, is_verified: false } as Vendor);
  },

  async update(id: string, data: Partial<Vendor>): Promise<Vendor> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.update<Vendor>('/vendors', id, data);
    }
    return Promise.resolve({ ...data, id } as Vendor);
  },

  async delete(id: string): Promise<void> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.delete('/vendors', id);
    }
    return Promise.resolve();
  },
};
