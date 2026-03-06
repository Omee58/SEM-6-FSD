import { useState } from 'react';
import { Menu, Bell, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function TopBar({ title, onMenuClick }) {
  const { user } = useAuth();
  const [, setNotifOpen] = useState(false);

  return (
    <header
      className="h-16 flex items-center justify-between px-6 shrink-0 z-10"
      style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(232,225,217,0.7)',
      }}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-200"
          style={{ color: '#78716C' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F5EDE4'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <Menu size={20} />
        </button>
        {title && (
          <h2
            className="text-lg font-semibold hidden md:block"
            style={{ fontFamily: 'Playfair Display, serif', color: '#1C1917', letterSpacing: '-0.01em' }}
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
          onMouseEnter={e => { e.currentTarget.style.background = '#F5EDE4'; e.currentTarget.style.color = '#BE185D'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#78716C'; }}
        >
          <Bell size={18} />
          <span
            className="absolute top-2 right-2 w-2 h-2 rounded-full"
            style={{ background: '#BE185D', boxShadow: '0 0 0 2px white' }}
          />
        </button>

        {/* Divider */}
        <div className="w-px h-6 mx-1" style={{ background: '#E8E1D9' }} />

        {/* User pill */}
        {user && (
          <div className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-xl transition-all duration-200 cursor-default"
            style={{ background: '#FDF6EE' }}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #BE185D 0%, #9D174D 100%)', boxShadow: '0 2px 6px rgba(190,24,93,0.3)' }}
            >
              {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block">
              <div className="text-[13px] font-semibold leading-tight" style={{ color: '#1C1917' }}>{user.full_name}</div>
              <div className="flex items-center gap-1">
                <Sparkles size={9} style={{ color: '#B8912A' }} />
                <span style={{ fontSize: '10px', color: '#B8912A', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'capitalize' }}>{user.role}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
