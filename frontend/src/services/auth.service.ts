import { api } from "./api"

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  phone: string
  password: string
  firstName: string
  lastName: string
  userType: string
}

export const authService = {
  login: (data: LoginPayload) => api.post("/auth/login", data),
  register: (data: RegisterPayload) => api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
  refresh: (refreshToken: string) => api.post("/auth/refresh", { refreshToken }),
  logout: () => api.post("/auth/logout"),
}
