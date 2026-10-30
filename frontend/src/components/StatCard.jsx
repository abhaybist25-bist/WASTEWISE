import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'brand', onClick }) {
  const colorMap = {
    brand: 'bg-brand-50 text-brand-600 border-brand-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer hover:border-brand-300' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value ?? '—'}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${colorMap[color]}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      {trend != null && (
        <div className="flex items-center gap-1 text-xs">
          {trend > 0 ? (
            <TrendingUp size={12} className="text-green-500" />
          ) : trend < 0 ? (
            <TrendingDown size={12} className="text-red-500" />
          ) : (
            <Minus size={12} className="text-slate-400" />
          )}
          <span className={trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-500' : 'text-slate-400'}>
            {trend > 0 ? '+' : ''}{trend}% this month
          </span>
        </div>
      )}
    </div>
  );
}

