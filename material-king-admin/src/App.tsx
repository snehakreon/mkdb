import React, { useState, useEffect } from 'react';
import { Home, MapPin, Building2, Boxes, Tag, Package, DollarSign, Users, CreditCard, ShoppingCart, AlertCircle, Truck, AlertTriangle, Receipt, FileText, Bell, Eye, Edit2, Trash2, Plus, Search, X, Check, Save, LogOut } from 'lucide-react';
import LoginPage from './auth/LoginPage';
import { zoneService } from './services/zone.service';
import { vendorService } from './services/vendor.service';
import { categoryService } from './services/category.service';
import { brandService } from './services/brand.service';
import { Zone, Vendor, Category, Brand, Product, Order, Dealer } from './types';
import { API_CONFIG } from './config/api.config';

// ============================================================================
// TYPES (extra interfaces not in types/index.ts)
// ============================================================================

interface AuthUser {
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

// ============================================================================
// MOCK DATA (only used for Products, Dealers, Orders that don't have API yet)
// ============================================================================
const generateMockData = () => ({
  products: [
    { id: '1', sku: 'PLY-CEN-18MM', product_name: 'Century Plywood 18mm', category_id: '1', category_name: 'Plywood', brand_id: '1', brand_name: 'Century', hsn_code: '4412', is_active: true },
    { id: '2', sku: 'CEM-ACC-53', product_name: 'ACC Cement 53 Grade', category_id: '2', category_name: 'Cement', brand_id: '3', brand_name: 'ACC', hsn_code: '2523', is_active: true },
  ] as Product[],
  orders: [
    { id: '1', order_number: 'ORD-2601001', buyer_name: 'ABC Constructions', order_type: 'direct' as const, order_status: 'confirmed', total_amount: 467988, created_at: '2026-02-15' },
    { id: '2', order_number: 'ORD-2601002', buyer_name: 'XYZ Builders', order_type: 'dealer' as const, order_status: 'pending', total_amount: 823450, created_at: '2026-02-15' },
  ] as Order[],
  dealers: [
    { id: '1', dealer_code: 'DLR-001', company_name: 'Metro Dealers', contact_person_name: 'Robert Brown', contact_phone: '9876543220', credit_limit: 1000000, available_credit: 650000, approval_status: 'approved' as const },
    { id: '2', dealer_code: 'DLR-002', company_name: 'Elite Trading', contact_person_name: 'Sarah Wilson', contact_phone: '9876543221', credit_limit: 1500000, available_credit: 1200000, approval_status: 'approved' as const },
  ] as Dealer[],
});

// ============================================================================
// MAIN APP WITH AUTH GATING
// ============================================================================
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [sidebarOpen] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const token = localStorage.getItem('mk_auth_token');
    const userJson = localStorage.getItem('mk_user');

    if (token && userJson) {
      try {
        const userData = JSON.parse(userJson);
        setUser(userData);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('mk_auth_token');
        localStorage.removeItem('mk_user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (token: string, userData: AuthUser) => {
    localStorage.setItem('mk_auth_token', token);
    localStorage.setItem('mk_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('mk_auth_token');
    localStorage.removeItem('mk_user');
    setUser(null);
    setIsAuthenticated(false);
    setCurrentModule('dashboard');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-mk-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading Material King...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Authenticated — show admin panel
  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
        * { font-family: 'Montserrat', sans-serif; }
      `}</style>

      <Header user={user} onLogout={handleLogout} />

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
// HEADER (with user info + logout)
// ============================================================================
function Header({ user, onLogout }: { user: AuthUser | null; onLogout: () => void }) {
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
        <div className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
          <span className="font-semibold">Live API</span>
        </div>
        <button className="relative p-2 hover:bg-gray-100 rounded-lg">
          <Bell className="w-5 h-5 text-gray-600" />
        </button>
        <div className="text-sm text-right">
          <p className="font-semibold text-gray-700">{user?.firstName} {user?.lastName}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-sm"
        >
          <LogOut className="w-4 h-4" />
          Logout
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
// LOADING SPINNER
// ============================================================================
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-mk-red border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

// ============================================================================
// ZONES MODULE - API-BACKED CRUD
// ============================================================================
function ZonesModule() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [formData, setFormData] = useState({ zone_code: '', zone_name: '', pincodes: '' });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try { const data = await zoneService.getAll(); setZones(data); }
    catch (err) { console.error('Failed to load zones:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleAdd = () => { setEditingZone(null); setFormData({ zone_code: '', zone_name: '', pincodes: '' }); setShowModal(true); };
  const handleEdit = (zone: Zone) => { setEditingZone(zone); setFormData({ zone_code: zone.zone_code, zone_name: zone.zone_name, pincodes: zone.pincodes?.join(', ') || '' }); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const pincodes = formData.pincodes.split(',').map(p => p.trim()).filter(Boolean);
      if (editingZone) { await zoneService.update(editingZone.id, { zone_code: formData.zone_code, zone_name: formData.zone_name, pincodes }); }
      else { await zoneService.create({ zone_code: formData.zone_code, zone_name: formData.zone_name, pincodes }); }
      await loadData(); setShowModal(false);
    } catch (err) { console.error('Save zone error:', err); alert('Failed to save zone.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this zone?')) {
      try { await zoneService.delete(id); await loadData(); }
      catch (err) { console.error('Delete zone error:', err); alert('Failed to delete zone.'); }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-mk-gray">Zones & Pincodes</h1>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Add Zone</button>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6">
        {zones.length === 0 ? <p className="text-gray-500 text-center py-8">No zones found. Add your first zone.</p> : (
          <table className="w-full">
            <thead className="bg-gray-50"><tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Zone Code</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Zone Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Pincodes</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Actions</th>
            </tr></thead>
            <tbody>{zones.map(zone => (
              <tr key={zone.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 font-bold">{zone.zone_code}</td>
                <td className="px-6 py-4">{zone.zone_name}</td>
                <td className="px-6 py-4 text-sm">{zone.pincodes?.length || 0} pincodes</td>
                <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${zone.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{zone.is_active ? 'Active' : 'Inactive'}</span></td>
                <td className="px-6 py-4"><div className="flex gap-2">
                  <button onClick={() => handleEdit(zone)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(zone.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
      {showModal && (
        <Modal title={editingZone ? 'Edit Zone' : 'Add Zone'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div><label className="block text-sm font-bold mb-2">Zone Code</label><input type="text" className="input-field" value={formData.zone_code} onChange={e => setFormData({ ...formData, zone_code: e.target.value })} placeholder="ZONE-MUM-N" /></div>
            <div><label className="block text-sm font-bold mb-2">Zone Name</label><input type="text" className="input-field" value={formData.zone_name} onChange={e => setFormData({ ...formData, zone_name: e.target.value })} placeholder="Mumbai North" /></div>
            <div><label className="block text-sm font-bold mb-2">Pincodes (comma separated)</label><input type="text" className="input-field" value={formData.pincodes} onChange={e => setFormData({ ...formData, pincodes: e.target.value })} placeholder="400001, 400002, 400003" /></div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-bold">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary disabled:opacity-50">{saving ? 'Saving...' : 'Save Zone'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================================
// VENDORS MODULE - API-BACKED CRUD
// ============================================================================
function VendorsModule() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState({ vendor_code: '', company_name: '', gstin: '', contact_person_name: '', contact_phone: '', contact_email: '' });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try { const data = await vendorService.getAll(); setVendors(data); }
    catch (err) { console.error('Failed to load vendors:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleAdd = () => { setEditingVendor(null); setFormData({ vendor_code: '', company_name: '', gstin: '', contact_person_name: '', contact_phone: '', contact_email: '' }); setShowModal(true); };
  const handleEdit = (vendor: Vendor) => { setEditingVendor(vendor); setFormData({ vendor_code: vendor.vendor_code, company_name: vendor.company_name, gstin: vendor.gstin, contact_person_name: vendor.contact_person_name, contact_phone: vendor.contact_phone, contact_email: vendor.contact_email }); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingVendor) { await vendorService.update(editingVendor.id, formData); }
      else { await vendorService.create(formData); }
      await loadData(); setShowModal(false);
    } catch (err) { console.error('Save vendor error:', err); alert('Failed to save vendor.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this vendor?')) {
      try { await vendorService.delete(id); await loadData(); }
      catch (err) { console.error('Delete vendor error:', err); alert('Failed to delete vendor.'); }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-mk-gray">Vendor Management</h1>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Add Vendor</button>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6">
        {vendors.length === 0 ? <p className="text-gray-500 text-center py-8">No vendors found. Add your first vendor.</p> : (
          <table className="w-full">
            <thead className="bg-gray-50"><tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Company</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">GSTIN</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Actions</th>
            </tr></thead>
            <tbody>{vendors.map(vendor => (
              <tr key={vendor.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 font-bold">{vendor.vendor_code}</td>
                <td className="px-6 py-4">{vendor.company_name}</td>
                <td className="px-6 py-4 font-mono text-sm">{vendor.gstin}</td>
                <td className="px-6 py-4 text-sm">{vendor.contact_phone}</td>
                <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${vendor.verification_status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{vendor.verification_status}</span></td>
                <td className="px-6 py-4"><div className="flex gap-2">
                  <button onClick={() => handleEdit(vendor)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(vendor.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
      {showModal && (
        <Modal title={editingVendor ? 'Edit Vendor' : 'Add Vendor'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-bold mb-2">Vendor Code</label><input type="text" className="input-field" value={formData.vendor_code} onChange={e => setFormData({ ...formData, vendor_code: e.target.value })} placeholder="VND-001" /></div>
              <div><label className="block text-sm font-bold mb-2">Company Name</label><input type="text" className="input-field" value={formData.company_name} onChange={e => setFormData({ ...formData, company_name: e.target.value })} placeholder="ABC Distributors" /></div>
            </div>
            <div><label className="block text-sm font-bold mb-2">GSTIN</label><input type="text" className="input-field" value={formData.gstin} onChange={e => setFormData({ ...formData, gstin: e.target.value })} placeholder="27AAACR5678C1Z9" /></div>
            <div><label className="block text-sm font-bold mb-2">Contact Person</label><input type="text" className="input-field" value={formData.contact_person_name} onChange={e => setFormData({ ...formData, contact_person_name: e.target.value })} placeholder="John Doe" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-bold mb-2">Phone</label><input type="text" className="input-field" value={formData.contact_phone} onChange={e => setFormData({ ...formData, contact_phone: e.target.value })} placeholder="9876543210" /></div>
              <div><label className="block text-sm font-bold mb-2">Email</label><input type="email" className="input-field" value={formData.contact_email} onChange={e => setFormData({ ...formData, contact_email: e.target.value })} placeholder="john@abc.com" /></div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-bold">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary disabled:opacity-50">{saving ? 'Saving...' : 'Save Vendor'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================================
// CATEGORIES MODULE - API-BACKED CRUD
// ============================================================================
function CategoriesModule() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ category_name: '', slug: '' });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try { const data = await categoryService.getAll(); setCategories(data); }
    catch (err) { console.error('Failed to load categories:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleAdd = () => { setEditingItem(null); setFormData({ category_name: '', slug: '' }); setShowModal(true); };
  const handleEdit = (item: Category) => { setEditingItem(item); setFormData({ category_name: item.category_name, slug: item.slug }); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingItem) { await categoryService.update(editingItem.id, formData); }
      else { await categoryService.create(formData); }
      await loadData(); setShowModal(false);
    } catch (err) { console.error('Save category error:', err); alert('Failed to save category.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this category?')) {
      try { await categoryService.delete(id); await loadData(); }
      catch (err) { console.error('Delete category error:', err); alert('Failed to delete category.'); }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-mk-gray">Categories</h1>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Add Category</button>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6">
        {categories.length === 0 ? <p className="text-gray-500 text-center py-8">No categories found. Add your first category.</p> : (
          <table className="w-full">
            <thead className="bg-gray-50"><tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Actions</th>
            </tr></thead>
            <tbody>{categories.map(cat => (
              <tr key={cat.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 font-bold">{cat.category_name}</td>
                <td className="px-6 py-4 text-sm">{cat.slug}</td>
                <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${cat.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{cat.is_active ? 'Active' : 'Inactive'}</span></td>
                <td className="px-6 py-4"><div className="flex gap-2">
                  <button onClick={() => handleEdit(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
      {showModal && (
        <Modal title={editingItem ? 'Edit Category' : 'Add Category'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div><label className="block text-sm font-bold mb-2">Category Name</label><input type="text" className="input-field" value={formData.category_name} onChange={e => setFormData({ ...formData, category_name: e.target.value })} placeholder="Plywood" /></div>
            <div><label className="block text-sm font-bold mb-2">Slug</label><input type="text" className="input-field" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="plywood" /></div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-bold">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary disabled:opacity-50">{saving ? 'Saving...' : 'Save Category'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================================
// BRANDS MODULE - API-BACKED CRUD
// ============================================================================
function BrandsModule() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({ brand_name: '', slug: '' });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try { const data = await brandService.getAll(); setBrands(data); }
    catch (err) { console.error('Failed to load brands:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleAdd = () => { setEditingItem(null); setFormData({ brand_name: '', slug: '' }); setShowModal(true); };
  const handleEdit = (item: Brand) => { setEditingItem(item); setFormData({ brand_name: item.brand_name, slug: item.slug }); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingItem) { await brandService.update(editingItem.id, formData); }
      else { await brandService.create(formData); }
      await loadData(); setShowModal(false);
    } catch (err) { console.error('Save brand error:', err); alert('Failed to save brand.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this brand?')) {
      try { await brandService.delete(id); await loadData(); }
      catch (err) { console.error('Delete brand error:', err); alert('Failed to delete brand.'); }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-mk-gray">Brands</h1>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Add Brand</button>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6">
        {brands.length === 0 ? <p className="text-gray-500 text-center py-8">No brands found. Add your first brand.</p> : (
          <table className="w-full">
            <thead className="bg-gray-50"><tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Actions</th>
            </tr></thead>
            <tbody>{brands.map(brand => (
              <tr key={brand.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 font-bold">{brand.brand_name}</td>
                <td className="px-6 py-4 text-sm">{brand.slug}</td>
                <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${brand.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{brand.is_active ? 'Active' : 'Inactive'}</span></td>
                <td className="px-6 py-4"><div className="flex gap-2">
                  <button onClick={() => handleEdit(brand)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(brand.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
      {showModal && (
        <Modal title={editingItem ? 'Edit Brand' : 'Add Brand'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div><label className="block text-sm font-bold mb-2">Brand Name</label><input type="text" className="input-field" value={formData.brand_name} onChange={e => setFormData({ ...formData, brand_name: e.target.value })} placeholder="Century" /></div>
            <div><label className="block text-sm font-bold mb-2">Slug</label><input type="text" className="input-field" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="century" /></div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-bold">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary disabled:opacity-50">{saving ? 'Saving...' : 'Save Brand'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================================
// PRODUCTS MODULE (read-only for now - mock data)
// ============================================================================
function ProductsModule() {
  const [products] = useState<Product[]>(generateMockData().products);
  return (
    <div>
      <h1 className="text-3xl font-bold text-mk-gray mb-6">Products</h1>
      <div className="bg-white rounded-xl shadow-md p-6">
        <table className="w-full">
          <thead className="bg-gray-50"><tr>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">SKU</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Product Name</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Category</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Brand</th>
          </tr></thead>
          <tbody>{products.map(product => (
            <tr key={product.id} className="border-t">
              <td className="px-6 py-4 font-mono text-sm">{product.sku}</td>
              <td className="px-6 py-4">{product.product_name}</td>
              <td className="px-6 py-4">{product.category_name}</td>
              <td className="px-6 py-4">{product.brand_name}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// DEALERS MODULE (read-only for now - mock data)
// ============================================================================
function DealersModule() {
  const [dealers] = useState<Dealer[]>(generateMockData().dealers);
  return (
    <div>
      <h1 className="text-3xl font-bold text-mk-gray mb-6">Dealers</h1>
      <div className="bg-white rounded-xl shadow-md p-6">
        <table className="w-full">
          <thead className="bg-gray-50"><tr>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Code</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Company</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Credit Limit</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Available</th>
          </tr></thead>
          <tbody>{dealers.map(dealer => (
            <tr key={dealer.id} className="border-t">
              <td className="px-6 py-4 font-bold">{dealer.dealer_code}</td>
              <td className="px-6 py-4">{dealer.company_name}</td>
              <td className="px-6 py-4">₹{(dealer.credit_limit / 100000).toFixed(1)}L</td>
              <td className="px-6 py-4">₹{(dealer.available_credit / 100000).toFixed(1)}L</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// ORDERS MODULE (read-only for now - mock data)
// ============================================================================
function OrdersModule() {
  const [orders] = useState<Order[]>(generateMockData().orders);
  return (
    <div>
      <h1 className="text-3xl font-bold text-mk-gray mb-6">Orders</h1>
      <div className="bg-white rounded-xl shadow-md p-6">
        <table className="w-full">
          <thead className="bg-gray-50"><tr>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Order #</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Buyer</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Type</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
          </tr></thead>
          <tbody>{orders.map(order => (
            <tr key={order.id} className="border-t">
              <td className="px-6 py-4 font-bold">{order.order_number}</td>
              <td className="px-6 py-4">{order.buyer_name}</td>
              <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{order.order_type}</span></td>
              <td className="px-6 py-4 font-bold text-mk-red">₹{order.total_amount.toLocaleString()}</td>
              <td className="px-6 py-4"><span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">{order.order_status}</span></td>
            </tr>
          ))}</tbody>
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
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-6 h-6" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
