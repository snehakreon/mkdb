import { api } from "./api"

export const productService = {
  getAll: () => api.get("/products"),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: Record<string, unknown>) => api.post("/products", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
}
