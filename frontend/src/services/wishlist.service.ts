import { api } from "./api"

export const wishlistService = {
  getAll: () => api.get("/wishlist"),
  add: (productId: number) => api.post("/wishlist", { product_id: productId }),
  remove: (productId: number) => api.delete(`/wishlist/${productId}`),
  check: (productId: number) => api.get(`/wishlist/check/${productId}`),
}
