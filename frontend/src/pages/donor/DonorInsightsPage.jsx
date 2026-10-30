import React, { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, AlertCircle, RefreshCw, Lightbulb, BarChart3 } from 'lucide-react';
import { aiApi } from '../../api/services';


export default function DonorInsightsPage() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInsights = async () => {
    setLoading(true); setError('');
    try {
      const res = await aiApi.getDonorInsights();
      if (res.success) setInsights(res.data);
      else setError(res.message || 'Failed to load AI insights.');
    } catch (e) {
      setError(e?.response?.data?.message || 'AI insights unavailable. Gemini API key may not be configured.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchInsights(); }, []);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="text-amber-500" size={24} /> AI Waste Insights
            </h1>
            <p className="text-slate-500 text-sm mt-1">Powered by Gemini AI — personalized recommendations based on your donation history</p>
          </div>
          <button onClick={fetchInsights} disabled={loading}
            className="flex items-center gap-2 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}
          </div>
        )}

        {!loading && error && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
            <Sparkles size={40} className="text-amber-400 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-800 mb-2">AI Insights Unavailable</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">{error}</p>
            <p className="text-xs text-slate-400 mt-3">To enable AI insights, configure your Gemini API key in the backend environment file.</p>
            <button onClick={fetchInsights} className="mt-4 text-sm text-brand-600 font-semibold hover:text-brand-800">Try again →</button>
          </div>
        )}

        {!loading && insights && (
          <>
            {/* Summary */}
            {insights.summary && (
              <div className="bg-gradient-to-br from-brand-50 to-emerald-50 border border-brand-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <div className="bg-brand-600 text-white p-2 rounded-xl flex-shrink-0">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">AI Summary</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{insights.summary}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Patterns */}
            {insights.patterns && insights.patterns.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <BarChart3 size={18} className="text-blue-600" /> Identified Patterns
                </h3>
                <div className="space-y-3">
                  {insights.patterns.map((pattern, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                      <p className="text-sm text-slate-700">{pattern}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {insights.recommendations && insights.recommendations.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Lightbulb size={18} className="text-amber-500" /> Recommendations
                </h3>
                <div className="space-y-3">
                  {insights.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">💡</div>
                      <p className="text-sm text-slate-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Waste Reduction Score */}
            {insights.wasteReductionScore !== undefined && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-brand-600" /> Waste Reduction Score
                </h3>
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-extrabold text-brand-600">{insights.wasteReductionScore}</div>
                  <div>
                    <div className="text-sm text-slate-500 mb-2">/ 100</div>
                    <div className="w-48 bg-slate-100 rounded-full h-3">
                      <div
                        className="bg-brand-600 rounded-full h-3 transition-all duration-700"
                        style={{ width: `${insights.wasteReductionScore}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">Based on your donation frequency and completion rate</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

