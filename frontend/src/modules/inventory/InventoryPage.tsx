import { useState, useEffect } from "react"
import { inventoryService } from "../../services/inventory.service"
import StatusBadge from "../../components/ui/StatusBadge"

interface StockItem {
  id: number; name: string; sku: string; stock_qty: number; min_order_qty: number;
  price: number; category_name: string; brand_name: string; stock_status: string; lead_time_days: number;
}

interface Transaction {
  id: number; product_name: string; sku: string; transaction_type: string;
  quantity_change: number; quantity_before: number; quantity_after: number;
  reason: string; reference_type: string; created_at: string;
}

interface Summary {
  total_products: number; out_of_stock: number; low_stock: number;
  in_stock: number; total_units: number; total_stock_value: number;
}

export default function InventoryPage() {
  const [tab, setTab] = useState<"stock" | "alerts" | "transactions">("stock")
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [alertItems, setAlertItems] = useState<StockItem[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  // Stock update modal
  const [editItem, setEditItem] = useState<StockItem | null>(null)
  const [editQty, setEditQty] = useState("")
  const [editReason, setEditReason] = useState("")
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [stockRes, alertRes, txRes, summaryRes] = await Promise.all([
        inventoryService.getStockLevels(),
        inventoryService.getStockLevels({ alert: "low" }),
        inventoryService.getTransactions(),
        inventoryService.getSummary(),
      ])
      setStockItems(stockRes.data || [])
      setAlertItems(alertRes.data || [])
      setTransactions(txRes.data || [])
      setSummary(summaryRes.data)
    } catch { /* empty */ }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleStockUpdate = async () => {
    if (!editItem || editQty === "") return
    setSaving(true)
    try {
      await inventoryService.updateStock(String(editItem.id), { quantity: Number(editQty), reason: editReason || undefined })
      setEditItem(null)
      fetchData()
    } catch (err: any) {
      alert(err.response?.data?.message || "Update failed")
    }
    setSaving(false)
  }

  const stockStatusColor = (status: string) => {
    if (status === "out_of_stock") return "bg-red-100 text-red-700"
    if (status === "low_stock") return "bg-yellow-100 text-yellow-700"
    return "bg-green-100 text-green-700"
  }

  if (loading) return <div className="text-center py-8 text-gray-500">Loading inventory...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Inventory Management</h1>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[
            { label: "Total Products", value: summary.total_products, color: "bg-blue-500" },
            { label: "In Stock", value: summary.in_stock, color: "bg-green-500" },
            { label: "Low Stock", value: summary.low_stock, color: "bg-yellow-500" },
            { label: "Out of Stock", value: summary.out_of_stock, color: "bg-red-500" },
            { label: "Total Units", value: Number(summary.total_units).toLocaleString(), color: "bg-purple-500" },
            { label: "Stock Value", value: `₹${Number(summary.total_stock_value || 0).toLocaleString()}`, color: "bg-indigo-500" },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-lg shadow p-4">
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center mb-3`}>
                <span className="text-white text-lg font-bold">{String(card.value).charAt(0)}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
        {([
          { key: "stock", label: "All Stock", count: stockItems.length },
          { key: "alerts", label: "Low Stock Alerts", count: alertItems.length },
          { key: "transactions", label: "Stock Movements", count: transactions.length },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${tab === t.key ? "bg-white shadow font-medium text-primary-700" : "text-gray-600 hover:text-gray-800"}`}>
            {t.label} {t.count > 0 && <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${t.key === "alerts" && t.count > 0 ? "bg-red-100 text-red-700" : "bg-gray-200 text-gray-600"}`}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Stock Levels Tab */}
      {(tab === "stock" || tab === "alerts") && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stock Qty</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">MOQ</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(tab === "alerts" ? alertItems : stockItems).map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.sku}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.category_name || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.brand_name || "-"}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{item.stock_qty}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-500">{item.min_order_qty}</td>
                  <td className="px-4 py-3 text-sm text-right">₹{Number(item.price).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${stockStatusColor(item.stock_status)}`}>
                      {item.stock_status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditItem(item); setEditQty(String(item.stock_qty)); setEditReason("") }}
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                      Update Stock
                    </button>
                  </td>
                </tr>
              ))}
              {(tab === "alerts" ? alertItems : stockItems).length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                  {tab === "alerts" ? "No low stock alerts" : "No products found"}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Transactions Tab */}
      {tab === "transactions" && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Change</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Before</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">After</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(tx.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm font-medium">{tx.product_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{tx.sku}</td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={tx.transaction_type} />
                  </td>
                  <td className={`px-4 py-3 text-sm text-right font-medium ${tx.quantity_change > 0 ? "text-green-600" : "text-red-600"}`}>
                    {tx.quantity_change > 0 ? "+" : ""}{tx.quantity_change}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-500">{tx.quantity_before}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-500">{tx.quantity_after}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{tx.reason || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{tx.reference_type || "-"}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No stock movements recorded</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Stock Update Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setEditItem(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Update Stock</h3>
              <button onClick={() => setEditItem(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="font-medium">{editItem.name}</p>
              <p className="text-sm text-gray-500">SKU: {editItem.sku} | Current Stock: {editItem.stock_qty}</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Quantity *</label>
                <input type="number" min="0" value={editQty} onChange={(e) => setEditQty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea value={editReason} onChange={(e) => setEditReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm h-20"
                  placeholder="e.g. Restock from vendor, inventory correction..." />
              </div>
              {editQty !== "" && Number(editQty) !== editItem.stock_qty && (
                <p className={`text-sm font-medium ${Number(editQty) > editItem.stock_qty ? "text-green-600" : "text-red-600"}`}>
                  Change: {Number(editQty) > editItem.stock_qty ? "+" : ""}{Number(editQty) - editItem.stock_qty} units
                </p>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setEditItem(null)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
                <button onClick={handleStockUpdate} disabled={saving || editQty === ""}
                  className="px-4 py-2 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50">
                  {saving ? "Saving..." : "Update Stock"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
