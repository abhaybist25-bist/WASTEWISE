import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Truck, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { claimApi } from '../../api/claims';
import StatusBadge from '../../components/StatusBadge';


const ACTION_CONFIG = {
  PENDING: { label: 'Accept Claim', nextStatus: 'ACCEPTED', color: 'bg-brand-600 hover:bg-brand-700 text-white' },
  ACCEPTED: { label: 'Confirm Pickup', nextStatus: 'PICKUP_CONFIRMED', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
};

export default function DonorClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');

  const fetch = async (p = 0) => {
    setLoading(true);
    try {
      const res = await claimApi.getDonorClaims({ page: p, size: 10 });
      if (res.success) {
        const data = res.data;
        setClaims(data?.content || data || []);
        setTotalPages(data?.totalPages || 1);
      }
    } catch (e) { setError('Failed to load claims.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(page); }, [page]);

  const handleAction = async (claimId, status) => {
    setActionLoading(claimId);
    try {
      await claimApi.updateStatus(claimId, { status });
      fetch(page);
    } catch (e) {
      setError(e?.response?.data?.message || 'Action failed.');
    } finally { setActionLoading(null); }
  };

  const handleReject = async (claimId) => {
    setActionLoading(claimId);
    try {
      await claimApi.updateStatus(claimId, { status: 'REJECTED' });
      fetch(page);
    } catch (e) { setError('Rejection failed.'); }
    finally { setActionLoading(null); }
  };

  return (
    <>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Claims on My Donations</h1>
          <p className="text-slate-500 text-sm mt-1">Approve, reject, or confirm pickup for each claim</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200">
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />)}</div>
          ) : claims.length === 0 ? (
            <div className="text-center py-16">
              <Truck size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No claims yet</p>
              <p className="text-slate-400 text-xs mt-1">Claims will appear here when recipients request your donations.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {claims.map(claim => (
                <div key={claim.id} className="p-5 hover:bg-slate-50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-slate-900">{claim.foodName || 'Food Donation'}</span>
                        <StatusBadge status={claim.status} />
                      </div>
                      <div className="text-xs text-slate-500 space-y-0.5">
                        <div>Claimed by: <span className="font-medium text-slate-700">{claim.recipientName || 'Recipient Organisation'}</span></div>
                        <div>Quantity: <span className="font-medium text-slate-700">{claim.quantityClaimed} {claim.unit}</span></div>
                        {claim.notes && <div>Notes: <span className="text-slate-600 italic">"{claim.notes}"</span></div>}
                        <div>Requested: {new Date(claim.createdAt).toLocaleDateString('en-IN')}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {ACTION_CONFIG[claim.status] && (
                        <button
                          onClick={() => handleAction(claim.id, ACTION_CONFIG[claim.status].nextStatus)}
                          disabled={actionLoading === claim.id}
                          className={`text-xs font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1 ${ACTION_CONFIG[claim.status].color}`}
                        >
                          {actionLoading === claim.id ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <CheckCircle size={13} />}
                          {ACTION_CONFIG[claim.status].label}
                        </button>
                      )}
                      {claim.status === 'PENDING' && (
                        <button
                          onClick={() => handleReject(claim.id)}
                          disabled={actionLoading === claim.id}
                          className="text-xs font-semibold px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1"
                        >
                          <XCircle size={13} /> Reject
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-slate-100">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-slate-500">Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages - 1} className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

