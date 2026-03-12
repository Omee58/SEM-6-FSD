import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  Users, Package, Calendar, IndianRupee, UserCheck, TrendingUp,
  BarChart3, Star, FileDown, ChevronRight, Clock,
  Activity, Shield, Zap,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import { PageSpinner } from '../../components/ui/Spinner';

/* ── palette ─────────────────────────────────────── */
const STATUS_COLORS = {
  pending: '#F59E0B', confirmed: '#6366F1',
  completed: '#10B981', cancelled: '#EF4444',
};
const CAT_COLORS = {
  photography: '#8B1A3A', catering: '#C9A84C', venue: '#2563EB',
  decoration: '#059669', mehendi: '#7C3AED', music: '#0891B2',
  makeup: '#DB2777', transport: '#D97706', other: '#6D28D9',
};

/* ── count-up hook ───────────────────────────────── */
function useCountUp(target, duration = 1400) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = null;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return count;
}

/* ── live clock ──────────────────────────────────── */
function LiveClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
      {t.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
    </span>
  );
}

/* ── floating orb ────────────────────────────────── */
function Orb({ size, color, style: s }) {
  return (
    <div className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, background: color, filter: 'blur(70px)', ...s }} />
  );
}

/* ── health ring ─────────────────────────────────── */
function HealthRing({ score }) {
  const color = score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
  const label = score >= 75 ? 'Excellent' : score >= 50 ? 'Good' : 'Fair';
  const circ = 2 * Math.PI * 15;
  const [showTip, setShowTip] = useState(false);
  const [tipPos, setTipPos]   = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);

  const handleMouseEnter = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setTipPos({ top: r.bottom + 8, left: r.left + r.width / 2 });
    }
    setShowTip(true);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
      <div className="relative w-12 h-12">
        <svg viewBox="0 0 40 40" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="20" cy="20" r="15" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3.5" />
          <circle cx="20" cy="20" r="15" fill="none" stroke={color} strokeWidth="3.5"
            strokeDasharray={`${(score / 100) * circ} ${circ}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1.6s cubic-bezier(0.4,0,0.2,1)' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold" style={{ color }}>{score}</span>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Health</p>
          <button
            ref={btnRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setShowTip(false)}
            className="flex items-center justify-center rounded-full transition-colors"
            style={{ width: 14, height: 14, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: 700, lineHeight: 1 }}>
            i
          </button>
        </div>
        <p className="text-[13px] font-bold" style={{ color }}>{label}</p>
      </div>

      {/* portal tooltip — renders into document.body, escapes backdrop-filter stacking context */}
      {showTip && createPortal(
        <div className="rounded-xl p-3 text-left"
          style={{ position: 'fixed', top: tipPos.top, left: tipPos.left, transform: 'translateX(-50%)', width: 200, zIndex: 9999, background: '#0D1627', border: '1px solid rgba(99,102,241,0.35)', boxShadow: '0 12px 36px rgba(0,0,0,0.6)', pointerEvents: 'none' }}>
          <div className="absolute" style={{ top: -5, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '5px solid rgba(99,102,241,0.35)' }} />
          <p className="font-bold mb-2" style={{ color: '#fff', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>How Health is Calculated</p>
          {[
            { label: 'Vendor Trust',    desc: 'verified / total vendors',   pts: '35 pts', color: '#6366F1' },
            { label: 'Booking Success', desc: 'completed / total bookings', pts: '45 pts', color: '#10B981' },
            { label: 'Supply Present',  desc: 'at least 1 active service',  pts: '20 pts', color: '#F59E0B' },
          ].map(r => (
            <div key={r.label} className="flex items-start justify-between gap-2 mb-1.5">
              <div>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: 600 }}>{r.label}</p>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9 }}>{r.desc}</p>
              </div>
              <span className="shrink-0 font-bold" style={{ color: r.color, fontSize: 10 }}>{r.pts}</span>
            </div>
          ))}
          <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9 }}>Score capped at 100. Higher = healthier platform.</p>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ── KPI tile ────────────────────────────────────── */
function KPITile({ icon: Icon, label, raw = 0, format, prefix = '', suffix = '', gradient, iconColor, delay = 0 }) {
  const count = useCountUp(raw);
  const display = format ? format(count) : `${prefix}${count.toLocaleString('en-IN')}${suffix}`;
  return (
    <div className="rounded-2xl p-5 relative overflow-hidden group cursor-default"
      style={{
        background: gradient,
        boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
        animation: `fadeUp 0.55s ease ${delay}s both`,
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.32)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.22)'; }}
    >
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20"
        style={{ background: iconColor, filter: 'blur(24px)' }} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</p>
          <p className="font-bold text-white leading-none" style={{ fontSize: 'clamp(1.5rem,2.5vw,1.9rem)', fontFamily: 'Cormorant Garamond, serif' }}>
            {display}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}>
          <Icon size={18} color="#fff" />
        </div>
      </div>
    </div>
  );
}

/* ── dark chart tooltip ──────────────────────────── */
function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 text-[12px]"
      style={{ background: '#0D1627', border: '1px solid rgba(99,102,241,0.35)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
      <p className="font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-semibold" style={{ color: p.color }}>
          {p.name === 'revenue' ? `₹${(p.value || 0).toLocaleString('en-IN')}` : `${p.value} bookings`}
        </p>
      ))}
    </div>
  );
}

/* ── main component ──────────────────────────────── */
export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [sr, br] = await Promise.allSettled([
        adminAPI.getStats({ months: 6 }),
        adminAPI.getAllBookings({ limit: 8, page: 1 }),
      ]);
      if (sr.status === 'fulfilled') setStats(sr.value.data);
      if (br.status === 'fulfilled') setRecentBookings(br.value.data.bookings || []);
    } catch {}
    setLoading(false);
    setTimeout(() => setMounted(true), 60);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // auto-refresh feed every 30s
  useEffect(() => {
    const id = setInterval(() => {
      adminAPI.getAllBookings({ limit: 8, page: 1 })
        .then(r => setRecentBookings(r.data.bookings || []))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(id);
  }, []);

  if (loading) return <PageSpinner />;

  const ov = stats?.overview || {};
  const monthly = stats?.monthly || [];
  const statusBreakdown = stats?.status_breakdown
    ? Object.entries(stats.status_breakdown).map(([k, v]) => ({ name: k, value: v }))
    : [];
  const topCats = (stats?.top_categories || []).map(c => ({ name: c.category || c._id, count: c.count }));
  const pendingVendors = (ov.users_by_role?.vendor || 0) - (ov.verified_vendors || 0);
  const completedCount = statusBreakdown.find(s => s.name === 'completed')?.value || 0;
  const completionRate = ov.total_bookings > 0 ? Math.round((completedCount / ov.total_bookings) * 100) : 0;
  const verifiedRatio = ov.users_by_role?.vendor > 0 ? (ov.verified_vendors / ov.users_by_role.vendor) : 0;
  const completedRatio = ov.total_bookings > 0 ? (completedCount / ov.total_bookings) : 0;
  const healthScore = Math.min(100, Math.round(verifiedRatio * 35 + completedRatio * 45 + ((ov.active_services || 0) > 0 ? 20 : 0)));

  const funnelStages = [
    { label: 'Pending',   value: statusBreakdown.find(s => s.name === 'pending')?.value   || 0, color: '#F59E0B' },
    { label: 'Confirmed', value: statusBreakdown.find(s => s.name === 'confirmed')?.value || 0, color: '#6366F1' },
    { label: 'Completed', value: statusBreakdown.find(s => s.name === 'completed')?.value || 0, color: '#10B981' },
    { label: 'Cancelled', value: statusBreakdown.find(s => s.name === 'cancelled')?.value || 0, color: '#EF4444' },
  ];
  const maxFunnel = Math.max(...funnelStages.map(s => s.value), 1);

  const activityFeed = recentBookings.slice(0, 8).map(b => ({
    id: b._id,
    text: b.status === 'completed'
      ? `Booking completed — ₹${b.total_amount?.toLocaleString('en-IN')}`
      : b.status === 'confirmed'
      ? `${b.vendor?.full_name || 'Vendor'} confirmed a booking`
      : b.status === 'cancelled'
      ? `Booking cancelled — ${b.service?.title || 'service'}`
      : `New booking: ${b.service?.title || 'service'}`,
    sub: `${b.client?.full_name || '—'} · ${b.booking_date ? new Date(b.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}`,
    color: STATUS_COLORS[b.status] || '#6366F1',
  }));

  const QUICK_ACTIONS = [
    { to: '/admin/approvals', icon: UserCheck, label: 'Vendor Approvals', sub: `${pendingVendors} pending`, color: '#F59E0B' },
    { to: '/admin/users',     icon: Users,     label: 'All Users',         sub: `${ov.total_users || 0} registered`, color: '#6366F1' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics',         sub: 'Deep insights', color: '#10B981' },
    { to: '/admin/reviews',   icon: Star,      label: 'Reviews',           sub: 'Moderate platform reviews', color: '#F59E0B' },
    { to: '/admin/reports',   icon: FileDown,  label: 'Reports',           sub: 'Export & download', color: '#A78BFA' },
  ];

  return (
    <div className="space-y-6" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.35s ease' }}>

      {/* ══ HERO ══ */}
      <div className="relative overflow-hidden rounded-3xl"
        style={{
          background: 'linear-gradient(135deg,#060B14 0%,#0D1627 50%,#0F172A 100%)',
          backgroundSize: '300% 300%',
          animation: 'gradientShift 14s ease infinite',
          minHeight: 210,
          padding: '36px 40px',
        }}
      >
        <Orb size={320} color="rgba(99,102,241,0.13)"  style={{ top: -80,  right: -60 }} />
        <Orb size={200} color="rgba(16,185,129,0.09)"  style={{ bottom: -60, right: 220, animationDelay: '4s' }} />
        <Orb size={160} color="rgba(245,158,11,0.07)"  style={{ top: 10,   right: 420, animationDelay: '2s' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div>
            {/* date + clock pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-[11px] font-bold uppercase tracking-widest"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}>
              <Clock size={11} style={{ color: '#6366F1' }} />
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              <span style={{ opacity: 0.4 }}>·</span>
              <LiveClock />
            </div>
            <h1 className="text-white font-bold mb-1.5"
              style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.7rem,3.5vw,2.4rem)', letterSpacing: '-0.01em' }}>
              Mission Control
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 14 }}>
              Welcome back, <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>{user?.full_name}</span>
              {' '}— platform is{' '}
              <span style={{ color: '#10B981', fontWeight: 600 }}>live & running</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <HealthRing score={healthScore} />

            {pendingVendors > 0 && (
              <Link to="/admin/approvals">
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl transition-all duration-200"
                  style={{ background: 'rgba(245,158,11,0.14)', border: '1px solid rgba(245,158,11,0.35)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.24)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.14)'; e.currentTarget.style.transform = ''; }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: '#F59E0B', boxShadow: '0 0 0 3px rgba(245,158,11,0.3)', animation: 'glowPulse 2s ease infinite' }} />
                  <span className="text-[13px] font-bold" style={{ color: '#FCD34D' }}>
                    {pendingVendors} pending approval{pendingVendors > 1 ? 's' : ''}
                  </span>
                  <ChevronRight size={14} style={{ color: '#FCD34D' }} />
                </div>
              </Link>
            )}

            {[
              { to: '/admin/analytics', icon: BarChart3, label: 'Analytics', color: 'rgba(99,102,241,' },
            ].map(({ to, icon: Icon, label, color }) => (
              <Link key={to} to={to}>
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl transition-all duration-200"
                  style={{ background: `${color}0.13)`, border: `1px solid ${color}0.3)` }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${color}0.22)`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${color}0.13)`; e.currentTarget.style.transform = ''; }}>
                  <Icon size={14} style={{ color: '#C7D2FE' }} />
                  <span className="text-[13px] font-semibold" style={{ color: '#C7D2FE' }}>{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ══ KPI TILES ══ */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { icon: IndianRupee, label: 'Total Revenue',    raw: ov.total_revenue    || 0, format: v => v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : `₹${(v/1000).toFixed(0)}k`, gradient: 'linear-gradient(135deg,#064E3B,#047857)', iconColor: '#10B981', delay: 0 },
          { icon: Calendar,    label: 'Total Bookings',   raw: ov.total_bookings   || 0, gradient: 'linear-gradient(135deg,#1E1B4B,#3730A3)', iconColor: '#6366F1', delay: 0.05 },
          { icon: Users,       label: 'Total Users',      raw: ov.total_users      || 0, gradient: 'linear-gradient(135deg,#4C1D95,#6D28D9)', iconColor: '#A78BFA', delay: 0.10 },
          { icon: UserCheck,   label: 'Verified Vendors', raw: ov.verified_vendors || 0, gradient: 'linear-gradient(135deg,#1E3A5F,#1D4ED8)', iconColor: '#60A5FA', delay: 0.15 },
          { icon: Package,     label: 'Active Services',  raw: ov.active_services  || 0, gradient: 'linear-gradient(135deg,#881337,#BE123C)', iconColor: '#FB7185', delay: 0.20 },
          { icon: TrendingUp,  label: 'Completion Rate',  raw: completionRate,           suffix: '%', gradient: 'linear-gradient(135deg,#78350F,#B45309)', iconColor: '#FCD34D', delay: 0.25 },
        ].map((tile, i) => <KPITile key={i} {...tile} />)}
      </div>

      {/* ══ CHARTS + LIVE FEED ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue & Bookings area chart */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden"
          style={{ background: '#fff', border: '1px solid #E8E1D9', boxShadow: '0 2px 16px rgba(15,23,42,0.06)' }}>
          <div className="px-6 pt-5 pb-4 flex items-center justify-between" style={{ borderBottom: '1px solid #F1F5F9' }}>
            <div>
              <h2 className="font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#0F172A', fontSize: '1.05rem' }}>
                Revenue & Bookings
              </h2>
              <p className="text-[12px] mt-0.5" style={{ color: '#94A3B8' }}>Last 6 months overview</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-semibold" style={{ color: '#94A3B8' }}>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-1.5 rounded-full" style={{ background: '#6366F1' }} /> Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-1.5 rounded-full" style={{ background: '#10B981' }} /> Bookings
              </span>
            </div>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={monthly} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#6366F1" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="bkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#10B981" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="rev" tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={50} />
                <YAxis yAxisId="bk" orientation="right" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<DarkTooltip />} />
                <Area yAxisId="rev" type="monotone" dataKey="revenue"  name="revenue"  stroke="#6366F1" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: '#6366F1', strokeWidth: 0 }} />
                <Area yAxisId="bk"  type="monotone" dataKey="bookings" name="bookings" stroke="#10B981" strokeWidth={2}   fill="url(#bkGrad)"  dot={false} activeDot={{ r: 5, fill: '#10B981', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="rounded-2xl overflow-hidden flex flex-col"
          style={{ background: 'linear-gradient(180deg,#0D1627 0%,#0F172A 100%)', border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 8px 32px rgba(15,23,42,0.25)' }}>
          <div className="px-5 pt-5 pb-4 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <h2 className="font-bold text-white" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem' }}>Live Activity</h2>
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>Auto-refreshes every 30s</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: '#10B981', animation: 'glowPulse 2s ease infinite' }} />
              <span className="text-[10px] font-bold tracking-widest" style={{ color: '#10B981' }}>LIVE</span>
            </div>
          </div>
          <div className="flex-1 p-3 space-y-1 overflow-y-auto" style={{ maxHeight: 270 }}>
            {activityFeed.length > 0 ? activityFeed.map((item, i) => (
              <div key={item.id}
                className="flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.03)', animation: `fadeUp 0.4s ease ${i * 0.05}s both` }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              >
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                  style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                <div className="min-w-0">
                  <p className="text-[12px] font-medium leading-snug" style={{ color: 'rgba(255,255,255,0.78)' }}>{item.text}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>{item.sub}</p>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-40">
                <Activity size={28} style={{ color: 'rgba(255,255,255,0.15)', marginBottom: 8 }} />
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ STATUS DONUT + TOP CATEGORIES + BOOKING FUNNEL ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Booking status donut */}
        <div className="rounded-2xl" style={{ background: '#fff', border: '1px solid #E8E1D9', boxShadow: '0 2px 16px rgba(15,23,42,0.06)' }}>
          <div className="px-5 pt-5 pb-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
            <h2 className="font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#0F172A', fontSize: '1.05rem' }}>Booking Status</h2>
          </div>
          <div className="p-4">
            {statusBreakdown.length > 0 ? (
              <>
                <div className="relative">
                  <ResponsiveContainer width="100%" height={165}>
                    <PieChart>
                      <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={48} outerRadius={72}
                        dataKey="value" paddingAngle={3} startAngle={90} endAngle={-270}>
                        {statusBreakdown.map((e, i) => (
                          <Cell key={i} fill={STATUS_COLORS[e.name] || '#6B7280'} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#0D1627', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, color: '#fff', fontSize: 12 }}
                        formatter={(v, n) => [v, n]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="font-bold" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#0F172A' }}>
                      {ov.total_bookings || 0}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#94A3B8' }}>Total</p>
                  </div>
                </div>
                <div className="space-y-2 mt-1">
                  {statusBreakdown.map(s => (
                    <div key={s.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[s.name] || '#6B7280' }} />
                        <span className="text-[12px] capitalize font-medium" style={{ color: '#475569' }}>{s.name}</span>
                      </div>
                      <span className="text-[12px] font-bold" style={{ color: '#0F172A' }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-40 flex items-center justify-center">
                <p style={{ fontSize: 13, color: '#94A3B8' }}>No booking data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Top categories */}
        <div className="rounded-2xl" style={{ background: '#fff', border: '1px solid #E8E1D9', boxShadow: '0 2px 16px rgba(15,23,42,0.06)' }}>
          <div className="px-5 pt-5 pb-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
            <h2 className="font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#0F172A', fontSize: '1.05rem' }}>Top Categories</h2>
          </div>
          <div className="p-5 space-y-3.5">
            {topCats.length > 0 ? topCats.slice(0, 6).map((cat, i) => {
              const color = CAT_COLORS[cat.name] || '#6366F1';
              const pct = Math.round((cat.count / (topCats[0]?.count || 1)) * 100);
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold w-4 text-right" style={{ color: '#CBD5E1' }}>{i + 1}</span>
                      <span className="text-[13px] font-semibold capitalize" style={{ color: '#0F172A' }}>{cat.name}</span>
                    </div>
                    <span className="text-[12px] font-bold" style={{ color }}>{cat.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                    <div className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: color,
                        boxShadow: `0 0 8px ${color}60`,
                        transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
                      }} />
                  </div>
                </div>
              );
            }) : <p style={{ fontSize: 13, color: '#94A3B8' }}>No category data yet</p>}
          </div>
        </div>

        {/* Booking funnel */}
        <div className="rounded-2xl" style={{ background: '#fff', border: '1px solid #E8E1D9', boxShadow: '0 2px 16px rgba(15,23,42,0.06)' }}>
          <div className="px-5 pt-5 pb-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
            <h2 className="font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#0F172A', fontSize: '1.05rem' }}>Booking Flow</h2>
            <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>Conversion at each stage</p>
          </div>
          <div className="p-5 space-y-3">
            {funnelStages.map((stage) => (
              <div key={stage.label} className="flex items-center gap-3">
                <div className="w-20 text-[12px] font-semibold shrink-0" style={{ color: '#475569' }}>{stage.label}</div>
                <div className="flex-1 h-9 rounded-xl overflow-hidden relative" style={{ background: '#F8FAFF' }}>
                  <div className="h-full rounded-xl flex items-center pl-3 transition-all duration-1000"
                    style={{
                      width: `${Math.max(6, (stage.value / maxFunnel) * 100)}%`,
                      background: `${stage.color}1A`,
                      border: `1.5px solid ${stage.color}40`,
                    }}>
                    <span className="text-[11px] font-bold" style={{ color: stage.color }}>
                      {stage.value > 0 ? Math.round((stage.value / maxFunnel) * 100) + '%' : ''}
                    </span>
                  </div>
                </div>
                <div className="w-7 text-right text-[13px] font-bold shrink-0" style={{ color: stage.color }}>{stage.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ QUICK ACTIONS ══ */}
      <div>
        <h2 className="font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#0F172A', fontSize: '1.05rem' }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {QUICK_ACTIONS.map(({ to, icon: Icon, label, sub, color }, i) => (
            <Link key={to} to={to}>
              <div className="rounded-2xl p-4 h-full transition-all duration-200 cursor-pointer"
                style={{
                  background: '#fff',
                  border: '1.5px solid #E8E1D9',
                  boxShadow: '0 2px 8px rgba(15,23,42,0.05)',
                  animation: `fadeUp 0.5s ease ${i * 0.06}s both`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = `${color}60`;
                  e.currentTarget.style.boxShadow = `0 12px 32px ${color}20`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.borderColor = '#E8E1D9';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,23,42,0.05)';
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${color}15` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <p className="font-bold text-[13px] mb-0.5" style={{ color: '#0F172A' }}>{label}</p>
                <p className="text-[11px] leading-snug" style={{ color: '#94A3B8' }}>{sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
