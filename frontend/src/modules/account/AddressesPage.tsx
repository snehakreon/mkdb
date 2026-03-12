import { useState, useEffect } from "react"
import { INDIAN_STATES } from "../../constants/indianStates"
import { addressService } from "../../services/address.service"

const emptyForm = {
  label: "Home", full_name: "", phone: "", address_line1: "", address_line2: "",
  city: "", state: "", pincode: "", is_default: false,
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)

  const fetchAddresses = async () => {
    setLoading(true)
    try { setAddresses((await addressService.getAll()).data) } catch { /* empty */ }
    setLoading(false)
  }

  useEffect(() => { fetchAddresses() }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setForm({ ...form, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value })
  }

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowForm(true) }
  const openEdit = (addr: any) => {
    setForm({
      label: addr.label || "Home", full_name: addr.full_name || "", phone: addr.phone || "",
      address_line1: addr.address_line1 || "", address_line2: addr.address_line2 || "",
      city: addr.city || "", state: addr.state || "", pincode: addr.pincode || "",
      is_default: addr.is_default || false,
    })
    setEditId(addr.id)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editId) await addressService.update(editId, form)
      else await addressService.create(form)
      setShowForm(false)
      setEditId(null)
      fetchAddresses()
    } catch { /* empty */ }
    setSaving(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this address?")) return
    await addressService.delete(id)
    fetchAddresses()
  }

  const getStateName = (code: string) => {
    const s = INDIAN_STATES.find((st) => st.code === code)
    return s ? `${s.name} (${s.code})` : code
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-mk-gray-900">My Addresses</h1>
        <button onClick={openCreate}
          className="bg-mk-red text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-mk-red-600 transition-colors">
          <i className="fas fa-plus mr-2"></i>Add New Address
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-mk-gray-800 mb-4">{editId ? "Edit Address" : "Add New Address"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-mk-gray-600 mb-1">Full Name *</label>
              <input type="text" name="full_name" value={form.full_name} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm" placeholder="Rajesh Kumar" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-mk-gray-600 mb-1">Phone Number *</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm" placeholder="9876543210" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-mk-gray-600 mb-1">Address Line 1 *</label>
              <input type="text" name="address_line1" value={form.address_line1} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm" placeholder="House/Flat No., Building Name" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-mk-gray-600 mb-1">Address Line 2</label>
              <input type="text" name="address_line2" value={form.address_line2} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm" placeholder="Street, Locality" />
            </div>
            <div>
              <label className="block text-xs font-medium text-mk-gray-600 mb-1">City *</label>
              <input type="text" name="city" value={form.city} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm" placeholder="Mumbai" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-mk-gray-600 mb-1">State *</label>
              <select name="state" value={form.state} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm" required>
                <option value="">Select State...</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-mk-gray-600 mb-1">Pincode *</label>
              <input type="text" name="pincode" value={form.pincode} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm" placeholder="400001" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-mk-gray-600 mb-1">Address Label</label>
              <select name="label" value={form.label} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm">
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Site">Site</option>
                <option value="Warehouse">Warehouse</option>
              </select>
            </div>
            <div className="md:col-span-2 flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-mk-gray-700">
                <input type="checkbox" name="is_default" checked={form.is_default}
                  onChange={handleChange} className="rounded border-gray-300 text-mk-red focus:ring-mk-red" />
                Set as default address
              </label>
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <button type="submit" disabled={saving}
                className="bg-mk-red text-white text-sm font-semibold px-6 py-2 rounded-lg hover:bg-mk-red-600 transition-colors disabled:opacity-50">
                {saving ? "Saving..." : editId ? "Update Address" : "Save Address"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null) }}
                className="text-sm text-mk-gray-600 hover:text-mk-gray-800">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address Cards */}
      {!loading && addresses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className={`bg-white border rounded-xl p-5 relative ${addr.is_default ? "border-mk-red" : "border-gray-200"}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold bg-gray-100 text-mk-gray-700 px-2 py-0.5 rounded">{addr.label}</span>
                {addr.is_default && <span className="text-xs font-semibold bg-mk-red text-white px-2 py-0.5 rounded">Default</span>}
              </div>
              <p className="text-sm font-semibold text-mk-gray-900">{addr.full_name}</p>
              <p className="text-sm text-mk-gray-600 mt-1">{addr.address_line1}</p>
              {addr.address_line2 && <p className="text-sm text-mk-gray-600">{addr.address_line2}</p>}
              <p className="text-sm text-mk-gray-600">{addr.city}, {getStateName(addr.state)} - {addr.pincode}</p>
              <p className="text-sm text-mk-gray-500 mt-1"><i className="fas fa-phone-alt text-xs mr-1"></i>{addr.phone}</p>
              <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
                <button onClick={() => openEdit(addr)} className="text-xs font-semibold text-mk-red hover:underline">Edit</button>
                <button onClick={() => handleDelete(addr.id)} className="text-xs font-semibold text-red-400 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && addresses.length === 0 && !showForm && (
        <div className="bg-white border border-gray-200 rounded-xl py-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-map-marker-alt text-3xl text-gray-300"></i>
          </div>
          <h3 className="text-lg font-semibold text-mk-gray-800 mb-1">No saved addresses</h3>
          <p className="text-sm text-mk-gray-500 mb-4">Add a delivery address to speed up checkout.</p>
          <button onClick={openCreate}
            className="inline-block bg-mk-red text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-mk-red-600 transition-colors">
            <i className="fas fa-plus mr-2"></i>Add Address
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-12 text-mk-gray-500 text-sm">Loading addresses...</div>
      )}
    </div>
  )
}
