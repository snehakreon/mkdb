import { useState, useEffect } from "react"
import { dashboardService } from "../../services/dashboard.service"
import StatusBadge from "../../components/ui/StatusBadge"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts"

const PIE_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#6366f1", "#f97316", "#14b8a6"]

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  pending_dealer_approval: "Dealer Approval",
  confirmed: "Confirmed",
  dispatched: "Dispatched",
  in_transit: "In Transit",
  delivered: "Delivered",
  partially_delivered: "Partial Delivery",
  cancelled: "Cancelled",
  disputed: "Disputed",
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [ordersByStatus, setOrdersByStatus] = useState<any[]>([])
  const [revenueByMonth, setRevenueByMonth] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, statusRes, revenueRes, productsRes, recentRes] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getOrdersByStatus(),
          dashboardService.getRevenueByMonth(),
          dashboardService.getTopProducts(),
          dashboardService.getRecentOrders(),
        ])
        setStats(statsRes.data)
        setOrdersByStatus((statusRes.data || []).map((d: any) => ({ ...d, name: STATUS_LABELS[d.name] || d.name })))
        setRevenueByMonth(revenueRes.data || [])
        setTopProducts(productsRes.data || [])
        setRecentOrders(recentRes.data || [])
      } catch { /* empty */ }
      setLoading(false)
    }
    fetchAll()
  }, [])

  if (loading) return <div className="text-center py-8 text-gray-500">Loading dashboard...</div>

  const cards = [
    { label: "Total Orders", value: stats?.total_orders || 0, color: "bg-blue-500" },
    { label: "Pending Orders", value: stats?.pending_orders || 0, color: "bg-yellow-500" },
    { label: "Delivered", value: stats?.delivered_orders || 0, color: "bg-green-500" },
    { label: "Revenue", value: `₹${Number(stats?.total_revenue || 0).toLocaleString()}`, color: "bg-emerald-500" },
    { label: "Products", value: stats?.total_products || 0, color: "bg-purple-500" },
    { label: "Out of Stock", value: stats?.out_of_stock_products || 0, color: "bg-red-500" },
    { label: "Buyers", value: stats?.total_buyers || 0, color: "bg-indigo-500" },
    { label: "Dealers", value: stats?.total_dealers || 0, color: "bg-orange-500" },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue by Month */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h2>
          {revenueByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => [`₹${Number(value).toLocaleString()}`, "Revenue"]}
                  labelStyle={{ fontWeight: 600 }} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="orders" name="Orders" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">No revenue data yet</div>
          )}
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h2>
          {ordersByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={ordersByStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                  paddingAngle={3} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`}>
                  {ordersByStatus.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">No order data yet</div>
          )}
        </div>
      </div>

      {/* Top Products */}
      {topProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Products by Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts} layout="vertical" margin={{ left: 120 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
              <Tooltip formatter={(value: number) => [`₹${Number(value).toLocaleString()}`, "Revenue"]} />
              <Bar dataKey="revenue" name="Revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">No orders yet</td></tr>
              ) : (
                recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-primary-600">{order.order_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{order.buyer_company || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">₹{Number(order.total_amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-sm"><StatusBadge status={order.payment_status} /></td>
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
