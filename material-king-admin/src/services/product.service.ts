import { apiService } from './api.service';
import { Product } from '../types';
import { API_CONFIG } from '../config/api.config';

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1', sku: 'PLY-CEN-18MM', name: 'Century 18mm BWP Plywood', slug: 'century-18mm-bwp-plywood',
    category_id: '1', brand_id: '1', category_name: 'Plywood', brand_name: 'Century',
    description: '', specifications: {}, unit: 'piece',
    price: 2500, mrp: 3000, stock_qty: 100, min_order_qty: 1,
    is_active: true
  },
];

export const productService = {
  async getAll(): Promise<Product[]> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.getAll<Product>('/products');
    }
    return Promise.resolve(MOCK_PRODUCTS);
  },

  async getById(id: string): Promise<Product> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.getById<Product>('/products', id);
    }
    return Promise.resolve(MOCK_PRODUCTS[0]);
  },

  async create(data: Partial<Product>): Promise<Product> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.create<Product>('/products', data);
    }
    return Promise.resolve({ ...data, id: String(Date.now()), is_active: true } as Product);
  },

  async update(id: string, data: Partial<Product>): Promise<Product> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.update<Product>('/products', id, data);
    }
    return Promise.resolve({ ...data, id } as Product);
  },

  async delete(id: string): Promise<void> {
    if (API_CONFIG.USE_REAL_API) {
      return apiService.delete('/products', id);
    }
    return Promise.resolve();
  },
};
