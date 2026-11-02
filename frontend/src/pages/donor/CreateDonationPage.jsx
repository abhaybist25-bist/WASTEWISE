import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, MapPin, Clock, Shield, AlertCircle, CheckCircle, ChevronRight, ChevronLeft, Leaf,
  UploadCloud, Trash2, Camera, Link2, X, Image as ImageIcon
} from 'lucide-react';
import { donationApi } from '../../api/donations';


const CATEGORIES = ['COOKED_MEALS', 'BAKERY', 'FRUITS', 'VEGETABLES', 'PACKAGED_FOOD', 'DAIRY', 'OTHER'];
const UNITS = ['kg', 'g', 'litres', 'plates', 'portions', 'packets', 'boxes', 'pieces', 'servings'];
const STORAGE = ['ROOM_TEMPERATURE', 'REFRIGERATED', 'FROZEN', 'COOL_DRY_PLACE'];
const ALLERGENS_LIST = ['Gluten', 'Dairy', 'Eggs', 'Nuts', 'Peanuts', 'Shellfish', 'Soy', 'Sesame', 'Fish'];

function FormField({ label, required, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

export default function CreateDonationPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageMode, setImageMode] = useState('upload'); // 'upload' | 'url'
  const [imageInfo, setImageInfo] = useState(null); // { name, size }

  const [form, setForm] = useState({
    foodName: '', description: '', category: 'COOKED_MEALS',
    imageUrl: '', quantity: '', unit: 'kg',
    dietaryType: 'VEGETARIAN', preparationTime: '', safeConsumptionDeadline: '',
    storageCondition: 'ROOM_TEMPERATURE', allergens: [],
    packagingDetails: '', pickupAddress: '', city: '', state: '', postalCode: '',
    latitude: '', longitude: '', pickupStartTime: '', pickupDeadline: '',
    safetyDeclarationAccepted: false, safetyNotes: '',
  });

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setError(''); };
  const toggleAllergen = (a) => set('allergens', form.allergens.includes(a) ? form.allergens.filter(x => x !== a) : [...form.allergens, a]);

  const getLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set('latitude', pos.coords.latitude.toFixed(6));
        set('longitude', pos.coords.longitude.toFixed(6));
        setLocating(false);
      },
      () => { setLocating(false); alert('Could not get location. Please enter manually.'); }
    );
  };

  const processImageFile = useCallback((file) => {
    if (!file || !file.type?.startsWith('image/')) {
      setError('Please select or paste a valid image file (JPEG, PNG, WEBP, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1200;
        let { width, height } = img;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);

        const approximateKb = Math.round((dataUrl.length * (3 / 4)) / 1024);
        setImageInfo({
          name: file.name || 'Pasted Image',
          size: approximateKb > 1024 ? `${(approximateKb / 1024).toFixed(1)} MB` : `${approximateKb} KB`
        });
        set('imageUrl', dataUrl);
        setError('');
      };
      img.onerror = () => {
        setError('Failed to process image. Please try a different photo.');
      };
      img.src = e.target.result;
    };
    reader.onerror = () => {
      setError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  }, []);

  // Listen for clipboard paste on step 1 (allows Ctrl+V anywhere on the page)
  useEffect(() => {
    const handleGlobalPaste = (e) => {
      if (step !== 1) return;
      const target = e.target;
      const isInput = target?.tagName === 'INPUT' && target?.type !== 'file';
      const isTextarea = target?.tagName === 'TEXTAREA';

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const blob = items[i].getAsFile();
          if (blob) {
            e.preventDefault();
            processImageFile(blob);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [step, processImageFile]);

  const validateStep1 = () => {
    if (!form.foodName.trim()) return 'Food name is required.';
    if (!form.description.trim()) return 'Description is required.';
    if (!form.quantity || parseFloat(form.quantity) <= 0) return 'Enter a valid quantity.';
    if (!form.safeConsumptionDeadline) return 'Safe consumption deadline is required.';
    return null;
  };

  const validateStep2 = () => {
    if (!form.pickupAddress.trim()) return 'Pickup address is required.';
    if (!form.city.trim()) return 'City is required.';
    if (!form.pickupDeadline) return 'Pickup deadline is required.';
    if (new Date(form.pickupDeadline) < new Date()) return 'Pickup deadline must be in the future.';
    return null;
  };

  const handleNext = () => {
    const err = step === 1 ? validateStep1() : null;
    if (err) { setError(err); return; }
    setStep(s => s + 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateStep2();
    if (err) { setError(err); return; }
    if (!form.safetyDeclarationAccepted) { setError('You must accept the food safety declaration before submitting.'); return; }

    setLoading(true);
    try {
      const toIso = (dt) => {
        if (!dt) return undefined;
        try {
          const d = new Date(dt);
          return isNaN(d.getTime()) ? undefined : d.toISOString();
        } catch {
          return undefined;
        }
      };

      const payload = {
        ...form,
        preparationTime: toIso(form.preparationTime),
        safeConsumptionDeadline: toIso(form.safeConsumptionDeadline),
        pickupStartTime: toIso(form.pickupStartTime),
        pickupDeadline: toIso(form.pickupDeadline),
        quantity: parseFloat(form.quantity),
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
        allergens: form.allergens.length > 0 ? form.allergens : undefined,
      };
      // Remove empty strings and undefined
      Object.keys(payload).forEach(k => {
        if (payload[k] === '' || payload[k] === undefined) delete payload[k];
      });

      const res = await donationApi.create(payload);
      if (res.success) {
        navigate('/donor/donations', { state: { successMessage: 'Donation listed successfully!' } });
      } else {
        setError(res.message || 'Failed to create donation.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create donation. Check all fields.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white";

  return (
    <>
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">List Surplus Food</h1>
          <div className="flex items-center gap-3">
            {['Food Details', 'Location & Pickup', 'Safety & Submit'].map((label, i) => (
              <React.Fragment key={label}>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step > i + 1 ? 'bg-brand-600 text-white' : step === i + 1 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {step > i + 1 ? <CheckCircle size={14} /> : i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${step === i + 1 ? 'text-brand-700' : 'text-slate-400'}`}>{label}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-1 rounded-full ${step > i + 1 ? 'bg-brand-600' : 'bg-slate-100'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
            <AlertCircle size={16} className="flex-shrink-0" /> {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          {/* Step 1: Food Details */}
          {step === 1 && (
            <>
              <FormField label="Food Name" required>
                <input type="text" value={form.foodName} onChange={e => set('foodName', e.target.value)}
                  placeholder="e.g. Vegetable Biryani, Bread Rolls…" className={inputCls} />
              </FormField>

              <FormField label="Description" required>
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  placeholder="Describe the food, how it was prepared, portion size…"
                  rows={3} className={`${inputCls} resize-none`} />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Category" required>
                  <select value={form.category} onChange={e => set('category', e.target.value)} className={inputCls}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                  </select>
                </FormField>
                <FormField label="Dietary Type" required>
                  <select value={form.dietaryType} onChange={e => set('dietaryType', e.target.value)} className={inputCls}>
                    <option value="VEGETARIAN">🟢 Vegetarian</option>
                    <option value="VEGAN">🌱 Vegan</option>
                    <option value="JAIN">🟢 Jain Vegetarian</option>
                    <option value="NON_VEGETARIAN">🔴 Non-Vegetarian</option>
                  </select>
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Quantity" required>
                  <input type="number" value={form.quantity} onChange={e => set('quantity', e.target.value)}
                    placeholder="e.g. 50" min="0.1" step="0.1" className={inputCls} />
                </FormField>
                <FormField label="Unit" required>
                  <select value={form.unit} onChange={e => set('unit', e.target.value)} className={inputCls}>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </FormField>
              </div>

              <FormField label="Food Photo" hint="Browse a local photo, drag & drop, or paste directly with Ctrl+V (optional)">
                {form.imageUrl ? (
                  <div className="relative border border-slate-200 rounded-2xl p-3.5 bg-slate-50 flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full sm:w-36 h-28 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0 border border-slate-200 shadow-xs">
                      <img
                        src={form.imageUrl}
                        alt="Food preview"
                        className="w-full h-full object-cover"
                        onError={() => setError('Could not render image preview. Please select another image.')}
                      />
                      <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md font-medium">
                        Preview
                      </span>
                    </div>

                    <div className="flex-1 w-full flex flex-col justify-between py-1">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-sm font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-xs">
                            {imageInfo?.name || 'Food photo attached'}
                          </span>
                        </div>
                        {imageInfo?.size && (
                          <p className="text-xs text-slate-500 mt-0.5">Optimized size: {imageInfo.size}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">This photo will be displayed to recipients on the marketplace.</p>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs"
                        >
                          <Camera size={13} className="text-slate-500" /> Change Image
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            set('imageUrl', '');
                            setImageInfo(null);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : imageMode === 'upload' ? (
                  <div
                    tabIndex={0}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) processImageFile(file);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                      isDragging
                        ? 'border-brand-500 bg-brand-50/70 scale-[1.01]'
                        : 'border-slate-200 hover:border-brand-400 hover:bg-slate-50/80 bg-slate-50/40'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-2.5 shadow-xs border border-brand-100">
                      <UploadCloud size={24} />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">
                      Click to browse image or drag & drop here
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Or press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-mono text-slate-700 shadow-2xs">Ctrl + V</kbd> anywhere to paste from clipboard
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-2.5 text-[11px] text-slate-400">
                      <span>JPG, PNG, WEBP, GIF</span>
                      <span>•</span>
                      <span>Auto-compressed</span>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageMode('url');
                        }}
                        className="text-xs text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1 hover:underline"
                      >
                        <Link2 size={13} /> Or paste an image URL instead
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={form.imageUrl}
                        onChange={(e) => set('imageUrl', e.target.value)}
                        placeholder="https://example.com/food-photo.jpg"
                        className={inputCls}
                      />
                      <button
                        type="button"
                        onClick={() => setImageMode('upload')}
                        className="whitespace-nowrap px-3 py-2 text-xs font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        Browse file
                      </button>
                    </div>
                    <p className="text-xs text-slate-400">Direct link to a food photo (e.g. from Unsplash or web)</p>
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processImageFile(file);
                    e.target.value = '';
                  }}
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Preparation Date & Time" hint="Leave blank if unknown">
                  <input type="datetime-local" value={form.preparationTime} onChange={e => set('preparationTime', e.target.value)} className={inputCls} />
                </FormField>
                <FormField label="Safe Consumption Deadline" required hint="As declared by you">
                  <input type="datetime-local" value={form.safeConsumptionDeadline} onChange={e => set('safeConsumptionDeadline', e.target.value)} className={inputCls} />
                </FormField>
              </div>

              <FormField label="Storage Conditions" required>
                <select value={form.storageCondition} onChange={e => set('storageCondition', e.target.value)} className={inputCls}>
                  {STORAGE.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </FormField>

              <FormField label="Allergen Information" hint="Select all that apply">
                <div className="flex flex-wrap gap-2 mt-1">
                  {ALLERGENS_LIST.map(a => (
                    <button type="button" key={a} onClick={() => toggleAllergen(a)}
                      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${form.allergens.includes(a) ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-600 border-slate-200 hover:border-red-300'}`}>
                      {a}
                    </button>
                  ))}
                </div>
              </FormField>

              <FormField label="Packaging Details">
                <input type="text" value={form.packagingDetails} onChange={e => set('packagingDetails', e.target.value)}
                  placeholder="e.g. Sealed containers, foil trays…" className={inputCls} />
              </FormField>

              <button onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl text-sm">
                Next: Location & Pickup <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* Step 2: Location & Pickup */}
          {step === 2 && (
            <>
              <FormField label="Pickup Address" required>
                <input type="text" value={form.pickupAddress} onChange={e => set('pickupAddress', e.target.value)}
                  placeholder="Street address" className={inputCls} />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="City" required>
                  <input type="text" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Bengaluru" className={inputCls} />
                </FormField>
                <FormField label="State">
                  <input type="text" value={form.state} onChange={e => set('state', e.target.value)} placeholder="Karnataka" className={inputCls} />
                </FormField>
              </div>

              <FormField label="PIN Code">
                <input type="text" value={form.postalCode} onChange={e => set('postalCode', e.target.value)} placeholder="560001" className={inputCls} />
              </FormField>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-brand-600" />
                    <span className="text-sm font-medium text-slate-700">GPS Coordinates (optional)</span>
                  </div>
                  <button type="button" onClick={getLocation} disabled={locating}
                    className="text-xs text-brand-600 border border-brand-200 px-3 py-1.5 rounded-lg hover:bg-brand-50 font-medium">
                    {locating ? 'Detecting…' : '📍 Use My Location'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" value={form.latitude} onChange={e => set('latitude', e.target.value)}
                    placeholder="Latitude (12.9716)" step="0.0001" className={inputCls} />
                  <input type="number" value={form.longitude} onChange={e => set('longitude', e.target.value)}
                    placeholder="Longitude (77.5946)" step="0.0001" className={inputCls} />
                </div>
                <p className="text-xs text-slate-400 mt-2">Coordinates enable map display and distance-based matching.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Pickup Available From">
                  <input type="datetime-local" value={form.pickupStartTime} onChange={e => set('pickupStartTime', e.target.value)} className={inputCls} />
                </FormField>
                <FormField label="Pickup Deadline" required>
                  <input type="datetime-local" value={form.pickupDeadline} onChange={e => set('pickupDeadline', e.target.value)} className={inputCls} />
                </FormField>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex items-center gap-1 border border-slate-200 text-slate-700 font-semibold py-3 px-5 rounded-xl hover:bg-slate-50 text-sm">
                  <ChevronLeft size={16} /> Back
                </button>
                <button onClick={handleNext}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl text-sm">
                  Next: Safety Declaration <ChevronRight size={16} />
                </button>
              </div>
            </>
          )}

          {/* Step 3: Safety & Submit */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={18} className="text-amber-600" />
                  <span className="font-semibold text-sm text-amber-800">FSSAI Food Safety Declaration</span>
                </div>
                <ul className="text-xs text-amber-700 space-y-1.5 list-disc list-inside leading-relaxed mb-4">
                  <li>The food being donated is safe for human consumption at the time of donation.</li>
                  <li>It has been stored under appropriate conditions before donation.</li>
                  <li>The preparation, expiry, and pickup information provided is accurate to the best of my knowledge.</li>
                  <li>I have disclosed all relevant allergen information known to me.</li>
                  <li>I understand that distributing unsafe or adulterated food is a violation of FSSAI regulations and may carry legal consequences.</li>
                </ul>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.safetyDeclarationAccepted} onChange={e => set('safetyDeclarationAccepted', e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-brand-600 rounded flex-shrink-0" />
                  <span className="text-sm font-medium text-amber-900">I accept the food safety declaration and confirm the information provided is accurate. *</span>
                </label>
              </div>

              <FormField label="Additional Safety Notes" hint="Optional: describe any special handling, allergy warnings, or donor notes">
                <textarea value={form.safetyNotes} onChange={e => set('safetyNotes', e.target.value)}
                  placeholder="e.g. Contains mustard oil. Prepared in a kitchen that handles nuts…"
                  rows={3} className={`${inputCls} resize-none`} />
              </FormField>

              {/* Summary */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-sm space-y-2">
                <div className="font-semibold text-slate-700 mb-2">📋 Listing Summary</div>
                <div className="flex items-start gap-3.5">
                  {form.imageUrl && (
                    <img
                      src={form.imageUrl}
                      alt={form.foodName}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-2xs flex-shrink-0"
                    />
                  )}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 flex-1">
                    <span><b>Food:</b> {form.foodName}</span>
                    <span><b>Qty:</b> {form.quantity} {form.unit}</span>
                    <span><b>Category:</b> {form.category?.replace(/_/g, ' ')}</span>
                    <span><b>Type:</b> {form.dietaryType}</span>
                    <span><b>City:</b> {form.city}</span>
                    <span><b>Deadline:</b> {form.pickupDeadline ? new Date(form.pickupDeadline).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)}
                  className="flex items-center gap-1 border border-slate-200 text-slate-700 font-semibold py-3 px-5 rounded-xl hover:bg-slate-50 text-sm">
                  <ChevronLeft size={16} /> Back
                </button>
                <button type="submit" disabled={loading || !form.safetyDeclarationAccepted}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-semibold py-3 rounded-xl text-sm">
                  {loading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Publishing…</> : <><Leaf size={16} /> Publish Donation</>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

