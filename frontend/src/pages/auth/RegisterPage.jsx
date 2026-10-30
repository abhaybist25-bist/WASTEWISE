import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Eye, EyeOff, AlertCircle, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ROLES = [
  { value: 'DONOR', label: 'Food Donor', desc: 'Restaurant, hotel, caterer, or event organizer donating surplus food', icon: '🍽️' },
  { value: 'RECIPIENT', label: 'Recipient Organisation', desc: 'NGO, community kitchen, shelter, or verified recipient body', icon: '🤝' },
  { value: 'VOLUNTEER', label: 'Volunteer', desc: 'Individual helping coordinate food pickup and delivery', icon: '🚗' },
];

const ORG_TYPES = ['NGO', 'COMMUNITY_KITCHEN', 'SHELTER', 'FOOD_BANK', 'RELIGIOUS_ORGANIZATION', 'GOVERNMENT_BODY', 'OTHER'];
const FOOD_CATS = ['COOKED_MEALS', 'BAKERY', 'FRUITS', 'VEGETABLES', 'PACKAGED_FOOD', 'DAIRY', 'OTHER'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: '',
    // Org fields
    organizationName: '', organizationType: '', description: '',
    city: '', state: '', postalCode: '', address: '',
    latitude: '', longitude: '', phone: '',
    capacity: '', foodCategories: [],
    // Volunteer fields
    phone2: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setError('');
  };

  const toggleCat = (cat) => {
    setForm((p) => ({
      ...p,
      foodCategories: p.foodCategories.includes(cat)
        ? p.foodCategories.filter((c) => c !== cat)
        : [...p.foodCategories, cat],
    }));
  };

  const validateStep1 = () => {
    if (!form.name.trim()) return 'Full name is required.';
    if (!form.email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email.';
    if (!form.password) return 'Password is required.';
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(form.password)) return 'Password must contain an uppercase letter.';
    if (!/[0-9]/.test(form.password)) return 'Password must contain a number.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    if (!form.role) return 'Please select a role.';
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.role === 'DONOR' || form.role === 'RECIPIENT') {
      if (!form.organizationName.trim()) { setError('Organisation name is required.'); return; }
      if (form.role === 'RECIPIENT' && !form.organizationType) { setError('Organisation type is required.'); return; }
      if (!form.city.trim()) { setError('City is required.'); return; }
    }

    setLoading(true);
    try {
      const formattedRole = form.role.startsWith('ROLE_') ? form.role : `ROLE_${form.role}`;
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: formattedRole,
      };
      if (form.role === 'DONOR' || form.role === 'RECIPIENT' || form.role === 'ROLE_DONOR' || form.role === 'ROLE_RECIPIENT') {
        payload.organizationName = form.organizationName;
        payload.organizationType = form.organizationType || (form.role.includes('DONOR') ? 'OTHER' : 'NGO');
        payload.description = form.description;
        payload.address = form.address;
        payload.city = form.city;
        payload.state = form.state;
        payload.postalCode = form.postalCode;
        payload.phoneNumber = form.phone;
        payload.phone = form.phone;
        if (form.latitude) payload.latitude = parseFloat(form.latitude);
        if (form.longitude) payload.longitude = parseFloat(form.longitude);
        if (form.capacity) {
          payload.dailyCapacity = parseInt(form.capacity);
          payload.capacity = parseInt(form.capacity);
        }
        if (form.foodCategories && form.foodCategories.length > 0) {
          payload.acceptedCategories = form.foodCategories;
          payload.foodCategories = form.foodCategories;
        }
      }
      if ((form.role === 'VOLUNTEER' || form.role === 'ROLE_VOLUNTEER') && form.phone2) {
        payload.phoneNumber = form.phone2;
        payload.phone = form.phone2;
      }
      await register(payload);
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-emerald-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-10 text-center">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-brand-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Registration Successful!</h2>
          {(form.role === 'RECIPIENT') ? (
            <p className="text-slate-500 text-sm mb-6">
              Your organisation is <strong>pending verification</strong>. An administrator will review and approve your account before you can claim donations. You'll be notified once approved.
            </p>
          ) : (
            <p className="text-slate-500 text-sm mb-6">
              Your account has been created successfully. You can now sign in and start using WasteWise.
            </p>
          )}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Go to Login <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-emerald-50 flex flex-col items-center justify-center p-4 py-12">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="bg-brand-600 text-white p-2 rounded-xl"><Leaf size={20} /></div>
        <span className="text-2xl font-extrabold text-slate-900">Waste<span className="text-brand-600">Wise</span></span>
      </Link>

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-7">
          {[1, 2].map((s) => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{s}</div>
              {s < 2 && <div className={`flex-1 h-1 rounded-full transition-colors ${step >= 2 ? 'bg-brand-600' : 'bg-slate-100'}`} />}
            </React.Fragment>
          ))}
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-1">{step === 1 ? 'Create your account' : 'Organisation details'}</h1>
        <p className="text-slate-500 text-sm mb-7">{step === 1 ? 'Join WasteWise and start making an impact.' : 'Help us set up your profile correctly.'}</p>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
            <AlertCircle size={16} className="flex-shrink-0" /> {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name / Organisation Name *</label>
              <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)}
                placeholder="Anna Seva Trust / Chef Ravi Kumar"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address *</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password *</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={(e) => set('password', e.target.value)}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm" />
                <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password *</label>
              <input type="password" value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">I am a… *</label>
              <div className="space-y-3">
                {ROLES.map((r) => (
                  <label key={r.value} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.role === r.value ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-300'}`}>
                    <input type="radio" name="role" value={r.value} checked={form.role === r.value} onChange={(e) => set('role', e.target.value)} className="mt-1 accent-brand-600" />
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{r.icon} {r.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{r.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <button onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {(form.role === 'DONOR' || form.role === 'RECIPIENT') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Organisation / Business Name *</label>
                  <input type="text" value={form.organizationName} onChange={(e) => set('organizationName', e.target.value)}
                    placeholder="Grand Hotel / Anna Seva Trust"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm" />
                </div>
                {form.role === 'RECIPIENT' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Organisation Type *</label>
                    <select value={form.organizationType} onChange={(e) => set('organizationType', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white">
                      <option value="">Select type…</option>
                      {ORG_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                  <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
                    placeholder="Brief description of your organisation or business…"
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
                  <input type="text" value={form.address} onChange={(e) => set('address', e.target.value)}
                    placeholder="Street address"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">City *</label>
                    <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)}
                      placeholder="Bengaluru"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">State</label>
                    <input type="text" value={form.state} onChange={(e) => set('state', e.target.value)}
                      placeholder="Karnataka"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                    <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">PIN Code</label>
                    <input type="text" value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)}
                      placeholder="560001"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm" />
                  </div>
                </div>
                {form.role === 'RECIPIENT' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Daily Meal Capacity</label>
                      <input type="number" value={form.capacity} onChange={(e) => set('capacity', e.target.value)}
                        placeholder="e.g. 500"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Food Categories Accepted</label>
                      <div className="flex flex-wrap gap-2">
                        {FOOD_CATS.map(cat => (
                          <button key={cat} type="button" onClick={() => toggleCat(cat)}
                            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${form.foodCategories.includes(cat) ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-400'}`}>
                            {cat.replace(/_/g, ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
            {form.role === 'VOLUNTEER' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                <input type="tel" value={form.phone2} onChange={(e) => set('phone2', e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm" />
                <p className="text-xs text-slate-400 mt-1.5">Volunteers are verified manually. You will be notified once approved.</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setStep(1); setError(''); }}
                className="flex items-center gap-1 text-slate-600 border border-slate-200 font-semibold py-3 px-5 rounded-xl hover:bg-slate-50 transition-colors text-sm">
                <ChevronLeft size={16} /> Back
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                {loading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating account…</> : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-800">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

