import { api } from "./api"

export const zoneService = {
  getAll: () => api.get("/zones"),
  getById: (id: string) => api.get(`/zones/${id}`),
  create: (data: Record<string, unknown>) => api.post("/zones", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/zones/${id}`, data),
  delete: (id: string) => api.delete(`/zones/${id}`),
}
