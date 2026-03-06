export default function Card({ children, className = '', padding = true, hover = false, glass = false }) {
  const base = glass
    ? 'glass-panel rounded-2xl'
    : 'card';

  const hoverCls = hover ? 'card-hover cursor-pointer' : '';

  return (
    <div className={`${base} ${hoverCls} ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  );
}
