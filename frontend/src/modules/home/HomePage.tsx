import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Material King</h1>
        <p className="text-lg text-gray-600 mb-8">Building Materials Management Platform</p>
        {user ? (
          <Link to="/admin" className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">
            Go to Dashboard
          </Link>
        ) : (
          <div className="space-x-4">
            <Link to="/login" className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">
              Sign In
            </Link>
            <Link to="/register" className="px-6 py-3 bg-white text-primary-600 border border-primary-300 rounded-lg font-medium hover:bg-primary-50">
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
