import { useState, useEffect } from "react"
import { vendorService } from "../../services/vendor.service"
import DataTable from "../../components/ui/DataTable"
import FormModal from "../../components/ui/FormModal"
import FormField from "../../components/ui/FormField"
import StatusBadge from "../../components/ui/StatusBadge"

const emptyForm = {
  vendor_code: "", company_name: "", gstin: "", pan: "",
  contact_person_name: "", contact_phone: "", contact_email: "",
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const fetchData = async () => {
    setLoading(true)
    try { setVendors((await vendorService.getAll()).data) } catch { /* empty */ }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleChange = (e: React.ChangeEvent<any>) => setForm({ ...form, [e.target.name]: e.target.value })
  const openCreate = () => { setForm(emptyForm); setEditId(null); setModalOpen(true) }
  const openEdit = (row: any) => {
    setForm({
      vendor_code: row.vendor_code || "", company_name: row.company_name || "",
      gstin: row.gstin || "", pan: row.pan || "",
      contact_person_name: row.contact_person_name || "",
      contact_phone: row.contact_phone || "", contact_email: row.contact_email || "",
    })
    setEditId(row.id); setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editId) await vendorService.update(editId, form)
      else await vendorService.create(form)
      setModalOpen(false); fetchData()
    } catch { /* empty */ }
    setSaving(false)
  }

  const handleDelete = async (row: any) => {
    if (!confirm(`Delete vendor "${row.company_name}"?`)) return
    await vendorService.delete(row.id); fetchData()
  }

  const columns = [
    { key: "vendor_code", label: "Code" },
    { key: "company_name", label: "Company" },
    { key: "gstin", label: "GSTIN" },
    { key: "contact_person_name", label: "Contact Person" },
    { key: "contact_phone", label: "Phone" },
    { key: "verification_status", label: "Status", render: (v: string) => <StatusBadge status={v} /> },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700">+ Add Vendor</button>
      </div>
      <DataTable columns={columns} data={vendors} loading={loading} onEdit={openEdit} onDelete={handleDelete} />
      <FormModal title={editId ? "Edit Vendor" : "Add Vendor"} open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} loading={saving}>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Vendor Code" name="vendor_code" value={form.vendor_code} onChange={handleChange} required />
          <FormField label="Company Name" name="company_name" value={form.company_name} onChange={handleChange} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="GSTIN" name="gstin" value={form.gstin} onChange={handleChange} required />
          <FormField label="PAN" name="pan" value={form.pan} onChange={handleChange} />
        </div>
        <FormField label="Contact Person" name="contact_person_name" value={form.contact_person_name} onChange={handleChange} required />
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Phone" name="contact_phone" value={form.contact_phone} onChange={handleChange} required />
          <FormField label="Email" name="contact_email" value={form.contact_email} onChange={handleChange} type="email" required />
        </div>
      </FormModal>
    </div>
  )
}
