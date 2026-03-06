import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Search, Calendar, Calculator, User,
  Bell, Package, UserCheck, Users, LogOut, Heart, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = {
  client: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/services', icon: Search, label: 'Browse Services' },
    { to: '/bookings', icon: Calendar, label: 'My Bookings' },
    { to: '/planner', icon: Calculator, label: 'Budget Planner' },
    { to: '/profile', icon: User, label: 'Profile' },
  ],
  vendor: [
    { to: '/vendor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/vendor/bookings', icon: Bell, label: 'Booking Requests' },
    { to: '/vendor/services', icon: Package, label: 'My Services' },
    { to: '/vendor/profile', icon: User, label: 'Profile' },
  ],
  admin: [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/approvals', icon: UserCheck, label: 'Vendor Approvals' },
    { to: '/admin/users', icon: Users, label: 'All Users' },
    { to: '/admin/bookings', icon: Calendar, label: 'All Bookings' },
    { to: '/admin/profile', icon: User, label: 'Profile' },
  ],
};

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navItems = user ? (NAV[user.role] || []) : [];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-[#E8E8E4]">
        <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#BE185D] to-[#9D174D] flex items-center justify-center">
            <Heart size={18} className="text-white fill-white" />
          </div>
          <div>
            <div className="font-bold text-[#1A1A18] text-[15px]" style={{ fontFamily: 'Playfair Display, serif' }}>ShadiSeva</div>
            <div className="text-[10px] text-[#6B6B65] uppercase tracking-wider">Wedding Marketplace</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
              isActive(to)
                ? 'bg-[#FCE7F3] text-[#BE185D]'
                : 'text-[#6B6B65] hover:bg-[#FAFAF8] hover:text-[#1A1A18]'
            }`}
          >
            <Icon size={18} className={isActive(to) ? 'text-[#BE185D]' : 'text-[#6B6B65] group-hover:text-[#1A1A18]'} />
            <span className="flex-1">{label}</span>
            {isActive(to) && <ChevronRight size={14} className="text-[#BE185D]" />}
          </Link>
        ))}
      </nav>

      {/* User Card */}
      {user && (
        <div className="px-3 py-4 border-t border-[#E8E8E4]">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-[#FAFAF8] mb-2">
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#BE185D] to-[#9D174D] flex items-center justify-center text-white text-sm font-bold shrink-0">
              {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[#1A1A18] truncate">{user.full_name}</div>
              <div className="text-[11px] text-[#6B6B65] capitalize">{user.role}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#DC2626] hover:bg-[#FEE2E2] transition-colors w-full"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}
