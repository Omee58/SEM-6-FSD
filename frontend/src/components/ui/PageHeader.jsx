export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A18]" style={{ fontFamily: 'Playfair Display, serif' }}>
          {title}
        </h1>
        {subtitle && <p className="text-sm text-[#6B6B65] mt-1">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
