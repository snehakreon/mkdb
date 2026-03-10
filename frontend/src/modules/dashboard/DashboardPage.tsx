import { useState, useEffect } from "react"
import { orderService } from "../../services/order.service"
import { productService } from "../../services/product.service"
import { buyerService } from "../../services/buyer.service"
import { dealerService } from "../../services/dealer.service"
import StatusBadge from "../../components/ui/StatusBadge"

interface Stats {
  totalOrders: number
  totalProducts: number
  totalBuyers: number
  totalDealers: number
  recentOrders: any[]
  totalRevenue: number
  pendingOrders: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0, totalProducts: 0, totalBuyers: 0, totalDealers: 0,
    recentOrders: [], totalRevenue: 0, pendingOrders: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [orders, products, buyers, dealers] = await Promise.all([
          orderService.getAll(), productService.getAll(),
          buyerService.getAll(), dealerService.getAll(),
        ])
        const orderData = orders.data || []
        const revenue = orderData.reduce((sum: number, o: any) => sum + Number(o.total_amount || 0), 0)
        const pending = orderData.filter((o: any) => ["pending", "pending_dealer_approval"].includes(o.order_status)).length

        setStats({
          totalOrders: orderData.length,
          totalProducts: (products.data || []).length,
          totalBuyers: (buyers.data || []).length,
          totalDealers: (dealers.data || []).length,
          recentOrders: orderData.slice(0, 5),
          totalRevenue: revenue,
          pendingOrders: pending,
        })
      } catch { /* empty */ }
      setLoading(false)
    }
    fetchStats()
  }, [])

  if (loading) return <div className="text-center py-8 text-gray-500">Loading dashboard...</div>

  const cards = [
    { label: "Total Orders", value: stats.totalOrders, color: "bg-blue-500" },
    { label: "Pending Orders", value: stats.pendingOrders, color: "bg-yellow-500" },
    { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, color: "bg-green-500" },
    { label: "Products", value: stats.totalProducts, color: "bg-purple-500" },
    { label: "Buyers", value: stats.totalBuyers, color: "bg-indigo-500" },
    { label: "Dealers", value: stats.totalDealers, color: "bg-orange-500" },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-lg shadow p-4">
            <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center mb-3`}>
              <span className="text-white text-lg font-bold">{String(card.value).charAt(0)}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No orders yet</td></tr>
              ) : (
                stats.recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-primary-600">{order.order_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{order.buyer_company}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">₹{Number(order.total_amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm"><StatusBadge status={order.order_status} /></td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
