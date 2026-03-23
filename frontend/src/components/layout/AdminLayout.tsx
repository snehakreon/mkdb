import { useState } from "react"
import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

const navItems = [
  { path: "/admin", label: "Dashboard", icon: "📊" },
  { path: "/admin/orders", label: "Orders", icon: "📦" },
  { path: "/admin/products", label: "Products", icon: "🏗️" },
  { path: "/admin/brands", label: "Brands", icon: "🏷️" },
  { path: "/admin/categories", label: "Categories", icon: "📁" },
  { path: "/admin/buyers", label: "Buyers", icon: "🏢" },
  { path: "/admin/dealers", label: "Dealers", icon: "🤝" },
  { path: "/admin/vendors", label: "Vendors", icon: "🏭" },
  { path: "/admin/zones", label: "Zones", icon: "🗺️" },
  { path: "/admin/coupons", label: "Coupons", icon: "🎟️" },
  { path: "/admin/inventory", label: "Inventory", icon: "📋" },
  { path: "/admin/admin-users", label: "Admin Users", icon: "👤" },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-16"} bg-white border-r border-gray-200 transition-all duration-200 flex flex-col`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-gray-200">
          <img src="/logo.png" alt="Material King" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
          {sidebarOpen && <h1 className="text-lg font-bold text-primary-700 ml-2">Material King</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto text-gray-500 hover:text-gray-700 p-1"
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 mx-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-primary-50 text-primary-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span className="ml-3">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold text-gray-800">Admin Panel</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full capitalize">
              {user?.userType}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
