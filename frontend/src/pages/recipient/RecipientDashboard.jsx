import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, CheckCircle, Clock, AlertCircle, MapPin, Bell, ShieldAlert } from 'lucide-react';
import { analyticsApi } from '../../api/services';
import { claimApi } from '../../api/claims';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';


export default function RecipientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentClaims, setRecentClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if org is approved (from user context or stats)
  const orgStatus = user?.organizationVerificationStatus;
  const isPending = orgStatus && orgStatus !== 'APPROVED';

  useEffect(() => {
    Promise.all([
      analyticsApi.getRecipientAnalytics().catch(() => ({ success: false })),
      claimApi.getMyClaims({ page: 0, size: 5 }).catch(() => ({ success: false })),
    ]).then(([analyticsRes, claimsRes]) => {
      if (analyticsRes.success) setStats(analyticsRes.data);
      if (claimsRes.success) {
        const data = claimsRes.data;
        setRecentClaims(data?.content || data || []);
      }
    }).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recipient Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Track food claims and impact metrics</p>
        </div>

        {/* Pending verification banner */}
        {isPending && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-2xl p-4">
            <ShieldAlert size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 text-sm">Organisation Pending Verification</p>
              <p className="text-xs text-amber-700 mt-1">Your organisation is awaiting administrator approval. You can browse food listings but cannot claim until approved.</p>
            </div>
          </div>
        )}

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Package} label="Total Claims" value={stats.totalClaims ?? 0} color="brand" />
            <StatCard icon={CheckCircle} label="Completed" value={stats.completedClaims ?? 0} color="green" />
            <StatCard icon={Clock} label="Pending" value={stats.pendingClaims ?? 0} color="blue" />
            <StatCard icon={Bell} label="Meals Received" value={stats.totalMealsReceived ?? 0} color="purple" />
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-2 text-slate-500 text-sm">
            <AlertCircle size={16} /> Make your first claim to see analytics.
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/marketplace"
            className="flex items-center gap-4 bg-gradient-to-br from-brand-600 to-emerald-500 text-white rounded-2xl p-5 hover:opacity-90 transition-opacity">
            <div className="bg-white/20 rounded-xl p-3"><Package size={24} /></div>
            <div>
              <div className="font-bold">Browse Available Food</div>
              <div className="text-sm text-white/80">Find and claim surplus food nearby</div>
            </div>
          </Link>
          <Link to="/recipient/recommendations"
            className="flex items-center gap-4 bg-gradient-to-br from-purple-600 to-indigo-500 text-white rounded-2xl p-5 hover:opacity-90 transition-opacity">
            <div className="bg-white/20 rounded-xl p-3"><MapPin size={24} /></div>
            <div>
              <div className="font-bold">AI Recommendations</div>
              <div className="text-sm text-white/80">Smart matches based on your profile</div>
            </div>
          </Link>
        </div>

        {/* Recent Claims */}
        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Recent Claims</h3>
            <Link to="/recipient/claims" className="text-brand-600 text-sm font-medium hover:text-brand-800">View all →</Link>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />)}</div>
          ) : recentClaims.length === 0 ? (
            <div className="text-center py-12">
              <Package size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No claims yet. Browse the marketplace to get started.</p>
              <Link to="/marketplace" className="text-brand-600 text-sm font-semibold mt-2 inline-block hover:text-brand-800">Go to Marketplace →</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-slate-400 text-left border-b border-slate-100">
                    <th className="px-6 py-3 font-medium">Food Item</th>
                    <th className="px-6 py-3 font-medium">Quantity</th>
                    <th className="px-6 py-3 font-medium">Claim Date</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentClaims.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3 text-sm font-medium text-slate-800">{c.foodName || '—'}</td>
                      <td className="px-6 py-3 text-sm text-slate-500">{c.quantityClaimed} {c.unit}</td>
                      <td className="px-6 py-3 text-xs text-slate-500">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="px-6 py-3"><StatusBadge status={c.status} /></td>
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

