import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
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
  item_count: number
  created_at: string
  items?: OrderItem[]
}

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
]

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-indigo-100 text-indigo-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  }
  return styles[status] || "bg-gray-100 text-gray-800"
}

const paymentLabel: Record<string, string> = {
  cod: "Cash on Delivery",
  upi: "UPI",
  netbanking: "Net Banking",
  card: "Credit / Debit Card",
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [expandedItems, setExpandedItems] = useState<Record<number, OrderItem[]>>({})
  const [loadingDetail, setLoadingDetail] = useState<number | null>(null)

  useEffect(() => {
    api.get("/orders/my")
      .then((r) => setOrders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggleExpand = async (orderId: number) => {
    if (expandedId === orderId) {
      setExpandedId(null)
      return
    }
    setExpandedId(orderId)

    if (!expandedItems[orderId]) {
      setLoadingDetail(orderId)
      try {
        const { data } = await api.get(`/orders/my/${orderId}`)
        setExpandedItems((prev) => ({ ...prev, [orderId]: data.items }))
      } catch { /* silent */ }
      finally { setLoadingDetail(null) }
    }
  }

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter)

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-bold text-mk-gray-900 mb-6">My Orders</h1>
        <div className="text-center py-16 text-mk-gray-500">Loading orders...</div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-mk-gray-900 mb-6">My Orders</h1>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 text-sm rounded-full font-medium transition-colors ${
                filter === f.key
                  ? "bg-mk-red text-white"
                  : "text-mk-gray-600 hover:bg-gray-100"
              }`}
            >
              {f.label}
              {f.key !== "all" && (
                <span className="ml-1 text-xs">
                  ({orders.filter((o) => o.status === f.key).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-box-open text-3xl text-gray-300"></i>
            </div>
            <h3 className="text-lg font-semibold text-mk-gray-800 mb-1">
              {filter === "all" ? "No orders yet" : `No ${filter} orders`}
            </h3>
            <p className="text-sm text-mk-gray-500 mb-4">
              {filter === "all" ? "When you place an order, it will appear here." : "No orders match this filter."}
            </p>
            {filter === "all" && (
              <Link to="/products" className="inline-block bg-mk-red text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-mk-red-600 transition-colors">
                Start Shopping
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((order) => (
              <div key={order.id}>
                {/* Order Row */}
                <button
                  onClick={() => toggleExpand(order.id)}
                  className="w-full text-left p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-mk-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-box text-mk-gray-400"></i>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-mk-gray-900">{order.order_number}</p>
                        <p className="text-xs text-mk-gray-500">
                          {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          {" "}&middot;{" "}{order.item_count} item{Number(order.item_count) !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusBadge(order.status)}`}>
                        {order.status}
                      </span>
                      <div className="text-right">
                        <p className="font-bold text-sm text-mk-gray-900">₹{Number(order.total_amount).toLocaleString("en-IN")}</p>
                        <p className="text-[10px] text-mk-gray-500">{paymentLabel[order.payment_method] || order.payment_method}</p>
                      </div>
                      <i className={`fas fa-chevron-down text-xs text-mk-gray-400 transition-transform ${expandedId === order.id ? "rotate-180" : ""}`}></i>
                    </div>
                  </div>
                </button>

                {/* Expanded Detail */}
                {expandedId === order.id && (
                  <div className="px-5 pb-5 bg-gray-50 border-t border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4 text-sm">
                      <div>
                        <p className="text-xs text-mk-gray-500">Payment Method</p>
                        <p className="font-semibold text-mk-gray-800">{paymentLabel[order.payment_method] || order.payment_method}</p>
                      </div>
                      <div>
                        <p className="text-xs text-mk-gray-500">Payment Status</p>
                        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                          order.payment_status === "paid" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                        }`}>{order.payment_status}</span>
                      </div>
                      {order.shipping_address && (
                        <div>
                          <p className="text-xs text-mk-gray-500">Shipping Address</p>
                          <p className="text-xs text-mk-gray-700">{order.shipping_address}</p>
                        </div>
                      )}
                    </div>

                    {/* Items */}
                    {loadingDetail === order.id ? (
                      <p className="text-center py-4 text-sm text-mk-gray-500">Loading items...</p>
                    ) : expandedItems[order.id] ? (
                      <div className="space-y-2">
                        {expandedItems[order.id].map((item) => (
                          <div key={item.id} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-100">
                            <div className="w-10 h-10 bg-mk-gray-50 rounded flex items-center justify-center flex-shrink-0">
                              {item.image_url ? (
                                <img src={item.image_url} alt={item.product_name} className="max-h-full max-w-full object-contain rounded" />
                              ) : (
                                <i className="fas fa-box text-xs text-gray-300"></i>
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
                    ) : null}

                    {order.notes && (
                      <p className="text-xs text-mk-gray-500 mt-3"><i className="fas fa-tag mr-1"></i>{order.notes}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
