import { apiService, PaginatedResult } from './api.service';
import { Order } from '../types';
import { API_CONFIG } from '../config/api.config';

const MOCK_ORDERS: Order[] = [
  {
    id: '1', order_number: 'ORD-0000001', status: 'pending',
    total_amount: 59000, shipping_address: '123 Main St, Mumbai',
    buyer_id: '1', dealer_id: null, vendor_id: null,
    buyer_company: 'ABC Builders',
    created_at: new Date().toISOString()
  },
];

export const orderService = {
  async getAll(): Promise<Order[]> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.getAll<Order>('/orders');
    }
    return Promise.resolve(MOCK_ORDERS);
  },

  async getPaginated(page = 1, pageSize = 20): Promise<PaginatedResult<Order>> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.getPaginated<Order>('/orders', { page, pageSize });
    }
    return { data: MOCK_ORDERS, pagination: { page: 1, pageSize: 20, total: MOCK_ORDERS.length, totalPages: 1 } };
  },

  async getById(id: string): Promise<any> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.getById<any>('/orders', id);
    }
    return Promise.resolve({ ...MOCK_ORDERS[0], items: [] });
  },

  async create(data: any): Promise<Order> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.create<Order>('/orders', data);
    }
    return Promise.resolve({ ...data, id: String(Date.now()), order_number: 'ORD-0000001' } as Order);
  },

  async update(id: string, data: any): Promise<Order> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.update<Order>('/orders', id, data);
    }
    return Promise.resolve({ ...data, id } as Order);
  },

  async delete(id: string): Promise<void> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.delete('/orders', id);
    }
    return Promise.resolve();
  },
};
