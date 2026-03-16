import { api } from "./api"

export const vendorService = {
  getAll: () => api.get("/vendors"),
  getById: (id: string) => api.get(`/vendors/${id}`),
  create: (data: Record<string, unknown>) => api.post("/vendors", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/vendors/${id}`, data),
  delete: (id: string) => api.delete(`/vendors/${id}`),
}
