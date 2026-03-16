import { api } from "./api"

export const brandService = {
  getAll: () => api.get("/brands"),
  getById: (id: string) => api.get(`/brands/${id}`),
  create: (data: Record<string, unknown>) => api.post("/brands", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/brands/${id}`, data),
  delete: (id: string) => api.delete(`/brands/${id}`),
}
