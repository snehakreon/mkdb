import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { authService } from "../../services/auth.service"

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    password: "", userType: "buyer",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await authService.register(form)
      login(res.data.accessToken, res.data.refreshToken, res.data.user)
      navigate("/admin")
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const userTypes = [
    { value: "buyer", label: "Buyer", sub: "Contractor / Builder", icon: "fa-shopping-bag" },
    { value: "dealer", label: "Dealer", sub: "Retailer / Reseller", icon: "fa-store" },
    { value: "vendor", label: "Vendor", sub: "Manufacturer / Supplier", icon: "fa-industry" },
  ]

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
            Already have an account? <Link to="/login" className="text-mk-red font-semibold hover:underline">Sign In</Link>
          </div>
        </div>
      </header>

      {/* Register Section */}
      <div className="flex-1 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-5 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Left - Branding */}
          <div className="login-bg p-10 lg:p-12 text-white lg:col-span-2 hidden lg:flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border-2 border-mk-red">
                  <span className="text-white font-extrabold">MK</span>
                </div>
                <span className="text-xl font-extrabold">MATERIAL KING</span>
              </div>
              <h2 className="text-2xl font-extrabold leading-tight mb-4">Join 10,000+ businesses on India's largest B2B materials platform</h2>
              <p className="text-gray-300 leading-relaxed text-sm">Register now and get access to wholesale prices from 500+ verified vendors across India.</p>
            </div>
            <div className="space-y-4 mt-8">
              {[
                { title: "Free to Register", desc: "No hidden charges. Start ordering within minutes." },
                { title: "Verified Vendors Only", desc: "All vendors are KYC verified with valid GSTIN." },
                { title: "Credit Facility Available", desc: "Get credit lines up to ₹50 Lakhs for your business." },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="fas fa-check text-white text-xs"></i>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{item.title}</div>
                    <div className="text-gray-400 text-xs">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Register Form */}
          <div className="p-8 lg:p-10 lg:col-span-3">
            <div className="max-w-lg mx-auto">
              <h1 className="text-2xl font-extrabold text-mk-gray-900 mb-1">Create Your Account</h1>
              <p className="text-sm text-mk-gray-600 mb-6">Tell us about yourself and your business</p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* User Type */}
                <div>
                  <label className="block text-sm font-semibold text-mk-gray-800 mb-2">I want to register as:</label>
                  <div className="grid grid-cols-3 gap-3">
                    {userTypes.map((t) => (
                      <label key={t.value}
                        className={`user-type-card border-2 rounded-xl p-3 text-center cursor-pointer transition-all hover:border-mk-red/50 ${form.userType === t.value ? "selected border-mk-red bg-mk-red-50" : "border-gray-200"}`}>
                        <input type="radio" name="userType" value={t.value} checked={form.userType === t.value}
                          onChange={handleChange} className="hidden" />
                        <div className={`type-icon w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors ${form.userType === t.value ? "bg-mk-red text-white" : "bg-mk-gray-100"}`}>
                          <i className={`fas ${t.icon} text-sm`}></i>
                        </div>
                        <div className="font-semibold text-xs text-mk-gray-800">{t.label}</div>
                        <div className="text-[10px] text-mk-gray-600">{t.sub}</div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-mk-gray-800 mb-1.5">First Name</label>
                    <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Rajesh"
                      className="form-input w-full border-2 border-gray-200 rounded-lg py-2.5 px-3 text-sm transition-all" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-mk-gray-800 mb-1.5">Last Name</label>
                    <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Kumar"
                      className="form-input w-full border-2 border-gray-200 rounded-lg py-2.5 px-3 text-sm transition-all" required />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-mk-gray-800 mb-1.5">Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@company.com"
                      className="form-input w-full border-2 border-gray-200 rounded-lg py-2.5 px-3 text-sm transition-all" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-mk-gray-800 mb-1.5">Phone Number</label>
                    <div className="flex">
                      <span className="bg-gray-50 border-2 border-r-0 border-gray-200 rounded-l-lg px-3 flex items-center text-sm text-mk-gray-600">+91</span>
                      <input name="phone" value={form.phone} onChange={handleChange} placeholder="98765 43210"
                        className="form-input w-full border-2 border-gray-200 rounded-r-lg py-2.5 px-3 text-sm transition-all" required />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-mk-gray-800 mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange}
                      placeholder="Min. 8 characters"
                      className="form-input w-full border-2 border-gray-200 rounded-lg py-2.5 px-3 pr-10 text-sm transition-all" required minLength={6} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-mk-gray-300 hover:text-mk-gray-600">
                      <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2">
                  <input type="checkbox" id="terms" className="rounded border-gray-300 text-mk-red focus:ring-mk-red mt-0.5" required />
                  <label htmlFor="terms" className="text-xs text-mk-gray-600">
                    I agree to Material King's <a href="#" className="text-mk-red hover:underline">Terms of Service</a> and <a href="#" className="text-mk-red hover:underline">Privacy Policy</a>
                  </label>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-mk-red hover:bg-mk-red-600 text-white font-bold py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:opacity-50">
                  {loading ? "Creating account..." : "Create Account"} <i className="fas fa-arrow-right ml-2"></i>
                </button>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-xs text-mk-gray-600">or register with</span>
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

              <p className="text-center text-sm text-mk-gray-600 mt-6">
                Already have an account? <Link to="/login" className="text-mk-red font-semibold hover:underline">Sign In</Link>
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
