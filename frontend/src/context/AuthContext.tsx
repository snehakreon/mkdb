import { createContext, useState, useEffect, ReactNode } from "react"

interface User {
  id: string
  role: string
  firstName: string
}

interface AuthContextType {
  user: User | null
  login: (token: string, user: User) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  const login = (token: string, userData: User) => {
    localStorage.setItem("accessToken", token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem("accessToken")
    setUser(null)
  }

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) return
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
