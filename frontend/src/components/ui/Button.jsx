export default function Button({
  children, onClick, type = 'button', variant = 'primary',
  size = 'md', loading = false, disabled = false, className = '', fullWidth = false
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'text-white shadow-sm ' +
      'bg-gradient-to-br from-[#BE185D] to-[#9D174D] ' +
      'hover:from-[#C9195F] hover:to-[#A81852] ' +
      'hover:shadow-[0_8px_24px_rgba(190,24,93,0.35)]',
    secondary:
      'bg-white text-[#1C1917] border border-[#E8E1D9] ' +
      'hover:border-[#BE185D] hover:text-[#BE185D] hover:bg-[#FCEEF7] ' +
      'shadow-sm',
    ghost:
      'bg-transparent text-[#78716C] ' +
      'hover:bg-[#F5EDE4] hover:text-[#BE185D]',
    danger:
      'bg-gradient-to-br from-[#DC2626] to-[#B91C1C] text-white shadow-sm ' +
      'hover:shadow-[0_6px_20px_rgba(220,38,38,0.3)]',
    success:
      'bg-gradient-to-br from-[#059669] to-[#047857] text-white shadow-sm ' +
      'hover:shadow-[0_6px_20px_rgba(5,150,105,0.3)]',
    gold:
      'text-white shadow-sm ' +
      'bg-gradient-to-br from-[#B8912A] to-[#9A7520] ' +
      'hover:from-[#C9A030] hover:to-[#A07B26] ' +
      'hover:shadow-[0_8px_24px_rgba(184,145,42,0.35)]',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-[12px] h-8',
    md: 'px-4.5 py-2 text-[13px] h-9',
    lg: 'px-6 py-3 text-[14px] h-11',
    xl: 'px-8 py-4 text-[15px] h-13',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading && <span className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} />}
      {children}
    </button>
  );
}
