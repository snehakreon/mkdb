import { useState, useEffect } from "react"
import { couponService } from "../../services/coupon.service"
import DataTable from "../../components/ui/DataTable"
import FormModal from "../../components/ui/FormModal"
import FormField from "../../components/ui/FormField"
import StatusBadge from "../../components/ui/StatusBadge"

const emptyForm = {
  code: "", description: "", discount_type: "percentage",
  discount_value: "", min_order_amount: "", max_discount: "",
  usage_limit: "", valid_from: "", valid_until: "",
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const fetchData = async () => {
    setLoading(true)
    try { setCoupons((await couponService.getAll()).data) } catch { /* empty */ }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleChange = (e: React.ChangeEvent<any>) => setForm({ ...form, [e.target.name]: e.target.value })
  const openCreate = () => { setForm(emptyForm); setEditId(null); setModalOpen(true) }
  const openEdit = (row: any) => {
    setForm({
      code: row.code || "", description: row.description || "",
      discount_type: row.discount_type || "percentage",
      discount_value: row.discount_value ?? "", min_order_amount: row.min_order_amount ?? "",
      max_discount: row.max_discount ?? "", usage_limit: row.usage_limit ?? "",
      valid_from: row.valid_from ? row.valid_from.slice(0, 10) : "",
      valid_until: row.valid_until ? row.valid_until.slice(0, 10) : "",
    })
    setEditId(row.id); setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...form, is_active: true }
      if (editId) await couponService.update(editId, payload)
      else await couponService.create(payload)
      setModalOpen(false); fetchData()
    } catch { /* empty */ }
    setSaving(false)
  }

  const handleDelete = async (row: any) => {
    if (!confirm(`Delete coupon "${row.code}"?`)) return
    await couponService.delete(row.id); fetchData()
  }

  const columns = [
    { key: "code", label: "Code" },
    { key: "description", label: "Description" },
    { key: "discount_type", label: "Type", render: (v: string) => v === "percentage" ? "Percentage" : "Flat" },
    { key: "discount_value", label: "Value", render: (v: number, row: any) => row.discount_type === "percentage" ? `${v}%` : `₹${v}` },
    { key: "min_order_amount", label: "Min Order", render: (v: number) => v ? `₹${v}` : "-" },
    { key: "usage_limit", label: "Limit", render: (v: number, row: any) => v ? `${row.used_count || 0}/${v}` : "Unlimited" },
    { key: "valid_until", label: "Expires", render: (v: string) => v ? new Date(v).toLocaleDateString() : "-" },
    { key: "is_active", label: "Status", render: (v: boolean) => <StatusBadge status={v ? "Active" : "Inactive"} /> },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700">+ Add Coupon</button>
      </div>
      <DataTable columns={columns} data={coupons} loading={loading} onEdit={openEdit} onDelete={handleDelete} />
      <FormModal title={editId ? "Edit Coupon" : "Add Coupon"} open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} loading={saving}>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Coupon Code *" name="code" value={form.code} onChange={handleChange} required placeholder="e.g. SAVE20" />
          <FormField label="Discount Type" name="discount_type" value={form.discount_type} onChange={handleChange}
            options={[{ value: "percentage", label: "Percentage" }, { value: "flat", label: "Flat Amount" }]} />
        </div>
        <FormField label="Description" name="description" value={form.description} onChange={handleChange} placeholder="Short description of the offer" />
        <div className="grid grid-cols-3 gap-3">
          <FormField label="Discount Value *" name="discount_value" value={form.discount_value} onChange={handleChange} type="number" required placeholder={form.discount_type === "percentage" ? "e.g. 20" : "e.g. 500"} />
          <FormField label="Min Order Amount" name="min_order_amount" value={form.min_order_amount} onChange={handleChange} type="number" placeholder="0" />
          <FormField label="Max Discount" name="max_discount" value={form.max_discount} onChange={handleChange} type="number" placeholder="No limit" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <FormField label="Usage Limit" name="usage_limit" value={form.usage_limit} onChange={handleChange} type="number" placeholder="Unlimited" />
          <FormField label="Valid From" name="valid_from" value={form.valid_from} onChange={handleChange} type="date" />
          <FormField label="Valid Until" name="valid_until" value={form.valid_until} onChange={handleChange} type="date" />
        </div>
      </FormModal>
    </div>
  )
}
