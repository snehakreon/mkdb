import { useState, useEffect } from "react"
import { productService } from "../../services/product.service"
import { brandService } from "../../services/brand.service"
import { categoryService } from "../../services/category.service"
import DataTable from "../../components/ui/DataTable"
import FormModal from "../../components/ui/FormModal"
import FormField from "../../components/ui/FormField"
import StatusBadge from "../../components/ui/StatusBadge"

const emptyForm = {
  name: "", sku: "", hsn_code: "", isin: "",
  category_id: "", brand_id: "", brand_collection: "",
  description: "", unit: "piece", price: "", mrp: "",
  stock_qty: "0", min_order_qty: "1",
  // Dimensions (mm)
  length_mm: "", breadth_mm: "", width_mm: "", thickness_mm: "", weight_kg: "",
  // Packaging
  box_length_mm: "", box_breadth_mm: "", box_width_mm: "", box_weight_kg: "",
  // Attributes
  colour: "", grade: "", material: "", calibration: "",
  certification: "", termite_resistance: "", warranty: "",
  country_of_origin: "India", customer_care_details: "",
  tech_sheet_url: "",
  // Additional
  manufactured_by: "", packaged_by: "", lead_time_days: "",
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
  const [activeTab, setActiveTab] = useState("basic")

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

  const openCreate = () => { setForm(emptyForm); setEditId(null); setActiveTab("basic"); setModalOpen(true) }
  const openEdit = (row: any) => {
    setForm({
      name: row.name || "", sku: row.sku || "", hsn_code: row.hsn_code || "",
      isin: row.isin || "", category_id: row.category_id || "",
      brand_id: row.brand_id || "", brand_collection: row.brand_collection || "",
      description: row.description || "", unit: row.unit || "piece",
      price: row.price || "", mrp: row.mrp || "",
      stock_qty: row.stock_qty ?? "0", min_order_qty: row.min_order_qty ?? "1",
      length_mm: row.length_mm || "", breadth_mm: row.breadth_mm || "",
      width_mm: row.width_mm || "", thickness_mm: row.thickness_mm || "",
      weight_kg: row.weight_kg || "",
      box_length_mm: row.box_length_mm || "", box_breadth_mm: row.box_breadth_mm || "",
      box_width_mm: row.box_width_mm || "", box_weight_kg: row.box_weight_kg || "",
      colour: row.colour || "", grade: row.grade || "",
      material: row.material || "", calibration: row.calibration || "",
      certification: row.certification || "",
      termite_resistance: row.termite_resistance || "",
      warranty: row.warranty || "", country_of_origin: row.country_of_origin || "India",
      customer_care_details: row.customer_care_details || "",
      tech_sheet_url: row.tech_sheet_url || "",
      manufactured_by: row.manufactured_by || "",
      packaged_by: row.packaged_by || "",
      lead_time_days: row.lead_time_days || "",
    })
    setEditId(row.id)
    setActiveTab("basic")
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
    if (!confirm(`Delete product "${row.name}"?`)) return
    await productService.delete(row.id)
    fetchData()
  }

  const columns = [
    { key: "sku", label: "SKU" },
    { key: "name", label: "Product Name" },
    { key: "category_name", label: "Category" },
    { key: "brand_name", label: "Brand" },
    { key: "hsn_code", label: "HSN" },
    { key: "price", label: "Price", render: (v: number) => v ? `₹${v}` : "-" },
    { key: "stock_qty", label: "Stock" },
    { key: "is_active", label: "Status", render: (v: boolean) => <StatusBadge status={v ? "Active" : "Inactive"} /> },
  ]

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "dimensions", label: "Dimensions" },
    { id: "packaging", label: "Packaging" },
    { id: "attributes", label: "Attributes" },
    { id: "additional", label: "Additional Details" },
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

      <FormModal title={editId ? "Edit Product" : "Add Product"} open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} loading={saving} wide>
        {/* Tabs */}
        <div className="flex border-b border-gray-200 -mt-2 mb-4 gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Basic Info Tab */}
        {activeTab === "basic" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Product Name *" name="name" value={form.name} onChange={handleChange} required />
              <FormField label="SKU Code" name="sku" value={form.sku} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Category" name="category_id" value={form.category_id} onChange={handleChange}
                options={categories.map((c: any) => ({ value: c.id, label: c.name || c.category_name }))} />
              <FormField label="Brand" name="brand_id" value={form.brand_id} onChange={handleChange}
                options={brands.map((b: any) => ({ value: b.id, label: b.name || b.brand_name }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="ISIN" name="isin" value={form.isin} onChange={handleChange} />
              <FormField label="Brand Collection" name="brand_collection" value={form.brand_collection} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <FormField label="HSN Code" name="hsn_code" value={form.hsn_code} onChange={handleChange} />
              <FormField label="Unit" name="unit" value={form.unit} onChange={handleChange}
                options={[
                  { value: "piece", label: "Piece" }, { value: "sq.mm", label: "sq.mm" },
                  { value: "mm", label: "mm" }, { value: "kg", label: "kg" },
                  { value: "box", label: "Box" }, { value: "bundle", label: "Bundle" },
                  { value: "set", label: "Set" }, { value: "litre", label: "Litre" },
                ]} />
              <FormField label="Colour" name="colour" value={form.colour} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-4 gap-3">
              <FormField label="Price (₹)" name="price" value={form.price} onChange={handleChange} type="number" />
              <FormField label="MRP (₹)" name="mrp" value={form.mrp} onChange={handleChange} type="number" />
              <FormField label="Stock Qty" name="stock_qty" value={form.stock_qty} onChange={handleChange} type="number" />
              <FormField label="Min Order Qty" name="min_order_qty" value={form.min_order_qty} onChange={handleChange} type="number" />
            </div>
            <FormField label="Description" name="description" value={form.description} onChange={handleChange} textarea />
          </>
        )}

        {/* Dimensions Tab */}
        {activeTab === "dimensions" && (
          <>
            <p className="text-xs text-gray-500 mb-3">All dimensions in millimeters (mm), weight in kilograms (kg)</p>
            <div className="grid grid-cols-3 gap-3">
              <FormField label="Length (mm)" name="length_mm" value={form.length_mm} onChange={handleChange} type="number" />
              <FormField label="Breadth (mm)" name="breadth_mm" value={form.breadth_mm} onChange={handleChange} type="number" />
              <FormField label="Width (mm)" name="width_mm" value={form.width_mm} onChange={handleChange} type="number" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Thickness (mm)" name="thickness_mm" value={form.thickness_mm} onChange={handleChange} type="number" />
              <FormField label="Weight (kg)" name="weight_kg" value={form.weight_kg} onChange={handleChange} type="number" />
            </div>
          </>
        )}

        {/* Packaging Tab */}
        {activeTab === "packaging" && (
          <>
            <p className="text-xs text-gray-500 mb-3">Box/packaging dimensions in millimeters (mm), weight in kilograms (kg)</p>
            <div className="grid grid-cols-3 gap-3">
              <FormField label="Box Length (mm)" name="box_length_mm" value={form.box_length_mm} onChange={handleChange} type="number" />
              <FormField label="Box Breadth (mm)" name="box_breadth_mm" value={form.box_breadth_mm} onChange={handleChange} type="number" />
              <FormField label="Box Width (mm)" name="box_width_mm" value={form.box_width_mm} onChange={handleChange} type="number" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Box Weight (kg)" name="box_weight_kg" value={form.box_weight_kg} onChange={handleChange} type="number" />
            </div>
          </>
        )}

        {/* Attributes Tab */}
        {activeTab === "attributes" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Grade" name="grade" value={form.grade} onChange={handleChange} />
              <FormField label="Material" name="material" value={form.material} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Calibration" name="calibration" value={form.calibration} onChange={handleChange} />
              <FormField label="Certification" name="certification" value={form.certification} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Termite Resistance" name="termite_resistance" value={form.termite_resistance} onChange={handleChange} />
              <FormField label="Warranty" name="warranty" value={form.warranty} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Country of Origin" name="country_of_origin" value={form.country_of_origin} onChange={handleChange} />
              <FormField label="Tech Data Sheet URL" name="tech_sheet_url" value={form.tech_sheet_url} onChange={handleChange} placeholder="https://..." />
            </div>
            <FormField label="Customer Care Details" name="customer_care_details" value={form.customer_care_details} onChange={handleChange} textarea />
          </>
        )}

        {/* Additional Details Tab */}
        {activeTab === "additional" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Manufactured By" name="manufactured_by" value={form.manufactured_by} onChange={handleChange} />
              <FormField label="Packaged By" name="packaged_by" value={form.packaged_by} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Warranty" name="warranty" value={form.warranty} onChange={handleChange} />
              <FormField label="Lead Time (days)" name="lead_time_days" value={form.lead_time_days} onChange={handleChange} type="number" placeholder="Days if not in stock" />
            </div>
          </>
        )}
      </FormModal>
    </div>
  )
}
