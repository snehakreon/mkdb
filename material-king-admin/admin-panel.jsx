import React, { useState, useEffect } from 'react';
import { BarChart3, Package, Users, MapPin, DollarSign, ShoppingCart, TrendingUp, AlertCircle, Check, X, Eye, Edit2, Trash2, Plus, Search, Filter, Download, Upload, RefreshCw, Settings, LogOut, Bell, ChevronDown, Home, Building2, Tag, Boxes, Receipt, CreditCard, Truck, AlertTriangle, FileText, Menu, Ticket, UserCog } from 'lucide-react';

// ============================================================================
// CONFIGURATION - Toggle between Mock Data and Real API
// ============================================================================
const USE_REAL_API = true; // Set to true when NestJS backend is ready
const API_BASE_URL = 'http://localhost:5000/api';

// ============================================================================
// MOCK DATA GENERATOR
// ============================================================================
const generateMockData = () => ({
  stats: {
    totalOrders: 1247,
    activeVendors: 52,
    totalGMV: 52000000,
    pendingApprovals: 23,
    growth: { orders: 12, vendors: 5, gmv: 18 }
  },
  zones: [
    { id: 1, code: 'ZONE-MUM-N', name: 'Mumbai North', pincodes: 45, vendor: 'ABC Distributors', status: 'active' },
    { id: 2, code: 'ZONE-MUM-S', name: 'Mumbai South', pincodes: 38, vendor: 'XYZ Suppliers', status: 'active' },
    { id: 3, code: 'ZONE-DEL-E', name: 'Delhi NCR East', pincodes: 52, vendor: 'Prime Materials', status: 'active' }
  ],
  vendors: [
    { id: 1, code: 'VND-001', company: 'ABC Distributors Pvt Ltd', gstin: '27AAACR5678C1Z9', contact: '9876543210', zones: 2, status: 'verified' },
    { id: 2, code: 'VND-002', company: 'XYZ Suppliers', gstin: '27AAAXS1234D1Z5', contact: '9876543211', zones: 1, status: 'pending' },
    { id: 3, code: 'VND-003', company: 'Prime Materials Ltd', gstin: '07BBBPM9876E1Z3', contact: '9876543212', zones: 1, status: 'verified' }
  ],
  products: [
    { id: 1, sku: 'PLY-CEN-18MM-BWP-8X4', name: 'Century BWP Grade Plywood 18mm', category: 'Plywood', brand: 'Century', price: 2850, stock: 245, status: 'active' },
    { id: 2, sku: 'CEM-ACC-53-50KG', name: 'ACC Gold 53 Grade Cement', category: 'Cement', brand: 'ACC', price: 425, stock: 1200, status: 'active' },
    { id: 3, sku: 'TIL-NIR-60X60-GLZ', name: 'Nitco Glazed Vitrified Tiles', category: 'Tiles', brand: 'Nitco', price: 95, stock: 450, status: 'active' }
  ],
  orders: [
    { id: 1, number: 'ORD-2601001', buyer: 'ABC Constructions', type: 'direct', amount: 467988, status: 'confirmed', date: '2026-02-15' },
    { id: 2, number: 'ORD-2601002', buyer: 'XYZ Builders', type: 'dealer', amount: 823450, status: 'pending', date: '2026-02-15', dealer: 'DLR-001' },
    { id: 3, number: 'ORD-2601003', buyer: 'Prime Realty', type: 'direct', amount: 215600, status: 'dispatched', date: '2026-02-14' }
  ],
  dealers: [
    { id: 1, code: 'DLR-001', company: 'Metro Dealers Pvt Ltd', gstin: '27DDDMD5678C1Z9', creditLimit: 1000000, available: 650000, orders: 12, status: 'approved' },
    { id: 2, code: 'DLR-002', company: 'Elite Trading Co', gstin: '27EEEET1234D1Z5', creditLimit: 1500000, available: 1200000, orders: 8, status: 'approved' }
  ]
});

// ============================================================================
// API SERVICE - Handles both Mock and Real API calls
// ============================================================================
const apiService = {
  async fetchData(endpoint) {
    if (USE_REAL_API) {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      return response.json();
    }
    // Mock data with artificial delay for realistic UX
    return new Promise(resolve => 
      setTimeout(() => resolve(generateMockData()[endpoint]), 500)
    );
  },
  async postData(endpoint, data) {
    if (USE_REAL_API) {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    }
    return new Promise(resolve => 
      setTimeout(() => resolve({ success: true, id: Date.now() }), 500)
    );
  }
};

// ============================================================================
// MAIN ADMIN PANEL COMPONENT
// ============================================================================
export default function MaterialKingAdmin() {
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [data, setData] = useState(generateMockData());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadModuleData(currentModule);
  }, [currentModule]);

  const loadModuleData = async (module) => {
    setLoading(true);
    try {
      const moduleData = await apiService.fetchData(module);
      setData(prev => ({ ...prev, [module]: moduleData }));
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
        * { font-family: 'Montserrat', 'Century Gothic', sans-serif; }
      `}</style>

      {/* Header */}
      <Header />
      
      {/* Layout */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <Sidebar 
          currentModule={currentModule} 
          setCurrentModule={setCurrentModule}
          isOpen={sidebarOpen}
          toggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="p-6">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <ModuleRenderer module={currentModule} data={data} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// ============================================================================
// HEADER COMPONENT
// ============================================================================
function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b-4 border-[#ED1C24] flex items-center justify-between px-6 z-50 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Material King Logo */}
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Material King" className="w-12 h-12 rounded-full object-cover" />
          <div>
            <h1 className="text-xl font-bold text-[#4D4D4D] tracking-wider">MATERIAL KING</h1>
            <p className="text-xs text-gray-500">Admin Portal</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* API Status Indicator */}
        <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-gray-100">
          <div className={`w-2 h-2 rounded-full ${USE_REAL_API ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`}></div>
          <span className="text-gray-600 font-semibold">{USE_REAL_API ? 'Live API' : 'Mock Data'}</span>
        </div>
        
        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ED1C24] rounded-full border-2 border-white"></span>
        </button>
        
        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ED1C24] to-[#4D4D4D] flex items-center justify-center text-white font-bold">
            SA
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-bold text-gray-800">Super Admin</p>
            <p className="text-xs text-gray-500">admin@materialking.com</p>
          </div>
        </div>
      </div>
    </header>
  );
}

// ============================================================================
// SIDEBAR COMPONENT
// ============================================================================
function Sidebar({ currentModule, setCurrentModule, isOpen, toggle }) {
  const menuSections = [
    {
      title: 'Main',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Home }
      ]
    },
    {
      title: 'Geographic',
      items: [
        { id: 'zones', label: 'Zones & Pincodes', icon: MapPin },
        { id: 'vendors', label: 'Vendors', icon: Building2, badge: 5 }
      ]
    },
    {
      title: 'Product Catalog',
      items: [
        { id: 'categories', label: 'Categories', icon: Boxes },
        { id: 'brands', label: 'Brands', icon: Tag },
        { id: 'products', label: 'Products (SKUs)', icon: Package },
        { id: 'pricing', label: 'Pricing Approvals', icon: DollarSign, badge: 12 }
      ]
    },
    {
      title: 'Dealer & Credit',
      items: [
        { id: 'dealers', label: 'Dealers', icon: Users },
        { id: 'credit', label: 'Credit Approvals', icon: CreditCard, badge: 3 }
      ]
    },
    {
      title: 'Orders',
      items: [
        { id: 'orders', label: 'All Orders', icon: ShoppingCart },
        { id: 'pending', label: 'Pending Approvals', icon: AlertCircle, badge: 8 },
        { id: 'dispatches', label: 'Dispatches', icon: Truck },
        { id: 'disputes', label: 'Disputes', icon: AlertTriangle, badge: 2 }
      ]
    },
    {
      title: 'Financial',
      items: [
        { id: 'payments', label: 'Payments', icon: Receipt },
        { id: 'settlements', label: 'Settlements', icon: FileText }
      ]
    },
    {
      title: 'Marketing',
      items: [
        { id: 'coupons', label: 'Coupons', icon: Ticket }
      ]
    },
    {
      title: 'Administration',
      items: [
        { id: 'admin-users', label: 'Admin Users', icon: UserCog }
      ]
    }
  ];

  return (
    <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 z-40 overflow-y-auto ${isOpen ? 'w-64' : 'w-0'}`}>
      <nav className="p-4">
        {menuSections.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">
              {section.title}
            </h3>
            {section.items.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentModule(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all ${
                  currentModule === item.id 
                    ? 'bg-[#ED1C24] text-white font-bold shadow-lg scale-105' 
                    : 'text-gray-700 hover:bg-gray-100 hover:translate-x-1'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1 text-left text-sm">{item.label}</span>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    currentModule === item.id ? 'bg-white text-[#ED1C24]' : 'bg-[#ED1C24] text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

// ============================================================================
// MODULE RENDERER
// ============================================================================
function ModuleRenderer({ module, data }) {
  const modules = {
    dashboard: <Dashboard data={data} />,
    zones: <ZonesModule data={data.zones} />,
    vendors: <VendorsModule data={data.vendors} />,
    categories: <CategoriesModule />,
    brands: <BrandsModule />,
    products: <ProductsModule data={data.products} />,
    pricing: <PricingModule />,
    dealers: <DealersModule data={data.dealers} />,
    credit: <CreditApprovalsModule />,
    orders: <OrdersModule data={data.orders} />,
    pending: <PendingApprovalsModule />,
    dispatches: <DispatchesModule />,
    disputes: <DisputesModule />,
    payments: <PaymentsModule />,
    settlements: <SettlementsModule />,
    coupons: <CouponsModule />,
    'admin-users': <AdminUsersModule />
  };

  return modules[module] || <Dashboard data={data} />;
}

// ============================================================================
// DASHBOARD MODULE
// ============================================================================
function Dashboard({ data }) {
  const stats = [
    { label: 'Total Orders', value: data.stats.totalOrders.toLocaleString(), growth: `+${data.stats.growth.orders}%`, icon: ShoppingCart, color: 'from-blue-500 to-blue-600' },
    { label: 'Active Vendors', value: data.stats.activeVendors, growth: `+${data.stats.growth.vendors} new`, icon: Building2, color: 'from-green-500 to-green-600' },
    { label: 'Total GMV', value: `₹${(data.stats.totalGMV / 10000000).toFixed(2)} Cr`, growth: `+${data.stats.growth.gmv}%`, icon: TrendingUp, color: 'from-purple-500 to-purple-600' },
    { label: 'Pending Approvals', value: data.stats.pendingApprovals, growth: 'Needs attention', icon: AlertCircle, color: 'from-red-500 to-red-600' }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#4D4D4D] mb-6">Dashboard Overview</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 border-l-4 border-[#ED1C24]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 font-bold uppercase tracking-wide">{stat.label}</span>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#4D4D4D] mb-2">{stat.value}</p>
            <p className="text-sm text-green-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {stat.growth}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#4D4D4D] flex items-center gap-3">
            <div className="w-1.5 h-8 bg-[#ED1C24] rounded-full"></div>
            Recent Orders
          </h2>
          <button className="px-5 py-2.5 bg-[#ED1C24] text-white rounded-lg hover:bg-[#c71920] transition font-bold text-sm shadow-md hover:shadow-lg">
            View All Orders →
          </button>
        </div>
        <DataTable data={data.orders} type="orders" />
      </div>
    </div>
  );
}

// ============================================================================
// ZONES MODULE
// ============================================================================
function ZonesModule({ data }) {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#4D4D4D]">Zones & Pincodes</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-[#ED1C24] text-white rounded-lg hover:bg-[#c71920] transition font-bold flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Zone
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6">
        <SearchBar placeholder="Search zones by name or code..." />
        <DataTable data={data} type="zones" />
      </div>

      {showModal && <Modal title="Add New Zone" onClose={() => setShowModal(false)} />}
    </div>
  );
}

// ============================================================================
// VENDORS MODULE
// ============================================================================
function VendorsModule({ data }) {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#4D4D4D]">Vendor Management</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-[#ED1C24] text-white rounded-lg hover:bg-[#c71920] transition font-bold flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Vendor
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <SearchBar placeholder="Search vendors by company, GSTIN, or code..." />
          <select className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED1C24] focus:border-transparent font-semibold">
            <option>All Status</option>
            <option>Verified</option>
            <option>Pending</option>
            <option>Rejected</option>
            <option>Suspended</option>
          </select>
        </div>
        <DataTable data={data} type="vendors" />
      </div>

      {showModal && <Modal title="Add New Vendor" onClose={() => setShowModal(false)} />}
    </div>
  );
}

// ============================================================================
// PRODUCTS MODULE
// ============================================================================
function ProductsModule({ data }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#4D4D4D]">Products (SKUs)</h1>
        <button className="px-5 py-2.5 bg-[#ED1C24] text-white rounded-lg hover:bg-[#c71920] transition font-bold flex items-center gap-2 shadow-md hover:shadow-lg">
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6">
        <SearchBar placeholder="Search products by SKU, name, or category..." />
        <DataTable data={data} type="products" />
      </div>
    </div>
  );
}

// ============================================================================
// ORDERS MODULE
// ============================================================================
function OrdersModule({ data }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#4D4D4D] mb-6">All Orders</h1>
      
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[300px]">
            <SearchBar placeholder="Search orders by number, buyer, or vendor..." />
          </div>
          <select className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED1C24] font-semibold">
            <option>All Status</option>
            <option>Pending</option>
            <option>Confirmed</option>
            <option>Dispatched</option>
            <option>Delivered</option>
          </select>
          <select className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED1C24] font-semibold">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>Custom Range</option>
          </select>
        </div>
        <DataTable data={data} type="orders" />
      </div>
    </div>
  );
}

// ============================================================================
// DEALERS MODULE
// ============================================================================
function DealersModule({ data }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#4D4D4D]">Dealer Management</h1>
        <button className="px-5 py-2.5 bg-[#ED1C24] text-white rounded-lg hover:bg-[#c71920] transition font-bold flex items-center gap-2 shadow-md hover:shadow-lg">
          <Plus className="w-5 h-5" />
          Add Dealer
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6">
        <SearchBar placeholder="Search dealers by company or code..." />
        <DataTable data={data} type="dealers" />
      </div>
    </div>
  );
}

// ============================================================================
// COUPONS MODULE
// ============================================================================
function CouponsModule() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    code: '', description: '', discount_type: 'percentage',
    discount_value: '', min_order_amount: '', max_discount: '',
    usage_limit: '', valid_from: '', valid_until: ''
  });
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/coupons`);
      const json = await res.json();
      setCoupons(json.data || json || []);
    } catch (err) { console.error('Error fetching coupons:', err); }
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const openCreate = () => {
    setForm({ code: '', description: '', discount_type: 'percentage', discount_value: '', min_order_amount: '', max_discount: '', usage_limit: '', valid_from: '', valid_until: '' });
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (c) => {
    setForm({
      code: c.code || '', description: c.description || '', discount_type: c.discount_type || 'percentage',
      discount_value: c.discount_value || '', min_order_amount: c.min_order_amount || '',
      max_discount: c.max_discount || '', usage_limit: c.usage_limit || '',
      valid_from: c.valid_from ? c.valid_from.slice(0, 10) : '',
      valid_until: c.valid_until ? c.valid_until.slice(0, 10) : ''
    });
    setEditId(c.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `${API_BASE_URL}/coupons/${editId}` : `${API_BASE_URL}/coupons`;
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      setShowModal(false);
      fetchCoupons();
    } catch (err) { console.error('Error saving coupon:', err); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await fetch(`${API_BASE_URL}/coupons/${id}`, { method: 'DELETE' });
      fetchCoupons();
    } catch (err) { console.error('Error deleting coupon:', err); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#4D4D4D]">Coupons</h1>
        <button onClick={openCreate} className="px-5 py-2.5 bg-[#ED1C24] text-white rounded-lg hover:bg-[#c71920] transition font-bold flex items-center gap-2 shadow-md hover:shadow-lg">
          <Plus className="w-5 h-5" /> Add Coupon
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No coupons found. Click "Add Coupon" to create one.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  {['Code', 'Description', 'Type', 'Value', 'Min Order', 'Max Disc.', 'Usage', 'Valid Until', 'Status', 'Actions'].map((h, i) => (
                    <th key={i} className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{c.code}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate">{c.description || '-'}</td>
                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${c.discount_type === 'percentage' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{c.discount_type}</span></td>
                    <td className="px-6 py-4 font-bold text-[#ED1C24]">{c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${Number(c.discount_value).toLocaleString('en-IN')}`}</td>
                    <td className="px-6 py-4">₹{Number(c.min_order_amount || 0).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">{c.max_discount ? `₹${Number(c.max_discount).toLocaleString('en-IN')}` : '-'}</td>
                    <td className="px-6 py-4">{c.used_count || 0}/{c.usage_limit || '∞'}</td>
                    <td className="px-6 py-4 text-gray-600">{c.valid_until ? new Date(c.valid_until).toLocaleDateString('en-IN') : '-'}</td>
                    <td className="px-6 py-4"><StatusBadge status={c.is_active ? 'active' : 'rejected'} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(c)} className="p-2.5 text-green-600 hover:bg-green-50 rounded-lg transition-all hover:scale-110" title="Edit"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(c.id)} className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-all hover:scale-110" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b-2 border-gray-200">
              <h2 className="text-2xl font-bold text-[#4D4D4D]">{editId ? 'Edit Coupon' : 'Add Coupon'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-all hover:rotate-90"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Code *</label>
                <input value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24] focus:border-transparent" placeholder="e.g. SAVE20" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Discount Type</label>
                <select value={form.discount_type} onChange={e => setForm({...form, discount_type: e.target.value})} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24] focus:border-transparent">
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat Amount</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24] focus:border-transparent" placeholder="Coupon description" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Discount Value *</label>
                <input type="number" value={form.discount_value} onChange={e => setForm({...form, discount_value: e.target.value})} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24] focus:border-transparent" placeholder={form.discount_type === 'percentage' ? '10' : '500'} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Min Order Amount</label>
                <input type="number" value={form.min_order_amount} onChange={e => setForm({...form, min_order_amount: e.target.value})} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24] focus:border-transparent" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Max Discount</label>
                <input type="number" value={form.max_discount} onChange={e => setForm({...form, max_discount: e.target.value})} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24] focus:border-transparent" placeholder="No limit" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Usage Limit</label>
                <input type="number" value={form.usage_limit} onChange={e => setForm({...form, usage_limit: e.target.value})} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24] focus:border-transparent" placeholder="Unlimited" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Valid From</label>
                <input type="date" value={form.valid_from} onChange={e => setForm({...form, valid_from: e.target.value})} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Valid Until</label>
                <input type="date" value={form.valid_until} onChange={e => setForm({...form, valid_until: e.target.value})} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24] focus:border-transparent" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t-2 border-gray-200 bg-gray-50">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition font-bold">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-[#ED1C24] text-white rounded-lg hover:bg-[#c71920] transition font-bold shadow-md disabled:opacity-50">
                {saving ? 'Saving...' : editId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ADMIN USERS MODULE
// ============================================================================
function AdminUsersModule() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin-users`);
      const json = await res.json();
      setUsers(json.data || json || []);
    } catch (err) { console.error('Error fetching admin users:', err); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => {
    setForm({ firstName: '', lastName: '', email: '', phone: '', password: '' });
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (u) => {
    setForm({
      firstName: u.first_name || '', lastName: u.last_name || '',
      email: u.email || '', phone: u.phone || '', password: ''
    });
    setEditId(u.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `${API_BASE_URL}/admin-users/${editId}` : `${API_BASE_URL}/admin-users`;
      const body = { ...form };
      if (editId && !body.password) delete body.password;
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      setShowModal(false);
      fetchUsers();
    } catch (err) { console.error('Error saving admin user:', err); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this admin user?')) return;
    try {
      await fetch(`${API_BASE_URL}/admin-users/${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (err) { console.error('Error deleting admin user:', err); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#4D4D4D]">Admin Users</h1>
        <button onClick={openCreate} className="px-5 py-2.5 bg-[#ED1C24] text-white rounded-lg hover:bg-[#c71920] transition font-bold flex items-center gap-2 shadow-md hover:shadow-lg">
          <Plus className="w-5 h-5" /> Add Admin User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading admin users...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No admin users found. Click "Add Admin User" to create one.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  {['Name', 'Email', 'Phone', 'Roles', 'Status', 'Last Login', 'Actions'].map((h, i) => (
                    <th key={i} className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{u.first_name} {u.last_name || ''}</td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4 text-gray-600">{u.phone || '-'}</td>
                    <td className="px-6 py-4">
                      {(u.roles || []).map((r, i) => (
                        <span key={i} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold mr-1">{r}</span>
                      ))}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={u.is_active ? 'active' : 'rejected'} /></td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{u.last_login_at ? new Date(u.last_login_at).toLocaleDateString('en-IN') : 'Never'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(u)} className="p-2.5 text-green-600 hover:bg-green-50 rounded-lg transition-all hover:scale-110" title="Edit"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(u.id)} className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-all hover:scale-110" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b-2 border-gray-200">
              <h2 className="text-2xl font-bold text-[#4D4D4D]">{editId ? 'Edit Admin User' : 'Add Admin User'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-all hover:rotate-90"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">First Name *</label>
                  <input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Last Name</label>
                  <input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24] focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{editId ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24] focus:border-transparent" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t-2 border-gray-200 bg-gray-50">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition font-bold">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-[#ED1C24] text-white rounded-lg hover:bg-[#c71920] transition font-bold shadow-md disabled:opacity-50">
                {saving ? 'Saving...' : editId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PLACEHOLDER MODULES (Will be fully implemented in project files)
// ============================================================================
const CategoriesModule = () => <ModulePlaceholder title="Categories" icon={Boxes} description="Product category management with nested hierarchies" />;
const BrandsModule = () => <ModulePlaceholder title="Brands" icon={Tag} description="Brand catalog and vendor associations" />;
const PricingModule = () => <ModulePlaceholder title="Pricing Approvals" icon={DollarSign} description="Review and approve vendor pricing submissions with tier structures" />;
const CreditApprovalsModule = () => <ModulePlaceholder title="Credit Approvals" icon={CreditCard} description="Dealer credit limit requests and approvals" />;
const PendingApprovalsModule = () => <ModulePlaceholder title="Pending Approvals" icon={AlertCircle} description="Orders awaiting dealer or admin approval" />;
const DispatchesModule = () => <ModulePlaceholder title="Dispatches" icon={Truck} description="Dispatch management with e-way bills and delivery tracking" />;
const DisputesModule = () => <ModulePlaceholder title="Disputes" icon={AlertTriangle} description="Handle damaged goods, quantity mismatches, and quality issues" />;
const PaymentsModule = () => <ModulePlaceholder title="Payments" icon={Receipt} description="Payment tracking for orders, dealers, and vendor settlements" />;
const SettlementsModule = () => <ModulePlaceholder title="Settlements" icon={FileText} description="Vendor payment settlements and commission calculations" />;

function ModulePlaceholder({ title, icon: Icon, description }) {
  return (
    <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl shadow-md border-2 border-dashed border-gray-200">
      <div className="p-6 bg-gray-50 rounded-full mb-4">
        <Icon className="w-16 h-16 text-gray-300" />
      </div>
      <h2 className="text-2xl font-bold text-gray-400 mb-2">{title} Module</h2>
      <p className="text-gray-500 text-center max-w-md">{description}</p>
      <p className="text-sm text-[#ED1C24] font-semibold mt-4">✓ Full implementation in project files</p>
    </div>
  );
}

// ============================================================================
// DATA TABLE COMPONENT
// ============================================================================
function DataTable({ data, type }) {
  const renderRow = (item) => {
    switch(type) {
      case 'zones':
        return (
          <>
            <td className="px-6 py-4 font-bold text-gray-900">{item.code}</td>
            <td className="px-6 py-4 font-semibold">{item.name}</td>
            <td className="px-6 py-4 text-gray-600">{item.pincodes} pincodes</td>
            <td className="px-6 py-4">{item.vendor}</td>
            <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
            <td className="px-6 py-4"><ActionButtons /></td>
          </>
        );
      case 'vendors':
        return (
          <>
            <td className="px-6 py-4 font-bold text-gray-900">{item.code}</td>
            <td className="px-6 py-4 font-semibold">{item.company}</td>
            <td className="px-6 py-4 font-mono text-sm text-gray-600">{item.gstin}</td>
            <td className="px-6 py-4">{item.contact}</td>
            <td className="px-6 py-4">{item.zones} zones</td>
            <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
            <td className="px-6 py-4"><ActionButtons /></td>
          </>
        );
      case 'products':
        return (
          <>
            <td className="px-6 py-4 font-mono text-sm font-bold text-gray-900">{item.sku}</td>
            <td className="px-6 py-4 font-semibold">{item.name}</td>
            <td className="px-6 py-4">{item.category}</td>
            <td className="px-6 py-4">{item.brand}</td>
            <td className="px-6 py-4 font-bold text-[#ED1C24]">₹{item.price.toLocaleString()}</td>
            <td className="px-6 py-4 font-semibold">{item.stock}</td>
            <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
            <td className="px-6 py-4"><ActionButtons /></td>
          </>
        );
      case 'orders':
        return (
          <>
            <td className="px-6 py-4 font-bold text-gray-900">{item.number}</td>
            <td className="px-6 py-4 font-semibold">{item.buyer}</td>
            <td className="px-6 py-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                item.type === 'dealer' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {item.type}
              </span>
            </td>
            <td className="px-6 py-4 font-bold text-[#ED1C24]">₹{item.amount.toLocaleString()}</td>
            <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
            <td className="px-6 py-4 text-gray-600">{item.date}</td>
            <td className="px-6 py-4"><ActionButtons /></td>
          </>
        );
      case 'dealers':
        return (
          <>
            <td className="px-6 py-4 font-bold text-gray-900">{item.code}</td>
            <td className="px-6 py-4 font-semibold">{item.company}</td>
            <td className="px-6 py-4 font-mono text-sm text-gray-600">{item.gstin}</td>
            <td className="px-6 py-4 font-bold text-green-600">₹{(item.creditLimit / 100000).toFixed(1)}L</td>
            <td className="px-6 py-4 font-bold text-blue-600">₹{(item.available / 100000).toFixed(1)}L</td>
            <td className="px-6 py-4 font-semibold">{item.orders}</td>
            <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
            <td className="px-6 py-4"><ActionButtons /></td>
          </>
        );
      default:
        return null;
    }
  };

  const headers = {
    zones: ['Zone Code', 'Zone Name', 'Pincodes', 'Assigned Vendor', 'Status', 'Actions'],
    vendors: ['Vendor Code', 'Company Name', 'GSTIN', 'Contact', 'Zones', 'Status', 'Actions'],
    products: ['SKU Code', 'Product Name', 'Category', 'Brand', 'Price', 'Stock', 'Status', 'Actions'],
    orders: ['Order Number', 'Buyer', 'Type', 'Amount', 'Status', 'Date', 'Actions'],
    dealers: ['Dealer Code', 'Company', 'GSTIN', 'Credit Limit', 'Available', 'Orders', 'Status', 'Actions']
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            {headers[type]?.map((header, idx) => (
              <th key={idx} className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              {renderRow(item)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================
function StatusBadge({ status }) {
  const styles = {
    active: 'bg-green-100 text-green-800 border-green-300',
    verified: 'bg-green-100 text-green-800 border-green-300',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
    dispatched: 'bg-purple-100 text-purple-800 border-purple-300',
    approved: 'bg-green-100 text-green-800 border-green-300',
    rejected: 'bg-red-100 text-red-800 border-red-300'
  };

  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase border-2 ${styles[status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
      {status}
    </span>
  );
}

function ActionButtons() {
  return (
    <div className="flex items-center gap-2">
      <button className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all hover:scale-110" title="View Details">
        <Eye className="w-4 h-4" />
      </button>
      <button className="p-2.5 text-green-600 hover:bg-green-50 rounded-lg transition-all hover:scale-110" title="Edit">
        <Edit2 className="w-4 h-4" />
      </button>
      <button className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-all hover:scale-110" title="Delete">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function SearchBar({ placeholder }) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED1C24] focus:border-transparent font-medium"
      />
    </div>
  );
}

function Modal({ title, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200">
          <h2 className="text-2xl font-bold text-[#4D4D4D]">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-all hover:rotate-90">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800 font-semibold">
              ℹ️ Full form implementation available in downloadable project files
            </p>
          </div>
          <p className="text-gray-600">
            Complete CRUD forms with validation, file uploads, and real-time feedback will be included in the full React project structure.
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t-2 border-gray-200 bg-gray-50">
          <button onClick={onClose} className="px-5 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition font-bold">
            Cancel
          </button>
          <button className="px-5 py-2.5 bg-[#ED1C24] text-white rounded-lg hover:bg-[#c71920] transition font-bold shadow-md">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center h-96">
      <div className="relative">
        <div className="animate-spin rounded-full h-20 w-20 border-4 border-[#ED1C24] border-t-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-[#4D4D4D] border-2 border-white"></div>
        </div>
      </div>
      <p className="mt-6 text-gray-600 font-semibold">Loading Material King...</p>
    </div>
  );
}
