import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, CheckCircle, Truck, Clock, AlertCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { claimApi } from '../../api/claims';
import StatusBadge from '../../components/StatusBadge';


export default function MyClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');

  const fetchClaims = async (p = 0) => {
    setLoading(true);
    try {
      const res = await claimApi.getMyClaims({ page: p, size: 10 });
      if (res.success) {
        const data = res.data;
        setClaims(data?.content || data || []);
        setTotalPages(data?.totalPages || 1);
      }
    } catch (e) { setError('Failed to load claims.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchClaims(page); }, [page]);

  const handleConfirmDelivery = async (claimId) => {
    setActionLoading(claimId);
    try {
      await claimApi.updateStatus(claimId, { status: 'DELIVERED' });
      fetchClaims(page);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to confirm delivery.');
    } finally { setActionLoading(null); }
  };

  const statusTimeline = (status) => {
    const steps = ['PENDING', 'ACCEPTED', 'PICKUP_CONFIRMED', 'DELIVERED'];
    const currentIdx = steps.indexOf(status);
    return (
      <div className="flex items-center gap-1 mt-2">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`w-2 h-2 rounded-full ${i <= currentIdx ? 'bg-brand-600' : 'bg-slate-200'}`} />
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < currentIdx ? 'bg-brand-600' : 'bg-slate-200'}`} />}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Claims</h1>
          <p className="text-slate-500 text-sm mt-1">Track your food claim requests and deliveries</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            <AlertCircle size={16} /> {error}
            <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200">
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />)}</div>
          ) : claims.length === 0 ? (
            <div className="text-center py-16">
              <Package size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No claims yet</p>
              <Link to="/marketplace" className="text-brand-600 text-sm font-semibold mt-2 inline-block hover:text-brand-800">Browse available food →</Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {claims.map(claim => (
                <div key={claim.id} className="p-5 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link to={`/donations/${claim.donationId}`} className="font-semibold text-sm text-slate-900 hover:text-brand-700 transition-colors">
                          {claim.foodName || 'Food Donation'}
                        </Link>
                        <StatusBadge status={claim.status} />
                      </div>
                      <div className="text-xs text-slate-500 space-y-0.5">
                        <div>Donor: <span className="font-medium text-slate-700">{claim.donorName || 'Verified Donor'}</span></div>
                        <div>Quantity: <span className="font-medium text-slate-700">{claim.quantityClaimed} {claim.unit}</span></div>
                        <div>Claimed: {new Date(claim.createdAt).toLocaleDateString('en-IN')}</div>
                      </div>
                      {statusTimeline(claim.status)}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {claim.status === 'PICKUP_CONFIRMED' && (
                        <button
                          onClick={() => handleConfirmDelivery(claim.id)}
                          disabled={actionLoading === claim.id}
                          className="flex items-center gap-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                        >
                          {actionLoading === claim.id ? (
                            <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          ) : (
                            <CheckCircle size={13} />
                          )}
                          Confirm Delivery
                        </button>
                      )}
                      {claim.status === 'ACCEPTED' && (
                        <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium bg-blue-50 px-3 py-1.5 rounded-lg">
                          <Truck size={13} /> Awaiting pickup
                        </div>
                      )}
                      {claim.status === 'DELIVERED' && (
                        <div className="flex items-center gap-1.5 text-xs text-brand-600 font-medium bg-brand-50 px-3 py-1.5 rounded-lg">
                          <CheckCircle size={13} /> Completed
                        </div>
                      )}
                      {claim.status === 'REJECTED' && (
                        <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium bg-red-50 px-3 py-1.5 rounded-lg">
                          <X size={13} /> Rejected
                        </div>
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
