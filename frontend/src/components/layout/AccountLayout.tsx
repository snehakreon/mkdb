import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

const accountNav = [
  { path: "/account", label: "My Account", icon: "fa-user", end: true },
  { path: "/account/orders", label: "My Orders", icon: "fa-box" },
  { path: "/account/addresses", label: "My Addresses", icon: "fa-map-marker-alt" },
  { path: "/account/wishlist", label: "Wishlist", icon: "fa-heart" },
]

export default function AccountLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* User Info */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-mk-red rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-mk-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-mk-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="py-2">
              {accountNav.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                      isActive
                        ? "text-mk-red bg-red-50 font-semibold border-r-3 border-mk-red"
                        : "text-mk-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  <i className={`fas ${item.icon} w-4 text-center`}></i>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Logout */}
            <div className="border-t border-gray-100 p-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-5 py-3 text-sm text-red-600 hover:bg-red-50 w-full rounded-lg transition-colors"
              >
                <i className="fas fa-sign-out-alt w-4 text-center"></i>
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
