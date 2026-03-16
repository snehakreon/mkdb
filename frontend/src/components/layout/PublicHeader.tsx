import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useCart } from "../../context/CartContext"
import { api } from "../../services/api"

interface Category {
  id: number
  name: string
  slug: string
  parent_id: number | null
  product_count: number
}

export default function PublicHeader() {
  const { user, logout, isAdmin } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [hoveredCat, setHoveredCat] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const menuRef = useRef<HTMLDivElement>(null)
  const catNavRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Fetch categories once
  useEffect(() => {
    api.get("/categories/active").then((r) => setCategories(r.data)).catch(() => {})
  }, [])

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    navigate("/login")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  // Build parent-child structure
  const parentCategories = categories.filter((c) => !c.parent_id)
  const getSubcategories = (parentId: number) => categories.filter((c) => c.parent_id === parentId)

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
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 md:gap-8">
          {/* Mobile hamburger */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden flex items-center justify-center w-10 h-10 text-mk-gray-800 hover:text-mk-red transition-colors">
            <i className={`fas ${mobileMenuOpen ? "fa-times" : "fa-bars"} text-xl`}></i>
          </button>

          <Link to="/" className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <div className="w-9 h-9 md:w-11 md:h-11 bg-mk-gray rounded-full flex items-center justify-center border-2 border-mk-red">
              <span className="text-white font-extrabold text-xs md:text-sm">MK</span>
            </div>
            <div className="leading-tight hidden sm:block">
              <div className="text-lg font-extrabold text-mk-gray tracking-wide">MATERIAL <span className="text-mk-red">KING</span></div>
              <div className="text-[10px] text-mk-gray-600 tracking-widest uppercase">Building Materials Marketplace</div>
            </div>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:block">
            <div className="relative">
              <input type="text" placeholder="Search for tiles, paints, hardware..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input w-full border-2 border-gray-200 rounded-lg py-2.5 pl-4 pr-12 text-sm focus:border-mk-red transition-colors" />
              <button type="submit" className="absolute right-0 top-0 h-full px-4 bg-mk-red text-white rounded-r-lg hover:bg-mk-red-600 transition-colors">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </form>

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
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-mk-red text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{totalItems > 99 ? "99+" : totalItems}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Dynamic Category Nav — desktop */}
        <nav className="bg-mk-gray-900 relative hidden md:block" ref={catNavRef}>
          <div className="max-w-7xl mx-auto px-4">
            <ul className="flex items-center gap-0 text-white text-sm overflow-x-auto scrollbar-hide">
              <li>
                <Link to="/categories" className="flex items-center gap-2 px-4 py-3 bg-mk-red font-semibold whitespace-nowrap">
                  <i className="fas fa-th"></i> All Categories
                </Link>
              </li>
              {parentCategories.map((cat) => {
                const subs = getSubcategories(cat.id)
                const hasSubs = subs.length > 0
                return (
                  <li
                    key={cat.id}
                    className="relative"
                    onMouseEnter={() => setHoveredCat(cat.id)}
                    onMouseLeave={() => setHoveredCat(null)}
                  >
                    {hasSubs ? (
                      <span
                        className={`px-4 py-3 hover:bg-white/10 transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer ${hoveredCat === cat.id ? "bg-white/10" : ""}`}
                      >
                        {cat.name}
                        <i className="fas fa-chevron-down text-[8px] ml-1 opacity-60"></i>
                      </span>
                    ) : (
                      <Link
                        to={`/products?category=${cat.id}`}
                        className={`px-4 py-3 hover:bg-white/10 transition-colors flex items-center gap-1 whitespace-nowrap ${hoveredCat === cat.id ? "bg-white/10" : ""}`}
                      >
                        {cat.name}
                      </Link>
                    )}

                    {/* Subcategory Dropdown */}
                    {hasSubs && hoveredCat === cat.id && (
                      <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-lg shadow-xl py-2 min-w-[220px] z-[60]">
                        <Link
                          to={`/products?category=${cat.id}`}
                          className="flex items-center justify-between px-4 py-2 text-sm text-mk-gray-800 hover:bg-mk-red-50 hover:text-mk-red font-semibold"
                        >
                          All {cat.name}
                          <span className="text-xs text-mk-gray-500 font-normal">{cat.product_count || 0}</span>
                        </Link>
                        <div className="border-t border-gray-100 my-1"></div>
                        {subs.map((sub) => (
                          <Link
                            key={sub.id}
                            to={`/products?category=${sub.id}`}
                            className="flex items-center justify-between px-4 py-2 text-sm text-mk-gray-700 hover:bg-mk-red-50 hover:text-mk-red transition-colors"
                          >
                            {sub.name}
                            <span className="text-xs text-mk-gray-400">{sub.product_count || 0}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                )
              })}
              <li>
                <a href="#" className="px-4 py-3 text-mk-red font-semibold hover:bg-white/10 transition-colors flex items-center gap-1 whitespace-nowrap">
                  <i className="fas fa-bolt"></i> Deals
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      {/* Mobile slide-down menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[60px] z-[100] bg-black/40" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-white border-b border-gray-200 shadow-xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Mobile search */}
            <form onSubmit={(e) => { handleSearch(e); setMobileMenuOpen(false) }} className="p-4 border-b border-gray-100">
              <div className="relative">
                <input type="text" placeholder="Search products..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg py-2.5 pl-4 pr-12 text-sm focus:border-mk-red transition-colors" />
                <button type="submit" className="absolute right-0 top-0 h-full px-4 bg-mk-red text-white rounded-r-lg">
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </form>

            {/* Mobile categories */}
            <div className="py-2">
              <Link to="/categories" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-mk-red border-b border-gray-100">
                <i className="fas fa-th w-5 text-center"></i> All Categories
              </Link>
              {parentCategories.map((cat) => {
                const subs = getSubcategories(cat.id)
                return (
                  <div key={cat.id}>
                    <Link to={`/products?category=${cat.id}`} onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-3 text-sm text-mk-gray-800 hover:bg-gray-50">
                      <span className="font-medium">{cat.name}</span>
                      {subs.length > 0 && <span className="text-xs text-mk-gray-400">{subs.length} sub</span>}
                    </Link>
                    {subs.length > 0 && (
                      <div className="bg-gray-50">
                        {subs.map((sub) => (
                          <Link key={sub.id} to={`/products?category=${sub.id}`} onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between px-4 pl-10 py-2.5 text-sm text-mk-gray-600 hover:text-mk-red">
                            {sub.name}
                            <span className="text-xs text-mk-gray-400">{sub.product_count || 0}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
              <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-mk-red border-t border-gray-100">
                <i className="fas fa-bolt w-5 text-center"></i> Deals
              </a>
            </div>

            {/* Mobile account links */}
            {user ? (
              <div className="border-t border-gray-200 py-2">
                <div className="px-4 py-2 text-xs text-mk-gray-500 uppercase font-semibold">Account</div>
                <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-mk-gray-700 hover:bg-gray-50">
                  <i className="fas fa-user w-5 text-center text-mk-gray-400"></i> My Account
                </Link>
                <Link to="/account/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-mk-gray-700 hover:bg-gray-50">
                  <i className="fas fa-box w-5 text-center text-mk-gray-400"></i> My Orders
                </Link>
                <Link to="/account/wishlist" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-mk-gray-700 hover:bg-gray-50">
                  <i className="fas fa-heart w-5 text-center text-mk-gray-400"></i> Wishlist
                </Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-mk-gray-700 hover:bg-gray-50">
                    <i className="fas fa-cog w-5 text-center text-mk-gray-400"></i> Admin Panel
                  </Link>
                )}
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false) }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full">
                  <i className="fas fa-sign-out-alt w-5 text-center"></i> Logout
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-200 p-4">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center bg-mk-red text-white font-semibold py-2.5 rounded-lg hover:bg-mk-red-600 transition-colors">
                  Login / Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
