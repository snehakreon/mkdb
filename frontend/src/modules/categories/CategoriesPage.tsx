import { useState, useEffect } from "react"
import { categoryService } from "../../services/category.service"
import DataTable from "../../components/ui/DataTable"
import FormModal from "../../components/ui/FormModal"
import FormField from "../../components/ui/FormField"
import StatusBadge from "../../components/ui/StatusBadge"

const emptyForm = { category_name: "", category_code: "" }

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const fetchData = async () => {
    setLoading(true)
    try { setCategories((await categoryService.getAll()).data) } catch { /* empty */ }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleChange = (e: React.ChangeEvent<any>) => setForm({ ...form, [e.target.name]: e.target.value })
  const openCreate = () => { setForm(emptyForm); setEditId(null); setModalOpen(true) }
  const openEdit = (row: any) => {
    setForm({ category_name: row.category_name || "", category_code: row.category_code || "" })
    setEditId(row.id); setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editId) await categoryService.update(editId, form)
      else await categoryService.create(form)
      setModalOpen(false); fetchData()
    } catch { /* empty */ }
    setSaving(false)
  }

  const handleDelete = async (row: any) => {
    if (!confirm(`Delete category "${row.category_name}"?`)) return
    await categoryService.delete(row.id); fetchData()
  }

  const columns = [
    { key: "category_code", label: "Code" },
    { key: "category_name", label: "Category Name" },
    { key: "is_active", label: "Status", render: (v: boolean) => <StatusBadge status={v ? "Active" : "Inactive"} /> },
    { key: "created_at", label: "Created", render: (v: string) => v ? new Date(v).toLocaleDateString() : "-" },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700">+ Add Category</button>
      </div>
      <DataTable columns={columns} data={categories} loading={loading} onEdit={openEdit} onDelete={handleDelete} />
      <FormModal title={editId ? "Edit Category" : "Add Category"} open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Category Code" name="category_code" value={form.category_code} onChange={handleChange} required placeholder="CAT-XXX" />
        <FormField label="Category Name" name="category_name" value={form.category_name} onChange={handleChange} required />
      </FormModal>
    </div>
  )
}
