import { Link } from "react-router-dom"

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Material King" className="w-10 h-10 rounded-full" />
          <span className="text-xl font-bold text-primary">Material King</span>
        </Link>

        <div className="flex-1 mx-6">
          <input
            type="text"
            placeholder="Search products, SKU, brands..."
            className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-darkgray hover:text-primary">
            Login
          </Link>
          <Link to="/cart" className="bg-primary text-white px-4 py-2 rounded-full">
            Cart
          </Link>
        </div>
      </div>
    </header>
  )
}
