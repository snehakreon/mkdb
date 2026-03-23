import { apiClient } from './api.service';
import { API_CONFIG } from '../config/api.config';

const dashboardGet = async <T>(path: string): Promise<T> => {
  const response = await apiClient.get(`/dashboard/${path}`);
  return response.data;
};

export interface DashboardStats {
  total_orders: string;
  pending_orders: string;
  delivered_orders: string;
  cancelled_orders: string;
  total_revenue: string;
  total_products: string;
  out_of_stock_products: string;
  total_buyers: string;
  total_dealers: string;
  total_vendors: string;
}

export interface OrdersByStatus {
  name: string;
  value: number;
}

export interface RevenueByMonth {
  month: string;
  year: string;
  month_num: string;
  revenue: string;
  orders: number;
}

export interface TopProduct {
  name: string;
  sku: string;
  units_sold: number;
  revenue: string;
}

export interface RecentOrder {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: string;
  created_at: string;
  buyer_company: string | null;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    if (API_CONFIG.USE_REAL_API) {
      return dashboardGet<DashboardStats>('stats');
    }
    return {
      total_orders: '0', pending_orders: '0', delivered_orders: '0', cancelled_orders: '0',
      total_revenue: '0', total_products: '0', out_of_stock_products: '0',
      total_buyers: '0', total_dealers: '0', total_vendors: '0',
    };
  },

  async getOrdersByStatus(): Promise<OrdersByStatus[]> {
    if (API_CONFIG.USE_REAL_API) {
      return dashboardGet<OrdersByStatus[]>('orders-by-status');
    }
    return [];
  },

  async getRevenueByMonth(): Promise<RevenueByMonth[]> {
    if (API_CONFIG.USE_REAL_API) {
      return dashboardGet<RevenueByMonth[]>('revenue-by-month');
    }
    return [];
  },

  async getTopProducts(): Promise<TopProduct[]> {
    if (API_CONFIG.USE_REAL_API) {
      return dashboardGet<TopProduct[]>('top-products');
    }
    return [];
  },

  async getRecentOrders(): Promise<RecentOrder[]> {
    if (API_CONFIG.USE_REAL_API) {
      return dashboardGet<RecentOrder[]>('recent-orders');
    }
    return [];
  },
};
