import { Link } from "react-router-dom"

export default function PublicFooter() {
  return (
    <footer className="bg-mk-gray-900 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="Material King" className="w-10 h-10 rounded-full object-cover" />
              <div className="text-white font-extrabold tracking-wide">MATERIAL <span className="text-mk-red">KING</span></div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">India's leading B2B marketplace for building materials. Best prices from 500+ verified vendors.</p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-mk-red hover:bg-white/20 transition-colors"><i className="fab fa-facebook-f text-sm"></i></a>
              <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-mk-red hover:bg-white/20 transition-colors"><i className="fab fa-instagram text-sm"></i></a>
              <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-mk-red hover:bg-white/20 transition-colors"><i className="fab fa-linkedin-in text-sm"></i></a>
              <a href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-mk-red hover:bg-white/20 transition-colors"><i className="fab fa-youtube text-sm"></i></a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-400 text-sm hover:text-mk-red transition-colors">About Us</Link></li>
              <li><Link to="/categories" className="text-gray-400 text-sm hover:text-mk-red transition-colors">All Categories</Link></li>
              <li><Link to="/products" className="text-gray-400 text-sm hover:text-mk-red transition-colors">Products</Link></li>
              <li><Link to="/contact" className="text-gray-400 text-sm hover:text-mk-red transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 text-sm hover:text-mk-red transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-400 text-sm hover:text-mk-red transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="text-gray-400 text-sm hover:text-mk-red transition-colors">Return Policy</a></li>
              <li><a href="#" className="text-gray-400 text-sm hover:text-mk-red transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="text-gray-400 text-sm hover:text-mk-red transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="text-gray-400 text-sm"><i className="fas fa-phone-alt text-mk-red mr-2"></i>1800-XXX-XXXX</li>
              <li className="text-gray-400 text-sm"><i className="fas fa-envelope text-mk-red mr-2"></i>support@materialking.com</li>
              <li className="text-gray-400 text-sm"><i className="fas fa-map-marker-alt text-mk-red mr-2"></i>15th Floor, Atlanta Building, Office No.: 156, 157 & 158, Jamnalal Bajaj Marg, Nariman Point, Mumbai, Maharashtra 400021</li>
            </ul>
            <div className="mt-4">
              <h5 className="text-white text-xs font-semibold mb-2">We Accept</h5>
              <div className="flex items-center gap-3 text-gray-400">
                <i className="fab fa-cc-visa text-lg"></i>
                <i className="fab fa-cc-mastercard text-lg"></i>
                <i className="fas fa-university text-lg"></i>
                <span className="text-xs font-semibold">UPI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-center">
          <p className="text-gray-500 text-xs">&copy; 2026 Material King. All rights reserved. Developed by <a href="https://kreonsolutions.com/" target="_blank" rel="noopener noreferrer" className="hover:text-mk-red transition-colors">Kreon Solutions</a></p>
          <div className="flex gap-4 text-xs text-gray-500">
            <a href="#" className="hover:text-mk-red">Privacy Policy</a>
            <a href="#" className="hover:text-mk-red">Terms of Service</a>
            <a href="#" className="hover:text-mk-red">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
