import Button from './Button';

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-[#FCE7F3] flex items-center justify-center">
          <Icon size={32} className="text-[#BE185D]" />
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold text-[#1A1A18] mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>{title}</h3>
        {description && <p className="text-sm text-[#6B6B65] max-w-xs">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="md">{actionLabel}</Button>
      )}
    </div>
  );
}
