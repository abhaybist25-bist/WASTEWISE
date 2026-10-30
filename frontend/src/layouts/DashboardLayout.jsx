import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Plus, Package, HandHeart, Sparkles, Users,
  Building2, ShieldAlert, BarChart3, Bell, LogOut, Leaf, Menu, X, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const DONOR_NAV = [
  { path: '/donor', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/donor/create', label: 'Donate Food', icon: Plus },
  { path: '/donor/donations', label: 'My Listings', icon: Package },
  { path: '/donor/claims', label: 'Incoming Claims', icon: HandHeart },
  { path: '/donor/insights', label: 'AI Insights', icon: Sparkles },
];

const RECIPIENT_NAV = [
  { path: '/recipient', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/marketplace', label: 'Browse Food', icon: Package },
  { path: '/recipient/recommendations', label: 'Smart Matches', icon: Sparkles },
  { path: '/recipient/claims', label: 'My Claims', icon: HandHeart },
];

const ADMIN_NAV = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/organizations', label: 'Organisations', icon: Building2 },
  { path: '/admin/donations', label: 'Donations', icon: Package },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/reports', label: 'Reports', icon: ShieldAlert },
];

export default function DashboardLayout() {
  const { user, role, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = role === 'ROLE_ADMIN' ? ADMIN_NAV : role === 'ROLE_DONOR' ? DONOR_NAV : RECIPIENT_NAV;
  const roleLabel = role === 'ROLE_ADMIN' ? 'Administrator' : role === 'ROLE_DONOR' ? 'Food Donor' : 'Recipient Org';

  const isActive = (item) => item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  const handleLogout = () => { logout(); navigate('/'); };

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white border-r border-slate-200 w-64">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-slate-100">
        <div className="bg-brand-600 text-white p-1.5 rounded-lg">
          <Leaf size={18} />
        </div>
        <div>
          <span className="text-base font-bold text-slate-900">Waste<span className="text-brand-600">Wise</span></span>
          <p className="text-xs text-slate-400">{roleLabel}</p>
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-brand-50">
          <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                ${active ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Icon size={16} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight size={14} className="opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-slate-100 space-y-1">
        <Link to="/marketplace" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
          <Package size={16} /> Browse Marketplace
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 shrink-0 h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50 flex flex-col w-64 bg-white h-full shadow-xl">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 text-sm text-slate-500 hidden md:flex">
            <span className="text-brand-600 font-medium">{roleLabel}</span>
            <ChevronRight size={14} />
            <span>{location.pathname.split('/').pop() || 'Dashboard'}</span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="relative">
              <Bell size={18} className="text-slate-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

