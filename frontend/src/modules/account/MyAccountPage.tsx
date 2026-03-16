import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { api } from "../../services/api"

export default function MyAccountPage() {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  })
  const [stats, setStats] = useState({ totalOrders: 0, wishlistItems: 0, savedAddresses: 0 })

  useEffect(() => {
    api.get("/auth/account-summary")
      .then((res) => setStats(res.data))
      .catch(() => {})
  }, [])

  const handleEdit = () => {
    setForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
    })
    setEditing(true)
    setSuccess("")
    setError("")
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")
    try {
      const res = await api.put("/auth/profile", form)
      updateUser(res.data)
      setEditing(false)
      setSuccess("Profile updated successfully!")
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile")
    }
    setSaving(false)
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-mk-gray-900 mb-6">My Account</h1>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-mk-gray-600 uppercase tracking-wider mb-4">Personal Information</h2>

          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-mk-gray-500 mb-1 block">First Name</label>
                <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm" />
              </div>
              <div>
                <label className="text-xs text-mk-gray-500 mb-1 block">Last Name</label>
                <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm" />
              </div>
              <div>
                <label className="text-xs text-mk-gray-500 mb-1 block">Phone</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm" />
              </div>
              <div>
                <label className="text-xs text-mk-gray-500">Email Address</label>
                <p className="text-sm font-medium text-mk-gray-400">{user?.email} <span className="text-xs">(cannot change)</span></p>
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={handleSave} disabled={saving}
                  className="bg-mk-red text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-mk-red-600 disabled:opacity-50 transition-colors">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button onClick={() => setEditing(false)}
                  className="text-sm text-mk-gray-600 hover:text-mk-gray-800 px-4 py-2">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-mk-gray-500">Full Name</label>
                <p className="text-sm font-medium text-mk-gray-900">{user?.firstName} {user?.lastName}</p>
              </div>
              <div>
                <label className="text-xs text-mk-gray-500">Email Address</label>
                <p className="text-sm font-medium text-mk-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="text-xs text-mk-gray-500">Phone</label>
                <p className="text-sm font-medium text-mk-gray-900">{user?.phone || "-"}</p>
              </div>
              <div>
                <label className="text-xs text-mk-gray-500">Account Type</label>
                <p className="text-sm font-medium text-mk-gray-900 capitalize">{user?.userType}</p>
              </div>
              <button onClick={handleEdit} className="mt-2 text-sm text-mk-red font-semibold hover:underline">
                <i className="fas fa-pen mr-1"></i>Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <i className="fas fa-box text-blue-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-mk-gray-900">{stats.totalOrders}</p>
              <p className="text-xs text-mk-gray-500">Total Orders</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <i className="fas fa-heart text-red-500"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-mk-gray-900">{stats.wishlistItems}</p>
              <p className="text-xs text-mk-gray-500">Wishlist Items</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <i className="fas fa-map-marker-alt text-green-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-mk-gray-900">{stats.savedAddresses}</p>
              <p className="text-xs text-mk-gray-500">Saved Addresses</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
