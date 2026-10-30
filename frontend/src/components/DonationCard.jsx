import React from 'react';
import { MapPin, Clock, Package, Leaf, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const CATEGORY_ICONS = {
  COOKED_MEALS: '🍛',
  BAKERY_PRODUCTS: '🍞',
  FRUITS: '🍎',
  VEGETABLES: '🥦',
  PACKAGED_FOOD: '📦',
  DAIRY_PRODUCTS: '🥛',
  OTHER: '🥗',
};

const CATEGORY_LABELS = {
  COOKED_MEALS: 'Cooked Meals',
  BAKERY_PRODUCTS: 'Bakery',
  FRUITS: 'Fruits',
  VEGETABLES: 'Vegetables',
  PACKAGED_FOOD: 'Packaged Food',
  DAIRY_PRODUCTS: 'Dairy',
  OTHER: 'Other',
};

function timeUntil(isoString) {
  if (!isoString) return null;
  const diff = new Date(isoString) - new Date();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

export default function DonationCard({ donation, showDistance, distanceKm }) {
  const isUrgent = donation.pickupDeadline &&
    (new Date(donation.pickupDeadline) - new Date()) < 3 * 3600000;

  return (
    <Link
      to={`/marketplace/${donation.id}`}
      className="group block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-brand-300 transition-all duration-200"
    >
      {/* Image */}
      <div className="relative h-44 bg-gradient-to-br from-brand-50 to-emerald-100 overflow-hidden">
        {donation.imageUrl ? (
          <img
            src={donation.imageUrl}
            alt={donation.foodName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-5xl select-none">
            {CATEGORY_ICONS[donation.category] || '🥗'}
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
          <StatusBadge status={donation.status} />
          {isUrgent && (
            <span className="inline-flex items-center gap-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold animate-pulse">
              <AlertCircle size={10} /> Urgent
            </span>
          )}
        </div>
        {showDistance && distanceKm != null && (
          <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-xs text-slate-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <MapPin size={10} className="text-brand-600" />
            {distanceKm.toFixed(1)} km
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-slate-900 text-sm line-clamp-1 group-hover:text-brand-700 transition-colors">
            {donation.foodName}
          </h3>
          <span className="text-lg shrink-0">{CATEGORY_ICONS[donation.category] || '🥗'}</span>
        </div>

        <p className="text-xs text-slate-500 mb-3 line-clamp-2">{donation.description}</p>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Package size={12} className="text-brand-500 shrink-0" />
            <span className="font-medium">{donation.remainingQuantity} {donation.unit}</span>
            <span className="text-slate-400">remaining</span>
          </div>
          {donation.city && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin size={12} className="text-slate-400 shrink-0" />
              <span className="truncate">{donation.city}, {donation.state}</span>
            </div>
          )}
          {donation.pickupDeadline && (
            <div className={`flex items-center gap-1.5 text-xs font-medium ${isUrgent ? 'text-red-600' : 'text-slate-500'}`}>
              <Clock size={12} className="shrink-0" />
              {timeUntil(donation.pickupDeadline)}
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs">
            {['VEGETARIAN', 'VEG', 'VEGAN', 'JAIN'].includes(String(donation.dietaryType || '').toUpperCase()) ? (
              <span className="flex items-center gap-1 text-green-700 font-medium">
                <Leaf size={11} className="text-green-600" />
                {donation.dietaryType === 'VEGAN' ? 'Vegan' : 'Vegetarian'}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600 font-medium">
                <span className="text-xs">🍖</span>
                Non-Vegetarian
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400">{donation.donorOrganizationName}</span>
        </div>
      </div>
    </Link>
  );
}

