export default function Button({
  children, onClick, type = 'button', variant = 'primary',
  size = 'md', loading = false, disabled = false, className = '', fullWidth = false
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'text-white shadow-sm bg-primary ' +
      'hover:bg-primary-dark ' +
      'hover:shadow-primary',
    secondary:
      'bg-white text-[#1C1A16] border border-[#E0DDD6] ' +
      'hover:border-primary hover:text-primary hover:bg-primary-light ' +
      'shadow-sm',
    ghost:
      'bg-transparent text-[#6B6560] ' +
      'hover:bg-primary-light hover:text-primary',
    danger:
      'bg-gradient-to-br from-[#DC2626] to-[#B91C1C] text-white shadow-sm ' +
      'hover:shadow-[0_6px_20px_rgba(220,38,38,0.3)]',
    success:
      'bg-gradient-to-br from-[#059669] to-[#047857] text-white shadow-sm ' +
      'hover:shadow-[0_6px_20px_rgba(5,150,105,0.3)]',
    gold:
      'text-white shadow-sm ' +
      'bg-gradient-to-br from-[#C9A84C] to-[#A88B38] ' +
      'hover:from-[#E8C66A] hover:to-[#C9A84C] ' +
      'hover:shadow-[0_8px_24px_rgba(201,168,76,0.35)]',
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
