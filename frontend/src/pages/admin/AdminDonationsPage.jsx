import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye, Flag, AlertCircle, ChevronLeft, ChevronRight, X, Search } from 'lucide-react';
import { donationApi } from '../../api/donations';
import StatusBadge from '../../components/StatusBadge';


export default function AdminDonationsPage() {
  const [donations, setDonations] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [flagging, setFlagging] = useState(null);

  const fetchDonations = async (p = 0) => {
    setLoading(true);
    try {
      const params = { page: p, size: 10 };
      if (search) params.search = search;
      const res = await donationApi.getAll(params);
      if (res.success) {
        const data = res.data;
        setDonations(data?.content || data || []);
        setTotalPages(data?.totalPages || 1);
      }
    } catch (e) { setError('Failed to load donations.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDonations(page); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchDonations(0);
  };

  const handleFlag = async (id) => {
    setFlagging(id);
    try {
      await donationApi.flag(id);
      fetchDonations(page);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to flag donation.');
    } finally { setFlagging(null); }
  };

  return (
    <>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Donations</h1>
          <p className="text-slate-500 text-sm mt-1">Review, monitor, and flag food listings</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by food name, donor, city…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl">Search</button>
        </form>

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
              <p className="text-slate-500 font-medium">No donations found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-slate-400 text-left border-b border-slate-100">
                      <th className="px-5 py-3 font-medium">Food Item</th>
                      <th className="px-5 py-3 font-medium">Donor</th>
                      <th className="px-5 py-3 font-medium">Category</th>
                      <th className="px-5 py-3 font-medium">Qty</th>
                      <th className="px-5 py-3 font-medium">City</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Created</th>
                      <th className="px-5 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {donations.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 text-sm font-medium text-slate-800">{d.foodName}</td>
                        <td className="px-5 py-3 text-xs text-slate-500">{d.donorName || '—'}</td>
                        <td className="px-5 py-3 text-xs text-slate-500">{d.category?.replace(/_/g, ' ')}</td>
                        <td className="px-5 py-3 text-sm text-slate-600">{d.quantity} {d.unit}</td>
                        <td className="px-5 py-3 text-xs text-slate-500">{d.city || '—'}</td>
                        <td className="px-5 py-3"><StatusBadge status={d.status} /></td>
                        <td className="px-5 py-3 text-xs text-slate-400">{new Date(d.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <Link to={`/donations/${d.id}`} className="text-xs text-brand-600 hover:text-brand-800 font-medium flex items-center gap-1">
                              <Eye size={13} /> View
                            </Link>
                            {d.status !== 'FLAGGED' && d.status !== 'CANCELLED' && (
                              <button onClick={() => handleFlag(d.id)} disabled={flagging === d.id}
                                className="text-xs text-amber-600 hover:text-amber-800 font-medium flex items-center gap-1">
                                <Flag size={13} /> Flag
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 p-4 border-t border-slate-100">
                  <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"><ChevronLeft size={16} /></button>
                  <span className="text-sm text-slate-500">Page {page + 1} of {totalPages}</span>
                  <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages - 1} className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"><ChevronRight size={16} /></button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
