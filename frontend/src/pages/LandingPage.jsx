import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Heart, Users, Package, MapPin, Shield, Sparkles, ChevronRight, RefreshCw, BarChart3, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { analyticsApi } from '../api/services';
import { authApi } from '../api/auth';

function AnimatedCounter({ end, suffix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!end) return;
    let start = 0;
    const duration = 1500;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end]);
  return <span>{count.toLocaleString()}{suffix}</span>;
}

export default function LandingPage() {
  const [stats, setStats] = useState(null);
  const [demoCreds, setDemoCreds] = useState([]);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    analyticsApi.getPlatformSummary().then(res => {
      if (res.success) setStats(res.data);
    }).catch(() => {});
    authApi.getDemoCredentials().then(res => {
      if (res.success) setDemoCreds(res.data);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-700 via-brand-600 to-emerald-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
              <Sparkles size={14} /> Powered by Smart Matching & Gemini AI
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Fight Food Waste.<br />
              <span className="text-yellow-300">Feed More Lives.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/85 mb-8 max-w-2xl">
              WasteWise connects hotels, restaurants, and catering services with verified NGOs and community kitchens — turning surplus food into meals for those who need it most.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-white text-brand-700 font-bold px-8 py-3.5 rounded-xl hover:bg-yellow-50 transition-colors shadow-lg text-base">
                Start Donating Food <ArrowRight size={18} />
              </Link>
              <Link to="/marketplace" className="inline-flex items-center justify-center gap-2 bg-white/15 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/25 transition-colors text-base">
                Browse Available Food
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Statistics from Real DB */}
      {stats && (
        <section id="impact" className="bg-brand-700 py-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-yellow-300">
                <AnimatedCounter end={stats.totalMealsRescued} suffix="+" />
              </div>
              <p className="text-sm text-white/70 mt-1">Estimated Meals Rescued</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-yellow-300">
                <AnimatedCounter end={stats.verifiedOrganizations} />
              </div>
              <p className="text-sm text-white/70 mt-1">Verified Partners</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-yellow-300">
                <AnimatedCounter end={stats.totalDonations} />
              </div>
              <p className="text-sm text-white/70 mt-1">Total Donations</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-yellow-300">
                <AnimatedCounter end={Math.round(stats.co2OffsetKg)} suffix=" kg" />
              </div>
              <p className="text-sm text-white/70 mt-1">Est. CO₂ Offset</p>
            </div>
          </div>
          <p className="text-center text-xs text-white/40 mt-4">Statistics calculated from live platform data. Meal estimates use 0.4 kg/meal conversion.</p>
        </section>
      )}

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">How WasteWise Works</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">A transparent, safe, and efficient process for food rescue</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: Package, color: 'bg-brand-100 text-brand-700', title: 'Donor Publishes Surplus', desc: 'Hotels, restaurants, and caterers list surplus food with FSSAI safety declaration, quantity, pickup location, and deadlines.' },
              { step: '02', icon: Sparkles, color: 'bg-purple-100 text-purple-700', title: 'Smart Matching Engine', desc: 'Our AI-powered algorithm ranks verified NGOs based on distance, capacity, food category compatibility, and urgency.' },
              { step: '03', icon: Heart, color: 'bg-red-100 text-red-600', title: 'Claim, Pickup & Confirm', desc: 'Recipient organizations claim food, coordinate pickup, and confirm delivery — completing the food rescue cycle.' },
            ].map((s) => (
              <div key={s.step} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center mb-5`}>
                  <s.icon size={22} />
                </div>
                <div className="text-xs text-slate-400 font-mono font-bold mb-2">STEP {s.step}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Built for Real Impact</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Every feature is designed with food safety, verification, and maximum food rescue impact in mind.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, color: 'text-brand-600 bg-brand-50', title: 'FSSAI Food Safety', desc: 'Every donation requires mandatory food-safety declarations. Allergen information, storage conditions, and consumption deadlines are tracked.' },
              { icon: MapPin, color: 'text-blue-600 bg-blue-50', title: 'Live Location Maps', desc: 'View donations on an interactive Leaflet/OpenStreetMap. Filter by radius, see pickup locations, and calculate distances in real time.' },
              { icon: Users, color: 'text-purple-600 bg-purple-50', title: 'Verified Organisations', desc: 'Recipient NGOs and community kitchens must be verified by an administrator before claiming any food. Zero unauthorized access.' },
              { icon: Sparkles, color: 'text-amber-600 bg-amber-50', title: 'AI Waste Insights', desc: 'Gemini AI analyzes donation patterns to identify peak surplus days, recurring categories, and reduction opportunities.' },
              { icon: BarChart3, color: 'text-rose-600 bg-rose-50', title: 'Impact Analytics', desc: 'Real-time dashboards for donors, recipients, and admins — meals rescued, CO₂ offset, claim trends, and category distribution.' },
              { icon: Package, color: 'text-teal-600 bg-teal-50', title: 'Partial Claims', desc: 'Multiple NGOs can claim portions of a single donation. The platform atomically tracks remaining quantities and status.' },
            ].map((f) => (
              <div key={f.title} className="p-6 rounded-2xl border border-slate-200 hover:border-brand-300 hover:shadow-sm transition-all group">
                <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon size={18} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Credentials Box */}
      <section className="py-16 bg-brand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Try the Live Demo</h2>
          <p className="text-slate-500 mb-6">Use these pre-seeded accounts to explore the full platform experience.</p>
          <button
            onClick={() => setShowDemo(!showDemo)}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors mb-6"
          >
            {showDemo ? <X size={16} /> : <ChevronRight size={16} />}
            {showDemo ? 'Hide Demo Accounts' : 'Show Demo Accounts'}
          </button>
          {showDemo && demoCreds.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {demoCreds.map((c) => (
                <div key={c.email} className="bg-white rounded-xl border border-brand-200 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-brand-100 text-brand-700 text-xs font-bold px-2 py-0.5 rounded-full">{c.role}</span>
                  </div>
                  <div className="text-xs text-slate-600 font-mono space-y-1">
                    <div><span className="text-slate-400">Email: </span><span className="font-semibold">{c.email}</span></div>
                    <div><span className="text-slate-400">Password: </span><span className="font-semibold">{c.password}</span></div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{c.notes}</p>
                  <Link to="/login" className="mt-3 inline-flex items-center gap-1 text-xs text-brand-600 font-semibold hover:text-brand-800">
                    Sign In <ArrowRight size={12} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-brand-600 text-white p-1.5 rounded-lg"><Leaf size={16} /></div>
                <span className="font-bold text-lg">Waste<span className="text-brand-400">Wise</span></span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">Reducing food waste. Feeding communities. Building a sustainable future.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-slate-300">Platform</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <Link to="/marketplace" className="block hover:text-white transition-colors">Browse Food</Link>
                <Link to="/register" className="block hover:text-white transition-colors">Register as Donor</Link>
                <Link to="/register" className="block hover:text-white transition-colors">Register as NGO</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-slate-300">Info</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <span className="block">FSSAI Compliant</span>
                <span className="block">MongoDB Powered</span>
                <span className="block">Spring Boot API</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-slate-300">Contact</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <span className="block">admin@wastewise.org</span>
                <span className="block">Bengaluru, Karnataka</span>
                <span className="block">India 🇮🇳</span>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">© 2026 WasteWise. B.E. CSE Major Project.</p>
            <p className="text-xs text-slate-500">Meal estimates: 0.4 kg/meal. CO₂ offset: 2.5 kg/kg food rescued. These are estimates, not certified measurements.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
