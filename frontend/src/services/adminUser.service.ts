import { api } from "./api"

export const adminUserService = {
  getAll: () => api.get("/admin-users"),
  create: (data: Record<string, unknown>) => api.post("/admin-users", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/admin-users/${id}`, data),
  delete: (id: string) => api.delete(`/admin-users/${id}`),
}
