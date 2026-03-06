import { useState } from 'react';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function TopBar({ title, onMenuClick }) {
  const { user } = useAuth();
  const [, setNotifOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-[#E8E8E4] flex items-center justify-between px-6 shrink-0 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden w-9 h-9 rounded-lg hover:bg-[#FAFAF8] flex items-center justify-center text-[#6B6B65]"
        >
          <Menu size={20} />
        </button>
        {title && <h2 className="text-base font-semibold text-[#1A1A18] hidden md:block">{title}</h2>}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setNotifOpen(o => !o)}
          className="relative w-9 h-9 rounded-lg hover:bg-[#FAFAF8] flex items-center justify-center text-[#6B6B65] hover:text-[#BE185D] transition-colors"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#BE185D] rounded-full" />
        </button>
        {user && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#BE185D] to-[#9D174D] flex items-center justify-center text-white text-sm font-bold">
              {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium text-[#1A1A18] hidden sm:block">{user.full_name}</span>
          </div>
        )}
      </div>
    </header>
  );
}
