import { useState, useEffect } from "react"
import { dealerService } from "../../services/dealer.service"
import DataTable from "../../components/ui/DataTable"
import FormModal from "../../components/ui/FormModal"
import FormField from "../../components/ui/FormField"
import StatusBadge from "../../components/ui/StatusBadge"

const emptyForm = {
  dealer_code: "", company_name: "", gstin: "", pan: "",
  bank_account_number: "", bank_ifsc: "", bank_name: "", bank_branch: "",
  credit_limit: "", credit_payment_terms_days: "",
  business_address: "", contact_phone: "", contact_email: "",
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
      dealer_code: row.dealer_code || "", company_name: row.company_name || "",
      gstin: row.gstin || "", pan: row.pan || "",
      bank_account_number: row.bank_account_number || "", bank_ifsc: row.bank_ifsc || "",
      bank_name: row.bank_name || "", bank_branch: row.bank_branch || "",
      credit_limit: row.credit_limit || "", credit_payment_terms_days: row.credit_payment_terms_days || "",
      business_address: row.business_address || "",
      contact_phone: row.contact_phone || "", contact_email: row.contact_email || "",
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
    if (!confirm(`Suspend dealer "${row.company_name}"?`)) return
    await dealerService.delete(row.id); fetchData()
  }

  const columns = [
    { key: "dealer_code", label: "Code" },
    { key: "company_name", label: "Company" },
    { key: "gstin", label: "GSTIN" },
    { key: "credit_limit", label: "Credit Limit", render: (v: number) => v ? `₹${Number(v).toLocaleString()}` : "-" },
    { key: "available_credit", label: "Available Credit", render: (v: number) => v ? `₹${Number(v).toLocaleString()}` : "-" },
    { key: "approval_status", label: "Status", render: (v: string) => <StatusBadge status={v} /> },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dealers</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700">+ Add Dealer</button>
      </div>
      <DataTable columns={columns} data={dealers} loading={loading} onEdit={openEdit} onDelete={handleDelete} />
      <FormModal title={editId ? "Edit Dealer" : "Add Dealer"} open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} loading={saving}>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Dealer Code" name="dealer_code" value={form.dealer_code} onChange={handleChange} required />
          <FormField label="Company Name" name="company_name" value={form.company_name} onChange={handleChange} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="GSTIN" name="gstin" value={form.gstin} onChange={handleChange} required />
          <FormField label="PAN" name="pan" value={form.pan} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Credit Limit (₹)" name="credit_limit" value={form.credit_limit} onChange={handleChange} type="number" />
          <FormField label="Payment Terms (days)" name="credit_payment_terms_days" value={form.credit_payment_terms_days} onChange={handleChange} type="number" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Bank Account #" name="bank_account_number" value={form.bank_account_number} onChange={handleChange} />
          <FormField label="Bank IFSC" name="bank_ifsc" value={form.bank_ifsc} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Bank Name" name="bank_name" value={form.bank_name} onChange={handleChange} />
          <FormField label="Bank Branch" name="bank_branch" value={form.bank_branch} onChange={handleChange} />
        </div>
        <FormField label="Business Address" name="business_address" value={form.business_address} onChange={handleChange} textarea />
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Phone" name="contact_phone" value={form.contact_phone} onChange={handleChange} required />
          <FormField label="Email" name="contact_email" value={form.contact_email} onChange={handleChange} type="email" required />
        </div>
      </FormModal>
    </div>
  )
}
