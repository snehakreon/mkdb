import { Link } from "react-router-dom"

const categories = [
  { name: "Tiles & Flooring", count: "2,500+", icon: "fa-th-large", gradient: "from-red-50 to-red-100", color: "text-mk-red", subs: ["Floor Tiles", "Wall Tiles", "Vitrified", "Ceramic", "Porcelain", "Marble", "Mosaic", "Outdoor"] },
  { name: "Paints & Coatings", count: "1,800+", icon: "fa-paint-roller", gradient: "from-blue-50 to-blue-100", color: "text-blue-500", subs: ["Interior", "Exterior", "Primer", "Wood Finish", "Metal Paint", "Waterproofing", "Putty"] },
  { name: "Sanitaryware & Bath", count: "3,200+", icon: "fa-bath", gradient: "from-cyan-50 to-cyan-100", color: "text-cyan-500", subs: ["Toilets", "Wash Basins", "Faucets", "Showers", "Bath Accessories", "Cisterns"] },
  { name: "Hardware & Tools", count: "4,100+", icon: "fa-tools", gradient: "from-amber-50 to-amber-100", color: "text-amber-600", subs: ["Door Locks", "Hinges", "Door Handles", "Tower Bolts", "Power Tools", "Hand Tools"] },
  { name: "Boards & Laminates", count: "1,500+", icon: "fa-layer-group", gradient: "from-yellow-50 to-yellow-100", color: "text-yellow-600", subs: ["Plywood", "MDF", "Laminates", "Particle Board", "Block Board", "Veneer"] },
  { name: "Electrical & Lighting", count: "2,800+", icon: "fa-bolt", gradient: "from-orange-50 to-orange-100", color: "text-orange-500", subs: ["Wires & Cables", "Switches", "MCBs", "LED Lights", "Fans", "Panels"] },
  { name: "Plumbing & Pipes", count: "1,900+", icon: "fa-faucet", gradient: "from-teal-50 to-teal-100", color: "text-teal-500", subs: ["PVC Pipes", "CPVC", "GI Pipes", "Fittings", "Valves", "Water Tanks"] },
  { name: "Kitchen", count: "1,200+", icon: "fa-blender", gradient: "from-purple-50 to-purple-100", color: "text-purple-500", subs: ["Kitchen Sinks", "Faucets", "Chimneys", "Hobs", "Accessories"] },
  { name: "Cement & Steel", count: "800+", icon: "fa-cubes", gradient: "from-gray-100 to-gray-200", color: "text-gray-600", subs: ["OPC Cement", "PPC Cement", "TMT Bars", "Sand", "Aggregates"] },
]

export default function CategoriesPage() {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link key={cat.name} to="/products" className="category-card bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-mk-red">
              <div className={`bg-gradient-to-br ${cat.gradient} p-6 flex items-center gap-4`}>
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <i className={`fas ${cat.icon} text-2xl ${cat.color}`}></i>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-mk-gray-900">{cat.name}</h3>
                  <p className="text-sm text-mk-gray-600">{cat.count} Products</p>
                </div>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  {cat.subs.map((s) => (
                    <span key={s} className="text-xs text-mk-gray-600 bg-mk-gray-50 px-2 py-1 rounded hover:text-mk-red transition-colors">{s}</span>
                  ))}
                </div>
                <div className="mt-4 flex items-center text-mk-red text-sm font-semibold">
                  View All <i className="fas fa-arrow-right ml-2 text-xs"></i>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
