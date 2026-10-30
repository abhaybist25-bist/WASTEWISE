import React, { useEffect, useState } from 'react';
import { Users, Search, AlertCircle, ChevronLeft, ChevronRight, X, Shield, ShieldOff } from 'lucide-react';
import { adminApi } from '../../api/services';
import StatusBadge from '../../components/StatusBadge';


export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = async (p = 0) => {
    setLoading(true);
    try {
      const params = { page: p, size: 15 };
      if (search) params.search = search;
      const res = await adminApi.getAllUsers(params);
      if (res.success) {
        const data = res.data;
        setUsers(data?.content || data || []);
        setTotalPages(data?.totalPages || 1);
      }
    } catch (e) { setError('Failed to load users.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(page); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchUsers(0);
  };

  const handleToggleStatus = async (userId, currentActive) => {
    setActionLoading(userId);
    try {
      await adminApi.toggleUserStatus(userId, { active: !currentActive });
      fetchUsers(page);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to update user status.');
    } finally { setActionLoading(null); }
  };

  const getRoleBadge = (role) => {
    const colors = {
      ROLE_ADMIN: 'bg-red-100 text-red-700',
      ROLE_DONOR: 'bg-brand-100 text-brand-700',
      ROLE_RECIPIENT: 'bg-blue-100 text-blue-700',
      ROLE_VOLUNTEER: 'bg-purple-100 text-purple-700',
    };
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors[role] || 'bg-slate-100 text-slate-600'}`}>
        {role?.replace('ROLE_', '')}
      </span>
    );
  };

  return (
    <>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Users</h1>
          <p className="text-slate-500 text-sm mt-1">View and manage all platform users</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…"
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
          ) : users.length === 0 ? (
            <div className="text-center py-16">
              <Users size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No users found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-slate-400 text-left border-b border-slate-100">
                      <th className="px-5 py-3 font-medium">Name</th>
                      <th className="px-5 py-3 font-medium">Email</th>
                      <th className="px-5 py-3 font-medium">Role</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Joined</th>
                      <th className="px-5 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 text-sm font-medium text-slate-800">{u.name}</td>
                        <td className="px-5 py-3 text-xs text-slate-500 font-mono">{u.email}</td>
                        <td className="px-5 py-3">{u.roles?.map(r => <span key={r}>{getRoleBadge(r)}</span>) || getRoleBadge(u.role)}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {u.active !== false ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                        <td className="px-5 py-3">
                          {!u.roles?.includes('ROLE_ADMIN') && u.role !== 'ROLE_ADMIN' && (
                            <button
                              onClick={() => handleToggleStatus(u.id, u.active !== false)}
                              disabled={actionLoading === u.id}
                              className={`text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors ${
                                u.active !== false
                                  ? 'text-red-600 border border-red-200 hover:bg-red-50'
                                  : 'text-brand-600 border border-brand-200 hover:bg-brand-50'
                              }`}
                            >
                              {u.active !== false ? <><ShieldOff size={12} /> Suspend</> : <><Shield size={12} /> Activate</>}
                            </button>
                          )}
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
