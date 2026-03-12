import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  IndianRupee, Bell, Package, Star, TrendingUp, CheckCircle,
  XCircle, ArrowRight, Sparkles, ShieldCheck, Clock, BarChart2,
  Calendar, User,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { toast } from 'react-toastify';
import { vendorAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageSpinner } from '../../components/ui/Spinner';

/* ── Helpers ─────────────────────────────────────────── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function AnimatedNumber({ value, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = Number(value);
    if (end === 0) { setDisplay(0); return; }
    const step = Math.max(1, Math.ceil(end / 30));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(start);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{display.toLocaleString('en-IN')}{suffix}</span>;
}

function FloatOrb({ size, color, style: s }) {
  return (
    <div className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, background: color, filter: 'blur(50px)', animation: 'floatSlow 7s ease-in-out infinite', ...s }} />
  );
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl p-3 text-sm" style={{ background: '#1C1917', border: '1px solid rgba(201,168,76,0.25)', boxShadow: '0 12px 32px rgba(0,0,0,0.4)' }}>
      <div className="font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
      {payload[0] && <div className="font-bold" style={{ color: '#C9A84C', fontFamily: 'Playfair Display, serif', fontSize: '1rem' }}>₹{payload[0].value?.toLocaleString('en-IN')}</div>}
      {payload[1] && <div className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{payload[1].value} bookings</div>}
    </div>
  );
};

const STAT_CONFIG = [
  { key: 'earned',    label: 'Total Earnings',   prefix: '₹', grad: 'linear-gradient(135deg,#92681A 0%,#C9A84C 100%)', glow: '0 12px 40px rgba(201,168,76,0.4)',  icon: IndianRupee },
  { key: 'requests',  label: 'Pending Requests',  prefix: '',  grad: 'linear-gradient(135deg,#6B1230 0%,#8B1A3A 100%)', glow: '0 12px 40px rgba(139,26,58,0.4)',   icon: Bell },
  { key: 'bookings',  label: 'Total Bookings',    prefix: '',  grad: 'linear-gradient(135deg,#1D4ED8 0%,#2563EB 100%)', glow: '0 12px 40px rgba(37,99,235,0.4)',   icon: Package },
  { key: 'month',     label: 'This Month',        prefix: '₹', grad: 'linear-gradient(135deg,#065F46 0%,#059669 100%)', glow: '0 12px 40px rgba(5,150,105,0.4)',  icon: TrendingUp },
];

export default function VendorDashboard() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [earnings,  setEarnings]  = useState(null);
  const [requests,  setRequests]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [visible,   setVisible]   = useState(false);
  const [actionId,  setActionId]  = useState(null);

  const fetchData = () => {
    Promise.allSettled([
      vendorAPI.getEarnings(),
      vendorAPI.getBookingRequests(),
    ]).then(([er, rr]) => {
      if (er.status === 'fulfilled') setEarnings(er.value.data);
      if (rr.status === 'fulfilled') setRequests(rr.value.data.bookings || []);
      setLoading(false);
      setTimeout(() => setVisible(true), 60);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const changeStatus = async (id, status) => {
    setActionId(id);
    try {
      await vendorAPI.changeBookingStatus(id, status);
      toast.success(`Booking ${status}!`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
    setActionId(null);
  };

  if (loading) return <PageSpinner />;

  const isUnverified = !user?.verified;
  const statValues = {
    earned:   earnings?.totals?.total_earned      || 0,
    requests: requests.length,
    bookings: earnings?.totals?.total_bookings     || 0,
    month:    earnings?.totals?.this_month_earnings || 0,
  };

  return (
    <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease' }}>
      <div className="space-y-6">

        {/* ══ HERO ══ */}
        <div
          className="relative overflow-hidden rounded-3xl text-white"
          style={{
            background: 'linear-gradient(135deg,#0D0906 0%,#1C1917 35%,#2C1810 65%,#3D2208 100%)',
            backgroundSize: '300% 300%',
            animation: 'gradientShift 10s ease infinite',
            minHeight: 220,
            padding: '36px 40px',
          }}
        >
          <FloatOrb size={240} color="rgba(201,168,76,0.12)" style={{ top: -60, right: -40 }} />
          <FloatOrb size={160} color="rgba(139,26,58,0.15)" style={{ bottom: -40, right: 180, animationDelay: '2s' }} />
          <FloatOrb size={100} color="rgba(201,168,76,0.08)" style={{ top: 20, left: '45%', animationDelay: '4s' }} />

          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />

          {/* Rotating ring decoration */}
          <div className="absolute top-8 right-10 w-36 h-36 rounded-full border border-white/5 hidden lg:block"
            style={{ animation: 'spin 20s linear infinite' }} />
          <div className="absolute top-8 right-10 w-36 h-36 rounded-full border border-dashed border-white/5 hidden lg:block"
            style={{ animation: 'spin 15s linear infinite reverse' }} />

          <div className="relative flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              {/* Status badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4"
                style={{
                  background: isUnverified ? 'rgba(217,119,6,0.2)' : 'rgba(201,168,76,0.15)',
                  border: `1px solid ${isUnverified ? 'rgba(217,119,6,0.4)' : 'rgba(201,168,76,0.35)'}`,
                  animation: 'fadeIn 0.6s ease both',
                }}>
                {isUnverified
                  ? <Bell size={11} style={{ color: '#FCD34D' }} />
                  : <ShieldCheck size={11} style={{ color: '#C9A84C' }} />}
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: isUnverified ? '#FCD34D' : '#C9A84C' }}>
                  {isUnverified ? 'PENDING VERIFICATION' : 'VERIFIED VENDOR'}
                </span>
              </div>

              {/* Greeting */}
              <h1 className="text-white font-bold leading-tight mb-1"
                style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: 'clamp(1.5rem,3.5vw,2.4rem)',
                  letterSpacing: '-0.02em',
                  animation: 'fadeUp 0.6s ease 0.1s both',
                }}>
                {getGreeting()},<br />
                {user?.business_name || user?.full_name?.split(' ')[0]}
              </h1>

              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, animation: 'fadeUp 0.6s ease 0.2s both' }}>
                {isUnverified
                  ? 'Your account is under review. You\'ll be notified once approved.'
                  : 'Here\'s your business overview for today.'}
              </p>

              {/* Stat pills */}
              <div className="flex flex-wrap gap-3 mt-6 pt-5"
                style={{ borderTop: '1px solid rgba(255,255,255,0.08)', animation: 'fadeUp 0.6s ease 0.3s both' }}>
                {[
                  { v: `₹${statValues.earned.toLocaleString('en-IN')}`, l: 'Earnings', c: '#FDE68A' },
                  { v: statValues.requests,  l: 'Pending',   c: '#FDA4AF' },
                  { v: statValues.bookings,  l: 'Bookings',  c: 'rgba(255,255,255,0.85)' },
                  { v: `₹${statValues.month.toLocaleString('en-IN')}`, l: 'This Month', c: '#86EFAC' },
                ].map(({ v, l, c }) => (
                  <div key={l} className="flex items-baseline gap-1.5 px-3 py-1.5 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span className="font-bold text-lg leading-none" style={{ fontFamily: 'Cormorant Garamond, serif', color: c }}>{v}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: BarChart icon decoration */}
            <div className="hidden lg:flex shrink-0 w-28 h-28 rounded-2xl items-center justify-center"
              style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.15)', animation: 'fadeIn 0.8s ease 0.4s both' }}>
              <BarChart2 size={52} style={{ color: 'rgba(201,168,76,0.5)' }} />
            </div>
          </div>
        </div>

        {/* ══ STAT TILES ══ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CONFIG.map(({ key, label, prefix, grad, glow, icon: Icon }, idx) => (
            <div key={key}
              className="relative overflow-hidden rounded-2xl p-5 cursor-pointer"
              style={{
                background: grad,
                boxShadow: glow,
                animation: `scaleIn 0.5s ease ${idx * 0.08}s both`,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
            >
              <div className="absolute -right-3 -bottom-3 opacity-15">
                <Icon size={72} className="text-white" />
              </div>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}>
                  <Icon size={18} className="text-white" />
                </div>
                <div className="flex items-center gap-1"
                  style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 999, padding: '2px 8px' }}>
                  <TrendingUp size={10} className="text-white" />
                  <span style={{ fontSize: 10, color: 'white', fontWeight: 700 }}>LIVE</span>
                </div>
              </div>
              <div className="text-white font-bold mb-0.5"
                style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.4rem', lineHeight: 1 }}>
                <AnimatedNumber value={statValues[key]} prefix={prefix} />
              </div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* ══ MAIN GRID ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Earnings Chart (2/3) ── */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden"
            style={{ background: '#fff', border: '1px solid #E8E1D9', boxShadow: '0 4px 20px rgba(28,9,16,0.06)', animation: 'fadeUp 0.6s ease 0.4s both' }}>
            <div className="px-6 pt-6 pb-4 flex items-center justify-between" style={{ borderBottom: '1px solid #F0EBE5' }}>
              <div>
                <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917', fontSize: '1.1rem', fontWeight: 700 }}>Monthly Earnings</h2>
                <p style={{ fontSize: 12, color: '#78716C', marginTop: 2 }}>Last 6 months revenue overview</p>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-semibold">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#C9A84C' }} />
                  <span style={{ color: '#78716C' }}>Earnings</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-2 rounded-sm border-t-2 border-dashed" style={{ borderColor: '#8B1A3A' }} />
                  <span style={{ color: '#78716C' }}>Bookings</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              {earnings?.monthly?.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={earnings.monthly} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#C9A84C" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F5EDE4" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#A8A29E' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#A8A29E' }} axisLine={false} tickLine={false} width={48} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="earnings" stroke="#C9A84C" strokeWidth={2.5} fill="url(#goldGrad)" dot={{ fill: '#C9A84C', r: 3 }} activeDot={{ r: 5, fill: '#C9A84C' }} />
                    <Area type="monotone" dataKey="bookings" stroke="#8B1A3A" strokeWidth={1.5} fill="none" strokeDasharray="5 4" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-60 flex flex-col items-center justify-center gap-3">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#FBF5E0,#F5EDE4)' }}>
                    <BarChart2 size={28} style={{ color: '#C9A84C' }} />
                  </div>
                  <p style={{ fontSize: 13, color: '#A8A29E' }}>No earnings data yet</p>
                  <Link to="/vendor/services"
                    className="flex items-center gap-1.5 text-[13px] font-semibold transition-all"
                    style={{ color: '#8B1A3A' }}>
                    Add a service <ArrowRight size={13} />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* ── Pending Requests (1/3) ── */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: '#fff', border: '1px solid #E8E1D9', boxShadow: '0 4px 20px rgba(28,9,16,0.06)', animation: 'fadeUp 0.6s ease 0.45s both' }}>
            <div className="px-5 pt-5 pb-4 flex items-center justify-between" style={{ borderBottom: '1px solid #F0EBE5' }}>
              <div>
                <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917', fontSize: '1.05rem', fontWeight: 700 }}>Pending Requests</h2>
                <p style={{ fontSize: 12, color: '#78716C', marginTop: 2 }}>Awaiting your response</p>
              </div>
              {requests.length > 0 && (
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                  style={{ background: '#8B1A3A' }}>{requests.length}</div>
              )}
            </div>

            <div className="p-4">
              {requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                    style={{ background: 'linear-gradient(135deg,#FDF0F4,#F5C8D4)' }}>
                    <Bell size={22} style={{ color: '#8B1A3A', opacity: 0.6 }} />
                  </div>
                  <p className="font-semibold text-[13px] mb-1" style={{ color: '#1C1917' }}>All clear!</p>
                  <p style={{ fontSize: 12, color: '#A8A29E' }}>No pending requests right now</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.slice(0, 4).map((b, i) => (
                    <div key={b._id}
                      className="rounded-2xl p-3.5 transition-all duration-200"
                      style={{
                        border: '1px solid #F0EBE5',
                        animation: `slideRight 0.4s ease ${i * 0.07}s both`,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,26,58,0.2)'; e.currentTarget.style.background = '#FDFAF7'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#F0EBE5'; e.currentTarget.style.background = ''; }}
                    >
                      {/* Client + service */}
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold text-white"
                          style={{ background: 'linear-gradient(135deg,#8B1A3A,#6B1230)' }}>
                          {b.client?.full_name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold truncate" style={{ color: '#1C1917' }}>{b.client?.full_name}</div>
                          <div className="text-[11px] truncate" style={{ color: '#78716C' }}>{b.service?.title}</div>
                        </div>
                      </div>

                      {/* Date + amount */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1 text-[11px]" style={{ color: '#A8A29E' }}>
                          <Calendar size={10} />
                          {new Date(b.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <span className="font-bold text-[13px]" style={{ color: '#C9A84C' }}>
                          ₹{b.total_amount?.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <button
                          disabled={actionId === b._id}
                          onClick={() => changeStatus(b._id, 'confirmed')}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[12px] font-bold text-white transition-all"
                          style={{ background: 'linear-gradient(135deg,#059669,#047857)', boxShadow: '0 3px 10px rgba(5,150,105,0.3)' }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
                        >
                          <CheckCircle size={12} /> Accept
                        </button>
                        <button
                          disabled={actionId === b._id}
                          onClick={() => changeStatus(b._id, 'cancelled')}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[12px] font-bold text-white transition-all"
                          style={{ background: 'linear-gradient(135deg,#DC2626,#B91C1C)', boxShadow: '0 3px 10px rgba(220,38,38,0.3)' }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
                        >
                          <XCircle size={12} /> Decline
                        </button>
                      </div>
                    </div>
                  ))}

                  {requests.length > 4 && (
                    <Link to="/vendor/bookings"
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
                      style={{ color: '#8B1A3A', background: '#FDF0F4', border: '1px solid rgba(139,26,58,0.15)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#F5C8D4'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#FDF0F4'; }}
                    >
                      View all {requests.length} requests <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══ QUICK ACTIONS ══ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ animation: 'fadeUp 0.6s ease 0.5s both' }}>
          {[
            { to: '/vendor/bookings', icon: Calendar,  label: 'All Bookings',  sub: 'Manage requests',    grad: 'linear-gradient(135deg,#8B1A3A,#6B1230)', glow: 'rgba(139,26,58,0.25)' },
            { to: '/vendor/services', icon: Package,   label: 'My Services',   sub: 'Edit your listings', grad: 'linear-gradient(135deg,#C9A84C,#A88B38)', glow: 'rgba(201,168,76,0.25)' },
            { to: '/vendor/profile',  icon: User,      label: 'My Profile',    sub: 'Update your info',   grad: 'linear-gradient(135deg,#7C3AED,#6D28D9)', glow: 'rgba(124,58,237,0.25)' },
          ].map(({ to, icon: Icon, label, sub, grad, glow }) => (
            <Link key={to} to={to}
              className="flex items-center gap-4 p-5 rounded-2xl transition-all duration-200 group"
              style={{ background: '#fff', border: '1px solid #E8E1D9', boxShadow: '0 2px 12px rgba(28,9,16,0.05)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${glow}`; e.currentTarget.style.borderColor = 'transparent'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(28,9,16,0.05)'; e.currentTarget.style.borderColor = '#E8E1D9'; }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: grad, boxShadow: `0 6px 18px ${glow}` }}>
                <Icon size={22} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[14px]" style={{ color: '#1C1917' }}>{label}</div>
                <div className="text-[12px]" style={{ color: '#A8A29E' }}>{sub}</div>
              </div>
              <ArrowRight size={16} style={{ color: '#D5C9BE' }} className="shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
