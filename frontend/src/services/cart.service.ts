import { api } from "./api"

export const cartService = {
  get: () => api.get("/cart"),
  add: (product_id: number, quantity: number) => api.post("/cart", { product_id, quantity }),
  update: (productId: number, quantity: number) => api.put(`/cart/${productId}`, { quantity }),
  remove: (productId: number) => api.delete(`/cart/${productId}`),
  clear: () => api.delete("/cart/clear"),
  sync: (items: Array<{ product_id: number; quantity: number }>) => api.post("/cart/sync", { items }),
}
