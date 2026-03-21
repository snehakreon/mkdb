import { useState, useEffect } from "react"
import { adminUserService } from "../../services/adminUser.service"
import DataTable from "../../components/ui/DataTable"
import FormModal from "../../components/ui/FormModal"
import FormField from "../../components/ui/FormField"
import StatusBadge from "../../components/ui/StatusBadge"

const emptyForm = { firstName: "", lastName: "", email: "", phone: "", password: "" }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const fetchData = async () => {
    setLoading(true)
    try { setUsers((await adminUserService.getAll()).data) } catch { /* empty */ }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleChange = (e: React.ChangeEvent<any>) => setForm({ ...form, [e.target.name]: e.target.value })
  const openCreate = () => { setForm(emptyForm); setEditId(null); setModalOpen(true) }
  const openEdit = (row: any) => {
    setForm({
      firstName: row.first_name || "", lastName: row.last_name || "",
      email: row.email || "", phone: row.phone || "", password: "",
    })
    setEditId(row.id); setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editId) {
        const payload: Record<string, unknown> = { ...form }
        if (!form.password) delete payload.password
        await adminUserService.update(editId, payload)
      } else {
        await adminUserService.create(form)
      }
      setModalOpen(false); fetchData()
    } catch { /* empty */ }
    setSaving(false)
  }

  const handleDelete = async (row: any) => {
    if (!confirm(`Delete admin user "${row.first_name} ${row.last_name}"?`)) return
    await adminUserService.delete(row.id); fetchData()
  }

  const columns = [
    { key: "first_name", label: "First Name" },
    { key: "last_name", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone", render: (v: string) => v || "-" },
    { key: "is_active", label: "Status", render: (v: boolean) => <StatusBadge status={v ? "Active" : "Inactive"} /> },
    { key: "last_login_at", label: "Last Login", render: (v: string) => v ? new Date(v).toLocaleDateString() : "Never" },
    { key: "created_at", label: "Created", render: (v: string) => v ? new Date(v).toLocaleDateString() : "-" },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Users</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700">+ Add Admin User</button>
      </div>
      <DataTable columns={columns} data={users} loading={loading} onEdit={openEdit} onDelete={handleDelete} />
      <FormModal title={editId ? "Edit Admin User" : "Add Admin User"} open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} loading={saving}>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="First Name *" name="firstName" value={form.firstName} onChange={handleChange} required />
          <FormField label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} />
        </div>
        <FormField label="Email *" name="email" value={form.email} onChange={handleChange} required type="email" />
        <FormField label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
        <FormField label={editId ? "Password (leave blank to keep)" : "Password *"} name="password" value={form.password} onChange={handleChange} type="password" required={!editId} />
      </FormModal>
    </div>
  )
}
