import { apiService, apiClient } from './api.service';
import { API_CONFIG } from '../config/api.config';

export interface StockItem {
  id: string;
  name: string;
  sku: string;
  stock_qty: number;
  min_order_qty: number;
  price: number;
  mrp: number;
  is_active: boolean;
  lead_time_days: number | null;
  category_name: string | null;
  brand_name: string | null;
  stock_status: 'out_of_stock' | 'low_stock' | 'in_stock';
}

export interface InventorySummary {
  total_products: string;
  out_of_stock: string;
  low_stock: string;
  in_stock: string;
  total_units: string;
  total_stock_value: string;
}

export interface InventoryTransaction {
  id: string;
  product_id: string;
  transaction_type: 'add' | 'reduce' | 'reserve' | 'adjust';
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  reason: string | null;
  reference_type: string | null;
  reference_id: string | null;
  created_at: string;
  product_name: string;
  sku: string;
}

export const inventoryService = {
  async getStockLevels(filter?: 'low'): Promise<StockItem[]> {
    if (API_CONFIG.USE_REAL_API) {
      const params: Record<string, any> = { limit: 200 };
      if (filter === 'low') params.alert = 'low';
      return apiService.getAll<StockItem>('/inventory', params);
    }
    return Promise.resolve([]);
  },

  async getSummary(): Promise<InventorySummary> {
    if (API_CONFIG.USE_REAL_API) {
      const response = await apiClient.get('/inventory/summary');
      return response.data;
    }
    return Promise.resolve({
      total_products: '0', out_of_stock: '0', low_stock: '0',
      in_stock: '0', total_units: '0', total_stock_value: '0',
    });
  },

  async getTransactions(productId?: string): Promise<InventoryTransaction[]> {
    if (API_CONFIG.USE_REAL_API) {
      const params: Record<string, any> = { limit: 100 };
      if (productId) params.product_id = productId;
      return apiService.getAll<InventoryTransaction>('/inventory/transactions', params);
    }
    return Promise.resolve([]);
  },

  async updateStock(productId: string, quantity: number, reason: string): Promise<any> {
    if (API_CONFIG.USE_REAL_API) {
      const response = await apiClient.put(`/inventory/${productId}`, { quantity, reason });
      return response.data;
    }
    return Promise.resolve({ product_id: productId, old_qty: 0, new_qty: quantity, change: quantity });
  },
};
