import React, { useEffect, useState } from 'react';
import { Building2, CheckCircle, XCircle, Clock, AlertCircle, ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import { adminApi } from '../../api/services';
import StatusBadge from '../../components/StatusBadge';


export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('PENDING'); // PENDING | ALL

  const fetchOrgs = async (p = 0) => {
    setLoading(true);
    try {
      const res = tab === 'PENDING'
        ? await adminApi.getPendingOrganizations({ page: p, size: 10 })
        : await adminApi.getAllOrganizations({ page: p, size: 10 });
      if (res.success) {
        const data = res.data;
        setOrgs(data?.content || data || []);
        setTotalPages(data?.totalPages || 1);
      }
    } catch (e) { setError('Failed to load organisations.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrgs(page); }, [page, tab]);

  const handleVerification = async (orgId, status) => {
    setActionLoading(orgId);
    try {
      await adminApi.updateOrganizationVerification(orgId, { verificationStatus: status });
      fetchOrgs(page);
    } catch (e) {
      setError(e?.response?.data?.message || 'Action failed.');
    } finally { setActionLoading(null); }
  };

  return (
    <>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Organisations</h1>
          <p className="text-slate-500 text-sm mt-1">Review and approve recipient organisations</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 pb-0">
          {['PENDING', 'ALL'].map(t => (
            <button key={t} onClick={() => { setTab(t); setPage(0); }}
              className={`text-sm font-medium px-4 py-2.5 border-b-2 transition-colors ${tab === t ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              {t === 'PENDING' ? '⏳ Pending Approval' : '📋 All Organisations'}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200">
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />)}</div>
          ) : orgs.length === 0 ? (
            <div className="text-center py-16">
              <Building2 size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">{tab === 'PENDING' ? 'No pending approvals' : 'No organisations found'}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {orgs.map(org => (
                <div key={org.id} className="p-5 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-slate-900">{org.name}</span>
                        <StatusBadge status={org.verificationStatus || org.status} />
                        {org.type && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{org.type?.replace(/_/g, ' ')}</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 space-y-0.5">
                        {org.description && <div className="line-clamp-1">{org.description}</div>}
                        <div className="flex flex-wrap gap-3">
                          {org.city && <span>📍 {org.city}{org.state ? `, ${org.state}` : ''}</span>}
                          {org.phone && <span>📞 {org.phone}</span>}
                          {org.capacity && <span>🍽️ Capacity: {org.capacity}</span>}
                        </div>
                        {org.registeredAt && <div>Registered: {new Date(org.registeredAt).toLocaleDateString('en-IN')}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(org.verificationStatus === 'PENDING' || org.status === 'PENDING') && (
                        <>
                          <button
                            onClick={() => handleVerification(org.id, 'APPROVED')}
                            disabled={actionLoading === org.id}
                            className="flex items-center gap-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                          >
                            {actionLoading === org.id ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <CheckCircle size={13} />}
                            Approve
                          </button>
                          <button
                            onClick={() => handleVerification(org.id, 'REJECTED')}
                            disabled={actionLoading === org.id}
                            className="flex items-center gap-1 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold px-4 py-2 rounded-xl"
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-slate-100">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"><ChevronLeft size={16} /></button>
              <span className="text-sm text-slate-500">Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages - 1} className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"><ChevronRight size={16} /></button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
