import { useState } from 'react';
import { Menu, Bell, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ROLE_TOPBAR = {
  admin:  { hoverBg: '#FBF5E0', hoverText: '#8B6914', dot: '#C9A84C', avatarGrad: 'linear-gradient(135deg, #C9A84C 0%, #A88B38 100%)', avatarShadow: '0 2px 6px rgba(201,168,76,0.30)', pillBg: '#FDFAF2' },
  client: { hoverBg: '#FDF0F4', hoverText: '#8B1A3A', dot: '#8B1A3A', avatarGrad: 'linear-gradient(135deg, #8B1A3A 0%, #6B1230 100%)', avatarShadow: '0 2px 6px rgba(139,26,58,0.25)', pillBg: '#FDF8F5' },
  vendor: { hoverBg: '#EEF3FA', hoverText: '#1B3A5C', dot: '#1B3A5C', avatarGrad: 'linear-gradient(135deg, #1B3A5C 0%, #122743 100%)', avatarShadow: '0 2px 6px rgba(27,58,92,0.25)', pillBg: '#F8F9FC' },
};

export default function TopBar({ title, onMenuClick }) {
  const { user } = useAuth();
  const [, setNotifOpen] = useState(false);
  const t = ROLE_TOPBAR[user?.role] || ROLE_TOPBAR.client;

  return (
    <header
      className="h-16 flex items-center justify-between px-6 shrink-0 z-10"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid #EDE8E3',
      }}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-200"
          style={{ color: '#78716C' }}
          onMouseEnter={e => { e.currentTarget.style.background = t.hoverBg; e.currentTarget.style.color = t.hoverText; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#78716C'; }}
        >
          <Menu size={20} />
        </button>
        {title && (
          <h2
            className="text-lg font-semibold hidden md:block"
            style={{ fontFamily: 'Playfair Display, serif', color: '#1C1A16', letterSpacing: '-0.01em' }}
          >
            {title}
          </h2>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button
          onClick={() => setNotifOpen(o => !o)}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{ color: '#78716C' }}
          onMouseEnter={e => { e.currentTarget.style.background = t.hoverBg; e.currentTarget.style.color = t.hoverText; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#78716C'; }}
        >
          <Bell size={18} />
          <span
            className="absolute top-2 right-2 w-2 h-2 rounded-full"
            style={{ background: t.dot, boxShadow: '0 0 0 2px white' }}
          />
        </button>

        {/* Divider */}
        <div className="w-px h-6 mx-1" style={{ background: '#E8E3DF' }} />

        {/* User pill */}
        {user && (
          <div className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-xl cursor-default"
            style={{ background: t.pillBg, border: '1px solid #EDE8E3' }}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: t.avatarGrad, boxShadow: t.avatarShadow }}
            >
              {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block">
              <div className="text-[13px] font-semibold leading-tight" style={{ color: '#1C1A16' }}>{user.full_name}</div>
              <div className="flex items-center gap-1">
                <Sparkles size={9} style={{ color: '#C9A84C' }} />
                <span style={{ fontSize: '10px', color: '#C9A84C', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'capitalize' }}>{user.role}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
