import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { authService } from "../../services/auth.service"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await authService.login({ email, password })
      login(res.data.accessToken, res.data.refreshToken, res.data.user)
      navigate("/admin")
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-mk-gray-50">
      {/* Minimal Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 bg-mk-gray rounded-full flex items-center justify-center border-2 border-mk-red">
              <span className="text-white font-extrabold text-sm">MK</span>
            </div>
            <div className="leading-tight">
              <div className="text-lg font-extrabold text-mk-gray tracking-wide">MATERIAL <span className="text-mk-red">KING</span></div>
              <div className="text-[10px] text-mk-gray-600 tracking-widest uppercase">Building Materials Marketplace</div>
            </div>
          </Link>
          <div className="text-sm text-mk-gray-600">
            New to Material King? <Link to="/register" className="text-mk-red font-semibold hover:underline">Create Account</Link>
          </div>
        </div>
      </header>

      {/* Login Section */}
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Left - Branding */}
          <div className="login-bg p-10 lg:p-12 text-white hidden lg:flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border-2 border-mk-red">
                  <span className="text-white font-extrabold">MK</span>
                </div>
                <span className="text-xl font-extrabold">MATERIAL KING</span>
              </div>
              <h2 className="text-3xl font-extrabold leading-tight mb-4">Welcome back to India's #1 B2B Building Materials Platform</h2>
              <p className="text-gray-300 leading-relaxed">Access wholesale prices, manage your orders, and grow your business with Material King.</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0"><i className="fas fa-tags text-mk-red"></i></div>
                <span>Best wholesale prices from 500+ verified vendors</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0"><i className="fas fa-truck text-mk-red"></i></div>
                <span>Pan India delivery to 1,000+ cities</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0"><i className="fas fa-file-invoice text-mk-red"></i></div>
                <span>GST invoices with every order</span>
              </div>
            </div>
          </div>

          {/* Right - Login Form */}
          <div className="p-8 lg:p-12">
            <div className="max-w-sm mx-auto">
              <h1 className="text-2xl font-extrabold text-mk-gray-900 mb-1">Sign In</h1>
              <p className="text-sm text-mk-gray-600 mb-8">Enter your credentials to access your account</p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-mk-gray-800 mb-1.5">Email or Phone</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mk-gray-300"><i className="fas fa-envelope"></i></span>
                    <input type="text" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com or 9876543210"
                      className="form-input w-full border-2 border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm transition-all" required />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-semibold text-mk-gray-800">Password</label>
                    <a href="#" className="text-xs text-mk-red font-semibold hover:underline">Forgot Password?</a>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mk-gray-300"><i className="fas fa-lock"></i></span>
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="form-input w-full border-2 border-gray-200 rounded-lg py-2.5 pl-10 pr-10 text-sm transition-all" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-mk-gray-300 hover:text-mk-gray-600">
                      <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="remember" className="rounded border-gray-300 text-mk-red focus:ring-mk-red" defaultChecked />
                  <label htmlFor="remember" className="text-sm text-mk-gray-600">Keep me signed in</label>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-mk-red hover:bg-mk-red-600 text-white font-bold py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:opacity-50">
                  {loading ? "Signing in..." : "Sign In"} <i className="fas fa-arrow-right ml-2"></i>
                </button>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-xs text-mk-gray-600">or sign in with</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button type="button" className="flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors">
                    <i className="fab fa-google text-red-500"></i> Google
                  </button>
                  <button type="button" className="flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors">
                    <i className="fas fa-phone text-green-500"></i> OTP
                  </button>
                </div>
              </form>

              <p className="text-center text-sm text-mk-gray-600 mt-8">
                Don't have an account? <Link to="/register" className="text-mk-red font-semibold hover:underline">Register now</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-mk-gray-600">
          <p>&copy; 2026 Material King. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-mk-red">Privacy Policy</a>
            <a href="#" className="hover:text-mk-red">Terms of Service</a>
            <a href="#" className="hover:text-mk-red">Help</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
