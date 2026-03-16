import { useState, useEffect } from "react"
import { zoneService } from "../../services/zone.service"
import DataTable from "../../components/ui/DataTable"
import FormModal from "../../components/ui/FormModal"
import FormField from "../../components/ui/FormField"
import StatusBadge from "../../components/ui/StatusBadge"

const emptyForm = { zone_name: "", zone_code: "", description: "" }

export default function ZonesPage() {
  const [zones, setZones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const fetchData = async () => {
    setLoading(true)
    try { setZones((await zoneService.getAll()).data) } catch { /* empty */ }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleChange = (e: React.ChangeEvent<any>) => setForm({ ...form, [e.target.name]: e.target.value })
  const openCreate = () => { setForm(emptyForm); setEditId(null); setModalOpen(true) }
  const openEdit = (row: any) => {
    setForm({ zone_name: row.zone_name || "", zone_code: row.zone_code || "", description: row.description || "" })
    setEditId(row.id); setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editId) await zoneService.update(editId, form)
      else await zoneService.create(form)
      setModalOpen(false); fetchData()
    } catch { /* empty */ }
    setSaving(false)
  }

  const handleDelete = async (row: any) => {
    if (!confirm(`Delete zone "${row.zone_name}"?`)) return
    await zoneService.delete(row.id); fetchData()
  }

  const columns = [
    { key: "zone_code", label: "Code" },
    { key: "zone_name", label: "Zone Name" },
    { key: "description", label: "Description" },
    { key: "is_active", label: "Status", render: (v: boolean) => <StatusBadge status={v ? "Active" : "Inactive"} /> },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Zones</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700">+ Add Zone</button>
      </div>
      <DataTable columns={columns} data={zones} loading={loading} onEdit={openEdit} onDelete={handleDelete} />
      <FormModal title={editId ? "Edit Zone" : "Add Zone"} open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} loading={saving}>
        <FormField label="Zone Code" name="zone_code" value={form.zone_code} onChange={handleChange} required placeholder="ZONE-XXX" />
        <FormField label="Zone Name" name="zone_name" value={form.zone_name} onChange={handleChange} required />
        <FormField label="Description" name="description" value={form.description} onChange={handleChange} textarea />
      </FormModal>
    </div>
  )
}
