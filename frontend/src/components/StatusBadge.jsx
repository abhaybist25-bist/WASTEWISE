import React from 'react';

const STATUS_CONFIG = {
  AVAILABLE: { label: 'Available', class: 'bg-green-100 text-green-800 border-green-200' },
  PARTIALLY_CLAIMED: { label: 'Partially Claimed', class: 'bg-blue-100 text-blue-800 border-blue-200' },
  FULLY_CLAIMED: { label: 'Fully Claimed', class: 'bg-purple-100 text-purple-800 border-purple-200' },
  PICKUP_IN_PROGRESS: { label: 'Pickup In Progress', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  COMPLETED: { label: 'Completed', class: 'bg-slate-100 text-slate-700 border-slate-200' },
  CANCELLED: { label: 'Cancelled', class: 'bg-red-100 text-red-700 border-red-200' },
  EXPIRED: { label: 'Expired', class: 'bg-orange-100 text-orange-800 border-orange-200' },
  FLAGGED: { label: 'Flagged', class: 'bg-red-100 text-red-800 border-red-300' },
  // Claim statuses
  PENDING: { label: 'Pending', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  ACCEPTED: { label: 'Accepted', class: 'bg-green-100 text-green-800 border-green-200' },
  REJECTED: { label: 'Rejected', class: 'bg-red-100 text-red-700 border-red-200' },
  PICKUP_CONFIRMED: { label: 'Pickup Confirmed', class: 'bg-blue-100 text-blue-800 border-blue-200' },
  DELIVERED: { label: 'Delivered ✓', class: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  // Verification
  APPROVED: { label: 'Approved', class: 'bg-green-100 text-green-800 border-green-200' },
};

export default function StatusBadge({ status, size = 'sm' }) {
  const config = STATUS_CONFIG[status] || { label: status, class: 'bg-slate-100 text-slate-600 border-slate-200' };
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${config.class} ${sizeClass}`}>
      {config.label}
    </span>
  );
}

