export const SERVICE_CATEGORIES = [
  { value: 'photography', label: 'Photography', icon: 'Camera', color: '#BE185D' },
  { value: 'catering', label: 'Catering', icon: 'UtensilsCrossed', color: '#D97706' },
  { value: 'venue', label: 'Venue', icon: 'Building2', color: '#7C3AED' },
  { value: 'decoration', label: 'Decoration', icon: 'Sparkles', color: '#059669' },
  { value: 'mehendi', label: 'Mehendi', icon: 'Palette', color: '#DC2626' },
  { value: 'music', label: 'Music & DJ', icon: 'Music', color: '#2563EB' },
  { value: 'makeup', label: 'Makeup', icon: 'Star', color: '#9D174D' },
  { value: 'transport', label: 'Transport', icon: 'Car', color: '#0891B2' },
];

export const CATEGORY_COLORS = {
  photography: '#BE185D',
  catering: '#D97706',
  venue: '#7C3AED',
  decoration: '#059669',
  mehendi: '#DC2626',
  music: '#2563EB',
  makeup: '#9D174D',
  transport: '#0891B2',
};

export const getCategoryLabel = (value) =>
  SERVICE_CATEGORIES.find(c => c.value === value)?.label || value;
