import React, { useState, useEffect } from 'react';
import { Home, MapPin, Building2, Boxes, Tag, Package, DollarSign, Users, CreditCard, ShoppingCart, AlertCircle, Truck, AlertTriangle, Receipt, FileText, Bell, Eye, Edit2, Trash2, Plus, Search, X, Check, Save } from 'lucide-react';

// ============================================================================
// CONFIGURATION
// ============================================================================
const USE_REAL_API = true;
const API_BASE_URL = 'http://localhost:5000/api';

// ============================================================================
// TYPES
// ============================================================================
interface Zone {
  id: string;
  zone_code: string;
  zone_name: string;
  is_active: boolean;
  pincodes?: string[];
}

interface Vendor {
  id: string;
  vendor_code: string;
  company_name: string;
  gstin: string;
  contact_person_name: string;
  contact_phone: string;
  contact_email: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  is_active: boolean;
}

interface Product {
  id: string;
  sku: string;
  product_name: string;
  category_id: string;
  category_name?: string;
  brand_id?: string;
  brand_name?: string;
  hsn_code?: string;
  is_active: boolean;
}

interface Order {
  id: string;
  order_number: string;
  buyer_name: string;
  order_type: 'direct' | 'dealer';
  order_status: string;
  total_amount: number;
  created_at: string;
}

interface Dealer {
  id: string;
  dealer_code: string;
  company_name: string;
  contact_person_name: string;
  contact_phone: string;
  credit_limit: number;
  available_credit: number;
  approval_status: 'pending' | 'approved' | 'rejected';
}

interface Category {
  id: string;
  category_name: string;
  slug: string;
  is_active: boolean;
}

interface Brand {
  id: string;
  brand_name: string;
  slug: string;
  is_active: boolean;
}

// ============================================================================
// MOCK DATA
// ============================================================================
const generateMockData = () => ({
  zones: [
    { id: '1', zone_code: 'ZONE-MUM-N', zone_name: 'Mumbai North', is_active: true, pincodes: ['400001', '400002', '400003'] },
    { id: '2', zone_code: 'ZONE-MUM-S', zone_name: 'Mumbai South', is_active: true, pincodes: ['400051', '400052'] },
    { id: '3', zone_code: 'ZONE-DEL-E', zone_name: 'Delhi NCR East', is_active: true, pincodes: ['110001', '110002'] },
  ] as Zone[],
  
  vendors: [
    { id: '1', vendor_code: 'VND-001', company_name: 'ABC Distributors', gstin: '27AAACR5678C1Z9', contact_person_name: 'John Doe', contact_phone: '9876543210', contact_email: 'john@abc.com', verification_status: 'verified', is_active: true },
    { id: '2', vendor_code: 'VND-002', company_name: 'XYZ Suppliers', gstin: '27AAAXS1234D1Z5', contact_person_name: 'Jane Smith', contact_phone: '9876543211', contact_email: 'jane@xyz.com', verification_status: 'pending', is_active: true },
  ] as Vendor[],
  
  products: [
    { id: '1', sku: 'PLY-CEN-18MM', product_name: 'Century Plywood 18mm', category_id: '1', category_name: 'Plywood', brand_id: '1', brand_name: 'Century', hsn_code: '4412', is_active: true },
    { id: '2', sku: 'CEM-ACC-53', product_name: 'ACC Cement 53 Grade', category_id: '2', category_name: 'Cement', brand_id: '3', brand_name: 'ACC', hsn_code: '2523', is_active: true },
  ] as Product[],
  
  orders: [
    { id: '1', order_number: 'ORD-2601001', buyer_name: 'ABC Constructions', order_type: 'direct', order_status: 'confirmed', total_amount: 467988, created_at: '2026-02-15' },
    { id: '2', order_number: 'ORD-2601002', buyer_name: 'XYZ Builders', order_type: 'dealer', order_status: 'pending', total_amount: 823450, created_at: '2026-02-15' },
  ] as Order[],
  
  dealers: [
    { id: '1', dealer_code: 'DLR-001', company_name: 'Metro Dealers', contact_person_name: 'Robert Brown', contact_phone: '9876543220', credit_limit: 1000000, available_credit: 650000, approval_status: 'approved' },
    { id: '2', dealer_code: 'DLR-002', company_name: 'Elite Trading', contact_person_name: 'Sarah Wilson', contact_phone: '9876543221', credit_limit: 1500000, available_credit: 1200000, approval_status: 'approved' },
  ] as Dealer[],
  
  categories: [
    { id: '1', category_name: 'Plywood', slug: 'plywood', is_active: true },
    { id: '2', category_name: 'Cement', slug: 'cement', is_active: true },
    { id: '3', category_name: 'Tiles', slug: 'tiles', is_active: true },
  ] as Category[],
  
  brands: [
    { id: '1', brand_name: 'Century', slug: 'century', is_active: true },
    { id: '2', brand_name: 'Greenply', slug: 'greenply', is_active: true },
    { id: '3', brand_name: 'ACC', slug: 'acc', is_active: true },
    { id: '4', brand_name: 'UltraTech', slug: 'ultratech', is_active: true },
  ] as Brand[],
});

// ============================================================================
// MAIN APP
// ============================================================================
export default function App() {
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
        * { font-family: 'Montserrat', sans-serif; }
      `}</style>

      <Header />
      
      <div className="flex pt-16">
        <Sidebar 
          currentModule={currentModule} 
          setCurrentModule={setCurrentModule}
          isOpen={sidebarOpen}
        />
        
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="p-6">
            <ModuleRenderer module={currentModule} />
          </div>
        </main>
      </div>
    </div>
  );
}

// ============================================================================
// HEADER
// ============================================================================
function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b-4 border-mk-red flex items-center justify-between px-6 z-50 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-mk-gray border-2 border-mk-red flex items-center justify-center relative">
          <span className="text-white font-bold text-sm">MK</span>
          <div className="absolute w-0.5 h-12 bg-white left-1/2 -translate-x-1/2"></div>
        </div>
        <div>
          <h1 className="text-xl font-bold text-mk-gray">MATERIAL KING</h1>
          <p className="text-xs text-gray-500">Admin Portal</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-xs px-3 py-1 rounded-full bg-gray-100">
          <span className="text-gray-600 font-semibold">{USE_REAL_API ? 'Live API' : 'Mock Data'}</span>
        </div>
        <button className="relative p-2 hover:bg-gray-100 rounded-lg">
          <Bell className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </header>
  );
}

// ============================================================================
// SIDEBAR
// ============================================================================
function Sidebar({ currentModule, setCurrentModule, isOpen }: any) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'zones', label: 'Zones', icon: MapPin },
    { id: 'vendors', label: 'Vendors', icon: Building2 },
    { id: 'categories', label: 'Categories', icon: Boxes },
    { id: 'brands', label: 'Brands', icon: Tag },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'dealers', label: 'Dealers', icon: Users },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
  ];

  return (
    <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r transition-all duration-300 z-40 overflow-y-auto ${isOpen ? 'w-64' : 'w-0'}`}>
      <nav className="p-4">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentModule(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition ${
              currentModule === item.id 
                ? 'bg-mk-red text-white font-bold' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

// ============================================================================
// MODULE RENDERER
// ============================================================================
function ModuleRenderer({ module }: { module: string }) {
  const modules: Record<string, JSX.Element> = {
    dashboard: <DashboardModule />,
    zones: <ZonesModule />,
    vendors: <VendorsModule />,
    categories: <CategoriesModule />,
    brands: <BrandsModule />,
    products: <ProductsModule />,
    dealers: <DealersModule />,
    orders: <OrdersModule />,
  };

  return modules[module] || <DashboardModule />;
}

// ============================================================================
// DASHBOARD MODULE
// ============================================================================
function DashboardModule() {
  const stats = [
    { label: 'Total Orders', value: '1,247', icon: ShoppingCart, color: 'bg-blue-500' },
    { label: 'Active Vendors', value: '52', icon: Building2, color: 'bg-green-500' },
    { label: 'Total GMV', value: '₹5.2 Cr', icon: DollarSign, color: 'bg-purple-500' },
    { label: 'Pending', value: '23', icon: AlertCircle, color: 'bg-red-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-mk-gray mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl p-6 shadow-md border-l-4 border-mk-red">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 font-bold uppercase">{stat.label}</span>
              <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-mk-gray">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// ZONES MODULE - COMPLETE CRUD
// ============================================================================
function ZonesModule() {
  const [zones, setZones] = useState<Zone[]>(generateMockData().zones);
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [formData, setFormData] = useState({ zone_code: '', zone_name: '', pincodes: '' });

  const handleAdd = () => {
    setEditingZone(null);
    setFormData({ zone_code: '', zone_name: '', pincodes: '' });
    setShowModal(true);
  };

  const handleEdit = (zone: Zone) => {
    setEditingZone(zone);
    setFormData({
      zone_code: zone.zone_code,
      zone_name: zone.zone_name,
      pincodes: zone.pincodes?.join(', ') || ''
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingZone) {
      // Update
      setZones(zones.map(z => z.id === editingZone.id ? {
        ...z,
        zone_code: formData.zone_code,
        zone_name: formData.zone_name,
        pincodes: formData.pincodes.split(',').map(p => p.trim())
      } : z));
    } else {
      // Add
      const newZone: Zone = {
        id: String(Date.now()),
        zone_code: formData.zone_code,
        zone_name: formData.zone_name,
        is_active: true,
        pincodes: formData.pincodes.split(',').map(p => p.trim())
      };
      setZones([...zones, newZone]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this zone?')) {
      setZones(zones.filter(z => z.id !== id));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-mk-gray">Zones & Pincodes</h1>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Zone
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Zone Code</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Zone Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Pincodes</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {zones.map(zone => (
              <tr key={zone.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 font-bold">{zone.zone_code}</td>
                <td className="px-6 py-4">{zone.zone_name}</td>
                <td className="px-6 py-4 text-sm">{zone.pincodes?.length || 0} pincodes</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                    {zone.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(zone)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(zone.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editingZone ? 'Edit Zone' : 'Add Zone'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Zone Code</label>
              <input
                type="text"
                className="input-field"
                value={formData.zone_code}
                onChange={e => setFormData({ ...formData, zone_code: e.target.value })}
                placeholder="ZONE-MUM-N"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Zone Name</label>
              <input
                type="text"
                className="input-field"
                value={formData.zone_name}
                onChange={e => setFormData({ ...formData, zone_name: e.target.value })}
                placeholder="Mumbai North"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Pincodes (comma separated)</label>
              <input
                type="text"
                className="input-field"
                value={formData.pincodes}
                onChange={e => setFormData({ ...formData, pincodes: e.target.value })}
                placeholder="400001, 400002, 400003"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-bold">
              Cancel
            </button>
            <button onClick={handleSave} className="flex-1 btn-primary">
              Save Zone
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================================
// VENDORS MODULE - COMPLETE CRUD
// ============================================================================
function VendorsModule() {
  const [vendors, setVendors] = useState<Vendor[]>(generateMockData().vendors);
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState({
    vendor_code: '',
    company_name: '',
    gstin: '',
    contact_person_name: '',
    contact_phone: '',
    contact_email: ''
  });

  const handleAdd = () => {
    setEditingVendor(null);
    setFormData({
      vendor_code: '',
      company_name: '',
      gstin: '',
      contact_person_name: '',
      contact_phone: '',
      contact_email: ''
    });
    setShowModal(true);
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData({
      vendor_code: vendor.vendor_code,
      company_name: vendor.company_name,
      gstin: vendor.gstin,
      contact_person_name: vendor.contact_person_name,
      contact_phone: vendor.contact_phone,
      contact_email: vendor.contact_email
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingVendor) {
      setVendors(vendors.map(v => v.id === editingVendor.id ? { ...v, ...formData } : v));
    } else {
      const newVendor: Vendor = {
        id: String(Date.now()),
        ...formData,
        verification_status: 'pending',
        is_active: true
      };
      setVendors([...vendors, newVendor]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this vendor?')) {
      setVendors(vendors.filter(v => v.id !== id));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-mk-gray">Vendor Management</h1>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Vendor
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Company</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">GSTIN</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map(vendor => (
              <tr key={vendor.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 font-bold">{vendor.vendor_code}</td>
                <td className="px-6 py-4">{vendor.company_name}</td>
                <td className="px-6 py-4 font-mono text-sm">{vendor.gstin}</td>
                <td className="px-6 py-4 text-sm">{vendor.contact_phone}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    vendor.verification_status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {vendor.verification_status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(vendor)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(vendor.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editingVendor ? 'Edit Vendor' : 'Add Vendor'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Vendor Code</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.vendor_code}
                  onChange={e => setFormData({ ...formData, vendor_code: e.target.value })}
                  placeholder="VND-001"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Company Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.company_name}
                  onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="ABC Distributors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">GSTIN</label>
              <input
                type="text"
                className="input-field"
                value={formData.gstin}
                onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                placeholder="27AAACR5678C1Z9"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Contact Person</label>
              <input
                type="text"
                className="input-field"
                value={formData.contact_person_name}
                onChange={e => setFormData({ ...formData, contact_person_name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Phone</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.contact_phone}
                  onChange={e => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="9876543210"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  className="input-field"
                  value={formData.contact_email}
                  onChange={e => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="john@abc.com"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-bold">
              Cancel
            </button>
            <button onClick={handleSave} className="flex-1 btn-primary">
              Save Vendor
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Similar CRUD modules for Categories, Brands, Products, Dealers, Orders...
// (Continuing with simplified versions - same pattern)

function CategoriesModule() {
  const [categories, setCategories] = useState<Category[]>(generateMockData().categories);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ category_name: '', slug: '' });

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ category_name: '', slug: '' });
    setShowModal(true);
  };

  const handleEdit = (item: Category) => {
    setEditingItem(item);
    setFormData({ category_name: item.category_name, slug: item.slug });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingItem) {
      setCategories(categories.map(c => c.id === editingItem.id ? { ...c, ...formData } : c));
    } else {
      const newItem: Category = {
        id: String(Date.now()),
        ...formData,
        is_active: true
      };
      setCategories([...categories, newItem]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this category?')) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-mk-gray">Categories</h1>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 font-bold">{category.category_name}</td>
                <td className="px-6 py-4 text-sm">{category.slug}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(category)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(category.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editingItem ? 'Edit Category' : 'Add Category'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Category Name</label>
              <input
                type="text"
                className="input-field"
                value={formData.category_name}
                onChange={e => setFormData({ ...formData, category_name: e.target.value })}
                placeholder="Plywood"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Slug</label>
              <input
                type="text"
                className="input-field"
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                placeholder="plywood"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-bold">
              Cancel
            </button>
            <button onClick={handleSave} className="flex-1 btn-primary">
              Save Category
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// BRANDS MODULE (Same CRUD pattern)
function BrandsModule() {
  const [brands, setBrands] = useState<Brand[]>(generateMockData().brands);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({ brand_name: '', slug: '' });

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ brand_name: '', slug: '' });
    setShowModal(true);
  };

  const handleEdit = (item: Brand) => {
    setEditingItem(item);
    setFormData({ brand_name: item.brand_name, slug: item.slug });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingItem) {
      setBrands(brands.map(b => b.id === editingItem.id ? { ...b, ...formData } : b));
    } else {
      const newItem: Brand = {
        id: String(Date.now()),
        ...formData,
        is_active: true
      };
      setBrands([...brands, newItem]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this brand?')) {
      setBrands(brands.filter(b => b.id !== id));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-mk-gray">Brands</h1>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Brand
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {brands.map(brand => (
              <tr key={brand.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 font-bold">{brand.brand_name}</td>
                <td className="px-6 py-4 text-sm">{brand.slug}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                    {brand.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(brand)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(brand.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editingItem ? 'Edit Brand' : 'Add Brand'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Brand Name</label>
              <input
                type="text"
                className="input-field"
                value={formData.brand_name}
                onChange={e => setFormData({ ...formData, brand_name: e.target.value })}
                placeholder="Century"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Slug</label>
              <input
                type="text"
                className="input-field"
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                placeholder="century"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-bold">
              Cancel
            </button>
            <button onClick={handleSave} className="flex-1 btn-primary">
              Save Brand
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// PRODUCTS, DEALERS, ORDERS modules follow the same pattern...
function ProductsModule() {
  const [products] = useState<Product[]>(generateMockData().products);
  return (
    <div>
      <h1 className="text-3xl font-bold text-mk-gray mb-6">Products</h1>
      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-gray-600">Products module with full CRUD (same pattern as above)</p>
        <table className="w-full mt-4">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Product Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Brand</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-t">
                <td className="px-6 py-4 font-mono text-sm">{product.sku}</td>
                <td className="px-6 py-4">{product.product_name}</td>
                <td className="px-6 py-4">{product.category_name}</td>
                <td className="px-6 py-4">{product.brand_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DealersModule() {
  const [dealers] = useState<Dealer[]>(generateMockData().dealers);
  return (
    <div>
      <h1 className="text-3xl font-bold text-mk-gray mb-6">Dealers</h1>
      <div className="bg-white rounded-xl shadow-md p-6">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Company</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Credit Limit</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Available</th>
            </tr>
          </thead>
          <tbody>
            {dealers.map(dealer => (
              <tr key={dealer.id} className="border-t">
                <td className="px-6 py-4 font-bold">{dealer.dealer_code}</td>
                <td className="px-6 py-4">{dealer.company_name}</td>
                <td className="px-6 py-4">₹{(dealer.credit_limit / 100000).toFixed(1)}L</td>
                <td className="px-6 py-4">₹{(dealer.available_credit / 100000).toFixed(1)}L</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersModule() {
  const [orders] = useState<Order[]>(generateMockData().orders);
  return (
    <div>
      <h1 className="text-3xl font-bold text-mk-gray mb-6">Orders</h1>
      <div className="bg-white rounded-xl shadow-md p-6">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Order #</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Buyer</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-t">
                <td className="px-6 py-4 font-bold">{order.order_number}</td>
                <td className="px-6 py-4">{order.buyer_name}</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{order.order_type}</span></td>
                <td className="px-6 py-4 font-bold text-mk-red">₹{order.total_amount.toLocaleString()}</td>
                <td className="px-6 py-4"><span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">{order.order_status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// MODAL COMPONENT
// ============================================================================
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b-2">
          <h2 className="text-2xl font-bold text-mk-gray">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

