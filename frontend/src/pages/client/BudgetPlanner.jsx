import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { Calculator, ArrowRight, IndianRupee, Users, Sparkles, RefreshCw, Heart, Gem, Crown } from 'lucide-react';
import { clientAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const PRESETS = {
  intimate: [
    { category: 'catering',     label: 'Catering',     pct: 35, color: '#B8912A' },
    { category: 'photography',  label: 'Photography',  pct: 25, color: '#BE185D' },
    { category: 'decoration',   label: 'Decoration',   pct: 20, color: '#059669' },
    { category: 'venue',        label: 'Venue',        pct: 15, color: '#7C3AED' },
    { category: 'others',       label: 'Others',       pct: 5,  color: '#78716C' },
  ],
  standard: [
    { category: 'catering',    label: 'Catering',    pct: 30, color: '#B8912A' },
    { category: 'venue',       label: 'Venue',       pct: 20, color: '#7C3AED' },
    { category: 'photography', label: 'Photography', pct: 20, color: '#BE185D' },
    { category: 'decoration',  label: 'Decoration',  pct: 15, color: '#059669' },
    { category: 'music',       label: 'Music & DJ',  pct: 10, color: '#2563EB' },
    { category: 'others',      label: 'Others',      pct: 5,  color: '#78716C' },
  ],
  grand: [
    { category: 'catering',    label: 'Catering',    pct: 28, color: '#B8912A' },
    { category: 'venue',       label: 'Venue',       pct: 22, color: '#7C3AED' },
    { category: 'photography', label: 'Photography', pct: 18, color: '#BE185D' },
    { category: 'decoration',  label: 'Decoration',  pct: 15, color: '#059669' },
    { category: 'music',       label: 'Music & DJ',  pct: 8,  color: '#2563EB' },
    { category: 'makeup',      label: 'Makeup',      pct: 5,  color: '#9D174D' },
    { category: 'others',      label: 'Others',      pct: 4,  color: '#78716C' },
  ],
};

const STYLES = [
  { value: 'intimate', label: 'Intimate', desc: 'Upto 100 guests', icon: Heart,  color: '#BE185D', bg: 'rgba(190,24,93,0.1)'  },
  { value: 'standard', label: 'Standard', desc: '100–300 guests',  icon: Gem,    color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
  { value: 'grand',    label: 'Grand',    desc: '300+ guests',     icon: Crown,  color: '#B8912A', bg: 'rgba(184,145,42,0.1)' },
];

const LS_KEY = 'shadiseva_planner';

export default function BudgetPlanner() {
  const saved  = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  const [budget,  setBudget]  = useState(saved.budget  || '');
  const [guests,  setGuests]  = useState(saved.guests  || '');
  const [style,   setStyle]   = useState(saved.style   || 'standard');
  const [plan,    setPlan]    = useState(saved.plan    || null);
  const [bookings, setBookings] = useState([]);
  const [sliders,  setSliders]  = useState({});
  const [mounted,  setMounted]  = useState(false);

  useEffect(() => {
    clientAPI.getBookings().then(r => {
      const confirmed = (r.data.bookings || []).filter(b => ['confirmed','pending'].includes(b.status));
      setBookings(confirmed);
    }).catch(() => {});
    setTimeout(() => setMounted(true), 60);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCommitted = (category) =>
    bookings.filter(b => b.service?.category === category).reduce((s, b) => s + (b.total_amount || 0), 0);

  const handleCalculate = () => {
    if (!budget || isNaN(Number(budget))) return;
    const rows = PRESETS[style].map(row => ({ ...row, pct: sliders[row.category] ?? row.pct }));
    const result = { budget: Number(budget), guests: Number(guests), style, rows };
    setPlan(result);
    localStorage.setItem(LS_KEY, JSON.stringify({ budget, guests, style, plan: result }));
  };

  const totalPlanned   = plan ? plan.rows.reduce((s, r) => s + Math.round(plan.budget * r.pct / 100), 0) : 0;
  const totalCommitted = plan ? plan.rows.reduce((s, r) => s + getCommitted(r.category), 0) : 0;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const { name, value } = payload[0];
    return (
      <div className="rounded-xl p-3 text-sm" style={{ background: '#fff', border: '1px solid #E8E1D9', boxShadow: '0 8px 24px rgba(28,9,16,0.12)' }}>
        <div className="font-semibold" style={{ color: '#1C1917' }}>{name}</div>
        <div className="font-bold" style={{ color: '#B8912A' }}>₹{value?.toLocaleString('en-IN')}</div>
      </div>
    );
  };

  return (
    <div>

      {/* ── Hero Banner ── */}
      <div
        className="relative rounded-3xl overflow-hidden mb-8"
        style={{
          background: 'linear-gradient(135deg,#0D0509 0%,#1E0A14 40%,#2C1018 70%,#B8912A 100%)',
          backgroundSize: '300% 300%',
          animation: 'gradientShift 10s ease infinite',
          minHeight: 170,
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }} />
        <div className="absolute rounded-full pointer-events-none"
          style={{ width: 180, height: 180, background: 'rgba(184,145,42,0.22)', filter: 'blur(55px)', top: -50, right: 80, animation: 'floatSlow 7s ease-in-out infinite' }} />
        <div className="absolute rounded-full pointer-events-none"
          style={{ width: 120, height: 120, background: 'rgba(190,24,93,0.18)', filter: 'blur(45px)', bottom: -20, right: 280, animation: 'floatSlow 9s ease-in-out infinite', animationDelay: '3s' }} />

        <div className="relative p-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-[11px] font-bold uppercase tracking-widest"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.75)',
              opacity: mounted ? 1 : 0,
              transition: 'opacity 0.5s 0.1s',
            }}
          >
            <Calculator size={11} style={{ color: '#B8912A' }} /> Budget Planner
          </div>
          <h1
            className="text-white font-bold mb-1"
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(1.4rem,3vw,2rem)',
              letterSpacing: '-0.01em',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(14px)',
              transition: 'all 0.55s cubic-bezier(0.4,0,0.2,1) 0.15s',
            }}
          >
            Plan Your Dream Wedding
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.25s' }}>
            Smart budget allocation for every celebration style
          </p>

          {plan && (
            <div className="mt-4" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.35s' }}>
              <button
                onClick={() => { setPlan(null); localStorage.removeItem(LS_KEY); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
              >
                <RefreshCw size={14} /> Reset Plan
              </button>
            </div>
          )}
        </div>
      </div>

      {!plan ? (
        /* ── STEP 1: INPUT ── */
        <div
          className="max-w-2xl mx-auto"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.55s cubic-bezier(0.4,0,0.2,1) 0.3s',
          }}
        >
          <Card>
            <div className="flex items-center gap-4 mb-7">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg,#B8912A,#9A7520)', boxShadow: '0 6px 16px rgba(184,145,42,0.3)' }}
              >
                <Calculator size={22} style={{ color: '#fff' }} />
              </div>
              <div>
                <h2 className="font-semibold" style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917', fontSize: '1.1rem' }}>
                  Set Your Budget
                </h2>
                <p className="text-[13px]" style={{ color: '#78716C' }}>We'll create a smart allocation plan for you</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="label-caps block mb-1.5">Total Budget (₹) <span style={{ color: '#DC2626' }}>*</span></label>
                <div className="relative">
                  <IndianRupee size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#A8A29E' }} />
                  <input
                    type="number"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    placeholder="e.g. 500000"
                    className="input-base pl-10"
                    min="10000" max="100000000"
                  />
                </div>
                {budget && (
                  <p className="text-[12px] mt-1 font-semibold" style={{ color: '#B8912A' }}>
                    = ₹{Number(budget).toLocaleString('en-IN')}
                  </p>
                )}
              </div>

              <div>
                <label className="label-caps block mb-1.5">Number of Guests</label>
                <div className="relative">
                  <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#A8A29E' }} />
                  <input
                    type="number"
                    value={guests}
                    onChange={e => setGuests(e.target.value)}
                    placeholder="e.g. 200"
                    className="input-base pl-10"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="label-caps block mb-3">Wedding Style</label>
                <div className="grid grid-cols-3 gap-3">
                  {STYLES.map(s => {
                    const SIcon = s.icon;
                    const isActive = style === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setStyle(s.value)}
                        className="p-4 rounded-2xl text-center transition-all duration-200"
                        style={isActive ? {
                          border: `2px solid ${s.color}`,
                          background: s.bg,
                          boxShadow: `0 4px 16px ${s.color}22`,
                        } : {
                          border: '2px solid #E8E1D9',
                          background: '#fff',
                        }}
                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = `${s.color}66`; }}
                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = '#E8E1D9'; }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                          style={{ background: isActive ? s.color : s.bg }}
                        >
                          <SIcon size={20} style={{ color: isActive ? '#fff' : s.color }} />
                        </div>
                        <div
                          className="text-[13px] font-bold"
                          style={{ color: isActive ? s.color : '#1C1917' }}
                        >
                          {s.label}
                        </div>
                        <div className="text-[11px]" style={{ color: '#78716C' }}>{s.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button fullWidth size="lg" onClick={handleCalculate} disabled={!budget}>
                <Sparkles size={17} /> Calculate My Plan
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        /* ── STEP 2: ALLOCATION VIEW ── */
        <div
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(16px)',
            transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1) 0.3s',
          }}
        >
          {/* Summary tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Budget', value: `₹${plan.budget.toLocaleString('en-IN')}`,                        color: '#1C1917',  bg: '#FDF9F4' },
              { label: 'Planned',      value: `₹${totalPlanned.toLocaleString('en-IN')}`,                       color: '#2563EB',  bg: '#EFF6FF' },
              { label: 'Committed',    value: `₹${totalCommitted.toLocaleString('en-IN')}`,                     color: '#B8912A',  bg: '#FBF0D9' },
              { label: 'Remaining',    value: `₹${(plan.budget - totalCommitted).toLocaleString('en-IN')}`,     color: '#059669',  bg: '#F0FDF4' },
            ].map(({ label, value, color, bg }, i) => (
              <div
                key={label}
                className="rounded-2xl p-4 text-center"
                style={{
                  background: bg,
                  border: '1px solid #E8E1D9',
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(12px)',
                  transition: `all 0.45s cubic-bezier(0.4,0,0.2,1) ${0.3 + i * 0.08}s`,
                }}
              >
                <div className="font-bold" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color }}>{value}</div>
                <div className="text-[11px] font-semibold uppercase tracking-widest mt-1" style={{ color: '#A8A29E' }}>{label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Pie Chart */}
            <Card className="lg:col-span-2">
              <h3 className="font-semibold mb-5" style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917' }}>Budget Allocation</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={plan.rows.map(r => ({ name: r.label, value: Math.round(plan.budget * r.pct / 100) }))}
                    cx="50%" cy="50%" innerRadius={55} outerRadius={88} paddingAngle={2} dataKey="value"
                  >
                    {plan.rows.map((r, i) => <Cell key={i} fill={r.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {plan.rows.map(r => (
                  <div key={r.category} className="flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2">
                      <div className="legend-dot" style={{ background: r.color }} />
                      <span style={{ color: '#78716C' }}>{r.label}</span>
                    </div>
                    <span className="font-bold" style={{ color: '#1C1917' }}>{r.pct}%</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Category Rows */}
            <Card className="lg:col-span-3" padding={false}>
              <div className="px-6 pt-5 pb-4" style={{ borderBottom: '1px solid #E8E1D9' }}>
                <h3 className="font-semibold" style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917' }}>Category Breakdown</h3>
              </div>
              <div style={{ borderTop: 'none' }}>
                {plan.rows.map((row, idx) => {
                  const suggested = Math.round(plan.budget * row.pct / 100);
                  const committed = getCommitted(row.category);
                  const progress  = suggested > 0 ? Math.min(100, (committed / suggested) * 100) : 0;
                  return (
                    <div
                      key={row.category}
                      className="px-6 py-4"
                      style={{ borderBottom: idx < plan.rows.length - 1 ? '1px solid #F5EDE4' : 'none' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ background: row.color }} />
                          <span className="text-[13px] font-semibold" style={{ color: '#1C1917' }}>{row.label}</span>
                          <span className="text-[11px]" style={{ color: '#A8A29E' }}>({row.pct}%)</span>
                        </div>
                        {row.category !== 'others' && (
                          <Link
                            to={`/services?category=${row.category}`}
                            className="text-[12px] font-semibold flex items-center gap-1 transition-all"
                            style={{ color: '#BE185D' }}
                            onMouseEnter={e => e.currentTarget.style.gap = '6px'}
                            onMouseLeave={e => e.currentTarget.style.gap = '4px'}
                          >
                            Find <ArrowRight size={10} />
                          </Link>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-2.5 text-[12px]">
                        <div className="rounded-lg px-3 py-1.5" style={{ background: '#FDF9F4' }}>
                          <span style={{ color: '#A8A29E' }}>Budget: </span>
                          <span className="font-semibold" style={{ color: '#1C1917' }}>₹{suggested.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="rounded-lg px-3 py-1.5" style={{ background: '#FBF0D9' }}>
                          <span style={{ color: '#A8A29E' }}>Booked: </span>
                          <span className="font-bold" style={{ color: '#B8912A' }}>₹{committed.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F0EBE5' }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${progress}%`, background: row.color }}
                        />
                      </div>
                      <input
                        type="range" min="0" max="80"
                        value={sliders[row.category] ?? row.pct}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setSliders(s => ({ ...s, [row.category]: val }));
                          setPlan(p => ({
                            ...p,
                            rows: p.rows.map(r => r.category === row.category ? { ...r, pct: val } : r),
                          }));
                        }}
                        className="w-full mt-2"
                        style={{ accentColor: row.color }}
                      />
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {guests > 0 && (
            <div
              className="mt-4 rounded-2xl p-5 flex items-center gap-4"
              style={{ background: 'linear-gradient(135deg,#FBF0D9,#FDF6EE)', border: '1px solid #E8E1D9' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg,#B8912A,#9A7520)', boxShadow: '0 4px 12px rgba(184,145,42,0.3)' }}
              >
                <Users size={18} style={{ color: '#fff' }} />
              </div>
              <div className="text-[13px]">
                <span style={{ color: '#78716C' }}>Per guest budget: </span>
                <span className="font-bold" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', color: '#B8912A' }}>
                  ₹{Math.round(plan.budget / Number(guests)).toLocaleString('en-IN')}
                </span>
                <span style={{ color: '#78716C' }}> for {guests} guests</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
