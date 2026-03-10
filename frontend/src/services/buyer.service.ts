import { api } from "./api"

export const buyerService = {
  getAll: () => api.get("/buyers"),
  getById: (id: string) => api.get(`/buyers/${id}`),
  create: (data: Record<string, unknown>) => api.post("/buyers", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/buyers/${id}`, data),
  delete: (id: string) => api.delete(`/buyers/${id}`),
}
