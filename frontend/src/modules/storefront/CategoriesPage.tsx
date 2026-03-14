import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { api } from "../../services/api"

const gradients = [
  "from-red-50 to-red-100", "from-blue-50 to-blue-100", "from-cyan-50 to-cyan-100",
  "from-amber-50 to-amber-100", "from-yellow-50 to-yellow-100", "from-orange-50 to-orange-100",
  "from-teal-50 to-teal-100", "from-purple-50 to-purple-100", "from-gray-100 to-gray-200",
  "from-green-50 to-green-100",
]
const iconColors = [
  "text-mk-red", "text-blue-500", "text-cyan-500", "text-amber-600",
  "text-yellow-600", "text-orange-500", "text-teal-500", "text-purple-500",
  "text-gray-600", "text-green-500",
]
const categoryIcons: Record<string, string> = {
  "tiles": "fa-th-large", "paints": "fa-paint-roller", "sanitary": "fa-bath",
  "hardware": "fa-tools", "boards": "fa-layer-group", "electrical": "fa-bolt",
  "plumbing": "fa-faucet", "kitchen": "fa-blender", "cement": "fa-cubes",
  "lighting": "fa-lightbulb", "steel": "fa-cubes",
}

function getIcon(name: string) {
  const lower = name.toLowerCase()
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (lower.includes(key)) return icon
  }
  return "fa-box"
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/categories/active").then((r) => {
      // Build parent-child structure
      const all = r.data
      const parents = all.filter((c: any) => !c.parent_id)
      const children = all.filter((c: any) => c.parent_id)
      const grouped = parents.map((p: any) => ({
        ...p,
        subs: children.filter((c: any) => c.parent_id === p.id).map((c: any) => c.name),
      }))
      setCategories(grouped)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-mk-gray-600">
          <Link to="/" className="hover:text-mk-red transition-colors">Home</Link>
          <i className="fas fa-chevron-right text-[10px]"></i>
          <span className="text-mk-gray-800 font-semibold">All Categories</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 mb-8">
        <h1 className="text-3xl font-extrabold text-mk-gray-900">All <span className="text-mk-red">Categories</span></h1>
        <p className="text-mk-gray-600 mt-2">Explore our complete range of building materials across {categories.length} major categories</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="text-center py-12 text-mk-gray-500 text-sm">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 text-mk-gray-500">
            <i className="fas fa-folder-open text-4xl mb-3 text-gray-300"></i>
            <p className="text-sm">No categories available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => {
              const gradient = gradients[idx % gradients.length]
              const color = iconColors[idx % iconColors.length]
              const icon = getIcon(cat.name)
              return (
                <Link key={cat.id} to={`/products?category=${cat.id}`} className="category-card bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-mk-red">
                  <div className={`bg-gradient-to-br ${gradient} p-6 flex items-center gap-4`}>
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                      <i className={`fas ${icon} text-2xl ${color}`}></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-mk-gray-900">{cat.name}</h3>
                      <p className="text-sm text-mk-gray-600">{cat.product_count || 0} Products</p>
                    </div>
                  </div>
                  {cat.subs && cat.subs.length > 0 && (
                    <div className="p-5">
                      <div className="flex flex-wrap gap-2">
                        {cat.subs.map((s: string) => (
                          <span key={s} className="text-xs text-mk-gray-600 bg-mk-gray-50 px-2 py-1 rounded hover:text-mk-red transition-colors">{s}</span>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center text-mk-red text-sm font-semibold">
                        View All <i className="fas fa-arrow-right ml-2 text-xs"></i>
                      </div>
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
