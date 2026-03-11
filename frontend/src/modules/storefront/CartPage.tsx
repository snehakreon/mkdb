import { Link } from "react-router-dom"

const cartItems = [
  { brand: "Kajaria", name: "Polished Vitrified Floor Tile 600x600mm - Marble White", qty: "200 sq.ft", unitPrice: "₹45/sq.ft", total: "₹9,000", savings: "₹1,600", icon: "fa-th-large", specs: "Size: 600x600mm | Finish: Glossy | SKU: KAJ-VIT-MW-600" },
  { brand: "Asian Paints", name: "Apex Ultima Emulsion Weather Proof - 20 Litre", qty: "5 pcs", unitPrice: "₹4,850/bucket", total: "₹24,250", savings: "₹3,250", icon: "fa-paint-roller", specs: "Color: White | Type: Exterior | SKU: AP-ULT-WP-20L" },
  { brand: "Godrej", name: "7 Lever Deadbolt Door Lock - Satin Steel Finish", qty: "10 pcs", unitPrice: "₹2,350/piece", total: "₹23,500", savings: "₹4,500", icon: "fa-door-open", specs: "Finish: Satin Steel | Type: Deadbolt | SKU: GDJ-7LV-SS" },
]

export default function CartPage() {
  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-mk-gray-600">
          <Link to="/" className="hover:text-mk-red transition-colors">Home</Link>
          <i className="fas fa-chevron-right text-[10px]"></i>
          <span className="text-mk-gray-800 font-semibold">Shopping Cart</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <h1 className="text-3xl font-extrabold text-mk-gray-900 mb-6">Shopping <span className="text-mk-red">Cart</span> <span className="text-lg font-normal text-mk-gray-600">({cartItems.length} items)</span></h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            {cartItems.map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex gap-5">
                  <div className="w-28 h-28 bg-mk-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className={`fas ${item.icon} text-3xl text-gray-300`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] text-mk-gray-600 uppercase tracking-wider">{item.brand}</span>
                        <h3 className="font-bold text-sm text-mk-gray-800 mt-0.5">{item.name}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-mk-gray-600">
                          {item.specs.split(" | ").map((s) => <span key={s}>{s}</span>)}
                        </div>
                      </div>
                      <button className="text-mk-gray-300 hover:text-mk-red transition-colors"><i className="fas fa-times text-lg"></i></button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button className="qty-btn w-8 h-8 flex items-center justify-center bg-gray-50 transition-colors text-sm font-bold">-</button>
                          <span className="w-16 h-8 flex items-center justify-center border-x border-gray-200 text-sm font-semibold">{item.qty}</span>
                          <button className="qty-btn w-8 h-8 flex items-center justify-center bg-gray-50 transition-colors text-sm font-bold">+</button>
                        </div>
                        <span className="text-xs text-mk-gray-600">@ {item.unitPrice}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-mk-gray-900">{item.total}</div>
                        <div className="text-xs text-green-600 font-semibold">You save {item.savings}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between">
              <Link to="/products" className="text-mk-red font-semibold text-sm hover:underline"><i className="fas fa-arrow-left mr-2"></i>Continue Shopping</Link>
              <button className="text-mk-gray-600 text-sm hover:text-mk-red transition-colors"><i className="fas fa-trash mr-1"></i> Clear Cart</button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-96">
            <div className="bg-white rounded-xl border border-gray-200 sticky top-24">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-lg font-bold text-mk-gray-900">Order Summary</h2>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-mk-gray-600">Subtotal (3 items)</span>
                  <span className="font-semibold text-mk-gray-800">₹56,750</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-mk-gray-600">Bulk Discount</span>
                  <span className="font-semibold text-green-600">- ₹2,850</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-mk-gray-600">GST (18%)</span>
                  <span className="font-semibold text-mk-gray-800">₹9,702</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-mk-gray-600">Shipping</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-mk-gray-900">Total</span>
                    <span className="text-2xl font-extrabold text-mk-gray-900">₹63,602</span>
                  </div>
                  <p className="text-[10px] text-mk-gray-600 text-right mt-1">Inclusive of all taxes</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 flex items-center gap-2 text-sm text-green-700">
                  <i className="fas fa-tag"></i>
                  <span>You're saving <strong>₹9,350</strong> on this order!</span>
                </div>
              </div>

              <div className="px-5 pb-5">
                <div className="flex gap-2 mb-4">
                  <input type="text" placeholder="Enter coupon code" className="flex-1 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-mk-red" />
                  <button className="bg-mk-gray-900 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-mk-gray-800">Apply</button>
                </div>
                <button className="w-full bg-mk-red hover:bg-mk-red-600 text-white font-bold py-3.5 rounded-lg transition-colors shadow-lg hover:shadow-xl text-base">
                  <i className="fas fa-lock mr-2"></i>Proceed to Checkout
                </button>
                <div className="flex items-center justify-center gap-4 mt-4 text-mk-gray-600">
                  <i className="fab fa-cc-visa text-lg"></i>
                  <i className="fab fa-cc-mastercard text-lg"></i>
                  <i className="fas fa-university text-lg"></i>
                  <span className="text-xs font-semibold">UPI</span>
                  <span className="text-xs font-semibold">Net Banking</span>
                </div>
              </div>

              <div className="border-t border-gray-100 p-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-xs text-mk-gray-600"><i className="fas fa-shield-alt text-green-500"></i><span>100% Secure Payment</span></div>
                  <div className="flex items-center gap-2 text-xs text-mk-gray-600"><i className="fas fa-truck text-blue-500"></i><span>Free Shipping</span></div>
                  <div className="flex items-center gap-2 text-xs text-mk-gray-600"><i className="fas fa-undo text-orange-500"></i><span>Easy Returns</span></div>
                  <div className="flex items-center gap-2 text-xs text-mk-gray-600"><i className="fas fa-file-invoice text-purple-500"></i><span>GST Invoice</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
