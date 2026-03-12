import { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, IndianRupee, Calendar,
  Users, Package, ArrowUpRight,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { adminAPI } from '../../services/api';
import { PageSpinner } from '../../components/ui/Spinner';

const CAT_COLORS = {
  photography: '#8B1A3A', catering: '#C9A84C', venue: '#2563EB',
  decoration: '#059669',  mehendi: '#7C3AED',  music: '#0891B2',
  makeup: '#DB2777', transport: '#D97706', other: '#6D28D9',
};
const PERIODS = ['6M', '12M', 'All'];

function Orb({ size, color, style: s }) {
  return <div className="absolute rounded-full pointer-events-none"
    style={{ width: size, height: size, background: color, filter: 'blur(70px)', ...s }} />;
}

function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 text-[12px]"
      style={{ background: '#0D1627', border: '1px solid rgba(99,102,241,0.3)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
      <p className="font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-semibold" style={{ color: p.color }}>
          {p.name === 'revenue' ? `₹${(p.value || 0).toLocaleString('en-IN')}` : p.value}
        </p>
      ))}
    </div>
  );
}

const PERIOD_MONTHS = { '6M': 6, '12M': 12, 'All': 0 };

export default function AdminAnalytics() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [period,  setPeriod]  = useState('6M');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLoading(true);
    const months = PERIOD_MONTHS[period];
    adminAPI.getStats(months !== undefined ? { months } : {})
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => { setLoading(false); setTimeout(() => setMounted(true), 60); });
  }, [period]);

  if (loading && !stats) return <PageSpinner />;

  const ov       = stats?.overview   || {};
  const monthly  = stats?.monthly    || [];
  const topCats  = (stats?.top_categories || []).map(c => ({ name: c.category || c._id, count: c.count }));
  const statusBD = stats?.status_breakdown
    ? Object.entries(stats.status_breakdown).map(([k, v]) => ({ name: k, value: v }))
    : [];

  // Derived metrics
  const totalRev    = ov.total_revenue  || 0;
  const totalBk     = ov.total_bookings || 0;
  const avgPerBk    = totalBk > 0 ? Math.round(totalRev / totalBk) : 0;
  const completedBk = statusBD.find(s => s.name === 'completed')?.value || 0;
  const convRate    = totalBk > 0 ? Math.round((completedBk / totalBk) * 100) : 0;

  // Backend already returns the correct number of months for the selected period
  const displayMonthly = monthly;

  // peak month
  const peakMonth = [...monthly].sort((a, b) => (b.revenue || 0) - (a.revenue || 0))[0];

  // growth: compare last 3 months vs prev 3
  const last3   = monthly.slice(-3).reduce((s, m) => s + (m.revenue || 0), 0);
  const prev3   = monthly.slice(-6, -3).reduce((s, m) => s + (m.revenue || 0), 0);
  const growth  = prev3 > 0 ? Math.round(((last3 - prev3) / prev3) * 100) : 0;

  const INSIGHT_TILES = [
    { label: 'Total Revenue',  value: totalRev >= 100000 ? `₹${(totalRev / 100000).toFixed(1)}L` : `₹${(totalRev / 1000).toFixed(0)}k`, icon: IndianRupee, color: '#10B981', bg: 'linear-gradient(135deg,#064E3B,#047857)' },
    { label: 'Avg per Booking', value: `₹${avgPerBk.toLocaleString('en-IN')}`,                                                            icon: TrendingUp,  color: '#6366F1', bg: 'linear-gradient(135deg,#1E1B4B,#3730A3)' },
    { label: 'Conversion Rate', value: `${convRate}%`,                                                                                     icon: ArrowUpRight, color: '#F59E0B', bg: 'linear-gradient(135deg,#78350F,#B45309)' },
    { label: 'Revenue Growth',  value: `${growth >= 0 ? '+' : ''}${growth}%`,                                                             icon: BarChart3,   color: growth >= 0 ? '#10B981' : '#EF4444', bg: growth >= 0 ? 'linear-gradient(135deg,#064E3B,#047857)' : 'linear-gradient(135deg,#7F1D1D,#B91C1C)' },
  ];

  return (
    <div className="space-y-6" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.35s ease' }}>

      {/* ══ HERO ══ */}
      <div className="relative overflow-hidden rounded-3xl"
        style={{ background: 'linear-gradient(135deg,#060B14 0%,#0D1627 50%,#0F172A 100%)', minHeight: 170, padding: '32px 40px' }}>
        <Orb size={280} color="rgba(16,185,129,0.12)"  style={{ top: -60, right: -40 }} />
        <Orb size={180} color="rgba(99,102,241,0.09)"  style={{ bottom: -50, right: 240, animationDelay: '4s' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-[11px] font-bold uppercase tracking-widest"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}>
            <BarChart3 size={11} style={{ color: '#10B981' }} /> Platform Analytics
          </div>
          <h1 className="text-white font-bold mb-1"
            style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.4rem,3vw,2rem)' }}>
            Analytics & Insights
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13 }}>
            Deep dive into platform performance and trends
          </p>
        </div>
      </div>

      {/* ══ INSIGHT TILES ══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {INSIGHT_TILES.map(({ label, value, icon: Icon, color, bg }, i) => (
          <div key={label} className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: bg, boxShadow: '0 8px 28px rgba(0,0,0,0.2)', animation: `fadeUp 0.5s ease ${i * 0.06}s both` }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; }}>
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-20" style={{ background: color, filter: 'blur(20px)' }} />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</p>
                <p className="font-bold text-white" style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 'clamp(1.4rem,2.5vw,1.7rem)', lineHeight: 1 }}>{value}</p>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.18)' }}>
                <Icon size={16} color="#fff" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ══ REVENUE TREND ══ */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 2px 16px rgba(15,23,42,0.06)', opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s ease' }}>
        <div className="px-6 pt-5 pb-4 flex items-center justify-between" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <h2 className="font-bold" style={{ fontFamily: 'Playfair Display,serif', color: '#0F172A', fontSize: '1.05rem' }}>Revenue Trend</h2>
            <p className="text-[12px] mt-0.5" style={{ color: '#94A3B8' }}>
              {peakMonth ? `Peak month: ${peakMonth.month} — ₹${(peakMonth.revenue || 0).toLocaleString('en-IN')}` : 'Monthly revenue'}
            </p>
          </div>
          <div className="flex gap-1.5">
            {PERIODS.map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
                style={period === p
                  ? { background: '#0F172A', color: '#fff' }
                  : { background: '#F1F5F9', color: '#64748B' }}
                onMouseEnter={e => { if (period !== p) e.currentTarget.style.background = '#E2E8F0'; }}
                onMouseLeave={e => { if (period !== p) e.currentTarget.style.background = '#F1F5F9'; }}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="p-5">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={displayMonthly} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="aRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#6366F1" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={52} />
              <Tooltip content={<DarkTooltip />} />
              <Area type="monotone" dataKey="revenue" name="revenue" stroke="#6366F1" strokeWidth={2.5}
                fill="url(#aRevGrad)" dot={false} activeDot={{ r: 5, fill: '#6366F1', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ══ CATEGORY + STATUS ROW ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top categories bar */}
        <div className="rounded-2xl" style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 2px 16px rgba(15,23,42,0.06)' }}>
          <div className="px-5 pt-5 pb-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
            <h2 className="font-bold" style={{ fontFamily: 'Playfair Display,serif', color: '#0F172A', fontSize: '1.05rem' }}>Category Performance</h2>
            <p className="text-[12px] mt-0.5" style={{ color: '#94A3B8' }}>Services per category</p>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topCats} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="count" name="services" radius={[0, 6, 6, 0]} maxBarSize={20}>
                  {topCats.map((c, i) => (
                    <Cell key={i} fill={CAT_COLORS[c.name] || '#6366F1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking status breakdown */}
        <div className="rounded-2xl" style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 2px 16px rgba(15,23,42,0.06)' }}>
          <div className="px-5 pt-5 pb-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
            <h2 className="font-bold" style={{ fontFamily: 'Playfair Display,serif', color: '#0F172A', fontSize: '1.05rem' }}>Booking Breakdown</h2>
            <p className="text-[12px] mt-0.5" style={{ color: '#94A3B8' }}>Distribution by status</p>
          </div>
          <div className="p-5 space-y-4">
            {statusBD.map(s => {
              const colors = { pending: '#F59E0B', confirmed: '#6366F1', completed: '#10B981', cancelled: '#EF4444' };
              const color  = colors[s.name] || '#94A3B8';
              const pct    = totalBk > 0 ? Math.round((s.value / totalBk) * 100) : 0;
              return (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] font-semibold capitalize" style={{ color: '#0F172A' }}>{s.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-bold" style={{ color }}>{pct}%</span>
                      <span className="text-[11px]" style={{ color: '#94A3B8' }}>({s.value})</span>
                    </div>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}50` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* summary row */}
          <div className="mx-5 mb-5 p-4 rounded-xl grid grid-cols-3 gap-3" style={{ background: '#F8FAFF' }}>
            {[
              { label: 'Total',    value: totalBk,   color: '#0F172A' },
              { label: 'Done',     value: completedBk, color: '#10B981' },
              { label: 'Pending',  value: statusBD.find(s => s.name === 'pending')?.value || 0, color: '#F59E0B' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className="font-bold" style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.3rem', color }}>{value}</p>
                <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: '#94A3B8' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ MONTHLY BOOKINGS BAR ══ */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 2px 16px rgba(15,23,42,0.06)' }}>
        <div className="px-6 pt-5 pb-4" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <h2 className="font-bold" style={{ fontFamily: 'Playfair Display,serif', color: '#0F172A', fontSize: '1.05rem' }}>Monthly Bookings Volume</h2>
          <p className="text-[12px] mt-0.5" style={{ color: '#94A3B8' }}>Number of bookings per month</p>
        </div>
        <div className="p-5">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={displayMonthly} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={28} />
              <Tooltip content={<DarkTooltip />} />
              <Bar dataKey="bookings" name="bookings" fill="#6366F1" radius={[6, 6, 0, 0]} maxBarSize={36}
                background={{ fill: '#F8FAFF', radius: [6, 6, 0, 0] }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
