import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ icon: Icon, label, value, trend, trendValue, accent = 'rose' }) {
  const barClass = {
    rose: 'stat-bar-rose',
    gold: 'stat-bar-gold',
    green: 'stat-bar-green',
    blue: 'stat-bar-blue',
    purple: 'stat-bar-purple',
  }[accent] || 'stat-bar-rose';

  const iconBg = {
    rose: 'bg-[#FCE7F3] text-[#BE185D]',
    gold: 'bg-[#FEF3C7] text-[#D97706]',
    green: 'bg-[#D1FAE5] text-[#059669]',
    blue: 'bg-[#DBEAFE] text-[#2563EB]',
    purple: 'bg-[#EDE9FE] text-[#7C3AED]',
  }[accent] || 'bg-[#FCE7F3] text-[#BE185D]';

  return (
    <div className={`card p-5 ${barClass}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${iconBg}`}>
          {Icon && <Icon size={20} />}
        </div>
        {trendValue !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-[#059669]' : 'text-[#DC2626]'}`}>
            {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trendValue}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-[#1A1A18] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>{value}</div>
      <div className="text-sm text-[#6B6B65]">{label}</div>
    </div>
  );
}
