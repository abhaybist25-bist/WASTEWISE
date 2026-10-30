import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Clock, AlertCircle, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';
import { adminApi, reportApi } from '../../api/services';
import StatusBadge from '../../components/StatusBadge';


export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');

  const fetchReports = async (p = 0) => {
    setLoading(true);
    try {
      const res = await reportApi.getAll({ page: p, size: 10 });
      if (res.success) {
        const data = res.data;
        setReports(data?.content || data || []);
        setTotalPages(data?.totalPages || 1);
      }
    } catch (e) { setError('Failed to load reports.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(page); }, [page]);

  const handleUpdateStatus = async (reportId, status) => {
    setActionLoading(reportId);
    try {
      await reportApi.updateStatus(reportId, { status });
      fetchReports(page);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to update report.');
    } finally { setActionLoading(null); }
  };

  return (
    <>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Flags</h1>
          <p className="text-slate-500 text-sm mt-1">Review flagged content and user reports</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            <AlertCircle size={16} /> {error}
            <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200">
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />)}</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-16">
              <AlertTriangle size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No reports found</p>
              <p className="text-slate-400 text-xs mt-1">Reports from users will appear here when submitted.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reports.map(report => (
                <div key={report.id} className="p-5 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-slate-900">Report #{report.id?.slice(-6)}</span>
                        <StatusBadge status={report.status} />
                      </div>
                      <div className="text-xs text-slate-500 space-y-1 mt-2">
                        {report.reason && <div className="text-sm text-slate-700"><strong>Reason:</strong> {report.reason}</div>}
                        {report.description && <div className="line-clamp-2 text-slate-500">{report.description}</div>}
                        <div className="flex flex-wrap gap-3 mt-1">
                          {report.reporterName && <span>👤 Reporter: {report.reporterName}</span>}
                          {report.donationId && <span>📦 Donation: {report.donationId.slice(-8)}</span>}
                          <span>📅 {new Date(report.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {report.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(report.id, 'REVIEWED')}
                            disabled={actionLoading === report.id}
                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-xl"
                          >
                            <Eye size={13} /> Mark Reviewed
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(report.id, 'RESOLVED')}
                            disabled={actionLoading === report.id}
                            className="flex items-center gap-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3 py-2 rounded-xl"
                          >
                            <CheckCircle size={13} /> Resolve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(report.id, 'DISMISSED')}
                            disabled={actionLoading === report.id}
                            className="flex items-center gap-1 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold px-3 py-2 rounded-xl"
                          >
                            <XCircle size={13} /> Dismiss
                          </button>
                        </>
                      )}
                      {report.status === 'REVIEWED' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(report.id, 'RESOLVED')}
                            disabled={actionLoading === report.id}
                            className="flex items-center gap-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3 py-2 rounded-xl"
                          >
                            <CheckCircle size={13} /> Resolve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(report.id, 'DISMISSED')}
                            disabled={actionLoading === report.id}
                            className="flex items-center gap-1 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold px-3 py-2 rounded-xl"
                          >
                            <XCircle size={13} /> Dismiss
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
