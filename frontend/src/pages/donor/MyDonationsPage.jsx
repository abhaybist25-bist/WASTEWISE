import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Plus, Eye, X, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { donationApi } from '../../api/donations';
import StatusBadge from '../../components/StatusBadge';


export default function MyDonationsPage() {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  const fetch = async (p = 0) => {
    setLoading(true);
    try {
      const res = await donationApi.getMyDonations({ page: p, size: 10 });
      if (res.success) {
        const data = res.data;
        setDonations(data?.content || data || []);
        setTotalPages(data?.totalPages || 1);
      }
    } catch (e) { setError('Failed to load donations.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(page); }, [page]);

  const handleCancel = async (id) => {
    setCancelling(true);
    try {
      await donationApi.cancel(id);
      setCancelId(null);
      fetch(page);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to cancel donation.');
    } finally { setCancelling(false); }
  };

  const canCancel = (status) => ['AVAILABLE', 'PARTIALLY_CLAIMED'].includes(status);

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Donations</h1>
            <p className="text-slate-500 text-sm mt-1">Manage all your food listings</p>
          </div>
          <Link to="/donor/create" className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm">
            <Plus size={16} /> New Donation
          </Link>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            <AlertCircle size={16} /> {error}
            <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200">
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />)}</div>
          ) : donations.length === 0 ? (
            <div className="text-center py-16">
              <Package size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No donations yet</p>
              <Link to="/donor/create" className="text-brand-600 text-sm font-semibold mt-2 inline-block hover:text-brand-800">Create your first donation →</Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-slate-400 text-left border-b border-slate-100">
                      <th className="px-6 py-3 font-medium">Food Item</th>
                      <th className="px-6 py-3 font-medium">Category</th>
                      <th className="px-6 py-3 font-medium">Qty Remaining</th>
                      <th className="px-6 py-3 font-medium">Pickup Deadline</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {donations.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 text-sm font-medium text-slate-800">{d.foodName}</td>
                        <td className="px-6 py-3 text-xs text-slate-500">{d.category?.replace(/_/g, ' ')}</td>
                        <td className="px-6 py-3 text-sm text-slate-600">{d.quantity} {d.unit}</td>
                        <td className="px-6 py-3 text-xs text-slate-500">{new Date(d.pickupDeadline).toLocaleDateString('en-IN')}</td>
                        <td className="px-6 py-3"><StatusBadge status={d.status} /></td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <Link to={`/donations/${d.id}`} className="text-xs text-brand-600 hover:text-brand-800 font-medium flex items-center gap-1">
                              <Eye size={13} /> View
                            </Link>
                            {canCancel(d.status) && (
                              <button
                                onClick={() => setCancelId(d.id)}
                                className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                              >
                                <X size={13} /> Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
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
            </>
          )}
        </div>

        {/* Cancel Confirm Modal */}
        {cancelId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
              <h3 className="font-bold text-slate-900 mb-2">Cancel Donation?</h3>
              <p className="text-sm text-slate-500 mb-5">This will mark the donation as cancelled. This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setCancelId(null)} className="flex-1 border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-50">
                  Keep it
                </button>
                <button onClick={() => handleCancel(cancelId)} disabled={cancelling}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60">
                  {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

