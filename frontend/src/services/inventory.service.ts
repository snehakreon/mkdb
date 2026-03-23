import { api } from "./api"

export const inventoryService = {
  getStockLevels: (params?: Record<string, string>) => api.get("/inventory", { params }),
  getSummary: () => api.get("/inventory/summary"),
  getTransactions: (params?: Record<string, string>) => api.get("/inventory/transactions", { params }),
  updateStock: (productId: string, data: { quantity: number; reason?: string }) => api.put(`/inventory/${productId}`, data),
}
