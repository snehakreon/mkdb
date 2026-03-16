import { useState, useEffect } from "react"
import { brandService } from "../../services/brand.service"
import DataTable from "../../components/ui/DataTable"
import FormModal from "../../components/ui/FormModal"
import FormField from "../../components/ui/FormField"
import StatusBadge from "../../components/ui/StatusBadge"

const emptyForm = { brand_name: "", brand_code: "" }

export default function BrandsPage() {
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const fetchData = async () => {
    setLoading(true)
    try { setBrands((await brandService.getAll()).data) } catch { /* empty */ }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleChange = (e: React.ChangeEvent<any>) => setForm({ ...form, [e.target.name]: e.target.value })
  const openCreate = () => { setForm(emptyForm); setEditId(null); setModalOpen(true) }
  const openEdit = (row: any) => {
    setForm({ brand_name: row.brand_name || "", brand_code: row.brand_code || "" })
    setEditId(row.id); setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editId) await brandService.update(editId, form)
      else await brandService.create(form)
      setModalOpen(false); fetchData()
    } catch { /* empty */ }
    setSaving(false)
  }

  const handleDelete = async (row: any) => {
    if (!confirm(`Delete brand "${row.brand_name}"?`)) return
    await brandService.delete(row.id); fetchData()
  }

  const columns = [
    { key: "brand_code", label: "Code" },
    { key: "brand_name", label: "Brand Name" },
    { key: "is_active", label: "Status", render: (v: boolean) => <StatusBadge status={v ? "Active" : "Inactive"} /> },
    { key: "created_at", label: "Created", render: (v: string) => v ? new Date(v).toLocaleDateString() : "-" },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700">+ Add Brand</button>
      </div>
      <DataTable columns={columns} data={brands} loading={loading} onEdit={openEdit} onDelete={handleDelete} />
      <FormModal title={editId ? "Edit Brand" : "Add Brand"} open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Brand Code" name="brand_code" value={form.brand_code} onChange={handleChange} required placeholder="BRD-XXX" />
        <FormField label="Brand Name" name="brand_name" value={form.brand_name} onChange={handleChange} required />
      </FormModal>
    </div>
  )
}
