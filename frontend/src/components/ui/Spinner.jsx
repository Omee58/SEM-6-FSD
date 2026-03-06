export default function Spinner({ size = 24, className = '' }) {
  return (
    <div
      className={`spinner ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function PageSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
      <div className="spinner" style={{ width: 36, height: 36 }} />
      <p className="text-sm text-[#6B6B65]">Loading...</p>
    </div>
  );
}
