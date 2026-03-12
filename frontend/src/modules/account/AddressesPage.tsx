import { useState } from "react"
import { INDIAN_STATES } from "../../constants/indianStates"

interface Address {
  id: string
  label: string
  fullName: string
  phone: string
  line1: string
  line2: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

export default function AddressesPage() {
  const [addresses] = useState<Address[]>([])
  const [showForm, setShowForm] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-mk-gray-900">My Addresses</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-mk-red text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-mk-red-600 transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>Add New Address
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-mk-gray-800 mb-4">Add New Address</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-mk-gray-600 mb-1">Full Name</label>
              <input type="text" className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm" placeholder="Rajesh Kumar" />
            </div>
            <div>
              <label className="block text-xs font-medium text-mk-gray-600 mb-1">Phone Number</label>
              <input type="text" className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm" placeholder="9876543210" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-mk-gray-600 mb-1">Address Line 1</label>
              <input type="text" className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm" placeholder="House/Flat No., Building Name" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-mk-gray-600 mb-1">Address Line 2</label>
              <input type="text" className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm" placeholder="Street, Locality" />
            </div>
            <div>
              <label className="block text-xs font-medium text-mk-gray-600 mb-1">City</label>
              <input type="text" className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm" placeholder="Mumbai" />
            </div>
            <div>
              <label className="block text-xs font-medium text-mk-gray-600 mb-1">State</label>
              <select className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm">
                <option value="">Select State...</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-mk-gray-600 mb-1">Pincode</label>
              <input type="text" className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm" placeholder="400001" />
            </div>
            <div>
              <label className="block text-xs font-medium text-mk-gray-600 mb-1">Address Label</label>
              <select className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm">
                <option>Home</option>
                <option>Office</option>
                <option>Site</option>
                <option>Warehouse</option>
              </select>
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <button type="button" className="bg-mk-red text-white text-sm font-semibold px-6 py-2 rounded-lg hover:bg-mk-red-600 transition-colors">
                Save Address
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-sm text-mk-gray-600 hover:text-mk-gray-800">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {addresses.length === 0 && !showForm && (
        <div className="bg-white border border-gray-200 rounded-xl py-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-map-marker-alt text-3xl text-gray-300"></i>
          </div>
          <h3 className="text-lg font-semibold text-mk-gray-800 mb-1">No saved addresses</h3>
          <p className="text-sm text-mk-gray-500 mb-4">Add a delivery address to speed up checkout.</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-block bg-mk-red text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-mk-red-600 transition-colors"
          >
            <i className="fas fa-plus mr-2"></i>Add Address
          </button>
        </div>
      )}
    </div>
  )
}
