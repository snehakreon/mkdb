import { Routes, Route } from "react-router-dom"
import HomePage from "../modules/home/HomePage"
import LoginPage from "../modules/auth/LoginPage"
import RegisterPage from "../modules/auth/RegisterPage"
import Dashboard from "../modules/profile/Dashboard"

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  )
}
