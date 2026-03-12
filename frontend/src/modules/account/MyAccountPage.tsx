import { useAuth } from "../../context/AuthContext"

export default function MyAccountPage() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="text-xl font-bold text-mk-gray-900 mb-6">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-mk-gray-600 uppercase tracking-wider mb-4">Personal Information</h2>
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
              <label className="text-xs text-mk-gray-500">Account Type</label>
              <p className="text-sm font-medium text-mk-gray-900 capitalize">{user?.userType}</p>
            </div>
          </div>
          <button className="mt-4 text-sm text-mk-red font-semibold hover:underline">Edit Profile</button>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <i className="fas fa-box text-blue-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-mk-gray-900">0</p>
              <p className="text-xs text-mk-gray-500">Total Orders</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <i className="fas fa-heart text-red-500"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-mk-gray-900">0</p>
              <p className="text-xs text-mk-gray-500">Wishlist Items</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <i className="fas fa-map-marker-alt text-green-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-mk-gray-900">0</p>
              <p className="text-xs text-mk-gray-500">Saved Addresses</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
