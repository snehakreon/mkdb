import { apiService } from './api.service';
import { Order } from '../types';
import { API_CONFIG } from '../config/api.config';

const MOCK_ORDERS: Order[] = [
  {
    id: '1', order_number: 'ORD-0000001', order_type: 'direct', order_status: 'pending',
    payment_status: 'pending', subtotal: 50000, shipping_cost: 0, tax_amount: 9000,
    discount_amount: 0, total_amount: 59000,
    delivery_address: '123 Main St', delivery_pincode: '400001',
    delivery_contact_name: 'Ramesh', delivery_contact_phone: '9876543210',
    buyer_id: '1', project_id: '1', dealer_id: null, zone_id: '1', assigned_vendor_id: null,
    buyer_company: 'ABC Builders', project_name: 'Project Alpha', zone_name: 'Mumbai North',
    expected_delivery_date: null, buyer_notes: '', admin_notes: '',
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
