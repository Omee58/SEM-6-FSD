import { useState, useEffect } from 'react';
import {
  Search, Users, UserCheck, User, Mail, Phone,
  ShieldCheck, ChevronLeft, ChevronRight, Calendar,
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { PageSpinner } from '../../components/ui/Spinner';

const ROLE_TABS = [
  { key: '',        label: 'All',     color: '#6366F1' },
  { key: 'client',  label: 'Clients', color: '#EC4899' },
  { key: 'vendor',  label: 'Vendors', color: '#10B981' },
  { key: 'admin',   label: 'Admins',  color: '#F59E0B' },
];

const ROLE_CONFIG = {
  client: { gradient: 'linear-gradient(135deg,#831843,#BE185D)', light: '#FDF2F8', text: '#9D174D' },
  vendor: { gradient: 'linear-gradient(135deg,#064E3B,#047857)', light: '#F0FDF4', text: '#065F46' },
  admin:  { gradient: 'linear-gradient(135deg,#78350F,#B45309)', light: '#FFFBEB', text: '#92400E' },
};

function Orb({ size, color, style: s }) {
  return <div className="absolute rounded-full pointer-events-none"
    style={{ width: size, height: size, background: color, filter: 'blur(70px)', ...s }} />;
}

export default function AdminUsers() {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [role,       setRole]       = useState('');
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);
  const [roleCounts, setRoleCounts] = useState({ client: 0, vendor: 0, admin: 0 });
  const [mounted,    setMounted]    = useState(false);
  const LIMIT = 10;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const r = await adminAPI.getAllUsers({ search, role, page, limit: LIMIT });
      setUsers(r.data.users || []);
      setTotal(r.data.pagination?.total || 0);
    } catch {}
    setLoading(false);
    setTimeout(() => setMounted(true), 60);
  };

  // Load real platform-wide role totals once on mount
  useEffect(() => {
    adminAPI.getStats()
      .then(r => {
        const byRole = r.data?.overview?.users_by_role;
        if (byRole) setRoleCounts({ client: byRole.client || 0, vendor: byRole.vendor || 0, admin: byRole.admin || 0 });
      })
      .catch(() => {});
  }, []);

  useEffect(() => { fetchUsers(); }, [search, role, page]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.35s ease' }}>

      {/* ══ HERO ══ */}
      <div className="relative overflow-hidden rounded-3xl"
        style={{ background: 'linear-gradient(135deg,#060B14 0%,#0D1627 50%,#0F172A 100%)', minHeight: 170, padding: '32px 40px' }}>
        <Orb size={280} color="rgba(99,102,241,0.12)"  style={{ top: -70, right: -50 }} />
        <Orb size={180} color="rgba(236,72,153,0.08)"  style={{ bottom: -50, right: 250, animationDelay: '3s' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-[11px] font-bold uppercase tracking-widest"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}>
              <Users size={11} style={{ color: '#6366F1' }} /> User Management
            </div>
            <h1 className="text-white font-bold mb-1"
              style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.4rem,3vw,2rem)' }}>
              All Users
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13 }}>
              {total} registered users on the platform
            </p>
          </div>
          {/* role pills — uses platform-wide totals from stats API */}
          <div className="flex gap-2 flex-wrap">
            {['client', 'vendor', 'admin'].map(r => (
              <div key={r} className="px-3 py-2 rounded-xl text-center"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', minWidth: 70 }}>
                <p className="font-bold text-white text-[1rem]" style={{ fontFamily: 'Cormorant Garamond,serif' }}>{roleCounts[r]}</p>
                <p className="text-[10px] tracking-widest font-semibold mt-0.5" style={{ color: 'rgba(255,255,255,0.38)', textTransform: 'capitalize' }}>{r}s</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ FILTERS ══ */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {ROLE_TABS.map(t => {
            const active = role === t.key;
            return (
              <button key={t.key} onClick={() => { setRole(t.key); setPage(1); }}
                className="px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200"
                style={active ? {
                  background: 'linear-gradient(135deg,#0F172A,#1E293B)',
                  color: '#fff',
                  boxShadow: '0 4px 16px rgba(15,23,42,0.22)',
                } : {
                  background: '#fff',
                  color: '#64748B',
                  border: '1.5px solid #E2E8F0',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = t.color; e.currentTarget.style.color = t.color; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B'; } }}
              >{t.label}</button>
            );
          })}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email…"
            className="pl-9 pr-4 py-2 rounded-xl text-[13px] focus:outline-none"
            style={{ border: '1.5px solid #E2E8F0', color: '#0F172A', width: 240 }}
            onFocus={e => { e.currentTarget.style.borderColor = '#6366F1'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0'; }} />
        </div>
      </div>

      {/* ══ USER CARDS ══ */}
      {loading ? <PageSpinner /> : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl"
          style={{ background: '#fff', border: '1px solid #E2E8F0' }}>
          <Users size={40} style={{ color: '#CBD5E1', marginBottom: 12 }} />
          <p className="font-bold text-[1.1rem]" style={{ fontFamily: 'Playfair Display,serif', color: '#0F172A' }}>No users found</p>
          <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>Try adjusting your search or role filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u, idx) => {
            const cfg = ROLE_CONFIG[u.role] || ROLE_CONFIG.client;
            return (
              <div key={u._id}
                className="rounded-2xl overflow-hidden transition-all duration-200"
                style={{
                  background: '#fff',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 8px rgba(15,23,42,0.05)',
                  animation: `fadeUp 0.4s ease ${idx * 0.04}s both`,
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 10px 32px rgba(15,23,42,0.1)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,23,42,0.05)'; e.currentTarget.style.transform = ''; }}
              >
                {/* gradient top strip */}
                <div className="h-1 w-full" style={{ background: cfg.gradient }} />

                <div className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    {/* avatar */}
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-bold shrink-0"
                      style={{ background: cfg.gradient, boxShadow: `0 4px 12px ${cfg.text}30` }}>
                      {u.full_name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[14px] truncate" style={{ fontFamily: 'Playfair Display,serif', color: '#0F172A' }}>
                        {u.full_name}
                      </p>
                      <p className="text-[12px] truncate mt-0.5" style={{ color: '#64748B' }}>{u.email}</p>
                    </div>
                    {/* role badge */}
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold capitalize shrink-0"
                      style={{ background: cfg.light, color: cfg.text }}>{u.role}</span>
                  </div>

                  {/* info rows */}
                  <div className="space-y-2">
                    {u.phone && (
                      <div className="flex items-center gap-2 text-[12px]" style={{ color: '#64748B' }}>
                        <Phone size={12} /> {u.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[12px]" style={{ color: '#64748B' }}>
                      <Calendar size={12} />
                      Joined {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    {u.role === 'vendor' && (
                      <div className="flex items-center gap-1.5 mt-2">
                        {u.verified ? (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
                            style={{ background: '#F0FDF4', color: '#065F46' }}>
                            <ShieldCheck size={11} /> Verified
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                            style={{ background: '#FFFBEB', color: '#92400E' }}>Pending</span>
                        )}
                        {u.category_specialization && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize"
                            style={{ background: '#F1F5F9', color: '#475569' }}>{u.category_specialization}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ PAGINATION ══ */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ border: '1.5px solid #E2E8F0', color: page === 1 ? '#CBD5E1' : '#475569' }}>
            <ChevronLeft size={16} />
          </button>
          {[...Array(Math.min(totalPages, 7))].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className="w-9 h-9 rounded-xl text-[13px] font-semibold transition-all"
              style={page === i + 1 ? {
                background: 'linear-gradient(135deg,#0F172A,#1E293B)',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(15,23,42,0.25)',
              } : { border: '1.5px solid #E2E8F0', color: '#475569' }}
              onMouseEnter={e => { if (page !== i + 1) { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.color = '#6366F1'; } }}
              onMouseLeave={e => { if (page !== i + 1) { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569'; } }}
            >{i + 1}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ border: '1.5px solid #E2E8F0', color: page === totalPages ? '#CBD5E1' : '#475569' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
