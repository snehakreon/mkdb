import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useCart } from "../../context/CartContext"
import { useAuth } from "../../context/AuthContext"
import { api } from "../../services/api"

interface Address {
  id: number
  label: string
  full_name: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  pincode: string
  is_default: boolean
}

export default function CheckoutPage() {
  const { items, subtotal, coupon, clearCart, totalItems } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState("")

  const gstRate = 0.18
  const discountAmount = coupon ? coupon.discount_amount : 0
  const taxableAmount = subtotal - discountAmount
  const gst = Math.round(taxableAmount * gstRate * 100) / 100
  const shippingFree = subtotal >= 10000
  const shipping = shippingFree ? 0 : 500
  const total = Math.round((taxableAmount + gst + shipping) * 100) / 100

  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }
    if (items.length === 0) {
      navigate("/cart")
      return
    }
    // Fetch saved addresses
    api.get("/addresses").then((r) => {
      setAddresses(r.data)
      const def = r.data.find((a: Address) => a.is_default)
      if (def) setSelectedAddress(def.id)
      else if (r.data.length > 0) setSelectedAddress(r.data[0].id)
    }).catch(() => {})
  }, [user, items.length, navigate])

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setError("Please select a delivery address")
      return
    }
    setPlacing(true)
    setError("")
    try {
      const address = addresses.find((a) => a.id === selectedAddress)
      const shippingAddr = address
        ? `${address.full_name}, ${address.address_line1}${address.address_line2 ? ", " + address.address_line2 : ""}, ${address.city}, ${address.state} - ${address.pincode}, Phone: ${address.phone}`
        : ""

      const { data: order } = await api.post("/orders", {
        shipping_address: shippingAddr,
        payment_method: paymentMethod,
        total_amount: total,
        notes: coupon ? `Coupon: ${coupon.code} (-₹${discountAmount})` : undefined,
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
        })),
      })

      clearCart()
      navigate(`/order-confirmation/${order.id}`)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to place order. Please try again.")
    } finally {
      setPlacing(false)
    }
  }

  if (!user || items.length === 0) return null

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-mk-gray-600">
          <Link to="/" className="hover:text-mk-red transition-colors">Home</Link>
          <i className="fas fa-chevron-right text-[10px]"></i>
          <Link to="/cart" className="hover:text-mk-red transition-colors">Cart</Link>
          <i className="fas fa-chevron-right text-[10px]"></i>
          <span className="text-mk-gray-800 font-semibold">Checkout</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <h1 className="text-3xl font-extrabold text-mk-gray-900 mb-6">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left - Address & Payment */}
          <div className="flex-1 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-lg font-bold text-mk-gray-900 mb-4">
                <i className="fas fa-map-marker-alt text-mk-red mr-2"></i>Delivery Address
              </h2>
              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-mk-gray-600 mb-3">No saved addresses found.</p>
                  <Link to="/account/addresses" className="text-mk-red font-semibold text-sm hover:underline">
                    <i className="fas fa-plus mr-1"></i>Add New Address
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`block border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedAddress === addr.id ? "border-mk-red bg-red-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddress === addr.id}
                          onChange={() => setSelectedAddress(addr.id)}
                          className="mt-1 accent-red-600"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-mk-gray-900">{addr.full_name}</span>
                            <span className="bg-gray-100 text-mk-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded">{addr.label}</span>
                            {addr.is_default && <span className="bg-green-100 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded">Default</span>}
                          </div>
                          <p className="text-sm text-mk-gray-600">
                            {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ""}<br />
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="text-sm text-mk-gray-600 mt-1">Phone: {addr.phone}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                  <Link to="/account/addresses" className="text-mk-red font-semibold text-sm hover:underline inline-block mt-2">
                    <i className="fas fa-plus mr-1"></i>Add New Address
                  </Link>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-lg font-bold text-mk-gray-900 mb-4">
                <i className="fas fa-credit-card text-mk-red mr-2"></i>Payment Method
              </h2>
              <div className="space-y-3">
                {[
                  { id: "cod", label: "Cash on Delivery", icon: "fa-money-bill-wave", desc: "Pay when you receive your order" },
                  { id: "upi", label: "UPI", icon: "fa-mobile-alt", desc: "Google Pay, PhonePe, Paytm UPI" },
                  { id: "netbanking", label: "Net Banking", icon: "fa-university", desc: "All major banks supported" },
                  { id: "card", label: "Credit / Debit Card", icon: "fa-credit-card", desc: "Visa, Mastercard, RuPay" },
                ].map((method) => (
                  <label
                    key={method.id}
                    className={`block border rounded-lg p-4 cursor-pointer transition-colors ${
                      paymentMethod === method.id ? "border-mk-red bg-red-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                        className="accent-red-600"
                      />
                      <i className={`fas ${method.icon} text-mk-gray-600 w-5 text-center`}></i>
                      <div>
                        <span className="font-semibold text-sm text-mk-gray-900">{method.label}</span>
                        <p className="text-xs text-mk-gray-500">{method.desc}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Order Summary */}
          <div className="lg:w-96">
            <div className="bg-white rounded-xl border border-gray-200 sticky top-24">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-lg font-bold text-mk-gray-900">Order Summary</h2>
              </div>

              <div className="p-5 space-y-3 max-h-64 overflow-y-auto border-b border-gray-100">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-mk-gray-50 rounded flex items-center justify-center flex-shrink-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="max-h-full max-w-full object-contain rounded" />
                      ) : (
                        <i className="fas fa-box text-sm text-gray-300"></i>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-mk-gray-800 truncate">{item.name}</p>
                      <p className="text-[10px] text-mk-gray-500">Qty: {item.quantity} x ₹{Number(item.price).toLocaleString("en-IN")}</p>
                    </div>
                    <span className="text-sm font-semibold text-mk-gray-800">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
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
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-mk-gray-900">Total</span>
                    <span className="text-2xl font-extrabold text-mk-gray-900">₹{total.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5">
                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                <button
                  onClick={handlePlaceOrder}
                  disabled={placing || !selectedAddress}
                  className="w-full bg-mk-red hover:bg-mk-red-600 text-white font-bold py-3.5 rounded-lg transition-colors shadow-lg hover:shadow-xl text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {placing ? (
                    <><i className="fas fa-spinner fa-spin mr-2"></i>Placing Order...</>
                  ) : (
                    <><i className="fas fa-check mr-2"></i>Place Order</>
                  )}
                </button>
                <p className="text-[10px] text-mk-gray-500 text-center mt-3">By placing this order, you agree to our Terms of Service and Privacy Policy.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
