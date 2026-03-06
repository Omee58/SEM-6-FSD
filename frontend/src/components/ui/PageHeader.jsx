export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-8 gap-4">
      <div>
        <h1
          className="font-bold text-text mb-1"
          style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.875rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}
        >
          {title}
        </h1>
        {/* Gold accent line */}
        <div className="flex items-center gap-3 mt-2">
          <div style={{ width: 40, height: 2, borderRadius: 2, background: 'linear-gradient(90deg, #B8912A, #E8C86E)' }} />
          {subtitle && <p className="text-sm" style={{ color: '#78716C' }}>{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
