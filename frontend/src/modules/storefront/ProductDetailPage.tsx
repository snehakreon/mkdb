import { Link } from "react-router-dom"

export default function ProductDetailPage() {
  return (
    <div>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-mk-gray-600">
          <Link to="/" className="hover:text-mk-red transition-colors">Home</Link>
          <i className="fas fa-chevron-right text-[10px]"></i>
          <Link to="/products" className="hover:text-mk-red transition-colors">Products</Link>
          <i className="fas fa-chevron-right text-[10px]"></i>
          <span className="text-mk-gray-800 font-semibold">Polished Vitrified Floor Tile 600x600mm</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Image Gallery */}
            <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-100">
              <div className="bg-mk-gray-50 rounded-xl h-96 flex items-center justify-center mb-4 relative">
                <span className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded">15% OFF</span>
                <i className="fas fa-th-large text-7xl text-gray-300"></i>
                <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:text-mk-red transition-colors">
                  <i className="far fa-heart text-lg"></i>
                </button>
              </div>
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((n) => (
                  <button key={n} className={`thumb-img w-20 h-20 bg-mk-gray-50 rounded-lg border-2 ${n === 1 ? "border-mk-red active" : "border-gray-200"} flex items-center justify-center flex-shrink-0`}>
                    <i className="fas fa-th-large text-xl text-gray-400"></i>
                  </button>
                ))}
                <button className="thumb-img w-20 h-20 bg-mk-gray-50 rounded-lg border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-play text-xl text-gray-400"></i>
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-mk-gray-100 text-mk-gray text-xs font-semibold px-2 py-0.5 rounded">Kajaria</span>
                <span className="text-xs text-mk-gray-600">SKU: KAJ-VIT-MW-600</span>
              </div>

              <h1 className="text-2xl font-extrabold text-mk-gray-900 mb-3">Polished Vitrified Floor Tile 600x600mm - Marble White</h1>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400"><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star-half-alt"></i></span>
                  <span className="text-sm font-semibold text-mk-gray-800 ml-1">4.5</span>
                </div>
                <span className="text-sm text-mk-gray-600">(128 Reviews)</span>
                <span className="text-sm text-green-600 font-semibold"><i className="fas fa-check-circle"></i> In Stock</span>
              </div>

              {/* Price */}
              <div className="bg-mk-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-3xl font-extrabold text-mk-gray-900">₹45</span>
                  <span className="text-lg text-mk-gray-600 line-through">₹53</span>
                  <span className="text-sm font-semibold">/sq.ft</span>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded ml-2">Save 15%</span>
                </div>
                <p className="text-xs text-mk-gray-600">Inclusive of all taxes. GST Invoice available.</p>

                {/* Bulk Pricing */}
                <div className="mt-4">
                  <h4 className="text-xs font-bold text-mk-gray-800 mb-2 uppercase tracking-wider">Bulk Pricing</h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <div className="text-xs text-mk-gray-600">100-499 sq.ft</div>
                      <div className="font-bold text-sm">₹45/sq.ft</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-mk-red/30 bg-mk-red-50">
                      <div className="text-xs text-mk-red font-semibold">500-999 sq.ft</div>
                      <div className="font-bold text-sm text-mk-red">₹42/sq.ft</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <div className="text-xs text-mk-gray-600">1000+ sq.ft</div>
                      <div className="font-bold text-sm">₹38/sq.ft</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Specs */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { icon: "fa-ruler-combined", label: "Size:", value: "600 x 600 mm" },
                  { icon: "fa-layer-group", label: "Type:", value: "Vitrified" },
                  { icon: "fa-gem", label: "Finish:", value: "Polished / Glossy" },
                  { icon: "fa-box", label: "Coverage:", value: "4 tiles = 4 sq.ft" },
                  { icon: "fa-home", label: "Usage:", value: "Floor & Wall" },
                  { icon: "fa-barcode", label: "HSN:", value: "6907" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2 text-sm">
                    <i className={`fas ${s.icon} text-mk-red w-5`}></i>
                    <span className="text-mk-gray-600">{s.label}</span>
                    <span className="font-semibold text-mk-gray-800">{s.value}</span>
                  </div>
                ))}
              </div>

              {/* Quantity & Cart */}
              <div className="border-t border-gray-100 pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <label className="text-sm font-semibold text-mk-gray-800">Quantity (sq.ft):</label>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button className="qty-btn w-10 h-10 flex items-center justify-center bg-gray-50 font-bold text-lg transition-colors">-</button>
                    <input type="number" defaultValue={100} className="w-20 h-10 text-center border-x border-gray-200 text-sm font-semibold focus:outline-none" />
                    <button className="qty-btn w-10 h-10 flex items-center justify-center bg-gray-50 font-bold text-lg transition-colors">+</button>
                  </div>
                  <span className="text-xs text-mk-gray-600">MOQ: 100 sq.ft</span>
                </div>
                <div className="flex items-center gap-2 mb-4 text-sm">
                  <span className="text-mk-gray-600">Order Total:</span>
                  <span className="text-xl font-extrabold text-mk-gray-900">₹4,500</span>
                  <span className="text-xs text-mk-gray-600">(incl. GST)</span>
                </div>
                <div className="flex gap-3">
                  <Link to="/cart" className="flex-1 bg-mk-red hover:bg-mk-red-600 text-white text-center font-bold py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl">
                    <i className="fas fa-shopping-cart mr-2"></i>Add to Cart
                  </Link>
                  <button className="flex-1 bg-mk-gray-900 hover:bg-mk-gray-800 text-white font-bold py-3 rounded-lg transition-colors">
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

        {/* Product Tabs - Description & Specs */}
        <div className="bg-white rounded-xl border border-gray-200 mt-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button className="tab-btn active px-6 py-4 text-sm font-semibold border-b-2 border-mk-red text-mk-red">Description</button>
            <button className="tab-btn px-6 py-4 text-sm font-semibold border-b-2 border-transparent text-mk-gray-600 hover:text-mk-gray-800">Specifications</button>
            <button className="tab-btn px-6 py-4 text-sm font-semibold border-b-2 border-transparent text-mk-gray-600 hover:text-mk-gray-800">Reviews (128)</button>
          </div>
          <div className="p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold text-mk-gray-900 mb-4">Product Description</h3>
                <p className="text-sm text-mk-gray-600 leading-relaxed mb-4">
                  The Kajaria Polished Vitrified Floor Tile in Marble White finish brings an elegant, premium look to any space. Made with state-of-the-art Italian technology, these tiles offer exceptional durability, low water absorption, and a brilliant glossy finish.
                </p>
                <h4 className="font-bold text-sm text-mk-gray-800 mb-2">Key Features:</h4>
                <ul className="space-y-2 text-sm text-mk-gray-600">
                  {["High gloss polished finish for premium look", "Water absorption less than 0.05%", "Scratch & stain resistant surface", "Uniform size with rectified edges", "ISO 13006 certified"].map((f) => (
                    <li key={f} className="flex items-start gap-2"><i className="fas fa-check text-green-500 mt-0.5"></i> {f}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-mk-gray-900 mb-4">Technical Specifications</h3>
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      ["Brand", "Kajaria"], ["Material", "Vitrified"], ["Size", "600 x 600 mm"],
                      ["Thickness", "9.5 mm"], ["Finish", "Polished / Glossy"], ["Color", "Marble White"],
                      ["Coverage", "3.46 sq.ft per box"], ["Water Absorption", "< 0.05%"],
                      ["Breaking Strength", "> 2000 N"], ["HSN Code", "6907"], ["Country", "India"],
                    ].map(([k, v]) => (
                      <tr key={k} className="border-b border-gray-100">
                        <td className="py-2.5 text-mk-gray-600 w-40">{k}</td>
                        <td className="py-2.5 font-semibold text-mk-gray-800">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
