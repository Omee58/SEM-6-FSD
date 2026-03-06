import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, Heart, ArrowLeft, Phone, CheckCircle, Share2, X, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { toast } from 'react-toastify';
import { clientAPI, vendorAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Calendar from '../components/ui/Calendar';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { PageSpinner } from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import { Textarea } from '../components/ui/Input';

const REVIEW_SORTS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'highest', label: 'Highest Rating' },
  { value: 'lowest', label: 'Lowest Rating' },
];

function sortReviews(reviews, sort) {
  const arr = [...reviews];
  if (sort === 'highest') return arr.sort((a, b) => b.rating - a.rating);
  if (sort === 'lowest') return arr.sort((a, b) => a.rating - b.rating);
  return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export default function ServiceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewSort, setReviewSort] = useState('recent');
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const today = new Date();

  useEffect(() => {
    const load = async () => {
      try {
        const svcRes = await vendorAPI.getServiceById(id);
        const svc = svcRes.data.service;
        if (!svc) { toast.error('Service not found'); navigate(-1); return; }
        setService(svc);

        const [revRes, availRes] = await Promise.allSettled([
          reviewAPI.getServiceReviews(id),
          vendorAPI.getAvailability({ serviceId: id, month: today.getMonth() + 1, year: today.getFullYear() }),
        ]);
        if (revRes.status === 'fulfilled') setReviews(revRes.value.data.reviews || []);
        if (availRes.status === 'fulfilled') {
          setBookedDates((availRes.value.data.booked_dates || []).map(d => new Date(d)));
          setBlockedDates((availRes.value.data.blocked_dates || []).map(d => new Date(d)));
        }
      } catch {
        toast.error('Failed to load service');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const onKey = (e) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') setImgIdx(i => (i - 1 + (service?.images?.length || 1)) % (service?.images?.length || 1));
      if (e.key === 'ArrowRight') setImgIdx(i => (i + 1) % (service?.images?.length || 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, service]);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.info('Copy this URL to share: ' + window.location.href);
    }
  }, []);

  const handleBook = async () => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'client') { toast.error('Only clients can book services'); return; }
    if (!selectedDate) { toast.error('Please select a date'); return; }
    setSubmitting(true);
    try {
      await clientAPI.bookService({ service_id: id, booking_date: selectedDate, notes });
      toast.success('Booking requested! The vendor will confirm soon.');
      setBookingOpen(false);
      setSelectedDate(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    }
    setSubmitting(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}><PageSpinner /></div>;
  if (!service) return null;

  const images = service.images || [];
  const sortedReviews = sortReviews(reviews, reviewSort);
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div
        className="px-6 h-16 flex items-center gap-4 sticky top-0 z-30"
        style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(232,225,217,0.7)',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{ color: '#78716C' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F5EDE4'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#BE185D,#9D174D)' }}>
            <Heart size={14} className="fill-white text-white" />
          </div>
          <span className="font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917' }}>ShadiSeva</span>
        </div>
        <button
          onClick={handleShare}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{ color: '#78716C' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#FCEEF7'; e.currentTarget.style.color = '#BE185D'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#78716C'; }}
          title="Copy link"
        >
          <Share2 size={18} />
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images + Info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Image Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E8E1D9', boxShadow: '0 4px 20px rgba(28,9,16,0.08)' }}>
              <div
                className="relative h-96 cursor-pointer"
                style={{ background: 'linear-gradient(135deg,#FCE7F3,#FEE2E2)' }}
                onClick={() => images.length > 0 && setLightboxOpen(true)}
              >
                {images.length > 0 ? (
                  <>
                    <img
                      src={`${import.meta.env.VITE_UPLOAD_URL}/${images[imgIdx]}`}
                      alt={service.title}
                      className="w-full h-full object-cover hover:opacity-95 transition-opacity"
                      loading="lazy"
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={e => { e.stopPropagation(); setImgIdx(i => (i - 1 + images.length) % images.length); }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setImgIdx(i => (i + 1) % images.length); }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
                        >
                          <ChevronRight size={16} />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {images.map((_, i) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`} />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Heart size={64} className="text-[#BE185D]/20" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <Badge status="active" className="capitalize">{service.category}</Badge>
                </div>
                {images.length > 0 && (
                  <div className="absolute bottom-3 right-3 bg-black/40 text-white text-xs px-2 py-1 rounded-lg">
                    Click to expand
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setImgIdx(i)}
                      className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${i === imgIdx ? 'border-[#BE185D]' : 'border-transparent hover:border-[#BE185D]/40'}`}>
                      <img src={`${import.meta.env.VITE_UPLOAD_URL}/${img}`} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Service Info */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E8E1D9', boxShadow: '0 4px 20px rgba(28,9,16,0.08)' }}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917' }}>{service.title}</h1>
                {avgRating && (
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-full shrink-0"
                    style={{ background: '#FBF0D9' }}>
                    <Star size={14} style={{ color: '#B8912A' }} className="fill-current" />
                    <span className="text-sm font-bold" style={{ color: '#B8912A' }}>{avgRating}</span>
                    <span className="text-xs" style={{ color: '#78716C' }}>({reviews.length})</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-[13px] mb-4" style={{ color: '#78716C' }}>
                <MapPin size={14} />
                {service.location}
              </div>
              <p className="leading-relaxed text-[14px]" style={{ color: '#78716C' }}>{service.description}</p>
            </div>

            {/* Availability Calendar */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E8E1D9', boxShadow: '0 4px 20px rgba(28,9,16,0.08)' }}>
              <h2 className="font-semibold mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917' }}>
                Check Availability
              </h2>
              <p className="text-[13px] mb-4" style={{ color: '#78716C' }}>Select an available date to book this service.</p>
              <Calendar
                bookedDates={bookedDates}
                blockedDates={blockedDates}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                interactive={!!user && user.role === 'client'}
              />
              {selectedDate && (
                <div className="mt-4 p-3 bg-[#FCE7F3] rounded-xl flex items-center gap-2">
                  <CheckCircle size={16} className="text-[#BE185D]" />
                  <span className="text-sm text-[#BE185D] font-medium">
                    Selected: {selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E8E1D9', boxShadow: '0 4px 20px rgba(28,9,16,0.08)' }}>
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                  <h2 className="font-semibold" style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917' }}>
                    Customer Reviews ({reviews.length})
                  </h2>
                  <div className="flex items-center gap-2">
                    <ArrowUpDown size={13} style={{ color: '#78716C' }} />
                    <select
                      value={reviewSort}
                      onChange={e => setReviewSort(e.target.value)}
                      className="text-[12px] rounded-lg px-2 py-1.5 bg-white outline-none"
                      style={{ border: '1.5px solid #E8E1D9', color: '#78716C' }}
                    >
                      {REVIEW_SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  {sortedReviews.map(r => (
                    <div key={r._id} className="p-4 rounded-xl" style={{ background: '#FDF6EE', border: '1px solid #F0EBE5' }}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#BE185D] to-[#9D174D] flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {r.client?.full_name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold" style={{ color: '#1C1917' }}>{r.client?.full_name}</div>
                          <div className="flex gap-0.5 mt-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={11} style={{ color: i < r.rating ? '#B8912A' : '#E8E1D9' }} className={i < r.rating ? 'fill-current' : ''} />
                            ))}
                          </div>
                        </div>
                        <div className="text-[11px] shrink-0" style={{ color: '#A8A29E' }}>
                          {new Date(r.createdAt).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                      {r.comment && <p className="text-[13px] italic" style={{ color: '#78716C' }}>"{r.comment}"</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking Panel */}
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden sticky top-24" style={{ boxShadow: '0 8px 32px rgba(28,9,16,0.12)', border: '1px solid #E8E1D9' }}>
              {/* Gradient header */}
              <div className="p-6 pb-5" style={{ background: 'linear-gradient(135deg,#1A0A10 0%,#3D1020 60%,#BE185D 100%)' }}>
                <div className="text-[11px] uppercase tracking-[0.12em] mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Starting from</div>
                <div className="font-bold text-white" style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem' }}>
                  ₹{service.price?.toLocaleString('en-IN')}
                </div>
                {avgRating && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={11} style={{ color: i < Math.round(avgRating) ? '#E8C86E' : 'rgba(255,255,255,0.2)' }} className={i < Math.round(avgRating) ? 'fill-current' : ''} />
                      ))}
                    </div>
                    <span className="text-[12px] font-bold" style={{ color: '#E8C86E' }}>{avgRating}</span>
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>({reviews.length} reviews)</span>
                  </div>
                )}
              </div>

              <div className="p-6 bg-white space-y-4">
                {service.vendor && (
                  <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: '#FDF6EE', border: '1px solid #E8E1D9' }}>
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                      style={{ background: 'linear-gradient(135deg,#BE185D,#9D174D)', boxShadow: '0 3px 10px rgba(190,24,93,0.25)' }}
                    >
                      {service.vendor.full_name?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold" style={{ color: '#1C1917' }}>{service.vendor.full_name}</div>
                      {service.vendor.business_name && <div className="text-[11px] truncate" style={{ color: '#78716C' }}>{service.vendor.business_name}</div>}
                      {service.vendor.years_experience > 0 && (
                        <div className="text-[11px] font-semibold" style={{ color: '#BE185D' }}>{service.vendor.years_experience} yrs experience</div>
                      )}
                      {service.vendor.phone && (
                        <div className="flex items-center gap-1 text-[11px] mt-0.5" style={{ color: '#78716C' }}>
                          <Phone size={10} /> {service.vendor.phone}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {user?.role === 'client' ? (
                  <Button fullWidth size="lg" disabled={!selectedDate} onClick={() => setBookingOpen(true)}>
                    {selectedDate ? 'Confirm Booking' : 'Select a Date First'}
                  </Button>
                ) : user ? (
                  <div className="text-center text-[13px] p-3 rounded-xl" style={{ color: '#78716C', background: '#FDF6EE' }}>
                    Only clients can book services.
                  </div>
                ) : (
                  <Link to="/login">
                    <Button fullWidth size="lg">Login to Book</Button>
                  </Link>
                )}

                <div className="space-y-2 pt-2" style={{ borderTop: '1px solid #F0EBE5' }}>
                  {['Verified Vendor', 'Instant Confirmation', 'Secure Booking'].map(f => (
                    <div key={f} className="flex items-center gap-2 text-[12px]" style={{ color: '#78716C' }}>
                      <CheckCircle size={13} className="text-success" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Confirm Modal */}
      <Modal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} title="Confirm Your Booking"
        footer={<>
          <Button variant="secondary" onClick={() => setBookingOpen(false)}>Cancel</Button>
          <Button loading={submitting} onClick={handleBook}>Confirm Booking</Button>
        </>}
      >
        <div className="space-y-4">
          <div className="rounded-2xl p-5 space-y-3" style={{ background: '#FDF6EE', border: '1px solid #E8E1D9' }}>
            {[
              { label: 'Service', value: service.title },
              { label: 'Date', value: selectedDate?.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
              { label: 'Vendor', value: service.vendor?.full_name },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#A8A29E' }}>{label}</span>
                <span className="text-[13px] font-semibold" style={{ color: '#1C1917' }}>{value}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid #E8E1D9' }}>
              <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#A8A29E' }}>Total</span>
              <span className="font-bold" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: '#B8912A' }}>
                ₹{service.price?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          <Textarea label="Additional Notes (optional)" name="notes" value={notes}
            onChange={e => setNotes(e.target.value)} placeholder="Any special requirements or questions..." rows={3} />
        </div>
      </Modal>

      {/* Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            onClick={() => setLightboxOpen(false)}
          >
            <X size={20} />
          </button>
          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                onClick={e => { e.stopPropagation(); setImgIdx(i => (i - 1 + images.length) % images.length); }}
              >
                <ChevronLeft size={22} />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                onClick={e => { e.stopPropagation(); setImgIdx(i => (i + 1) % images.length); }}
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
          <img
            src={`${import.meta.env.VITE_UPLOAD_URL}/${images[imgIdx]}`}
            alt={service.title}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl"
            onClick={e => e.stopPropagation()}
          />
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setImgIdx(i); }}
                  className={`w-2 h-2 rounded-full transition-colors ${i === imgIdx ? 'bg-white' : 'bg-white/40'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
