import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Clock, Star, RefreshCw, AlertCircle, Package } from 'lucide-react';
import { matchingApi } from '../../api/services';
import StatusBadge from '../../components/StatusBadge';


export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRecs = async () => {
    setLoading(true); setError('');
    try {
      const res = await matchingApi.getRecommendations();
      if (res.success) {
        setRecommendations(res.data || []);
      } else {
        setError(res.message || 'Could not load recommendations.');
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Recommendations unavailable.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRecs(); }, []);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="text-purple-500" size={24} /> Smart Recommendations
            </h1>
            <p className="text-slate-500 text-sm mt-1">AI-matched donations based on your location, capacity, and food preferences</p>
          </div>
          <button onClick={fetchRecs} disabled={loading}
            className="flex items-center gap-2 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8 text-center">
            <Sparkles size={40} className="text-purple-300 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-800 mb-2">Recommendations Unavailable</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">{error}</p>
            <Link to="/marketplace" className="mt-4 inline-block text-sm text-brand-600 font-semibold hover:text-brand-800">Browse Marketplace instead →</Link>
          </div>
        )}

        {!loading && !error && recommendations.length === 0 && (
          <div className="text-center py-16">
            <Package size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No recommendations right now</p>
            <p className="text-slate-400 text-xs mt-1">New donations matching your profile will appear here.</p>
            <Link to="/marketplace" className="text-brand-600 text-sm font-semibold mt-3 inline-block hover:text-brand-800">Browse All Donations →</Link>
          </div>
        )}

        {!loading && recommendations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, idx) => (
              <div key={rec.donationId || idx} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-sm">{rec.foodName || 'Food Donation'}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{rec.donorName || 'Verified Donor'}</p>
                  </div>
                  {rec.matchScore !== undefined && (
                    <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0">
                      <Star size={12} /> {Math.round(rec.matchScore)}% match
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  {rec.category && (
                    <span className="inline-block bg-brand-100 text-brand-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {rec.category.replace(/_/g, ' ')}
                    </span>
                  )}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Package size={12} /> {rec.quantity} {rec.unit}</span>
                    {rec.distance !== undefined && (
                      <span className="flex items-center gap-1"><MapPin size={12} /> {rec.distance.toFixed(1)} km</span>
                    )}
                    {rec.pickupDeadline && (
                      <span className="flex items-center gap-1"><Clock size={12} /> {new Date(rec.pickupDeadline).toLocaleDateString('en-IN')}</span>
                    )}
                  </div>
                </div>

                {rec.matchReasons && rec.matchReasons.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {rec.matchReasons.map((reason, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{reason}</span>
                    ))}
                  </div>
                )}

                <Link
                  to={`/donations/${rec.donationId}`}
                  className="block text-center bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold py-2 rounded-xl transition-colors"
                >
                  View & Claim
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
