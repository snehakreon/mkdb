import { useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { wishlistService } from "../../services/wishlist.service"
import { api } from "../../services/api"

export default function ProductsListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [wishlisted, setWishlisted] = useState<Set<number>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "")
  const [selectedBrand, setSelectedBrand] = useState("")
  const [search, setSearch] = useState(searchParams.get("search") || "")

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.set("category_id", selectedCategory)
      if (selectedBrand) params.set("brand_id", selectedBrand)
      if (search) params.set("search", search)
      const res = await api.get(`/products/active?${params.toString()}`)
      setProducts(res.data)
    } catch { /* empty */ }
    setLoading(false)
  }

  useEffect(() => {
    api.get("/categories/active").then((r) => setCategories(r.data)).catch(() => {})
    api.get("/brands").then((r) => setBrands(r.data.filter((b: any) => b.is_active))).catch(() => {})
  }, [])

  useEffect(() => { fetchProducts() }, [selectedCategory, selectedBrand, search])

  const toggleWishlist = async (e: React.MouseEvent, productId: number) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { navigate("/login"); return }
    try {
      if (wishlisted.has(productId)) {
        await wishlistService.remove(productId)
        setWishlisted((prev) => { const s = new Set(prev); s.delete(productId); return s })
      } else {
        await wishlistService.add(productId)
        setWishlisted((prev) => new Set(prev).add(productId))
      }
    } catch { /* empty */ }
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-mk-gray-600">
          <Link to="/" className="hover:text-mk-red transition-colors">Home</Link>
          <i className="fas fa-chevron-right text-[10px]"></i>
          <span className="text-mk-gray-800 font-semibold">All Products</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
              <h3 className="font-bold text-mk-gray-900 mb-4">Filters</h3>

              {/* Search */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-mk-gray-800 mb-3">Search</h4>
                <input type="text" placeholder="Search products..." value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-mk-red" />
              </div>

              {/* Category */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-mk-gray-800 mb-3">Category</h4>
                <ul className="space-y-2 text-sm text-mk-gray-600">
                  <li className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedCategory("")}>
                    <input type="radio" name="category" checked={!selectedCategory} readOnly className="text-mk-red focus:ring-mk-red" />
                    <span>All Categories</span>
                  </li>
                  {categories.map((c) => (
                    <li key={c.id} className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedCategory(String(c.id))}>
                      <input type="radio" name="category" checked={selectedCategory === String(c.id)} readOnly className="text-mk-red focus:ring-mk-red" />
                      <span>{c.name} ({c.product_count || 0})</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Brand */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-mk-gray-800 mb-3">Brand</h4>
                <ul className="space-y-2 text-sm text-mk-gray-600">
                  <li className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedBrand("")}>
                    <input type="radio" name="brand" checked={!selectedBrand} readOnly className="text-mk-red focus:ring-mk-red" />
                    <span>All Brands</span>
                  </li>
                  {brands.map((b) => (
                    <li key={b.id} className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedBrand(String(b.id))}>
                      <input type="radio" name="brand" checked={selectedBrand === String(b.id)} readOnly className="text-mk-red focus:ring-mk-red" />
                      <span>{b.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button onClick={() => { setSelectedCategory(""); setSelectedBrand(""); setSearch("") }}
                className="w-full bg-gray-100 text-mk-gray-700 text-sm font-semibold py-2 rounded-lg hover:bg-gray-200 transition-colors">
                Clear Filters
              </button>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-extrabold text-mk-gray-900">All <span className="text-mk-red">Products</span></h1>
              <span className="text-sm text-mk-gray-600">{products.length} products</span>
            </div>

            {loading ? (
              <div className="text-center py-12 text-mk-gray-500 text-sm">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-mk-gray-500">
                <i className="fas fa-box-open text-4xl mb-3 text-gray-300"></i>
                <p className="text-sm">No products found. Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {products.map((p) => {
                  const discount = p.mrp && p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0
                  return (
                    <Link key={p.id} to={`/products/${p.id}`} className="product-card bg-white rounded-xl border border-gray-100 overflow-hidden">
                      <div className="relative bg-mk-gray-50 p-4 h-48 flex items-center justify-center">
                        {discount > 0 && <span className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">{discount}% OFF</span>}
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="max-h-full max-w-full object-contain" />
                        ) : (
                          <i className="fas fa-box text-5xl text-gray-300"></i>
                        )}
                        <button
                          onClick={(e) => toggleWishlist(e, p.id)}
                          className={`absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm transition-colors ${wishlisted.has(p.id) ? "text-mk-red" : "hover:text-mk-red"}`}
                        >
                          <i className={`${wishlisted.has(p.id) ? "fas" : "far"} fa-heart text-sm`}></i>
                        </button>
                      </div>
                      <div className="p-4">
                        <div className="text-[10px] text-mk-gray-600 uppercase tracking-wider mb-1">{p.brand_name || "—"}</div>
                        <h3 className="font-semibold text-sm text-mk-gray-800 mb-2 line-clamp-2">{p.name}</h3>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-lg font-bold text-mk-gray-900">₹{Number(p.price).toLocaleString("en-IN")}</span>
                          {p.mrp && p.mrp > p.price && <span className="text-sm text-mk-gray-600 line-through">₹{Number(p.mrp).toLocaleString("en-IN")}</span>}
                          <span className="text-xs text-green-600 font-semibold">/{p.unit || "piece"}</span>
                        </div>
                        <div className="text-[10px] text-mk-gray-600 mb-3">MOQ: {p.min_order_qty || 1} {p.unit || "piece"}</div>
                        <span className="block w-full bg-mk-red hover:bg-mk-red-600 text-white text-center text-sm font-semibold py-2 rounded-lg transition-colors">
                          View Details
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
