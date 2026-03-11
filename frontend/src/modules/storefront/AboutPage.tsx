import { Link } from "react-router-dom"

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-mk-gray-900 to-mk-gray-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-block bg-mk-red text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">Our Story</div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Building India's Future,<br /><span className="text-mk-red">One Material at a Time</span></h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">We're on a mission to make building materials accessible, affordable, and transparent for every business in India.</p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <div className="w-14 h-14 bg-mk-red-50 rounded-2xl flex items-center justify-center mb-4"><i className="fas fa-bullseye text-2xl text-mk-red"></i></div>
              <h2 className="text-2xl font-extrabold text-mk-gray-900 mb-4">Our Mission</h2>
              <p className="text-mk-gray-600 leading-relaxed">To democratize the building materials supply chain by connecting manufacturers directly with contractors, builders, and retailers, eliminating middlemen and ensuring the best prices with guaranteed quality.</p>
            </div>
            <div>
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4"><i className="fas fa-eye text-2xl text-blue-500"></i></div>
              <h2 className="text-2xl font-extrabold text-mk-gray-900 mb-4">Our Vision</h2>
              <p className="text-mk-gray-600 leading-relaxed">To become India's most trusted B2B marketplace for building materials, empowering every construction project with quality products, transparent pricing, and seamless procurement experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-mk-gray-50 py-16 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Verified Vendors" },
              { value: "50K+", label: "Products Listed" },
              { value: "1,000+", label: "Cities Served" },
              { value: "₹500Cr+", label: "GMV Processed" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-4xl font-extrabold text-mk-red mb-1">{s.value}</div>
                <div className="text-sm text-mk-gray-600 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Problem We Solve */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-mk-gray-900">The Problem We <span className="text-mk-red">Solve</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "fa-times-circle", title: "Fragmented Supply Chain", desc: "India's building materials market is fragmented with multiple middlemen inflating prices by 20-40%. We connect you directly to manufacturers." },
              { icon: "fa-question-circle", title: "No Price Transparency", desc: "Buyers often don't know the fair market price. We provide transparent pricing, bulk discounts, and real-time availability." },
              { icon: "fa-exclamation-circle", title: "Quality Uncertainty", desc: "Counterfeit products are a major issue. Every product on Material King is sourced from authorized dealers with manufacturer warranty." },
            ].map((p) => (
              <div key={p.title} className="bg-mk-gray-50 rounded-xl p-6 border border-gray-100">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4"><i className={`fas ${p.icon} text-xl text-red-500`}></i></div>
                <h3 className="font-bold text-mk-gray-800 mb-2">{p.title}</h3>
                <p className="text-sm text-mk-gray-600">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-mk-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold">Our <span className="text-mk-red">Values</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "fa-handshake", title: "Trust", desc: "Transparent dealings, verified vendors, and honest pricing." },
              { icon: "fa-medal", title: "Quality", desc: "Only genuine products from authorized brands and dealers." },
              { icon: "fa-rocket", title: "Innovation", desc: "Technology-driven platform for seamless procurement." },
              { icon: "fa-users", title: "Customer First", desc: "Dedicated support and hassle-free experience." },
            ].map((v) => (
              <div key={v.title} className="text-center">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4"><i className={`fas ${v.icon} text-xl text-mk-red`}></i></div>
                <h3 className="font-bold mb-2">{v.title}</h3>
                <p className="text-sm text-gray-400">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-mk-red text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold mb-4">Join the Material King Community</h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto">Whether you're a buyer, dealer, or vendor — there's a place for you on India's fastest growing B2B materials platform.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register" className="bg-white text-mk-red font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">Register as Buyer</Link>
            <Link to="/contact" className="border border-white/50 hover:bg-white/10 text-white font-bold py-3 px-8 rounded-lg transition-colors">Become a Vendor</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
