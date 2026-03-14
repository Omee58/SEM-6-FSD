import { useState, useEffect } from 'react';
import {
  Calendar, IndianRupee, User, Building2, Search,
  Package, ChevronLeft, ChevronRight, TrendingUp,
  CheckCircle2, Clock, XCircle, CircleDot, X,
  MapPin, Phone, Mail, Star, FileText, Tag, Banknote,
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { PageSpinner } from '../../components/ui/Spinner';
import { imgUrl } from '../../utils/imageUrl';

/* ─── constants ──────────────────────────────────────────────── */
const STATUS_TABS = [
  { key: '',           label: 'All',       color: '#6366F1' },
  { key: 'pending',    label: 'Pending',   color: '#D97706' },
  { key: 'confirmed',  label: 'Confirmed', color: '#2563EB' },
  { key: 'completed',  label: 'Completed', color: '#059669' },
  { key: 'cancelled',  label: 'Cancelled', color: '#DC2626' },
];
const STATUS_CFG = {
  pending:   { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', icon: Clock,        label: 'Pending'   },
  confirmed: { color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', icon: CircleDot,    label: 'Confirmed' },
  completed: { color: '#059669', bg: '#F0FDF4', border: '#A7F3D0', icon: CheckCircle2, label: 'Completed' },
  cancelled: { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', icon: XCircle,      label: 'Cancelled' },
};
const CAT_COLORS = {
  photography: '#8B1A3A', catering: '#C9A84C', venue: '#2563EB',
  decoration:  '#059669', mehendi:  '#7C3AED', music:     '#0891B2',
  makeup:      '#DB2777', transport:'#D97706', other:     '#6D28D9',
};
const CAT_ICONS = {
  photography:'📸', catering:'🍽️', venue:'🏛️', decoration:'🌸',
  mehendi:'🌿', music:'🎵', makeup:'💄', transport:'🚗', other:'✨',
};

/* ─── small helpers ──────────────────────────────────────────── */
function Orb({ size, color, style: s }) {
  return <div className="absolute rounded-full pointer-events-none"
    style={{ width: size, height: size, background: color, filter: 'blur(70px)', ...s }} />;
}
function Avatar({ name, color = '#6366F1', size = 34 }) {
  const initials = (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div className="rounded-xl flex items-center justify-center text-white font-bold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.36,
        background: `linear-gradient(135deg,${color},${color}cc)` }}>
      {initials}
    </div>
  );
}
function StatusBadge({ status }) {
  const sc = STATUS_CFG[status] || STATUS_CFG.pending;
  const Icon = sc.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold"
      style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
      <Icon size={11} /> {sc.label}
    </span>
  );
}
function InfoRow({ icon: Icon, label, value, color = '#475569' }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: '#F1F5F9' }}>
        <Icon size={13} style={{ color: '#94A3B8' }} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#94A3B8' }}>{label}</p>
        <p className="text-[13px] font-semibold mt-0.5 break-all" style={{ color }}>{value}</p>
      </div>
    </div>
  );
}

/* ─── Booking Detail Modal ───────────────────────────────────── */
function BookingModal({ booking: b, onClose }) {
  const catColor = CAT_COLORS[b.service?.category] || '#6366F1';
  const sc       = STATUS_CFG[b.status] || STATUS_CFG.pending;
  const cover    = imgUrl(b.service?.images?.[0]);

  const TIMELINE    = ['pending', 'confirmed', 'completed'];
  const isCancelled = b.status === 'cancelled';
  const currentStep = isCancelled ? -1 : TIMELINE.indexOf(b.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(6,11,20,0.72)', backdropFilter: 'blur(6px)', animation: 'fadeIn 0.2s ease' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl flex flex-col"
        style={{ background: '#fff', boxShadow: '0 32px 96px rgba(0,0,0,0.4)', animation: 'scaleIn 0.25s ease' }}>

        {/* ── Modal header (cover / gradient) ── */}
        <div className="relative overflow-hidden shrink-0" style={{ minHeight: 140 }}>
          {cover && (
            <img src={cover} alt="" className="absolute inset-0 w-full h-full object-cover"
              onError={e => { e.target.style.display = 'none'; }} />
          )}
          <div className="absolute inset-0"
            style={{ background: cover
              ? 'linear-gradient(to bottom,rgba(6,11,20,0.5),rgba(6,11,20,0.88))'
              : `linear-gradient(135deg,#060B14,#0D1627,${catColor}44)` }} />
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize: '22px 22px' }} />
          {/* close */}
          <button onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center z-10 transition-all"
            style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.24)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}>
            <X size={16} />
          </button>
          <div className="relative p-6 pb-5 flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 mt-0.5"
              style={{ background: `${catColor}28`, border: `1.5px solid ${catColor}50` }}>
              {CAT_ICONS[b.service?.category] || '✨'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-bold leading-tight mb-2"
                style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(1.05rem,2vw,1.25rem)' }}>
                {b.service?.title || '—'}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold capitalize"
                  style={{ background: `${catColor}35`, color: catColor, border: `1px solid ${catColor}55` }}>
                  {b.service?.category}
                </span>
                <StatusBadge status={b.status} />
                <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                  #{b._id?.slice(-8).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-6 space-y-5">

          {/* Amount / Date / Booked-on strip */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Amount', value: `₹${(b.total_amount || 0).toLocaleString('en-IN')}`, color: '#059669', bg: '#F0FDF4', border: '#A7F3D0' },
              { label: 'Booking Date', value: b.booking_date ? new Date(b.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
              { label: 'Booked On',   value: b.createdAt   ? new Date(b.createdAt).toLocaleDateString('en-IN',   { day: 'numeric', month: 'short', year: 'numeric' }) : '—', color: '#6366F1', bg: '#EEF2FF', border: '#C7D2FE' },
            ].map(c => (
              <div key={c.label} className="rounded-2xl px-4 py-3 text-center"
                style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                <p className="font-bold" style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.15rem', color: c.color, lineHeight: 1.2 }}>{c.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: c.color, opacity: 0.6 }}>{c.label}</p>
              </div>
            ))}
          </div>

          {/* Status timeline */}
          <div className="rounded-2xl p-4" style={{ background: '#F8FAFF', border: '1px solid #E2E8F0' }}>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: '#94A3B8' }}>Booking Journey</p>
            {isCancelled ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                <XCircle size={18} style={{ color: '#DC2626' }} />
                <div>
                  <p className="font-bold text-[13px]" style={{ color: '#DC2626' }}>Booking Cancelled</p>
                  <p className="text-[11px]" style={{ color: '#EF4444', opacity: 0.7 }}>This booking was cancelled by the client or vendor</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                {TIMELINE.map((step, i) => {
                  const done    = i <= currentStep;
                  const active  = i === currentStep;
                  const stepSc  = STATUS_CFG[step];
                  const Icon    = stepSc.icon;
                  return (
                    <div key={step} className="flex items-center flex-1">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                          style={done ? {
                            background: stepSc.bg,
                            border: `2px solid ${stepSc.color}`,
                            boxShadow: active ? `0 0 0 5px ${stepSc.color}18` : 'none',
                          } : { background: '#F1F5F9', border: '2px solid #E2E8F0' }}>
                          <Icon size={16} style={{ color: done ? stepSc.color : '#CBD5E1' }} />
                        </div>
                        <p className="text-[10px] font-bold capitalize"
                          style={{ color: done ? stepSc.color : '#CBD5E1' }}>{step}</p>
                      </div>
                      {i < TIMELINE.length - 1 && (
                        <div className="flex-1 h-0.5 mb-5 mx-1 rounded-full transition-all"
                          style={{ background: i < currentStep ? '#A7F3D0' : '#E2E8F0' }} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Client + Vendor cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl p-4" style={{ background: '#F8FAFF', border: '1px solid #E2E8F0' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#EEF2FF' }}>
                  <User size={12} style={{ color: '#6366F1' }} />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#94A3B8' }}>Client</p>
              </div>
              <div className="flex items-center gap-3 mb-3.5">
                <Avatar name={b.client?.full_name} color="#6366F1" size={42} />
                <div>
                  <p className="font-bold text-[14px]" style={{ color: '#0F172A' }}>{b.client?.full_name || '—'}</p>
                  <p className="text-[11px]" style={{ color: '#94A3B8' }}>Wedding Client</p>
                </div>
              </div>
              <div className="space-y-2.5">
                <InfoRow icon={Mail}  label="Email" value={b.client?.email} />
                <InfoRow icon={Phone} label="Phone" value={b.client?.phone || null} />
              </div>
            </div>

            <div className="rounded-2xl p-4" style={{ background: '#F8FAFF', border: '1px solid #E2E8F0' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${catColor}18` }}>
                  <Building2 size={12} style={{ color: catColor }} />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#94A3B8' }}>Vendor</p>
              </div>
              <div className="flex items-center gap-3 mb-3.5">
                <Avatar name={b.vendor?.business_name || b.vendor?.full_name} color={catColor} size={42} />
                <div>
                  <p className="font-bold text-[14px]" style={{ color: '#0F172A' }}>{b.vendor?.business_name || b.vendor?.full_name || '—'}</p>
                  <p className="text-[11px] capitalize" style={{ color: '#94A3B8' }}>{b.vendor?.category_specialization || 'Service Provider'}</p>
                </div>
              </div>
              <div className="space-y-2.5">
                <InfoRow icon={Mail}  label="Email"      value={b.vendor?.email} />
                <InfoRow icon={Phone} label="Phone"      value={b.vendor?.phone || null} />
                <InfoRow icon={Tag}   label="Experience" value={b.vendor?.years_experience ? `${b.vendor.years_experience} years` : null} />
              </div>
            </div>
          </div>

          {/* Service details */}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
            <div className="flex items-center gap-2 px-4 py-3"
              style={{ background: '#F8FAFF', borderBottom: '1px solid #E2E8F0' }}>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${catColor}15` }}>
                <Package size={12} style={{ color: catColor }} />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#94A3B8' }}>Service Details</p>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <InfoRow icon={Tag}      label="Category"     value={b.service?.category}   color={catColor} />
              <InfoRow icon={Banknote} label="Listed Price" value={b.service?.price ? `₹${b.service.price.toLocaleString('en-IN')}` : null} color="#059669" />
              <InfoRow icon={MapPin}   label="Location"     value={b.service?.location || null} />
              <InfoRow icon={Star}     label="Rating"       value={b.service?.avg_rating ? `${b.service.avg_rating.toFixed(1)} ★  (${b.service.review_count} reviews)` : null} color="#D97706" />
            </div>
            {b.service?.description && (
              <div className="px-4 pb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#94A3B8' }}>Description</p>
                <p className="text-[13px] leading-relaxed" style={{ color: '#475569' }}>{b.service.description}</p>
              </div>
            )}
            {b.service?.images?.length > 0 && (
              <div className="px-4 pb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#94A3B8' }}>Photos</p>
                <div className="flex gap-2 flex-wrap">
                  {b.service.images.slice(0, 5).map((img, i) => (
                    <img key={i} src={imgUrl(img)} alt=""
                      className="w-20 h-16 rounded-xl object-cover"
                      style={{ border: '1px solid #E2E8F0' }}
                      onError={e => { e.target.style.display = 'none'; }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {b.notes && (
            <div className="rounded-2xl p-4" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
              <div className="flex items-center gap-2 mb-2">
                <FileText size={13} style={{ color: '#D97706' }} />
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#D97706' }}>Client Notes</p>
              </div>
              <p className="text-[13px] leading-relaxed italic" style={{ color: '#92400E' }}>"{b.notes}"</p>
            </div>
          )}

          <button onClick={onClose}
            className="w-full py-3 rounded-2xl text-[14px] font-bold transition-all duration-200"
            style={{ background: 'linear-gradient(135deg,#0F172A,#1E293B)', color: '#fff', boxShadow: '0 4px 16px rgba(15,23,42,0.25)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,23,42,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(15,23,42,0.25)'; }}>
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function AdminBookings() {
  const [bookings,     setBookings]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [status,       setStatus]       = useState('');
  const [search,       setSearch]       = useState('');
  const [page,         setPage]         = useState(1);
  const [total,        setTotal]        = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [mounted,      setMounted]      = useState(false);
  const [selected,     setSelected]     = useState(null);
  const LIMIT = 10;

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const r = await adminAPI.getAllBookings({ status, page, limit: LIMIT });
      setBookings(r.data.bookings || []);
      setTotal(r.data.pagination?.total || 0);
      setTotalRevenue(r.data.total_revenue || 0);
    } catch {}
    setLoading(false);
    setTimeout(() => setMounted(true), 60);
  };

  useEffect(() => { fetchBookings(); }, [status, page]);

  const filtered = search
    ? bookings.filter(b =>
        b.service?.title?.toLowerCase().includes(search.toLowerCase()) ||
        b.client?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        b.vendor?.full_name?.toLowerCase().includes(search.toLowerCase()))
    : bookings;

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.4s ease' }}>

      {/* ══ HERO ══ */}
      <div className="relative overflow-hidden rounded-3xl"
        style={{ background: 'linear-gradient(135deg,#060B14 0%,#0D1627 50%,#0F172A 100%)', minHeight: 180, padding: '36px 40px' }}>
        <Orb size={300} color="rgba(99,102,241,0.14)"  style={{ top: -70, right: -50 }} />
        <Orb size={200} color="rgba(16,185,129,0.09)"  style={{ bottom: -60, right: 220 }} />
        <Orb size={140} color="rgba(245,158,11,0.07)"  style={{ top: 20, right: 420 }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-[11px] font-bold uppercase tracking-widest"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}>
              <Calendar size={11} style={{ color: '#6366F1' }} /> Booking Management
            </div>
            <h1 className="text-white font-bold mb-1.5"
              style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.5rem,3vw,2.1rem)' }}>
              All Bookings
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13 }}>
              {total} total · click any row to view full details
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { label: 'Total Bookings', value: total, color: '#A5B4FC', icon: Calendar },
              { label: 'Total Revenue',  value: `₹${totalRevenue >= 100000 ? (totalRevenue/100000).toFixed(1)+'L' : (totalRevenue/1000).toFixed(0)+'k'}`, color: '#6EE7B7', icon: IndianRupee },
              { label: 'Avg Booking',    value: total > 0 ? `₹${Math.round(totalRevenue/total).toLocaleString('en-IN')}` : '₹0', color: '#FCD34D', icon: TrendingUp },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', minWidth: 110 }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <Icon size={14} style={{ color }} />
                </div>
                <div>
                  <p className="font-bold leading-none" style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.1rem', color }}>{value}</p>
                  <p className="text-[10px] uppercase tracking-widest font-semibold mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ FILTERS ══ */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-1.5 flex-wrap p-1 rounded-2xl" style={{ background: '#F1F5F9' }}>
          {STATUS_TABS.map(t => {
            const active = status === t.key;
            return (
              <button key={t.key} onClick={() => { setStatus(t.key); setPage(1); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200"
                style={active
                  ? { background: '#fff', color: t.color, boxShadow: '0 2px 8px rgba(15,23,42,0.1)' }
                  : { color: '#64748B' }}>
                {active && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: t.color }} />}
                {t.label}
              </button>
            );
          })}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94A3B8' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search service, client, vendor…"
            className="pl-9 pr-4 py-2.5 rounded-xl text-[13px] focus:outline-none"
            style={{ border: '1.5px solid #E2E8F0', color: '#0F172A', width: 260, background: '#fff' }}
            onFocus={e => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; }} />
        </div>
      </div>

      {/* ══ TABLE ══ */}
      {loading ? <PageSpinner /> : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-3xl"
          style={{ background: '#fff', border: '1px solid #E2E8F0' }}>
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
            style={{ background: 'linear-gradient(135deg,#EEF2FF,#E0E7FF)', boxShadow: '0 8px 24px rgba(99,102,241,0.15)' }}>
            <Package size={32} style={{ color: '#6366F1', opacity: 0.7 }} />
          </div>
          <p className="font-bold text-[1.15rem]" style={{ fontFamily: 'Playfair Display,serif', color: '#0F172A' }}>No bookings found</p>
          <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 6 }}>Try adjusting your filters or search</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 4px 24px rgba(15,23,42,0.07)' }}>

          {/* Header row */}
          <div className="hidden sm:grid items-center px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest"
            style={{
              background: 'linear-gradient(135deg,#0D1627,#0F172A)',
              color: 'rgba(255,255,255,0.4)',
              gridTemplateColumns: '2fr 1.3fr 1.3fr 0.9fr 0.9fr 0.9fr',
              gap: '12px',
            }}>
            <span>Service</span>
            <span>Client</span>
            <span>Vendor</span>
            <span>Date</span>
            <span className="text-right">Amount</span>
            <span className="text-center">Status</span>
          </div>

          {/* Rows */}
          {filtered.map((b, idx) => {
            const catColor   = CAT_COLORS[b.service?.category] || '#6366F1';
            const sc         = STATUS_CFG[b.status] || STATUS_CFG.pending;
            const StatusIcon = sc.icon;
            const isLast     = idx === filtered.length - 1;
            return (
              <div key={b._id}
                className="group relative sm:grid items-center px-5 py-4 transition-all duration-150 cursor-pointer"
                style={{
                  gridTemplateColumns: '2fr 1.3fr 1.3fr 0.9fr 0.9fr 0.9fr',
                  gap: '12px',
                  borderBottom: isLast ? 'none' : '1px solid #F1F5F9',
                  animation: `fadeUp 0.35s ease ${idx * 0.03}s both`,
                }}
                onClick={() => setSelected(b)}
                onMouseEnter={e => { e.currentTarget.style.background = '#F5F7FF'; }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; }}>
                {/* left accent on hover */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: catColor }} />

                {/* Service */}
                <div className="flex items-center gap-3 min-w-0 mb-2 sm:mb-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px] shrink-0"
                    style={{ background: `${catColor}12`, border: `1px solid ${catColor}25` }}>
                    {CAT_ICONS[b.service?.category] || '✨'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[13px] truncate" style={{ color: '#0F172A' }}>{b.service?.title || '—'}</p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize"
                      style={{ background: `${catColor}14`, color: catColor }}>{b.service?.category || '—'}</span>
                  </div>
                </div>

                {/* Client */}
                <div className="flex items-center gap-2 min-w-0 mb-2 sm:mb-0">
                  <Avatar name={b.client?.full_name} color="#6366F1" size={32} />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color: '#0F172A' }}>{b.client?.full_name || '—'}</p>
                    <p className="text-[10px]" style={{ color: '#94A3B8' }}>Client</p>
                  </div>
                </div>

                {/* Vendor */}
                <div className="flex items-center gap-2 min-w-0 mb-2 sm:mb-0">
                  <Avatar name={b.vendor?.business_name || b.vendor?.full_name} color={catColor} size={32} />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color: '#0F172A' }}>{b.vendor?.full_name || '—'}</p>
                    <p className="text-[10px]" style={{ color: '#94A3B8' }}>Vendor</p>
                  </div>
                </div>

                {/* Date */}
                <div>
                  <span className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold"
                    style={{ background: '#F8FAFF', color: '#475569', border: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>
                    {b.booking_date ? new Date(b.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                  </span>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <p className="font-bold" style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.1rem', color: '#0F172A' }}>
                    ₹{(b.total_amount || 0).toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Status */}
                <div className="flex justify-center sm:justify-center mt-2 sm:mt-0">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold"
                    style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, whiteSpace: 'nowrap' }}>
                    <StatusIcon size={11} /> {sc.label}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Footer / pagination */}
          <div className="flex items-center justify-between px-5 py-3"
            style={{ borderTop: '1px solid #F1F5F9', background: '#FAFBFF' }}>
            <p className="text-[12px]" style={{ color: '#94A3B8' }}>
              Showing {((page-1)*LIMIT)+1}–{Math.min(page*LIMIT, total)} of {total}
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{ border: '1.5px solid #E2E8F0', color: page===1 ? '#CBD5E1' : '#475569' }}
                onMouseEnter={e => { if (page>1) { e.currentTarget.style.borderColor='#6366F1'; e.currentTarget.style.color='#6366F1'; } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='#E2E8F0'; e.currentTarget.style.color=page===1?'#CBD5E1':'#475569'; }}>
                <ChevronLeft size={14} />
              </button>
              {[...Array(Math.min(totalPages,7))].map((_,i) => {
                const p = i+1;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className="w-8 h-8 rounded-lg text-[12px] font-bold transition-all"
                    style={page===p ? { background:'linear-gradient(135deg,#0F172A,#1E293B)', color:'#fff', boxShadow:'0 4px 12px rgba(15,23,42,0.3)' } : { border:'1.5px solid #E2E8F0', color:'#475569' }}
                    onMouseEnter={e => { if (page!==p) { e.currentTarget.style.borderColor='#6366F1'; e.currentTarget.style.color='#6366F1'; } }}
                    onMouseLeave={e => { if (page!==p) { e.currentTarget.style.borderColor='#E2E8F0'; e.currentTarget.style.color='#475569'; } }}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{ border: '1.5px solid #E2E8F0', color: page===totalPages ? '#CBD5E1' : '#475569' }}
                onMouseEnter={e => { if (page<totalPages) { e.currentTarget.style.borderColor='#6366F1'; e.currentTarget.style.color='#6366F1'; } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='#E2E8F0'; e.currentTarget.style.color=page===totalPages?'#CBD5E1':'#475569'; }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ DETAIL MODAL ══ */}
      {selected && <BookingModal booking={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
