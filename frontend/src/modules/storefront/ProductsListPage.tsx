import { Link } from "react-router-dom"

const products = [
  { brand: "Kajaria", name: "Polished Vitrified Floor Tile 600x600mm - Marble White", price: "45", oldPrice: "53", unit: "/sq.ft", badge: "15% OFF", badgeColor: "bg-green-500", icon: "fa-th-large", moq: "100 sq.ft" },
  { brand: "Asian Paints", name: "Apex Ultima Emulsion Weather Proof - 20 Litre", price: "4,850", oldPrice: "5,500", unit: "/bucket", badge: "BEST SELLER", badgeColor: "bg-mk-red", icon: "fa-paint-roller", moq: "5 Buckets" },
  { brand: "Somany", name: "Floor Tile 600x600 - Grey Matt Anti-Skid", price: "38", oldPrice: "46", unit: "/sq.ft", icon: "fa-th-large", moq: "100 sq.ft" },
  { brand: "Hindware", name: "Enigma One-Piece Ceramic Western Toilet - White", price: "12,500", oldPrice: "15,800", unit: "/piece", icon: "fa-toilet", moq: "1 Piece" },
  { brand: "Godrej", name: "7 Lever Deadbolt Door Lock - Satin Steel", price: "2,350", oldPrice: "2,800", unit: "/piece", badge: "NEW", badgeColor: "bg-orange-500", icon: "fa-door-open", moq: "10 Pieces" },
  { brand: "Havells", name: "Lifeline HRFR 1.5 sq.mm Wire - 90m Roll", price: "1,450", oldPrice: "1,800", unit: "/roll", badge: "20% OFF", badgeColor: "bg-green-500", icon: "fa-plug", moq: "5 Rolls" },
  { brand: "RAK", name: "Porcelain Tile 800x800mm - Nero Marquina", price: "95", oldPrice: "120", unit: "/sq.ft", icon: "fa-th-large", moq: "50 sq.ft" },
  { brand: "Berger", name: "WeatherCoat All Guard Exterior Paint - 10L", price: "3,200", oldPrice: "3,800", unit: "/bucket", icon: "fa-paint-roller", moq: "3 Buckets" },
]

const filterBrands = ["Kajaria", "Asian Paints", "Somany", "Hindware", "Godrej", "Havells", "RAK", "Berger"]
const priceRanges = ["Under ₹100", "₹100 - ₹500", "₹500 - ₹2,000", "₹2,000 - ₹10,000", "Above ₹10,000"]

export default function ProductsListPage() {
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

              {/* Category */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-mk-gray-800 mb-3">Category</h4>
                <ul className="space-y-2 text-sm text-mk-gray-600">
                  {["Floor Tiles", "Wall Tiles", "Vitrified", "Ceramic", "Porcelain"].map((c) => (
                    <li key={c} className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-gray-300 text-mk-red focus:ring-mk-red" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Brand */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-mk-gray-800 mb-3">Brand</h4>
                <ul className="space-y-2 text-sm text-mk-gray-600">
                  {filterBrands.map((b) => (
                    <li key={b} className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-gray-300 text-mk-red focus:ring-mk-red" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-mk-gray-800 mb-3">Price Range</h4>
                <ul className="space-y-2 text-sm text-mk-gray-600">
                  {priceRanges.map((r) => (
                    <li key={r} className="flex items-center gap-2">
                      <input type="radio" name="price" className="text-mk-red focus:ring-mk-red" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button className="w-full bg-mk-red text-white text-sm font-semibold py-2 rounded-lg hover:bg-mk-red-600 transition-colors">
                Apply Filters
              </button>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-extrabold text-mk-gray-900">All <span className="text-mk-red">Products</span></h1>
              <div className="flex items-center gap-3">
                <span className="text-sm text-mk-gray-600">{products.length} products</span>
                <select className="border border-gray-200 rounded-lg py-2 px-3 text-sm text-mk-gray-600 focus:outline-none focus:border-mk-red">
                  <option>Sort by: Relevance</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest First</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((p, i) => (
                <Link key={i} to={`/products/${i + 1}`} className="product-card bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="relative bg-mk-gray-50 p-4 h-48 flex items-center justify-center">
                    {p.badge && <span className={`absolute top-3 left-3 ${p.badgeColor} text-white text-[10px] font-bold px-2 py-0.5 rounded`}>{p.badge}</span>}
                    <i className={`fas ${p.icon} text-5xl text-gray-300`}></i>
                    <button onClick={(e) => e.preventDefault()} className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:text-mk-red transition-colors">
                      <i className="far fa-heart text-sm"></i>
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="text-[10px] text-mk-gray-600 uppercase tracking-wider mb-1">{p.brand}</div>
                    <h3 className="font-semibold text-sm text-mk-gray-800 mb-2 line-clamp-2">{p.name}</h3>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-lg font-bold text-mk-gray-900">₹{p.price}</span>
                      <span className="text-sm text-mk-gray-600 line-through">₹{p.oldPrice}</span>
                      <span className="text-xs text-green-600 font-semibold">{p.unit}</span>
                    </div>
                    <div className="text-[10px] text-mk-gray-600 mb-3">MOQ: {p.moq}</div>
                    <span className="block w-full bg-mk-red hover:bg-mk-red-600 text-white text-center text-sm font-semibold py-2 rounded-lg transition-colors">
                      View Details
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
