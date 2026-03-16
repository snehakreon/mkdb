import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { api } from "../../services/api"

const categoryIcons: Record<string, { icon: string; bg: string; color: string }> = {
  "tiles": { icon: "fa-th-large", bg: "bg-mk-red-50", color: "text-mk-red" },
  "paints": { icon: "fa-paint-roller", bg: "bg-blue-50", color: "text-blue-500" },
  "sanitary": { icon: "fa-bath", bg: "bg-cyan-50", color: "text-cyan-500" },
  "hardware": { icon: "fa-tools", bg: "bg-amber-50", color: "text-amber-600" },
  "boards": { icon: "fa-layer-group", bg: "bg-yellow-50", color: "text-yellow-600" },
  "electrical": { icon: "fa-bolt", bg: "bg-orange-50", color: "text-orange-500" },
  "plumbing": { icon: "fa-faucet", bg: "bg-teal-50", color: "text-teal-500" },
  "kitchen": { icon: "fa-blender", bg: "bg-purple-50", color: "text-purple-500" },
  "cement": { icon: "fa-cubes", bg: "bg-gray-100", color: "text-gray-600" },
  "lighting": { icon: "fa-lightbulb", bg: "bg-green-50", color: "text-green-500" },
}

function getCategoryStyle(name: string) {
  const lower = name.toLowerCase()
  for (const [key, style] of Object.entries(categoryIcons)) {
    if (lower.includes(key)) return style
  }
  return { icon: "fa-box", bg: "bg-gray-100", color: "text-gray-600" }
}

const testimonials = [
  { text: "Material King saved us 30% on our construction materials for a 200-unit residential project. The quality is top-notch and delivery was on time.", name: "Rajesh Kumar", company: "ABC Constructions, Delhi", initials: "RK", bg: "bg-mk-red-50", color: "text-mk-red" },
  { text: "As an architect, I recommend Material King to all my clients. The product range is excellent and the B2B pricing makes project budgets easier to manage.", name: "Priya Sharma", company: "Design Studio, Mumbai", initials: "PS", bg: "bg-blue-50", color: "text-blue-500" },
  { text: "We've been ordering tiles and sanitaryware for our retail store. The dealer credit facility and consistent pricing have helped our business grow.", name: "Anil Mehta", company: "Mehta Hardware, Pune", initials: "AM", bg: "bg-green-50", color: "text-green-500" },
]

export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])

  useEffect(() => {
    api.get("/categories/active").then((r) => setCategories(r.data)).catch(() => {})
    api.get("/products/active?limit=10").then((r) => setProducts(r.data)).catch(() => {})
    api.get("/brands").then((r) => setBrands(r.data.filter((b: any) => b.is_active))).catch(() => {})
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 flex items-center">
          <div className="max-w-xl relative z-10">
            <div className="inline-block bg-mk-red text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">India's #1 B2B Platform</div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">Building Materials<br />at <span className="text-mk-red">Wholesale Prices</span></h1>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">One-stop marketplace for contractors, builders, retailers & architects. Get the best prices on tiles, paints, sanitaryware, hardware and more.</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/categories" className="bg-mk-red hover:bg-mk-red-600 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg hover:shadow-xl">Explore Products</Link>
              <Link to="/register" className="bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-lg transition-all">Register as Buyer</Link>
            </div>
            <div className="flex items-center gap-8 mt-10 text-sm text-gray-300">
              <span className="flex items-center gap-2"><i className="fas fa-check-circle text-green-400"></i> GST Invoice</span>
              <span className="flex items-center gap-2"><i className="fas fa-check-circle text-green-400"></i> Bulk Discounts</span>
              <span className="flex items-center gap-2"><i className="fas fa-check-circle text-green-400"></i> Pan India Delivery</span>
            </div>
          </div>
          <div className="hidden lg:block ml-auto relative">
            <div className="w-96 h-80 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 flex items-center justify-center">
              <div className="text-center">
                <i className="fas fa-building text-6xl text-mk-red/60 mb-4"></i>
                <p className="text-white/50 text-sm">Hero Image / Banner</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-mk-red/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-mk-red/5 rounded-full blur-2xl"></div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "500+", label: "Verified Vendors" },
              { value: products.length > 0 ? `${products.length}+` : "50,000+", label: "Products Listed" },
              { value: "1,000+", label: "Cities Served" },
              { value: "10,000+", label: "Happy Buyers" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl md:text-3xl font-extrabold text-mk-red">{s.value}</div>
                <div className="text-sm text-mk-gray-600 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-16 bg-mk-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-mk-gray-900">Shop by <span className="text-mk-red">Category</span></h2>
              <p className="text-mk-gray-600 mt-2">Explore our wide range of building materials</p>
            </div>
            <Link to="/categories" className="text-mk-red font-semibold text-sm hover:underline hidden md:block">View All Categories <i className="fas fa-arrow-right ml-1"></i></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {categories.map((cat) => {
              const style = getCategoryStyle(cat.name)
              return (
                <Link key={cat.id} to={`/products?category=${cat.id}`} className="category-card bg-white rounded-xl p-6 text-center cursor-pointer border border-gray-100 hover:border-mk-red/30">
                  <div className={`w-16 h-16 ${style.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <i className={`fas ${style.icon} text-2xl ${style.color}`}></i>
                  </div>
                  <h3 className="font-bold text-sm text-mk-gray-800">{cat.name}</h3>
                  <p className="text-xs text-mk-gray-600 mt-1">{cat.product_count || 0} Products</p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-mk-gray-900">Featured <span className="text-mk-red">Products</span></h2>
              <p className="text-mk-gray-600 mt-2">Trending products at the best wholesale prices</p>
            </div>
            <Link to="/products" className="text-mk-red font-semibold text-sm hover:underline hidden md:block">View All <i className="fas fa-arrow-right ml-1"></i></Link>
          </div>
          {products.length === 0 ? (
            <div className="text-center py-12 text-mk-gray-500">
              <i className="fas fa-box-open text-4xl mb-3 text-gray-300"></i>
              <p className="text-sm">No products available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
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
                      <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:text-mk-red transition-colors">
                        <i className="far fa-heart text-sm"></i>
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="text-[10px] text-mk-gray-600 uppercase tracking-wider mb-1">{p.brand_name || "—"}</div>
                      <h3 className="font-semibold text-sm text-mk-gray-800 mb-2 line-clamp-2">{p.name}</h3>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-lg font-bold text-mk-gray-900">₹{Number(p.price).toLocaleString("en-IN")}</span>
                        {p.mrp && p.mrp > p.price && <span className="text-sm text-mk-gray-600 line-through">₹{Number(p.mrp).toLocaleString("en-IN")}</span>}
                        <span className="text-xs text-green-600 font-semibold">/{p.unit || "piece"}</span>
                      </div>
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
      </section>

      {/* Promo Banner */}
      <section className="bg-mk-red">
        <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Bulk Orders? Get Extra <span className="text-yellow-300">10-25% OFF</span></h2>
            <p className="text-white/80">Special pricing for contractors, builders & project orders above ₹1 Lakh</p>
          </div>
          <Link to="/register" className="bg-white text-mk-red font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap shadow-lg">
            Get Bulk Quote <i className="fas fa-arrow-right ml-2"></i>
          </Link>
        </div>
      </section>

      {/* Why Material King */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-mk-gray-900">Why <span className="text-mk-red">Material King</span>?</h2>
            <p className="text-mk-gray-600 mt-2">Trusted by thousands of businesses across India</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "fa-tags", bg: "bg-mk-red-50", color: "text-mk-red", title: "Best Wholesale Prices", desc: "Direct from manufacturers. Save 10-40% compared to retail market prices." },
              { icon: "fa-shield-alt", bg: "bg-green-50", color: "text-green-500", title: "100% Genuine Products", desc: "Only authorized brands. Every product comes with manufacturer warranty." },
              { icon: "fa-truck", bg: "bg-blue-50", color: "text-blue-500", title: "Pan India Delivery", desc: "Delivering to 1,000+ cities. Fast & safe delivery to your doorstep or site." },
              { icon: "fa-headset", bg: "bg-purple-50", color: "text-purple-500", title: "Dedicated Support", desc: "Personal account manager for bulk orders. Expert assistance for your projects." },
            ].map((f) => (
              <div key={f.title} className="text-center">
                <div className={`w-16 h-16 ${f.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <i className={`fas ${f.icon} text-2xl ${f.color}`}></i>
                </div>
                <h3 className="font-bold text-mk-gray-800 mb-2">{f.title}</h3>
                <p className="text-sm text-mk-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="py-16 bg-mk-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-mk-gray-900">Trusted <span className="text-mk-red">Brands</span></h2>
            <p className="text-mk-gray-600 mt-2">Authorized dealer of India's top building material brands</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
            {brands.map((b) => (
              <div key={b.id} className="brand-logo bg-white rounded-xl p-4 flex items-center justify-center h-20 border border-gray-100">
                {b.logo_url ? (
                  <img src={b.logo_url} alt={b.name} className="max-h-10 max-w-full object-contain" />
                ) : (
                  <span className="font-bold text-sm text-mk-gray-600">{b.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-mk-gray-900">How It <span className="text-mk-red">Works</span></h2>
            <p className="text-mk-gray-600 mt-2">Start ordering in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Register & Verify", desc: "Sign up with your GST number and business details. Get verified within 24 hours." },
              { step: "2", title: "Browse & Order", desc: "Explore products, compare prices, and place orders. Bulk discounts applied automatically." },
              { step: "3", title: "Get Delivered", desc: "Track your order in real-time. Safe delivery to your site with GST invoice." },
            ].map((s, i) => (
              <div key={s.step} className="text-center relative">
                <div className="w-14 h-14 bg-mk-red text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-extrabold">{s.step}</div>
                <h3 className="font-bold text-lg text-mk-gray-800 mb-2">{s.title}</h3>
                <p className="text-sm text-mk-gray-600">{s.desc}</p>
                {i < 2 && <div className="hidden md:block absolute top-7 left-[60%] w-[80%] border-t-2 border-dashed border-gray-200"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-mk-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-mk-gray-900">What Our <span className="text-mk-red">Clients Say</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="flex text-yellow-400 mb-3">
                  <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                </div>
                <p className="text-sm text-mk-gray-600 mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${t.bg} rounded-full flex items-center justify-center`}>
                    <span className={`font-bold ${t.color} text-sm`}>{t.initials}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-mk-gray-800">{t.name}</div>
                    <div className="text-xs text-mk-gray-600">{t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-mk-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Save on Building Materials?</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">Join 10,000+ businesses that trust Material King for quality products at wholesale prices.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register" className="bg-mk-red hover:bg-mk-red-600 text-white font-bold py-3 px-10 rounded-lg transition-all shadow-lg">Create Free Account</Link>
            <Link to="/contact" className="border border-white/30 hover:bg-white/10 text-white font-bold py-3 px-10 rounded-lg transition-all">Contact Sales</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
