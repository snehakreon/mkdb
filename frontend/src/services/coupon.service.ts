import { api } from "./api"

export const couponService = {
  validate: (code: string, subtotal: number) => api.post("/coupons/validate", { code, subtotal }),
  getAll: () => api.get("/coupons"),
  create: (data: Record<string, unknown>) => api.post("/coupons", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/coupons/${id}`, data),
  delete: (id: string) => api.delete(`/coupons/${id}`),
}
