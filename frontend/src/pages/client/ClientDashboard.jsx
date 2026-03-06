import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search, Star, Clock, ArrowRight, Heart, Check, Sparkles, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clientAPI } from '../../services/api';
import StatsCard from '../../components/ui/StatsCard';
import Badge from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';

const CATEGORY_EMOJI = {
  photography: '📸',
  catering: '🍽️',
  venue: '🏛️',
  decoration: '🌸',
  mehendi: '🌿',
  music: '🎵',
  makeup: '💄',
  transport: '🚗',
  other: '✨',
};

const CHECKLIST = [
  { label: 'Book a venue', category: 'venue' },
  { label: 'Hire a photographer', category: 'photography' },
  { label: 'Arrange catering', category: 'catering' },
  { label: 'Book decorations', category: 'decoration' },
  { label: 'Plan makeup & mehendi', category: ['makeup', 'mehendi'] },
];

const QUICK_ACTIONS = [
  { to: '/services', icon: Search, label: 'Browse Services', sub: 'Find vendors near you', hoverBorder: '#BE185D', hoverBg: '#FCE7F3', iconBg: 'bg-[#FCE7F3]', iconColor: 'text-[#BE185D]' },
  { to: '/planner', icon: Star, label: 'Budget Planner', sub: 'Plan your budget smartly', hoverBorder: '#D97706', hoverBg: '#FEF3C7', iconBg: 'bg-[#FEF3C7]', iconColor: 'text-[#D97706]' },
  { to: '/bookings', icon: Calendar, label: 'My Bookings', sub: 'View & manage bookings', hoverBorder: '#059669', hoverBg: '#D1FAE5', iconBg: 'bg-[#D1FAE5]', iconColor: 'text-[#059669]' },
];

export default function ClientDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  useEffect(() => {
    clientAPI.getBookings()
      .then(r => setBookings(r.data.bookings || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;

  const upcoming = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const completed = bookings.filter(b => b.status === 'completed');
  const pending = bookings.filter(b => b.status === 'pending');

  const checkedItems = CHECKLIST.map(({ category }) => {
    const cats = Array.isArray(category) ? category : [category];
    return bookings.some(b => cats.includes(b.service?.category));
  });
  const checkCount = checkedItems.filter(Boolean).length;

  return (
    <div className="space-y-6">

      {/* ── Hero Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#BE185D] via-[#9D174D] to-[#7C1040] p-6 text-white">
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }}
        />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={13} className="text-[#FCE7F3]" />
              <span className="text-[#FCE7F3] text-xs font-medium">{today}</span>
            </div>
            <h1 className="text-2xl font-bold mb-1 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
              Welcome back, {user?.full_name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-[#FCE7F3] text-sm">Your dream wedding is coming together beautifully.</p>
            {bookings.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2">
                <TrendingUp size={13} className="text-[#FCE7F3] shrink-0" />
                <span className="text-[#FCE7F3] text-xs">
                  {upcoming.length} upcoming booking{upcoming.length !== 1 ? 's' : ''} · {completed.length} service{completed.length !== 1 ? 's' : ''} completed
                </span>
              </div>
            )}
          </div>
          <div className="hidden sm:flex w-20 h-20 rounded-full bg-white/10 items-center justify-center shrink-0">
            <Heart size={34} className="text-white fill-white/60" />
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={Calendar} label="Total Bookings" value={bookings.length} accent="rose" />
        <StatsCard icon={Clock} label="Pending" value={pending.length} accent="gold" />
        <StatsCard icon={Heart} label="Confirmed" value={confirmed.length} accent="green" />
        <StatsCard icon={Star} label="Completed" value={completed.length} accent="purple" />
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Upcoming Bookings */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-[#E8E8E4] flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-[#1A1A18]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Upcoming Bookings
              </h2>
              <p className="text-xs text-[#6B6B65] mt-0.5">Pending &amp; confirmed services</p>
            </div>
            <Link to="/bookings" className="text-sm text-[#BE185D] font-medium flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="p-6">
            {upcoming.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-[#FCE7F3] flex items-center justify-center mx-auto mb-4">
                  <Calendar size={28} className="text-[#BE185D]" />
                </div>
                <p className="text-sm font-semibold text-[#1A1A18] mb-1">No upcoming bookings</p>
                <p className="text-xs text-[#6B6B65] mb-5">Start planning your perfect wedding day</p>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#BE185D] text-white text-sm font-medium rounded-[10px] hover:bg-[#9D174D] transition-colors"
                >
                  Browse Services <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.slice(0, 5).map(b => (
                  <Link
                    key={b._id}
                    to="/bookings"
                    className="flex items-center gap-4 p-4 rounded-xl border border-[#E8E8E4] hover:border-[#BE185D]/40 hover:bg-[#FAFAF8] transition-all group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#FCE7F3] flex items-center justify-center shrink-0 text-lg group-hover:scale-105 transition-transform">
                      {CATEGORY_EMOJI[b.service?.category] || '✨'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[#1A1A18] text-sm truncate">
                        {b.service?.title || 'Service'}
                      </div>
                      <div className="text-xs text-[#6B6B65] mt-0.5 truncate">
                        {b.vendor?.full_name} · {new Date(b.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge status={b.status}>{b.status}</Badge>
                      <div className="text-xs font-bold text-[#D97706]">₹{b.total_amount?.toLocaleString('en-IN')}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Quick Actions */}
          <div className="card p-6">
            <h2 className="font-semibold text-[#1A1A18] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Quick Actions
            </h2>
            <div className="space-y-2.5">
              {QUICK_ACTIONS.map(({ to, icon: Icon, label, sub, hoverBorder, hoverBg, iconBg, iconColor }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-[#E8E8E4] transition-all group"
                  onMouseEnter={e => { e.currentTarget.style.borderColor = hoverBorder; e.currentTarget.style.backgroundColor = hoverBg; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.backgroundColor = ''; }}
                >
                  <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                    <Icon size={16} className={iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#1A1A18]">{label}</div>
                    <div className="text-xs text-[#6B6B65]">{sub}</div>
                  </div>
                  <ArrowRight size={14} className="text-[#6B6B65] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Wedding Checklist */}
          <div className="card p-6">
            <h2 className="font-semibold text-[#1A1A18] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Wedding Checklist
            </h2>
            <div className="space-y-3">
              {CHECKLIST.map(({ label, category }, i) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${checkedItems[i] ? 'bg-[#059669] border-[#059669]' : 'border-[#D1D5DB]'}`}>
                    {checkedItems[i] && <Check size={11} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className={`text-sm flex-1 transition-colors ${checkedItems[i] ? 'text-[#6B6B65] line-through' : 'text-[#1A1A18]'}`}>
                    {label}
                  </span>
                  {!checkedItems[i] && (
                    <Link
                      to={`/services?category=${Array.isArray(category) ? category[0] : category}`}
                      className="text-xs text-[#BE185D] font-semibold hover:underline shrink-0"
                    >
                      Book
                    </Link>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-[#E8E8E4]">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[#6B6B65]">Progress</span>
                <span className="font-bold text-[#BE185D]">{checkCount}/{CHECKLIST.length} done</span>
              </div>
              <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-[#BE185D] to-[#D97706] rounded-full transition-all duration-500"
                  style={{ width: `${(checkCount / CHECKLIST.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
