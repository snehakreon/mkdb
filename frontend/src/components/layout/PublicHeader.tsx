import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

export default function PublicHeader() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    navigate("/login")
  }

  return (
    <>
      {/* Top Bar */}
      <div className="bg-mk-gray-900 text-white text-xs py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1"><i className="fas fa-phone-alt text-mk-red"></i> 1800-XXX-XXXX (Toll Free)</span>
            <span className="hidden md:flex items-center gap-1"><i className="fas fa-envelope text-mk-red"></i> support@materialking.com</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/account/orders" className="hover:text-mk-red transition-colors">Track Order</Link>
            <a href="#" className="hover:text-mk-red transition-colors">Become a Seller</a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-8">
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-11 h-11 bg-mk-gray rounded-full flex items-center justify-center border-2 border-mk-red">
              <span className="text-white font-extrabold text-sm">MK</span>
            </div>
            <div className="leading-tight">
              <div className="text-lg font-extrabold text-mk-gray tracking-wide">MATERIAL <span className="text-mk-red">KING</span></div>
              <div className="text-[10px] text-mk-gray-600 tracking-widest uppercase">Building Materials Marketplace</div>
            </div>
          </Link>

          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative">
              <input type="text" placeholder="Search for tiles, paints, hardware..."
                className="search-input w-full border-2 border-gray-200 rounded-lg py-2.5 pl-4 pr-12 text-sm focus:border-mk-red transition-colors" />
              <button className="absolute right-0 top-0 h-full px-4 bg-mk-red text-white rounded-r-lg hover:bg-mk-red-600 transition-colors">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-5 flex-shrink-0">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 text-sm hover:text-mk-red transition-colors"
                >
                  <div className="w-8 h-8 bg-mk-red rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                  </div>
                  <span className="hidden md:inline font-medium">{user.firstName}</span>
                  <i className={`fas fa-chevron-down text-[10px] transition-transform ${menuOpen ? "rotate-180" : ""}`}></i>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-mk-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-mk-gray-500">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link to="/account" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-mk-gray-700 hover:bg-gray-50">
                        <i className="fas fa-user w-4 text-center text-mk-gray-400"></i> My Account
                      </Link>
                      <Link to="/account/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-mk-gray-700 hover:bg-gray-50">
                        <i className="fas fa-box w-4 text-center text-mk-gray-400"></i> My Orders
                      </Link>
                      <Link to="/account/addresses" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-mk-gray-700 hover:bg-gray-50">
                        <i className="fas fa-map-marker-alt w-4 text-center text-mk-gray-400"></i> My Addresses
                      </Link>
                      <Link to="/account/wishlist" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-mk-gray-700 hover:bg-gray-50">
                        <i className="fas fa-heart w-4 text-center text-mk-gray-400"></i> Wishlist
                      </Link>
                    </div>

                    {isAdmin && (
                      <div className="border-t border-gray-100 py-1">
                        <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-mk-gray-700 hover:bg-gray-50">
                          <i className="fas fa-cog w-4 text-center text-mk-gray-400"></i> Admin Panel
                        </Link>
                      </div>
                    )}

                    <div className="border-t border-gray-100 py-1">
                      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                        <i className="fas fa-sign-out-alt w-4 text-center"></i> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 text-sm hover:text-mk-red transition-colors">
                <i className="fas fa-user text-lg"></i>
                <span className="hidden md:inline font-medium">Account</span>
              </Link>
            )}
            <Link to="/cart" className="flex items-center gap-2 text-sm hover:text-mk-red transition-colors relative">
              <i className="fas fa-shopping-cart text-lg"></i>
              <span className="absolute -top-2 -right-2 bg-mk-red text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">0</span>
            </Link>
          </div>
        </div>

        {/* Category Nav */}
        <nav className="bg-mk-gray-900">
          <div className="max-w-7xl mx-auto px-4">
            <ul className="flex items-center gap-0 text-white text-sm overflow-x-auto">
              <li><Link to="/categories" className="flex items-center gap-2 px-4 py-3 bg-mk-red font-semibold"><i className="fas fa-th"></i> All Categories</Link></li>
              <li><Link to="/products" className="px-4 py-3 hover:bg-white/10 transition-colors">Tiles</Link></li>
              <li><Link to="/products" className="px-4 py-3 hover:bg-white/10 transition-colors">Paints</Link></li>
              <li><Link to="/products" className="px-4 py-3 hover:bg-white/10 transition-colors">Sanitaryware</Link></li>
              <li><Link to="/products" className="px-4 py-3 hover:bg-white/10 transition-colors">Hardware</Link></li>
              <li><Link to="/products" className="px-4 py-3 hover:bg-white/10 transition-colors">Electrical</Link></li>
              <li><Link to="/products" className="px-4 py-3 hover:bg-white/10 transition-colors">Plumbing</Link></li>
              <li><a href="#" className="px-4 py-3 text-mk-red font-semibold hover:bg-white/10 transition-colors"><i className="fas fa-bolt"></i> Deals</a></li>
            </ul>
          </div>
        </nav>
      </header>
    </>
  )
}
