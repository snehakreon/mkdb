import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useCart } from "../../context/CartContext"
import { api } from "../../services/api"

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalItems, subtotal, coupon, setCoupon } = useCart()
  const navigate = useNavigate()
  const [couponCode, setCouponCode] = useState("")
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState("")

  const gstRate = 0.18
  const discountAmount = coupon ? coupon.discount_amount : 0
  const taxableAmount = subtotal - discountAmount
  const gst = Math.round(taxableAmount * gstRate * 100) / 100
  const shippingFree = subtotal >= 10000
  const shipping = shippingFree ? 0 : 500
  const total = Math.round((taxableAmount + gst + shipping) * 100) / 100

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError("")
    try {
      const { data } = await api.post("/coupons/validate", { code: couponCode.trim(), subtotal })
      setCoupon(data)
    } catch (err: any) {
      setCouponError(err.response?.data?.message || "Invalid coupon")
      setCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCoupon(null)
    setCouponCode("")
    setCouponError("")
  }

  const handleProceedToCheckout = () => {
    navigate("/checkout")
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <i className="fas fa-shopping-cart text-6xl text-gray-200 mb-4"></i>
        <h2 className="text-2xl font-bold text-mk-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-mk-gray-600 mb-6">Looks like you haven't added any products yet.</p>
        <Link to="/products" className="inline-block bg-mk-red hover:bg-mk-red-600 text-white font-bold py-3 px-8 rounded-lg transition-colors">
          <i className="fas fa-arrow-left mr-2"></i>Browse Products
        </Link>
      </div>
    )
  }

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
        <h1 className="text-3xl font-extrabold text-mk-gray-900 mb-6">Shopping <span className="text-mk-red">Cart</span> <span className="text-lg font-normal text-mk-gray-600">({totalItems} items)</span></h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            {items.map((item) => {
              const discount = item.mrp && item.price ? Math.round((1 - item.price / item.mrp) * 100) : 0
              const lineTotal = item.price * item.quantity

              return (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex gap-5">
                    <div className="w-28 h-28 bg-mk-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="max-h-full max-w-full object-contain rounded-lg" />
                      ) : (
                        <i className="fas fa-box text-3xl text-gray-300"></i>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          {item.brand_name && <span className="text-[10px] text-mk-gray-600 uppercase tracking-wider">{item.brand_name}</span>}
                          <h3 className="font-bold text-sm text-mk-gray-800 mt-0.5">{item.name}</h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-mk-gray-600">
                            {item.sku && <span>SKU: {item.sku}</span>}
                            <span>Unit: {item.unit}</span>
                          </div>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-mk-gray-300 hover:text-mk-red transition-colors">
                          <i className="fas fa-times text-lg"></i>
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-bold"
                            >-</button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value)
                                if (!isNaN(val) && val >= 1) updateQuantity(item.id, val)
                              }}
                              className="w-16 h-8 text-center border-x border-gray-200 text-sm font-semibold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              min={1}
                              max={item.stock_qty}
                            />
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock_qty}
                              className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                            >+</button>
                          </div>
                          <span className="text-xs text-mk-gray-600">@ ₹{Number(item.price).toLocaleString("en-IN")}/{item.unit}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-mk-gray-900">₹{lineTotal.toLocaleString("en-IN")}</div>
                          {discount > 0 && item.mrp && (
                            <div className="text-xs text-green-600 font-semibold">
                              You save ₹{((item.mrp - item.price) * item.quantity).toLocaleString("en-IN")}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            <div className="flex items-center justify-between">
              <Link to="/products" className="text-mk-red font-semibold text-sm hover:underline"><i className="fas fa-arrow-left mr-2"></i>Continue Shopping</Link>
              <button onClick={clearCart} className="text-mk-gray-600 text-sm hover:text-mk-red transition-colors"><i className="fas fa-trash mr-1"></i> Clear Cart</button>
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
                  <span className="text-mk-gray-600">Subtotal ({totalItems} items)</span>
                  <span className="font-semibold text-mk-gray-800">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                {coupon && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-mk-gray-600">Coupon ({coupon.code})</span>
                    <span className="font-semibold text-green-600">- ₹{discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-mk-gray-600">GST (18%)</span>
                  <span className="font-semibold text-mk-gray-800">₹{gst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-mk-gray-600">Shipping</span>
                  <span className={`font-semibold ${shippingFree ? "text-green-600" : "text-mk-gray-800"}`}>
                    {shippingFree ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
                {!shippingFree && (
                  <p className="text-[10px] text-mk-gray-500">Free shipping on orders above ₹10,000</p>
                )}
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-mk-gray-900">Total</span>
                    <span className="text-2xl font-extrabold text-mk-gray-900">₹{total.toLocaleString("en-IN")}</span>
                  </div>
                  <p className="text-[10px] text-mk-gray-600 text-right mt-1">Inclusive of all taxes</p>
                </div>
                {items.some((i) => i.mrp && i.mrp > i.price) && (
                  <div className="bg-green-50 rounded-lg p-3 flex items-center gap-2 text-sm text-green-700">
                    <i className="fas fa-tag"></i>
                    <span>You're saving <strong>₹{items.reduce((s, i) => s + (i.mrp ? (i.mrp - i.price) * i.quantity : 0), 0).toLocaleString("en-IN")}</strong> on this order!</span>
                  </div>
                )}
              </div>

              <div className="px-5 pb-5">
                {/* Coupon Section */}
                {coupon ? (
                  <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <i className="fas fa-check-circle"></i>
                      <span>Coupon <strong>{coupon.code}</strong> applied! You save ₹{discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-red-500 hover:text-red-700 text-xs font-semibold">Remove</button>
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => { setCouponCode(e.target.value); setCouponError("") }}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                        placeholder="Enter coupon code"
                        className="flex-1 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-mk-red"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="bg-mk-gray-900 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-mk-gray-800 disabled:opacity-50"
                      >
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    </div>
                    {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
                  </div>
                )}

                <button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-mk-red hover:bg-mk-red-600 text-white font-bold py-3.5 rounded-lg transition-colors shadow-lg hover:shadow-xl text-base"
                >
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
