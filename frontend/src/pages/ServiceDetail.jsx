import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, Heart, ArrowLeft, Phone, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { clientAPI, vendorAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Calendar from '../components/ui/Calendar';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { PageSpinner } from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import { Textarea } from '../components/ui/Input';

export default function ServiceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

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

  if (loading) return <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center"><PageSpinner /></div>;
  if (!service) return null;

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <div className="bg-white border-b border-[#E8E8E4] px-6 h-16 flex items-center gap-4 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-lg hover:bg-[#FAFAF8] flex items-center justify-center text-[#6B6B65]">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-linear-to-br from-[#BE185D] to-[#9D174D] flex items-center justify-center">
            <Heart size={14} className="fill-white text-white" />
          </div>
          <span className="font-bold text-[#1A1A18]" style={{ fontFamily: 'Playfair Display, serif' }}>ShadiSeva</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images + Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl border border-[#E8E8E4] overflow-hidden">
              <div className="relative h-72 bg-linear-to-br from-[#FCE7F3] to-[#FEE2E2]">
                {service.images?.length > 0 ? (
                  <img src={`${import.meta.env.VITE_UPLOAD_URL}/${service.images[imgIdx]}`}
                    alt={service.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Heart size={64} className="text-[#BE185D]/20" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <Badge status="active" className="capitalize">{service.category}</Badge>
                </div>
              </div>
              {service.images?.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {service.images.map((img, i) => (
                    <button key={i} onClick={() => setImgIdx(i)}
                      className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${i === imgIdx ? 'border-[#BE185D]' : 'border-transparent'}`}>
                      <img src={`${import.meta.env.VITE_UPLOAD_URL}/${img}`} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Service Info */}
            <div className="bg-white rounded-2xl border border-[#E8E8E4] p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-2xl font-bold text-[#1A1A18]" style={{ fontFamily: 'Playfair Display, serif' }}>{service.title}</h1>
                {service.avg_rating > 0 && (
                  <div className="flex items-center gap-1 bg-[#FEF3C7] px-3 py-1.5 rounded-full shrink-0">
                    <Star size={14} className="text-[#D97706] fill-current" />
                    <span className="text-sm font-bold text-[#D97706]">{service.avg_rating.toFixed(1)}</span>
                    <span className="text-xs text-[#6B6B65]">({service.review_count})</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-[#6B6B65] mb-4">
                <MapPin size={14} />
                {service.location}
              </div>
              <p className="text-[#6B6B65] leading-relaxed">{service.description}</p>
            </div>

            {/* Availability Calendar */}
            <div className="bg-white rounded-2xl border border-[#E8E8E4] p-6">
              <h2 className="font-semibold text-[#1A1A18] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Check Availability
              </h2>
              <p className="text-sm text-[#6B6B65] mb-4">Select an available date to book this service.</p>
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
              <div className="bg-white rounded-2xl border border-[#E8E8E4] p-6">
                <h2 className="font-semibold text-[#1A1A18] mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Customer Reviews ({reviews.length})
                </h2>
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r._id} className="p-4 bg-[#FAFAF8] rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#BE185D] to-[#9D174D] flex items-center justify-center text-white text-sm font-bold">
                          {r.client?.full_name?.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[#1A1A18]">{r.client?.full_name}</div>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={11} className={i < r.rating ? 'text-[#D97706] fill-current' : 'text-[#E8E8E4]'} />
                            ))}
                          </div>
                        </div>
                        <div className="ml-auto text-xs text-[#6B6B65]">
                          {new Date(r.createdAt).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                      <p className="text-sm text-[#6B6B65] italic">"{r.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking Panel */}
          <div className="space-y-4">
            {/* Price Card */}
            <div className="bg-white rounded-2xl border border-[#E8E8E4] p-6 sticky top-24">
              <div className="mb-4">
                <div className="text-xs text-[#6B6B65] mb-1">Starting from</div>
                <div className="text-3xl font-bold text-[#BE185D]">₹{service.price?.toLocaleString('en-IN')}</div>
              </div>

              {service.vendor && (
                <div className="flex items-center gap-3 p-4 bg-[#FAFAF8] rounded-xl mb-5">
                  <div className="w-11 h-11 rounded-full bg-linear-to-br from-[#BE185D] to-[#9D174D] flex items-center justify-center text-white font-bold">
                    {service.vendor.full_name?.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#1A1A18]">{service.vendor.full_name}</div>
                    {service.vendor.business_name && <div className="text-xs text-[#6B6B65]">{service.vendor.business_name}</div>}
                    {service.vendor.phone && (
                      <div className="flex items-center gap-1 text-xs text-[#6B6B65] mt-0.5">
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
                <div className="text-center text-sm text-[#6B6B65] p-3 bg-[#FAFAF8] rounded-xl">
                  Only clients can book services.
                </div>
              ) : (
                <Link to="/login">
                  <Button fullWidth size="lg">Login to Book</Button>
                </Link>
              )}

              <div className="mt-4 space-y-2">
                {['Verified Vendor', 'Instant Confirmation', 'Secure Booking'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-xs text-[#6B6B65]">
                    <CheckCircle size={13} className="text-[#059669]" />
                    {f}
                  </div>
                ))}
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
          <div className="p-4 bg-[#FAFAF8] rounded-xl space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#6B6B65]">Service</span>
              <span className="font-semibold text-[#1A1A18]">{service.title}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B6B65]">Date</span>
              <span className="font-semibold text-[#1A1A18]">
                {selectedDate?.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B6B65]">Vendor</span>
              <span className="font-semibold text-[#1A1A18]">{service.vendor?.full_name}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-[#E8E8E4] pt-3">
              <span className="font-semibold text-[#1A1A18]">Total</span>
              <span className="text-xl font-bold text-[#BE185D]">₹{service.price?.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <Textarea label="Additional Notes (optional)" name="notes" value={notes}
            onChange={e => setNotes(e.target.value)} placeholder="Any special requirements or questions..." rows={3} />
        </div>
      </Modal>
    </div>
  );
}
