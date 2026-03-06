export default function Button({
  children, onClick, type = 'button', variant = 'primary',
  size = 'md', loading = false, disabled = false, className = '', fullWidth = false
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-[10px] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-[#BE185D] text-white hover:bg-[#9D174D] shadow-sm hover:shadow-[0_4px_20px_rgba(190,24,93,0.3)]',
    secondary: 'bg-white text-[#1A1A18] border border-[#E8E8E4] hover:bg-[#FAFAF8] hover:border-[#BE185D] hover:text-[#BE185D]',
    ghost: 'bg-transparent text-[#6B6B65] hover:bg-[#FAFAF8] hover:text-[#BE185D]',
    danger: 'bg-[#DC2626] text-white hover:bg-[#B91C1C]',
    success: 'bg-[#059669] text-white hover:bg-[#047857]',
    gold: 'bg-[#D97706] text-white hover:bg-[#B45309]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[13px] h-8',
    md: 'px-4 py-2 text-[14px] h-9',
    lg: 'px-6 py-3 text-[15px] h-11',
    xl: 'px-8 py-4 text-[16px] h-13',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading && <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />}
      {children}
    </button>
  );
}
