const statusMap = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  cancelled: 'badge-cancelled',
  completed: 'badge-completed',
  active: 'badge-active',
  inactive: 'badge-inactive',
  verified: 'badge-verified',
  unverified: 'badge-unverified',
  client: 'badge-client',
  vendor: 'badge-vendor',
  admin: 'badge-admin',
};

export default function Badge({ children, status, className = '' }) {
  const cls = status ? statusMap[status] || 'badge-pending' : '';
  return (
    <span className={`badge ${cls} ${className}`}>
      {children}
    </span>
  );
}
