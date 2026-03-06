import { useState, useEffect } from 'react';
import { Calendar, X, Star, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';
import { clientAPI, reviewAPI } from '../../services/api';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { PageSpinner } from '../../components/ui/Spinner';
import { Textarea } from '../../components/ui/Input';

const TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

export default function ClientBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [cancelId, setCancelId] = useState(null);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => { fetchBookings(); }, []);

  const filtered = tab === 'all' ? bookings : bookings.filter(b => b.status === tab);

  const handleCancel = async () => {
    setSubmitting(true);
    try {
      await clientAPI.cancelBooking(cancelId);
      toast.success('Booking cancelled.');
      setCancelId(null);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
    setSubmitting(false);
  };

  const handleReview = async () => {
    setSubmitting(true);
    try {
      await reviewAPI.addReview(reviewBooking.service._id, { ...review, bookingId: reviewBooking._id });
      toast.success('Review submitted! Thank you.');
      setReviewBooking(null);
      setReview({ rating: 5, comment: '' });
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
    setSubmitting(false);
  };

  if (loading) return <PageSpinner />;

  return (
    <div>
      <PageHeader title="My Bookings" subtitle={`${bookings.length} total bookings`} />

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors ${
              tab === t ? 'bg-[#BE185D] text-white' : 'bg-white border border-[#E8E8E4] text-[#6B6B65] hover:border-[#BE185D] hover:text-[#BE185D]'
            }`}
          >
            {t} {t === 'all' ? `(${bookings.length})` : `(${bookings.filter(b => b.status === t).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Calendar} title="No bookings found" description="Your bookings will appear here once you make one." />
      ) : (
        <div className="space-y-4">
          {filtered.map(b => (
            <Card key={b._id} padding={false}>
              <div className="p-5 flex flex-col sm:flex-row gap-4">
                <div className="w-16 h-16 rounded-xl bg-[#FCE7F3] flex items-center justify-center shrink-0">
                  <Calendar size={24} className="text-[#BE185D]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-[#1A1A18]">{b.service?.title || 'Service'}</h3>
                    <Badge status={b.status}>{b.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-[#6B6B65]">Vendor</div>
                      <div className="font-medium text-[#1A1A18]">{b.vendor?.full_name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#6B6B65]">Date</div>
                      <div className="font-medium text-[#1A1A18]">{new Date(b.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#6B6B65]">Amount</div>
                      <div className="font-bold text-[#D97706]">₹{b.total_amount?.toLocaleString('en-IN')}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#6B6B65]">Category</div>
                      <div className="font-medium text-[#1A1A18] capitalize">{b.service?.category}</div>
                    </div>
                  </div>
                  {b.notes && <p className="text-xs text-[#6B6B65] mt-2 italic">"{b.notes}"</p>}
                </div>
                <div className="flex flex-row sm:flex-col gap-2 justify-end">
                  {b.status === 'pending' && (
                    <Button variant="danger" size="sm" onClick={() => setCancelId(b._id)}>
                      <X size={14} /> Cancel
                    </Button>
                  )}
                  {b.status === 'completed' && reviewableIds.has(b._id) && (
                    <Button variant="gold" size="sm" onClick={() => setReviewBooking(b)}>
                      <Star size={14} /> Review
                    </Button>
                  )}
                  {b.status === 'completed' && !reviewableIds.has(b._id) && (
                    <span className="text-xs text-[#059669] font-medium flex items-center gap-1">
                      <Star size={12} className="fill-current" /> Reviewed
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Cancel confirm modal */}
      <Modal isOpen={!!cancelId} onClose={() => setCancelId(null)} title="Cancel Booking"
        footer={<>
          <Button variant="secondary" onClick={() => setCancelId(null)}>Keep It</Button>
          <Button variant="danger" loading={submitting} onClick={handleCancel}>Yes, Cancel</Button>
        </>}
      >
        <p className="text-sm text-[#6B6B65]">Are you sure you want to cancel this booking? This action cannot be undone.</p>
      </Modal>

      {/* Review modal */}
      <Modal isOpen={!!reviewBooking} onClose={() => setReviewBooking(null)} title="Write a Review"
        footer={<>
          <Button variant="secondary" onClick={() => setReviewBooking(null)}>Cancel</Button>
          <Button loading={submitting} onClick={handleReview}>Submit Review</Button>
        </>}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#1A1A18] block mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} type="button" onClick={() => setReview(r => ({ ...r, rating: s }))}>
                  <Star size={28} className={`transition-colors ${s <= review.rating ? 'text-[#D97706] fill-current' : 'text-[#E8E8E4]'}`} />
                </button>
              ))}
            </div>
          </div>
          <Textarea
            label="Your Review"
            name="comment"
            value={review.comment}
            onChange={e => setReview(r => ({ ...r, comment: e.target.value }))}
            placeholder="Share your experience with this vendor..."
            rows={4}
          />
        </div>
      </Modal>
    </div>
  );
}
