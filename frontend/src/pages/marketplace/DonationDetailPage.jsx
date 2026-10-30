import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  ArrowLeft, MapPin, Clock, Package, Shield, AlertCircle, CheckCircle,
  Leaf, Thermometer, Tag, Users, Calendar, Hash
} from 'lucide-react';
import { donationApi } from '../../api/donations';
import { claimApi } from '../../api/claims';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import Navbar from '../../components/Navbar';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function getDietaryBadge(type) {
  if (!type) return null;
  const upper = String(type).toUpperCase().replace(/-/g, '_');
  if (upper === 'VEGETARIAN' || upper === 'VEG') {
    return { label: '🟢 Vegetarian', className: 'bg-green-100 text-green-700' };
  }
  if (upper === 'VEGAN') {
    return { label: '🌱 Vegan', className: 'bg-emerald-100 text-emerald-700' };
  }
  if (upper === 'JAIN') {
    return { label: '🟢 Jain Vegetarian', className: 'bg-teal-100 text-teal-700' };
  }
  if (upper === 'HALAL') {
    return { label: '🟡 Halal', className: 'bg-amber-100 text-amber-700' };
  }
  if (upper === 'NON_VEGETARIAN' || upper === 'NON_VEG' || upper === 'NONVEG') {
    return { label: '🔴 Non-Vegetarian', className: 'bg-red-100 text-red-700' };
  }
  return { label: upper.replace(/_/g, ' '), className: 'bg-slate-100 text-slate-700' };
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <Icon size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
      <div>
        <div className="text-xs text-slate-400 font-medium">{label}</div>
        <div className="text-sm text-slate-700 font-medium">{value}</div>
      </div>
    </div>
  );
}

export default function DonationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Claim state
  const [claimQty, setClaimQty] = useState('');
  const [claimNote, setClaimNote] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimError, setClaimError] = useState('');

  useEffect(() => {
    donationApi.getById(id).then(res => {
      if (res.success) setDonation(res.data);
      else setError('Donation not found.');
    }).catch(() => setError('Failed to load donation.')).finally(() => setLoading(false));
  }, [id]);

  const handleClaim = async (e) => {
    e.preventDefault();
    if (!claimQty || parseFloat(claimQty) <= 0) { setClaimError('Enter a valid quantity.'); return; }
    if (parseFloat(claimQty) > donation.quantity) { setClaimError(`Maximum available: ${donation.quantity} ${donation.unit}.`); return; }
    setClaiming(true); setClaimError('');
    try {
      await claimApi.create({
        donationId: id,
        requestedQuantity: parseFloat(claimQty),
        quantityClaimed: parseFloat(claimQty),
        notes: claimNote
      });
      setClaimSuccess(true);
      // Refresh donation
      const res = await donationApi.getById(id);
      if (res.success) setDonation(res.data);
    } catch (err) {
      setClaimError(err?.response?.data?.message || 'Failed to claim. Please try again.');
    } finally { setClaiming(false); }
  };

  const isExpired = donation && new Date(donation.pickupDeadline) < new Date();
  const canClaim = isAuthenticated && user?.roles?.includes('ROLE_RECIPIENT') &&
    donation?.status !== 'CLAIMED' && donation?.status !== 'CANCELLED' && !isExpired;

  if (loading) return (
    <div className="min-h-screen bg-slate-50"><Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-slate-200 rounded-2xl" />
          <div className="h-8 bg-slate-200 rounded w-1/2" />
          <div className="h-4 bg-slate-200 rounded w-3/4" />
        </div>
      </div>
    </div>
  );

  if (error || !donation) return (
    <div className="min-h-screen bg-slate-50"><Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">{error || 'Donation not found'}</h2>
        <Link to="/marketplace" className="text-brand-600 hover:text-brand-800 font-medium text-sm">← Back to Marketplace</Link>
      </div>
    </div>
  );

  const deadlineDate = new Date(donation.pickupDeadline);
  const prepDate = donation.preparationTime ? new Date(donation.preparationTime) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Image + Title */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {donation.imageUrl ? (
                <img src={donation.imageUrl} alt={donation.foodName} className="w-full h-56 object-cover" />
              ) : (
                <div className="w-full h-56 bg-gradient-to-br from-brand-100 to-emerald-100 flex items-center justify-center">
                  <Leaf size={64} className="text-brand-300" />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h1 className="text-2xl font-bold text-slate-900">{donation.foodName}</h1>
                  <StatusBadge status={donation.status} />
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">{donation.description}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {donation.category && (
                    <span className="bg-brand-100 text-brand-700 text-xs font-medium px-3 py-1 rounded-full">
                      {donation.category.replace(/_/g, ' ')}
                    </span>
                  )}
                  {donation.dietaryType && (() => {
                    const badge = getDietaryBadge(donation.dietaryType);
                    return badge ? (
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${badge.className}`}>
                        {badge.label}
                      </span>
                    ) : null;
                  })()}
                  {isExpired && (
                    <span className="bg-red-100 text-red-700 text-xs font-medium px-3 py-1 rounded-full">Pickup Deadline Passed</span>
                  )}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 mb-2">Food Details</h2>
              <InfoRow icon={Package} label="Available Quantity" value={`${donation.quantity} ${donation.unit}`} />
              <InfoRow icon={Thermometer} label="Storage Conditions" value={donation.storageCondition?.replace(/_/g, ' ')} />
              <InfoRow icon={Calendar} label="Prepared On" value={prepDate ? prepDate.toLocaleString('en-IN') : null} />
              <InfoRow icon={Clock} label="Pickup Start" value={donation.pickupStartTime ? new Date(donation.pickupStartTime).toLocaleString('en-IN') : null} />
              <InfoRow icon={Clock} label="Pickup Deadline" value={deadlineDate.toLocaleString('en-IN')} />
              <InfoRow icon={Tag} label="Allergens" value={donation.allergens?.join(', ')} />
              <InfoRow icon={Hash} label="Packaging" value={donation.packagingDetails} />
            </div>

            {/* Food Safety */}
            <div className={`rounded-2xl border p-5 ${donation.safetyDeclarationAccepted ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Shield size={18} className={donation.safetyDeclarationAccepted ? 'text-green-600' : 'text-yellow-600'} />
                <span className="font-semibold text-sm">{donation.safetyDeclarationAccepted ? 'Food Safety Declaration Accepted' : 'Safety Declaration Pending'}</span>
              </div>
              {donation.safetyNotes && <p className="text-xs text-slate-600 leading-relaxed">{donation.safetyNotes}</p>}
              <p className="text-xs text-slate-400 mt-2">⚠️ This is a donor self-declaration. WasteWise does not independently certify food safety.</p>
            </div>

            {/* Map */}
            {donation.latitude && donation.longitude && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={16} className="text-brand-600" />
                  <h2 className="font-bold text-slate-900">Pickup Location</h2>
                </div>
                <p className="text-sm text-slate-500 mb-3">{[donation.pickupAddress, donation.city, donation.state, donation.postalCode].filter(Boolean).join(', ')}</p>
                <div className="rounded-xl overflow-hidden" style={{ height: 220 }}>
                  <MapContainer center={[donation.latitude, donation.longitude]} zoom={14} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[donation.latitude, donation.longitude]}>
                      <Popup>{donation.foodName}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            )}
            {!donation.latitude && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-slate-400" />
                  <h2 className="font-bold text-slate-900">Pickup Address</h2>
                </div>
                <p className="text-sm text-slate-600">{[donation.pickupAddress, donation.city, donation.state, donation.postalCode].filter(Boolean).join(', ') || 'Address provided upon claim approval.'}</p>
              </div>
            )}
          </div>

          {/* Sidebar - Claim */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="font-bold text-slate-900 mb-1">Donor</h2>
              <div className="flex items-center gap-3 mt-3">
                <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                  <Users size={18} className="text-brand-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-800">{donation.donorName || 'Verified Donor'}</div>
                  <div className="text-xs text-slate-400">{donation.donorOrganization || ''}</div>
                </div>
              </div>
              <div className="mt-4 text-xs text-slate-500 flex items-center gap-1">
                <Clock size={12} />
                Listed {new Date(donation.createdAt).toLocaleDateString('en-IN')}
              </div>
            </div>

            {/* Claim Form */}
            {canClaim && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h2 className="font-bold text-slate-900 mb-4">Claim This Donation</h2>
                {claimSuccess ? (
                  <div className="text-center py-4">
                    <CheckCircle size={32} className="text-brand-600 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-800">Claim submitted!</p>
                    <p className="text-xs text-slate-500 mt-1">The donor has been notified. Check your claims for updates.</p>
                    <Link to="/recipient/claims" className="mt-3 inline-block text-xs text-brand-600 font-semibold hover:text-brand-800">View My Claims →</Link>
                  </div>
                ) : (
                  <form onSubmit={handleClaim} className="space-y-4">
                    {claimError && (
                      <div className="flex items-center gap-2 bg-red-50 text-red-700 text-xs rounded-xl px-3 py-2 border border-red-200">
                        <AlertCircle size={14} /> {claimError}
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Quantity Needed (max: {donation.quantity} {donation.unit}) *
                      </label>
                      <input
                        type="number"
                        value={claimQty}
                        onChange={(e) => setClaimQty(e.target.value)}
                        placeholder={`e.g. ${Math.min(10, donation.quantity)}`}
                        max={donation.quantity}
                        step="0.1"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Notes (optional)</label>
                      <textarea
                        value={claimNote}
                        onChange={(e) => setClaimNote(e.target.value)}
                        placeholder="Any pickup preferences or notes for the donor…"
                        rows={2}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={claiming}
                      className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                    >
                      {claiming ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Claiming…</> : 'Claim Donation'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {!isAuthenticated && (
              <div className="bg-brand-50 rounded-2xl border border-brand-200 p-5 text-center">
                <Shield size={24} className="text-brand-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800 mb-1">Sign in to claim</p>
                <p className="text-xs text-slate-500 mb-3">Only verified recipient organisations can claim donations.</p>
                <Link to="/login" className="inline-block bg-brand-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-brand-700 transition-colors">Sign In</Link>
              </div>
            )}

            {isAuthenticated && !canClaim && !claimSuccess && (
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-center">
                <AlertCircle size={24} className="text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500">
                  {isExpired ? 'This donation has passed its pickup deadline.' :
                    donation.status === 'CLAIMED' ? 'This donation has been fully claimed.' :
                      donation.status === 'CANCELLED' ? 'This donation has been cancelled.' :
                        'Only approved recipient organisations can claim donations.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

