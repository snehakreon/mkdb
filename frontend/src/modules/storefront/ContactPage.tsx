import { Link } from "react-router-dom"

export default function ContactPage() {
  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-mk-gray-600">
          <Link to="/" className="hover:text-mk-red transition-colors">Home</Link>
          <i className="fas fa-chevron-right text-[10px]"></i>
          <span className="text-mk-gray-800 font-semibold">Contact Us</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-mk-gray-900">Get in <span className="text-mk-red">Touch</span></h1>
          <p className="text-mk-gray-600 mt-2 max-w-lg mx-auto">Have a question, need a bulk quote, or want to become a vendor? We'd love to hear from you.</p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: "fa-phone-alt", bg: "bg-mk-red-50", color: "text-mk-red", title: "Call Us", sub: "Mon - Sat, 9AM - 7PM IST", link: "1800-XXX-XXXX" },
            { icon: "fab fa-whatsapp", bg: "bg-green-50", color: "text-green-500", title: "WhatsApp", sub: "Quick response within 1 hour", link: "+91 98765 43210" },
            { icon: "fa-envelope", bg: "bg-blue-50", color: "text-blue-500", title: "Email Us", sub: "We reply within 24 hours", link: "support@materialking.com" },
          ].map((c) => (
            <div key={c.title} className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className={`w-14 h-14 ${c.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}><i className={`${c.icon.includes("fab") ? c.icon : "fas " + c.icon} text-xl ${c.color}`}></i></div>
              <h3 className="font-bold text-mk-gray-800 mb-1">{c.title}</h3>
              <p className="text-sm text-mk-gray-600 mb-2">{c.sub}</p>
              <span className={`${c.color} font-semibold`}>{c.link}</span>
            </div>
          ))}
        </div>

        {/* Form & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-mk-gray-900 mb-6">Send us a Message</h2>
            <form className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-mk-gray-800 mb-1.5">Full Name</label>
                  <input type="text" placeholder="Your name" className="form-input w-full border-2 border-gray-200 rounded-lg py-2.5 px-3 text-sm transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-mk-gray-800 mb-1.5">Phone Number</label>
                  <input type="tel" placeholder="+91 98765 43210" className="form-input w-full border-2 border-gray-200 rounded-lg py-2.5 px-3 text-sm transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-mk-gray-800 mb-1.5">Email</label>
                <input type="email" placeholder="you@company.com" className="form-input w-full border-2 border-gray-200 rounded-lg py-2.5 px-3 text-sm transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-mk-gray-800 mb-1.5">Subject</label>
                <select className="form-input w-full border-2 border-gray-200 rounded-lg py-2.5 px-3 text-sm transition-all">
                  <option>Select a topic</option>
                  <option>Bulk Order Inquiry</option>
                  <option>Product Availability</option>
                  <option>Pricing & Quotation</option>
                  <option>Order Issue</option>
                  <option>Become a Vendor</option>
                  <option>Dealer Registration</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-mk-gray-800 mb-1.5">Message</label>
                <textarea rows={5} placeholder="Tell us about your requirement..." className="form-input w-full border-2 border-gray-200 rounded-lg py-2.5 px-3 text-sm transition-all resize-none"></textarea>
              </div>
              <button type="submit" className="bg-mk-red hover:bg-mk-red-600 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg">
                Send Message <i className="fas fa-paper-plane ml-2"></i>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-mk-gray-900 mb-4">Head Office</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <i className="fas fa-map-marker-alt text-mk-red mt-0.5 w-5"></i>
                  <div>
                    <div className="font-semibold text-mk-gray-800">Material King Pvt. Ltd.</div>
                    <div className="text-mk-gray-600">5th Floor, Trade Center,<br />Bandra Kurla Complex,<br />Mumbai - 400051, Maharashtra</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <i className="fas fa-clock text-mk-red w-5"></i>
                  <div>
                    <div className="font-semibold text-mk-gray-800">Business Hours</div>
                    <div className="text-mk-gray-600">Mon - Sat: 9:00 AM - 7:00 PM IST</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-mk-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-2">
                {[
                  { icon: "fa-question-circle", label: "FAQ / Help Center" },
                  { icon: "fa-truck", label: "Track Your Order" },
                  { icon: "fa-undo", label: "Return & Refund Policy" },
                  { icon: "fa-handshake", label: "Become a Vendor" },
                ].map((l) => (
                  <a key={l.label} href="#" className="flex items-center gap-2 text-sm text-mk-gray-600 hover:text-mk-red transition-colors p-2 rounded-lg hover:bg-mk-gray-50">
                    <i className={`fas ${l.icon} text-mk-red w-5`}></i> {l.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-mk-gray-100 h-48 flex items-center justify-center">
                <div className="text-center text-mk-gray-600">
                  <i className="fas fa-map-marked-alt text-3xl mb-2"></i>
                  <p className="text-sm">Google Map</p>
                  <p className="text-xs text-mk-gray-300">BKC, Mumbai</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
