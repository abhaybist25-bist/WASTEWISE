import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Leaf, Eye, EyeOff, AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || null;

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const getRedirect = (role) => {
    if (from) return from;
    if (role === 'ROLE_ADMIN') return '/admin';
    if (role === 'ROLE_DONOR') return '/donor';
    if (role === 'ROLE_RECIPIENT') return '/recipient';
    return '/marketplace';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      const role = data?.role || (Array.isArray(data?.roles) ? data.roles[0] : null) || 'ROLE_DONOR';
      navigate(getRedirect(role), { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Quick-fill demo accounts
  const demoAccounts = [
    { label: 'Admin', email: 'admin@wastewise.org', password: 'Admin@123' },
    { label: 'Donor', email: 'donor@grandhotel.com', password: 'Donor@123' },
    { label: 'NGO', email: 'contact@annaseva.org', password: 'Ngo@123' },
    { label: 'Volunteer', email: 'volunteer@wastewise.org', password: 'Volunteer@123' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-emerald-50 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="bg-brand-600 text-white p-2 rounded-xl">
          <Leaf size={20} />
        </div>
        <span className="text-2xl font-extrabold text-slate-900">
          Waste<span className="text-brand-600">Wise</span>
        </span>
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
          <p className="text-slate-500 text-sm">Sign in to your WasteWise account</p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing in…</>
            ) : (
              <><LogIn size={16} /> Sign In</>
            )}
          </button>
        </form>

        {/* Demo Quick Fill */}
        <div className="mt-6">
          <p className="text-xs text-slate-400 text-center mb-3">— Quick fill demo account —</p>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.label}
                type="button"
                onClick={() => setForm({ email: acc.email, password: acc.password })}
                className="text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-600 hover:border-brand-400 hover:text-brand-700 hover:bg-brand-50 transition-colors text-left"
              >
                <span className="font-semibold">{acc.label}</span>
                <br />
                <span className="text-slate-400 truncate block">{acc.email}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-600 font-semibold hover:text-brand-800">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

