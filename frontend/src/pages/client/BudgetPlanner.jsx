import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import { Calculator, ArrowRight, IndianRupee, Users, Sparkles, RefreshCw } from 'lucide-react';
import { clientAPI } from '../../services/api';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const PRESETS = {
  intimate: [
    { category: 'catering', label: 'Catering', pct: 35, color: '#D97706' },
    { category: 'photography', label: 'Photography', pct: 25, color: '#BE185D' },
    { category: 'decoration', label: 'Decoration', pct: 20, color: '#059669' },
    { category: 'venue', label: 'Venue', pct: 15, color: '#7C3AED' },
    { category: 'others', label: 'Others', pct: 5, color: '#6B7280' },
  ],
  standard: [
    { category: 'catering', label: 'Catering', pct: 30, color: '#D97706' },
    { category: 'venue', label: 'Venue', pct: 20, color: '#7C3AED' },
    { category: 'photography', label: 'Photography', pct: 20, color: '#BE185D' },
    { category: 'decoration', label: 'Decoration', pct: 15, color: '#059669' },
    { category: 'music', label: 'Music & DJ', pct: 10, color: '#2563EB' },
    { category: 'others', label: 'Others', pct: 5, color: '#6B7280' },
  ],
  grand: [
    { category: 'catering', label: 'Catering', pct: 28, color: '#D97706' },
    { category: 'venue', label: 'Venue', pct: 22, color: '#7C3AED' },
    { category: 'photography', label: 'Photography', pct: 18, color: '#BE185D' },
    { category: 'decoration', label: 'Decoration', pct: 15, color: '#059669' },
    { category: 'music', label: 'Music & DJ', pct: 8, color: '#2563EB' },
    { category: 'makeup', label: 'Makeup', pct: 5, color: '#9D174D' },
    { category: 'others', label: 'Others', pct: 4, color: '#6B7280' },
  ],
};

const STYLES = [
  { value: 'intimate', label: 'Intimate', desc: 'Upto 100 guests', emoji: '🌸' },
  { value: 'standard', label: 'Standard', desc: '100–300 guests', emoji: '💍' },
  { value: 'grand', label: 'Grand', desc: '300+ guests', emoji: '👑' },
];

const LS_KEY = 'shadiseva_planner';

export default function BudgetPlanner() {
  const saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  const [budget, setBudget] = useState(saved.budget || '');
  const [guests, setGuests] = useState(saved.guests || '');
  const [style, setStyle] = useState(saved.style || 'standard');
  const [plan, setPlan] = useState(saved.plan || null);
  const [bookings, setBookings] = useState([]);
  const [sliders, setSliders] = useState({});

  useEffect(() => {
    clientAPI.getBookings().then(r => {
      const confirmed = (r.data.bookings || []).filter(b => ['confirmed', 'pending'].includes(b.status));
      setBookings(confirmed);
    }).catch(() => {});
  }, []);

  const getCommitted = (category) => {
    return bookings
      .filter(b => b.service?.category === category)
      .reduce((sum, b) => sum + (b.total_amount || 0), 0);
  };

  const handleCalculate = () => {
    if (!budget || isNaN(Number(budget))) return;
    const rows = PRESETS[style].map(row => ({
      ...row,
      pct: sliders[row.category] ?? row.pct,
    }));
    const result = { budget: Number(budget), guests: Number(guests), style, rows };
    setPlan(result);
    localStorage.setItem(LS_KEY, JSON.stringify({ budget, guests, style, plan: result }));
  };

  const totalPlanned = plan ? plan.rows.reduce((s, r) => s + Math.round(plan.budget * r.pct / 100), 0) : 0;
  const totalCommitted = plan ? plan.rows.reduce((s, r) => s + getCommitted(r.category), 0) : 0;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const { name, value } = payload[0];
    return (
      <div className="bg-white border border-[#E8E8E4] rounded-xl p-3 shadow-lg text-sm">
        <div className="font-semibold text-[#1A1A18]">{name}</div>
        <div className="text-[#BE185D] font-bold">₹{value?.toLocaleString('en-IN')}</div>
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        title="Wedding Budget Planner"
        subtitle="Plan your perfect wedding without overspending"
        action={plan && <Button variant="ghost" size="sm" onClick={() => { setPlan(null); localStorage.removeItem(LS_KEY); }}>
          <RefreshCw size={14} /> Reset
        </Button>}
      />

      {!plan ? (
        /* ── STEP 1: INPUT ── */
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#FCE7F3] flex items-center justify-center">
                <Calculator size={24} className="text-[#BE185D]" />
              </div>
              <div>
                <h2 className="font-semibold text-[#1A1A18]" style={{ fontFamily: 'Playfair Display, serif' }}>Set Your Budget</h2>
                <p className="text-sm text-[#6B6B65]">We'll create a smart allocation plan for you</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-[#1A1A18] block mb-1.5">Total Budget (₹) <span className="text-[#DC2626]">*</span></label>
                <div className="relative">
                  <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B65]" />
                  <input type="number" value={budget} onChange={e => setBudget(e.target.value)}
                    placeholder="e.g. 500000" className="input-base pl-9"
                    min="10000" max="100000000" />
                </div>
                {budget && <p className="text-xs text-[#6B6B65] mt-1">= ₹{Number(budget).toLocaleString('en-IN')}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-[#1A1A18] block mb-1.5">Number of Guests</label>
                <div className="relative">
                  <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B65]" />
                  <input type="number" value={guests} onChange={e => setGuests(e.target.value)}
                    placeholder="e.g. 200" className="input-base pl-9" min="1" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#1A1A18] block mb-3">Wedding Style</label>
                <div className="grid grid-cols-3 gap-3">
                  {STYLES.map(s => (
                    <button key={s.value} type="button" onClick={() => setStyle(s.value)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${style === s.value ? 'border-[#BE185D] bg-[#FCE7F3]' : 'border-[#E8E8E4] hover:border-[#BE185D]/40'}`}>
                      <div className="text-2xl mb-1">{s.emoji}</div>
                      <div className={`text-sm font-semibold ${style === s.value ? 'text-[#BE185D]' : 'text-[#1A1A18]'}`}>{s.label}</div>
                      <div className="text-xs text-[#6B6B65]">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <Button fullWidth size="lg" onClick={handleCalculate} disabled={!budget}>
                <Sparkles size={18} /> Calculate My Plan
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        /* ── STEP 2: ALLOCATION VIEW ── */
        <div>
          {/* Summary Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Budget', value: `₹${plan.budget.toLocaleString('en-IN')}`, color: 'text-[#1A1A18]' },
              { label: 'Planned', value: `₹${totalPlanned.toLocaleString('en-IN')}`, color: 'text-[#2563EB]' },
              { label: 'Committed', value: `₹${totalCommitted.toLocaleString('en-IN')}`, color: 'text-[#D97706]' },
              { label: 'Remaining', value: `₹${(plan.budget - totalCommitted).toLocaleString('en-IN')}`, color: 'text-[#059669]' },
            ].map(({ label, value, color }) => (
              <Card key={label} className="text-center py-4">
                <div className={`text-xl font-bold ${color}`} style={{ fontFamily: 'Inter, sans-serif' }}>{value}</div>
                <div className="text-xs text-[#6B6B65] mt-1">{label}</div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Pie Chart */}
            <Card className="lg:col-span-2">
              <h3 className="font-semibold text-[#1A1A18] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Budget Allocation</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={plan.rows.map(r => ({ name: r.label, value: Math.round(plan.budget * r.pct / 100) }))}
                    cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value">
                    {plan.rows.map((r, i) => <Cell key={i} fill={r.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="space-y-2 mt-2">
                {plan.rows.map(r => (
                  <div key={r.category} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="legend-dot" style={{ background: r.color }} />
                      <span className="text-[#6B6B65]">{r.label}</span>
                    </div>
                    <span className="font-semibold text-[#1A1A18]">{r.pct}%</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Category Rows */}
            <Card className="lg:col-span-3" padding={false}>
              <div className="px-6 pt-5 pb-4 border-b border-[#E8E8E4]">
                <h3 className="font-semibold text-[#1A1A18]" style={{ fontFamily: 'Playfair Display, serif' }}>Category Breakdown</h3>
              </div>
              <div className="divide-y divide-[#E8E8E4]">
                {plan.rows.map(row => {
                  const suggested = Math.round(plan.budget * row.pct / 100);
                  const committed = getCommitted(row.category);
                  const progress = suggested > 0 ? Math.min(100, (committed / suggested) * 100) : 0;
                  return (
                    <div key={row.category} className="px-6 py-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ background: row.color }} />
                          <span className="text-sm font-semibold text-[#1A1A18]">{row.label}</span>
                          <span className="text-xs text-[#6B6B65]">({row.pct}%)</span>
                        </div>
                        {row.category !== 'others' && (
                          <Link to={`/services?category=${row.category}`}
                            className="text-xs text-[#BE185D] font-medium flex items-center gap-1 hover:gap-2 transition-all">
                            Find <ArrowRight size={10} />
                          </Link>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-2 text-xs">
                        <div><span className="text-[#6B6B65]">Budget: </span><span className="font-semibold">₹{suggested.toLocaleString('en-IN')}</span></div>
                        <div><span className="text-[#6B6B65]">Booked: </span><span className="font-semibold text-[#D97706]">₹{committed.toLocaleString('en-IN')}</span></div>
                      </div>
                      {/* Progress bar */}
                      <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress}%`, background: row.color }} />
                      </div>
                      {/* Slider to adjust % */}
                      <input type="range" min="0" max="80" value={sliders[row.category] ?? row.pct}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setSliders(s => ({ ...s, [row.category]: val }));
                          setPlan(p => ({
                            ...p,
                            rows: p.rows.map(r => r.category === row.category ? { ...r, pct: val } : r),
                          }));
                        }}
                        className="w-full mt-2 accent-[#BE185D]" />
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {guests && (
            <Card className="mt-4">
              <div className="flex items-center gap-4 text-sm">
                <Users size={20} className="text-[#6B6B65]" />
                <div>
                  <span className="text-[#6B6B65]">Per Guest Budget: </span>
                  <span className="font-bold text-[#1A1A18]">₹{Math.round(plan.budget / Number(guests)).toLocaleString('en-IN')}</span>
                  <span className="text-[#6B6B65] ml-4">for {guests} guests</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
