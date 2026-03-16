import { Home, MapPin, Building2, Boxes, Tag, Package, Users, CreditCard, ShoppingCart } from 'lucide-react';

interface Props {
  currentModule: string;
  setCurrentModule: (module: string) => void;
  isOpen: boolean;
}

export default function Sidebar({ currentModule, setCurrentModule, isOpen }: Props) {
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

  if (!isOpen) return null;

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r z-40 overflow-y-auto">
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
