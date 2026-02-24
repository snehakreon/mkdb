import { apiService } from './api.service';
import { Vendor } from '../types';
import { API_CONFIG } from '../config/api.config';

const MOCK_VENDORS: Vendor[] = [
  { 
    id: '1', 
    vendor_code: 'VND-001', 
    company_name: 'ABC Distributors Pvt Ltd', 
    gstin: '27AAACR5678C1Z9',
    contact_person_name: 'John Doe',
    contact_phone: '9876543210',
    contact_email: 'john@abc.com',
    verification_status: 'verified',
    is_active: true 
  },
  { 
    id: '2', 
    vendor_code: 'VND-002', 
    company_name: 'XYZ Suppliers Ltd', 
    gstin: '27AAAXS1234D1Z5',
    contact_person_name: 'Jane Smith',
    contact_phone: '9876543211',
    contact_email: 'jane@xyz.com',
    verification_status: 'pending',
    is_active: true 
  },
];

export const vendorService = {
  async getAll(): Promise<Vendor[]> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.getAll<Vendor>('/vendors');
    }
    return Promise.resolve(MOCK_VENDORS);
  },

  async create(data: Partial<Vendor>): Promise<Vendor> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.create<Vendor>('/vendors', data);
    }
    const newVendor = { 
      ...data, 
      id: String(Date.now()), 
      verification_status: 'pending',
      is_active: true 
    } as Vendor;
    return Promise.resolve(newVendor);
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
