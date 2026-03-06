import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, Search, Star, Clock, ArrowRight, Heart, Check,
  Sparkles, Bell, MapPin, TrendingUp, Camera, Utensils,
  Building2, Flower2, Music2, Palette, Car, Wand2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clientAPI } from '../../services/api';
import Badge from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';

/* ── Constants ───────────────────────────────────────── */

const CATEGORY_ICON = {
  photography: Camera, catering: Utensils, venue: Building2,
  decoration: Flower2, music: Music2, makeup: Palette,
  transport: Car, other: Wand2, mehendi: Flower2,
};

const CHECKLIST = [
  { label: 'Book a venue',           category: 'venue',         icon: Building2, color: '#7C3AED' },
  { label: 'Hire a photographer',    category: 'photography',   icon: Camera,    color: '#BE185D' },
  { label: 'Arrange catering',       category: 'catering',      icon: Utensils,  color: '#B8912A' },
  { label: 'Book decorations',       category: 'decoration',    icon: Flower2,   color: '#059669' },
  { label: 'Plan makeup & mehendi',  category: ['makeup','mehendi'], icon: Palette, color: '#2563EB' },
];

const STAT_CONFIG = [
  { key: 'total',     label: 'Total Bookings',  tab: '',          grad: 'linear-gradient(135deg,#BE185D 0%,#9D174D 100%)', glow: '0 12px 40px rgba(190,24,93,0.45)',  icon: Calendar },
  { key: 'pending',   label: 'Pending',         tab: 'pending',   grad: 'linear-gradient(135deg,#B8912A 0%,#9A7520 100%)', glow: '0 12px 40px rgba(184,145,42,0.45)', icon: Clock },
  { key: 'confirmed', label: 'Confirmed',       tab: 'confirmed', grad: 'linear-gradient(135deg,#059669 0%,#047857 100%)', glow: '0 12px 40px rgba(5,150,105,0.45)', icon: Heart },
  { key: 'completed', label: 'Completed',       tab: 'completed', grad: 'linear-gradient(135deg,#7C3AED 0%,#6D28D9 100%)', glow: '0 12px 40px rgba(124,58,237,0.45)', icon: Star },
];

const QUICK_ACTIONS = [
  { to: '/services', icon: Search,   label: 'Browse', sub: 'Find vendors',     grad: 'linear-gradient(135deg,#BE185D,#9D174D)', glow: 'rgba(190,24,93,0.3)',  delay: '0s' },
  { to: '/planner',  icon: Star,     label: 'Budget',  sub: 'Plan finances',   grad: 'linear-gradient(135deg,#B8912A,#9A7520)', glow: 'rgba(184,145,42,0.3)', delay: '0.06s' },
  { to: '/bookings', icon: Calendar, label: 'Bookings',sub: 'Manage events',   grad: 'linear-gradient(135deg,#7C3AED,#6D28D9)', glow: 'rgba(124,58,237,0.3)', delay: '0.12s' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ── Animated counter ────────────────────────────────── */
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = Number(value);
    if (end === 0) { setDisplay(0); return; }
    const step = Math.ceil(end / 20);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(start);
    }, 40);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}</span>;
}

/* ── Floating Orb ────────────────────────────────────── */
function FloatOrb({ size, color, style: s }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size, height: size,
        background: color,
        filter: 'blur(40px)',
        animation: 'floatSlow 6s ease-in-out infinite',
        ...s,
      }}
    />
  );
}

/* ── Main Component ──────────────────────────────────── */
export default function ClientDashboard() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [visible, setVisible]   = useState(false);

  useEffect(() => {
    clientAPI.getBookings()
      .then(r => setBookings(r.data.bookings || []))
      .catch(() => {})
      .finally(() => { setLoading(false); setTimeout(() => setVisible(true), 60); });
  }, []);

  if (loading) return <PageSpinner />;

  const upcoming  = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const completed = bookings.filter(b => b.status === 'completed');
  const pending   = bookings.filter(b => b.status === 'pending');

  const nextBooking = upcoming
    .filter(b => new Date(b.booking_date) >= new Date())
    .sort((a, b) => new Date(a.booking_date) - new Date(b.booking_date))[0];

  const checkedItems = CHECKLIST.map(({ category }) => {
    const cats = Array.isArray(category) ? category : [category];
    return bookings.some(b => cats.includes(b.service?.category));
  });
  const checkCount = checkedItems.filter(Boolean).length;
  const ringPct    = checkCount / CHECKLIST.length;
  const daysUntil  = nextBooking
    ? Math.ceil((new Date(nextBooking.booking_date) - new Date()) / 86400000)
    : null;

  const statValues = {
    total: bookings.length, pending: pending.length,
    confirmed: confirmed.length, completed: completed.length,
  };

  const CIRCUMFERENCE = 2 * Math.PI * 38;

  return (
    <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease' }}>
      <div className="space-y-6">

        {/* ══════════════════════════════════════════════
            HERO BANNER — animated gradient + floating orbs
            ══════════════════════════════════════════════ */}
        <div
          className="relative overflow-hidden rounded-3xl text-white"
          style={{
            background: 'linear-gradient(135deg, #0D0509 0%, #2D0D1A 30%, #6B0F30 65%, #BE185D 100%)',
            backgroundSize: '300% 300%',
            animation: 'gradientShift 8s ease infinite',
            minHeight: 220,
            padding: '36px 40px',
          }}
        >
          {/* Floating orbs */}
          <FloatOrb size={220} color="rgba(190,24,93,0.22)" style={{ top: -60, right: -40, animationDelay: '0s' }} />
          <FloatOrb size={140} color="rgba(184,145,42,0.18)" style={{ bottom: -30, right: 120, animationDelay: '2s' }} />
          <FloatOrb size={100} color="rgba(124,58,237,0.15)" style={{ top: 10, left: '40%', animationDelay: '4s' }} />

          {/* Dot mesh overlay */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }} />

          {/* Ripple circles */}
          <div className="absolute top-8 right-10 w-32 h-32 rounded-full border border-white/10 hidden lg:block"
            style={{ animation: 'ripple 3s ease-out infinite' }} />
          <div className="absolute top-8 right-10 w-32 h-32 rounded-full border border-white/10 hidden lg:block"
            style={{ animation: 'ripple 3s ease-out infinite', animationDelay: '1.5s' }} />

          <div className="relative flex items-center gap-8">
            <div className="flex-1 min-w-0">
              {/* Premium badge */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4"
                style={{
                  background: 'rgba(184,145,42,0.18)',
                  border: '1px solid rgba(184,145,42,0.35)',
                  animation: 'fadeIn 0.6s ease both',
                }}
              >
                <Sparkles size={11} style={{ color: '#E8C86E' }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#E8C86E' }}>
                  PREMIUM MEMBER
                </span>
              </div>

              {/* Greeting */}
              <h1
                className="text-white font-bold leading-tight"
                style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)',
                  letterSpacing: '-0.02em',
                  animation: 'fadeUp 0.6s ease 0.1s both',
                }}
              >
                {getGreeting()},<br />
                {user?.full_name?.split(' ')[0]}
              </h1>

              <p
                className="mt-2"
                style={{
                  color: 'rgba(255,255,255,0.55)',
                  fontSize: 14,
                  animation: 'fadeUp 0.6s ease 0.2s both',
                }}
              >
                Your dream wedding is coming together beautifully.
              </p>

              {/* Stat pills inside hero */}
              <div
                className="flex flex-wrap gap-3 mt-6 pt-5"
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  animation: 'fadeUp 0.6s ease 0.3s both',
                }}
              >
                {[
                  { v: bookings.length,   l: 'Total',     c: 'rgba(255,255,255,0.9)' },
                  { v: upcoming.length,   l: 'Upcoming',  c: '#86EFAC' },
                  { v: completed.length,  l: 'Completed', c: '#C4B5FD' },
                  { v: `${checkCount}/${CHECKLIST.length}`, l: 'Checklist', c: '#FDE68A' },
                ].map(({ v, l, c }) => (
                  <div key={l}
                    className="flex items-baseline gap-1.5 px-3 py-1.5 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <span className="font-bold text-lg leading-none" style={{ fontFamily: 'Playfair Display, serif', color: c }}>{v}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Animated heart orb */}
            <div
              className="hidden lg:flex shrink-0 w-28 h-28 rounded-full items-center justify-center relative"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                animation: 'fadeIn 0.8s ease 0.4s both',
              }}
            >
              <Heart
                size={48}
                className="fill-white/25 text-white/50"
                style={{ animation: 'heartbeat 2s ease-in-out infinite' }}
              />
              {/* Rotating ring */}
              <div
                className="absolute inset-0 rounded-full border border-dashed border-white/15"
                style={{ animation: 'spin 12s linear infinite' }}
              />
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            STAT CARDS — gradient, animated count-up
            ══════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CONFIG.map(({ key, label, tab, grad, glow, icon: Icon }, idx) => (
            <div
              key={key}
              onClick={() => navigate(`/bookings${tab ? `?tab=${tab}` : ''}`)}
              className="relative overflow-hidden rounded-2xl p-5 cursor-pointer group"
              style={{
                background: grad,
                boxShadow: glow,
                animation: `scaleIn 0.5s ease ${idx * 0.08}s both`,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; e.currentTarget.style.boxShadow = glow.replace('0.45', '0.65'); }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = glow; }}
            >
              {/* Background icon watermark */}
              <div className="absolute -right-3 -bottom-3 opacity-15">
                <Icon size={72} className="text-white" />
              </div>

              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                  <Icon size={18} className="text-white" />
                </div>
                <div className="flex items-center gap-1"
                  style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 999, padding: '2px 8px' }}>
                  <TrendingUp size={10} className="text-white" />
                  <span style={{ fontSize: 10, color: 'white', fontWeight: 700 }}>LIVE</span>
                </div>
              </div>

              {/* Value */}
              <div
                className="text-white font-bold mb-0.5"
                style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '2.25rem',
                  lineHeight: 1,
                  animation: `countUp 0.5s ease ${idx * 0.08}s both`,
                }}
              >
                <AnimatedNumber value={statValues[key]} />
              </div>

              {/* Label */}
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em' }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════════════
            NEXT BOOKING — cinematic feature card
            ══════════════════════════════════════════════ */}
        {nextBooking && (
          <div
            onClick={() => navigate('/bookings?tab=confirmed')}
            className="relative overflow-hidden rounded-3xl cursor-pointer group"
            style={{
              minHeight: 140,
              animation: 'fadeUp 0.6s ease 0.35s both',
              transition: 'transform 0.3s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
          >
            {/* Background */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#1A0A10 0%,#4A0E25 50%,#BE185D 100%)' }} />

            {/* Service image as bg */}
            {nextBooking.service?.images?.[0] && (
              <div className="absolute inset-0">
                <img
                  src={`${import.meta.env.VITE_UPLOAD_URL}/${nextBooking.service.images[0]}`}
                  alt="" className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                />
              </div>
            )}

            {/* Overlay gradient */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(26,10,16,0.92) 0%, rgba(26,10,16,0.5) 60%, transparent 100%)' }} />

            <div className="relative flex items-center gap-6 p-7">
              {/* Service icon */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
              >
                {nextBooking.service?.images?.[0] ? (
                  <img src={`${import.meta.env.VITE_UPLOAD_URL}/${nextBooking.service.images[0]}`}
                    alt="" className="w-full h-full object-cover rounded-2xl" loading="lazy" />
                ) : (() => {
                  const Icon = CATEGORY_ICON[nextBooking.service?.category] || CATEGORY_ICON.other;
                  return <Icon size={28} style={{ color: 'rgba(255,255,255,0.7)' }} />;
                })()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#86EFAC', animation: 'glowPulse 2s ease-in-out infinite' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#86EFAC', textTransform: 'uppercase' }}>
                    Your Next Celebration
                  </span>
                </div>
                <div
                  className="text-white font-bold truncate"
                  style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', lineHeight: 1.2 }}
                >
                  {nextBooking.service?.title}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <MapPin size={11} style={{ color: 'rgba(255,255,255,0.5)' }} />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                    {nextBooking.vendor?.full_name} · {new Date(nextBooking.booking_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                </div>
              </div>

              {/* Days countdown */}
              <div className="text-center shrink-0">
                <div
                  className="text-white font-bold"
                  style={{ fontFamily: 'Playfair Display, serif', fontSize: '3.5rem', lineHeight: 1, textShadow: '0 0 40px rgba(190,24,93,0.8)' }}
                >
                  {daysUntil}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {daysUntil === 1 ? 'day away' : 'days away'}
                </div>
              </div>

              <ArrowRight
                size={20}
                className="text-white shrink-0 transition-transform duration-300 group-hover:translate-x-2"
                style={{ opacity: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            MAIN GRID
            ══════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: Upcoming Bookings (2/3) */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #E8E1D9', boxShadow: '0 4px 20px rgba(28,9,16,0.07)', animation: 'fadeUp 0.6s ease 0.4s both' }}>
            <div className="px-6 pt-6 pb-4 flex items-center justify-between" style={{ borderBottom: '1px solid #F0EBE5' }}>
              <div>
                <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917', fontSize: '1.1rem', fontWeight: 700 }}>
                  Upcoming Bookings
                </h2>
                <p style={{ fontSize: 12, color: '#78716C', marginTop: 2 }}>Active & pending services</p>
              </div>
              <Link
                to="/bookings"
                className="flex items-center gap-1.5 transition-all duration-200 hover:gap-2.5"
                style={{ fontSize: 13, fontWeight: 700, color: '#BE185D' }}
              >
                View all <ArrowRight size={13} />
              </Link>
            </div>

            <div className="p-5">
              {upcoming.length === 0 ? (
                /* Empty state with visual */
                <div className="text-center py-14" style={{ animation: 'fadeUp 0.5s ease both' }}>
                  <div
                    className="relative mx-auto mb-5"
                    style={{ width: 80, height: 80 }}
                  >
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                      style={{ background: 'linear-gradient(135deg,#FCE7F3,#F9D4EC)', animation: 'float 3s ease-in-out infinite' }}>
                      <Calendar size={34} style={{ color: '#BE185D' }} />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg,#B8912A,#9A7520)', boxShadow: '0 2px 8px rgba(184,145,42,0.4)' }}>
                      <Sparkles size={12} style={{ color: '#fff' }} />
                    </div>
                  </div>
                  <p className="font-bold mb-1" style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917', fontSize: '1.05rem' }}>
                    No upcoming bookings yet
                  </p>
                  <p style={{ fontSize: 13, color: '#78716C', marginBottom: 20 }}>
                    Start planning your perfect wedding day
                  </p>
                  <Link
                    to="/services"
                    className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold rounded-xl transition-all"
                    style={{
                      background: 'linear-gradient(135deg,#BE185D,#9D174D)',
                      boxShadow: '0 8px 24px rgba(190,24,93,0.4)',
                      fontSize: 13,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(190,24,93,0.5)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 24px rgba(190,24,93,0.4)'; }}
                  >
                    Browse Services <ArrowRight size={15} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {upcoming.slice(0, 5).map((b, i) => {
                    const CatIcon = CATEGORY_ICON[b.service?.category] || Wand2;
                    return (
                      <Link
                        key={b._id}
                        to="/bookings"
                        className="flex items-center gap-4 p-4 rounded-xl group transition-all duration-200"
                        style={{
                          border: '1px solid #F0EBE5',
                          animation: `slideRight 0.4s ease ${i * 0.06}s both`,
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = 'rgba(190,24,93,0.25)';
                          e.currentTarget.style.background = '#FDF6F9';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = '#F0EBE5';
                          e.currentTarget.style.background = '';
                          e.currentTarget.style.transform = '';
                        }}
                      >
                        {/* Image / Icon */}
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                          style={{ background: 'linear-gradient(135deg,#FCE7F3,#F9D4EC)', transition: 'transform 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08) rotate(-2deg)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
                        >
                          {b.service?.images?.[0] ? (
                            <img src={`${import.meta.env.VITE_UPLOAD_URL}/${b.service.images[0]}`}
                              alt="" className="w-full h-full object-cover rounded-xl" loading="lazy" />
                          ) : (
                            <CatIcon size={20} style={{ color: '#BE185D' }} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate" style={{ fontSize: 13, color: '#1C1917' }}>
                            {b.service?.title || 'Service'}
                          </div>
                          <div className="truncate mt-0.5" style={{ fontSize: 12, color: '#78716C' }}>
                            {b.vendor?.full_name} · {new Date(b.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <Badge status={b.status}>{b.status}</Badge>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#B8912A' }}>
                            ₹{b.total_amount?.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Quick Actions + Checklist */}
          <div className="space-y-5">

            {/* Quick Action Tiles */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: '#fff', border: '1px solid #E8E1D9', boxShadow: '0 4px 20px rgba(28,9,16,0.07)', animation: 'fadeUp 0.6s ease 0.45s both' }}
            >
              <div className="px-5 pt-5 pb-3" style={{ borderBottom: '1px solid #F0EBE5' }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917', fontSize: '1.05rem', fontWeight: 700 }}>
                  Quick Actions
                </h2>
              </div>
              <div className="p-4 grid grid-cols-3 gap-3">
                {QUICK_ACTIONS.map(({ to, icon: Icon, label, sub, grad, glow, delay }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl text-center transition-all duration-200 group"
                    style={{
                      background: '#FDF9F4',
                      animation: `scaleIn 0.4s ease ${delay} both`,
                      border: '1px solid #F0EBE5',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#fff';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = `0 8px 24px ${glow}`;
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#FDF9F4';
                      e.currentTarget.style.transform = '';
                      e.currentTarget.style.boxShadow = '';
                      e.currentTarget.style.borderColor = '#F0EBE5';
                    }}
                  >
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center"
                      style={{ background: grad, boxShadow: `0 4px 12px ${glow}` }}
                    >
                      <Icon size={18} className="text-white" />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#1C1917' }}>{label}</div>
                      <div style={{ fontSize: 10, color: '#A8A29E' }}>{sub}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Wedding Checklist */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: '#fff', border: '1px solid #E8E1D9', boxShadow: '0 4px 20px rgba(28,9,16,0.07)', animation: 'fadeUp 0.6s ease 0.5s both' }}
            >
              <div className="px-5 pt-5 pb-3 flex items-center justify-between" style={{ borderBottom: '1px solid #F0EBE5' }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917', fontSize: '1.05rem', fontWeight: 700 }}>
                  Wedding Checklist
                </h2>
                {checkCount === CHECKLIST.length && (
                  <span
                    style={{ fontSize: 11, fontWeight: 700, background: '#D1FAE5', color: '#065F46', padding: '3px 10px', borderRadius: 999, animation: 'scaleIn 0.3s ease both' }}
                  >
                    All done!
                  </span>
                )}
              </div>

              <div className="p-5">
                {/* Big animated progress ring */}
                <div className="flex flex-col items-center mb-5">
                  <div className="relative" style={{ width: 100, height: 100 }}>
                    <svg viewBox="0 0 100 100" style={{ width: 100, height: 100, transform: 'rotate(-90deg)' }}>
                      {/* Track */}
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#F0EBE5" strokeWidth="7" />
                      {/* Progress */}
                      <circle
                        cx="50" cy="50" r="38" fill="none"
                        stroke={checkCount === CHECKLIST.length
                          ? 'url(#successGrad)'
                          : 'url(#progressGrad)'}
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeDasharray={CIRCUMFERENCE}
                        strokeDashoffset={CIRCUMFERENCE * (1 - ringPct)}
                        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
                      />
                      <defs>
                        <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#BE185D" />
                          <stop offset="100%" stopColor="#F472B6" />
                        </linearGradient>
                        <linearGradient id="successGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#059669" />
                          <stop offset="100%" stopColor="#34D399" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span
                        className="font-bold"
                        style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: checkCount === CHECKLIST.length ? '#059669' : '#BE185D', lineHeight: 1 }}
                      >
                        {Math.round(ringPct * 100)}%
                      </span>
                      <span style={{ fontSize: 10, color: '#A8A29E', fontWeight: 600 }}>done</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: '#78716C', marginTop: 8 }}>
                    {checkCount} of {CHECKLIST.length} completed
                  </p>
                </div>

                {/* Checklist items with icons */}
                <div className="space-y-2">
                  {CHECKLIST.map(({ label, category, icon: CIcon, color }, i) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200"
                      style={{
                        background: checkedItems[i] ? '#F0FDF4' : '#FDF9F4',
                        border: `1px solid ${checkedItems[i] ? 'rgba(5,150,105,0.15)' : '#F0EBE5'}`,
                        animation: `slideRight 0.4s ease ${i * 0.07}s both`,
                      }}
                    >
                      {/* Circle checkbox with icon */}
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                        style={checkedItems[i] ? {
                          background: 'linear-gradient(135deg,#059669,#047857)',
                          boxShadow: '0 3px 8px rgba(5,150,105,0.35)',
                          animation: 'checkPop 0.4s ease both',
                        } : {
                          background: color + '18',
                          border: `2px solid ${color}30`,
                        }}
                      >
                        {checkedItems[i]
                          ? <Check size={13} className="text-white" strokeWidth={3} />
                          : <CIcon size={13} style={{ color }} />}
                      </div>

                      <span
                        className="flex-1 text-[13px] font-medium"
                        style={{
                          color: checkedItems[i] ? '#86EFAC' : '#1C1917',
                          textDecoration: checkedItems[i] ? 'line-through' : 'none',
                          transition: 'all 0.3s',
                        }}
                      >
                        {label}
                      </span>

                      {!checkedItems[i] && (
                        <Link
                          to={`/services?category=${Array.isArray(category) ? category[0] : category}`}
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg shrink-0 transition-all"
                          style={{ color, background: color + '15' }}
                          onMouseEnter={e => { e.currentTarget.style.background = color + '28'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = color + '15'; }}
                        >
                          Book
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
