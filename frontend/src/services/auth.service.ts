import { api } from "./api"

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  phone: string
  password: string
  first_name: string
  last_name: string
  user_type: string
}

export const authService = {
  login: (data: LoginPayload) => api.post("/auth/login", data),
  register: (data: RegisterPayload) => api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
  refresh: (refreshToken: string) => api.post("/auth/refresh", { refreshToken }),
  logout: () => api.post("/auth/logout"),
}
