import { useState, useEffect } from "react"
import { dealerService } from "../../services/dealer.service"
import DataTable from "../../components/ui/DataTable"
import FormModal from "../../components/ui/FormModal"
import FormField from "../../components/ui/FormField"
import StatusBadge from "../../components/ui/StatusBadge"
import { STATE_OPTIONS } from "../../constants/indianStates"

const emptyForm = {
  company_name: "", contact_name: "", email: "", phone: "", gstin: "",
  address: "", city: "", state: "", pincode: "",
}

export default function DealersPage() {
  const [dealers, setDealers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const fetchData = async () => {
    setLoading(true)
    try { setDealers((await dealerService.getAll()).data) } catch { /* empty */ }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleChange = (e: React.ChangeEvent<any>) => setForm({ ...form, [e.target.name]: e.target.value })
  const openCreate = () => { setForm(emptyForm); setEditId(null); setModalOpen(true) }
  const openEdit = (row: any) => {
    setForm({
      company_name: row.company_name || "", contact_name: row.contact_name || "",
      email: row.email || "", phone: row.phone || "", gstin: row.gstin || "",
      address: row.address || "", city: row.city || "", state: row.state || "", pincode: row.pincode || "",
    })
    setEditId(row.id); setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editId) await dealerService.update(editId, form)
      else await dealerService.create(form)
      setModalOpen(false); fetchData()
    } catch { /* empty */ }
    setSaving(false)
  }

  const handleDelete = async (row: any) => {
    if (!confirm(`Deactivate dealer "${row.company_name}"?`)) return
    await dealerService.delete(row.id); fetchData()
  }

  const columns = [
    { key: "company_name", label: "Company" },
    { key: "contact_name", label: "Contact" },
    { key: "gstin", label: "GSTIN" },
    { key: "phone", label: "Phone" },
    { key: "state", label: "State" },
    { key: "is_active", label: "Status", render: (v: boolean) => <StatusBadge status={v ? "Active" : "Inactive"} /> },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dealers</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700">+ Add Dealer</button>
      </div>
      <DataTable columns={columns} data={dealers} loading={loading} onEdit={openEdit} onDelete={handleDelete} />
      <FormModal title={editId ? "Edit Dealer" : "Add Dealer"} open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Company Name" name="company_name" value={form.company_name} onChange={handleChange} required />
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Contact Name" name="contact_name" value={form.contact_name} onChange={handleChange} required />
          <FormField label="GSTIN" name="gstin" value={form.gstin} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Phone" name="phone" value={form.phone} onChange={handleChange} required />
          <FormField label="Email" name="email" value={form.email} onChange={handleChange} type="email" required />
        </div>
        <FormField label="Address" name="address" value={form.address} onChange={handleChange} textarea />
        <div className="grid grid-cols-3 gap-3">
          <FormField label="City" name="city" value={form.city} onChange={handleChange} />
          <FormField label="State" name="state" value={form.state} onChange={handleChange} options={STATE_OPTIONS} />
          <FormField label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} />
        </div>
      </FormModal>
    </div>
  )
}
