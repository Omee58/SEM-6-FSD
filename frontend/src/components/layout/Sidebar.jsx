import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Search, Calendar, Calculator, User,
  Bell, Package, UserCheck, Users, LogOut, Heart, Gem,
  BarChart3, Star, FileDown,
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
    { to: '/admin/users',     icon: Users,            label: 'All Users' },
    { to: '/admin/bookings',  icon: Calendar,         label: 'All Bookings' },
    { to: '/admin/analytics', icon: BarChart3,        label: 'Analytics' },
    { to: '/admin/reviews',   icon: Star,             label: 'Reviews' },
    { to: '/admin/reports',   icon: FileDown,         label: 'Reports' },
    { to: '/admin/profile',   icon: User,             label: 'Profile' },
  ],
};

// Role-based color themes for the light sidebar
const ROLE_THEME = {
  admin:  {
    sidebar:        '#FAFAF8',
    border:         '#EDE8E3',
    primary:        '#C9A84C',
    primaryLight:   '#FBF5E0',
    activeBg:       'rgba(201,168,76,0.12)',
    activeShadow:   '0 2px 10px rgba(201,168,76,0.18)',
    activeText:     '#8B6914',
    navText:        '#6B6560',
    navHoverBg:     'rgba(201,168,76,0.07)',
    navHoverText:   '#5A4A10',
    sectionLabel:   '#B8A090',
    orbGrad:        'linear-gradient(135deg, #C9A84C 0%, #A88B38 100%)',
    orbShadow:      '0 4px 14px rgba(201,168,76,0.35)',
    avatarGrad:     'linear-gradient(135deg, #C9A84C 0%, #A88B38 100%)',
    avatarShadow:   '0 2px 8px rgba(201,168,76,0.30)',
    dot:            '#C9A84C',
  },
  client: {
    sidebar:        '#FDF8F5',
    border:         '#EDE3DE',
    primary:        '#8B1A3A',
    primaryLight:   '#FDF0F4',
    activeBg:       'rgba(139,26,58,0.10)',
    activeShadow:   '0 2px 10px rgba(139,26,58,0.14)',
    activeText:     '#8B1A3A',
    navText:        '#6B6560',
    navHoverBg:     'rgba(139,26,58,0.06)',
    navHoverText:   '#6B1230',
    sectionLabel:   '#B0A098',
    orbGrad:        'linear-gradient(135deg, #8B1A3A 0%, #4A0A22 100%)',
    orbShadow:      '0 4px 14px rgba(139,26,58,0.30)',
    avatarGrad:     'linear-gradient(135deg, #8B1A3A 0%, #6B1230 100%)',
    avatarShadow:   '0 2px 8px rgba(139,26,58,0.25)',
    dot:            '#C9A84C',
  },
  vendor: {
    sidebar:        '#F8F9FC',
    border:         '#DDE3EE',
    primary:        '#1B3A5C',
    primaryLight:   '#EEF3FA',
    activeBg:       'rgba(27,58,92,0.10)',
    activeShadow:   '0 2px 10px rgba(27,58,92,0.14)',
    activeText:     '#1B3A5C',
    navText:        '#6B6560',
    navHoverBg:     'rgba(27,58,92,0.06)',
    navHoverText:   '#122743',
    sectionLabel:   '#9AA5B8',
    orbGrad:        'linear-gradient(135deg, #1B3A5C 0%, #0D1F33 100%)',
    orbShadow:      '0 4px 14px rgba(27,58,92,0.30)',
    avatarGrad:     'linear-gradient(135deg, #1B3A5C 0%, #122743 100%)',
    avatarShadow:   '0 2px 8px rgba(27,58,92,0.25)',
    dot:            '#C9A84C',
  },
};

function NavItem({ to, icon: Icon, label, active, onClick, theme }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
      style={active ? {
        background: theme.activeBg,
        color: theme.activeText,
        boxShadow: theme.activeShadow,
      } : {
        color: theme.navText,
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.background = theme.navHoverBg;
          e.currentTarget.style.color = theme.navHoverText;
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = theme.navText;
        }
      }}
    >
      <Icon size={17} style={{ flexShrink: 0 }} />
      <span className="flex-1">{label}</span>
      {active && <div className="w-1.5 h-1.5 rounded-full" style={{ background: theme.dot }} />}
    </Link>
  );
}

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navItems = user ? (NAV[user.role] || []) : [];
  const isActive = (path) => location.pathname === path;
  const theme = ROLE_THEME[user?.role] || ROLE_THEME.client;

  return (
    <aside className="flex flex-col h-full" style={{ background: theme.sidebar }}>

      {/* Logo */}
      <div className="px-5 pt-6 pb-5" style={{ borderBottom: `1px solid ${theme.border}` }}>
        <Link to="/" className="flex items-center gap-3" onClick={onClose}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: theme.orbGrad, boxShadow: theme.orbShadow }}>
            <Heart size={19} className="fill-white text-white" />
          </div>
          <div>
            <div className="font-bold tracking-wide" style={{ fontFamily: 'Playfair Display, serif', fontSize: '15px', color: '#1C1A16' }}>
              ShadiSeva
            </div>
            <div style={{ fontSize: '10px', letterSpacing: '0.12em', color: theme.sectionLabel, textTransform: 'uppercase' }}>
              Wedding Marketplace
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <div className="px-3 mb-3 mt-1">
          <span style={{ fontSize: '10px', letterSpacing: '0.12em', fontWeight: 600, color: theme.sectionLabel, textTransform: 'uppercase' }}>
            {user?.role === 'client' ? 'Wedding Hub' : user?.role === 'vendor' ? 'Vendor Hub' : 'Admin Hub'}
          </span>
        </div>

        {navItems.map(({ to, icon, label }) => (
          <NavItem key={to} to={to} icon={icon} label={label} active={isActive(to)} onClick={onClose} theme={theme} />
        ))}
      </nav>

      {/* Premium badge (client only) */}
      {user?.role === 'client' && (
        <div className="px-4 mb-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.06) 100%)',
              border: '1px solid rgba(201,168,76,0.22)',
            }}>
            <Gem size={13} style={{ color: '#C9A84C', flexShrink: 0 }} />
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', color: '#A88B38' }}>
              Premium Member
            </span>
          </div>
        </div>
      )}

      {/* User Card */}
      {user && (
        <div className="px-3 pb-5 pt-4" style={{ borderTop: `1px solid ${theme.border}` }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2"
            style={{ background: theme.primaryLight, border: `1px solid ${theme.border}` }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ background: theme.avatarGrad, boxShadow: theme.avatarShadow }}>
              {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold truncate" style={{ color: '#1C1A16' }}>
                {user.full_name}
              </div>
              <div style={{ fontSize: '10px', letterSpacing: '0.06em', color: theme.sectionLabel, textTransform: 'capitalize' }}>
                {user.role}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium w-full transition-all duration-200"
            style={{ color: '#A8A29E' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(220,38,38,0.08)';
              e.currentTarget.style.color = '#DC2626';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#A8A29E';
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
