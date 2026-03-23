import { api } from "./api"

export const orderService = {
  getAll: () => api.get("/orders"),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: Record<string, unknown>) => api.post("/orders", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/orders/${id}`, data),
  delete: (id: string) => api.delete(`/orders/${id}`),
  getHistory: (id: string) => api.get(`/orders/${id}/history`),
}
