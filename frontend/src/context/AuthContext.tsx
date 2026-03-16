import { createContext, useState, useEffect, useContext, ReactNode } from "react"
import { api } from "../services/api"

interface User {
  id: string
  email: string
  phone?: string
  firstName: string
  lastName: string
  userType: string
  roles: string[]
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (token: string, refreshToken: string, user: User) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const login = (token: string, refreshToken: string, userData: User) => {
    localStorage.setItem("accessToken", token)
    localStorage.setItem("refreshToken", refreshToken)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    setUser(null)
  }

  const updateUser = (userData: Partial<User>) => {
    setUser((prev) => prev ? { ...prev, ...userData } : null)
  }

  const isAdmin = user?.userType === "admin" || user?.roles?.includes("super_admin") || false

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      setLoading(false)
      return
    }
    api.get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}
