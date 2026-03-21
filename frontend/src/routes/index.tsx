import { Routes, Route, Navigate } from "react-router-dom"

// Layouts
import PublicLayout from "../components/layout/PublicLayout"
import AdminLayout from "../components/layout/AdminLayout"
import AccountLayout from "../components/layout/AccountLayout"
import ProtectedRoute from "../components/ProtectedRoute"

// Public storefront pages
import HomePage from "../modules/home/HomePage"
import LoginPage from "../modules/auth/LoginPage"
import RegisterPage from "../modules/auth/RegisterPage"
import ProductsListPage from "../modules/storefront/ProductsListPage"
import ProductDetailPage from "../modules/storefront/ProductDetailPage"
import StorefrontCategoriesPage from "../modules/storefront/CategoriesPage"
import CartPage from "../modules/storefront/CartPage"
import CheckoutPage from "../modules/storefront/CheckoutPage"
import OrderConfirmationPage from "../modules/storefront/OrderConfirmationPage"
import AboutPage from "../modules/storefront/AboutPage"
import ContactPage from "../modules/storefront/ContactPage"

// Buyer account pages
import MyAccountPage from "../modules/account/MyAccountPage"
import MyOrdersPage from "../modules/account/MyOrdersPage"
import AddressesPage from "../modules/account/AddressesPage"
import WishlistPage from "../modules/account/WishlistPage"

// Admin CRUD pages
import DashboardPage from "../modules/dashboard/DashboardPage"
import AdminProductsPage from "../modules/products/ProductsPage"
import BrandsPage from "../modules/brands/BrandsPage"
import AdminCategoriesPage from "../modules/categories/CategoriesPage"
import VendorsPage from "../modules/vendors/VendorsPage"
import ZonesPage from "../modules/zones/ZonesPage"
import DealersPage from "../modules/dealers/DealersPage"
import BuyersPage from "../modules/buyers/BuyersPage"
import OrdersPage from "../modules/orders/OrdersPage"
import CouponsPage from "../modules/coupons/CouponsPage"
import AdminUsersPage from "../modules/admin-users/AdminUsersPage"

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth pages (own layout, no header/footer) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Public storefront — with header + footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/categories" element={<StorefrontCategoriesPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation/:id" element={
          <ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>
        } />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Buyer account — protected, within storefront layout */}
        <Route path="/account" element={
          <ProtectedRoute>
            <AccountLayout />
          </ProtectedRoute>
        }>
          <Route index element={<MyAccountPage />} />
          <Route path="orders" element={<MyOrdersPage />} />
          <Route path="addresses" element={<AddressesPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
        </Route>
      </Route>

      {/* Admin panel — protected */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="brands" element={<BrandsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="vendors" element={<VendorsPage />} />
        <Route path="zones" element={<ZonesPage />} />
        <Route path="dealers" element={<DealersPage />} />
        <Route path="buyers" element={<BuyersPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="coupons" element={<CouponsPage />} />
        <Route path="admin-users" element={<AdminUsersPage />} />
      </Route>

      {/* Legacy redirect */}
      <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}
