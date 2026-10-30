import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, List, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { donationApi } from '../../api/donations';
import DonationCard from '../../components/DonationCard';
import Navbar from '../../components/Navbar';

// Fix Leaflet default marker icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CATEGORIES = ['ALL', 'COOKED_MEALS', 'BAKERY', 'FRUITS', 'VEGETABLES', 'PACKAGED_FOOD', 'DAIRY', 'OTHER'];
const SORT_OPTIONS = [
  { value: 'createdAt,desc', label: 'Newest First' },
  { value: 'pickupDeadline,asc', label: 'Pickup Deadline' },
  { value: 'quantity,desc', label: 'Most Quantity' },
];

export default function MarketplacePage() {
  const [donations, setDonations] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    category: 'ALL',
    page: 0,
    size: 12,
    sort: 'createdAt,desc',
  });

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        size: filters.size,
        sort: filters.sort,
      };
      if (filters.search) params.search = filters.search;
      if (filters.category !== 'ALL') params.category = filters.category;

      const res = await donationApi.getAvailable(params);
      if (res.success) {
        setDonations(res.data?.content || res.data || []);
        setTotalPages(res.data?.totalPages || 1);
        setTotalItems(res.data?.totalElements || 0);
      }
    } catch (e) {
      console.error('Failed to fetch donations', e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchDonations(); }, [fetchDonations]);

  const setFilter = (key, value) => {
    setFilters((p) => ({ ...p, [key]: value, page: key !== 'page' ? 0 : value }));
  };

  const mapCenter = donations.find(d => d.latitude && d.longitude)
    ? [donations.find(d => d.latitude && d.longitude).latitude, donations.find(d => d.latitude && d.longitude).longitude]
    : [12.9716, 77.5946]; // Bengaluru default

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Food Marketplace</h1>
          <p className="text-slate-500 text-sm mt-1">
            {totalItems > 0 ? `${totalItems} available donation${totalItems !== 1 ? 's' : ''}` : 'Browse available surplus food donations'}
          </p>
        </div>

        {/* Search + Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search food, location, donor…"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <select
            value={filters.sort}
            onChange={(e) => setFilter('sort', e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            onClick={() => setShowFilters(p => !p)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-700 border-slate-200 hover:border-brand-400'}`}
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
          <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-white">
            <button onClick={() => setViewMode('grid')} className={`px-3 py-2.5 ${viewMode === 'grid' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
              <List size={18} />
            </button>
            <button onClick={() => setViewMode('map')} className={`px-3 py-2.5 ${viewMode === 'map' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
              <MapPin size={18} />
            </button>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex gap-2 flex-wrap mb-5">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter('category', cat)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${filters.category === cat ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-400'}`}
            >
              {cat === 'ALL' ? 'All Categories' : cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Map View */}
        {viewMode === 'map' && (
          <div className="rounded-2xl overflow-hidden border border-slate-200 mb-6" style={{ height: 450 }}>
            <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
              />
              {donations.filter(d => d.latitude && d.longitude).map(d => (
                <Marker key={d.id} position={[d.latitude, d.longitude]}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{d.foodName}</p>
                      <p className="text-slate-500">{d.quantity} {d.unit}</p>
                      <Link to={`/donations/${d.id}`} className="text-brand-600 font-medium text-xs">View Details →</Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 h-64 animate-pulse">
                    <div className="h-40 bg-slate-100 rounded-t-2xl" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-slate-100 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : donations.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🍽️</div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No donations found</h3>
                <p className="text-slate-400 text-sm">Try different filters or check back later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {donations.map(d => <DonationCard key={d.id} donation={d} />)}
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setFilter('page', filters.page - 1)}
              disabled={filters.page === 0}
              className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronLeft size={18} />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setFilter('page', i)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${i === filters.page ? 'bg-brand-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setFilter('page', filters.page + 1)}
              disabled={filters.page === totalPages - 1}
              className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

