import { api } from "./api"

export const dashboardService = {
  getStats: () => api.get("/dashboard/stats"),
  getOrdersByStatus: () => api.get("/dashboard/orders-by-status"),
  getRevenueByMonth: () => api.get("/dashboard/revenue-by-month"),
  getTopProducts: () => api.get("/dashboard/top-products"),
  getRecentOrders: () => api.get("/dashboard/recent-orders"),
}
