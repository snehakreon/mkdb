import { apiService } from './api.service';

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string;
}

export const couponService = {
  async getAll(): Promise<Coupon[]> {
    return apiService.getAll<Coupon>('/coupons');
  },
  async create(data: Partial<Coupon>): Promise<Coupon> {
    return apiService.create<Coupon>('/coupons', data);
  },
  async update(id: string, data: Partial<Coupon>): Promise<Coupon> {
    return apiService.update<Coupon>('/coupons', id, data);
  },
  async delete(id: string): Promise<void> {
    return apiService.delete('/coupons', id);
  },
};
