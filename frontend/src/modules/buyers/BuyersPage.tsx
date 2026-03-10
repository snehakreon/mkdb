import { useState, useEffect } from "react"
import { buyerService } from "../../services/buyer.service"
import DataTable from "../../components/ui/DataTable"
import FormModal from "../../components/ui/FormModal"
import FormField from "../../components/ui/FormField"
import StatusBadge from "../../components/ui/StatusBadge"

const emptyForm = {
  company_name: "", gstin: "", pan: "", company_type: "",
  company_address: "", billing_address: "",
  first_name: "", last_name: "", email: "", phone: "",
}

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const fetchData = async () => {
    setLoading(true)
    try { setBuyers((await buyerService.getAll()).data) } catch { /* empty */ }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleChange = (e: React.ChangeEvent<any>) => setForm({ ...form, [e.target.name]: e.target.value })
  const openCreate = () => { setForm(emptyForm); setEditId(null); setModalOpen(true) }
  const openEdit = (row: any) => {
    setForm({
      company_name: row.company_name || "", gstin: row.gstin || "", pan: row.pan || "",
      company_type: row.company_type || "", company_address: row.company_address || "",
      billing_address: row.billing_address || "",
      first_name: row.first_name || "", last_name: row.last_name || "",
      email: row.email || "", phone: row.phone || "",
    })
    setEditId(row.id); setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editId) await buyerService.update(editId, form)
      else await buyerService.create(form)
      setModalOpen(false); fetchData()
    } catch { /* empty */ }
    setSaving(false)
  }

  const handleDelete = async (row: any) => {
    if (!confirm(`Deactivate buyer "${row.company_name}"?`)) return
    await buyerService.delete(row.id); fetchData()
  }

  const columns = [
    { key: "company_name", label: "Company" },
    { key: "company_type", label: "Type" },
    { key: "gstin", label: "GSTIN" },
    { key: "first_name", label: "Contact", render: (_v: string, row: any) => `${row.first_name || ""} ${row.last_name || ""}`.trim() || "-" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "is_active", label: "Status", render: (v: boolean) => <StatusBadge status={v ? "Active" : "Inactive"} /> },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Buyers</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700">+ Add Buyer</button>
      </div>
      <DataTable columns={columns} data={buyers} loading={loading} onEdit={openEdit} onDelete={handleDelete} />
      <FormModal title={editId ? "Edit Buyer" : "Add Buyer"} open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Company Name" name="company_name" value={form.company_name} onChange={handleChange} required />
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Company Type" name="company_type" value={form.company_type} onChange={handleChange}
            options={[{ value: "individual", label: "Individual" }, { value: "partnership", label: "Partnership" }, { value: "pvt_ltd", label: "Pvt Ltd" }, { value: "llp", label: "LLP" }]} />
          <FormField label="GSTIN" name="gstin" value={form.gstin} onChange={handleChange} />
        </div>
        <FormField label="PAN" name="pan" value={form.pan} onChange={handleChange} />
        <div className="grid grid-cols-2 gap-3">
          <FormField label="First Name" name="first_name" value={form.first_name} onChange={handleChange} required />
          <FormField label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Email" name="email" value={form.email} onChange={handleChange} type="email" required />
          <FormField label="Phone" name="phone" value={form.phone} onChange={handleChange} required />
        </div>
        <FormField label="Company Address" name="company_address" value={form.company_address} onChange={handleChange} textarea />
        <FormField label="Billing Address" name="billing_address" value={form.billing_address} onChange={handleChange} textarea />
      </FormModal>
    </div>
  )
}
