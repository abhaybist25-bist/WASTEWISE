import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, Building2, AlertTriangle, TrendingUp, CheckCircle, Clock, Shield } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { analyticsApi, adminApi } from '../../api/services';
import StatCard from '../../components/StatCard';


const COLORS = ['#16a34a', '#34d399', '#6ee7b7', '#fbbf24', '#f87171', '#a78bfa', '#60a5fa'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getAdminAnalytics()
      .then(res => { if (res.success) setStats(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categoryData = stats?.donationsByCategory
    ? Object.entries(stats.donationsByCategory).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))
    : [];

  const roleData = stats?.usersByRole
    ? Object.entries(stats.usersByRole).map(([name, value]) => ({ name: name.replace('ROLE_', ''), value }))
    : [];

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="text-brand-600" size={24} /> Admin Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">Platform-wide statistics and operations</p>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Users} label="Total Users" value={stats.totalUsers ?? 0} color="brand" />
              <StatCard icon={Package} label="Total Donations" value={stats.totalDonations ?? 0} color="blue" />
              <StatCard icon={Building2} label="Verified Orgs" value={stats.verifiedOrganizations ?? 0} color="green" />
              <StatCard icon={AlertTriangle} label="Pending Reviews" value={stats.pendingVerifications ?? 0} color="amber" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={CheckCircle} label="Completed" value={stats.completedDonations ?? 0} color="green" />
              <StatCard icon={Clock} label="Active Listings" value={stats.activeDonations ?? 0} color="blue" />
              <StatCard icon={TrendingUp} label="Meals Rescued" value={stats.totalMealsRescued ?? 0} color="purple" />
              <StatCard icon={TrendingUp} label="CO₂ Offset (kg)" value={Math.round(stats.co2OffsetKg ?? 0)} color="brand" />
            </div>
          </>
        ) : null}

        {/* Charts */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {categoryData.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="font-bold text-slate-900 mb-4">Donations by Category</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {roleData.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="font-bold text-slate-900 mb-4">Users by Role</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={roleData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { to: '/admin/organizations', label: 'Manage Organisations', desc: 'Approve or reject org registrations', icon: Building2, color: 'from-brand-600 to-emerald-500' },
            { to: '/admin/donations', label: 'Manage Donations', desc: 'Review and flag listings', icon: Package, color: 'from-blue-600 to-cyan-500' },
            { to: '/admin/users', label: 'Manage Users', desc: 'View and manage platform users', icon: Users, color: 'from-purple-600 to-indigo-500' },
            { to: '/admin/reports', label: 'View Reports', desc: 'Review flagged content', icon: AlertTriangle, color: 'from-amber-600 to-orange-500' },
          ].map(link => (
            <Link key={link.to} to={link.to}
              className={`bg-gradient-to-br ${link.color} text-white rounded-2xl p-5 hover:opacity-90 transition-opacity`}>
              <link.icon size={24} className="mb-3 opacity-80" />
              <div className="font-bold text-sm">{link.label}</div>
              <div className="text-xs text-white/70 mt-1">{link.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
