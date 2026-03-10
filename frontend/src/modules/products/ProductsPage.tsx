import { useState, useEffect } from "react"
import { productService } from "../../services/product.service"
import { brandService } from "../../services/brand.service"
import { categoryService } from "../../services/category.service"
import DataTable from "../../components/ui/DataTable"
import FormModal from "../../components/ui/FormModal"
import FormField from "../../components/ui/FormField"
import StatusBadge from "../../components/ui/StatusBadge"

const emptyForm = {
  sku_code: "", product_name: "", category_id: "", brand_id: "",
  description: "", hsn_code: "", weight_kg: "", length_ft: "",
  width_ft: "", height_ft: "", tech_sheet_url: "",
}

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [pRes, cRes, bRes] = await Promise.all([
        productService.getAll(), categoryService.getAll(), brandService.getAll()
      ])
      setProducts(pRes.data)
      setCategories(cRes.data)
      setBrands(bRes.data)
    } catch { /* empty */ }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleChange = (e: React.ChangeEvent<any>) => setForm({ ...form, [e.target.name]: e.target.value })

  const openCreate = () => { setForm(emptyForm); setEditId(null); setModalOpen(true) }
  const openEdit = (row: any) => {
    setForm({
      sku_code: row.sku_code || "", product_name: row.product_name || "",
      category_id: row.category_id || "", brand_id: row.brand_id || "",
      description: row.description || "", hsn_code: row.hsn_code || "",
      weight_kg: row.weight_kg || "", length_ft: row.length_ft || "",
      width_ft: row.width_ft || "", height_ft: row.height_ft || "",
      tech_sheet_url: row.tech_sheet_url || "",
    })
    setEditId(row.id)
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editId) await productService.update(editId, form)
      else await productService.create(form)
      setModalOpen(false)
      fetchData()
    } catch { /* empty */ }
    setSaving(false)
  }

  const handleDelete = async (row: any) => {
    if (!confirm(`Delete product "${row.product_name}"?`)) return
    await productService.delete(row.id)
    fetchData()
  }

  const columns = [
    { key: "sku_code", label: "SKU" },
    { key: "product_name", label: "Product Name" },
    { key: "category_name", label: "Category" },
    { key: "brand_name", label: "Brand" },
    { key: "hsn_code", label: "HSN" },
    { key: "weight_kg", label: "Weight (kg)" },
    { key: "is_active", label: "Status", render: (v: boolean) => <StatusBadge status={v ? "Active" : "Inactive"} /> },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button onClick={openCreate}
          className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700">
          + Add Product
        </button>
      </div>

      <DataTable columns={columns} data={products} loading={loading} onEdit={openEdit} onDelete={handleDelete} />

      <FormModal title={editId ? "Edit Product" : "Add Product"} open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} loading={saving}>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="SKU Code" name="sku_code" value={form.sku_code} onChange={handleChange} required />
          <FormField label="Product Name" name="product_name" value={form.product_name} onChange={handleChange} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Category" name="category_id" value={form.category_id} onChange={handleChange} required
            options={categories.map((c: any) => ({ value: c.id, label: c.category_name }))} />
          <FormField label="Brand" name="brand_id" value={form.brand_id} onChange={handleChange}
            options={brands.map((b: any) => ({ value: b.id, label: b.brand_name }))} />
        </div>
        <FormField label="HSN Code" name="hsn_code" value={form.hsn_code} onChange={handleChange} />
        <FormField label="Description" name="description" value={form.description} onChange={handleChange} textarea />
        <div className="grid grid-cols-4 gap-3">
          <FormField label="Weight (kg)" name="weight_kg" value={form.weight_kg} onChange={handleChange} type="number" />
          <FormField label="Length (ft)" name="length_ft" value={form.length_ft} onChange={handleChange} type="number" />
          <FormField label="Width (ft)" name="width_ft" value={form.width_ft} onChange={handleChange} type="number" />
          <FormField label="Height (ft)" name="height_ft" value={form.height_ft} onChange={handleChange} type="number" />
        </div>
        <FormField label="Tech Sheet URL" name="tech_sheet_url" value={form.tech_sheet_url} onChange={handleChange} placeholder="https://..." />
      </FormModal>
    </div>
  )
}
