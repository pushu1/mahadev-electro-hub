import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Boxes,
  Palette,
  Film,
  MessageSquare,
  Settings,
  LogOut,
  ExternalLink,
  Database,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import ErrorBoundary from '../common/ErrorBoundary.jsx';

export default function AdminLayout({ children }) {
  const { adminUser, logoutAdmin, isAdminAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [dbStatus, setDbStatus] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
      return;
    }

    api.getHealth()
      .then(res => {
        if (res.database) setDbStatus(res.database);
      })
      .catch(() => {});
  }, [isAdminAuthenticated, navigate]);

  const navItems = [
    { label: 'Dashboard Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products Management', path: '/admin/products', icon: Package },
    { label: 'Category & Subcategories', path: '/admin/categories', icon: FolderTree },
    { label: 'Orders & Fulfillment', path: '/admin/orders', icon: ShoppingCart },
    { label: 'Inventory & Stock', path: '/admin/inventory', icon: Boxes },
    { label: 'Reels Management', path: '/admin/reels', icon: Film },
    { label: 'Customer Reviews', path: '/admin/cms?tab=reviews', icon: MessageSquare },
    { label: 'CMS, Banners & Promo', path: '/admin/cms', icon: Palette },
  ];

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#252A25] flex flex-col md:flex-row admin-portal" data-admin="true">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#F3F0E6] text-[#171C17] p-4 flex items-center justify-between border-b border-[#D5DDD2]">
        <div className="flex items-center gap-2.5">
          <img src="/images/logo.png" alt="Logo" className="w-8 h-8 rounded-full border border-[#24532F]" />
          <span className="font-heading font-extrabold text-[#171C17] text-sm">
            MAHADEV ADMIN
          </span>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 text-[#252A25] hover:text-[#24532F]"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-[#F3F0E6] text-[#252A25] shrink-0 flex flex-col justify-between border-r border-[#D5DDD2] z-30`}
      >
        <div>
          {/* Brand header */}
          <div className="p-5 border-b border-[#D5DDD2] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#24532F] bg-white shrink-0">
              <img src="/images/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="block font-heading text-sm font-extrabold text-[#171C17]">
                MAHADEV HUB
              </span>
              <span className="block text-[10px] text-[#596358] tracking-widest uppercase">
                ADMIN CMS
              </span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const currentFull = location.pathname + location.search;
              const isActive = item.path.includes('?')
                ? currentFull === item.path
                : location.pathname === item.path && (!item.path.startsWith('/admin/cms') || !location.search.includes('tab=reviews'));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#DCE8D5] text-[#183D22] shadow-sm font-bold border border-[#356B3D]/40'
                      : 'text-[#252A25] hover:bg-[#FAF9F6] hover:text-[#171C17]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Info */}
        <div className="p-4 border-t border-[#D5DDD2] space-y-3">
          {/* DB Indicator */}
          <div className="p-2.5 rounded-xl bg-white border border-[#D5DDD2] text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#171C17]">
              <Database className="w-3.5 h-3.5 text-[#24532F]" />
              <span>Database Engine:</span>
            </div>
            <div className="text-[#252A25] flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${dbStatus?.isPostgresConnected ? 'bg-[#2E7D46]' : 'bg-[#B7791F]'}`} />
              <span className="truncate">{dbStatus?.provider || 'Connected'}</span>
            </div>
          </div>

          {/* Quick links */}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between text-xs text-[#252A25] hover:text-[#24532F] p-1 font-medium transition-colors"
          >
            <span>Live Storefront Dekhein</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2 bg-white border border-[#B94343]/30 text-[#B94343] rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#B94343] hover:text-white transition-colors shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Karein</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {/* PostgreSQL / System Status Notice Banner */}
        {dbStatus && !dbStatus.isPostgresConnected && (
          <div className="mb-6 p-4 bg-white border-l-4 border-[#24532F] rounded-r-xl shadow-sm text-xs text-[#252A25] border border-[#D5DDD2] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <strong className="font-bold block text-sm text-[#171C17]">
                ℹ️ Database Engine: Local Resilient Store Active
              </strong>
              <span>
                All product CRUD, image uploads, cart, orders, and bilingual edits are currently active and saving to persistent storage. To attach managed PostgreSQL (e.g. Neon.tech), add your connection URL to <code className="bg-[#F3F0E6] text-[#183D22] px-1 py-0.5 rounded font-mono border border-[#D5DDD2]">server/.env</code> and run <code className="bg-[#F3F0E6] text-[#183D22] px-1 py-0.5 rounded font-mono border border-[#D5DDD2]">npx prisma db push</code>.
              </span>
            </div>
          </div>
        )}

        <ErrorBoundary
          fallbackTitle="Admin Section Error"
          fallbackMessage="Is admin section ko render karte samay rendering error aayi. Sidebar aur navigation puri tarah surakshit hain."
          redirectUrl="/admin/dashboard"
        >
          {children}
        </ErrorBoundary>
      </main>
    </div>
  );
}
