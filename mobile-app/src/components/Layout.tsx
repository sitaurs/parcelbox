import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Package, Settings, Zap, TestTube, MessageCircle } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/gallery', icon: Package, label: 'Gallery' },
    { path: '/device-control', icon: Settings, label: 'Control' },
    { path: '/test-device', icon: TestTube, label: 'Test' },
    { path: '/whatsapp', icon: MessageCircle, label: 'WhatsApp' },
    { path: '/settings', icon: Zap, label: 'Settings' },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Main content - flex-1 untuk mengisi sisa ruang */}
      <main className="flex-1 overflow-y-auto pb-20 page-enter">
        <Outlet />
      </main>

      {/* Bottom Navigation - fixed di bawah dengan animasi */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-50 slide-up shadow-lg">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                  isActive ? 'text-primary-600' : 'text-gray-600 hover:text-primary-500'
                }`}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`w-6 h-6 mb-1 transition-transform ${isActive ? 'bounce-in' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
