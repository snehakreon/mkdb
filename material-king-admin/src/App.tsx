import React, { useState, useEffect, useRef } from 'react';
import { Home, MapPin, Building2, Boxes, Tag, Package, DollarSign, Users, CreditCard, ShoppingCart, AlertCircle, Bell, Edit2, Trash2, Plus, X, LogOut } from 'lucide-react';
import LoginPage from './auth/LoginPage';
import { zoneService } from './services/zone.service';
import { vendorService } from './services/vendor.service';
import { categoryService } from './services/category.service';
import { brandService } from './services/brand.service';
import { productService } from './services/product.service';
import { dealerService } from './services/dealer.service';
import { orderService } from './services/order.service';
import { buyerService } from './services/buyer.service';
import { Zone, Vendor, Category, Brand, Product, Order, Dealer, Buyer } from './types';
import { API_CONFIG } from './config/api.config';
import apiService from './services/api.service';
// API_CONFIG imported via services

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
    { id: 'buyers', label: 'Buyers', icon: CreditCard },
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
  switch (module) {
    case 'zones': return <ZonesModule />;
    case 'vendors': return <VendorsModule />;
    case 'categories': return <CategoriesModule />;
    case 'brands': return <BrandsModule />;
    case 'products': return <ProductsModule />;
    case 'dealers': return <DealersModule />;
    case 'buyers': return <BuyersModule />;
    case 'orders': return <OrdersModule />;
    default: return <DashboardModule />;
  }
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
  const [formData, setFormData] = useState({ code: '', name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try { const data = await zoneService.getAll(); setZones(Array.isArray(data) ? data : []); }
    catch (err) { console.error('Failed to load zones:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleAdd = () => { setEditingZone(null); setFormData({ code: '', name: '', description: '' }); setShowModal(true); };
  const handleEdit = (zone: Zone) => { setEditingZone(zone); setFormData({ code: zone.code, name: zone.name, description: zone.description || '' }); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingZone) { await zoneService.update(editingZone.id, formData); }
      else { await zoneService.create(formData); }
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
        <h1 className="text-3xl font-bold text-mk-gray">Zones</h1>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Add Zone</button>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6">
        {zones.length === 0 ? <p className="text-gray-500 text-center py-8">No zones found. Add your first zone.</p> : (
          <table className="w-full">
            <thead className="bg-gray-50"><tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Actions</th>
            </tr></thead>
            <tbody>{zones.map(zone => (
              <tr key={zone.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 font-bold">{zone.code}</td>
                <td className="px-6 py-4">{zone.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{zone.description || '-'}</td>
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
            <div><label className="block text-sm font-bold mb-2">Zone Code</label><input type="text" className="input-field" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} placeholder="ZONE-MUM-N" /></div>
            <div><label className="block text-sm font-bold mb-2">Zone Name</label><input type="text" className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Mumbai North" /></div>
            <div><label className="block text-sm font-bold mb-2">Description</label><input type="text" className="input-field" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Covers Mumbai North region" /></div>
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
  const [formData, setFormData] = useState({ company_name: '', contact_name: '', email: '', phone: '', gstin: '', address: '', city: '', state: '', pincode: '' });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try { const data = await vendorService.getAll(); setVendors(Array.isArray(data) ? data : []); }
    catch (err) { console.error('Failed to load vendors:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleAdd = () => { setEditingVendor(null); setFormData({ company_name: '', contact_name: '', email: '', phone: '', gstin: '', address: '', city: '', state: '', pincode: '' }); setShowModal(true); };
  const handleEdit = (vendor: Vendor) => { setEditingVendor(vendor); setFormData({ company_name: vendor.company_name, contact_name: vendor.contact_name || '', email: vendor.email || '', phone: vendor.phone || '', gstin: vendor.gstin || '', address: vendor.address || '', city: vendor.city || '', state: vendor.state || '', pincode: vendor.pincode || '' }); setShowModal(true); };

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
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Company</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">GSTIN</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">City</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Actions</th>
            </tr></thead>
            <tbody>{vendors.map(vendor => (
              <tr key={vendor.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 font-bold">{vendor.company_name}</td>
                <td className="px-6 py-4 text-sm">{vendor.contact_name || '-'}<br/><span className="text-gray-400">{vendor.phone || ''}</span></td>
                <td className="px-6 py-4 font-mono text-sm">{vendor.gstin || '-'}</td>
                <td className="px-6 py-4 text-sm">{vendor.city || '-'}</td>
                <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${vendor.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{vendor.is_active ? 'Active' : 'Inactive'}</span></td>
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
              <div><label className="block text-sm font-bold mb-2">Company Name *</label><input type="text" className="input-field" value={formData.company_name} onChange={e => setFormData({ ...formData, company_name: e.target.value })} placeholder="ABC Distributors" /></div>
              <div><label className="block text-sm font-bold mb-2">Contact Name</label><input type="text" className="input-field" value={formData.contact_name} onChange={e => setFormData({ ...formData, contact_name: e.target.value })} placeholder="John Doe" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-bold mb-2">Phone</label><input type="text" className="input-field" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="9876543210" /></div>
              <div><label className="block text-sm font-bold mb-2">Email</label><input type="email" className="input-field" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="john@abc.com" /></div>
            </div>
            <div><label className="block text-sm font-bold mb-2">GSTIN</label><input type="text" className="input-field" value={formData.gstin} onChange={e => setFormData({ ...formData, gstin: e.target.value })} placeholder="27AAACR5678C1Z9" /></div>
            <div><label className="block text-sm font-bold mb-2">Address</label><input type="text" className="input-field" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Full address" /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-sm font-bold mb-2">City</label><input type="text" className="input-field" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="Mumbai" /></div>
              <div><label className="block text-sm font-bold mb-2">State</label><input type="text" className="input-field" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} placeholder="Maharashtra" /></div>
              <div><label className="block text-sm font-bold mb-2">Pincode</label><input type="text" className="input-field" value={formData.pincode} onChange={e => setFormData({ ...formData, pincode: e.target.value })} placeholder="400001" /></div>
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
  const [formData, setFormData] = useState({ name: '', slug: '' });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try { const data = await categoryService.getAll(); setCategories(Array.isArray(data) ? data : []); }
    catch (err) { console.error('Failed to load categories:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleAdd = () => { setEditingItem(null); setFormData({ name: '', slug: '' }); setShowModal(true); };
  const handleEdit = (item: Category) => { setEditingItem(item); setFormData({ name: item.name, slug: item.slug }); setShowModal(true); };

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
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Actions</th>
            </tr></thead>
            <tbody>{categories.map(cat => (
              <tr key={cat.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 font-bold">{cat.name}</td>
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
            <div><label className="block text-sm font-bold mb-2">Category Name</label><input type="text" className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Plywood" /></div>
            <div><label className="block text-sm font-bold mb-2">Slug</label><input type="text" className="input-field" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="plywood (auto-generated if empty)" /></div>
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
  const [formData, setFormData] = useState({ name: '', slug: '' });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try { const data = await brandService.getAll(); setBrands(Array.isArray(data) ? data : []); }
    catch (err) { console.error('Failed to load brands:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleAdd = () => { setEditingItem(null); setFormData({ name: '', slug: '' }); setShowModal(true); };
  const handleEdit = (item: Brand) => { setEditingItem(item); setFormData({ name: item.name, slug: item.slug }); setShowModal(true); };

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
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Actions</th>
            </tr></thead>
            <tbody>{brands.map(brand => (
              <tr key={brand.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 font-bold">{brand.name}</td>
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
            <div><label className="block text-sm font-bold mb-2">Brand Name</label><input type="text" className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Century" /></div>
            <div><label className="block text-sm font-bold mb-2">Slug</label><input type="text" className="input-field" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="century (auto-generated if empty)" /></div>
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
// PRODUCTS MODULE - API-BACKED CRUD
// ============================================================================
function ProductsModule() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '', sku: '', category_id: '', brand_id: '', description: '',
    unit: 'piece', price: '', mrp: '', stock_qty: '', min_order_qty: '1',
    specifications: '{}', tech_sheet_url: ''
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const techSheetRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    try {
      const [prodData, catData, brandData] = await Promise.all([
        productService.getAll(), categoryService.getAll(), brandService.getAll()
      ]);
      setProducts(Array.isArray(prodData) ? prodData : []);
      setCategories(Array.isArray(catData) ? catData : []);
      setBrands(Array.isArray(brandData) ? brandData : []);
    } catch (err) { console.error('Failed to load products:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: '', sku: '', category_id: '', brand_id: '', description: '', unit: 'piece', price: '', mrp: '', stock_qty: '', min_order_qty: '1', specifications: '{}', tech_sheet_url: '' });
    setShowModal(true);
  };

  const handleEdit = (item: Product) => {
    setEditingItem(item);
    setFormData({
      name: item.name, sku: item.sku || '',
      category_id: item.category_id || '', brand_id: item.brand_id || '',
      description: item.description || '', unit: item.unit || 'piece',
      price: String(item.price || ''), mrp: String(item.mrp || ''),
      stock_qty: String(item.stock_qty || ''), min_order_qty: String(item.min_order_qty || '1'),
      specifications: JSON.stringify(item.specifications || {}),
      tech_sheet_url: (item as any).tech_sheet_url || ''
    });
    setShowModal(true);
  };

  const handleTechSheetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { alert('Only PDF files are allowed'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiService.upload('/upload', fd);
      setFormData({ ...formData, tech_sheet_url: res.url });
    } catch { alert('Failed to upload file. Please try again.'); }
    setUploading(false);
    if (techSheetRef.current) techSheetRef.current.value = '';
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        ...formData,
        price: formData.price ? Number(formData.price) : 0,
        mrp: formData.mrp ? Number(formData.mrp) : null,
        stock_qty: formData.stock_qty ? Number(formData.stock_qty) : 0,
        min_order_qty: formData.min_order_qty ? Number(formData.min_order_qty) : 1,
        brand_id: formData.brand_id || null,
        category_id: formData.category_id || null,
      };
      try { payload.specifications = JSON.parse(formData.specifications); } catch { payload.specifications = {}; }
      if (editingItem) { await productService.update(editingItem.id, payload); }
      else { await productService.create(payload); }
      await loadData(); setShowModal(false);
    } catch (err) { console.error('Save product error:', err); alert('Failed to save product.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this product?')) {
      try { await productService.delete(id); await loadData(); }
      catch (err) { console.error('Delete product error:', err); alert('Failed to delete product.'); }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-mk-gray">Products</h1>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Add Product</button>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6">
        {products.length === 0 ? <p className="text-gray-500 text-center py-8">No products found. Add your first product.</p> : (
          <table className="w-full">
            <thead className="bg-gray-50"><tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">SKU</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Product Name</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Brand</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Price</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Stock</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Actions</th>
            </tr></thead>
            <tbody>{products.map(product => (
              <tr key={product.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-4 font-mono text-sm">{product.sku || '-'}</td>
                <td className="px-4 py-4 font-bold">{product.name}</td>
                <td className="px-4 py-4 text-sm">{product.category_name || '-'}</td>
                <td className="px-4 py-4 text-sm">{product.brand_name || '-'}</td>
                <td className="px-4 py-4 text-sm font-bold text-mk-red">{product.price ? `₹${Number(product.price).toLocaleString()}` : '-'}</td>
                <td className="px-4 py-4 text-sm">{product.stock_qty}</td>
                <td className="px-4 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{product.is_active ? 'Active' : 'Inactive'}</span></td>
                <td className="px-4 py-4"><div className="flex gap-2">
                  <button onClick={() => handleEdit(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
      {showModal && (
        <Modal title={editingItem ? 'Edit Product' : 'Add Product'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-bold mb-2">Product Name *</label><input type="text" className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Century 18mm BWP Plywood" /></div>
              <div><label className="block text-sm font-bold mb-2">SKU</label><input type="text" className="input-field" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} placeholder="PLY-CEN-18MM" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-bold mb-2">Category</label>
                <select className="input-field" value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })}>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-bold mb-2">Brand</label>
                <select className="input-field" value={formData.brand_id} onChange={e => setFormData({ ...formData, brand_id: e.target.value })}>
                  <option value="">Select Brand</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>
            <div><label className="block text-sm font-bold mb-2">Description</label><textarea className="input-field" rows={2} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Product description" /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-sm font-bold mb-2">Price (₹) *</label><input type="number" step="0.01" className="input-field" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="2500" /></div>
              <div><label className="block text-sm font-bold mb-2">MRP (₹)</label><input type="number" step="0.01" className="input-field" value={formData.mrp} onChange={e => setFormData({ ...formData, mrp: e.target.value })} placeholder="3000" /></div>
              <div><label className="block text-sm font-bold mb-2">Unit</label>
                <select className="input-field" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })}>
                  <option value="piece">Piece</option>
                  <option value="kg">Kg</option>
                  <option value="sqft">Sq Ft</option>
                  <option value="bag">Bag</option>
                  <option value="box">Box</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-bold mb-2">Stock Qty</label><input type="number" className="input-field" value={formData.stock_qty} onChange={e => setFormData({ ...formData, stock_qty: e.target.value })} placeholder="100" /></div>
              <div><label className="block text-sm font-bold mb-2">Min Order Qty</label><input type="number" className="input-field" value={formData.min_order_qty} onChange={e => setFormData({ ...formData, min_order_qty: e.target.value })} placeholder="1" /></div>
            </div>
            <div><label className="block text-sm font-bold mb-2">Specifications (JSON)</label><textarea className="input-field font-mono text-sm" rows={3} value={formData.specifications} onChange={e => setFormData({ ...formData, specifications: e.target.value })} placeholder='{"thickness": "18mm", "grade": "BWP"}' /></div>
            <div>
              <label className="block text-sm font-bold mb-2">Tech Data Sheet (PDF)</label>
              {formData.tech_sheet_url && (
                <div className="flex items-center gap-2 mb-2">
                  <a href={`${API_CONFIG.API_BASE_URL.replace('/api', '')}${formData.tech_sheet_url}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline truncate max-w-[200px]">{formData.tech_sheet_url.split('/').pop()}</a>
                  <button type="button" onClick={() => setFormData({ ...formData, tech_sheet_url: '' })} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                </div>
              )}
              <input ref={techSheetRef} type="file" accept=".pdf,application/pdf" onChange={handleTechSheetUpload}
                className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-red-50 file:text-mk-red hover:file:bg-red-100" />
              {uploading && <p className="text-xs text-gray-400 mt-1">Uploading...</p>}
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-bold">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary disabled:opacity-50">{saving ? 'Saving...' : 'Save Product'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================================
// DEALERS MODULE - API-BACKED CRUD
// ============================================================================
function DealersModule() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Dealer | null>(null);
  const [formData, setFormData] = useState({
    company_name: '', contact_name: '', email: '', phone: '', gstin: '',
    address: '', city: '', state: '', pincode: ''
  });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try { const data = await dealerService.getAll(); setDealers(Array.isArray(data) ? data : []); }
    catch (err) { console.error('Failed to load dealers:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ company_name: '', contact_name: '', email: '', phone: '', gstin: '', address: '', city: '', state: '', pincode: '' });
    setShowModal(true);
  };

  const handleEdit = (item: Dealer) => {
    setEditingItem(item);
    setFormData({
      company_name: item.company_name, contact_name: item.contact_name || '',
      email: item.email || '', phone: item.phone || '', gstin: item.gstin || '',
      address: item.address || '', city: item.city || '', state: item.state || '', pincode: item.pincode || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingItem) { await dealerService.update(editingItem.id, formData); }
      else { await dealerService.create(formData); }
      await loadData(); setShowModal(false);
    } catch (err) { console.error('Save dealer error:', err); alert('Failed to save dealer.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this dealer?')) {
      try { await dealerService.delete(id); await loadData(); }
      catch (err) { console.error('Delete dealer error:', err); alert('Failed to delete dealer.'); }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-mk-gray">Dealer Management</h1>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Add Dealer</button>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6">
        {dealers.length === 0 ? <p className="text-gray-500 text-center py-8">No dealers found. Add your first dealer.</p> : (
          <table className="w-full">
            <thead className="bg-gray-50"><tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Company</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">GSTIN</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">City</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Actions</th>
            </tr></thead>
            <tbody>{dealers.map(dealer => (
              <tr key={dealer.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-4 font-bold">{dealer.company_name}</td>
                <td className="px-4 py-4 text-sm">{dealer.contact_name || '-'}<br/><span className="text-gray-400">{dealer.phone || ''}</span></td>
                <td className="px-4 py-4 font-mono text-sm">{dealer.gstin || '-'}</td>
                <td className="px-4 py-4 text-sm">{dealer.city || '-'}</td>
                <td className="px-4 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${dealer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{dealer.is_active ? 'Active' : 'Inactive'}</span></td>
                <td className="px-4 py-4"><div className="flex gap-2">
                  <button onClick={() => handleEdit(dealer)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(dealer.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
      {showModal && (
        <Modal title={editingItem ? 'Edit Dealer' : 'Add Dealer'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-bold mb-2">Company Name *</label><input type="text" className="input-field" value={formData.company_name} onChange={e => setFormData({ ...formData, company_name: e.target.value })} placeholder="Sharma Trading Co" /></div>
              <div><label className="block text-sm font-bold mb-2">Contact Name</label><input type="text" className="input-field" value={formData.contact_name} onChange={e => setFormData({ ...formData, contact_name: e.target.value })} placeholder="Rajesh Sharma" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-bold mb-2">Phone</label><input type="text" className="input-field" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="9876543210" /></div>
              <div><label className="block text-sm font-bold mb-2">Email</label><input type="email" className="input-field" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="dealer@company.com" /></div>
            </div>
            <div><label className="block text-sm font-bold mb-2">GSTIN</label><input type="text" className="input-field" value={formData.gstin} onChange={e => setFormData({ ...formData, gstin: e.target.value })} placeholder="27AABCS1234D1Z5" /></div>
            <div><label className="block text-sm font-bold mb-2">Address</label><input type="text" className="input-field" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Full address" /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-sm font-bold mb-2">City</label><input type="text" className="input-field" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="Mumbai" /></div>
              <div><label className="block text-sm font-bold mb-2">State</label><input type="text" className="input-field" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} placeholder="Maharashtra" /></div>
              <div><label className="block text-sm font-bold mb-2">Pincode</label><input type="text" className="input-field" value={formData.pincode} onChange={e => setFormData({ ...formData, pincode: e.target.value })} placeholder="400001" /></div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-bold">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary disabled:opacity-50">{saving ? 'Saving...' : 'Save Dealer'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================================
// BUYERS MODULE - API-BACKED CRUD
// ============================================================================
function BuyersModule() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Buyer | null>(null);
  const [formData, setFormData] = useState({
    company_name: '', gstin: '', pan: '', company_type: '', company_address: '', billing_address: '',
    first_name: '', last_name: '', email: '', phone: ''
  });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try { const data = await buyerService.getAll(); setBuyers(Array.isArray(data) ? data : []); }
    catch (err) { console.error('Failed to load buyers:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ company_name: '', gstin: '', pan: '', company_type: '', company_address: '', billing_address: '', first_name: '', last_name: '', email: '', phone: '' });
    setShowModal(true);
  };

  const handleEdit = (item: Buyer) => {
    setEditingItem(item);
    setFormData({
      company_name: item.company_name, gstin: item.gstin || '', pan: (item as any).pan || '',
      company_type: item.company_type || '', company_address: (item as any).company_address || '',
      billing_address: (item as any).billing_address || '',
      first_name: item.first_name || '', last_name: item.last_name || '',
      email: item.email || '', phone: item.phone || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingItem) { await buyerService.update(editingItem.id, formData); }
      else { await buyerService.create(formData); }
      await loadData(); setShowModal(false);
    } catch (err) { console.error('Save buyer error:', err); alert('Failed to save buyer.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deactivate this buyer?')) {
      try { await buyerService.delete(id); await loadData(); }
      catch (err) { console.error('Delete buyer error:', err); alert('Failed to deactivate buyer.'); }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-mk-gray">Buyer Management</h1>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Add Buyer</button>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6">
        {buyers.length === 0 ? <p className="text-gray-500 text-center py-8">No buyers found. Add your first buyer.</p> : (
          <table className="w-full">
            <thead className="bg-gray-50"><tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Company</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Contact Person</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">GSTIN</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Actions</th>
            </tr></thead>
            <tbody>{buyers.map(buyer => (
              <tr key={buyer.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-4 font-bold">{buyer.company_name}</td>
                <td className="px-4 py-4 text-sm">{buyer.first_name} {buyer.last_name}</td>
                <td className="px-4 py-4 text-sm">{buyer.email}</td>
                <td className="px-4 py-4 text-sm">{buyer.phone}</td>
                <td className="px-4 py-4 font-mono text-sm">{buyer.gstin || '-'}</td>
                <td className="px-4 py-4 text-sm">{buyer.company_type || '-'}</td>
                <td className="px-4 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${buyer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{buyer.is_active ? 'Active' : 'Inactive'}</span></td>
                <td className="px-4 py-4"><div className="flex gap-2">
                  <button onClick={() => handleEdit(buyer)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(buyer.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
      {showModal && (
        <Modal title={editingItem ? 'Edit Buyer' : 'Add Buyer'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div><label className="block text-sm font-bold mb-2">Company Name *</label><input type="text" className="input-field" value={formData.company_name} onChange={e => setFormData({ ...formData, company_name: e.target.value })} placeholder="ABC Builders Pvt Ltd" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-bold mb-2">First Name *</label><input type="text" className="input-field" value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} placeholder="Raj" /></div>
              <div><label className="block text-sm font-bold mb-2">Last Name *</label><input type="text" className="input-field" value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} placeholder="Patel" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-bold mb-2">Email *</label><input type="email" className="input-field" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="raj@abc.com" /></div>
              <div><label className="block text-sm font-bold mb-2">Phone *</label><input type="text" className="input-field" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="9876543210" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-sm font-bold mb-2">GSTIN</label><input type="text" className="input-field" value={formData.gstin} onChange={e => setFormData({ ...formData, gstin: e.target.value })} placeholder="27AAACR5678C1Z9" /></div>
              <div><label className="block text-sm font-bold mb-2">PAN</label><input type="text" className="input-field" value={formData.pan} onChange={e => setFormData({ ...formData, pan: e.target.value })} placeholder="AAACR5678C" /></div>
              <div><label className="block text-sm font-bold mb-2">Company Type</label>
                <select className="input-field" value={formData.company_type} onChange={e => setFormData({ ...formData, company_type: e.target.value })}>
                  <option value="">Select Type</option>
                  <option value="Builder">Builder</option>
                  <option value="Contractor">Contractor</option>
                  <option value="Interior Designer">Interior Designer</option>
                  <option value="Architect">Architect</option>
                  <option value="Retailer">Retailer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div><label className="block text-sm font-bold mb-2">Company Address</label><textarea className="input-field" rows={2} value={formData.company_address} onChange={e => setFormData({ ...formData, company_address: e.target.value })} placeholder="Full company address" /></div>
            <div><label className="block text-sm font-bold mb-2">Billing Address</label><textarea className="input-field" rows={2} value={formData.billing_address} onChange={e => setFormData({ ...formData, billing_address: e.target.value })} placeholder="Billing address (if different)" /></div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-bold">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary disabled:opacity-50">{saving ? 'Saving...' : 'Save Buyer'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================================
// ORDERS MODULE - API-BACKED FULL CRUD
// ============================================================================
function OrdersModule() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);

  // Create order form state
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [orderForm, setOrderForm] = useState({
    buyer_id: '', vendor_id: '', shipping_address: '', notes: ''
  });
  const [orderItems, setOrderItems] = useState<Array<{ product_id: string; product_name: string; sku: string; quantity: number; unit_price: number }>>([]);

  // Edit order form state
  const [editForm, setEditForm] = useState({
    status: '', notes: '', shipping_address: ''
  });

  const loadData = async () => {
    try { const data = await orderService.getAll(); setOrders(Array.isArray(data) ? data : []); }
    catch (err) { console.error('Failed to load orders:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleAdd = async () => {
    setOrderForm({ buyer_id: '', vendor_id: '', shipping_address: '', notes: '' });
    setOrderItems([]);
    try {
      const [buyerData, productData] = await Promise.all([
        buyerService.getAll(), productService.getAll()
      ]);
      setBuyers(Array.isArray(buyerData) ? buyerData : []);
      setProducts(Array.isArray(productData) ? productData : []);
    } catch (err) { console.error('Failed to load form data:', err); }
    setShowModal(true);
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, { product_id: '', product_name: '', sku: '', quantity: 1, unit_price: 0 }]);
  };

  const updateOrderItem = (index: number, field: string, value: any) => {
    const updated = [...orderItems];
    (updated[index] as any)[field] = value;
    if (field === 'product_id') {
      const prod = products.find(p => p.id === value);
      if (prod) {
        updated[index].product_name = prod.name;
        updated[index].sku = prod.sku || '';
        updated[index].unit_price = Number(prod.price) || 0;
      }
    }
    setOrderItems(updated);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleCreateOrder = async () => {
    if (!orderForm.buyer_id || orderItems.length === 0) {
      alert('Please select buyer and add at least one item.'); return;
    }
    setSaving(true);
    try {
      await orderService.create({
        ...orderForm,
        items: orderItems.map(i => ({ product_id: i.product_id, quantity: i.quantity, unit_price: i.unit_price }))
      });
      await loadData(); setShowModal(false);
    } catch (err) { console.error('Create order error:', err); alert('Failed to create order.'); }
    finally { setSaving(false); }
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setEditForm({
      status: order.status, notes: order.notes || '',
      shipping_address: order.shipping_address || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateOrder = async () => {
    if (!editingOrder) return;
    setSaving(true);
    try {
      await orderService.update(editingOrder.id, editForm);
      await loadData(); setShowEditModal(false);
    } catch (err) { console.error('Update order error:', err); alert('Failed to update order.'); }
    finally { setSaving(false); }
  };

  const handleCancel = async (id: string) => {
    if (confirm('Cancel this order?')) {
      try { await orderService.delete(id); await loadData(); }
      catch (err) { console.error('Cancel order error:', err); alert('Failed to cancel order.'); }
    }
  };

  if (loading) return <LoadingSpinner />;

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-indigo-100 text-indigo-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const subtotal = orderItems.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-mk-gray">Order Management</h1>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Create Order</button>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6">
        {orders.length === 0 ? <p className="text-gray-500 text-center py-8">No orders found. Create your first order.</p> : (
          <table className="w-full">
            <thead className="bg-gray-50"><tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Order #</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Buyer</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Actions</th>
            </tr></thead>
            <tbody>{orders.map(order => (
              <tr key={order.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-4 font-bold">{order.order_number}</td>
                <td className="px-4 py-4 text-sm">{order.buyer_company || '-'}</td>
                <td className="px-4 py-4 font-bold text-mk-red">₹{Number(order.total_amount || 0).toLocaleString()}</td>
                <td className="px-4 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>{order.status}</span></td>
                <td className="px-4 py-4 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-4"><div className="flex gap-2">
                  <button onClick={() => handleEdit(order)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <button onClick={() => handleCancel(order.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  )}
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>

      {/* CREATE ORDER MODAL */}
      {showModal && (
        <Modal title="Create New Order" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div><label className="block text-sm font-bold mb-2">Buyer *</label>
              <select className="input-field" value={orderForm.buyer_id} onChange={e => setOrderForm({ ...orderForm, buyer_id: e.target.value })}>
                <option value="">Select Buyer</option>
                {buyers.map(b => <option key={b.id} value={b.id}>{b.company_name || `${b.first_name} ${b.last_name}`}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-bold mb-2">Shipping Address</label><input type="text" className="input-field" value={orderForm.shipping_address} onChange={e => setOrderForm({ ...orderForm, shipping_address: e.target.value })} placeholder="Full delivery address" /></div>

            <p className="text-sm font-bold text-gray-500 uppercase mt-4">Order Items</p>
            {orderItems.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-end bg-gray-50 p-3 rounded-lg">
                <div className="flex-1"><label className="block text-xs font-bold mb-1">Product</label>
                  <select className="input-field text-sm" value={item.product_id} onChange={e => updateOrderItem(idx, 'product_id', e.target.value)}>
                    <option value="">Select</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} {p.sku ? `(${p.sku})` : ''}</option>)}
                  </select>
                </div>
                <div className="w-20"><label className="block text-xs font-bold mb-1">Qty</label>
                  <input type="number" min="1" className="input-field text-sm" value={item.quantity} onChange={e => updateOrderItem(idx, 'quantity', Number(e.target.value))} />
                </div>
                <div className="w-28"><label className="block text-xs font-bold mb-1">Unit Price</label>
                  <input type="number" min="0" step="0.01" className="input-field text-sm" value={item.unit_price} onChange={e => updateOrderItem(idx, 'unit_price', Number(e.target.value))} />
                </div>
                <div className="w-24 text-sm font-bold pt-5">₹{(item.quantity * item.unit_price).toLocaleString()}</div>
                <button onClick={() => removeOrderItem(idx)} className="p-2 text-red-600 hover:bg-red-100 rounded mb-0.5"><X className="w-4 h-4" /></button>
              </div>
            ))}
            <button onClick={addOrderItem} className="text-sm text-blue-600 font-bold hover:underline flex items-center gap-1"><Plus className="w-4 h-4" /> Add Item</button>

            {orderItems.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg text-right">
                <p className="text-lg font-bold text-mk-red">Total: ₹{subtotal.toLocaleString()}</p>
              </div>
            )}

            <div><label className="block text-sm font-bold mb-2">Notes</label><textarea className="input-field" rows={2} value={orderForm.notes} onChange={e => setOrderForm({ ...orderForm, notes: e.target.value })} /></div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-bold">Cancel</button>
            <button onClick={handleCreateOrder} disabled={saving} className="flex-1 btn-primary disabled:opacity-50">{saving ? 'Creating...' : 'Create Order'}</button>
          </div>
        </Modal>
      )}

      {/* EDIT ORDER MODAL */}
      {showEditModal && editingOrder && (
        <Modal title={`Edit Order ${editingOrder.order_number}`} onClose={() => setShowEditModal(false)}>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-1">
              <p><span className="font-bold">Buyer:</span> {editingOrder.buyer_company || '-'}</p>
              <p><span className="font-bold">Total:</span> <span className="text-mk-red font-bold">₹{Number(editingOrder.total_amount || 0).toLocaleString()}</span></p>
            </div>
            <div><label className="block text-sm font-bold mb-2">Status</label>
              <select className="input-field" value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div><label className="block text-sm font-bold mb-2">Shipping Address</label><input type="text" className="input-field" value={editForm.shipping_address} onChange={e => setEditForm({ ...editForm, shipping_address: e.target.value })} /></div>
            <div><label className="block text-sm font-bold mb-2">Notes</label><textarea className="input-field" rows={2} value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} /></div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-bold">Cancel</button>
            <button onClick={handleUpdateOrder} disabled={saving} className="flex-1 btn-primary disabled:opacity-50">{saving ? 'Saving...' : 'Update Order'}</button>
          </div>
        </Modal>
      )}
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
