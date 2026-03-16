import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useCart } from "../../context/CartContext"
import { wishlistService } from "../../services/wishlist.service"
import { api } from "../../services/api"

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { addItem } = useCart()
  const navigate = useNavigate()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [wishlisted, setWishlisted] = useState(false)
  const [wishLoading, setWishLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("description")
  const [qty, setQty] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const productId = Number(id)

  useEffect(() => {
    setLoading(true)
    api.get(`/products/${id}`).then((r) => setProduct(r.data))
      .catch(() => {}).finally(() => setLoading(false))
  }, [id])

  // Check wishlist state for logged-in user
  useEffect(() => {
    if (!user || !productId) return
    wishlistService.check(productId)
      .then((r) => setWishlisted(r.data.inWishlist))
      .catch(() => {})
  }, [user, productId])

  const toggleWishlist = async () => {
    if (!user) { navigate("/login"); return }
    setWishLoading(true)
    try {
      if (wishlisted) {
        await wishlistService.remove(productId)
        setWishlisted(false)
      } else {
        await wishlistService.add(productId)
        setWishlisted(true)
      }
    } catch { /* empty */ }
    setWishLoading(false)
  }

  if (loading) return <div className="text-center py-20 text-mk-gray-500">Loading product...</div>
  if (!product) return (
    <div className="text-center py-20">
      <i className="fas fa-exclamation-circle text-4xl text-gray-300 mb-3"></i>
      <p className="text-mk-gray-600">Product not found.</p>
      <Link to="/products" className="text-mk-red text-sm font-semibold mt-2 inline-block hover:underline">Back to Products</Link>
    </div>
  )

  const p = product
  const discount = p.mrp && p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0

  // Build specs table from product fields
  const specs: [string, string][] = []
  if (p.brand_name) specs.push(["Brand", p.brand_name])
  if (p.brand_collection) specs.push(["Collection", p.brand_collection])
  if (p.material) specs.push(["Material", p.material])
  if (p.length_mm && p.breadth_mm) specs.push(["Size", `${p.length_mm} x ${p.breadth_mm} mm`])
  if (p.width_mm) specs.push(["Width", `${p.width_mm} mm`])
  if (p.thickness_mm) specs.push(["Thickness", `${p.thickness_mm} mm`])
  if (p.weight_kg) specs.push(["Weight", `${p.weight_kg} kg`])
  if (p.colour) specs.push(["Colour", p.colour])
  if (p.grade) specs.push(["Grade", p.grade])
  if (p.calibration) specs.push(["Calibration", p.calibration])
  if (p.certification) specs.push(["Certification", p.certification])
  if (p.termite_resistance) specs.push(["Termite Resistance", p.termite_resistance])
  if (p.warranty) specs.push(["Warranty", p.warranty])
  if (p.country_of_origin) specs.push(["Country of Origin", p.country_of_origin])
  if (p.hsn_code) specs.push(["HSN Code", p.hsn_code])
  if (p.isin) specs.push(["ISIN", p.isin])

  // Packaging specs
  const pkgSpecs: [string, string][] = []
  if (p.box_length_mm) pkgSpecs.push(["Box Length", `${p.box_length_mm} mm`])
  if (p.box_breadth_mm) pkgSpecs.push(["Box Breadth", `${p.box_breadth_mm} mm`])
  if (p.box_width_mm) pkgSpecs.push(["Box Width", `${p.box_width_mm} mm`])
  if (p.box_weight_kg) pkgSpecs.push(["Box Weight", `${p.box_weight_kg} kg`])

  return (
    <div>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-mk-gray-600">
          <Link to="/" className="hover:text-mk-red transition-colors">Home</Link>
          <i className="fas fa-chevron-right text-[10px]"></i>
          <Link to="/products" className="hover:text-mk-red transition-colors">Products</Link>
          <i className="fas fa-chevron-right text-[10px]"></i>
          <span className="text-mk-gray-800 font-semibold line-clamp-1">{p.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Image */}
            <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-100">
              <div className="bg-mk-gray-50 rounded-xl h-96 flex items-center justify-center mb-4 relative">
                {discount > 0 && <span className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded">{discount}% OFF</span>}
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <i className="fas fa-box text-7xl text-gray-300"></i>
                )}
                <button onClick={toggleWishlist} disabled={wishLoading}
                  className={`absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md transition-colors disabled:opacity-50 ${wishlisted ? "text-mk-red" : "hover:text-mk-red"}`}>
                  <i className={`${wishlisted ? "fas" : "far"} fa-heart text-lg`}></i>
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-2">
                {p.brand_name && <span className="bg-mk-gray-100 text-mk-gray text-xs font-semibold px-2 py-0.5 rounded">{p.brand_name}</span>}
                {p.sku && <span className="text-xs text-mk-gray-600">SKU: {p.sku}</span>}
              </div>

              <h1 className="text-2xl font-extrabold text-mk-gray-900 mb-3">{p.name}</h1>

              <div className="flex items-center gap-3 mb-4">
                <span className={`text-sm font-semibold ${p.stock_qty > 0 ? "text-green-600" : "text-red-500"}`}>
                  <i className={`fas ${p.stock_qty > 0 ? "fa-check-circle" : "fa-times-circle"}`}></i> {p.stock_qty > 0 ? "In Stock" : "Out of Stock"}
                </span>
                {p.lead_time_days && p.stock_qty === 0 && (
                  <span className="text-xs text-mk-gray-600">Lead time: {p.lead_time_days} days</span>
                )}
              </div>

              {/* Price */}
              <div className="bg-mk-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-3xl font-extrabold text-mk-gray-900">₹{Number(p.price).toLocaleString("en-IN")}</span>
                  {p.mrp && p.mrp > p.price && <span className="text-lg text-mk-gray-600 line-through">₹{Number(p.mrp).toLocaleString("en-IN")}</span>}
                  <span className="text-sm font-semibold">/{p.unit || "piece"}</span>
                  {discount > 0 && <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded ml-2">Save {discount}%</span>}
                </div>
                <p className="text-xs text-mk-gray-600">Inclusive of all taxes. GST Invoice available.</p>
              </div>

              {/* Key Specs Quick View */}
              {specs.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {specs.slice(0, 6).map(([label, value]) => (
                    <div key={label} className="flex items-center gap-2 text-sm">
                      <i className="fas fa-info-circle text-mk-red w-5"></i>
                      <span className="text-mk-gray-600">{label}:</span>
                      <span className="font-semibold text-mk-gray-800">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity & Cart */}
              <div className="border-t border-gray-100 pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <label className="text-sm font-semibold text-mk-gray-800">Quantity ({p.unit || "piece"}):</label>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => setQty((q) => Math.max(p.min_order_qty || 1, q - 1))} className="qty-btn w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 font-bold text-lg transition-colors">-</button>
                    <input type="number" value={qty} onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 1) setQty(Math.min(v, p.stock_qty || 9999)) }}
                      className="w-20 h-10 text-center border-x border-gray-200 text-sm font-semibold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                    <button onClick={() => setQty((q) => Math.min(q + 1, p.stock_qty || 9999))} className="qty-btn w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 font-bold text-lg transition-colors">+</button>
                  </div>
                  <span className="text-xs text-mk-gray-600">MOQ: {p.min_order_qty || 1} {p.unit || "piece"}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      addItem({
                        id: p.id,
                        name: p.name,
                        slug: p.slug,
                        brand_name: p.brand_name,
                        image_url: p.image_url,
                        price: Number(p.price),
                        mrp: p.mrp ? Number(p.mrp) : undefined,
                        unit: p.unit || "piece",
                        sku: p.sku,
                        stock_qty: p.stock_qty || 9999,
                        min_order_qty: p.min_order_qty || 1,
                      }, qty)
                      setAddedToCart(true)
                      setTimeout(() => setAddedToCart(false), 2000)
                    }}
                    disabled={p.stock_qty === 0}
                    className="flex-1 bg-mk-red hover:bg-mk-red-600 text-white text-center font-bold py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addedToCart ? (
                      <><i className="fas fa-check mr-2"></i>Added to Cart!</>
                    ) : (
                      <><i className="fas fa-shopping-cart mr-2"></i>Add to Cart</>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      addItem({
                        id: p.id,
                        name: p.name,
                        slug: p.slug,
                        brand_name: p.brand_name,
                        image_url: p.image_url,
                        price: Number(p.price),
                        mrp: p.mrp ? Number(p.mrp) : undefined,
                        unit: p.unit || "piece",
                        sku: p.sku,
                        stock_qty: p.stock_qty || 9999,
                        min_order_qty: p.min_order_qty || 1,
                      }, qty)
                      navigate("/cart")
                    }}
                    disabled={p.stock_qty === 0}
                    className="flex-1 bg-mk-gray-900 hover:bg-mk-gray-800 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="fas fa-bolt mr-2"></i>Buy Now
                  </button>
                </div>
                <button className="w-full mt-3 border border-gray-200 text-mk-gray-600 font-semibold py-3 rounded-lg hover:border-mk-red hover:text-mk-red transition-colors text-sm">
                  <i className="fas fa-file-invoice mr-2"></i>Request Bulk Quote
                </button>
              </div>

              {/* Delivery */}
              <div className="border-t border-gray-100 mt-6 pt-6">
                <h4 className="text-sm font-bold text-mk-gray-800 mb-3">Delivery & Availability</h4>
                <div className="flex gap-2 mb-3">
                  <input type="text" placeholder="Enter Pincode" className="border border-gray-200 rounded-lg py-2 px-3 text-sm flex-1 focus:outline-none focus:border-mk-red" />
                  <button className="bg-mk-gray-900 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-mk-gray-800">Check</button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-mk-gray-600"><i className="fas fa-truck text-green-500 w-5"></i> Free delivery on orders above ₹10,000</div>
                  <div className="flex items-center gap-2 text-sm text-mk-gray-600"><i className="fas fa-clock text-blue-500 w-5"></i> Estimated delivery: 5-7 business days</div>
                  <div className="flex items-center gap-2 text-sm text-mk-gray-600"><i className="fas fa-undo text-orange-500 w-5"></i> Easy returns within 7 days</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 mt-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {[
              { id: "description", label: "Description" },
              { id: "specifications", label: "Specifications" },
              { id: "additional", label: "Additional Details" },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab.id ? "border-mk-red text-mk-red" : "border-transparent text-mk-gray-600 hover:text-mk-gray-800"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-6 lg:p-8">
            {activeTab === "description" && (
              <div>
                <h3 className="text-lg font-bold text-mk-gray-900 mb-4">Product Description</h3>
                {p.description ? (
                  <p className="text-sm text-mk-gray-600 leading-relaxed whitespace-pre-line">{p.description}</p>
                ) : (
                  <p className="text-sm text-mk-gray-500 italic">No description available.</p>
                )}
                {p.customer_care_details && (
                  <div className="mt-6">
                    <h4 className="font-bold text-sm text-mk-gray-800 mb-2">Customer Care</h4>
                    <p className="text-sm text-mk-gray-600">{p.customer_care_details}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-mk-gray-900 mb-4">Technical Specifications</h3>
                  {specs.length > 0 ? (
                    <table className="w-full text-sm">
                      <tbody>
                        {specs.map(([k, v]) => (
                          <tr key={k} className="border-b border-gray-100">
                            <td className="py-2.5 text-mk-gray-600 w-40">{k}</td>
                            <td className="py-2.5 font-semibold text-mk-gray-800">{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-sm text-mk-gray-500 italic">No specifications available.</p>
                  )}
                </div>
                {pkgSpecs.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-mk-gray-900 mb-4">Packaging Details</h3>
                    <table className="w-full text-sm">
                      <tbody>
                        {pkgSpecs.map(([k, v]) => (
                          <tr key={k} className="border-b border-gray-100">
                            <td className="py-2.5 text-mk-gray-600 w-40">{k}</td>
                            <td className="py-2.5 font-semibold text-mk-gray-800">{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {p.tech_sheet_url && (
                  <div className="lg:col-span-2">
                    <a href={p.tech_sheet_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-mk-red text-sm font-semibold hover:underline">
                      <i className="fas fa-file-pdf"></i> Download Technical Data Sheet
                    </a>
                  </div>
                )}
              </div>
            )}

            {activeTab === "additional" && (
              <div>
                <h3 className="text-lg font-bold text-mk-gray-900 mb-4">Additional Details</h3>
                <table className="w-full text-sm max-w-lg">
                  <tbody>
                    {p.manufactured_by && (
                      <tr className="border-b border-gray-100">
                        <td className="py-2.5 text-mk-gray-600 w-40">Manufactured By</td>
                        <td className="py-2.5 font-semibold text-mk-gray-800">{p.manufactured_by}</td>
                      </tr>
                    )}
                    {p.packaged_by && (
                      <tr className="border-b border-gray-100">
                        <td className="py-2.5 text-mk-gray-600 w-40">Packaged By</td>
                        <td className="py-2.5 font-semibold text-mk-gray-800">{p.packaged_by}</td>
                      </tr>
                    )}
                    {p.warranty && (
                      <tr className="border-b border-gray-100">
                        <td className="py-2.5 text-mk-gray-600 w-40">Warranty</td>
                        <td className="py-2.5 font-semibold text-mk-gray-800">{p.warranty}</td>
                      </tr>
                    )}
                    {p.lead_time_days && (
                      <tr className="border-b border-gray-100">
                        <td className="py-2.5 text-mk-gray-600 w-40">Lead Time (if not in stock)</td>
                        <td className="py-2.5 font-semibold text-mk-gray-800">{p.lead_time_days} days</td>
                      </tr>
                    )}
                    {p.country_of_origin && (
                      <tr className="border-b border-gray-100">
                        <td className="py-2.5 text-mk-gray-600 w-40">Country of Origin</td>
                        <td className="py-2.5 font-semibold text-mk-gray-800">{p.country_of_origin}</td>
                      </tr>
                    )}
                    {p.customer_care_details && (
                      <tr className="border-b border-gray-100">
                        <td className="py-2.5 text-mk-gray-600 w-40">Customer Care</td>
                        <td className="py-2.5 font-semibold text-mk-gray-800">{p.customer_care_details}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {!p.manufactured_by && !p.packaged_by && !p.warranty && !p.lead_time_days && (
                  <p className="text-sm text-mk-gray-500 italic">No additional details available.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
