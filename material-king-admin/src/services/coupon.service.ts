import { apiService } from './api.service';
import { Coupon } from '../types';
import { API_CONFIG } from '../config/api.config';

const MOCK_COUPONS: Coupon[] = [
  { id: '1', code: 'SAVE10', description: '10% off on all orders', discount_type: 'percentage', discount_value: 10, min_order_amount: 1000, max_discount: 500, usage_limit: 100, used_count: 12, valid_from: '2026-01-01', valid_until: '2026-12-31', is_active: true },
];

export const couponService = {
  async getAll(): Promise<Coupon[]> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.getAll<Coupon>('/coupons');
    }
    return Promise.resolve(MOCK_COUPONS);
  },

  async create(data: Partial<Coupon>): Promise<Coupon> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.create<Coupon>('/coupons', data);
    }
    return Promise.resolve({ ...data, id: String(Date.now()) } as Coupon);
  },

  async update(id: string, data: Partial<Coupon>): Promise<Coupon> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.update<Coupon>('/coupons', id, data);
    }
    return Promise.resolve({ ...data, id } as Coupon);
  },

  async delete(id: string): Promise<void> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.delete('/coupons', id);
    }
    return Promise.resolve();
  },
};
