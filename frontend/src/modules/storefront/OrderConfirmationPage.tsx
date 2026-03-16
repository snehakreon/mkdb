import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import { api } from "../../services/api"

interface OrderItem {
  id: number
  product_name: string
  sku?: string
  image_url?: string
  unit?: string
  quantity: number
  unit_price: number
  total_price: number
}

interface Order {
  id: number
  order_number: string
  status: string
  payment_method: string
  payment_status: string
  total_amount: number
  shipping_address: string
  notes?: string
  created_at: string
  items: OrderItem[]
}

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    api.get(`/orders/my/${id}`)
      .then((r) => setOrder(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="text-center py-20 text-mk-gray-500">Loading order details...</div>
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-mk-gray-900 mb-2">Order not found</h2>
        <Link to="/account/orders" className="text-mk-red font-semibold hover:underline">View My Orders</Link>
      </div>
    )
  }

  const paymentLabel: Record<string, string> = {
    cod: "Cash on Delivery",
    upi: "UPI",
    netbanking: "Net Banking",
    card: "Credit / Debit Card",
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Success Header */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-check text-4xl text-green-600"></i>
        </div>
        <h1 className="text-3xl font-extrabold text-mk-gray-900 mb-2">Order Placed Successfully!</h1>
        <p className="text-mk-gray-600">Thank you for your order. We'll start processing it right away.</p>
      </div>

      {/* Order Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="p-5 bg-mk-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-mk-gray-500">Order Number</p>
            <p className="text-lg font-bold text-mk-gray-900">{order.order_number}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-mk-gray-500">Order Date</p>
            <p className="text-sm font-semibold text-mk-gray-800">
              {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-100">
          <div>
            <p className="text-xs text-mk-gray-500 mb-1">Status</p>
            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-1 rounded-full capitalize">{order.status}</span>
          </div>
          <div>
            <p className="text-xs text-mk-gray-500 mb-1">Payment</p>
            <p className="text-sm font-semibold text-mk-gray-800">{paymentLabel[order.payment_method] || order.payment_method}</p>
          </div>
          <div>
            <p className="text-xs text-mk-gray-500 mb-1">Payment Status</p>
            <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
              order.payment_status === "paid" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
            }`}>{order.payment_status}</span>
          </div>
        </div>

        {/* Shipping Address */}
        {order.shipping_address && (
          <div className="p-5 border-b border-gray-100">
            <p className="text-xs text-mk-gray-500 mb-1">Shipping Address</p>
            <p className="text-sm text-mk-gray-800">{order.shipping_address}</p>
          </div>
        )}

        {/* Items */}
        <div className="p-5">
          <p className="text-sm font-bold text-mk-gray-900 mb-3">Items ({order.items.length})</p>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-mk-gray-50 rounded flex items-center justify-center flex-shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.product_name} className="max-h-full max-w-full object-contain rounded" />
                  ) : (
                    <i className="fas fa-box text-sm text-gray-300"></i>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-mk-gray-800 truncate">{item.product_name}</p>
                  <p className="text-xs text-mk-gray-500">
                    Qty: {item.quantity} x ₹{Number(item.unit_price).toLocaleString("en-IN")}
                    {item.sku && <span className="ml-2">SKU: {item.sku}</span>}
                  </p>
                </div>
                <span className="text-sm font-bold text-mk-gray-900">₹{Number(item.total_price).toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="p-5 bg-mk-gray-50 border-t border-gray-200 flex items-center justify-between">
          <span className="font-bold text-mk-gray-900">Order Total</span>
          <span className="text-2xl font-extrabold text-mk-gray-900">₹{Number(order.total_amount).toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/account/orders"
          className="inline-flex items-center justify-center bg-mk-red hover:bg-mk-red-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
        >
          <i className="fas fa-list mr-2"></i>View My Orders
        </Link>
        <Link
          to="/products"
          className="inline-flex items-center justify-center border border-gray-200 hover:bg-gray-50 text-mk-gray-800 font-bold py-3 px-8 rounded-lg transition-colors"
        >
          <i className="fas fa-arrow-left mr-2"></i>Continue Shopping
        </Link>
      </div>
    </div>
  )
}
