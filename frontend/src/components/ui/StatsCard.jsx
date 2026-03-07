import { TrendingUp, TrendingDown } from 'lucide-react';

const ACCENT = {
  rose:   { grad: 'linear-gradient(135deg,#8B1A3A,#6B1230)', glow: 'rgba(139,26,58,0.18)',   text: '#8B1A3A' },
  gold:   { grad: 'linear-gradient(135deg,#C9A84C,#A88B38)', glow: 'rgba(201,168,76,0.18)',  text: '#C9A84C' },
  green:  { grad: 'linear-gradient(135deg,#059669,#047857)', glow: 'rgba(5,150,105,0.18)',   text: '#059669' },
  blue:   { grad: 'linear-gradient(135deg,#2563EB,#1D4ED8)', glow: 'rgba(37,99,235,0.18)',   text: '#2563EB' },
  purple: { grad: 'linear-gradient(135deg,#7C3AED,#6D28D9)', glow: 'rgba(124,58,237,0.18)',  text: '#7C3AED' },
};

export default function StatsCard({ icon: Icon, label, value, trend, trendValue, accent = 'rose', onClick }) {
  const a = ACCENT[accent] || ACCENT.rose;

  return (
    <div
      className={`card p-5 flex flex-col gap-4 ${onClick ? 'card-hover' : ''}`}
      style={{ borderTop: `3px solid ${a.text}` }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        {/* Gradient icon orb */}
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: a.grad, boxShadow: `0 6px 16px ${a.glow}` }}
        >
          {Icon && <Icon size={20} className="text-white" />}
        </div>

        {trendValue !== undefined && (
          <div
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full"
            style={{
              background: trend === 'up' ? 'rgba(5,150,105,0.1)' : 'rgba(220,38,38,0.1)',
              color: trend === 'up' ? '#059669' : '#DC2626',
            }}
          >
            {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendValue}
          </div>
        )}
      </div>

      <div>
        <div
          className="font-bold leading-none mb-1"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2rem', color: '#1C1A16', fontWeight: 700 }}
        >
          {value}
        </div>
        <div className="text-[13px] font-medium" style={{ color: '#78716C' }}>{label}</div>
      </div>
    </div>
  );
}
