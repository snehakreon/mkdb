import { useState, useEffect } from "react"
import { orderService } from "../../services/order.service"
import DataTable from "../../components/ui/DataTable"
import StatusBadge from "../../components/ui/StatusBadge"

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  const fetchData = async () => {
    setLoading(true)
    try { setOrders((await orderService.getAll()).data) } catch { /* empty */ }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const viewOrder = async (row: any) => {
    try {
      const res = await orderService.getById(row.id)
      setSelectedOrder(res.data)
    } catch { /* empty */ }
  }

  const columns = [
    { key: "order_number", label: "Order #" },
    { key: "buyer_company", label: "Buyer" },
    { key: "dealer_company", label: "Dealer", render: (v: string) => v || "Direct" },
    { key: "order_type", label: "Type", render: (v: string) => <span className="capitalize">{v}</span> },
    { key: "total_amount", label: "Total", render: (v: number) => v ? `₹${Number(v).toLocaleString()}` : "-" },
    { key: "order_status", label: "Order Status", render: (v: string) => <StatusBadge status={v} /> },
    { key: "payment_status", label: "Payment", render: (v: string) => <StatusBadge status={v} /> },
    { key: "created_at", label: "Date", render: (v: string) => v ? new Date(v).toLocaleDateString() : "-" },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      </div>

      <DataTable columns={columns} data={orders} loading={loading} onEdit={viewOrder} />

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Order {selectedOrder.order_number}</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Buyer</p>
                <p className="font-medium">{selectedOrder.buyer_company}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Project</p>
                <p className="font-medium">{selectedOrder.project_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Order Status</p>
                <StatusBadge status={selectedOrder.order_status} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <StatusBadge status={selectedOrder.payment_status} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Subtotal</p>
                <p className="font-medium">₹{Number(selectedOrder.subtotal).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tax</p>
                <p className="font-medium">₹{Number(selectedOrder.tax_amount).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="font-bold text-lg">₹{Number(selectedOrder.total_amount).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Zone</p>
                <p className="font-medium">{selectedOrder.zone_name}</p>
              </div>
            </div>

            {selectedOrder.delivery_address && (
              <div className="mb-4">
                <p className="text-sm text-gray-500">Delivery Address</p>
                <p className="text-sm">{selectedOrder.delivery_address} - {selectedOrder.delivery_pincode}</p>
              </div>
            )}

            {selectedOrder.items?.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Order Items</h4>
                <table className="w-full text-sm border rounded">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Product</th>
                      <th className="px-3 py-2 text-left">SKU</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Unit Price</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedOrder.items.map((item: any, i: number) => (
                      <tr key={i}>
                        <td className="px-3 py-2">{item.product_name || item.product_name_snapshot}</td>
                        <td className="px-3 py-2">{item.sku_code || item.sku_code_snapshot}</td>
                        <td className="px-3 py-2 text-right">{item.quantity}</td>
                        <td className="px-3 py-2 text-right">₹{Number(item.unit_price).toLocaleString()}</td>
                        <td className="px-3 py-2 text-right">₹{Number(item.line_total).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
