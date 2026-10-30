import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, CheckCircle, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { analyticsApi } from '../../api/services';
import { donationApi } from '../../api/donations';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';


const COLORS = ['#16a34a', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#fbbf24', '#f87171'];

export default function DonorDashboard() {
  const [stats, setStats] = useState(null);
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.getDonorAnalytics().catch(() => ({ data: null })),
      donationApi.getMyDonations({ page: 0, size: 5 }).catch(() => ({ data: { content: [] } })),
    ]).then(([analyticsRes, donationsRes]) => {
      if (analyticsRes.success) setStats(analyticsRes.data);
      const donations = donationsRes?.data?.content || donationsRes?.data || [];
      setRecentDonations(Array.isArray(donations) ? donations : []);
    }).finally(() => setLoading(false));
  }, []);

  const categoryData = stats?.donationsByCategory
    ? Object.entries(stats.donationsByCategory).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))
    : [];

  const monthlyData = stats?.donationsByMonth
    ? Object.entries(stats.donationsByMonth).map(([name, count]) => ({ name, count }))
    : [];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Donor Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Track your food rescue impact</p>
          </div>
          <Link
            to="/donor/create"
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Plus size={16} /> New Donation
          </Link>
        </div>

        {/* Stat Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Package} label="Total Donations" value={stats.totalDonations ?? 0} color="brand" />
            <StatCard icon={CheckCircle} label="Completed" value={stats.completedDonations ?? 0} color="green" />
            <StatCard icon={Clock} label="Active Listings" value={stats.activeDonations ?? 0} color="blue" />
            <StatCard icon={TrendingUp} label="Meals Rescued" value={stats.estimatedMealsRescued ?? 0} color="purple" />
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-2 text-yellow-700 text-sm">
            <AlertCircle size={16} /> Analytics not available. Create your first donation to see stats.
          </div>
        )}

        {/* Charts */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {monthlyData.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="font-bold text-slate-900 mb-4">Monthly Donations</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {categoryData.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="font-bold text-slate-900 mb-4">Donations by Category</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                      {categoryData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Recent Donations Table */}
        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Recent Donations</h3>
            <Link to="/donor/donations" className="text-brand-600 text-sm font-medium hover:text-brand-800">View all →</Link>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />)}
            </div>
          ) : recentDonations.length === 0 ? (
            <div className="text-center py-12">
              <Package size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No donations yet.</p>
              <Link to="/donor/create" className="text-brand-600 text-sm font-semibold mt-2 inline-block hover:text-brand-800">Create your first donation →</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-slate-400 text-left border-b border-slate-100">
                    <th className="px-6 py-3 font-medium">Food Item</th>
                    <th className="px-6 py-3 font-medium">Quantity</th>
                    <th className="px-6 py-3 font-medium">Pickup Deadline</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentDonations.map(d => (
                    <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 text-sm font-medium text-slate-800">{d.foodName}</td>
                      <td className="px-6 py-3 text-sm text-slate-500">{d.quantity} {d.unit}</td>
                      <td className="px-6 py-3 text-sm text-slate-500">{new Date(d.pickupDeadline).toLocaleDateString('en-IN')}</td>
                      <td className="px-6 py-3"><StatusBadge status={d.status} /></td>
                      <td className="px-6 py-3">
                        <Link to={`/donations/${d.id}`} className="text-xs text-brand-600 hover:text-brand-800 font-medium">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

