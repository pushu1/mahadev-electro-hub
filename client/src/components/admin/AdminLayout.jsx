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
    <div className="min-h-screen bg-[#181818] text-white flex flex-col md:flex-row admin-portal" data-admin="true">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#000000] text-white p-4 flex items-center justify-between border-b border-[#383838]">
        <div className="flex items-center gap-2.5">
          <img src="/images/logo.png" alt="Logo" className="w-8 h-8 rounded-full border border-[#D6A52A]" />
          <span className="font-heading font-extrabold text-[#D6A52A] text-sm">
            MAHADEV ADMIN
          </span>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 text-gray-300 hover:text-[#D6A52A]"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-[#000000] text-white shrink-0 flex flex-col justify-between border-r border-[#383838] z-30`}
      >
        <div>
          {/* Brand header */}
          <div className="p-5 border-b border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#D6A52A] bg-[#262626] shrink-0">
              <img src="/images/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="block font-heading text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#D6A52A]">
                MAHADEV HUB
              </span>
              <span className="block text-[10px] text-gray-400 tracking-widest uppercase">
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
                      ? 'bg-[#D6A52A] text-[#000000] shadow-md font-bold'
                      : 'text-gray-300 hover:bg-white/5 hover:text-[#D6A52A]'
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
        <div className="p-4 border-t border-white/10 space-y-3">
          {/* DB Indicator */}
          <div className="p-2.5 rounded-lg bg-white/5 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Database className="w-3.5 h-3.5 text-[#D6A52A]" />
              <span>Database Engine:</span>
            </div>
            <div className="text-gray-300 flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${dbStatus?.isPostgresConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="truncate">{dbStatus?.provider || 'Connected'}</span>
            </div>
          </div>

          {/* Quick links */}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between text-xs text-gray-400 hover:text-[#D6A52A] p-1"
          >
            <span>Live Storefront Dekhein</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2 bg-red-950/80 border border-red-500/40 text-red-200 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-900 transition-colors"
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
          <div className="mb-6 p-4 bg-[#242424] border-l-4 border-[#D6A52A] rounded-r-xl shadow-md text-xs text-[#B3B3B3] border border-[#383838] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <strong className="font-bold block text-sm">
                ℹ️ Database Engine: Local Resilient Store Active
              </strong>
              <span>
                All product CRUD, image uploads, cart, orders, and bilingual edits are currently active and saving to persistent storage. To attach managed PostgreSQL (e.g. Neon.tech), add your connection URL to <code className="bg-[#181818] text-[#D6A52A] px-1 py-0.5 rounded font-mono border border-[#444444]">server/.env</code> and run <code className="bg-[#181818] text-[#D6A52A] px-1 py-0.5 rounded font-mono border border-[#444444]">npx prisma db push</code>.
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
