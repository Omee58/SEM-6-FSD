import { useState, useEffect, useMemo } from 'react';
import { Calendar, X, Star, Search, CheckCircle2, Clock, XCircle, Sparkles, Layers, CircleCheck, Camera, Utensils, Building2, Flower2, Paintbrush, Music, Car, Gem } from 'lucide-react';
import { toast } from 'react-toastify';
import { clientAPI, reviewAPI } from '../../services/api';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { PageSpinner } from '../../components/ui/Spinner';
import { Textarea } from '../../components/ui/Input';

const TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

const STATUS_STEPS = [
  { key: 'pending',   label: 'Requested', icon: Clock },
  { key: 'confirmed', label: 'Confirmed',  icon: CheckCircle2 },
  { key: 'completed', label: 'Completed',  icon: Star },
];

const STATUS_BAR = {
  pending:   '#B8912A',
  confirmed: '#059669',
  completed: '#7C3AED',
  cancelled: '#DC2626',
};

const STATUS_META = {
  pending:   { color: '#B8912A', bg: 'rgba(184,145,42,0.1)',  label: 'Pending',   icon: Clock },
  confirmed: { color: '#059669', bg: 'rgba(5,150,105,0.1)',   label: 'Confirmed', icon: CheckCircle2 },
  completed: { color: '#7C3AED', bg: 'rgba(124,58,237,0.1)', label: 'Completed', icon: CircleCheck },
  cancelled: { color: '#DC2626', bg: 'rgba(220,38,38,0.1)',   label: 'Cancelled', icon: XCircle },
};

const CATEGORY_ICON = {
  photography: { icon: Camera,     color: '#BE185D', bg: 'rgba(190,24,93,0.1)'  },
  catering:    { icon: Utensils,   color: '#059669', bg: 'rgba(5,150,105,0.1)'  },
  venue:       { icon: Building2,  color: '#2563EB', bg: 'rgba(37,99,235,0.1)'  },
  decoration:  { icon: Flower2,    color: '#B8912A', bg: 'rgba(184,145,42,0.1)' },
  mehendi:     { icon: Paintbrush, color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
  music:       { icon: Music,      color: '#0891B2', bg: 'rgba(8,145,178,0.1)'  },
  makeup:      { icon: Sparkles,   color: '#DB2777', bg: 'rgba(219,39,119,0.1)' },
  transport:   { icon: Car,        color: '#D97706', bg: 'rgba(217,119,6,0.1)'  },
  other:       { icon: Gem,        color: '#6D28D9', bg: 'rgba(109,40,217,0.1)' },
};

function CategoryIcon({ category, size = 28 }) {
  const meta = CATEGORY_ICON[category] || CATEGORY_ICON.other;
  const Icon = meta.icon;
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: meta.bg }}
    >
      <Icon size={size} style={{ color: meta.color }} />
    </div>
  );
}

function BookingTimeline({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-1.5 mt-3 text-[12px] font-semibold" style={{ color: '#DC2626' }}>
        <XCircle size={13} /> This booking was cancelled
      </div>
    );
  }
  const activeIdx = STATUS_STEPS.findIndex(s => s.key === status);
  return (
    <div className="flex items-center gap-0 mt-4">
      {STATUS_STEPS.map((step, i) => {
        const Icon = step.icon;
        const isDone   = i <= activeIdx;
        const isActive = i === activeIdx;
        return (
          <div key={step.key} className="flex items-center flex-1 min-w-0">
            <div className={`flex flex-col items-center gap-1 ${i < STATUS_STEPS.length - 1 ? 'flex-1' : ''}`}>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300"
                style={isActive ? {
                  background: 'linear-gradient(135deg,#BE185D,#9D174D)',
                  boxShadow: '0 3px 10px rgba(190,24,93,0.3)',
                  color: '#fff',
                } : isDone ? {
                  background: 'linear-gradient(135deg,#059669,#047857)',
                  color: '#fff',
                } : {
                  background: '#F5EDE4',
                  color: '#A8A29E',
                }}
              >
                <Icon size={13} />
              </div>
              <span
                className="text-[10px] font-bold whitespace-nowrap uppercase tracking-wide"
                style={{ color: isActive ? '#BE185D' : isDone ? '#059669' : '#A8A29E' }}
              >
                {step.label}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div
                className="h-0.5 flex-1 mx-1.5 rounded-full"
                style={{ background: i < activeIdx ? 'linear-gradient(90deg,#059669,#6EE7B7)' : '#E8E1D9' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ClientBookings() {
  const [bookings, setBookings]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [mounted, setMounted]             = useState(false);
  const [tab, setTab]                     = useState('all');
  const [searchQuery, setSearchQuery]     = useState('');
  const [cancelId, setCancelId]           = useState(null);
  const [cancelBooking, setCancelBooking] = useState(null);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [review, setReview]               = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting]       = useState(false);
  const [reviewableIds, setReviewableIds] = useState(new Set());

  const fetchBookings = async () => {
    try {
      const [bookRes, revRes] = await Promise.allSettled([
        clientAPI.getBookings(),
        reviewAPI.getReviewableBookings(),
      ]);
      if (bookRes.status === 'fulfilled') setBookings(bookRes.value.data.bookings || []);
      if (revRes.status === 'fulfilled') {
        const ids = (revRes.value.data.bookings || []).map(b => b._id);
        setReviewableIds(new Set(ids));
      }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    fetchBookings();
    setTimeout(() => setMounted(true), 60);
  }, []);

  const tabFiltered = tab === 'all' ? bookings : bookings.filter(b => b.status === tab);
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return tabFiltered;
    const q = searchQuery.toLowerCase();
    return tabFiltered.filter(b =>
      b.service?.title?.toLowerCase().includes(q) ||
      b.vendor?.full_name?.toLowerCase().includes(q) ||
      b.service?.category?.toLowerCase().includes(q)
    );
  }, [tabFiltered, searchQuery]);

  const handleCancelClick = (b) => { setCancelId(b._id); setCancelBooking(b); };
  const handleCancel = async () => {
    setSubmitting(true);
    try {
      await clientAPI.cancelBooking(cancelId);
      toast.success('Booking cancelled.');
      setCancelId(null); setCancelBooking(null);
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to cancel'); }
    setSubmitting(false);
  };

  const handleReview = async () => {
    setSubmitting(true);
    try {
      await reviewAPI.addReview(reviewBooking.service._id, { ...review, bookingId: reviewBooking._id });
      toast.success('Review submitted! Thank you.');
      setReviewBooking(null); setReview({ rating: 5, comment: '' });
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit review'); }
    setSubmitting(false);
  };

  if (loading) return <PageSpinner />;

  const statusCounts = Object.fromEntries(
    ['pending','confirmed','completed','cancelled'].map(s => [s, bookings.filter(b => b.status === s).length])
  );

  return (
    <div>

      {/* ── Hero Banner ── */}
      <div
        className="relative rounded-3xl overflow-hidden mb-8"
        style={{
          background: 'linear-gradient(135deg,#0D0509 0%,#1E0A14 50%,#3D1020 100%)',
          minHeight: 180,
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        {/* Decorative orbs */}
        <div className="absolute rounded-full pointer-events-none"
          style={{ width: 200, height: 200, background: 'rgba(190,24,93,0.18)', filter: 'blur(60px)', top: -60, right: 80, animation: 'floatSlow 7s ease-in-out infinite' }} />
        <div className="absolute rounded-full pointer-events-none"
          style={{ width: 140, height: 140, background: 'rgba(184,145,42,0.14)', filter: 'blur(50px)', bottom: -30, right: 300, animation: 'floatSlow 9s ease-in-out infinite', animationDelay: '2s' }} />

        <div className="relative p-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-[11px] font-bold uppercase tracking-widest"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.7)',
              opacity: mounted ? 1 : 0,
              transition: 'opacity 0.5s 0.1s',
            }}
          >
            <Layers size={11} style={{ color: '#B8912A' }} /> Your Bookings
          </div>
          <h1
            className="text-white font-bold mb-1"
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(1.5rem,3vw,2rem)',
              letterSpacing: '-0.01em',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(14px)',
              transition: 'all 0.55s cubic-bezier(0.4,0,0.2,1) 0.15s',
            }}
          >
            Manage Your Celebrations
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.25s' }}>
            Track, review, and manage all your wedding service bookings
          </p>

          {/* Status stat pills */}
          <div className="flex flex-wrap gap-3 mt-5">
            {[
              { key: 'pending',   label: 'Pending',   color: '#B8912A' },
              { key: 'confirmed', label: 'Confirmed', color: '#059669' },
              { key: 'completed', label: 'Completed', color: '#7C3AED' },
              { key: 'cancelled', label: 'Cancelled', color: '#DC2626' },
            ].map((s, i) => (
              <button
                key={s.key}
                onClick={() => setTab(s.key)}
                className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200"
                style={{
                  background: tab === s.key ? s.color : 'rgba(255,255,255,0.1)',
                  border: `1px solid ${tab === s.key ? s.color : 'rgba(255,255,255,0.15)'}`,
                  color: '#fff',
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(8px)',
                  transition: `all 0.4s cubic-bezier(0.4,0,0.2,1) ${0.3 + i * 0.07}s`,
                  boxShadow: tab === s.key ? `0 4px 14px ${s.color}55` : 'none',
                }}
                onMouseEnter={e => { if (tab !== s.key) e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
                onMouseLeave={e => { if (tab !== s.key) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              >
                <span className="text-[18px] font-bold" style={{ fontFamily: 'Playfair Display, serif', lineHeight: 1 }}>
                  {statusCounts[s.key]}
                </span>
                <span className="text-[12px] font-semibold opacity-80">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs + Search ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
          {TABS.map(t => {
            const count  = t === 'all' ? bookings.length : bookings.filter(b => b.status === t).length;
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-4 py-2 rounded-full text-[13px] font-semibold capitalize whitespace-nowrap transition-all duration-200"
                style={active ? {
                  background: 'linear-gradient(135deg,#BE185D,#9D174D)',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(190,24,93,0.3)',
                } : {
                  background: '#fff',
                  color: '#78716C',
                  border: '1.5px solid #E8E1D9',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = '#BE185D'; e.currentTarget.style.color = '#BE185D'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = '#E8E1D9'; e.currentTarget.style.color = '#78716C'; } }}
              >
                {t} <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
        <div className="relative sm:w-60 shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#A8A29E' }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search bookings…"
            className="input-base pl-9 text-sm"
          />
        </div>
      </div>

      {/* ── Booking Cards ── */}
      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-3xl"
          style={{ background: 'linear-gradient(135deg,#FDF6EE,#fff)', border: '1px solid #E8E1D9' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg,#FBF0D9,#FEF3C7)', boxShadow: '0 6px 20px rgba(184,145,42,0.15)' }}
          >
            <Calendar size={28} style={{ color: '#B8912A' }} />
          </div>
          <h3 className="font-bold mb-1" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.15rem', color: '#1C1917' }}>
            {searchQuery ? 'No matching bookings' : 'No bookings yet'}
          </h3>
          <p className="text-[13px]" style={{ color: '#78716C' }}>
            {searchQuery ? 'Try different keywords.' : 'Your bookings will appear here once you make one.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b, idx) => (
            <div
              key={b._id}
              className="rounded-2xl overflow-hidden"
              style={{
                background: '#fff',
                boxShadow: '0 2px 14px rgba(28,9,16,0.07)',
                borderLeft: `4px solid ${STATUS_BAR[b.status] || '#E8E1D9'}`,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateX(0)' : 'translateX(-16px)',
                transition: `opacity 0.5s cubic-bezier(0.4,0,0.2,1) ${idx * 0.07}s, transform 0.5s cubic-bezier(0.4,0,0.2,1) ${idx * 0.07}s, box-shadow 0.25s ease`,
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(28,9,16,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 14px rgba(28,9,16,0.07)'; }}
            >
              <div className="p-5 flex flex-col sm:flex-row gap-5">
                {/* Service image */}
                <div
                  className="w-20 h-20 rounded-2xl shrink-0 overflow-hidden"
                  style={{ background: '#FDF6EE' }}
                >
                  {b.service?.images?.[0] ? (
                    <img
                      src={`${import.meta.env.VITE_UPLOAD_URL}/${b.service.images[0]}`}
                      alt={b.service?.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <CategoryIcon category={b.service?.category} size={28} />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div>
                      <h3
                        className="font-bold"
                        style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', color: '#1C1917' }}
                      >
                        {b.service?.title || 'Service'}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: STATUS_BAR[b.status] }}
                        />
                        <span className="text-[12px] font-semibold capitalize" style={{ color: STATUS_BAR[b.status] }}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                    <Badge status={b.status}>{b.status}</Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Vendor',   value: b.vendor?.full_name },
                      { label: 'Date',     value: new Date(b.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                      { label: 'Amount',   value: `₹${b.total_amount?.toLocaleString('en-IN')}`, gold: true },
                      { label: 'Category', value: b.service?.category, capitalize: true },
                    ].map(({ label, value, gold, capitalize }) => (
                      <div key={label} className="rounded-xl px-3 py-2" style={{ background: '#FDF9F4' }}>
                        <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#A8A29E' }}>{label}</div>
                        <div
                          className="text-[13px] font-semibold truncate"
                          style={{ color: gold ? '#B8912A' : '#1C1917', textTransform: capitalize ? 'capitalize' : 'none' }}
                        >
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {b.notes && <p className="text-[12px] mt-3 italic px-3 py-2 rounded-xl" style={{ color: '#A8A29E', background: '#FDF9F4' }}>"{b.notes}"</p>}
                  <BookingTimeline status={b.status} />
                </div>

                {/* Actions */}
                <div className="flex flex-row sm:flex-col gap-2 justify-end shrink-0">
                  {b.status === 'pending' && (
                    <Button variant="danger" size="sm" onClick={() => handleCancelClick(b)}>
                      <X size={13} /> Cancel
                    </Button>
                  )}
                  {b.status === 'completed' && reviewableIds.has(b._id) && (
                    <Button variant="gold" size="sm" onClick={() => setReviewBooking(b)}>
                      <Star size={13} /> Review
                    </Button>
                  )}
                  {b.status === 'completed' && !reviewableIds.has(b._id) && (
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold"
                      style={{ background: 'rgba(5,150,105,0.1)', color: '#059669' }}
                    >
                      <CircleCheck size={13} /> Reviewed
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Cancel Modal ── */}
      <Modal
        isOpen={!!cancelId}
        onClose={() => { setCancelId(null); setCancelBooking(null); }}
        title="Cancel Booking"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setCancelId(null); setCancelBooking(null); }}>Keep It</Button>
            <Button variant="danger" loading={submitting} onClick={handleCancel}>Yes, Cancel</Button>
          </>
        }
      >
        <div className="space-y-4">
          {cancelBooking && (
            <div className="rounded-2xl p-5 space-y-3" style={{ background: '#FDF6EE', border: '1px solid #E8E1D9' }}>
              {[
                { label: 'Service', value: cancelBooking.service?.title },
                { label: 'Vendor',  value: cancelBooking.vendor?.full_name },
                { label: 'Date',    value: new Date(cancelBooking.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#A8A29E' }}>{label}</span>
                  <span className="text-[13px] font-semibold" style={{ color: '#1C1917' }}>{value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid #E8E1D9' }}>
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#A8A29E' }}>Amount</span>
                <span className="font-bold" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: '#B8912A' }}>
                  ₹{cancelBooking.total_amount?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}
          <p className="text-[13px]" style={{ color: '#78716C' }}>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </p>
        </div>
      </Modal>

      {/* ── Review Modal ── */}
      <Modal
        isOpen={!!reviewBooking}
        onClose={() => { setReviewBooking(null); setReview({ rating: 5, comment: '' }); }}
        title="Write a Review"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setReviewBooking(null); setReview({ rating: 5, comment: '' }); }}>Cancel</Button>
            <Button loading={submitting} onClick={handleReview}>Submit Review</Button>
          </>
        }
      >
        <div className="space-y-5">
          {reviewBooking && (
            <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: '#FDF6EE', border: '1px solid #E8E1D9' }}>
              <div className="w-12 h-12 rounded-xl shrink-0 overflow-hidden" style={{ background: '#FDF6EE' }}>
                {reviewBooking.service?.images?.[0] ? (
                  <img src={`${import.meta.env.VITE_UPLOAD_URL}/${reviewBooking.service.images[0]}`}
                    alt="" className="w-full h-full object-cover" />
                ) : (
                  <CategoryIcon category={reviewBooking.service?.category} size={20} />
                )}
              </div>
              <div className="min-w-0">
                <div className="font-semibold truncate" style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917' }}>
                  {reviewBooking.service?.title}
                </div>
                <div className="text-[12px]" style={{ color: '#78716C' }}>{reviewBooking.vendor?.full_name}</div>
              </div>
            </div>
          )}

          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#78716C' }}>Your Rating</div>
            <div className="flex gap-2 mb-2">
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setReview(r => ({ ...r, rating: s }))}
                  className="transition-all duration-150 hover:scale-110 active:scale-95"
                >
                  <Star
                    size={36}
                    style={{
                      color: s <= review.rating ? '#B8912A' : '#E8E1D9',
                      fill: s <= review.rating ? '#B8912A' : 'transparent',
                      filter: s <= review.rating ? 'drop-shadow(0 2px 6px rgba(184,145,42,0.4))' : 'none',
                      transition: 'all 0.15s',
                    }}
                  />
                </button>
              ))}
            </div>
            <div
              className="text-[14px] font-bold px-3 py-1 rounded-full inline-block"
              style={{ background: 'rgba(184,145,42,0.1)', color: '#B8912A' }}
            >
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][review.rating]}
            </div>
          </div>

          <Textarea
            label="Your Review (optional)"
            name="comment"
            value={review.comment}
            onChange={e => setReview(r => ({ ...r, comment: e.target.value }))}
            placeholder="Share your experience with this vendor…"
            rows={4}
          />
        </div>
      </Modal>
    </div>
  );
}
