import { Routes, Route, Navigate } from "react-router-dom"
import AdminLayout from "../components/layout/AdminLayout"
import ProtectedRoute from "../components/ProtectedRoute"
import HomePage from "../modules/home/HomePage"
import LoginPage from "../modules/auth/LoginPage"
import RegisterPage from "../modules/auth/RegisterPage"
import DashboardPage from "../modules/dashboard/DashboardPage"
import ProductsPage from "../modules/products/ProductsPage"
import BrandsPage from "../modules/brands/BrandsPage"
import CategoriesPage from "../modules/categories/CategoriesPage"
import VendorsPage from "../modules/vendors/VendorsPage"
import ZonesPage from "../modules/zones/ZonesPage"
import DealersPage from "../modules/dealers/DealersPage"
import BuyersPage from "../modules/buyers/BuyersPage"
import OrdersPage from "../modules/orders/OrdersPage"

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Admin routes — protected */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="brands" element={<BrandsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="vendors" element={<VendorsPage />} />
        <Route path="zones" element={<ZonesPage />} />
        <Route path="dealers" element={<DealersPage />} />
        <Route path="buyers" element={<BuyersPage />} />
        <Route path="orders" element={<OrdersPage />} />
      </Route>

      {/* Legacy redirect */}
      <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}
