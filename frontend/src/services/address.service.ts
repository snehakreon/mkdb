import { api } from "./api"

export const addressService = {
  getAll: () => api.get("/addresses"),
  create: (data: any) => api.post("/addresses", data),
  update: (id: string | number, data: any) => api.put(`/addresses/${id}`, data),
  delete: (id: string | number) => api.delete(`/addresses/${id}`),
}
