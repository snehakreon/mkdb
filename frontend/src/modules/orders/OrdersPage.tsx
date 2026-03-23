import { useState, useEffect } from "react"
import { orderService } from "../../services/order.service"
import { productService } from "../../services/product.service"
import { buyerService } from "../../services/buyer.service"
import DataTable from "../../components/ui/DataTable"
import FormModal from "../../components/ui/FormModal"
import FormField from "../../components/ui/FormField"
import StatusBadge from "../../components/ui/StatusBadge"

const ORDER_STATUSES: Record<string, string[]> = {
  pending: ["confirmed", "pending_dealer_approval", "cancelled"],
  pending_dealer_approval: ["confirmed", "cancelled"],
  confirmed: ["dispatched", "cancelled"],
  dispatched: ["in_transit"],
  in_transit: ["delivered", "partially_delivered"],
  partially_delivered: ["delivered", "disputed"],
  delivered: ["disputed"],
  disputed: [],
  cancelled: [],
}

const PAYMENT_STATUSES = [
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "refunded", label: "Refunded" },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [statusHistory, setStatusHistory] = useState<any[]>([])

  // Status update modal
  const [statusModal, setStatusModal] = useState(false)
  const [statusForm, setStatusForm] = useState({ status: "", notes: "" })
  const [statusSaving, setStatusSaving] = useState(false)
  const [statusTarget, setStatusTarget] = useState<any>(null)

  // Edit modal
  const [editModal, setEditModal] = useState(false)
  const [editForm, setEditForm] = useState({ shipping_address: "", notes: "", payment_status: "" })
  const [editSaving, setEditSaving] = useState(false)
  const [editTarget, setEditTarget] = useState<any>(null)

  // Create modal
  const [createModal, setCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ buyer_id: "", shipping_address: "", notes: "", payment_method: "cod" })
  const [createItems, setCreateItems] = useState<{ product_id: string; quantity: number; unit_price: number }[]>([])
  const [createSaving, setCreateSaving] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [buyers, setBuyers] = useState<any[]>([])

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
      // Fetch status history
      try {
        const hist = await orderService.getHistory(row.id)
        setStatusHistory(hist.data || [])
      } catch { setStatusHistory([]) }
    } catch { /* empty */ }
  }

  // --- Status Update ---
  const openStatusUpdate = (order: any) => {
    setStatusTarget(order)
    const nextStatuses = ORDER_STATUSES[order.status] || []
    setStatusForm({ status: nextStatuses[0] || "", notes: "" })
    setStatusModal(true)
  }

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!statusTarget || !statusForm.status) return
    setStatusSaving(true)
    try {
      await orderService.transition(statusTarget.id, { status: statusForm.status, notes: statusForm.notes || undefined })
      setStatusModal(false)
      setSelectedOrder(null)
      fetchData()
    } catch (err: any) {
      alert(err.response?.data?.message || "Status update failed")
    }
    setStatusSaving(false)
  }

  // --- Edit Order ---
  const openEdit = (order: any) => {
    setEditTarget(order)
    setEditForm({
      shipping_address: order.shipping_address || order.delivery_address || "",
      notes: order.notes || "",
      payment_status: order.payment_status || "unpaid",
    })
    setEditModal(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTarget) return
    setEditSaving(true)
    try {
      await orderService.update(editTarget.id, editForm)
      setEditModal(false)
      setSelectedOrder(null)
      fetchData()
    } catch (err: any) {
      alert(err.response?.data?.message || "Update failed")
    }
    setEditSaving(false)
  }

  // --- Create Order ---
  const openCreate = async () => {
    setCreateForm({ buyer_id: "", shipping_address: "", notes: "", payment_method: "cod" })
    setCreateItems([{ product_id: "", quantity: 1, unit_price: 0 }])
    setCreateModal(true)
    try {
      const [p, b] = await Promise.all([productService.getAll(), buyerService.getAll()])
      setProducts(p.data || [])
      setBuyers(b.data || [])
    } catch { /* empty */ }
  }

  const addItem = () => setCreateItems([...createItems, { product_id: "", quantity: 1, unit_price: 0 }])
  const removeItem = (i: number) => setCreateItems(createItems.filter((_, idx) => idx !== i))
  const updateItem = (i: number, field: string, value: any) => {
    const items = [...createItems]
    ;(items[i] as any)[field] = value
    // Auto-fill price when product selected
    if (field === "product_id") {
      const product = products.find((p: any) => String(p.id) === String(value))
      if (product) items[i].unit_price = Number(product.price)
    }
    setCreateItems(items)
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (createItems.length === 0 || !createItems[0].product_id) {
      alert("Add at least one product"); return
    }
    setCreateSaving(true)
    try {
      await orderService.create({
        ...createForm,
        buyer_id: createForm.buyer_id || undefined,
        items: createItems.map(item => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
        })),
      })
      setCreateModal(false)
      fetchData()
    } catch (err: any) {
      alert(err.response?.data?.message || "Create failed")
    }
    setCreateSaving(false)
  }

  // --- Cancel Order ---
  const cancelOrder = async (order: any) => {
    if (!confirm(`Cancel order ${order.order_number}? This will restore inventory.`)) return
    try {
      await orderService.delete(order.id)
      setSelectedOrder(null)
      fetchData()
    } catch (err: any) {
      alert(err.response?.data?.message || "Cancel failed")
    }
  }

  const columns = [
    { key: "order_number", label: "Order #" },
    { key: "buyer_company", label: "Buyer" },
    { key: "dealer_company", label: "Dealer", render: (v: string) => v || "Direct" },
    { key: "total_amount", label: "Total", render: (v: number) => v ? `₹${Number(v).toLocaleString()}` : "-" },
    { key: "status", label: "Status", render: (v: string) => <StatusBadge status={v} /> },
    { key: "payment_status", label: "Payment", render: (v: string) => <StatusBadge status={v} /> },
    { key: "payment_method", label: "Method", render: (v: string) => <span className="uppercase text-xs">{v || "COD"}</span> },
    { key: "created_at", label: "Date", render: (v: string) => v ? new Date(v).toLocaleDateString() : "-" },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700">+ Create Order</button>
      </div>

      <DataTable columns={columns} data={orders} loading={loading} onEdit={viewOrder} />

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto mx-4 p-6">
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
                <p className="text-sm text-gray-500">Vendor</p>
                <p className="font-medium">{selectedOrder.vendor_company || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Order Status</p>
                <StatusBadge status={selectedOrder.status} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <StatusBadge status={selectedOrder.payment_status} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="font-bold text-lg">₹{Number(selectedOrder.total_amount).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium uppercase">{selectedOrder.payment_method || "COD"}</p>
              </div>
            </div>

            {selectedOrder.shipping_address && (
              <div className="mb-4">
                <p className="text-sm text-gray-500">Shipping Address</p>
                <p className="text-sm">{selectedOrder.shipping_address}</p>
              </div>
            )}

            {selectedOrder.notes && (
              <div className="mb-4">
                <p className="text-sm text-gray-500">Notes</p>
                <p className="text-sm">{selectedOrder.notes}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mb-6">
              {(ORDER_STATUSES[selectedOrder.status] || []).length > 0 && (
                <button onClick={() => openStatusUpdate(selectedOrder)}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Update Status
                </button>
              )}
              <button onClick={() => openEdit(selectedOrder)}
                className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                Edit Details
              </button>
              {!["delivered", "cancelled", "disputed"].includes(selectedOrder.status) && (
                <button onClick={() => cancelOrder(selectedOrder)}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Cancel Order
                </button>
              )}
            </div>

            {/* Order Items */}
            {selectedOrder.items?.length > 0 && (
              <div className="mb-6">
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
                        <td className="px-3 py-2">{item.sku || item.sku_code || item.sku_code_snapshot}</td>
                        <td className="px-3 py-2 text-right">{item.quantity}</td>
                        <td className="px-3 py-2 text-right">₹{Number(item.unit_price).toLocaleString()}</td>
                        <td className="px-3 py-2 text-right">₹{Number(item.total_price || item.line_total).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Status History */}
            {statusHistory.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Status History</h4>
                <div className="space-y-2">
                  {statusHistory.map((h: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-sm border-l-2 border-blue-300 pl-3 py-1">
                      <StatusBadge status={h.from_status} />
                      <span className="text-gray-400">&rarr;</span>
                      <StatusBadge status={h.to_status} />
                      <span className="text-gray-400 text-xs">{new Date(h.created_at).toLocaleString()}</span>
                      {h.notes && <span className="text-gray-500 text-xs">({h.notes})</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      <FormModal title="Update Order Status" open={statusModal} onClose={() => setStatusModal(false)} onSubmit={handleStatusSubmit} loading={statusSaving}>
        {statusTarget && (
          <>
            <div className="bg-gray-50 rounded-lg p-3 mb-2">
              <p className="text-sm"><span className="text-gray-500">Order:</span> <strong>{statusTarget.order_number}</strong></p>
              <p className="text-sm"><span className="text-gray-500">Current Status:</span> <StatusBadge status={statusTarget.status} /></p>
            </div>
            <FormField label="New Status *" name="status" value={statusForm.status} onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })} required
              options={(ORDER_STATUSES[statusTarget.status] || []).map(s => ({ value: s, label: s.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) }))} />
            <FormField label="Notes" name="notes" value={statusForm.notes} onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })} textarea placeholder="Optional reason for status change" />
          </>
        )}
      </FormModal>

      {/* Edit Order Modal */}
      <FormModal title="Edit Order Details" open={editModal} onClose={() => setEditModal(false)} onSubmit={handleEditSubmit} loading={editSaving}>
        <FormField label="Payment Status" name="payment_status" value={editForm.payment_status}
          onChange={(e) => setEditForm({ ...editForm, payment_status: e.target.value })} options={PAYMENT_STATUSES} />
        <FormField label="Shipping Address" name="shipping_address" value={editForm.shipping_address}
          onChange={(e) => setEditForm({ ...editForm, shipping_address: e.target.value })} textarea />
        <FormField label="Notes" name="notes" value={editForm.notes}
          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} textarea />
      </FormModal>

      {/* Create Order Modal */}
      <FormModal title="Create New Order" open={createModal} onClose={() => setCreateModal(false)} onSubmit={handleCreateSubmit} loading={createSaving} wide>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Buyer" name="buyer_id" value={createForm.buyer_id}
            onChange={(e) => setCreateForm({ ...createForm, buyer_id: e.target.value })}
            options={buyers.map((b: any) => ({ value: String(b.id), label: b.company_name || `${b.first_name} ${b.last_name}` }))} />
          <FormField label="Payment Method" name="payment_method" value={createForm.payment_method}
            onChange={(e) => setCreateForm({ ...createForm, payment_method: e.target.value })}
            options={[{ value: "cod", label: "Cash on Delivery" }, { value: "online", label: "Online Payment" }, { value: "credit", label: "Credit" }]} />
        </div>
        <FormField label="Shipping Address" name="shipping_address" value={createForm.shipping_address}
          onChange={(e) => setCreateForm({ ...createForm, shipping_address: e.target.value })} textarea />
        <FormField label="Notes" name="notes" value={createForm.notes}
          onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })} textarea />

        {/* Line Items */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm">Order Items</h4>
            <button type="button" onClick={addItem} className="text-xs text-primary-600 hover:underline">+ Add Item</button>
          </div>
          {createItems.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-end">
              <div className="col-span-5">
                <label className="block text-xs text-gray-500 mb-1">Product</label>
                <select value={item.product_id} onChange={(e) => updateItem(i, "product_id", e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" required>
                  <option value="">Select product...</option>
                  {products.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku}) - ₹{p.price}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Qty</label>
                <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" required />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Unit Price</label>
                <input type="number" min="0" step="0.01" value={item.unit_price} onChange={(e) => updateItem(i, "unit_price", Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" required />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Line Total</label>
                <p className="py-1.5 text-sm font-medium">₹{(item.quantity * item.unit_price).toLocaleString()}</p>
              </div>
              <div className="col-span-1">
                {createItems.length > 1 && (
                  <button type="button" onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700 text-sm pb-1">&times;</button>
                )}
              </div>
            </div>
          ))}
          <div className="text-right mt-2 font-medium text-sm">
            Order Total: ₹{createItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0).toLocaleString()}
          </div>
        </div>
      </FormModal>
    </div>
  )
}
