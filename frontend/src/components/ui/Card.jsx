export default function Card({ children, className = '', padding = true, hover = false }) {
  return (
    <div
      className={`card ${padding ? 'p-6' : ''} ${hover ? 'hover:shadow-[0_10px_30px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
