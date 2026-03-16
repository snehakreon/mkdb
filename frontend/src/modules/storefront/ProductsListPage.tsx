import { useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { wishlistService } from "../../services/wishlist.service"
import { api } from "../../services/api"

const PRICE_RANGES = [
  { label: "Under ₹100", min: 0, max: 100 },
  { label: "₹100 - ₹500", min: 100, max: 500 },
  { label: "₹500 - ₹2,000", min: 500, max: 2000 },
  { label: "₹2,000 - ₹10,000", min: 2000, max: 10000 },
  { label: "Above ₹10,000", min: 10000, max: 0 },
]

export default function ProductsListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [filterBrands, setFilterBrands] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [wishlisted, setWishlisted] = useState<Set<number>>(new Set())
  const [wishlistLoading, setWishlistLoading] = useState(false)

  // Read filter state from URL params
  const selectedCategory = searchParams.get("category") || ""
  const selectedBrand = searchParams.get("brand") || ""
  const search = searchParams.get("search") || ""
  const selectedPriceRange = searchParams.get("price") || ""
  const sort = searchParams.get("sort") || ""

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    setSearchParams(next)
  }

  const clearFilters = () => {
    setSearchParams({})
  }

  // Fetch categories (for top-level)
  useEffect(() => {
    api.get("/categories/active").then((r) => setCategories(r.data)).catch(() => {})
  }, [])

  // Fetch dynamic filter options when category changes
  useEffect(() => {
    const params = selectedCategory ? `?category_id=${selectedCategory}` : ""
    api.get(`/products/filters${params}`)
      .then((r) => {
        setFilterBrands(r.data.brands || [])
        setSubcategories(r.data.subcategories || [])
      })
      .catch(() => {})
  }, [selectedCategory])

  // Fetch products when any filter changes
  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (selectedCategory) params.set("category_id", selectedCategory)
    if (selectedBrand) params.set("brand_id", selectedBrand)
    if (search) params.set("search", search)
    if (sort) params.set("sort", sort)

    // Parse price range
    if (selectedPriceRange) {
      const idx = parseInt(selectedPriceRange)
      if (idx >= 0 && idx < PRICE_RANGES.length) {
        const range = PRICE_RANGES[idx]
        if (range.min > 0) params.set("min_price", String(range.min))
        if (range.max > 0) params.set("max_price", String(range.max))
      }
    }

    api.get(`/products/active?${params.toString()}`)
      .then((r) => setProducts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedCategory, selectedBrand, search, selectedPriceRange, sort])

  // Load wishlist state for logged-in users
  useEffect(() => {
    if (!user) return
    setWishlistLoading(true)
    wishlistService.getAll()
      .then((r) => {
        const ids = new Set<number>(r.data.map((item: any) => item.product_id))
        setWishlisted(ids)
      })
      .catch(() => {})
      .finally(() => setWishlistLoading(false))
  }, [user])

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

  // Get active category name for breadcrumb
  const parentCategories = categories.filter((c: any) => !c.parent_id)
  const activeCat = categories.find((c: any) => String(c.id) === selectedCategory)
  const activeFilters = [selectedCategory, selectedBrand, selectedPriceRange, search].filter(Boolean).length

  return (
    <div>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-mk-gray-600">
          <Link to="/" className="hover:text-mk-red transition-colors">Home</Link>
          <i className="fas fa-chevron-right text-[10px]"></i>
          {activeCat ? (
            <>
              <Link to="/products" className="hover:text-mk-red transition-colors">All Products</Link>
              <i className="fas fa-chevron-right text-[10px]"></i>
              <span className="text-mk-gray-800 font-semibold">{activeCat.name}</span>
            </>
          ) : (
            <span className="text-mk-gray-800 font-semibold">All Products</span>
          )}
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-mk-gray-900">Filters</h3>
                {activeFilters > 0 && (
                  <span className="bg-mk-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{activeFilters}</span>
                )}
              </div>

              {/* Search */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-mk-gray-800 mb-3">Search</h4>
                <input type="text" placeholder="Search products..." value={search}
                  onChange={(e) => updateParam("search", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-mk-red" />
              </div>

              {/* Category */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-mk-gray-800 mb-3">Category</h4>
                <ul className="space-y-2 text-sm text-mk-gray-600 max-h-48 overflow-y-auto">
                  <li className="flex items-center gap-2 cursor-pointer" onClick={() => updateParam("category", "")}>
                    <input type="radio" name="category" checked={!selectedCategory} readOnly className="text-mk-red focus:ring-mk-red" />
                    <span>All Categories</span>
                  </li>
                  {parentCategories.map((c: any) => (
                    <li key={c.id} className="flex items-center gap-2 cursor-pointer" onClick={() => updateParam("category", String(c.id))}>
                      <input type="radio" name="category" checked={selectedCategory === String(c.id)} readOnly className="text-mk-red focus:ring-mk-red" />
                      <span>{c.name} ({c.product_count || 0})</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Subcategories (dynamic, shown when parent category is selected) */}
              {subcategories.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-mk-gray-800 mb-3">Subcategory</h4>
                  <ul className="space-y-2 text-sm text-mk-gray-600">
                    {subcategories.map((sub: any) => (
                      <li key={sub.id} className="flex items-center gap-2 cursor-pointer" onClick={() => updateParam("category", String(sub.id))}>
                        <input type="radio" name="subcategory" checked={selectedCategory === String(sub.id)} readOnly className="text-mk-red focus:ring-mk-red" />
                        <span>{sub.name} ({sub.product_count || 0})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Brand (dynamic based on category) */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-mk-gray-800 mb-3">Brand</h4>
                <ul className="space-y-2 text-sm text-mk-gray-600 max-h-48 overflow-y-auto">
                  <li className="flex items-center gap-2 cursor-pointer" onClick={() => updateParam("brand", "")}>
                    <input type="radio" name="brand" checked={!selectedBrand} readOnly className="text-mk-red focus:ring-mk-red" />
                    <span>All Brands</span>
                  </li>
                  {filterBrands.map((b: any) => (
                    <li key={b.id} className="flex items-center gap-2 cursor-pointer" onClick={() => updateParam("brand", String(b.id))}>
                      <input type="radio" name="brand" checked={selectedBrand === String(b.id)} readOnly className="text-mk-red focus:ring-mk-red" />
                      <span>{b.name} ({b.product_count || 0})</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-mk-gray-800 mb-3">Price Range</h4>
                <ul className="space-y-2 text-sm text-mk-gray-600">
                  <li className="flex items-center gap-2 cursor-pointer" onClick={() => updateParam("price", "")}>
                    <input type="radio" name="price" checked={!selectedPriceRange} readOnly className="text-mk-red focus:ring-mk-red" />
                    <span>Any Price</span>
                  </li>
                  {PRICE_RANGES.map((range, idx) => (
                    <li key={idx} className="flex items-center gap-2 cursor-pointer" onClick={() => updateParam("price", String(idx))}>
                      <input type="radio" name="price" checked={selectedPriceRange === String(idx)} readOnly className="text-mk-red focus:ring-mk-red" />
                      <span>{range.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button onClick={clearFilters}
                className="w-full bg-gray-100 text-mk-gray-700 text-sm font-semibold py-2 rounded-lg hover:bg-gray-200 transition-colors">
                Clear All Filters
              </button>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-extrabold text-mk-gray-900">
                  {activeCat ? (
                    <>{activeCat.name}</>
                  ) : (
                    <>All <span className="text-mk-red">Products</span></>
                  )}
                </h1>
                {search && <p className="text-sm text-mk-gray-500 mt-1">Results for "{search}"</p>}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-mk-gray-600">{products.length} products</span>
                <select
                  value={sort}
                  onChange={(e) => updateParam("sort", e.target.value)}
                  className="border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-mk-red bg-white"
                >
                  <option value="">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Name: A to Z</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-mk-gray-500 text-sm">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-mk-gray-500">
                <i className="fas fa-box-open text-4xl mb-3 text-gray-300"></i>
                <p className="text-sm">No products found. Try adjusting your filters.</p>
                {activeFilters > 0 && (
                  <button onClick={clearFilters} className="mt-3 text-mk-red text-sm font-semibold hover:underline">
                    Clear all filters
                  </button>
                )}
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
