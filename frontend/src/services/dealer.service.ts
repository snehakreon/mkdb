import { api } from "./api"

export const dealerService = {
  getAll: () => api.get("/dealers"),
  getById: (id: string) => api.get(`/dealers/${id}`),
  create: (data: Record<string, unknown>) => api.post("/dealers", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/dealers/${id}`, data),
  delete: (id: string) => api.delete(`/dealers/${id}`),
}
