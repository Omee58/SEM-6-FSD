import { useState, useEffect } from 'react';
import { Star, Trash2, Search, MessageSquare, TrendingUp } from 'lucide-react';
import { toast } from 'react-toastify';
import { adminAPI } from '../../services/api';
import { PageSpinner } from '../../components/ui/Spinner';

function Orb({ size, color, style: s }) {
  return <div className="absolute rounded-full pointer-events-none"
    style={{ width: size, height: size, background: color, filter: 'blur(70px)', ...s }} />;
}

function StarRow({ rating, max = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(max)].map((_, i) => (
        <Star key={i} size={13}
          style={{ color: i < rating ? '#F59E0B' : '#E2E8F0', fill: i < rating ? '#F59E0B' : '#E2E8F0' }} />
      ))}
    </div>
  );
}

export default function AdminReviews() {
  const [reviews,   setReviews]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState(0); // 0=all, 1-5=star filter
  const [deleting,  setDeleting]  = useState(null);
  const [mounted,   setMounted]   = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const r = await adminAPI.getReviews();
      setReviews(r.data.reviews || []);
    } catch {}
    setLoading(false);
    setTimeout(() => setMounted(true), 60);
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await adminAPI.deleteReview(id);
      toast.success('Review removed.');
      setReviews(prev => prev.filter(r => r._id !== id));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to remove review'); }
    setDeleting(null);
  };

  // Derived stats
  const avgRating   = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;
  const distribution = [5, 4, 3, 2, 1].map(n => ({ star: n, count: reviews.filter(r => r.rating === n).length }));

  const filtered = reviews.filter(r => {
    const matchSearch = !search ||
      r.client?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.service?.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.comment?.toLowerCase().includes(search.toLowerCase());
    const matchStar = filter === 0 || r.rating === filter;
    return matchSearch && matchStar;
  });

  return (
    <div className="space-y-6" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.35s ease' }}>

      {/* ══ HERO ══ */}
      <div className="relative overflow-hidden rounded-3xl"
        style={{ background: 'linear-gradient(135deg,#060B14 0%,#0D1627 50%,#0F172A 100%)', minHeight: 170, padding: '32px 40px' }}>
        <Orb size={280} color="rgba(245,158,11,0.12)" style={{ top: -60, right: -40 }} />
        <Orb size={180} color="rgba(99,102,241,0.09)" style={{ bottom: -50, right: 240, animationDelay: '3s' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-[11px] font-bold uppercase tracking-widest"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}>
              <Star size={11} style={{ color: '#F59E0B' }} /> Reviews Management
            </div>
            <h1 className="text-white font-bold mb-1"
              style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.4rem,3vw,2rem)' }}>
              Platform Reviews
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13 }}>
              {reviews.length} total reviews · Avg rating {avgRating} ★
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-3 rounded-2xl text-center"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', minWidth: 80 }}>
              <p className="font-bold text-[1.3rem]" style={{ fontFamily: 'Cormorant Garamond,serif', color: '#FCD34D' }}>{avgRating}</p>
              <p className="text-[10px] uppercase tracking-widest font-semibold mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Avg Rating</p>
            </div>
            <div className="px-4 py-3 rounded-2xl text-center"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', minWidth: 80 }}>
              <p className="font-bold text-[1.3rem]" style={{ fontFamily: 'Cormorant Garamond,serif', color: '#A5B4FC' }}>{reviews.length}</p>
              <p className="text-[10px] uppercase tracking-widest font-semibold mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Total</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* ══ SIDEBAR: Rating Distribution ══ */}
        <div className="space-y-4">
          <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(15,23,42,0.06)' }}>
            <h3 className="font-bold mb-4" style={{ fontFamily: 'Playfair Display,serif', color: '#0F172A', fontSize: '1rem' }}>
              Rating Breakdown
            </h3>
            <div className="space-y-2.5">
              {distribution.map(({ star, count }) => {
                const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                return (
                  <button key={star} onClick={() => setFilter(filter === star ? 0 : star)}
                    className="w-full flex items-center gap-2.5 transition-all group"
                    style={{ opacity: filter !== 0 && filter !== star ? 0.45 : 1 }}>
                    <div className="flex items-center gap-1 w-8 shrink-0">
                      <span className="text-[12px] font-bold" style={{ color: '#475569' }}>{star}</span>
                      <Star size={11} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
                    </div>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: filter === star ? '#F59E0B' : '#FCD34D' }} />
                    </div>
                    <span className="text-[11px] font-semibold w-6 text-right" style={{ color: '#94A3B8' }}>{count}</span>
                  </button>
                );
              })}
            </div>
            {filter !== 0 && (
              <button onClick={() => setFilter(0)}
                className="mt-4 w-full py-2 rounded-xl text-[12px] font-semibold transition-all"
                style={{ background: '#F1F5F9', color: '#475569' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#E2E8F0'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#F1F5F9'; }}>
                Clear filter
              </button>
            )}
          </div>

          {/* summary card */}
          <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg,#0D1627,#0F172A)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div className="text-center mb-3">
              <p className="font-bold text-[2.5rem] leading-none" style={{ fontFamily: 'Cormorant Garamond,serif', color: '#FCD34D' }}>{avgRating}</p>
              <StarRow rating={Math.round(Number(avgRating))} />
              <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>out of 5.0</p>
            </div>
            <div className="pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[11px] text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* ══ REVIEWS LIST ══ */}
        <div className="lg:col-span-3 space-y-4">
          {/* search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search reviews by client, service or keyword…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[13px] focus:outline-none"
              style={{ border: '1.5px solid #E2E8F0', color: '#0F172A' }}
              onFocus={e => { e.currentTarget.style.borderColor = '#F59E0B'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0'; }} />
          </div>

          {loading ? <PageSpinner /> : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-3xl"
              style={{ background: '#fff', border: '1px solid #E2E8F0' }}>
              <MessageSquare size={40} style={{ color: '#CBD5E1', marginBottom: 12 }} />
              <p className="font-bold text-[1.1rem]" style={{ fontFamily: 'Playfair Display,serif', color: '#0F172A' }}>
                {reviews.length === 0 ? 'No reviews yet' : 'No matching reviews'}
              </p>
              <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>
                {reviews.length === 0 ? 'Reviews will appear here once clients rate services' : 'Try different search terms'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((r, idx) => (
                <div key={r._id}
                  className="rounded-2xl p-5 transition-all duration-200"
                  style={{
                    background: '#fff',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 2px 8px rgba(15,23,42,0.05)',
                    animation: `fadeUp 0.4s ease ${idx * 0.04}s both`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(15,23,42,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,23,42,0.05)'; e.currentTarget.style.transform = ''; }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      {/* avatar */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
                        style={{ background: 'linear-gradient(135deg,#4C1D95,#6D28D9)' }}>
                        {r.client?.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-[14px]" style={{ color: '#0F172A' }}>{r.client?.full_name || '—'}</p>
                        <p className="text-[12px]" style={{ color: '#64748B' }}>
                          for <span className="font-semibold" style={{ color: '#475569' }}>{r.service?.title || '—'}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex flex-col items-end gap-1">
                        <StarRow rating={r.rating} />
                        <span className="text-[11px]" style={{ color: '#94A3B8' }}>
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </span>
                      </div>
                      <button onClick={() => handleDelete(r._id)} disabled={deleting === r._id}
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                        style={{ background: '#FEF2F2', color: '#EF4444' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.transform = ''; }}>
                        {deleting === r._id
                          ? <span className="spinner" style={{ width: 12, height: 12 }} />
                          : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                  {r.comment && (
                    <p className="text-[13px] leading-relaxed italic px-3 py-2.5 rounded-xl"
                      style={{ color: '#475569', background: '#F8FAFF', borderLeft: '3px solid #E2E8F0' }}>
                      "{r.comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
