import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Leaf, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function Navbar() {
  const { isAuthenticated, user, role, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardPath = role === 'ROLE_ADMIN' ? '/admin' : role === 'ROLE_DONOR' ? '/donor' : role === 'ROLE_RECIPIENT' ? '/recipient' : '/';

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-brand-600 text-white p-1.5 rounded-lg group-hover:bg-brand-700 transition-colors">
              <Leaf size={18} />
            </div>
            <span className="text-lg font-bold text-slate-900">
              Waste<span className="text-brand-600">Wise</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/marketplace" className="text-sm font-medium text-slate-600 hover:text-brand-700 transition-colors">Browse Food</Link>
            <Link to="/#how-it-works" className="text-sm font-medium text-slate-600 hover:text-brand-700 transition-colors">How It Works</Link>
            <Link to="/#impact" className="text-sm font-medium text-slate-600 hover:text-brand-700 transition-colors">Our Impact</Link>
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to={dashboardPath} className="relative p-2 rounded-lg text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition-colors">
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-700 max-w-24 truncate">{user?.name?.split(' ')[0]}</span>
                    <ChevronDown size={14} className="text-slate-500" />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                      <Link to={dashboardPath} onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <User size={14} /> Dashboard
                      </Link>
                      <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-brand-700 transition-colors px-3 py-1.5">Sign In</Link>
                <Link to="/register" className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors shadow-sm">
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          <Link to="/marketplace" className="block text-sm font-medium text-slate-700 py-2" onClick={() => setMobileOpen(false)}>Browse Food</Link>
          {isAuthenticated ? (
            <>
              <Link to={dashboardPath} className="block text-sm font-medium text-slate-700 py-2" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <button onClick={handleLogout} className="block text-sm font-medium text-red-600 py-2 w-full text-left">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-sm font-medium text-slate-700 py-2" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link to="/register" className="block bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-xl text-center" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

