import { Bell } from 'lucide-react';

export default function Header() {
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
      <button className="relative p-2 hover:bg-gray-100 rounded-lg">
        <Bell className="w-5 h-5 text-gray-600" />
      </button>
    </header>
  );
}
