export default function Input({
  label, name, type = 'text', value, onChange, placeholder,
  error, icon: Icon, required = false, className = '', disabled = false,
  hint, ...rest
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-[#1A1A18]">
          {label} {required && <span className="text-[#DC2626]">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B65] pointer-events-none">
            <Icon size={16} />
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`input-base ${Icon ? 'pl-9' : ''} ${error ? 'error' : ''} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          {...rest}
        />
      </div>
      {hint && !error && <p className="text-xs text-[#6B6B65]">{hint}</p>}
      {error && <p className="text-xs text-[#DC2626]">{error}</p>}
    </div>
  );
}

export function Textarea({ label, name, value, onChange, placeholder, error, required, rows = 4, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-[#1A1A18]">
          {label} {required && <span className="text-[#DC2626]">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className={`input-base resize-none ${error ? 'error' : ''}`}
      />
      {error && <p className="text-xs text-[#DC2626]">{error}</p>}
    </div>
  );
}
