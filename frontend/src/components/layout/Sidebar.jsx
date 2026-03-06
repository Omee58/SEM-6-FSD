import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Search, Calendar, Calculator, User,
  Bell, Package, UserCheck, Users, LogOut, Heart, Gem
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = {
  client: [
    { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/services',   icon: Search,           label: 'Browse Services' },
    { to: '/bookings',   icon: Calendar,         label: 'My Bookings' },
    { to: '/planner',    icon: Calculator,        label: 'Budget Planner' },
    { to: '/profile',    icon: User,              label: 'Profile' },
  ],
  vendor: [
    { to: '/vendor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/vendor/bookings',  icon: Bell,             label: 'Booking Requests' },
    { to: '/vendor/services',  icon: Package,           label: 'My Services' },
    { to: '/vendor/profile',   icon: User,              label: 'Profile' },
  ],
  admin: [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/approvals', icon: UserCheck,        label: 'Vendor Approvals' },
    { to: '/admin/users',     icon: Users,             label: 'All Users' },
    { to: '/admin/bookings',  icon: Calendar,          label: 'All Bookings' },
    { to: '/admin/profile',   icon: User,              label: 'Profile' },
  ],
};

function NavItem({ to, icon: Icon, label, active, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-[10px] rounded-xl text-sm font-medium transition-all duration-200 group"
      style={active ? {
        background: 'linear-gradient(135deg, rgba(190,24,93,0.9) 0%, rgba(157,23,77,0.9) 100%)',
        color: '#ffffff',
        boxShadow: '0 4px 16px rgba(190,24,93,0.28)',
      } : {
        color: 'rgba(255,255,255,0.5)',
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
          e.currentTarget.style.color = 'rgba(255,255,255,0.88)';
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
        }
      }}
    >
      <Icon size={17} style={{ flexShrink: 0 }} />
      <span className="flex-1">{label}</span>
      {active && <div className="w-1.5 h-1.5 rounded-full bg-white/60" />}
    </Link>
  );
}

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navItems = user ? (NAV[user.role] || []) : [];
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="flex flex-col h-full" style={{ background: '#1A0A10' }}>

      {/* Logo */}
      <div className="px-5 pt-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link to="/" className="flex items-center gap-3" onClick={onClose}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #BE185D 0%, #7C1037 100%)',
              boxShadow: '0 4px 14px rgba(190,24,93,0.4)',
            }}>
            <Heart size={19} className="fill-white text-white" />
          </div>
          <div>
            <div className="font-bold text-white tracking-wide" style={{ fontFamily: 'Playfair Display, serif', fontSize: '15px' }}>
              ShadiSeva
            </div>
            <div style={{ fontSize: '10px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
              Wedding Marketplace
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <div className="px-3 mb-3 mt-1">
          <span style={{ fontSize: '10px', letterSpacing: '0.12em', fontWeight: 600, color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' }}>
            {user?.role === 'client' ? 'Wedding Hub' : user?.role === 'vendor' ? 'Vendor Hub' : 'Admin Hub'}
          </span>
        </div>

        {navItems.map(({ to, icon, label }) => (
          <NavItem key={to} to={to} icon={icon} label={label} active={isActive(to)} onClick={onClose} />
        ))}
      </nav>

      {/* Premium badge */}
      {user?.role === 'client' && (
        <div className="px-4 mb-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(184,145,42,0.14) 0%, rgba(184,145,42,0.07) 100%)',
              border: '1px solid rgba(184,145,42,0.22)',
            }}>
            <Gem size={13} style={{ color: '#C9A84C', flexShrink: 0 }} />
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', color: '#C9A84C' }}>
              Premium Member
            </span>
          </div>
        </div>
      )}

      {/* User Card */}
      {user && (
        <div className="px-3 pb-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{
                background: 'linear-gradient(135deg, #B8912A 0%, #9A7520 100%)',
                boxShadow: '0 2px 8px rgba(184,145,42,0.35)',
              }}>
              {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold truncate" style={{ color: 'rgba(255,255,255,0.88)' }}>
                {user.full_name}
              </div>
              <div style={{ fontSize: '10px', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.32)', textTransform: 'capitalize' }}>
                {user.role}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium w-full transition-all duration-200"
            style={{ color: 'rgba(255,255,255,0.35)' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(220,38,38,0.12)';
              e.currentTarget.style.color = '#FCA5A5';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(255,255,255,0.35)';
            }}
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}
