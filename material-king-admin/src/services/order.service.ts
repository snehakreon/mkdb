import { apiService, apiClient } from './api.service';
import { Order } from '../types';
import { API_CONFIG } from '../config/api.config';

export interface OrderDetail extends Order {
  payment_method?: string;
  payment_status?: string;
  expected_delivery_date?: string;
  items: OrderLineItem[];
}

export interface OrderLineItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_name: string;
  sku: string;
  image_url?: string;
  fulfillment_status?: string;
  quantity_back_order?: number;
}

export interface StatusHistoryEntry {
  id: string;
  from_status: string;
  to_status: string;
  notes: string | null;
  created_at: string;
  changed_by_email: string | null;
}

export interface TransitionResult {
  id: string;
  status: string;
  previous_status: string;
  allowed_transitions: string[];
}

export const orderService = {
  async getAll(params?: Record<string, any>): Promise<Order[]> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.getAll<Order>('/orders', params);
    }
    return Promise.resolve([]);
  },

  async getById(id: string): Promise<OrderDetail> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.getById<OrderDetail>('/orders', id);
    }
    return Promise.resolve({ items: [] } as any);
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

  async transitionStatus(id: string, status: string, notes?: string): Promise<TransitionResult> {
    const response = await apiClient.post(`/orders/${id}/transition`, { status, notes });
    return response.data;
  },

  async getStatusHistory(id: string): Promise<StatusHistoryEntry[]> {
    const response = await apiClient.get(`/orders/${id}/history`);
    return response.data;
  },
};
