import { ChevronDown } from 'lucide-react';

export default function Select({ label, name, value, onChange, options = [], placeholder, error, required, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-[#1A1A18]">
          {label} {required && <span className="text-[#DC2626]">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`input-base appearance-none pr-9 ${error ? 'error' : ''}`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B65] pointer-events-none" />
      </div>
      {error && <p className="text-xs text-[#DC2626]">{error}</p>}
    </div>
  );
}
