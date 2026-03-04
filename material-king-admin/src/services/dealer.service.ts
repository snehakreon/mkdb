import { apiService } from './api.service';
import { Dealer } from '../types';
import { API_CONFIG } from '../config/api.config';

const MOCK_DEALERS: Dealer[] = [
  {
    id: '1', dealer_code: 'DLR-MUM-001', company_name: 'Sharma Trading Co',
    gstin: '27AABCS1234D1Z5', pan: 'AABCS1234D',
    bank_account_number: '1234567890', bank_ifsc: 'SBIN0001234', bank_name: 'SBI', bank_branch: 'Andheri',
    credit_limit: 500000, available_credit: 350000, credit_payment_terms_days: 30,
    approval_status: 'approved', business_address: 'Andheri West, Mumbai',
    contact_phone: '9876543210', contact_email: 'sharma@trading.com'
  },
];

export const dealerService = {
  async getAll(): Promise<Dealer[]> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.getAll<Dealer>('/dealers');
    }
    return Promise.resolve(MOCK_DEALERS);
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
    return Promise.resolve({ ...data, id: String(Date.now()), approval_status: 'pending' } as Dealer);
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
